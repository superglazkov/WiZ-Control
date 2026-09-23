import FavoriteScene from '@renderer/components/FavoriteScene'
import AddDeviceModal from '@renderer/components/modals/AddDeviceModal'
import DeleteDialog from '@renderer/components/modals/DeleteDialog'
import EditNameModal from '@renderer/components/modals/EditNameModal'
import SearchBulbCard from '@renderer/components/SearchBulbCard'
import SortableBulbCard from '@renderer/components/SortableBulbCard'
import Button from '@renderer/components/ui/Button'
import Card from '@renderer/components/ui/Card'
import PowerButton from '@renderer/components/ui/PowerButton'
import { useBulbStore } from '@renderer/context/BulbStore'
import { HomeModalState, ModalType } from '@renderer/types/modals'
import { closestCenter, DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { rectSortingStrategy, SortableContext } from '@dnd-kit/sortable'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LuCirclePlus, LuLayers3, LuSquarePen, LuToggleLeft, LuTrash } from 'react-icons/lu'

export default function Home() {
  const {
    bulbs,
    initializing,
    bulb,
    selectedMac,
    controlAll,
    selectBulb,
    selectAll,
    toggleBulb,
    deleteBulb,
    reorderDevices
  } = useBulbStore()
  const { t } = useTranslation()
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))
  const [modals, setModals] = useState<HomeModalState>({
    edit: false,
    delete: false,
    ip: false
  })

  const toggleModal = (modal: ModalType) => {
    setModals((prev) => ({ ...prev, [modal]: !prev[modal] }))
  }

  const selectAndOpen = (mac: string, modal: ModalType) => {
    selectBulb(mac)
    toggleModal(modal)
  }

  const handleDeleteBulb = () => {
    if (bulb) deleteBulb(bulb.mac)
    toggleModal('delete')
  }


  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    const oldIndex = bulbs.findIndex((device) => device.mac === active.id)
    const newIndex = bulbs.findIndex((device) => device.mac === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    const reordered = bulbs.slice()
    const [moved] = reordered.splice(oldIndex, 1)
    if (!moved) return
    reordered.splice(newIndex, 0, moved)
    void reorderDevices(reordered.map((device) => device.mac))
  }

  const menuItemsFor = (mac: string) => [
    {
      label: t('home.toggle'),
      icon: <LuToggleLeft size={20} />,
      onClick: () => toggleBulb(mac)
    },
    {
      label: t('home.edit.entry'),
      icon: <LuSquarePen size={20} />,
      onClick: () => selectAndOpen(mac, 'edit')
    },
    {
      label: t('home.delete.entry'),
      icon: <LuTrash size={20} />,
      onClick: () => selectAndOpen(mac, 'delete')
    }
  ]

  return (
    <section className="py-6 px-5 sm:px-6 lg:px-8 min-w-0">
      <h1 className="font-bold text-4xl">{t('home.title')}</h1>
      <h2 className="text-sm lg:text-lg mt-2 text-neutral-400 font-medium">{t('home.subtitle')}</h2>
      <article className="mt-6 w-full max-w-6xl">
        <FavoriteScene />
      </article>
      <article className="mt-8 grid w-full max-w-6xl grid-cols-[repeat(auto-fit,minmax(min(100%,11rem),1fr))] gap-4">
        {bulbs.length > 0 ? (
          <>
            <Card
              className={`w-full min-w-0 min-h-36 py-3 px-4 ${controlAll ? 'ring-2 ring-white/70' : ''}`}
              variant={bulbs.some((device) => device.state) ? 'primary' : 'secondary'}
            >
              <button className="w-full text-left cursor-pointer" onClick={selectAll}>
                <div className="flex items-center gap-2">
                  <LuLayers3 size={20} />
                  <p className="text-lg font-semibold">All devices</p>
                </div>
                <p className="text-xs text-neutral-300 mt-2">{bulbs.length} saved devices</p>
                <span className="text-neutral-300 text-sm">group control</span>
              </button>
              <div className="mt-4 flex justify-start items-center">
                <PowerButton all />
              </div>
            </Card>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={bulbs.map((device) => device.mac)} strategy={rectSortingStrategy}>
                {bulbs.map((device) => (
                  <SortableBulbCard
                    key={device.mac}
                    bulb={device}
                    selected={!controlAll && selectedMac === device.mac}
                    onSelect={() => selectBulb(device.mac)}
                    menuItems={menuItemsFor(device.mac)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </>
        ) : (
          <SearchBulbCard loading={initializing} />
        )}

        <Button
          variant="secondary"
          onClick={() => toggleModal('ip')}
          className="flex flex-col items-center justify-center w-full min-h-36 g-1"
        >
          <LuCirclePlus size={32} strokeWidth={1} />
          <p className="mt-2 text-lg">{t('home.add.entry')}</p>
        </Button>
      </article>

      {bulb && (
        <>
          <EditNameModal isOpen={modals.edit} onClose={() => toggleModal('edit')} />
          <DeleteDialog
            isOpen={modals.delete}
            onClose={() => toggleModal('delete')}
            title={t('home.delete.title')}
            description={`${t('home.delete.message')} "${bulb.name}"?`}
            onConfirm={handleDeleteBulb}
          />
        </>
      )}

      <AddDeviceModal isOpen={modals.ip} onClose={() => toggleModal('ip')} />
    </section>
  )
}
