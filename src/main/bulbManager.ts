import { BulbConfig, DeviceConfig, LegacyBulbConfig } from '@/types/bulbConfig'
import { systemConfig } from '@/types/systemConfig'
import { CONFIG, DISCOVER_TIMEOUT } from '@constants'
import { Bulb, discover, SCENES, WikariState } from '@lib/wikari/src/mod'
import { MAX_DEFAULT_COLORS } from '@shared/constants'
import { BulbState } from '@shared/types/bulbState'
import { BrowserWindow } from 'electron'
import log from 'electron-log'
import fs from 'fs'
import os from 'os'

const DIRECT_DISCOVER_TIMEOUT = 2500
const FOREGROUND_HEALTH_INTERVAL_MS = 15_000
const BACKGROUND_HEALTH_INTERVAL_MS = 60_000
const MAX_FAVORITE_SCENES = 8

function normalizeMac(mac: string | undefined | null): string {
  return (mac ?? '').replace(/[^a-fA-F0-9]/g, '').toLowerCase()
}

function isValidIpv4(ip: string): boolean {
  const parts = ip.split('.')
  return (
    parts.length === 4 &&
    parts.every((part) => /^\d{1,3}$/.test(part) && Number(part) >= 0 && Number(part) <= 255)
  )
}

function defaultFavorites(): number[] {
  return [SCENES['Warm White'], SCENES['Daylight'], SCENES['Night Light'], SCENES['Cozy']]
}

type ManagedBulb = {
  bulb: Bulb
  state: BulbState
}

class BulbManager {
  private bulbs = new Map<string, ManagedBulb>()
  private appData: BulbConfig
  private selectedMac: string | null = null
  private operationQueue: Promise<unknown> = Promise.resolve()
  private ready: Promise<void>
  private healthTimer: ReturnType<typeof setTimeout> | null = null
  private healthCheckRunning = false

  public bulbState: BulbState | null = null
  public window: BrowserWindow

  constructor(window: BrowserWindow) {
    this.window = window
    this.appData = this.getConfigData()
    this.selectedMac = normalizeMac(this.appData.selectedMac) || null
    this.ready = this.init()

    const reschedule = () => this.scheduleHealthCheck(1_000)
    this.window.on('show', reschedule)
    this.window.on('hide', reschedule)
    this.window.on('restore', reschedule)
    this.window.on('minimize', reschedule)
    this.window.on('focus', reschedule)
    this.window.on('blur', reschedule)
    void this.ready.finally(() => this.scheduleHealthCheck())
  }

  private healthInterval(): number {
    return this.window.isVisible() && !this.window.isMinimized()
      ? FOREGROUND_HEALTH_INTERVAL_MS
      : BACKGROUND_HEALTH_INTERVAL_MS
  }

  private scheduleHealthCheck(delay = this.healthInterval()): void {
    if (this.healthTimer) clearTimeout(this.healthTimer)
    this.healthTimer = setTimeout(() => void this.runHealthCheck(), delay)
  }

