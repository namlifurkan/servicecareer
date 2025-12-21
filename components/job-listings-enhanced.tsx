'use client'

import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  MapPin,
  Clock,
  Grid3x3,
  List,
  X,
  Building2,
  Filter,
  ChevronDown,
  Utensils,
  Briefcase,
  AlertCircle,
  Shirt,
  Coins,
  Search,
  SlidersHorizontal,
  Check,
  CheckCircle2,
} from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import {
  type JobPositionType,
  type ShiftType,
  type ServiceExperienceLevel,
  type VenueType,
  type CuisineType,
  JOB_POSITION_LABELS,
  SHIFT_TYPE_LABELS,
  EXPERIENCE_LEVEL_LABELS,
  VENUE_TYPE_LABELS,
  CUISINE_TYPE_LABELS,
  getPositionsGrouped,
} from '@/lib/types/service-industry'

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
  position_type: JobPositionType | null
  venue_type: VenueType | null
  shift_types: ShiftType[] | null
  cuisine_types: CuisineType[] | null
  service_experience_required: ServiceExperienceLevel | null
  is_urgent: boolean
  uniform_policy: string | null
  meal_policy: string | null
  tip_policy: string | null
  benefits: string[] | null
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

interface JobListingsEnhancedProps {
  jobs: Job[]
  categories: Array<{ id: string; name: string; slug: string }>
  initialCity?: string
}

