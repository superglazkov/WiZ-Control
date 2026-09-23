import Modal from '@components/ui/Modal'
import Separator from '@components/ui/Separator'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LuDownload, LuFolder, LuGithub, LuLoaderCircle, LuUser } from 'react-icons/lu'

type AboutModalProps = {
  isOpen: boolean
  onClose: () => void
}

export default function HelpModal({ isOpen, onClose }: AboutModalProps) {
  const { t } = useTranslation()
  const [updateMsg, setUpdateMsg] = useState<string | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [version, setVersion] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    let mounted = true
    void window.api.getVersion().then(
      (value) => { if (mounted) setVersion(value) },
      () => { if (mounted) setVersion('Unavailable') }
    )
    return () => { mounted = false }
  }, [isOpen])

  const handleOpenAppFolder = () => {
    window.api.openAppFolder()
  }

  const handleCheckForUpdates = () => {
    setIsChecking(true)
    window.api.checkForUpdates().then((updateFound) => {
      if (!updateFound) {
        setUpdateMsg(t('help.noUpdates'))

        setTimeout(() => {
          setUpdateMsg(null)
        }, 5000)
      }

      setIsChecking(false)
    })
  }

  const updateToast = (msg: string) => (
    <div className="fixed -bottom-14 left-1/2 transform -translate-x-1/2 bg-neutral-800 text-white px-4 py-2 font-medium rounded-lg shadow-lg animated animate-fade-in whitespace-nowrap">
      {msg}
    </div>
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="WiZ Control" maxWidth="max-w-sm">
      <p className="text-sm text-neutral-500 font-medium -mt-6">
        {t('help.version')}: {version ?? 'Loading...'} (Windows)
      </p>

      <Separator />

      <article className="flex flex-col gap-1 mt-8">
        <div className="flex items-center gap-2">
          <LuGithub size={24} />
          <p>{t('help.source')}:</p>
          <a
            href="https://github.com/Superglazkov/WiZ-Control"
            rel="noreferrer"
            target="_blank"
            className="text-primary underline"
          >
            Github
          </a>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <LuUser size={24} />
          <p>{t('help.author')}:</p>
          <p>
            Superglazkov (
            <a
              href="https://github.com/Superglazkov"
              rel="noreferrer"
              target="_blank"
              className="text-primary underline"
            >
              Superglazkov
            </a>
            )
          </p>
        </div>

        <button
          className="flex items-center gap-2 mt-4 bg-primary text-white px-4 py-2 rounded-lg w-fit font-medium cursor-pointer hover:bg-primary-600"
          onClick={handleOpenAppFolder}
        >
          <LuFolder size={20} />
          <p>{t('help.openFolder')}</p>
        </button>

        <button
          className="flex items-center gap-2 mt-4 bg-primary text-white px-4 py-2 rounded-lg w-fit font-medium cursor-pointer hover:bg-primary-600 disabled:cursor-not-allowed"
          onClick={handleCheckForUpdates}
          disabled={isChecking}
        >
          {isChecking ? (
            <LuLoaderCircle
              size={20}
              className="animated animate-spin-clockwise animate-iteration-count-infinite animate-duration-700"
            />
          ) : (
            <LuDownload size={20} />
          )}
          {isChecking ? <p>{t('help.checkingUpdates')}</p> : <p>{t('help.checkUpdates')}</p>}
        </button>

        {updateMsg && updateToast(updateMsg)}
      </article>
    </Modal>
  )
}