  private async runHealthCheck(): Promise<void> {
    if (this.healthCheckRunning) {
      this.scheduleHealthCheck()
      return
    }

    this.healthCheckRunning = true
    try {
      await this.ready
      await this.serialize(async () => {
        const targetMacs = [
          ...new Set(this.appData.devices.map((device) => normalizeMac(device.mac)).filter(Boolean))
        ]
        if (targetMacs.length === 0) return

        let needsDiscovery = false
        let changed = false

        for (const targetMac of targetMacs) {
          const managed = this.bulbs.get(targetMac)
          if (!managed) {
            needsDiscovery = true
            continue
          }

          try {
            const before = JSON.stringify({
              state: managed.state.state,
              dimming: managed.state.dimming,
              sceneId: managed.state.sceneId,
              rssi: managed.state.rssi
            })
            const pilot = (await managed.bulb.getPilot()).result
            const reportedMac = normalizeMac(pilot.mac)
            if (reportedMac && reportedMac !== targetMac) {
              needsDiscovery = true
              continue
            }
            Object.assign(managed.state, pilot, {
              mac: targetMac,
              ip: managed.bulb.address
            })
            const after = JSON.stringify({
              state: managed.state.state,
              dimming: managed.state.dimming,
              sceneId: managed.state.sceneId,
              rssi: managed.state.rssi
            })
            if (before !== after) changed = true
          } catch (error) {
            this.recoverWikariAfterError()
            needsDiscovery = true
            log.debug(`Health check failed for ${targetMac}; scheduling MAC rediscovery`, error)
          }
        }

        // One broadcast pass repairs every missing/moved saved device at once. This avoids
        // doing a full LAN scan separately for each lamp after a DHCP address change.
        if (needsDiscovery) {
          await this.discoverNetworkDevices()
          changed = true
        }

        if (changed) {
          this.saveConfig()
          this.notifyRenderer()
        }
      })
    } catch (error) {
      log.warn('WiZ health check failed', error)
    } finally {
      this.healthCheckRunning = false
      this.scheduleHealthCheck()
    }
  }

  private async init(): Promise<void> {
    try {
      await this.restoreConfiguredDevices()
      if (this.appData.devices.length === 0 && !this.appData.initialScanDone) {
        // On the very first launch show an actual discovery result instead of an endless spinner.
        // Later startups only repair IPs of devices explicitly saved by the user.
        this.appData.initialScanDone = true
        await this.scanAndAddDevicesInternal('First-run')
      } else {
        await this.discoverNetworkDevices()
      }
      this.ensureSelection()
      this.saveConfig()
      this.notifyRenderer()
    } catch (error) {
      log.error('Failed to initialize WiZ devices:', error)
      this.notifyRenderer()
    }
  }

  private emptyConfig(): BulbConfig {
    return {
      version: 2,
      selectedMac: '',
      ignoredMacs: [],
      initialScanDone: false,
      devices: []
    }
  }

  private getConfigData(): BulbConfig {
    try {
      const parsed = JSON.parse(fs.readFileSync(CONFIG, 'utf-8')) as Partial<BulbConfig> &
        Partial<LegacyBulbConfig>

      if (Array.isArray(parsed.devices)) {
        const config: BulbConfig = {
          version: 2,
          selectedMac: normalizeMac(parsed.selectedMac),
          ignoredMacs: Array.isArray(parsed.ignoredMacs)
            ? parsed.ignoredMacs.map((mac) => normalizeMac(mac)).filter(Boolean)
            : [],
          initialScanDone: parsed.initialScanDone ??
            (parsed.devices.length > 0 || (parsed.ignoredMacs?.length ?? 0) > 0),
          devices: parsed.devices.map((device) => ({
            mac: normalizeMac(device.mac),
            bulbIp: device.bulbIp ?? '',
            bulbName: device.bulbName ?? '',
            customColors: Array.isArray(device.customColors) ? device.customColors : [],
            favoriteColors:
              Array.isArray(device.favoriteColors) && device.favoriteColors.length > 0
                ? device.favoriteColors
                : defaultFavorites()
          }))
        }
        log.info(`Loaded ${config.devices.length} saved WiZ device(s)`)
        return config
      }

      if (typeof parsed.bulbIp === 'string' && parsed.bulbIp.length > 0) {
        log.info('Migrating legacy single-device config to multi-device config')
        return {
          version: 2,
          selectedMac: '',
          ignoredMacs: [],
          initialScanDone: true,
          devices: [
            {
              mac: '',
              bulbIp: parsed.bulbIp,
              bulbName: parsed.bulbName ?? '',
              customColors: Array.isArray(parsed.customColors) ? parsed.customColors : [],
              favoriteColors:
                Array.isArray(parsed.favoriteColors) && parsed.favoriteColors.length > 0
                  ? parsed.favoriteColors
                  : defaultFavorites()
            }
          ]
        }
      }
    } catch {
      log.warn('Config data not found or invalid, creating a new config')
    }

    return this.emptyConfig()
  }

