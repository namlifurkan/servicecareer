'use client'

import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Clock, Grid3x3, List, X, Building2 } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import { MultiSelect, type MultiSelectOption } from '@/components/ui/multi-select'
import {
  CATEGORY_FILTERS,
  getCategorySlug,
  getFiltersForCategory,
  type FilterConfig,
  type CategoryAttributes
} from '@/lib/types/job-attributes'

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
  certifications: string[]
  vehicle_types: string[]
  languages: string[]
  shift_types: string[]
  category_attributes: CategoryAttributes
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
  categories: Array<{ id: string; name: string; slug: string }>
}

export function JobListingsClient({ jobs, categories }: JobListingsClientProps) {
  const searchParams = useSearchParams()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')

  // Filters - initialize from URL params
  const [selectedCity, setSelectedCity] = useState<string>('')
  const [selectedWorkType, setSelectedWorkType] = useState<string>('')
  const [selectedExperience, setSelectedExperience] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  // Category-specific attribute filters (multi-select)
  const [attributeFilters, setAttributeFilters] = useState<Record<string, string[]>>({})

  // Read URL parameters on mount
  useEffect(() => {
    const search = searchParams.get('search') || ''
    const city = searchParams.get('city') || ''
    const workType = searchParams.get('work_type') || ''
    const experience = searchParams.get('experience') || ''
    const category = searchParams.get('category') || ''

    setSearchQuery(search)
    setSelectedCity(city)
    setSelectedWorkType(workType)
    setSelectedExperience(experience)
    setSelectedCategory(category)
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

  // Get active category filters based on selected category
  const activeCategoryFilters = useMemo(() => {
    if (!selectedCategory) return []
    return getFiltersForCategory(selectedCategory)
  }, [selectedCategory])

  // Filter jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      // Basic filters
      const matchesCity = !selectedCity || job.location_city === selectedCity
      const matchesWorkType = !selectedWorkType || job.work_type === selectedWorkType
      const matchesExperience = !selectedExperience || job.experience_level === selectedExperience
      const matchesSearch = !searchQuery ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (job.companies?.name || '').toLowerCase().includes(searchQuery.toLowerCase())

      // Category filter
      const matchesCategory = !selectedCategory || job.categories?.slug === selectedCategory

      // Category-specific attribute filters
      let matchesAttributes = true
      if (selectedCategory && Object.keys(attributeFilters).length > 0) {
        for (const [filterKey, selectedValues] of Object.entries(attributeFilters)) {
          if (selectedValues.length === 0) continue

          // Check if this is a common attribute or category-specific
          if (filterKey === 'certifications' || filterKey === 'vehicle_types' ||
              filterKey === 'languages' || filterKey === 'shift_types') {
            // Common attributes stored as arrays in job table
            const jobValues = job[filterKey as keyof Job] as string[]
            if (!jobValues || !Array.isArray(jobValues)) {
              matchesAttributes = false
              break
            }
            // Check if any selected value is in job values
            const hasMatch = selectedValues.some(v => jobValues.includes(v))
            if (!hasMatch) {
              matchesAttributes = false
              break
            }
          } else {
            // Category-specific attributes in JSONB
            const categoryAttrs = job.category_attributes || {}
            const jobValues = categoryAttrs[filterKey as keyof CategoryAttributes] as string[] | undefined
            if (!jobValues || !Array.isArray(jobValues)) {
              matchesAttributes = false
              break
            }
            // Check if any selected value is in job values
            const hasMatch = selectedValues.some(v => jobValues.includes(v))
            if (!hasMatch) {
              matchesAttributes = false
              break
            }
          }
        }
      }

      return matchesCity && matchesWorkType && matchesExperience &&
             matchesSearch && matchesCategory && matchesAttributes
    })
  }, [jobs, selectedCity, selectedWorkType, selectedExperience, searchQuery,
      selectedCategory, attributeFilters])

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (selectedCity) count++
    if (selectedWorkType) count++
    if (selectedExperience) count++
    if (searchQuery) count++
    if (selectedCategory) count++
    count += Object.values(attributeFilters).reduce((sum, values) => sum + values.length, 0)
    return count
  }, [selectedCity, selectedWorkType, selectedExperience, searchQuery, selectedCategory, attributeFilters])

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedCity('')
    setSelectedWorkType('')
    setSelectedExperience('')
    setSearchQuery('')
    setSelectedCategory('')
    setAttributeFilters({})
  }

  // Handle attribute filter change
  const handleAttributeFilterChange = (filterKey: string, values: string[]) => {
    setAttributeFilters(prev => ({
      ...prev,
      [filterKey]: values
    }))
  }

  // Clear category and its filters
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setAttributeFilters({}) // Clear all attribute filters when category changes
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
                Temizle ({activeFiltersCount})
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

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-secondary-900 mb-2">
                Kategori
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Tüm Kategoriler</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
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

            {/* Category-Specific Attribute Filters */}
            {selectedCategory && activeCategoryFilters.length > 0 && (
              <>
                <div className="border-t border-secondary-200 pt-6">
                  <h4 className="text-sm font-semibold text-secondary-900 mb-4">
                    Özel Filtreler
                  </h4>
                  <div className="space-y-4">
                    {activeCategoryFilters
                      .filter(filter => filter.priority === 'high' || filter.priority === 'medium')
                      .map((filter) => (
                        <MultiSelect
                          key={filter.key}
                          label={filter.label}
                          options={filter.options}
                          value={attributeFilters[filter.key] || []}
                          onChange={(values) => handleAttributeFilterChange(filter.key, values)}
                          placeholder={`${filter.label} seçin...`}
                        />
                      ))}
                  </div>
                </div>
              </>
            )}
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
                    <Image
                      src={job.companies.logo_url}
                      alt={`${job.companies.name} logosu`}
                      width={64}
                      height={64}
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
                      <Image
                        src={job.companies.logo_url}
                        alt={`${job.companies.name} logosu`}
                        width={80}
                        height={80}
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
