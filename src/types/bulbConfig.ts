import { BulbState } from '@shared/types/bulbState'
import { CustomColor } from '@shared/types/customColor'

export interface DeviceConfig {
  mac: string
  bulbName: string
  bulbIp: string
  customColors: CustomColor[]
  favoriteColors: Array<BulbState['sceneId']>
}

export interface BulbConfig {
  version: 2
  selectedMac: string
  ignoredMacs: string[]
  initialScanDone?: boolean
  devices: DeviceConfig[]
}

export interface LegacyBulbConfig {
  bulbName: string
  bulbIp: string
  customColors: CustomColor[]
  favoriteColors: Array<BulbState['sceneId']>
}