  private saveConfig(): void {
    this.appData.selectedMac = this.selectedMac ?? ''
    fs.writeFileSync(CONFIG, JSON.stringify(this.appData, null, 2))
  }

  private deleteConfig(): void {
    if (fs.existsSync(CONFIG)) fs.unlinkSync(CONFIG)
  }

  private recoverWikariAfterError(): void {
    if (Bulb.state === WikariState.AWAITING_RESPONSE) {
      Bulb.setInstanceState(WikariState.READY)
      log.warn('Recovered Wikari UDP state after a failed request')
    }
  }

  private serialize<T>(operation: () => Promise<T>): Promise<T> {
    const next = this.operationQueue.then(operation, operation)
    this.operationQueue = next.then(
      () => undefined,
      () => undefined
    )
    return next
  }

  private getBroadcastTargets(): string[] {
    const targets = new Set<string>(['255.255.255.255', '192.168.1.255'])

    const ipv4ToInt = (ip: string): number =>
      ip.split('.').reduce((value, octet) => ((value << 8) | Number(octet)) >>> 0, 0)

    const intToIpv4 = (value: number): string =>
      [24, 16, 8, 0].map((shift) => (value >>> shift) & 255).join('.')

    for (const infos of Object.values(os.networkInterfaces())) {
      if (!infos) continue
      for (const info of infos) {
        const isIpv4 = String(info.family) === 'IPv4' || String(info.family) === '4'
        if (!isIpv4 || info.internal || !isValidIpv4(info.address) || !isValidIpv4(info.netmask)) {
          continue
        }
        const address = ipv4ToInt(info.address)
        const netmask = ipv4ToInt(info.netmask)
        targets.add(intToIpv4((address | (~netmask >>> 0)) >>> 0))
      }
    }

    for (const device of this.appData.devices) {
      if (!isValidIpv4(device.bulbIp)) continue
      const octets = device.bulbIp.split('.')
      targets.add(`${octets[0]}.${octets[1]}.${octets[2]}.255`)
    }

    return [...targets]
  }

  private findSavedDevice(mac: string, ip?: string): DeviceConfig | undefined {
    const normalized = normalizeMac(mac)
    return this.appData.devices.find((device) => {
      const savedMac = normalizeMac(device.mac)
      if (savedMac && savedMac === normalized) return true
      return !savedMac && !!ip && device.bulbIp === ip
    })
  }

  private async hydrateBulb(bulb: Bulb, preferred?: DeviceConfig): Promise<ManagedBulb> {
    let pilot: Awaited<ReturnType<Bulb['getPilot']>>['result']
    try {
      pilot = (await bulb.getPilot()).result
    } catch (error) {
      this.recoverWikariAfterError()
      throw error
    }
    const mac = normalizeMac(pilot.mac)
    if (!mac) throw new Error(`Device at ${bulb.address} did not return a MAC address`)

    const saved = preferred ?? this.findSavedDevice(mac, bulb.address)
    let configResult: Partial<systemConfig['result']> = {}

    try {
      const response = (await bulb.sendRaw({
        method: 'getSystemConfig',
        env: 'pro',
        params: {}
      })) as systemConfig
      configResult = response.result ?? {}
    } catch (error) {
      this.recoverWikariAfterError()
      log.warn(`getSystemConfig failed for ${bulb.address}, continuing with getPilot data`, error)
    }

    const state: BulbState = {
      ...pilot,
      mac,
      homeId: configResult.homeId ?? 0,
      roomId: configResult.roomId ?? 0,
      rgn: configResult.rgn ?? '',
      moduleName: configResult.moduleName ?? 'WiZ device',
      fwVersion: configResult.fwVersion ?? '',
      groupId: configResult.groupId ?? 0,
      ping: configResult.ping ?? 0,
      ip: bulb.address,
      port: bulb.bulbPort,
      name:
        saved?.bulbName || configResult.moduleName || `WiZ ${mac.slice(Math.max(0, mac.length - 6))}`,
      customColors: saved?.customColors ?? [],
      favoriteColors:
        saved?.favoriteColors && saved.favoriteColors.length > 0
          ? saved.favoriteColors
          : defaultFavorites()
    }

    return { bulb, state }
  }

