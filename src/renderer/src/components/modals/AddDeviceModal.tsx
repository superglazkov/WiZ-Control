import Modal from '@components/ui/Modal'
import { useBulbStore } from '@renderer/context/BulbStore'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LuRadar } from 'react-icons/lu'

type AddDeviceModalProps = {
  isOpen: boolean
  onClose: () => void
}

function isValidIpv4(ip: string): boolean {
  const parts = ip.trim().split('.')
  return (
    parts.length === 4 &&
    parts.every((part) => /^\d{1,3}$/.test(part) && Number(part) >= 0 && Number(part) <= 255)
  )
}

export default function AddDeviceModal({ isOpen, onClose }: AddDeviceModalProps) {
  const { t } = useTranslation()
  const addDevice = useBulbStore((state) => state.addDevice)
  const scanDevices = useBulbStore((state) => state.scanDevices)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [isScanning, setIsScanning] = useState(false)

  const busy = isAdding || isScanning
  const resetMessages = () => {
    setError(null)
    setStatus(null)
  }

  const handleScan = async () => {
    setIsScanning(true)
    setError(null)
    setStatus(null)
    try {
      const result = await scanDevices()
      if (result.found === 0) {
        setStatus('No WiZ devices found. You can still add a device by IP.')
      } else if (result.added === 0) {
        setStatus(`Found ${result.found} WiZ device(s). All are already saved.`)
      } else {
        setStatus(`Found ${result.found} WiZ device(s), added ${result.added}.`)
      }
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : String(reason)
      setError(`Automatic scan failed: ${message}`)
    } finally {
      setIsScanning(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    const ip = String(form.get('ip') ?? '').trim()

    if (!ip) {
      setError('IP cannot be empty')
      return
    }

    if (!isValidIpv4(ip)) {
      setError('Invalid IPv4 address')
      return
    }

    setIsAdding(true)
    setError(null)
    setStatus(null)
    try {
      await addDevice(ip)
      formElement.reset()
      onClose()
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : String(reason)
      setError(
        message.includes('No WiZ device answered')
          ? `No WiZ device answered at ${ip}:38899`
          : `Failed to add device: ${message}`
      )
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('home.add.title')}>
      <div className="mb-5 rounded-xl bg-secondary-700/60 border border-neutral-700 p-3">
        <div className="flex items-start gap-3">
          <LuRadar size={22} className="mt-0.5 shrink-0 text-primary" />
          <div>
            <p className="text-white font-medium">Automatic discovery</p>
            <p className="text-neutral-400 text-sm mt-1">
              Scan runs only when you press the button. Every WiZ device found on the local network
              will be added. You can delete unwanted devices afterwards.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleScan}
          disabled={busy}
          className="w-full mt-3 px-4 bg-primary rounded-lg text-white py-2 transition-colors cursor-pointer font-medium hover:bg-primary-600 disabled:opacity-60"
        >
          {isScanning ? 'Scanning...' : 'Scan devices'}
        </button>
      </div>

      <div className="flex items-center gap-3 my-4">
        <div className="h-px flex-1 bg-neutral-700" />
        <span className="text-xs uppercase tracking-wider text-neutral-500">or add manually</span>
        <div className="h-px flex-1 bg-neutral-700" />
      </div>

      <form onSubmit={handleSubmit}>
        <label htmlFor="ip" className="text-neutral-400 block mb-2">
          IP address
        </label>
        <input
          type="text"
          id="ip"
          name="ip"
          placeholder={t('home.add.example')}
          onChange={resetMessages}
          disabled={busy}
          className={`w-full bg-secondary-700 text-white p-2 rounded-lg border ${error ? 'border-red-500' : 'border-neutral-600'} focus:outline-none focus:border-primary focus:border-2 disabled:opacity-60`}
        />
        {status && <p className="text-emerald-400 text-sm mt-2 ms-1 font-medium">{status}</p>}
        {error && <p className="text-red-500 text-sm mt-2 ms-1 font-medium">{error}</p>}
        <footer className="flex items-center justify-end gap-2 mt-6">
          <button
            className="text-white mt-4 mr-2 cursor-pointer transition-colors bg-secondary hover:bg-secondary-600 py-2 px-4 rounded-lg disabled:opacity-60"
            type="button"
            onClick={onClose}
            disabled={busy}
          >
            {t('modals.cancel')}
          </button>
          <button
            type="submit"
            disabled={busy}
            className="mt-4 px-4 bg-primary rounded-lg text-white py-2 transition-colors cursor-pointer font-medium hover:bg-primary-600 disabled:opacity-60"
          >
            {isAdding ? 'Adding...' : t('modals.add')}
          </button>
        </footer>
      </form>
    </Modal>
  )
}
