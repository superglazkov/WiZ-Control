import Modal from '@components/ui/Modal'
import Separator from '@components/ui/Separator'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import DeleteDialog from '@renderer/components/modals/DeleteDialog'
import { useBulbStore } from '@renderer/context/BulbStore'
import { getThemePreference, setThemePreference, type ThemePreference } from '@renderer/theme'

type SettingsModalProps = {
  isOpen: boolean
  onClose: () => void
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { t } = useTranslation()
  const { deleteProfile } = useBulbStore()

  const [deleteDialog, setDeleteDialog] = useState(false)
  const [theme, setTheme] = useState<ThemePreference>(getThemePreference)
  const [startWithWindows, setStartWithWindows] = useState(false)
  const [minimizeToTray, setMinimizeToTray] = useState(true)

  useEffect(() => {
    if (!isOpen) return
    void window.api.getAppPreferences().then((preferences) => {
      setStartWithWindows(preferences.startWithWindows)
      setMinimizeToTray(preferences.minimizeToTray)
    })
  }, [isOpen])

  const toggleStartWithWindows = async () => {
    const preferences = await window.api.setStartWithWindows(!startWithWindows)
    setStartWithWindows(preferences.startWithWindows)
  }

  const toggleMinimizeToTray = async () => {
    const preferences = await window.api.setMinimizeToTray(!minimizeToTray)
    setMinimizeToTray(preferences.minimizeToTray)
  }
  const handleDeleteProfile = async () => {
    setDeleteDialog(false)
    await deleteProfile()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('settings.title')} maxWidth="max-w-sm">
      <div className="-mt-8">
        <Separator />
      </div>

      <article className="flex flex-col gap-4 mt-4">
        <div className="flex items-center justify-between">
          <p>{t('settings.theme.title')}</p>
          <select
            aria-label="Theme"
            value={theme}
            onChange={(event) => {
              const next = event.target.value as ThemePreference
              setTheme(next)
              setThemePreference(next)
            }}
            className="text-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary transition duration-200 bg-secondary-800"
          >
            <option value="system">{t('settings.theme.system')}</option>
            <option value="light">{t('settings.theme.light')}</option>
            <option value="dark">{t('settings.theme.dark')}</option>
          </select>
        </div>


        <button
          type="button"
          onClick={toggleStartWithWindows}
          className="flex items-center justify-between gap-4 rounded-xl border border-neutral-700 bg-secondary px-3 py-3 text-left hover:bg-white/5 transition-colors"
        >
          <div>
            <p>{t('settings.startWithWindows.title')}</p>
            <p className="mt-0.5 text-xs text-neutral-400">
              {t('settings.startWithWindows.description')}
            </p>
          </div>
          <span
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${startWithWindows ? 'bg-green-500' : 'bg-neutral-700'}`}
          >
            <span
              className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${startWithWindows ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </span>
        </button>

        <button
          type="button"
          onClick={toggleMinimizeToTray}
          className="flex items-center justify-between gap-4 rounded-xl border border-neutral-700 bg-secondary px-3 py-3 text-left hover:bg-white/5 transition-colors"
        >
          <div>
            <p>{t('settings.keepRunningInTray.title')}</p>
            <p className="mt-0.5 text-xs text-neutral-400">
              {t('settings.keepRunningInTray.description')}
            </p>
          </div>
          <span
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${minimizeToTray ? 'bg-green-500' : 'bg-neutral-700'}`}
          >
            <span
              className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${minimizeToTray ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </span>
        </button>

        <div className="flex items-center justify-between">
          <p>{t('settings.deleteProfile.title')}</p>
          <button
            className="text-white bg-alert font-medium rounded-lg px-8 py-2 cursor-pointer hover:bg-alert/80"
            onClick={() => setDeleteDialog(true)}
          >
            {t('settings.deleteProfile.button')}
          </button>
        </div>
      </article>

      {deleteDialog && (
        <DeleteDialog
          isOpen={deleteDialog}
          onClose={() => setDeleteDialog(false)}
          title={t('settings.deleteProfile.title')}
          description={t('settings.deleteProfile.description')}
          onConfirm={handleDeleteProfile}
        />
      )}
    </Modal>
  )
}