export function JobListingsEnhanced({
  jobs,
  categories,
  initialCity,
}: JobListingsEnhancedProps) {
  const searchParams = useSearchParams()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'position',
    'location',
    'experience',
  ])

  // Filters
  const [selectedCity, setSelectedCity] = useState<string>(initialCity || '')
  const [selectedPositionTypes, setSelectedPositionTypes] = useState<JobPositionType[]>([])
  const [selectedShiftTypes, setSelectedShiftTypes] = useState<ShiftType[]>([])
  const [selectedVenueTypes, setSelectedVenueTypes] = useState<VenueType[]>([])
  const [selectedCuisineTypes, setSelectedCuisineTypes] = useState<CuisineType[]>([])
  const [selectedExperience, setSelectedExperience] = useState<ServiceExperienceLevel | ''>('')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [showUrgentOnly, setShowUrgentOnly] = useState(false)
  const [salaryMin, setSalaryMin] = useState<string>('')

  // Read URL parameters on mount
  useEffect(() => {
    const search = searchParams.get('search') || ''
    const city = searchParams.get('city') || initialCity || ''
    const category = searchParams.get('category') || ''
    const position = searchParams.get('position') || ''
    const experience = searchParams.get('experience') || ''
    const urgent = searchParams.get('urgent') || ''

    setSearchQuery(search)
    setSelectedCity(city)
    setSelectedCategory(category)
    if (position) {
      setSelectedPositionTypes([position as JobPositionType])
    }
    if (experience) {
      setSelectedExperience(experience as ServiceExperienceLevel)
    }
    if (urgent === 'true') {
      setShowUrgentOnly(true)
    }
  }, [searchParams, initialCity])

  // Get unique cities from jobs
  const cities = useMemo(() => {
    const uniqueCities = Array.from(
      new Set(jobs.map((job) => job.location_city).filter(Boolean))
    )
    return uniqueCities.sort()
  }, [jobs])

  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    )
  }

  // Toggle array filter
  const toggleArrayFilter = <T extends string>(
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    value: T
  ) => {
    setter((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )
  }

  // Filter jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        !searchQuery ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (job.companies?.name || '').toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCity = !selectedCity || job.location_city === selectedCity
      const matchesCategory = !selectedCategory || job.categories?.slug === selectedCategory
      const matchesPosition =
        selectedPositionTypes.length === 0 ||
        (job.position_type && selectedPositionTypes.includes(job.position_type))
      const matchesShift =
        selectedShiftTypes.length === 0 ||
        (job.shift_types && job.shift_types.some((s) => selectedShiftTypes.includes(s)))
      const matchesVenue =
        selectedVenueTypes.length === 0 ||
        (job.venue_type && selectedVenueTypes.includes(job.venue_type))
      const matchesCuisine =
        selectedCuisineTypes.length === 0 ||
        (job.cuisine_types && job.cuisine_types.some((c) => selectedCuisineTypes.includes(c)))
      const matchesExperience =
        !selectedExperience ||
        job.service_experience_required === selectedExperience ||
        job.experience_level === selectedExperience
      const matchesUrgent = !showUrgentOnly || job.is_urgent
      const matchesSalary =
        !salaryMin || (job.salary_min && job.salary_min >= parseInt(salaryMin))

      return (
        matchesSearch &&
        matchesCity &&
        matchesCategory &&
        matchesPosition &&
        matchesShift &&
        matchesVenue &&
        matchesCuisine &&
        matchesExperience &&
        matchesUrgent &&
        matchesSalary
      )
    })
  }, [
    jobs,
    searchQuery,
    selectedCity,
    selectedCategory,
    selectedPositionTypes,
    selectedShiftTypes,
    selectedVenueTypes,
    selectedCuisineTypes,
    selectedExperience,
    showUrgentOnly,
    salaryMin,
  ])

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (selectedCity) count++
    if (searchQuery) count++
    if (selectedCategory) count++
    if (selectedExperience) count++
    if (showUrgentOnly) count++
    if (salaryMin) count++
    count += selectedPositionTypes.length
    count += selectedShiftTypes.length
    count += selectedVenueTypes.length
    count += selectedCuisineTypes.length
    return count
  }, [
    selectedCity,
    searchQuery,
    selectedCategory,
    selectedPositionTypes,
    selectedShiftTypes,
    selectedVenueTypes,
    selectedCuisineTypes,
    selectedExperience,
    showUrgentOnly,
    salaryMin,
  ])

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedCity('')
    setSearchQuery('')
    setSelectedCategory('')
    setSelectedPositionTypes([])
    setSelectedShiftTypes([])
    setSelectedVenueTypes([])
    setSelectedCuisineTypes([])
    setSelectedExperience('')
    setShowUrgentOnly(false)
    setSalaryMin('')
  }

  const positionGroups = getPositionsGrouped()

  // Filter content (shared between desktop and mobile)
  const FilterContent = () => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-2">
          Arama
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pozisyon veya şirket..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-secondary-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow"
          />
        </div>
      </div>

      {/* Urgent Toggle */}
      <button
        onClick={() => setShowUrgentOnly(!showUrgentOnly)}
        className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
          showUrgentOnly
            ? 'bg-red-50 border-red-200 text-red-700'
            : 'bg-white border-secondary-200 text-secondary-700 hover:border-secondary-300'
        }`}
      >
        <div className="flex items-center gap-2">
          <AlertCircle className={`h-4 w-4 ${showUrgentOnly ? 'text-red-500' : 'text-secondary-400'}`} />
          <span className="text-sm font-medium">Sadece Acil İlanlar</span>
        </div>
        <div className={`w-5 h-5 rounded flex items-center justify-center ${
          showUrgentOnly ? 'bg-red-500' : 'border border-secondary-300'
        }`}>
          {showUrgentOnly && <Check className="h-3.5 w-3.5 text-white" />}
        </div>
      </button>

      {/* City Select */}
      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-2">
          Şehir
        </label>
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="w-full px-3 py-2.5 bg-white border border-secondary-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none cursor-pointer"
          style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
        >
          <option value="">Tüm Şehirler</option>
          {cities.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>

      {/* Category Select */}
      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-2">
          Kategori
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full px-3 py-2.5 bg-white border border-secondary-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none cursor-pointer"
          style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
        >
          <option value="">Tüm Kategoriler</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Position Types */}
      <div>
        <button
          onClick={() => toggleSection('position')}
          className="w-full flex items-center justify-between py-2"
        >
          <span className="text-sm font-medium text-secondary-700">Pozisyon</span>
          <ChevronDown className={`h-4 w-4 text-secondary-400 transition-transform ${
            expandedSections.includes('position') ? 'rotate-180' : ''
          }`} />
        </button>
        {expandedSections.includes('position') && (
          <div className="mt-2 space-y-3 max-h-64 overflow-y-auto">
            {positionGroups.slice(0, 4).map((group) => (
              <div key={group.category}>
                <p className="text-xs font-medium text-secondary-400 uppercase tracking-wider mb-2">
                  {group.categoryLabel}
                </p>
                <div className="space-y-1">
                  {group.positions.slice(0, 5).map((pos) => (
                    <label
                      key={pos.value}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                        selectedPositionTypes.includes(pos.value)
                          ? 'bg-primary-50'
                          : 'hover:bg-secondary-50'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        selectedPositionTypes.includes(pos.value)
                          ? 'bg-primary-600 border-primary-600'
                          : 'border-secondary-300'
                      }`}>
                        {selectedPositionTypes.includes(pos.value) && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <span className={`text-sm ${
                        selectedPositionTypes.includes(pos.value)
                          ? 'text-primary-700 font-medium'
                          : 'text-secondary-700'
                      }`}>
                        {pos.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Experience Level */}
      <div>
        <button
          onClick={() => toggleSection('experience')}
          className="w-full flex items-center justify-between py-2"
        >
          <span className="text-sm font-medium text-secondary-700">Deneyim</span>
          <ChevronDown className={`h-4 w-4 text-secondary-400 transition-transform ${
            expandedSections.includes('experience') ? 'rotate-180' : ''
          }`} />
        </button>
        {expandedSections.includes('experience') && (
          <div className="mt-2 space-y-1">
            {Object.entries(EXPERIENCE_LEVEL_LABELS).map(([value, label]) => (
              <label
                key={value}
                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                  selectedExperience === value
                    ? 'bg-primary-50'
                    : 'hover:bg-secondary-50'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                  selectedExperience === value
                    ? 'border-primary-600'
                    : 'border-secondary-300'
                }`}>
                  {selectedExperience === value && (
                    <div className="w-2 h-2 rounded-full bg-primary-600" />
                  )}
                </div>
                <span className={`text-sm ${
                  selectedExperience === value
                    ? 'text-primary-700 font-medium'
                    : 'text-secondary-700'
                }`}>
                  {label}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Shift Types */}
      <div>
        <button
          onClick={() => toggleSection('shift')}
          className="w-full flex items-center justify-between py-2"
        >
          <span className="text-sm font-medium text-secondary-700">Vardiya</span>
          <ChevronDown className={`h-4 w-4 text-secondary-400 transition-transform ${
            expandedSections.includes('shift') ? 'rotate-180' : ''
          }`} />
        </button>
        {expandedSections.includes('shift') && (
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.entries(SHIFT_TYPE_LABELS).map(([value, label]) => (
              <button
                key={value}
                onClick={() => toggleArrayFilter(setSelectedShiftTypes, value as ShiftType)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  selectedShiftTypes.includes(value as ShiftType)
                    ? 'bg-primary-600 text-white'
                    : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Venue Types */}
      <div>
        <button
          onClick={() => toggleSection('venue')}
          className="w-full flex items-center justify-between py-2"
        >
          <span className="text-sm font-medium text-secondary-700">Mekan Türü</span>
          <ChevronDown className={`h-4 w-4 text-secondary-400 transition-transform ${
            expandedSections.includes('venue') ? 'rotate-180' : ''
          }`} />
        </button>
        {expandedSections.includes('venue') && (
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.entries(VENUE_TYPE_LABELS).slice(0, 12).map(([value, label]) => (
              <button
                key={value}
                onClick={() => toggleArrayFilter(setSelectedVenueTypes, value as VenueType)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  selectedVenueTypes.includes(value as VenueType)
                    ? 'bg-primary-600 text-white'
                    : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Minimum Salary */}
      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-2">
          Minimum Maaş
        </label>
        <div className="relative">
          <input
            type="number"
            value={salaryMin}
            onChange={(e) => setSalaryMin(e.target.value)}
            placeholder="Örn: 25000"
            className="w-full px-3 py-2.5 bg-white border border-secondary-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 pr-12"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-secondary-400">TL</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 flex-shrink-0">
        <div className="sticky top-24">
          <div className="bg-white rounded-xl border border-secondary-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-secondary-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-primary-600" />
                <span className="font-semibold text-secondary-900">Filtreler</span>
              </div>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Temizle
                </button>
              )}
            </div>

            {/* Filter Content */}
            <div className="p-4 max-h-[calc(100vh-180px)] overflow-y-auto">
              <FilterContent />
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Filter Button */}
      <button
        onClick={() => setShowMobileFilters(true)}
        className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 px-6 py-3 bg-secondary-900 text-white rounded-full shadow-xl flex items-center gap-2 hover:bg-secondary-800 transition-colors"
      >
        <Filter className="h-5 w-5" />
        <span className="font-medium">Filtreler</span>
        {activeFiltersCount > 0 && (
          <span className="w-6 h-6 bg-primary-500 rounded-full text-sm flex items-center justify-center font-semibold">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {/* Mobile Filter Sheet */}
      {showMobileFilters && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowMobileFilters(false)}
          />

          {/* Sheet */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[85vh] overflow-hidden animate-slide-up">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-secondary-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-3 border-b border-secondary-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-primary-600" />
                <span className="font-semibold text-secondary-900">Filtreler</span>
                {activeFiltersCount > 0 && (
                  <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                    {activeFiltersCount}
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-secondary-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto max-h-[calc(85vh-140px)]">
              <FilterContent />
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-secondary-100 bg-white">
              <div className="flex gap-3">
                <button
                  onClick={clearAllFilters}
                  className="flex-1 px-4 py-3 border border-secondary-200 text-secondary-700 rounded-xl font-medium hover:bg-secondary-50 transition-colors"
                >
                  Temizle
                </button>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
                >
                  {filteredJobs.length} İlan Göster
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Top Bar */}
        <div className="mb-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <p className="text-secondary-900">
              <span className="font-semibold">{filteredJobs.length}</span>{' '}
              <span className="text-secondary-600">ilan bulundu</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-secondary-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-secondary-900 shadow-sm'
                    : 'text-secondary-500 hover:text-secondary-700'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-secondary-900 shadow-sm'
                    : 'text-secondary-500 hover:text-secondary-700'
                }`}
              >
                <Grid3x3 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-sm text-secondary-500">Aktif filtreler:</span>
            {selectedCity && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary-100 text-secondary-700 rounded-full text-sm">
                <MapPin className="h-3 w-3" />
                {selectedCity}
                <button onClick={() => setSelectedCity('')} className="hover:text-secondary-900">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {showUrgentOnly && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                <AlertCircle className="h-3 w-3" />
                Acil
                <button onClick={() => setShowUrgentOnly(false)} className="hover:text-red-900">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {selectedPositionTypes.map((pos) => (
              <span key={pos} className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                {JOB_POSITION_LABELS[pos]}
                <button
                  onClick={() => setSelectedPositionTypes((prev) => prev.filter((p) => p !== pos))}
                  className="hover:text-primary-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {selectedShiftTypes.map((shift) => (
              <span key={shift} className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary-100 text-secondary-700 rounded-full text-sm">
                {SHIFT_TYPE_LABELS[shift]}
                <button
                  onClick={() => setSelectedShiftTypes((prev) => prev.filter((s) => s !== shift))}
                  className="hover:text-secondary-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {selectedExperience && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary-100 text-secondary-700 rounded-full text-sm">
                {EXPERIENCE_LEVEL_LABELS[selectedExperience]}
                <button onClick={() => setSelectedExperience('')} className="hover:text-secondary-900">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            <button
              onClick={clearAllFilters}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium ml-2"
            >
              Tümünü temizle
            </button>
          </div>
        )}

        {/* Job Listings - Grid View */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredJobs.map((job) => (
              <Link
                key={job.id}
                href={`/ilan/${job.slug}`}
                className="group bg-white rounded-xl border border-secondary-200 hover:border-primary-200 hover:shadow-lg transition-all p-5"
              >
                {/* Urgent Badge */}
                {job.is_urgent && (
                  <div className="mb-3">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                      <AlertCircle className="h-3 w-3" />
                      ACİL
                    </span>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  {/* Company Logo */}
                  {job.companies?.logo_url ? (
                    <img
                      src={job.companies.logo_url}
                      alt={job.companies.name}
                      className="w-12 h-12 rounded-lg object-cover border border-secondary-100 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-secondary-100 flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-6 w-6 text-secondary-400" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                      {job.title}
                    </h2>
                    <p className="text-sm text-secondary-600 truncate">
                      {job.companies?.name || 'Şirket'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm text-secondary-500">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span>{job.location_city}</span>
                  {job.published_at && (
                    <>
                      <span className="text-secondary-300">·</span>
                      <span>{formatRelativeTime(job.published_at)}</span>
                    </>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {job.position_type && (
                    <span className="px-2 py-1 text-xs font-medium bg-primary-50 text-primary-700 rounded">
                      {JOB_POSITION_LABELS[job.position_type]}
                    </span>
                  )}
                  {job.venue_type && (
                    <span className="px-2 py-1 text-xs font-medium bg-secondary-100 text-secondary-600 rounded">
                      {VENUE_TYPE_LABELS[job.venue_type]}
                    </span>
                  )}
                </div>

                {/* Benefits & Salary */}
                <div className="mt-3 pt-3 border-t border-secondary-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {((job.meal_policy && job.meal_policy !== 'none' && job.meal_policy !== 'not_provided') || job.benefits?.includes('Yemek')) && (
                      <span title="Yemek"><Utensils className="h-4 w-4 text-orange-500" /></span>
                    )}
                    {((job.tip_policy && job.tip_policy !== 'no_tips') || job.benefits?.includes('Bahşiş')) && (
                      <span title="Bahşiş"><Coins className="h-4 w-4 text-green-500" /></span>
                    )}
                    {job.uniform_policy && job.uniform_policy !== 'none' && (
                      <span title="Üniforma"><Shirt className="h-4 w-4 text-blue-500" /></span>
                    )}
                    {job.benefits?.includes('Sağlık Sigortası') && (
                      <span title="Sigorta"><CheckCircle2 className="h-4 w-4 text-purple-500" /></span>
                    )}
                  </div>
                  {job.show_salary && job.salary_min && (
                    <p className="text-sm font-semibold text-green-600">
                      {job.salary_min.toLocaleString('tr-TR')} TL
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Job Listings - List View */}
        {viewMode === 'list' && (
          <div className="space-y-3">
            {filteredJobs.map((job) => (
              <Link
                key={job.id}
                href={`/ilan/${job.slug}`}
                className="group bg-white rounded-xl border border-secondary-200 hover:border-primary-200 hover:shadow-md transition-all block p-4"
              >
                <div className="flex items-center gap-4">
                  {/* Company Logo */}
                  {job.companies?.logo_url ? (
                    <img
                      src={job.companies.logo_url}
                      alt={job.companies.name}
                      className="w-14 h-14 rounded-lg object-cover border border-secondary-100 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-secondary-100 flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-7 w-7 text-secondary-400" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors">
                            {job.title}
                          </h2>
                          {job.is_urgent && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
                              <AlertCircle className="h-3 w-3" />
                              ACİL
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-secondary-600">
                          {job.companies?.name || 'Şirket'}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-secondary-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {job.location_city}
                          </span>
                          {job.position_type && (
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-primary-50 text-primary-700">
                              {JOB_POSITION_LABELS[job.position_type]}
                            </span>
                          )}
                          {job.shift_types && job.shift_types[0] && (
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-secondary-100 text-secondary-600">
                              {SHIFT_TYPE_LABELS[job.shift_types[0]]}
                            </span>
                          )}
                          {/* Benefits */}
                          <span className="flex items-center gap-1.5">
                            {((job.meal_policy && job.meal_policy !== 'none' && job.meal_policy !== 'not_provided') || job.benefits?.includes('Yemek')) && (
                              <span title="Yemek"><Utensils className="h-3.5 w-3.5 text-orange-500" /></span>
                            )}
                            {((job.tip_policy && job.tip_policy !== 'no_tips') || job.benefits?.includes('Bahşiş')) && (
                              <span title="Bahşiş"><Coins className="h-3.5 w-3.5 text-green-500" /></span>
                            )}
                            {job.benefits?.includes('Sağlık Sigortası') && (
                              <span title="Sigorta"><CheckCircle2 className="h-3.5 w-3.5 text-purple-500" /></span>
                            )}
                          </span>
                          {job.published_at && (
                            <span className="flex items-center gap-1 text-secondary-400">
                              <Clock className="h-3.5 w-3.5" />
                              {formatRelativeTime(job.published_at)}
                            </span>
                          )}
                        </div>
                      </div>

                      {job.show_salary && job.salary_min && (
                        <div className="text-right flex-shrink-0">
                          <p className="font-semibold text-green-600">
                            {job.salary_min.toLocaleString('tr-TR')} TL
                          </p>
                          {job.salary_max && job.salary_max !== job.salary_min && (
                            <p className="text-xs text-secondary-500">
                              - {job.salary_max.toLocaleString('tr-TR')} TL
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* No Results */}
        {filteredJobs.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-secondary-200">
            <div className="w-16 h-16 mx-auto mb-4 bg-secondary-100 rounded-full flex items-center justify-center">
              <Briefcase className="h-8 w-8 text-secondary-400" />
            </div>
            <p className="text-lg text-secondary-900 font-medium mb-2">
              Sonuç bulunamadı
            </p>
            <p className="text-sm text-secondary-600 mb-4">
              Farklı filtreler deneyebilirsiniz
            </p>
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Filtreleri Temizle
            </button>
          </div>
        )}
      </div>

      {/* CSS for mobile animation */}
      <style jsx global>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
