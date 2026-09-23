import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { BulbState } from '@shared/types/bulbState'
import { ReactNode } from 'react'
import { LuGripVertical } from 'react-icons/lu'
import BulbCard from './BulbCard'

type SortableBulbCardProps = {
  bulb: BulbState
  selected?: boolean
  onSelect?: () => void
  menuItems: {
    icon: ReactNode
    label: string
    onClick: () => void
  }[]
}

export default function SortableBulbCard({
  bulb,
  selected = false,
  onSelect,
  menuItems
}: SortableBulbCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: bulb.mac
  })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 30 : undefined,
    opacity: isDragging ? 0.9 : 1
  }

  const dragHandle = (
    <button
      type="button"
      {...attributes}
      {...listeners}
      onClick={(event) => event.stopPropagation()}
      className="flex h-9 w-8 cursor-grab items-center justify-center rounded-lg text-white/75 hover:bg-white/10 hover:text-white active:cursor-grabbing touch-none"
      title="Drag to reorder"
      aria-label={`Reorder ${bulb.name}`}
    >
      <LuGripVertical size={20} />
    </button>
  )

  return (
    <div ref={setNodeRef} style={style} className="relative min-w-0">
      <BulbCard
        bulb={bulb}
        selected={selected}
        onSelect={onSelect}
        menuItems={menuItems}
        dragHandle={dragHandle}
      />
    </div>
  )
}
