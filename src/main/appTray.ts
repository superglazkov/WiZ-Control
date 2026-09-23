import {
  getAppPreferences,
  initializeAppPreferences,
  setMinimizeToTray,
  setStartWithWindows
} from '@main/appPreferences'
import { app, BrowserWindow, Menu, nativeImage, Tray } from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import log from 'electron-log'

let tray: Tray | null = null
let mainWindow: BrowserWindow | null = null
let quitting = false
export const startsHidden = process.argv.includes('--hidden')
export const isTrayAvailable = (): boolean => tray !== null
export const refreshTrayMenu = (): void => { tray?.setContextMenu(menu()) }

function showWindow(): void {
  const window = mainWindow
  if (!window || window.isDestroyed()) return
  if (window.isMinimized()) window.restore()
  window.setSkipTaskbar(false)
  window.show()
  window.focus()
}

function hideWindow(): void {
  const window = mainWindow
  if (!window || window.isDestroyed() || !tray) return
  window.hide()
  window.setSkipTaskbar(true)
}

function menu(): Menu {
  const settings = getAppPreferences()
  return Menu.buildFromTemplate([
    { label: 'Open WiZ Control', click: showWindow },
    { type: 'separator' },
    {
      label: 'Minimize to tray on close', type: 'checkbox', checked: settings.minimizeToTray,
      click: (item) => { setMinimizeToTray(item.checked); tray?.setContextMenu(menu()) }
    },
    {
      label: 'Start with Windows', type: 'checkbox', checked: settings.startWithWindows,
      click: (item) => { setStartWithWindows(item.checked); tray?.setContextMenu(menu()) }
    },
    { type: 'separator' },
    { label: 'Exit', click: () => { quitting = true; app.quit() } }
  ])
}

function trayIconPath(): string {
  return app.isPackaged
    ? path.join(process.resourcesPath, 'tray.png')
    : path.join(app.getAppPath(), 'resources', 'tray.png')
}

export function initializeTray(window: BrowserWindow): void {
  mainWindow = window
  initializeAppPreferences()

  // 'X' only hides if the user requested tray mode. Real app exit closes UDP.
  window.on('close', (event) => {
    if (quitting || !tray || !getAppPreferences().minimizeToTray) return
    event.preventDefault()
    hideWindow()
  })
  window.webContents.setBackgroundThrottling(true)

  // This file is included by electron-builder under extraResources.
  const iconPath = trayIconPath()
  const icon = fs.existsSync(iconPath) ? nativeImage.createFromPath(iconPath) : nativeImage.createEmpty()
  if (icon.isEmpty()) {
    log.error(`Tray icon missing or invalid at ${iconPath}`)
    return
  }
  tray = new Tray(icon)
  tray.setToolTip('WiZ Control')
  tray.setContextMenu(menu())
  tray.on('click', showWindow)
  tray.on('double-click', showWindow)
}

app.on('before-quit', () => { quitting = true })
