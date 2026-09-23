import BrightnessSlider from '@components/ui/BrightnessSlider'
import PowerButton from '@components/ui/PowerButton'
import { useBulbStore } from '@renderer/context/BulbStore'

export default function BulbShortcut() {
  const bulb = useBulbStore((state) => state.bulb)
  const bulbs = useBulbStore((state) => state.bulbs)
  const controlAll = useBulbStore((state) => state.controlAll)

  if (!bulb) return null

  return (
    <div className="min-w-0 w-full text-white px-3 py-3 bg-secondary rounded-xl animate-steps-modern animate-pulse-fade-in">
      <div className="flex min-w-0 items-center gap-2 mb-1">
        <p className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm">
          {controlAll ? `All devices (${bulbs.length})` : bulb.name}
        </p>
        <div className="shrink-0"><PowerButton all={controlAll} size={17} /></div>
      </div>
      <BrightnessSlider />
    </div>
  )
}
