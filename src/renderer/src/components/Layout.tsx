import Sidebar from '@components/ui/Sidebar'
import { Outlet } from 'react-router'

export default function Layout() {
  return (
    <div className="flex w-full min-w-0">
      <Sidebar />

      <main className="bg-main-bg text-white nonSelectable grow min-w-0 pl-56 min-h-screen">
        <Outlet />
      </main>
    </div>
  )
}
