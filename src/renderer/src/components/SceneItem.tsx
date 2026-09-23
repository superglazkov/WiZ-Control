import { useBulbStore } from '@renderer/context/BulbStore'
import { getSceneBackground } from '@renderer/utils/sceneAppearance'
import { LuHeart } from 'react-icons/lu'

type SceneItemProps = {
  id: number
  name: string
  icon: React.ElementType
}

export default function SceneItem({ id, name, icon }: SceneItemProps) {
  const bulb = useBulbStore((state) => state.bulb)
  const bulbs = useBulbStore((state) => state.bulbs)
  const controlAll = useBulbStore((state) => state.controlAll)
  const setScene = useBulbStore((state) => state.setScene)
  const toggleFavoriteColor = useBulbStore((state) => state.toggleFavoriteColor)

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
  const Icon = icon

  return (
    <div
      className={`relative overflow-hidden flex items-center justify-between cursor-pointer text-white rounded-2xl px-4 py-6 2xl:px-6 text-nowrap transition-all hover:brightness-110 ${active ? 'ring-2 ring-white/90 shadow-lg scale-[1.01]' : 'ring-1 ring-white/10'} ${!bulb ? 'opacity-50 cursor-not-allowed' : ''}`}
      style={{ background: getSceneBackground(id) }}
      onClick={handleClick}
    >
      <div className="absolute inset-0 bg-black/10 pointer-events-none" />
      <div className="relative flex items-center drop-shadow-sm">
        <Icon size={24} />
        <span className="text-white ms-2 font-semibold text-sm lg:text-base drop-shadow-md">{name}</span>
      </div>
      <button
        className={`relative cursor-pointer ms-2 ${isFavorite ? 'text-alert hover:text-white' : 'text-white/75 hover:text-alert'} transition-colors duration-300 disabled:cursor-not-allowed`}
        disabled={!bulb}
        onClick={handleAddFavorite}
      >
        <LuHeart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
      </button>
    </div>
  )
}