  private upsertManagedDevice(managed: ManagedBulb): void {
    this.appData.initialScanDone = true
    const mac = normalizeMac(managed.state.mac)
    managed.state.mac = mac
    this.bulbs.set(mac, managed)

    const existing = this.findSavedDevice(mac, managed.state.ip)
    const record: DeviceConfig = {
      mac,
      bulbIp: managed.state.ip,
      bulbName: managed.state.name,
      customColors: managed.state.customColors,
      favoriteColors: managed.state.favoriteColors
    }

    if (existing) {
      Object.assign(existing, record)
    } else {
      this.appData.devices.push(record)
    }

    this.appData.ignoredMacs = this.appData.ignoredMacs.filter(
      (ignoredMac) => normalizeMac(ignoredMac) !== mac
    )
  }

  private async discoverAtIp(ip: string): Promise<Bulb | null> {
    try {
      const result = await discover({ addr: ip, waitMs: DIRECT_DISCOVER_TIMEOUT })
      return result[0] ?? null
    } catch (error) {
      log.warn(`Direct discovery failed for ${ip}`, error)
      return null
    }
  }

  private async restoreConfiguredDevices(): Promise<void> {
    const configured = this.appData.devices.filter((device) => isValidIpv4(device.bulbIp))
    if (configured.length === 0) return

    const attempts = await Promise.all(
      configured.map(async (device) => ({
        device,
        bulb: await this.discoverAtIp(device.bulbIp)
      }))
    )

    for (const attempt of attempts) {
      if (!attempt.bulb) continue
      try {
        const managed = await this.hydrateBulb(attempt.bulb, attempt.device)
        const expectedMac = normalizeMac(attempt.device.mac)
        if (expectedMac && expectedMac !== managed.state.mac) {
          log.warn(
            `IP ${attempt.device.bulbIp} now belongs to another MAC. Keeping the saved MAC for rediscovery.`
          )
          continue
        }
        this.upsertManagedDevice(managed)
      } catch (error) {
        log.warn(`Could not restore ${attempt.device.bulbIp}`, error)
      }
    }
  }

  private async discoverNetworkDevices(): Promise<void> {
    // Discovery is intentionally restricted to devices already saved by the user.
    // Unknown WiZ devices on the LAN are never persisted automatically.
    const savedMacs = new Set(
      this.appData.devices.map((device) => normalizeMac(device.mac)).filter(Boolean)
    )
    if (savedMacs.size === 0) return

    const targets = this.getBroadcastTargets()
    const results = await Promise.allSettled(
      targets.map((addr) => discover({ addr, waitMs: DISCOVER_TIMEOUT }))
    )

    const candidates = new Map<string, Bulb>()
    for (const result of results) {
      if (result.status !== 'fulfilled') continue
      for (const bulb of result.value) candidates.set(bulb.address, bulb)
    }

    const knownIps = new Set([...this.bulbs.values()].map((entry) => entry.state.ip))
    for (const bulb of candidates.values()) {
      if (knownIps.has(bulb.address)) continue
      try {
        const managed = await this.hydrateBulb(bulb)
        if (!savedMacs.has(managed.state.mac)) {
          log.info(
            `Ignoring unsaved WiZ device ${managed.state.mac} at ${managed.state.ip}. Add it manually by IP to manage it.`
          )
          continue
        }
        if (this.appData.ignoredMacs.includes(managed.state.mac)) continue
        this.upsertManagedDevice(managed)
      } catch (error) {
        log.warn(`Could not hydrate discovered WiZ device at ${bulb.address}`, error)
      }
    }
  }

