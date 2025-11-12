import { LoadingSpinner } from '@/components/loading-spinner'

export default function Loading() {
  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LoadingSpinner />
      </div>
    </div>
  )
}
