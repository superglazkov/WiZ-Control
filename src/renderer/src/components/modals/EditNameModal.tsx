import Modal from '@components/ui/Modal'
import { useBulbStore } from '@renderer/context/BulbStore'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

type EditNameModalProps = {
  isOpen: boolean
  onClose: () => void
}

export default function EditNameModal({ isOpen, onClose }: EditNameModalProps) {
  const bulb = useBulbStore((state) => state.bulb)
  const { t } = useTranslation()
  const setBulbName = useBulbStore((state) => state.setBulbName)
  const [error, setError] = useState<string | null>(null)

  if (!bulb) return null

  const validateName = (name: string) => {
    if (name.length <= 0) {
      setError(t('errors.emptyName'))
      return false
    }

    if (name.length > 15) {
      setError(t('errors.longName'))
      return false
    }

    if (name === bulb.name) {
      setError(t('errors.sameName'))
      return false
    }

    setError(null)
    return true
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const name = String(form.get('name') ?? '')

    if (!validateName(name)) return

    setBulbName(name)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('home.edit.title')}>
      <form onSubmit={handleSubmit}>
        <label htmlFor="name" className="text-neutral-400 block mb-2">
          {t('home.edit.label')}
        </label>
        <input
          type="text"
          id="name"
          name="name"
          defaultValue={bulb.name}
          onChange={() => setError(null)}
          placeholder='e.g. "Living room"'
          className={`w-full bg-secondary-700 text-white p-2 rounded-lg border border-neutral-600 focus:outline-none focus:border-primary focus:border-2 ${error ? 'border-red-500' : 'border-neutral-600'}`}
        />
        {error && <p className="text-red-500 text-sm mt-1 ms-1 font-medium">{error}</p>}
        <footer className="flex items-center justify-end gap-2 mt-6">
          <button
            className="text-white mt-4 mr-2 cursor-pointer transition-colors bg-secondary hover:bg-secondary-600 py-2 px-4 rounded-lg"
            type="button"
            onClick={onClose}
          >
            {t('modals.cancel')}
          </button>
          <button
            type="submit"
            className="mt-4 px-4 bg-primary rounded-lg text-white py-2 transition-colors cursor-pointer font-medium hover:bg-primary-600"
          >
            {t('modals.save')}
          </button>
        </footer>
      </form>
    </Modal>
  )
}
