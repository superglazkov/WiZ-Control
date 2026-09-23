import SceneItem from '@components/SceneItem'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { scenes } from 'src/renderer/utils/scenesInfo'

type Scene = {
  type?: string
  nameFilter?: string
  onFilter: (value: boolean) => void
}

export default function Scene({ type, nameFilter, onFilter }: Scene) {
  const { t } = useTranslation()

  useEffect(() => {
    const isShowingAll = !type
    const isFilteringByName = nameFilter && nameFilter.length > 0

    const filterByType = (scene: (typeof scenes)[0]) => isShowingAll || scene.type === type
    const filterByName = (scene: (typeof scenes)[0]) =>
      !isFilteringByName ||
      t(`scenes.names.${scene.name}`).toLowerCase().includes(nameFilter!.toLowerCase())

    const filteredScenes = scenes.filter(filterByType).filter(filterByName)
    const areScenesEmpty = filteredScenes.length === 0

    if (areScenesEmpty) {
      onFilter(false)
    } else {
      onFilter(true)
    }
  }, [type, nameFilter, t, onFilter])

  const isShowingAll = !type
  const isFilteringByName = nameFilter && nameFilter.length > 0

  const filterByType = (scene: (typeof scenes)[0]) => isShowingAll || scene.type === type
  const filterByName = (scene: (typeof scenes)[0]) =>
    !isFilteringByName ||
    t(`scenes.names.${scene.name}`).toLowerCase().includes(nameFilter!.toLowerCase())

  const filteredScenes = scenes.filter(filterByType).filter(filterByName)

  return (
    <>
      {filteredScenes.map((scene) => (
        <SceneItem
          id={scene.id}
          key={scene.id}
          name={t(`scenes.names.${scene.name}`)}
          icon={scene.icon}
        />
      ))}
    </>
  )
}
