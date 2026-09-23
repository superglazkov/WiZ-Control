import { MenuItemType, ModalType } from '@/types/modals'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { LuSquarePen, LuToggleLeft, LuTrash } from 'react-icons/lu'

export function useBulbMenuItems(toggleBulb: () => void, toggleModal: (modal: ModalType) => void) {
  const { t } = useTranslation()

  return useMemo(
    (): MenuItemType[] => [
      {
        label: t('home.toggle'),
        icon: <LuToggleLeft size={20} />,
        onClick: toggleBulb
      },
      {
        label: t('home.edit.entry'),
        icon: <LuSquarePen size={20} />,
        onClick: () => toggleModal('edit')
      },
      {
        label: t('home.delete.entry'),
        icon: <LuTrash size={20} />,
        onClick: () => toggleModal('delete')
      }
    ],
    [toggleBulb, toggleModal]
  )
}
