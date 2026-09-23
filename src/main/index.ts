import { initializeTray, isTrayAvailable, startsHidden } from './appTray'
import { HIDE_MENU, ICON, MIN_HEIGHT, MIN_WIDTH, SANDBOX } from '@constants'
import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import checkForUpdates from '@main/autoUpdater'
import BulbManager from '@main/bulbManager'
import registerIPCEvents from '@main/ipcEvents'
import initializeLanguage from '@main/localization'
import initializeLogger from '@main/logger'
import { app, BrowserWindow, shell } from 'electron'
import { join } from 'path'

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 740,
    width: 1100,
    minWidth: MIN_WIDTH,
    minHeight: MIN_HEIGHT,
    icon: ICON,
    show: false,
    skipTaskbar: startsHidden,
    backgroundColor: '#1e1e1e',
    title: 'WiZ Control',
    autoHideMenuBar: HIDE_MENU,
    ...(process.platform === 'linux' ? { icon: ICON } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      devTools: !app.isPackaged,
      sandbox: SANDBOX
    }
  })

  mainWindow.on('ready-to-show', () => {
    // Timeout to avoid blank flash
    setTimeout(() => {
      if (!startsHidden || !isTrayAvailable()) {
        mainWindow.setSkipTaskbar(false)
        mainWindow.show()
      }
    }, 500)
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    const windows = BrowserWindow.getAllWindows()
    if (windows.length > 0) {
      const window = windows[0]
      if (window.isMinimized()) window.restore()
      window.setSkipTaskbar(false)
      window.show()
      window.focus()
    }
  })

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.whenReady().then(() => {
    checkForUpdates()

    // Set app user model id for windows
    electronApp.setAppUserModelId('com.superglazkov.wizcontrol')
    app.setName('WiZ Control')

    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    initializeLogger()
    initializeLanguage(app)

    const mainWindow = createWindow()

    const bulbHelper = new BulbManager(mainWindow)
    registerIPCEvents(bulbHelper)
    initializeTray(mainWindow)

    app.on('before-quit', () => bulbHelper.endConnection())

    app.on('activate', function () {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
