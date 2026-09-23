import { ElectronAPI } from '@electron-toolkit/preload'
import IElectronAPI from './electronAPI'

declare global {
  interface Window {
    electron: ElectronAPI
    api: IElectronAPI
  }
}
