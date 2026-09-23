import { electronAPI } from '@electron-toolkit/preload'
import { BulbState } from '@shared/types/bulbState'
import type { AppPreferences } from './electronAPI'
import { contextBridge, ipcRenderer } from 'electron'

const api = {
  onUpdateBulb: (callback: (bulb: BulbState | null) => void) =>
    ipcRenderer.on('on-update-bulb', (_, bulb: BulbState | null) => callback(bulb)),
  onUpdateBulbs: (callback: (bulbs: BulbState[]) => void) =>
    ipcRenderer.on('on-update-bulbs', (_, bulbs: BulbState[]) => callback(bulbs)),
  getBulbWhenReady: () => ipcRenderer.invoke('get-bulb'),
  getBulbsWhenReady: () => ipcRenderer.invoke('get-bulbs'),
  addDevice: (ip: string) => ipcRenderer.invoke('add-device', ip),
  scanDevices: () => ipcRenderer.invoke('scan-devices'),
  setDeviceOrder: (orderedMacs: string[]): Promise<void> =>
    ipcRenderer.invoke('set-device-order', orderedMacs),
  setIp: (ip: string) => ipcRenderer.invoke('set-ip', ip),
  selectBulb: (mac: string) => ipcRenderer.send('select-bulb', mac),
  toggleBulb: (mac?: string) => ipcRenderer.send('toggle-bulb-state', mac),
  toggleAllBulbs: () => ipcRenderer.send('toggle-all-bulbs'),
  setBrightness: (brightness: number, mac?: string) =>
    ipcRenderer.send('set-brightness', brightness, mac),
  setAllBrightness: (brightness: number) => ipcRenderer.send('set-all-brightness', brightness),
  setBulbName: (name: string, mac?: string) => ipcRenderer.send('set-bulb-name', name, mac),
  visitAuthor: () => ipcRenderer.send('visit-author'),
  setScene: (sceneId: number, mac?: string) => ipcRenderer.send('set-scene', sceneId, mac),
  setAllScene: (sceneId: number) => ipcRenderer.send('set-all-scene', sceneId),
  setAllColor: (colorHex: string) => ipcRenderer.send('set-all-color', colorHex),
  toggleFavoriteColor: (colorId: number, mac?: string) =>
    ipcRenderer.send('toggle-favorite-color', colorId, mac),
  addCustomColor: (colorName: string, colorHex: string, mac?: string) =>
    ipcRenderer.send('add-custom-color', colorName, colorHex, mac),
  setCustomColor: (colorId: number, mac?: string) =>
    ipcRenderer.send('set-custom-color', colorId, mac),
  editCustomColor: (colorId: number, colorName: string, colorHex: string, mac?: string) =>
    ipcRenderer.send('edit-color', colorId, colorName, colorHex, mac),
  removeCustomColor: (colorId: number, mac?: string) =>
    ipcRenderer.send('remove-color', colorId, mac),
  setFavoriteColorsOrder: (favoriteColors: number[], mac?: string) =>
    ipcRenderer.send('set-favorite-colors-order', favoriteColors, mac),
  openAppFolder: () => ipcRenderer.send('open-app-folder'),
  getAppPreferences: (): Promise<AppPreferences> => ipcRenderer.invoke('get-app-preferences'),
  setMinimizeToTray: (enabled: boolean): Promise<AppPreferences> =>
    ipcRenderer.invoke('set-minimize-to-tray', enabled),
  setStartWithWindows: (enabled: boolean): Promise<AppPreferences> =>
    ipcRenderer.invoke('set-start-with-windows', enabled),
  getLanguage: () => ipcRenderer.invoke('get-language'),
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  getVersion: () => ipcRenderer.invoke('get-version'),
  deleteBulb: (mac?: string) => ipcRenderer.send('delete-bulb', mac),
  deleteProfile: () => ipcRenderer.send('delete-profile')
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
