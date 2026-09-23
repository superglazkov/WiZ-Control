import Card from '@components/ui/Card'
import { LuLoaderCircle } from 'react-icons/lu'

export default function SearchBulbCard({ loading = false }: { loading?: boolean }) {
  return (
    <Card className="w-48 h-31 flex flex-col items-center justify-center py-3 px-4">
      {loading ? (
        <>
          <span className="animate-spin-clockwise animate-iteration-count-infinite animate-steps-modern animate-duration-800">
            <LuLoaderCircle size={36} />
          </span>
          <p className="mt-2 text-sm">Searching for WiZ devices...</p>
        </>
      ) : (
        <p className="text-center text-sm text-neutral-400">
          No devices found. Use Add device to scan again or enter an IP.
        </p>
      )}
    </Card>
  )
}
