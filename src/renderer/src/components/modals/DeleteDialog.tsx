import Modal from '@components/ui/Modal'
import { useTranslation } from 'react-i18next'

type DeleteDialogProps = {
  isOpen: boolean
  title: string
  description: string
  onConfirm: () => void
  onClose: () => void
}

export default function DeleteDialog({
  isOpen,
  title,
  description,
  onConfirm,
  onClose
}: DeleteDialogProps) {
  // TODO: Implement delete bulb functionality
  const { t } = useTranslation()

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="text-neutral-400">{description}</p>

      <footer className="flex items-center justify-end gap-4 mt-4">
        <button
          className="text-white mt-4 cursor-pointer transition-colors bg-secondary hover:bg-secondary-600 py-2 px-4 rounded-lg"
          type="button"
          onClick={onClose}
        >
          {t('modals.cancel')}
        </button>
        <button
          className="mt-4 px-4 bg-alert rounded-lg text-white py-2 transition-colors cursor-pointer font-medium hover:bg-red-500"
          onClick={onConfirm}
        >
          {t('modals.delete')}
        </button>
      </footer>
    </Modal>
  )
}
