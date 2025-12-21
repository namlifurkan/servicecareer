'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  User,
  MapPin,
  Briefcase,
  FileText,
  Upload,
  Loader2,
  ChefHat,
  Clock,
  Building,
  Star,
  ChevronDown,
  X,
  Globe
} from 'lucide-react'
import {
  JobPositionType,
  ShiftType,
  VenueType,
  CuisineType,
  ServiceExperienceLevel,
  JOB_POSITION_LABELS,
  SHIFT_TYPE_LABELS,
  VENUE_TYPE_LABELS,
  CUISINE_TYPE_LABELS,
  EXPERIENCE_LEVEL_LABELS,
  getPositionsGrouped,
} from '@/lib/types/service-industry'

interface CandidateProfileFormEnhancedProps {
  profile: any
  candidateProfile: any
}

export function CandidateProfileFormEnhanced({ profile, candidateProfile }: CandidateProfileFormEnhancedProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [activeSection, setActiveSection] = useState<'basic' | 'preferences' | 'work'>('basic')

  // Position selection state
  const [isPositionDropdownOpen, setIsPositionDropdownOpen] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])

  const [formData, setFormData] = useState({
    // Basic info
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    title: candidateProfile?.title || '',
    bio: candidateProfile?.bio || '',
    city: candidateProfile?.city || '',
    // Social links
    linkedin_url: candidateProfile?.linkedin_url || '',
    portfolio_url: candidateProfile?.portfolio_url || '',
    // Service industry specific - Preferences (matching DB column names)
    position_types: candidateProfile?.position_types || [],
    shift_preferences: candidateProfile?.shift_preferences || [],
    venue_types: candidateProfile?.venue_types || [],
    cuisine_specialties: candidateProfile?.cuisine_specialties || [],
    // Experience
    service_experience: candidateProfile?.service_experience || '',
    experience_years: candidateProfile?.experience_years || 0,
    // Work preferences
    available_from: candidateProfile?.available_from || '',
    expected_salary_min: candidateProfile?.expected_salary_min || '',
    expected_salary_max: candidateProfile?.expected_salary_max || '',
    // General skills (text)
    skills: candidateProfile?.skills?.join(', ') || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    const supabase = createClient()

    try {
      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
        })
        .eq('id', profile.id)

      if (profileError) throw profileError

      // Update candidate_profiles table
      const { error: candidateError } = await supabase
        .from('candidate_profiles')
        .update({
          title: formData.title,
          bio: formData.bio,
          city: formData.city,
          linkedin_url: formData.linkedin_url,
          portfolio_url: formData.portfolio_url,
          // Service industry fields (matching DB column names)
          position_types: formData.position_types,
          shift_preferences: formData.shift_preferences,
          venue_types: formData.venue_types,
          cuisine_specialties: formData.cuisine_specialties,
          service_experience: formData.service_experience || null,
          experience_years: formData.experience_years || null,
          available_from: formData.available_from || null,
          expected_salary_min: formData.expected_salary_min || null,
          expected_salary_max: formData.expected_salary_max || null,
          skills: formData.skills.split(',').map((s: string) => s.trim()).filter(Boolean),
        })
        .eq('id', profile.id)

      if (candidateError) throw candidateError

      setMessage({ type: 'success', text: 'Profil başarıyla güncellendi!' })
      setTimeout(() => window.location.reload(), 1500)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Dosya boyutu 2MB\'dan küçük olmalı' })
      return
    }

    setIsLoading(true)
    const supabase = createClient()

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${profile.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id)

      if (updateError) throw updateError

      setMessage({ type: 'success', text: 'Profil fotoğrafı güncellendi!' })
      setTimeout(() => window.location.reload(), 1500)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  // Multi-select handlers
  const togglePosition = (position: JobPositionType) => {
    const current = formData.position_types
    if (current.includes(position)) {
      setFormData({ ...formData, position_types: current.filter((p: string) => p !== position) })
    } else {
      setFormData({ ...formData, position_types: [...current, position] })
    }
  }

  const toggleShift = (shift: ShiftType) => {
    const current = formData.shift_preferences
    if (current.includes(shift)) {
      setFormData({ ...formData, shift_preferences: current.filter((s: string) => s !== shift) })
    } else {
      setFormData({ ...formData, shift_preferences: [...current, shift] })
    }
  }

  const toggleVenue = (venue: VenueType) => {
    const current = formData.venue_types
    if (current.includes(venue)) {
      setFormData({ ...formData, venue_types: current.filter((v: string) => v !== venue) })
    } else {
      setFormData({ ...formData, venue_types: [...current, venue] })
    }
  }

  const toggleCuisine = (cuisine: CuisineType) => {
    const current = formData.cuisine_specialties
    if (current.includes(cuisine)) {
      setFormData({ ...formData, cuisine_specialties: current.filter((c: string) => c !== cuisine) })
    } else {
      setFormData({ ...formData, cuisine_specialties: [...current, cuisine] })
    }
  }

  const toggleCategory = (category: string) => {
    if (expandedCategories.includes(category)) {
      setExpandedCategories(expandedCategories.filter(c => c !== category))
    } else {
      setExpandedCategories([...expandedCategories, category])
    }
  }

  const positionsGrouped = getPositionsGrouped()

  const sections = [
    { id: 'basic', label: 'Kişisel Bilgiler', icon: User },
    { id: 'preferences', label: 'İş Tercihleri', icon: Briefcase },
    { id: 'work', label: 'Çalışma Koşulları', icon: Clock },
  ] as const

  return (
    <div className="bg-white rounded-xl border border-secondary-200">
      {/* Section Tabs */}
      <div className="border-b border-secondary-200">
        <div className="flex overflow-x-auto">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeSection === section.id
                  ? 'text-primary-600 border-primary-600'
                  : 'text-secondary-600 border-transparent hover:text-secondary-900 hover:border-secondary-300'
              }`}
            >
              <section.icon className="h-4 w-4" />
              {section.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        {/* Section: Basic Info */}
        {activeSection === 'basic' && (
          <div className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex items-start gap-6">
              <div className="relative">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Profil"
                    className="w-24 h-24 rounded-full object-cover border-2 border-secondary-200"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center border-2 border-secondary-200">
                    <User className="h-12 w-12 text-primary-600" />
                  </div>
                )}
                <label className={`absolute bottom-0 right-0 p-2 text-white rounded-full shadow-lg transition-colors ${
                  isLoading
                    ? 'bg-secondary-400 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700 cursor-pointer'
                }`}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={isLoading}
                  />
                </label>
              </div>
              <div className="flex-1">
                <p className="font-medium text-secondary-900 mb-1">Profil Fotoğrafı</p>
                <p className="text-sm text-secondary-600 mb-2">
                  JPG, PNG veya WebP formatında, maksimum 2MB
                </p>
              </div>
            </div>

            {/* Basic Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-secondary-900 mb-2">
                  Ad Soyad *
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-900 mb-2">
                  Telefon
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="0555 123 4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-900 mb-2">
                  <Briefcase className="h-4 w-4 inline mr-1" />
                  Profesyonel Unvan
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Örn: Deneyimli Barista"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-900 mb-2">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Şehir
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="İstanbul"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-secondary-900 mb-2">
                <FileText className="h-4 w-4 inline mr-1" />
                Hakkımda
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 bg-white border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                placeholder="Kendinizi tanıtın, deneyimlerinizi ve hedeflerinizi paylaşın..."
              />
            </div>

            {/* Social Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-secondary-900 mb-2">
                  <Globe className="h-4 w-4 inline mr-1" />
                  LinkedIn Profili
                </label>
                <input
                  type="url"
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="https://linkedin.com/in/kullanici-adi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-900 mb-2">
                  Portfolio / Website
                </label>
                <input
                  type="url"
                  value={formData.portfolio_url}
                  onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="https://website.com"
                />
              </div>
            </div>
          </div>
        )}

        {/* Section: Job Preferences */}
        {activeSection === 'preferences' && (
          <div className="space-y-6">
            {/* Preferred Positions */}
            <div>
              <label className="block text-sm font-medium text-secondary-900 mb-2">
                <ChefHat className="h-4 w-4 inline mr-1" />
                Tercih Ettiğiniz Pozisyonlar
              </label>
              <p className="text-xs text-secondary-500 mb-3">
                Çalışmak istediğiniz pozisyonları seçin (birden fazla seçebilirsiniz)
              </p>

              {/* Selected Positions */}
              {formData.position_types.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.position_types.map((pos: JobPositionType) => (
                    <span
                      key={pos}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 text-sm rounded-full"
                    >
                      {JOB_POSITION_LABELS[pos]}
                      <button
                        type="button"
                        onClick={() => togglePosition(pos)}
                        className="hover:text-primary-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Position Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsPositionDropdownOpen(!isPositionDropdownOpen)}
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-secondary-200 rounded-lg hover:border-secondary-300 transition-colors text-left"
                >
                  <span className="text-secondary-600">
                    {formData.position_types.length > 0
                      ? `${formData.position_types.length} pozisyon seçildi`
                      : 'Pozisyon seçin...'}
                  </span>
                  <ChevronDown className={`h-5 w-5 text-secondary-400 transition-transform ${isPositionDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isPositionDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full max-h-80 overflow-y-auto bg-white border border-secondary-200 rounded-lg shadow-lg">
                    {positionsGrouped.map((group) => (
                      <div key={group.category} className="border-b border-secondary-100 last:border-0">
                        <button
                          type="button"
                          onClick={() => toggleCategory(group.category)}
                          className="w-full flex items-center justify-between px-4 py-2.5 bg-secondary-50 hover:bg-secondary-100 text-left"
                        >
                          <span className="font-medium text-secondary-900">{group.categoryLabel}</span>
                          <ChevronDown className={`h-4 w-4 text-secondary-400 transition-transform ${expandedCategories.includes(group.category) ? 'rotate-180' : ''}`} />
                        </button>

                        {expandedCategories.includes(group.category) && (
                          <div className="py-1">
                            {group.positions.map((position) => (
                              <label
                                key={position.value}
                                className="flex items-center gap-3 px-4 py-2 hover:bg-secondary-50 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={formData.position_types.includes(position.value)}
                                  onChange={() => togglePosition(position.value)}
                                  className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                                />
                                <span className="text-sm text-secondary-700">{position.label}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Experience Level */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-secondary-900 mb-2">
                  <Star className="h-4 w-4 inline mr-1" />
                  Deneyim Seviyesi
                </label>
                <select
                  value={formData.service_experience}
                  onChange={(e) => setFormData({ ...formData, service_experience: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Seçiniz...</option>
                  {Object.entries(EXPERIENCE_LEVEL_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-900 mb-2">
                  Toplam Tecrübe (Yıl)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={formData.experience_years}
                  onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 bg-white border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Preferred Shifts */}
            <div>
              <label className="block text-sm font-medium text-secondary-900 mb-2">
                <Clock className="h-4 w-4 inline mr-1" />
                Tercih Ettiğiniz Vardiyalar
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(SHIFT_TYPE_LABELS).map(([value, label]) => (
                  <label
                    key={value}
                    className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                      formData.shift_preferences.includes(value)
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-secondary-200 hover:border-secondary-300 text-secondary-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.shift_preferences.includes(value)}
                      onChange={() => toggleShift(value as ShiftType)}
                      className="hidden"
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Preferred Venue Types */}
            <div>
              <label className="block text-sm font-medium text-secondary-900 mb-2">
                <Building className="h-4 w-4 inline mr-1" />
                Tercih Ettiğiniz Mekan Türleri
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {Object.entries(VENUE_TYPE_LABELS).slice(0, 16).map(([value, label]) => (
                  <label
                    key={value}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors text-sm ${
                      formData.venue_types.includes(value)
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-secondary-200 hover:border-secondary-300 text-secondary-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.venue_types.includes(value)}
                      onChange={() => toggleVenue(value as VenueType)}
                      className="hidden"
                    />
                    <span className="truncate">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Cuisine Expertise */}
            <div>
              <label className="block text-sm font-medium text-secondary-900 mb-2">
                <ChefHat className="h-4 w-4 inline mr-1" />
                Mutfak Deneyiminiz
              </label>
              <p className="text-xs text-secondary-500 mb-3">
                Deneyim sahibi olduğunuz mutfak türlerini seçin
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {Object.entries(CUISINE_TYPE_LABELS).map(([value, label]) => (
                  <label
                    key={value}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors text-sm ${
                      formData.cuisine_specialties.includes(value)
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-secondary-200 hover:border-secondary-300 text-secondary-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.cuisine_specialties.includes(value)}
                      onChange={() => toggleCuisine(value as CuisineType)}
                      className="hidden"
                    />
                    <span className="truncate">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Section: Work Conditions */}
        {activeSection === 'work' && (
          <div className="space-y-6">
            {/* Availability */}
            <div>
              <label className="block text-sm font-medium text-secondary-900 mb-2">
                <Clock className="h-4 w-4 inline mr-1" />
                Ne Zaman Başlayabilirsiniz?
              </label>
              <input
                type="date"
                value={formData.available_from}
                onChange={(e) => setFormData({ ...formData, available_from: e.target.value })}
                className="w-full px-4 py-2 bg-white border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="text-xs text-secondary-500 mt-1">
                Boş bırakırsanız hemen başlayabileceğiniz anlaşılır
              </p>
            </div>

            {/* Expected Salary */}
            <div>
              <label className="block text-sm font-medium text-secondary-900 mb-2">
                Beklenen Maaş Aralığı (TL/Ay)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="number"
                    min="0"
                    value={formData.expected_salary_min}
                    onChange={(e) => setFormData({ ...formData, expected_salary_min: e.target.value })}
                    className="w-full px-4 py-2 bg-white border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Minimum"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    min="0"
                    value={formData.expected_salary_max}
                    onChange={(e) => setFormData({ ...formData, expected_salary_max: e.target.value })}
                    className="w-full px-4 py-2 bg-white border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Maksimum"
                  />
                </div>
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-secondary-900 mb-2">
                Diğer Yetenekler
              </label>
              <input
                type="text"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                className="w-full px-4 py-2 bg-white border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Virgülle ayırarak yaz: POS Kullanımı, İngilizce, Latte Art"
              />
              <p className="text-xs text-secondary-500 mt-1">
                Öne çıkan yeteneklerinizi virgülle ayırarak yazın
              </p>
            </div>
          </div>
        )}

        {/* Message */}
        {message && (
          <div className={`mt-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-accent-50 text-accent-700 border border-accent-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end mt-6 pt-6 border-t border-secondary-200">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-secondary-300 text-white font-medium rounded-lg transition-colors"
          >
            {isLoading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
          </button>
        </div>
      </form>
    </div>
  )
}
