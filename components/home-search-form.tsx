'use client'

import { useRouter } from 'next/navigation'
import { useState, FormEvent } from 'react'
import { Search, MapPin } from 'lucide-react'

export function HomeSearchForm() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState('')

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const params = new URLSearchParams()
    if (searchQuery) params.set('search', searchQuery)
    if (selectedCity) params.set('city', selectedCity)

    router.push(`/ilanlar?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
      {/* Mobile */}
      <div className="md:hidden space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pozisyon veya şirket..."
            className="w-full pl-12 pr-4 py-4 text-base font-normal text-secondary-900 placeholder:text-secondary-500 focus:outline-none bg-white rounded-xl border border-secondary-200 shadow-sm"
          />
        </div>
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" />
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full pl-12 pr-4 py-4 text-base font-normal text-secondary-900 focus:outline-none appearance-none bg-white rounded-xl border border-secondary-200 shadow-sm"
          >
            <option value="">Tüm Şehirler</option>
            <option value="İstanbul">İstanbul</option>
            <option value="Ankara">Ankara</option>
            <option value="İzmir">İzmir</option>
            <option value="Bursa">Bursa</option>
            <option value="Antalya">Antalya</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full px-6 py-4 bg-primary-600 hover:bg-primary-700 text-white text-base font-medium rounded-xl transition-colors shadow-sm"
        >
          İş Ara
        </button>
      </div>

      {/* Desktop */}
      <div className="hidden md:block bg-white rounded-full shadow-xl border border-secondary-200 p-2">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pozisyon veya şirket ara..."
              className="w-full pl-14 pr-6 py-4 text-base font-normal text-secondary-900 placeholder:text-secondary-500 focus:outline-none bg-transparent rounded-full"
            />
          </div>
          <div className="w-64 relative border-l border-secondary-200 pl-4">
            <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full pl-10 pr-6 py-4 text-base font-normal text-secondary-900 focus:outline-none appearance-none bg-transparent"
            >
              <option value="">Tüm Şehirler</option>
              <option value="İstanbul">İstanbul</option>
              <option value="Ankara">Ankara</option>
              <option value="İzmir">İzmir</option>
              <option value="Bursa">Bursa</option>
              <option value="Antalya">Antalya</option>
            </select>
          </div>
          <button
            type="submit"
            className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white text-base font-medium rounded-full transition-colors whitespace-nowrap"
          >
            Ara
          </button>
        </div>
      </div>
    </form>
  )
}
