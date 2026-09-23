import { useBulbStore } from '@renderer/context/BulbStore'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function BrightnessSlider() {
  const { t } = useTranslation()
  const bulb = useBulbStore((state) => state.bulb)
  const bulbs = useBulbStore((state) => state.bulbs)
  const controlAll = useBulbStore((state) => state.controlAll)
  const setBrightness = useBulbStore((state) => state.setBrightness)

  const displayedBrightness = useMemo(() => {
    if (controlAll && bulbs.length > 0) {
      const total = bulbs.reduce((sum, item) => sum + (item.dimming ?? 50), 0)
      return Math.max(10, Math.min(100, Math.round(total / bulbs.length)))
    }
    return Math.max(10, Math.min(100, bulb?.dimming ?? 50))
  }, [bulb?.dimming, bulb?.mac, bulbs, controlAll])

  const [isDragging, setIsDragging] = useState(false)
  const [currentBrightness, setCurrentBrightness] = useState(displayedBrightness)

  useEffect(() => {
    if (!isDragging) setCurrentBrightness(displayedBrightness)
  }, [displayedBrightness, isDragging])

  const commitBrightness = () => {
    if (!isDragging) return
    setBrightness(currentBrightness)
    setIsDragging(false)
  }

  const handleMouseDown = () => {
    setIsDragging(true)
  }

  const handleChangeBrightness = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentBrightness(parseInt(event.target.value))
  }

  return (
    <div className="w-full min-w-0">
      <label className="block text-xs text-neutral-400/80 subpixel-antialiased mb-1.5">
        {t('sidebar.brightness')}: {currentBrightness}%
      </label>
      <input
        aria-label="Brightness control"
        type="range"
        min={10}
        max={100}
        onPointerUp={commitBrightness}
        onPointerCancel={commitBrightness}
        onPointerDown={handleMouseDown}
        onKeyUp={(event) => {
          if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'].includes(event.key)) {
            void setBrightness(Number(event.currentTarget.value))
          }
        }}
        onChange={handleChangeBrightness}
        value={currentBrightness}
        step={5}
        className="wiz-brightness-slider block w-full min-w-0 max-w-full"
        role="slider"
      />
    </div>
  )
}
