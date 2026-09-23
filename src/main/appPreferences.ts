import { app } from 'electron'
import fs from 'fs'
import path from 'path'

export type AppPreferences = {
  minimizeToTray: boolean
  startWithWindows: boolean
}

const DEFAULT_PREFERENCES: AppPreferences = {
  minimizeToTray: true,
  startWithWindows: false
}

let preferences: AppPreferences | null = null

function preferencesPath(): string {
  return path.join(app.getPath('userData'), 'ui-settings.json')
}

function readPreferences(): AppPreferences {
  try {
    const currentPath = preferencesPath()
    // 3.4.0 used app.setName('Wiz App') after loading its main modules.
    // Recover UI preferences if Electron stored them under that old folder.
    const legacyPath = path.join(app.getPath('appData'), 'Wiz App', 'ui-settings.json')
    const migrating = !fs.existsSync(currentPath) && fs.existsSync(legacyPath)
    const parsed = JSON.parse(fs.readFileSync(migrating ? legacyPath : currentPath, 'utf8')) as Partial<AppPreferences>
    const result: AppPreferences = {
      minimizeToTray:
        typeof parsed.minimizeToTray === 'boolean'
          ? parsed.minimizeToTray
          : DEFAULT_PREFERENCES.minimizeToTray,
      startWithWindows:
        typeof parsed.startWithWindows === 'boolean'
          ? parsed.startWithWindows
          : DEFAULT_PREFERENCES.startWithWindows
    }
    if (migrating) {
      try {
        fs.mkdirSync(path.dirname(currentPath), { recursive: true })
        fs.writeFileSync(currentPath, JSON.stringify(result, null, 2))
      } catch {
        // The settings work for this session even if the migration cannot persist.
      }
    }
    return result
  } catch {
    return { ...DEFAULT_PREFERENCES }
  }
}

function writePreferences(): void {
  if (!preferences) return
  try {
    fs.writeFileSync(preferencesPath(), JSON.stringify(preferences, null, 2))
  } catch {
    // UI preferences must never prevent the application from running.
  }
}

function applyStartWithWindows(enabled: boolean): void {
  if (process.platform !== 'win32') return
  app.setLoginItemSettings({
    openAtLogin: enabled,
    enabled,
    name: 'WiZ Control',
    path: process.execPath,
    args: ['--hidden']
  })
}

export function getAppPreferences(): AppPreferences {
  if (!preferences) preferences = readPreferences()
  return { ...preferences }
}

export function initializeAppPreferences(): AppPreferences {
  preferences = readPreferences()
  applyStartWithWindows(preferences.startWithWindows)
  return { ...preferences }
}

export function setMinimizeToTray(enabled: boolean): AppPreferences {
  if (!preferences) preferences = readPreferences()
  preferences.minimizeToTray = enabled
  writePreferences()
  return { ...preferences }
}

export function setStartWithWindows(enabled: boolean): AppPreferences {
  if (!preferences) preferences = readPreferences()
  preferences.startWithWindows = enabled
  applyStartWithWindows(enabled)
  writePreferences()
  return { ...preferences }
}
