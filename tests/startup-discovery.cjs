// Mock regression test for first-run discovery. Runs with the project TypeScript dev dependency.
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')

const source = fs.readFileSync(path.join(__dirname, '../src/main/bulbManager.ts'), 'utf8')
const code = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true }
}).outputText

const MAC = 'aabbccddeeff'
const savedFiles = new Map()
let scanCalls = 0
let discovered = true
class MockBulb {
  constructor(address, options = {}) { this.address = address; this.bulbPort = options.port || 38899 }
  async getPilot() { return { result: { mac: MAC, state: true, dimming: 50, rssi: -40, sceneId: 1 } } }
  async sendRaw() { return { result: { moduleName: 'Test bulb', homeId: 1 } } }
  closeConnection() {}
  static state = 1
  static setInstanceState(state) { MockBulb.state = state }
}
const mocks = {
  '@/types/bulbConfig': {},
  '@/types/systemConfig': {},
  '@constants': { CONFIG: 'mock-config.json', DISCOVER_TIMEOUT: 1 },
  '@lib/wikari/src/mod': {
    Bulb: MockBulb,
    discover: async ({ addr }) => {
      scanCalls++
      return discovered && addr === '192.168.1.255' ? [new MockBulb('192.168.1.21')] : []
    },
    SCENES: { 'Warm White': 1, Daylight: 2, 'Night Light': 3, Cozy: 4 },
    WikariState: { READY: 1, AWAITING_RESPONSE: 2 }
  },
  '@shared/constants': { MAX_DEFAULT_COLORS: 100 },
  '@shared/types/bulbState': {},
  electron: {},
  'electron-log': { info() {}, warn() {}, error() {}, debug() {} },
  fs: {
    readFileSync(key) { if (!savedFiles.has(key)) throw Error('No file'); return savedFiles.get(key) },
    writeFileSync(key, value) { savedFiles.set(key, value) },
    existsSync(key) { return savedFiles.has(key) },
    unlinkSync(key) { savedFiles.delete(key) }
  },
  os: { networkInterfaces: () => ({ wifi: [{ family: 'IPv4', internal: false, address: '192.168.1.10', netmask: '255.255.255.0' }] }) }
}
const mod = { exports: {} }
const load = new Function('require', 'module', 'exports', code)
load((id) => { if (id in mocks) return mocks[id]; throw Error(`Unmocked module ${id}`) }, mod, mod.exports)
const BulbManager = mod.exports.default
const win = { webContents: { send() {} }, on() {}, isVisible: () => true, isMinimized: () => false }

async function run() {
  const first = new BulbManager(win)
  const devices = await first.getBulbsState()
  assert.equal(devices.length, 1, 'first run should auto-discover a device')
  assert.equal(devices[0].mac, MAC)
  assert.equal(JSON.parse(savedFiles.get('mock-config.json')).initialScanDone, true)
  assert(scanCalls > 0)
  first.endConnection()

  // When the previously discovered device is offline on relaunch, keep its
  // saved identity and do not run the "first-run" add-all scan again.
  discovered = false
  const second = new BulbManager(win)
  await second.getBulbsState()
  assert.equal(JSON.parse(savedFiles.get('mock-config.json')).devices.length, 1)
  await second.deleteBulb(MAC)
  second.endConnection()

  // Deleting the last device must NOT automatically re-add it on next launch.
  discovered = true
  const beforeRelaunch = scanCalls
  const afterDeletion = new BulbManager(win)
  assert.deepEqual(await afterDeletion.getBulbsState(), [])
  assert.equal(scanCalls, beforeRelaunch, 'deleted bulbs must not return by an automatic scan')
  afterDeletion.endConnection()

  // A first-run search that finds nothing should not restart indefinitely.
  savedFiles.clear()
  scanCalls = 0
  discovered = false
  const empty = new BulbManager(win)
  assert.deepEqual(await empty.getBulbsState(), [])
  assert.equal(JSON.parse(savedFiles.get('mock-config.json')).initialScanDone, true)
  const callsAfterEmpty = scanCalls
  empty.endConnection()
  const restarted = new BulbManager(win)
  assert.deepEqual(await restarted.getBulbsState(), [])
  assert.equal(scanCalls, callsAfterEmpty, 'subsequent empty launches must not scan without user action')
  restarted.endConnection()
  console.log('PASS startup discovery, persistence, and empty-state no-rescan')
}
run().catch((error) => { console.error(error); process.exitCode = 1 })