  private ensureSelection(): void {
    if (this.selectedMac && this.bulbs.has(this.selectedMac)) return
    this.selectedMac = this.bulbs.keys().next().value ?? null
  }

  private getBulbList(): BulbState[] {
    const order = new Map<string, number>(
      this.appData.devices.map((device, index) => [normalizeMac(device.mac), index] as const)
    )
    return [...this.bulbs.values()]
      .map((entry) => entry.state)
      .sort((a, b) => (order.get(a.mac) ?? 9999) - (order.get(b.mac) ?? 9999))
  }

  private notifyRenderer(): void {
    this.ensureSelection()
    this.bulbState = this.selectedMac ? this.bulbs.get(this.selectedMac)?.state ?? null : null
    this.window.webContents.send('on-update-bulbs', this.getBulbList())
    this.window.webContents.send('on-update-bulb', this.bulbState)
  }

  private resolveMac(mac?: string): string {
    const normalized = normalizeMac(mac)
    const resolved = normalized || this.selectedMac
    if (!resolved) throw new Error('No WiZ device is selected')
    return resolved
  }

  private async rediscoverMac(mac: string): Promise<ManagedBulb | null> {
    const targetMac = normalizeMac(mac)
    const saved = this.findSavedDevice(targetMac)

    if (saved && isValidIpv4(saved.bulbIp)) {
      const direct = await this.discoverAtIp(saved.bulbIp)
      if (direct) {
        try {
          const managed = await this.hydrateBulb(direct, saved)
          if (managed.state.mac === targetMac) {
            this.upsertManagedDevice(managed)
            this.saveConfig()
            this.notifyRenderer()
            return managed
          }
        } catch (error) {
          log.warn(`Direct re-check failed for ${saved.bulbIp}`, error)
        }
      }
    }

    const results = await Promise.allSettled(
      this.getBroadcastTargets().map((addr) => discover({ addr, waitMs: DISCOVER_TIMEOUT }))
    )

    const candidates = new Map<string, Bulb>()
    for (const result of results) {
      if (result.status !== 'fulfilled') continue
      for (const bulb of result.value) candidates.set(bulb.address, bulb)
    }

    for (const bulb of candidates.values()) {
      try {
        const managed = await this.hydrateBulb(bulb)
        if (managed.state.mac !== targetMac) continue
        this.upsertManagedDevice(managed)
        this.saveConfig()
        this.notifyRenderer()
        log.info(`WiZ device ${targetMac} moved to ${managed.state.ip}`)
        return managed
      } catch (error) {
        log.warn(`Rediscovery probe failed for ${bulb.address}`, error)
      }
    }

    return null
  }

  private async performNetworkAction<T>(
    targetMac: string,
    action: (managed: ManagedBulb) => Promise<T>
  ): Promise<T> {
    let managed = this.bulbs.get(targetMac)
    if (!managed) managed = (await this.rediscoverMac(targetMac)) ?? undefined
    if (!managed) throw new Error(`WiZ device ${targetMac} is not reachable`)

    try {
      return await action(managed)
    } catch (firstError) {
      this.recoverWikariAfterError()
      log.warn(`Command failed for ${targetMac}. Trying MAC based rediscovery.`, firstError)
      const refreshed = await this.rediscoverMac(targetMac)
      if (!refreshed) throw firstError
      return action(refreshed)
    }
  }

  private async runNetworkAction<T>(
    mac: string | undefined,
    action: (managed: ManagedBulb) => Promise<T>
  ): Promise<T> {
    await this.ready
    return this.serialize(async () => this.performNetworkAction(this.resolveMac(mac), action))
  }

  private async runNetworkActionAll(
    action: (managed: ManagedBulb) => Promise<void>
  ): Promise<void> {
    await this.ready
    return this.serialize(async () => {
      const targetMacs: string[] = [
        ...new Set<string>(
          this.appData.devices.map((device) => normalizeMac(device.mac)).filter(Boolean)
        )
      ]

      if (targetMacs.length === 0) throw new Error('No saved WiZ devices')

      const failures: unknown[] = []
      for (const targetMac of targetMacs) {
        try {
          await this.performNetworkAction(targetMac, action)
        } catch (error) {
          failures.push(error)
          log.warn(`Bulk command failed for WiZ device ${targetMac}`, error)
        }
      }

      if (failures.length === targetMacs.length) throw failures[0]
    })
  }

