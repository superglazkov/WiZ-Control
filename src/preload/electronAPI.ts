import { BulbState } from '@shared/types/bulbState'

export type AppPreferences = { minimizeToTray: boolean; startWithWindows: boolean }

export default interface IElectronAPI {
  onUpdateBulb: (callback: (bulb: BulbState | null) => void) => void
  onUpdateBulbs: (callback: (bulbs: BulbState[]) => void) => void
  getBulbWhenReady: () => Promise<BulbState | null>
  getBulbsWhenReady: () => Promise<BulbState[]>
  addDevice: (ip: string) => Promise<BulbState>
  scanDevices: () => Promise<{ found: number; added: number; devices: BulbState[] }>
  setDeviceOrder: (orderedMacs: string[]) => Promise<void>
  setIp: (ip: string) => Promise<BulbState>
  selectBulb: (mac: string) => void
  toggleBulb: (mac?: string) => void
  toggleAllBulbs: () => void
  setBrightness: (brightness: number, mac?: string) => void
  setAllBrightness: (brightness: number) => void
  setBulbName: (name: string, mac?: string) => void
  visitAuthor: () => void
  setScene: (sceneId: number, mac?: string) => void
  setAllScene: (sceneId: number) => void
  setAllColor: (colorHex: string) => void
  toggleFavoriteColor: (colorId: number, mac?: string) => void
  addCustomColor: (colorName: string, colorHex: string, mac?: string) => void
  setCustomColor: (colorId: number, mac?: string) => void
  editCustomColor: (colorId: number, colorName: string, colorHex: string, mac?: string) => void
  removeCustomColor: (colorId: number, mac?: string) => void
  setFavoriteColorsOrder: (favoriteColors: number[], mac?: string) => void
  openAppFolder: () => void
  getAppPreferences: () => Promise<AppPreferences>
  setMinimizeToTray: (enabled: boolean) => Promise<AppPreferences>
  setStartWithWindows: (enabled: boolean) => Promise<AppPreferences>
  getLanguage: () => Promise<string>
  checkForUpdates: () => Promise<boolean>
  getVersion: () => Promise<string>
  deleteBulb: (mac?: string) => void
  deleteProfile: () => void
}
