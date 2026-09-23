import { MAX_DEFAULT_COLORS } from '@shared/constants'
import { BulbState } from '@shared/types/bulbState'
import log from 'electron-log/renderer'
import { create } from 'zustand'

interface BulbStore {
  bulb: BulbState | null
  initializing: boolean
  bulbs: BulbState[]
  selectedMac: string | null
  controlAll: boolean
  updateBulbState: (bulb: BulbState | null) => void
  updateBulbsState: (bulbs: BulbState[]) => void
  selectBulb: (mac: string) => void
  selectAll: () => void
  addDevice: (ip: string) => Promise<BulbState>
  scanDevices: () => Promise<{ found: number; added: number; devices: BulbState[] }>
  reorderDevices: (orderedMacs: string[]) => Promise<void>
  toggleBulb: (mac?: string) => Promise<void>
  toggleAllBulbs: () => Promise<void>
  setBrightness: (brightness: number) => Promise<void>
  setBulbName: (name: string) => Promise<void>
  setIp: (ip: string) => Promise<void>
  setScene: (sceneId: number) => Promise<void>
  addCustomColor: (colorName: string, colorHex: string) => Promise<void>
  setCustomColor: (colorId: number) => Promise<void>
  editCustomColor: (colorId: number, colorName: string, colorHex: string) => Promise<void>
  removeCustomColor: (colorId: number) => Promise<void>
  toggleFavoriteColor: (colorId: number) => Promise<void>
  setFavoriteColorsOrder: (favoriteColors: number[]) => Promise<void>
  deleteBulb: (mac?: string) => Promise<void>
  deleteProfile: () => Promise<void>
}

const selectedMac = () => useBulbStore.getState().selectedMac ?? undefined

