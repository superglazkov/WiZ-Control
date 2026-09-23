import { useBulbStore } from '@renderer/context/BulbStore'
import { LuPower } from 'react-icons/lu'

type PowerButtonProps = {
  size?: number
  mac?: string
  all?: boolean
}

export default function PowerButton({ size = 20, mac, all = false }: PowerButtonProps) {
  const bulbs = useBulbStore((state) => state.bulbs)
  const selectedBulb = useBulbStore((state) => state.bulb)
  const toggleBulb = useBulbStore((state) => state.toggleBulb)
  const toggleAllBulbs = useBulbStore((state) => state.toggleAllBulbs)

  const bulb = mac ? bulbs.find((item) => item.mac === mac) : selectedBulb
  const isOn = all ? bulbs.some((item) => item.state) : Boolean(bulb?.state)
  const disabled = all ? bulbs.length === 0 : !bulb

  const handleToggleBulb = (event: React.MouseEvent) => {
    event.stopPropagation()
    if (all) {
      toggleAllBulbs()
      return
    }
    toggleBulb(mac)
  }

  return (
    <button
      className={`hover:text-white bg-neutral-300 text-primary p-1.5 rounded-full cursor-pointer transition-all duration-300 ${isOn ? 'hover:bg-alert' : 'hover:bg-lime-600'}`}
      onClick={handleToggleBulb}
      disabled={disabled}
    >
      <LuPower strokeWidth={3} size={size} />
    </button>
  )
}
