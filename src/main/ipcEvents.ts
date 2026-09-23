import i18n from '@i18n'
import BulbManager from '@main/bulbManager'
import { getAppPreferences, setMinimizeToTray, setStartWithWindows } from '@main/appPreferences'
import { refreshTrayMenu } from '@main/appTray'
import { app, ipcMain, shell } from 'electron'
import { autoUpdater } from 'electron-updater'

const registerIPCEvents = (bulbManager: BulbManager) => {
  ipcMain.on('toggle-bulb-state', async (_, mac?: string) => {
    await bulbManager.toggleBulb(mac)
  })

  ipcMain.on('toggle-all-bulbs', async () => {
    await bulbManager.toggleAllBulbs()
  })

  ipcMain.on('set-brightness', async (_, brightness: number, mac?: string) => {
    await bulbManager.setBrightness(brightness, mac)
  })

  ipcMain.on('set-all-brightness', async (_, brightness: number) => {
    await bulbManager.setAllBrightness(brightness)
  })

  ipcMain.on('set-bulb-name', async (_, name: string, mac?: string) => {
    await bulbManager.setBulbName(name, mac)
  })

  ipcMain.handle('add-device', async (_, ip: string) => {
    return bulbManager.addDevice(ip)
  })

  ipcMain.handle('scan-devices', async () => {
    return bulbManager.scanAndAddDevices()
  })

  ipcMain.handle('set-device-order', async (_, orderedMacs: string[]) => {
    await bulbManager.setDeviceOrder(orderedMacs)
  })

  ipcMain.handle('set-ip', async (_, ip: string) => {
    return bulbManager.setIp(ip)
  })

  ipcMain.on('select-bulb', (_, mac: string) => {
    bulbManager.selectBulb(mac)
  })

  ipcMain.on('set-scene', async (_, sceneId: number, mac?: string) => {
    await bulbManager.setScene(sceneId, mac)
  })

  ipcMain.on('set-all-scene', async (_, sceneId: number) => {
    await bulbManager.setAllScene(sceneId)
  })

  ipcMain.on('set-all-color', async (_, colorHex: string) => {
    await bulbManager.setAllColor(colorHex)
  })

  ipcMain.on('add-custom-color', async (_, colorName: string, colorHex: string, mac?: string) => {
    await bulbManager.addCustomColor(colorName, colorHex, mac)
  })

  ipcMain.on('set-custom-color', async (_, colorId: number, mac?: string) => {
    await bulbManager.setCustomColor(colorId, mac)
  })

  ipcMain.on(
    'edit-color',
    async (_, colorId: number, colorName: string, colorHex: string, mac?: string) => {
      await bulbManager.editCustomColor(colorId, colorName, colorHex, mac)
    }
  )

  ipcMain.on('remove-color', async (_, colorId: number, mac?: string) => {
    await bulbManager.removeCustomColor(colorId, mac)
  })

  ipcMain.on('toggle-favorite-color', async (_, colorId: number, mac?: string) => {
    await bulbManager.toggleFavoriteColor(colorId, mac)
  })

  ipcMain.on('set-favorite-colors-order', async (_, favoriteColors: number[], mac?: string) => {
    await bulbManager.setFavoriteColorsOrder(favoriteColors, mac)
  })

  ipcMain.on('open-app-folder', () => {
    shell.openPath(app.getPath('userData'))
  })

  ipcMain.handle('get-bulb', () => {
    return bulbManager.getBulbState()
  })

  ipcMain.handle('get-bulbs', () => {
    return bulbManager.getBulbsState()
  })

  ipcMain.handle('check-for-updates', async () => {
    const result = await autoUpdater.checkForUpdates()

    autoUpdater.on('update-available', () => true)
    autoUpdater.on('update-not-available', () => false)

    return result?.updateInfo && result.versionInfo
      ? result.updateInfo.version !== result.versionInfo.version
      : false
  })

  ipcMain.on('delete-bulb', async (_, mac?: string) => {
    await bulbManager.deleteBulb(mac)
  })

  ipcMain.on('delete-profile', async () => {
    await bulbManager.deleteProfile()
  })


  ipcMain.handle('get-app-preferences', () => getAppPreferences())
  ipcMain.handle('set-minimize-to-tray', (_, enabled: boolean) => {
    const result = setMinimizeToTray(enabled)
    refreshTrayMenu()
    return result
  })
  ipcMain.handle('set-start-with-windows', (_, enabled: boolean) => {
    const result = setStartWithWindows(enabled)
    refreshTrayMenu()
    return result
  })

  ipcMain.handle('get-language', () => i18n.language)
  ipcMain.handle('get-version', () => app.getVersion())
}

export default registerIPCEvents