export const useBulbStore = create<BulbStore>((set, get) => ({
  bulb: null,
  initializing: true,
  bulbs: [],
  selectedMac: null,
  controlAll: false,

  updateBulbState: (bulb) =>
    set((state) => ({
      bulb,
      selectedMac: bulb?.mac ?? state.selectedMac
    })),

  updateBulbsState: (bulbs) =>
    set((state) => {
      const currentMac = state.selectedMac
      const selected =
        (currentMac ? bulbs.find((item) => item.mac === currentMac) : undefined) ?? bulbs[0] ?? null
      return {
        bulbs,
        bulb: selected,
        selectedMac: selected?.mac ?? null,
        controlAll: bulbs.length === 0 ? false : state.controlAll
      }
    }),

  selectBulb: (mac) => {
    const bulb = get().bulbs.find((item) => item.mac === mac)
    if (!bulb) return
    set({ selectedMac: mac, bulb, controlAll: false })
    window.api.selectBulb(mac)
  },

  selectAll: () => {
    if (get().bulbs.length === 0) return
    set({ controlAll: true })
  },

  addDevice: async (ip) => {
    log.debug(`[RENDERER] Adding WiZ device at ${ip}`)
    const bulb = await window.api.addDevice(ip)
    set({ selectedMac: bulb.mac, bulb, controlAll: false })
    return bulb
  },

  scanDevices: async () => {
    log.debug('[RENDERER] Running manual WiZ discovery')
    const hadDevices = get().bulbs.length > 0
    const result = await window.api.scanDevices()
    get().updateBulbsState(result.devices)
    if (!hadDevices && result.devices.length > 0) set({ controlAll: true })
    return result
  },

  reorderDevices: async (orderedMacs) => {
    const byMac = new Map(get().bulbs.map((device) => [device.mac, device] as const))
    const reordered = orderedMacs.map((mac) => byMac.get(mac)).filter((device): device is BulbState => !!device)
    const seen = new Set(reordered.map((device) => device.mac))
    const leftovers = get().bulbs.filter((device) => !seen.has(device.mac))
    set({ bulbs: [...reordered, ...leftovers] })
    await window.api.setDeviceOrder(orderedMacs)
  },

  toggleBulb: async (mac) => {
    if (!mac && get().controlAll) return get().toggleAllBulbs()
    log.debug('[RENDERER] Toggling bulb state')
    await window.api.toggleBulb(mac ?? selectedMac())
  },

  toggleAllBulbs: async () => {
    log.debug('[RENDERER] Toggling all bulb states')
    await window.api.toggleAllBulbs()
  },

  setBrightness: async (brightness) => {
    if (get().controlAll) {
      log.debug('[RENDERER] Setting brightness for all bulbs')
      await window.api.setAllBrightness(brightness)
      return
    }
    log.debug('[RENDERER] Setting brightness')
    await window.api.setBrightness(brightness, selectedMac())
  },

  setBulbName: async (name) => {
    log.debug('[RENDERER] Setting bulb name')
    await window.api.setBulbName(name, selectedMac())
  },

  setIp: async (ip) => {
    log.debug('[RENDERER] Setting bulb IP')
    const bulb = await window.api.setIp(ip)
    set({ selectedMac: bulb.mac, bulb, controlAll: false })
  },

  setScene: async (sceneId) => {
    if (sceneId >= MAX_DEFAULT_COLORS) {
      log.debug('[RENDERER] Trying to set a custom color')
      return useBulbStore.getState().setCustomColor(sceneId)
    }

    if (get().controlAll) {
      log.debug('[RENDERER] Setting scene for all bulbs')
      await window.api.setAllScene(sceneId)
      return
    }

    log.debug('[RENDERER] Setting scene')
    await window.api.setScene(sceneId, selectedMac())
  },

  addCustomColor: async (colorName, colorHex) => {
    const bulb = get().bulb
    if (!bulb) return
    const colorExists = bulb.customColors.some((color) => color.name === colorName)
    if (colorExists) {
      log.debug('[RENDERER] Custom color already exists')
      return
    }
    log.debug('[RENDERER] Adding custom color')
    await window.api.addCustomColor(colorName, colorHex, selectedMac())
  },

  setCustomColor: async (colorId) => {
    if (colorId < MAX_DEFAULT_COLORS) {
      log.debug('[RENDERER] Trying to set a default color')
      return useBulbStore.getState().setScene(colorId)
    }

    if (get().controlAll) {
      const color = get().bulb?.customColors.find((item) => item.id === colorId)
      if (!color) return
      log.debug('[RENDERER] Setting custom color for all bulbs')
      await window.api.setAllColor(color.hex)
      return
    }

    log.debug('[RENDERER] Setting custom color')
    await window.api.setCustomColor(colorId, selectedMac())
  },

  editCustomColor: async (colorId, colorName, colorHex) => {
    log.debug('[RENDERER] Editing custom color')
    await window.api.editCustomColor(colorId, colorName, colorHex, selectedMac())
  },

  removeCustomColor: async (colorId) => {
    log.debug('[RENDERER] Removing custom color')
    await window.api.removeCustomColor(colorId, selectedMac())
  },

  toggleFavoriteColor: async (colorId) => {
    log.debug('[RENDERER] Toggling favorite color')
    await window.api.toggleFavoriteColor(colorId, selectedMac())
  },

  setFavoriteColorsOrder: async (favoriteColors) => {
    log.debug('[RENDERER] Setting favorite colors order')
    await window.api.setFavoriteColorsOrder(favoriteColors, selectedMac())
  },

  deleteBulb: async (mac) => {
    log.debug('[RENDERER] Deleting bulb')
    await window.api.deleteBulb(mac ?? selectedMac())
  },

  deleteProfile: async () => {
    log.debug('[RENDERER] Deleting profile')
    set({ controlAll: false })
    await window.api.deleteProfile()
  }
}))

window.api.onUpdateBulb((bulb) => {
  useBulbStore.getState().updateBulbState(bulb)
})

window.api.onUpdateBulbs((bulbs) => {
  useBulbStore.getState().updateBulbsState(bulbs)
})

window.api.getBulbsWhenReady().then(
  (bulbs) => {
    useBulbStore.getState().updateBulbsState(bulbs)
    useBulbStore.setState({ initializing: false, controlAll: bulbs.length > 0 })
  },
  (error) => {
    log.error('[RENDERER] Initial WiZ discovery failed', error)
    useBulbStore.setState({ initializing: false })
  }
)
