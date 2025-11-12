'use client'

import { useState } from 'react'
import { Search, MapPin, Briefcase, Clock, GraduationCap, DollarSign } from 'lucide-react'

interface JobFilters {
  search?: string
  city?: string
  workType?: string
  experienceLevel?: string
  educationLevel?: string
  salaryMin?: number
  isRemote?: boolean
}

interface JobFiltersProps {
  onFiltersChange: (filters: JobFilters) => void
  initialFilters?: JobFilters
}

export function JobFiltersComponent({ onFiltersChange, initialFilters = {} }: JobFiltersProps) {
  const [filters, setFilters] = useState<JobFilters>(initialFilters)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleFilterChange = (key: keyof JobFilters, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    setFilters({})
    onFiltersChange({})
  }

  const cities = [
    'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya',
    'Adana', 'Gaziantep', 'Konya', 'Kayseri', 'Mersin'
  ]

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

  const educationLevels = [
    { value: 'high_school', label: 'Lise' },
    { value: 'associate', label: 'Ön Lisans' },
    { value: 'bachelor', label: 'Lisans' },
    { value: 'master', label: 'Yüksek Lisans' },
    { value: 'doctorate', label: 'Doktora' },
  ]

  return (
    <div className="bg-white rounded-lg border border-secondary-200 shadow-sm">
      {/* Primary Search Bar */}
      <div className="p-6 border-b border-secondary-100">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" />
            <input
              type="text"
              placeholder="Pozisyon, şirket veya anahtar kelime ara..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Location Select */}
          <div className="md:w-64 relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" />
            <select
              value={filters.city || ''}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all appearance-none bg-white"
            >
              <option value="">Tüm Şehirler</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-6 py-3 bg-secondary-100 text-secondary-700 font-medium rounded-lg hover:bg-secondary-200 transition-colors whitespace-nowrap"
          >
            {isExpanded ? 'Filtreleri Gizle' : 'Gelişmiş Filtreler'}
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {isExpanded && (
        <div className="p-6 bg-secondary-50 border-t border-secondary-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Work Type */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-secondary-700 mb-2">
                <Briefcase className="h-4 w-4" />
                Çalışma Şekli
              </label>
              <select
                value={filters.workType || ''}
                onChange={(e) => handleFilterChange('workType', e.target.value)}
                className="w-full px-4 py-2.5 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
              >
                <option value="">Tümü</option>
                {workTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Experience Level */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-secondary-700 mb-2">
                <Clock className="h-4 w-4" />
                Deneyim Seviyesi
              </label>
              <select
                value={filters.experienceLevel || ''}
                onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
                className="w-full px-4 py-2.5 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
              >
                <option value="">Tümü</option>
                {experienceLevels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Education Level */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-secondary-700 mb-2">
                <GraduationCap className="h-4 w-4" />
                Eğitim Seviyesi
              </label>
              <select
                value={filters.educationLevel || ''}
                onChange={(e) => handleFilterChange('educationLevel', e.target.value)}
                className="w-full px-4 py-2.5 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
              >
                <option value="">Tümü</option>
                {educationLevels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Minimum Salary */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-secondary-700 mb-2">
                <DollarSign className="h-4 w-4" />
                Minimum Maaş (TL)
              </label>
              <input
                type="number"
                placeholder="Örn: 15000"
                value={filters.salaryMin || ''}
                onChange={(e) => handleFilterChange('salaryMin', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-4 py-2.5 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Remote Work */}
            <div className="flex items-end">
              <label className="flex items-center gap-3 cursor-pointer py-2.5">
                <input
                  type="checkbox"
                  checked={filters.isRemote || false}
                  onChange={(e) => handleFilterChange('isRemote', e.target.checked)}
                  className="w-5 h-5 text-primary-600 border-secondary-300 rounded focus:ring-primary-500 focus:ring-2"
                />
                <span className="text-sm font-medium text-secondary-700">
                  Uzaktan Çalışma
                </span>
              </label>
            </div>

            {/* Clear Filters Button */}
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2.5 text-sm font-medium text-accent-600 hover:text-accent-700 border border-accent-200 rounded-lg hover:bg-accent-50 transition-colors"
              >
                Filtreleri Temizle
              </button>
            </div>
          </div>

          {/* Active Filters Summary */}
          {Object.keys(filters).length > 0 && (
            <div className="mt-6 pt-6 border-t border-secondary-200">
              <p className="text-sm text-secondary-600">
                <span className="font-medium">{Object.keys(filters).length}</span> filtre aktif
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
