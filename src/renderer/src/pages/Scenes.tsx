import CustomScene from '@renderer/components/CustomScene'
import FavoriteScene from '@renderer/components/FavoriteScene'
import Scene from '@renderer/components/Scene'
import useDebounce from '@renderer/hooks/useDebounce'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LuSearch, LuX } from 'react-icons/lu'

export default function Scenes() {
  const { t } = useTranslation()
  const [searchValue, setSearchValue] = useState('')
  const [areScenes, setAreScenes] = useState(true)
  const debouncedSearch = useDebounce(searchValue, 500)

  const [selectedTag, setSelectedTag] = useState('All')

  const handleResetNotFound = () => {
    if (areScenes) return
    setAreScenes(true)
  }

  const handleChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleResetNotFound()
    setSearchValue(e.target.value)
  }

  const handleResetSearch = () => {
    handleResetNotFound()
    setSearchValue('')
  }

  const handleChangeTag = (name: string) => {
    setSearchValue('')
    handleResetNotFound()
    setSelectedTag(name)
  }

  const renderTagButton = (name: string) => (
    <button
      key={name}
      className={`text-white text-sm lg:text-base px-3 py-1 rounded-lg cursor-pointer  transition-colors ${selectedTag === name ? 'bg-primary hover:bg-primary-600' : 'bg-secondary hover:bg-secondary-600'}`}
      onClick={() => handleChangeTag(name)}
    >
      {t(`scenes.tags.${name.toLowerCase()}`)}
    </button>
  )

  const renderScenes = () => {
    if (selectedTag === 'All') {
      return (
        <>
          <Scene nameFilter={debouncedSearch} onFilter={(value) => setAreScenes(value)} />
          <CustomScene nameFilter={debouncedSearch} onFilter={(value) => setAreScenes(value)} />
        </>
      )
    } else if (selectedTag === 'Static') {
      return (
        <Scene
          type="static"
          nameFilter={debouncedSearch}
          onFilter={(value) => setAreScenes(value)}
        />
      )
    } else if (selectedTag === 'Dynamic') {
      return (
        <Scene
          type="dynamic"
          nameFilter={debouncedSearch}
          onFilter={(value) => setAreScenes(value)}
        />
      )
    } else if (selectedTag === 'Custom') {
      return (
        <CustomScene
          nameFilter={debouncedSearch}
          onFilter={(value) => setAreScenes(value)}
          showBtnButton
        />
      )
    }

    return null
  }

  return (
    <section className="py-8 px-8 w-full">
      <div className="flex justify-between items-center">
        <h1 className="font-bold text-4xl">{t('scenes.title')}</h1>
        <div className="relative flex bg-secondary-700 text-white ps-4 py-1 rounded-xl items-center focus-within:outline-none transition duration-300 focus-within:ring-primary focus-within:ring-2 gap-2">
          <LuSearch size={18} className="text-neutral-500" />
          <input
            type="search"
            value={searchValue}
            onChange={handleChangeSearch}
            placeholder={t('scenes.search')}
            className=" placeholder:text-neutral-500 font-[450] focus:outline-none placeholder:text-sm  [&::-webkit-search-cancel-button]:hidden"
          />
          {searchValue && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-100 transition-colors cursor-pointer"
              onClick={handleResetSearch}
            >
              <LuX size={20} />
            </button>
          )}
        </div>
      </div>
      <h2 className="text-sm lg:text-lg mt-3 text-neutral-400 font-medium">
        {t('scenes.subtitle')}
      </h2>
      <article className="mt-8 w-full">
        <FavoriteScene />
      </article>

      <article className="mt-8 w-full">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">{t('scenes.available')}</h2>
          <div className="flex gap-2">
            {renderTagButton('All')}
            {renderTagButton('Static')}
            {renderTagButton('Dynamic')}
            {renderTagButton('Custom')}
          </div>
        </div>
      </article>

      <article className="mt-8 w-full grid grid-cols-3 gap-x-4 gap-y-4 lg:gap-y-6 lg:grid-cols-4 xl:grid-cols-5">
        {renderScenes()}
      </article>
      {!areScenes && (
        <p className="mt-12 text-center text-neutral-500 font-bold text-sm">
          {t('scenes.notFound')}
        </p>
      )}
    </section>
  )
}
