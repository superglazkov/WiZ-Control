import { ReactNode } from 'react'

export type ModalType = 'edit' | 'delete' | 'ip'

export interface MenuItemType {
  label: string
  icon: ReactNode
  onClick: () => void
}

export interface HomeModalState {
  edit: boolean
  delete: boolean
  ip: boolean
}

export interface SidebarModalState {
  about: boolean
  settings: boolean
}