  public async getBulbState(): Promise<BulbState | null> {
    await this.ready
    return this.bulbState
  }

  public async getBulbsState(): Promise<BulbState[]> {
    await this.ready
    return this.getBulbList()
  }

  public async setDeviceOrder(orderedMacs: string[]): Promise<void> {
    await this.ready

    const normalizedOrder = orderedMacs.map((mac) => normalizeMac(mac)).filter(Boolean)
    const byMac = new Map(
      this.appData.devices.map((device) => [normalizeMac(device.mac), device] as const)
    )
    const ordered: DeviceConfig[] = []
    const seen = new Set<string>()

    for (const mac of normalizedOrder) {
      const device = byMac.get(mac)
      if (!device || seen.has(mac)) continue
      ordered.push(device)
      seen.add(mac)
    }

    for (const device of this.appData.devices) {
      const mac = normalizeMac(device.mac)
      if (seen.has(mac)) continue
      ordered.push(device)
      if (mac) seen.add(mac)
    }

    this.appData.devices = ordered
    this.saveConfig()
    this.notifyRenderer()
  }

  public async addDevice(ip: string): Promise<BulbState> {
    await this.ready
    if (!isValidIpv4(ip)) throw new Error('Invalid IPv4 address')

    return this.serialize(async () => {
      const bulb = await this.discoverAtIp(ip)
      if (!bulb) throw new Error(`No WiZ device answered at ${ip}:38899`)

      const managed = await this.hydrateBulb(bulb)
      this.upsertManagedDevice(managed)
      this.selectedMac = managed.state.mac
      this.saveConfig()
      this.notifyRenderer()
      log.info(`Added WiZ device ${managed.state.mac} at ${ip}`)
      return managed.state
    })
  }

  // Internal scan is also used during init(). It must not await this.ready or deadlock.
  private async scanAndAddDevicesInternal(reason: string): Promise<{ found: number; added: number; devices: BulbState[] }> {
      const targets = this.getBroadcastTargets()
      log.info(`${reason} WiZ scan requested. Broadcast targets: ${targets.join(', ')}`)

      const results = await Promise.allSettled(
        targets.map((addr) => discover({ addr, waitMs: DISCOVER_TIMEOUT }))
      )

      const candidates = new Map<string, Bulb>()
      for (const result of results) {
        if (result.status !== 'fulfilled') continue
        for (const bulb of result.value) candidates.set(bulb.address, bulb)
      }

      let added = 0
      const seenMacs = new Set<string>()

      for (const bulb of candidates.values()) {
        try {
          const managed = await this.hydrateBulb(bulb)
          if (seenMacs.has(managed.state.mac)) continue
          seenMacs.add(managed.state.mac)

          const existed = !!this.findSavedDevice(managed.state.mac, managed.state.ip)
          this.upsertManagedDevice(managed)
          if (!existed) added += 1
        } catch (error) {
          this.recoverWikariAfterError()
          log.warn(`Manual scan could not hydrate WiZ device at ${bulb.address}`, error)
        }
      }

      this.appData.initialScanDone = true
      this.ensureSelection()
      this.saveConfig()
      this.notifyRenderer()

      const devices = this.getBulbList()
      log.info(`${reason} WiZ scan finished. Found ${seenMacs.size}, added ${added}.`)
      return { found: seenMacs.size, added, devices }
  }

  public async scanAndAddDevices(): Promise<{ found: number; added: number; devices: BulbState[] }> {
    await this.ready
    return this.serialize(() => this.scanAndAddDevicesInternal('Manual'))
  }

