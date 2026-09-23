import Card from '@components/ui/Card'
import KebabMenu from '@components/ui/KebabMenu'
import PowerButton from '@components/ui/PowerButton'
import { BulbState } from '@shared/types/bulbState'
import { ReactNode } from 'react'

type BulbCardProps = {
  bulb: BulbState
  selected?: boolean
  onSelect?: () => void
  dragHandle?: ReactNode
  menuItems: {
    icon: ReactNode
    label: string
    onClick: () => void
  }[]
}

export default function BulbCard({ bulb, selected = false, onSelect, dragHandle, menuItems }: BulbCardProps) {
  return (
    <Card
      className={`w-full min-w-0 min-h-36 py-3 px-4 ${selected ? 'ring-2 ring-white/70' : ''}`}
      variant={bulb.state ? 'primary' : 'secondary'}
    >
      <button className="w-full text-left cursor-pointer" onClick={onSelect}>
        <p className="text-lg overflow-hidden text-ellipsis whitespace-nowrap">{bulb.name}</p>
        <p className="text-xs text-neutral-300 mt-1">{bulb.ip}</p>
        <span className="text-neutral-300 text-sm">{bulb.state ? 'on' : 'off'}</span>
      </button>
      <div className="mt-4 flex justify-between items-center">
        <PowerButton mac={bulb.mac} />
        <div className="flex items-center gap-1">
          {dragHandle}
          <KebabMenu items={menuItems} />
        </div>
      </div>
    </Card>
  )
}
