import { useBulbStore } from '@renderer/context/BulbStore'
import { useState } from 'react'
import {
  LuChevronDown,
  LuChevronUp,
  LuCirclePower,
  LuInfo,
  LuLightbulb,
  LuWifi
} from 'react-icons/lu'

function formatMac(mac: string): string {
  const normalized = mac.replace(/[^a-fA-F0-9]/g, '')
  return normalized.match(/.{1,2}/g)?.join(':').toUpperCase() ?? mac
}

function valueOrDash(value: unknown): string {
  if (value === undefined || value === null || value === '') return '—'
  return String(value)
}

type DetailProps = {
  label: string
  value: unknown
}

function Detail({ label, value }: DetailProps) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-wide text-neutral-500">{label}</p>
      <p className="mt-0.5 text-sm text-neutral-200 break-all">{valueOrDash(value)}</p>
    </div>
  )
}

export default function Information() {
  const bulbs = useBulbStore((state) => state.bulbs)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const allExpanded = bulbs.length > 0 && bulbs.every((bulb) => expanded[bulb.mac])

  const toggleDevice = (mac: string) => {
    setExpanded((current) => ({ ...current, [mac]: !current[mac] }))
  }

  const toggleAll = () => {
    if (allExpanded) {
      setExpanded({})
      return
    }

    setExpanded(Object.fromEntries(bulbs.map((bulb) => [bulb.mac, true])))
  }

  return (
    <section className="py-8 px-8">
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <LuInfo size={30} />
            <h1 className="font-bold text-4xl">Information</h1>
          </div>
          <p className="mt-2 text-sm lg:text-lg text-neutral-400 font-medium">
            {bulbs.length} saved {bulbs.length === 1 ? 'device' : 'devices'}
          </p>
        </div>

        {bulbs.length > 1 && (
          <button
            type="button"
            onClick={toggleAll}
            className="rounded-lg bg-secondary px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-700 transition-colors"
          >
            {allExpanded ? 'Collapse all' : 'Expand all'}
          </button>
        )}
      </div>

      <div className="mt-7 flex max-w-5xl flex-col gap-2.5">
        {bulbs.length === 0 ? (
          <div className="rounded-xl bg-secondary px-5 py-6 text-neutral-400">
            No saved WiZ devices yet.
          </div>
        ) : (
          bulbs.map((bulb) => {
            const isExpanded = !!expanded[bulb.mac]
            const brightness = bulb.dimming ?? 0

            return (
              <article
                key={bulb.mac}
                className={`overflow-hidden rounded-xl border transition-colors ${
                  bulb.state
                    ? 'border-neutral-600 bg-secondary'
                    : 'border-neutral-800 bg-neutral-900/60'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleDevice(bulb.mac)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors"
                  aria-expanded={isExpanded}
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      bulb.state ? 'bg-white/15 text-white' : 'bg-black/20 text-neutral-500'
                    }`}
                  >
                    <LuLightbulb size={19} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium text-neutral-100">{bulb.name}</p>
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${
                          bulb.state ? 'bg-green-400' : 'bg-neutral-600'
                        }`}
                      />
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs text-neutral-400">
                      <LuWifi size={12} />
                      <span>{bulb.ip}</span>
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center gap-5 text-xs text-neutral-400">
                    <div className="flex items-center gap-1.5">
                      <LuCirclePower size={14} />
                      <span>{bulb.state ? 'On' : 'Off'}</span>
                    </div>
                    <span className="w-16 text-right">{brightness}%</span>
                  </div>

                  <div className="ml-1 text-neutral-400">
                    {isExpanded ? <LuChevronUp size={19} /> : <LuChevronDown size={19} />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-white/5 px-4 py-4">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-3 xl:grid-cols-4">
                      <Detail label="IP address" value={bulb.ip} />
                      <Detail label="Port" value={bulb.port} />
                      <Detail label="MAC" value={formatMac(bulb.mac)} />
                      <Detail label="Module" value={bulb.moduleName} />
                      <Detail label="Firmware" value={bulb.fwVersion} />
                      <Detail label="Region" value={bulb.rgn} />
                      <Detail label="RSSI" value={bulb.rssi !== undefined ? `${bulb.rssi} dBm` : undefined} />
                      <Detail label="Brightness" value={`${brightness}%`} />
                      <Detail label="Scene ID" value={bulb.sceneId} />
                      <Detail label="Home ID" value={bulb.homeId} />
                      <Detail label="Room ID" value={bulb.roomId} />
                      <Detail label="Group ID" value={bulb.groupId} />
                      <Detail label="Ping" value={bulb.ping} />
                      <Detail label="Power" value={bulb.state ? 'On' : 'Off'} />
                    </div>
                  </div>
                )}
              </article>
            )
          })
        )}
      </div>

      <p className="mt-6 text-xs text-neutral-600">
        WiZ Control · Developer / maintainer: Superglazkov
      </p>
    </section>
  )
}