  public async setIp(ip: string): Promise<BulbState> {
    return this.addDevice(ip)
  }

  public selectBulb(mac: string): void {
    const normalized = normalizeMac(mac)
    if (!this.bulbs.has(normalized)) return
    this.selectedMac = normalized
    this.saveConfig()
    this.notifyRenderer()
  }

  public async reconnectBulb(mac?: string): Promise<void> {
    await this.ready
    await this.serialize(async () => {
      const targetMac = this.resolveMac(mac)
      await this.rediscoverMac(targetMac)
    })
  }

  public async toggleBulb(mac?: string): Promise<void> {
    await this.runNetworkAction(mac, async (managed) => {
      const desiredState = !managed.state.state
      await managed.bulb.turn(desiredState)
      managed.state.state = desiredState
      this.notifyRenderer()
    })
  }

  public async toggleAllBulbs(): Promise<void> {
    await this.ready
    const desiredState = !this.getBulbList().some((state) => state.state)
    await this.runNetworkActionAll(async (managed) => {
      await managed.bulb.turn(desiredState)
      managed.state.state = desiredState
    })
    this.notifyRenderer()
  }

  public async setBrightness(brightness: number, mac?: string): Promise<void> {
    await this.runNetworkAction(mac, async (managed) => {
      await managed.bulb.brightness(brightness)
      managed.state.dimming = brightness
      this.notifyRenderer()
    })
  }

  public async setAllBrightness(brightness: number): Promise<void> {
    await this.runNetworkActionAll(async (managed) => {
      await managed.bulb.brightness(brightness)
      managed.state.dimming = brightness
    })
    this.notifyRenderer()
  }

  public async setBulbName(name: string, mac?: string): Promise<void> {
    await this.ready
    const targetMac = this.resolveMac(mac)
    const managed = this.bulbs.get(targetMac)
    if (!managed) return

    managed.state.name = name
    const saved = this.findSavedDevice(targetMac)
    if (saved) saved.bulbName = name
    this.saveConfig()
    this.notifyRenderer()
  }

  public async setScene(sceneId: number, mac?: string): Promise<void> {
    await this.runNetworkAction(mac, async (managed) => {
      await managed.bulb.scene(sceneId)
      managed.state.state = true
      managed.state.sceneId = sceneId
      this.notifyRenderer()
    })
  }

  public async setAllScene(sceneId: number): Promise<void> {
    await this.runNetworkActionAll(async (managed) => {
      await managed.bulb.scene(sceneId)
      managed.state.state = true
      managed.state.sceneId = sceneId
    })
    this.notifyRenderer()
  }

  public async setAllColor(colorHex: string): Promise<void> {
    await this.runNetworkActionAll(async (managed) => {
      await managed.bulb.color(colorHex as `#${string}`)
      managed.state.state = true
    })
    this.notifyRenderer()
  }

  private getCustomColorNewId(state: BulbState): number {
    if (state.customColors.length === 0) return MAX_DEFAULT_COLORS
    return Math.max(...state.customColors.map((color) => color.id)) + 1
  }

  public async toggleFavoriteColor(colorId: number, mac?: string): Promise<void> {
    await this.ready
    const targetMac = this.resolveMac(mac)
    const managed = this.bulbs.get(targetMac)
    if (!managed) return

    if (managed.state.favoriteColors.includes(colorId)) {
      managed.state.favoriteColors = managed.state.favoriteColors.filter((id) => id !== colorId)
    } else {
      // Keep the Favorites area compact. New favorites replace the oldest one after 8.
      managed.state.favoriteColors = [
        ...managed.state.favoriteColors.slice(-(MAX_FAVORITE_SCENES - 1)),
        colorId
      ]
    }

    const saved = this.findSavedDevice(targetMac)
    if (saved) saved.favoriteColors = managed.state.favoriteColors
    this.saveConfig()
    this.notifyRenderer()
  }

