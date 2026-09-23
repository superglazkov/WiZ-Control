import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useBulbStore } from '@renderer/context/BulbStore'
import { getSceneBackground } from '@renderer/utils/sceneAppearance'
import { IconType } from 'react-icons'
import { LuGripVertical, LuHeart } from 'react-icons/lu'

type SortableSceneItemProps = {
  id: number
  name: string
  icon?: IconType
  hex?: string
}

export default function SortableSceneItem({ id, name, icon, hex }: SortableSceneItemProps) {
  const bulb = useBulbStore((state) => state.bulb)
  const bulbs = useBulbStore((state) => state.bulbs)
  const controlAll = useBulbStore((state) => state.controlAll)
  const setScene = useBulbStore((state) => state.setScene)
  const toggleFavoriteColor = useBulbStore((state) => state.toggleFavoriteColor)
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

  const Icon = icon as IconType

  const active = controlAll
    ? bulbs.length > 0 && bulbs.every((item) => item.sceneId === id)
    : bulb?.sceneId === id

  const handleClick = () => {
    if (!bulb) return
    setScene(id)
  }

  const handleAddFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleFavoriteColor(id)
  }

  const isFavorite = bulb ? bulb.favoriteColors.includes(id) : false

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    background: hex
      ? `linear-gradient(135deg, ${hex} 0%, ${hex}cc 55%, ${hex}88 100%)`
      : getSceneBackground(id)
  }

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      style={style}
      onClick={handleClick}
      className={`relative overflow-hidden flex items-center text-white rounded-2xl pr-4 py-6 text-nowrap transition-[filter,box-shadow] hover:brightness-110 ${active ? 'ring-2 ring-white/90 shadow-lg' : 'ring-1 ring-white/10'} ${!bulb ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <div className="absolute inset-0 bg-black/10 pointer-events-none" />
      <div className="px-2 text-white/80 relative z-10">
        <div
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="cursor-grab absolute inset-0 -inset-y-5"
        />
        <LuGripVertical size={20} className="relative pointer-events-none" />
      </div>
      <div className="relative z-10 flex items-center justify-between w-full">
        <div className="flex items-center drop-shadow-sm">
          {icon ? (
            <Icon className="w-5 h-5 lg:w-6 lg:h-6" />
          ) : (
            <span
              className="w-5 h-5 lg:w-6 lg:h-6 rounded-full ring-1 ring-white/60"
              style={{ backgroundColor: hex }}
            />
          )}
          <span className="text-white font-semibold text-sm lg:text-md ms-1 lg:ms-2 tracking-tighter lg:tracking-normal drop-shadow-md">
            {name}
          </span>
        </div>
        <button
          className={`cursor-pointer ms-1 lg:ms-2 ${isFavorite ? 'text-alert hover:text-white' : 'text-white/75 hover:text-alert'} transition-colors duration-300 disabled:cursor-not-allowed`}
          disabled={!bulb}
          onClick={handleAddFavorite}
        >
          <LuHeart className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>
    </div>
  )
}
