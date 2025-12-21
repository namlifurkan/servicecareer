'use client'

import { useState, useMemo, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Clock, Grid3x3, List, X, Building2 } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'

interface Job {
  id: string
  title: string
  slug: string
  location_city: string
  work_type: string
  experience_level: string | null
  salary_min: number | null
  salary_max: number | null
  salary_currency: string | null
  show_salary: boolean
  published_at: string
  companies: {
    name: string
    logo_url: string | null
    city: string | null
  } | null
  categories: {
    id: string
    name: string
    slug: string
  } | null
}

interface JobListingsClientProps {
  jobs: Job[]
}

export function JobListingsClient({ jobs }: JobListingsClientProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')

  // Filters - initialize from URL params
  const [selectedCity, setSelectedCity] = useState<string>('')
  const [selectedWorkType, setSelectedWorkType] = useState<string>('')
  const [selectedExperience, setSelectedExperience] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Read URL parameters on mount
  useEffect(() => {
    const search = searchParams.get('search') || ''
    const city = searchParams.get('city') || ''
    const workType = searchParams.get('work_type') || ''
    const experience = searchParams.get('experience') || ''

    setSearchQuery(search)
    setSelectedCity(city)
    setSelectedWorkType(workType)
    setSelectedExperience(experience)
  }, [searchParams])

  // Get unique values for filters
  const cities = useMemo(() => {
    const uniqueCities = Array.from(new Set(jobs.map(job => job.location_city)))
    return uniqueCities.sort()
  }, [jobs])

  const workTypes = [
    { value: 'full_time', label: 'Tam Zamanlı' },
    { value: 'part_time', label: 'Yarı Zamanlı' },
    { value: 'contract', label: 'Sözleşmeli' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'internship', label: 'Staj' },
  ]

  const experienceLevels = [
    { value: 'entry', label: 'Giriş Seviyesi' },
    { value: 'junior', label: 'Junior' },
    { value: 'mid', label: 'Orta Seviye' },
    { value: 'senior', label: 'Senior' },
    { value: 'lead', label: 'Lead' },
    { value: 'executive', label: 'Yönetici' },
  ]

  // Filter jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesCity = !selectedCity || job.location_city === selectedCity
      const matchesWorkType = !selectedWorkType || job.work_type === selectedWorkType
      const matchesExperience = !selectedExperience || job.experience_level === selectedExperience
      const matchesSearch = !searchQuery ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (job.companies?.name || '').toLowerCase().includes(searchQuery.toLowerCase())

      return matchesCity && matchesWorkType && matchesExperience && matchesSearch
    })
  }, [jobs, selectedCity, selectedWorkType, selectedExperience, searchQuery])

  // Active filters count
  const activeFiltersCount = [selectedCity, selectedWorkType, selectedExperience, searchQuery].filter(Boolean).length

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedCity('')
    setSelectedWorkType('')
    setSelectedExperience('')
    setSearchQuery('')
  }

  const getWorkTypeLabel = (type: string) => {
    return workTypes.find(wt => wt.value === type)?.label || type
  }

  const getExperienceLevelLabel = (level: string) => {
    const levels: Record<string, string> = {
      'entry': 'Giriş Seviyesi',
      'mid': 'Orta Seviye',
      'senior': 'Kıdemli',
      'lead': 'Lider',
      'executive': 'Yönetici'
    }
    return levels[level] || level
  }

  return (
    <div className="flex gap-8">
      {/* Left Sidebar - Filters */}
      <aside className="hidden lg:block w-72 flex-shrink-0">
        <div className="sticky top-24 bg-white rounded-xl border border-secondary-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-secondary-900">Filtrele</h3>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Temizle
              </button>
            )}
          </div>

          <div className="space-y-6">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-secondary-900 mb-2">
                Arama
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pozisyon veya şirket..."
                className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm text-secondary-900 placeholder:text-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* City Filter */}
            <div>
              <label className="block text-sm font-medium text-secondary-900 mb-2">
                Şehir
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Tüm Şehirler</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* Work Type Filter */}
            <div>
              <label className="block text-sm font-medium text-secondary-900 mb-2">
                Çalışma Şekli
              </label>
              <select
                value={selectedWorkType}
                onChange={(e) => setSelectedWorkType(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Tümü</option>
                {workTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* Experience Level Filter */}
            <div>
              <label className="block text-sm font-medium text-secondary-900 mb-2">
                Deneyim Seviyesi
              </label>
              <select
                value={selectedExperience}
                onChange={(e) => setSelectedExperience(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Tümü</option>
                {experienceLevels.map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Top Bar */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Results Count */}
          <p className="text-sm text-secondary-600">
            {filteredJobs.length} ilan bulundu
          </p>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-white border border-secondary-200 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid'
                  ? 'bg-primary-600 text-white'
                  : 'text-secondary-600 hover:text-secondary-900'
              }`}
            >
              <Grid3x3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list'
                  ? 'bg-primary-600 text-white'
                  : 'text-secondary-600 hover:text-secondary-900'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

      {/* Job Listings - Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredJobs.map((job) => (
            <Link
              key={job.id}
              href={`/ilan/${job.slug}`}
              className="group bg-white rounded-2xl border border-secondary-200 hover:shadow-xl transition-all overflow-hidden"
            >
              <div className="p-6">
                {/* Company Logo */}
                <div className="mb-4">
                  {job.companies?.logo_url ? (
                    <img
                      src={job.companies.logo_url}
                      alt={job.companies.name}
                      className="w-16 h-16 rounded-lg object-cover border border-secondary-200"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-secondary-100 border border-secondary-200 flex items-center justify-center">
                      <Building2 className="h-8 w-8 text-secondary-400" />
                    </div>
                  )}
                </div>

                <h2 className="text-lg font-semibold text-secondary-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                  {job.title}
                </h2>

                <p className="text-base text-secondary-600 mb-4">
                  {job.companies?.name || 'Şirket'}
                </p>

                <div className="flex items-center gap-4 text-sm text-secondary-500 mb-4">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    <span>{job.location_city}</span>
                  </div>
                  {job.published_at && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      <span>{formatRelativeTime(job.published_at)}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {job.categories && (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                      {job.categories.name}
                    </span>
                  )}
                  {job.work_type && (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700 border border-primary-200">
                      {getWorkTypeLabel(job.work_type)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Job Listings - List View */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <Link
              key={job.id}
              href={`/ilan/${job.slug}`}
              className="group bg-white rounded-xl border border-secondary-200 hover:shadow-lg transition-all overflow-hidden block"
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  {/* Company Logo */}
                  <div className="flex-shrink-0">
                    {job.companies?.logo_url ? (
                      <img
                        src={job.companies.logo_url}
                        alt={job.companies.name}
                        className="w-20 h-20 rounded-lg object-cover border border-secondary-200"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-secondary-100 border border-secondary-200 flex items-center justify-center">
                        <Building2 className="h-10 w-10 text-secondary-400" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-semibold text-secondary-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {job.title}
                    </h2>

                    <p className="text-base text-secondary-600 mb-3 font-medium">
                      {job.companies?.name || 'Şirket'}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-secondary-600 mb-3">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-secondary-500" />
                        <span>{job.location_city}</span>
                      </div>

                      {job.categories && (
                        <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                          {job.categories.name}
                        </span>
                      )}

                      {job.work_type && (
                        <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-secondary-100 text-secondary-700">
                          {getWorkTypeLabel(job.work_type)}
                        </span>
                      )}

                      {job.experience_level && (
                        <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-secondary-100 text-secondary-700">
                          {getExperienceLevelLabel(job.experience_level)}
                        </span>
                      )}

                      {job.show_salary && job.salary_min && job.salary_max && (
                        <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                          {job.salary_min.toLocaleString('tr-TR')} - {job.salary_max.toLocaleString('tr-TR')} {job.salary_currency}
                        </span>
                      )}

                      {job.published_at && (
                        <div className="flex items-center gap-1.5 text-secondary-500">
                          <Clock className="h-4 w-4" />
                          <span>{formatRelativeTime(job.published_at)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* No Results */}
      {filteredJobs.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-secondary-200">
          <p className="text-lg text-secondary-600 mb-4">Filtrelere uygun ilan bulunamadı.</p>
          <button
            onClick={clearAllFilters}
            className="text-primary-600 hover:text-primary-700 font-medium underline"
          >
            Tüm ilanları göster
          </button>
        </div>
      )}
      </div>
    </div>
  )
}