  public async addCustomColor(colorName: string, colorHex: string, mac?: string): Promise<void> {
    await this.ready
    const targetMac = this.resolveMac(mac)
    const managed = this.bulbs.get(targetMac)
    if (!managed) return

    const newId = this.getCustomColorNewId(managed.state)
    managed.state.customColors.push({ id: newId, name: colorName, hex: colorHex })
    const saved = this.findSavedDevice(targetMac)
    if (saved) saved.customColors = managed.state.customColors
    this.saveConfig()
    this.notifyRenderer()
  }

  public async setCustomColor(colorId: number, mac?: string): Promise<void> {
    await this.runNetworkAction(mac, async (managed) => {
      const color = managed.state.customColors.find((item) => item.id === colorId)
      if (!color) return
      await managed.bulb.color(color.hex as `#${string}`)
      managed.state.state = true
      managed.state.sceneId = colorId
      this.notifyRenderer()
    })
  }

  public async editCustomColor(
    colorId: number,
    colorName: string,
    colorHex: string,
    mac?: string
  ): Promise<void> {
    await this.ready
    const targetMac = this.resolveMac(mac)
    const managed = this.bulbs.get(targetMac)
    if (!managed) return

    const color = managed.state.customColors.find((item) => item.id === colorId)
    if (!color) return
    color.name = colorName
    color.hex = colorHex
    const saved = this.findSavedDevice(targetMac)
    if (saved) saved.customColors = managed.state.customColors
    this.saveConfig()
    this.notifyRenderer()
  }

  public async removeCustomColor(colorId: number, mac?: string): Promise<void> {
    await this.ready
    const targetMac = this.resolveMac(mac)
    const managed = this.bulbs.get(targetMac)
    if (!managed) return

    managed.state.customColors = managed.state.customColors.filter((color) => color.id !== colorId)
    managed.state.favoriteColors = managed.state.favoriteColors.filter((id) => id !== colorId)

    const saved = this.findSavedDevice(targetMac)
    if (saved) {
      saved.customColors = managed.state.customColors
      saved.favoriteColors = managed.state.favoriteColors
    }
    this.saveConfig()
    this.notifyRenderer()
  }

  public async setFavoriteColorsOrder(favoriteColors: number[], mac?: string): Promise<void> {
    await this.ready
    const targetMac = this.resolveMac(mac)
    const managed = this.bulbs.get(targetMac)
    if (!managed) return

    managed.state.favoriteColors = favoriteColors.slice(0, MAX_FAVORITE_SCENES)
    const saved = this.findSavedDevice(targetMac)
    if (saved) saved.favoriteColors = managed.state.favoriteColors
    this.saveConfig()
    this.notifyRenderer()
  }

  public async deleteBulb(mac?: string): Promise<void> {
    await this.ready
    const targetMac = this.resolveMac(mac)
    this.bulbs.delete(targetMac)
    this.appData.devices = this.appData.devices.filter(
      (device) => normalizeMac(device.mac) !== targetMac
    )
    if (!this.appData.ignoredMacs.includes(targetMac)) this.appData.ignoredMacs.push(targetMac)
    if (this.selectedMac === targetMac) this.selectedMac = null
    this.ensureSelection()
    this.saveConfig()
    this.notifyRenderer()
    log.info(`WiZ device ${targetMac} deleted`)
  }

  public async deleteProfile(): Promise<void> {
    await this.ready
    this.bulbs.clear()
    this.appData = this.emptyConfig()
    this.selectedMac = null
    this.bulbState = null
    this.deleteConfig()
    this.notifyRenderer()
    log.info('WiZ profile deleted')
  }

  public endConnection(): void {
    if (this.healthTimer) {
      clearTimeout(this.healthTimer)
      this.healthTimer = null
    }
    const first = this.bulbs.values().next().value as ManagedBulb | undefined
    if (first) {
      try {
        first.bulb.closeConnection()
        log.info('WiZ UDP connection closed')
      } catch (error) {
        log.warn('Failed to close WiZ UDP connection', error)
      }
    }
  }
}

export default BulbManager
