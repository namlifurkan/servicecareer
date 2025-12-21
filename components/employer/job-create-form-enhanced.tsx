'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Briefcase,
  MapPin,
  FileText,
  DollarSign,
  Eye,
  Check,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Save,
  Clock,
  Award,
  Utensils,
  Building2,
  ChevronDown,
} from 'lucide-react'

// Import service industry types
import {
  type JobPositionType,
  type ShiftType,
  type ServiceExperienceLevel,
  type VenueType,
  type CuisineType,
  type CertificateType,
  type UniformPolicy,
  type MealPolicy,
  type TipPolicy,
  type WorkingDays,
  type SalaryPaymentType,
  type BenefitType,
  JOB_POSITION_LABELS,
  SHIFT_TYPE_LABELS,
  EXPERIENCE_LEVEL_LABELS,
  VENUE_TYPE_LABELS,
  CUISINE_TYPE_LABELS,
  CERTIFICATE_TYPE_LABELS,
  UNIFORM_POLICY_LABELS,
  MEAL_POLICY_LABELS,
  TIP_POLICY_LABELS,
  WORKING_DAYS_LABELS,
  SALARY_PAYMENT_TYPE_LABELS,
  BENEFIT_TYPE_LABELS,
  getPositionsGrouped,
} from '@/lib/types/service-industry'

interface JobCreateFormProps {
  companyId: string
  categories: { id: string; name: string }[]
  cities: { id: string; name: string }[]
}

interface District {
  id: string
  name: string
  slug: string
  city_id: string
}

interface FormData {
  // Step 1: Basic Info
  title: string
  position_type: JobPositionType | ''
  venue_type: VenueType | ''
  category_id: string
  city_id: string
  district_id: string
  address: string

  // Step 2: Schedule & Requirements
  shift_types: ShiftType[]
  working_days: WorkingDays | ''
  experience_level: ServiceExperienceLevel | ''
  required_certificates: CertificateType[]
  age_min: string
  age_max: string
  gender_preference: 'any' | 'male' | 'female'
  military_status: '' | 'completed' | 'exempt' | 'not_required'

  // Step 3: Cuisine & Skills
  cuisine_types: CuisineType[]
  languages_required: string[]
  skills_required: string[]

  // Step 4: Salary & Benefits
  salary_min: string
  salary_max: string
  salary_payment_type: SalaryPaymentType
  show_salary: boolean
  benefits: BenefitType[]
  uniform_policy: UniformPolicy | ''
  meal_policy: MealPolicy | ''
  tip_policy: TipPolicy | ''
  has_accommodation: boolean

  // Step 5: Description
  description: string
  responsibilities: string
  requirements: string
  additional_info: string

  // Meta
  status: 'draft' | 'active'
  is_urgent: boolean
}

export function JobCreateFormEnhanced({
  companyId,
  categories,
  cities,
}: JobCreateFormProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [districts, setDistricts] = useState<District[]>([])
  const [loadingDistricts, setLoadingDistricts] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])

  const [formData, setFormData] = useState<FormData>({
    // Step 1
    title: '',
    position_type: '',
    venue_type: '',
    category_id: '',
    city_id: '',
    district_id: '',
    address: '',
    // Step 2
    shift_types: [],
    working_days: '',
    experience_level: '',
    required_certificates: [],
    age_min: '',
    age_max: '',
    gender_preference: 'any',
    military_status: '',
    // Step 3
    cuisine_types: [],
    languages_required: [],
    skills_required: [],
    // Step 4
    salary_min: '',
    salary_max: '',
    salary_payment_type: 'monthly',
    show_salary: false,
    benefits: [],
    uniform_policy: '',
    meal_policy: '',
    tip_policy: '',
    has_accommodation: false,
    // Step 5
    description: '',
    responsibilities: '',
    requirements: '',
    additional_info: '',
    // Meta
    status: 'draft',
    is_urgent: false,
  })

  // Fetch districts when city changes
  useEffect(() => {
    const fetchDistricts = async () => {
      if (!formData.city_id) {
        setDistricts([])
        return
      }

      setLoadingDistricts(true)
      const supabase = createClient()

      try {
        const { data, error } = await supabase
          .from('districts')
          .select('id, name, slug, city_id')
          .eq('city_id', formData.city_id)
          .order('name', { ascending: true })

        if (error) throw error
        setDistricts(data || [])
      } catch (err) {
        console.error('Error fetching districts:', err)
        setDistricts([])
      } finally {
        setLoadingDistricts(false)
      }
    }

    fetchDistricts()
    setFormData((prev) => ({ ...prev, district_id: '' }))
  }, [formData.city_id])

  // Auto-fill title when position type is selected
  useEffect(() => {
    if (formData.position_type && !formData.title) {
      setFormData((prev) => ({
        ...prev,
        title: JOB_POSITION_LABELS[formData.position_type as JobPositionType],
      }))
    }
  }, [formData.position_type])

  const steps = [
    { number: 1, title: 'Temel Bilgiler', icon: Briefcase },
    { number: 2, title: 'Çalışma Koşulları', icon: Clock },
    { number: 3, title: 'Beceri & Dil', icon: Award },
    { number: 4, title: 'Maaş & Haklar', icon: DollarSign },
    { number: 5, title: 'Açıklama', icon: FileText },
    { number: 6, title: 'Önizleme', icon: Eye },
  ]

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev) => ({ ...prev, [name]: checked }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleArrayToggle = <T extends string>(
    field: keyof FormData,
    value: T
  ) => {
    setFormData((prev) => {
      const currentArray = prev[field] as T[]
      const newArray = currentArray.includes(value)
        ? currentArray.filter((v) => v !== value)
        : [...currentArray, value]
      return { ...prev, [field]: newArray }
    })
  }

  const validateStep = (step: number): boolean => {
    setError(null)

    if (step === 1) {
      if (!formData.position_type) {
        setError('Pozisyon tipi seçmelisiniz')
        return false
      }
      if (!formData.city_id) {
        setError('Şehir seçmelisiniz')
        return false
      }
    }

    if (step === 2) {
      if (formData.shift_types.length === 0) {
        setError('En az bir vardiya tipi seçmelisiniz')
        return false
      }
    }

    if (step === 5) {
      if (!formData.description.trim() || formData.description.length < 50) {
        setError('İş açıklaması en az 50 karakter olmalı')
        return false
      }
    }

    return true
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 6))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async (publishNow: boolean) => {
    setLoading(true)
    setError(null)

    if (publishNow) {
      if (!formData.position_type) {
        setError('Pozisyon tipi seçmelisiniz')
        setLoading(false)
        return
      }
      if (!formData.city_id) {
        setError('Şehir seçmelisiniz')
        setLoading(false)
        return
      }
      if (!formData.description.trim() || formData.description.length < 50) {
        setError('İş açıklaması en az 50 karakter olmalı')
        setLoading(false)
        return
      }
    }

    const supabase = createClient()

    try {
      const title =
        formData.title ||
        JOB_POSITION_LABELS[formData.position_type as JobPositionType]
      const slug = title
        .toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

      const { error: insertError } = await supabase.from('jobs').insert({
        company_id: companyId,
        title,
        slug: `${slug}-${Date.now().toString(36)}`,
        category_id: formData.category_id || null,
        city_id: formData.city_id || null,
        location_city:
          cities.find((c) => c.id === formData.city_id)?.name || null,
        district_id: formData.district_id || null,
        address: formData.address || null,
        description: formData.description,
        responsibilities: formData.responsibilities || null,
        requirements: formData.requirements || null,
        work_type: 'full_time', // Default, will be inferred from shift_types
        experience_level: formData.experience_level || null,
        salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseInt(formData.salary_max) : null,
        salary_currency: 'TRY',
        show_salary: formData.show_salary,
        benefits:
          formData.benefits.length > 0
            ? formData.benefits.map((b) => BENEFIT_TYPE_LABELS[b])
            : null,
        additional_info: formData.additional_info || null,
        status: publishNow ? 'active' : 'draft',
        published_at: publishNow ? new Date().toISOString() : null,
        view_count: 0,
        // New service industry fields
        position_type: formData.position_type || null,
        venue_type: formData.venue_type || null,
        shift_types: formData.shift_types.length > 0 ? formData.shift_types : null,
        working_days: formData.working_days || null,
        service_experience_required: formData.experience_level || null,
        required_certificates:
          formData.required_certificates.length > 0
            ? formData.required_certificates
            : null,
        cuisine_types:
          formData.cuisine_types.length > 0 ? formData.cuisine_types : null,
        uniform_policy: formData.uniform_policy || null,
        meal_policy: formData.meal_policy || null,
        tip_policy: formData.tip_policy || null,
        salary_payment_type: formData.salary_payment_type,
        age_min: formData.age_min ? parseInt(formData.age_min) : null,
        age_max: formData.age_max ? parseInt(formData.age_max) : null,
        gender_preference:
          formData.gender_preference !== 'any'
            ? formData.gender_preference
            : null,
        is_urgent: formData.is_urgent,
      })

      if (insertError) throw insertError

      window.location.href = '/isveren/dashboard/ilanlarim'
    } catch (err: any) {
      console.error('Job creation error:', err)
      let errorMessage = 'İlan oluşturulurken bir hata oluştu'
      if (err.message) {
        errorMessage = err.message
      }
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    )
  }

  const positionGroups = getPositionsGrouped()

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="bg-white rounded-xl border border-secondary-200 p-4 md:p-6 overflow-x-auto">
        <div className="flex items-center justify-between min-w-max">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex items-center gap-2">
                <div
                  className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full ${
                    currentStep > step.number
                      ? 'bg-green-100'
                      : currentStep === step.number
                        ? 'bg-primary-100'
                        : 'bg-secondary-100'
                  }`}
                >
                  {currentStep > step.number ? (
                    <Check className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                  ) : (
                    <step.icon
                      className={`h-4 w-4 md:h-5 md:w-5 ${
                        currentStep === step.number
                          ? 'text-primary-600'
                          : 'text-secondary-500'
                      }`}
                    />
                  )}
                </div>
                <div className="hidden lg:block">
                  <p
                    className={`text-xs font-medium ${
                      currentStep >= step.number
                        ? 'text-secondary-900'
                        : 'text-secondary-500'
                    }`}
                  >
                    {step.number}. {step.title}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 md:mx-4 ${
                    currentStep > step.number ? 'bg-green-200' : 'bg-secondary-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Step Content */}
      <div className="bg-white rounded-xl border border-secondary-200 p-6">
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-secondary-900">
              Temel Bilgiler
            </h2>

            {/* Position Type Selection */}
            <div>
              <label className="block text-sm font-medium text-secondary-900 mb-3">
                Pozisyon Tipi *
              </label>
              <div className="space-y-2">
                {positionGroups.map((group) => (
                  <div
                    key={group.category}
                    className="border border-secondary-200 rounded-lg overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => toggleCategory(group.category)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-secondary-50 hover:bg-secondary-100 transition-colors"
                    >
                      <span className="font-medium text-secondary-900">
                        {group.categoryLabel}
                      </span>
                      <ChevronDown
                        className={`h-5 w-5 text-secondary-500 transition-transform ${
                          expandedCategories.includes(group.category)
                            ? 'rotate-180'
                            : ''
                        }`}
                      />
                    </button>
                    {expandedCategories.includes(group.category) && (
                      <div className="p-3 grid grid-cols-2 md:grid-cols-3 gap-2">
                        {group.positions.map((pos) => (
                          <label
                            key={pos.value}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer border transition-colors ${
                              formData.position_type === pos.value
                                ? 'border-primary-500 bg-primary-50 text-primary-700'
                                : 'border-secondary-200 hover:border-secondary-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name="position_type"
                              value={pos.value}
                              checked={formData.position_type === pos.value}
                              onChange={handleChange}
                              className="sr-only"
                            />
                            <span className="text-sm">{pos.label}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {formData.position_type && (
                <p className="mt-2 text-sm text-primary-600">
                  Seçilen:{' '}
                  {JOB_POSITION_LABELS[formData.position_type as JobPositionType]}
                </p>
              )}
            </div>

            {/* Custom Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-secondary-900 mb-2"
              >
                İlan Başlığı (Opsiyonel)
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Özel başlık yazabilirsiniz"
                className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm"
              />
              <p className="mt-1 text-xs text-secondary-500">
                Boş bırakırsanız pozisyon adı kullanılır
              </p>
            </div>

            {/* Venue Type */}
            <div>
              <label className="block text-sm font-medium text-secondary-900 mb-2">
                Mekan Türü
              </label>
              <select
                name="venue_type"
                value={formData.venue_type}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm"
              >
                <option value="">Seçiniz</option>
                {Object.entries(VENUE_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-secondary-900 mb-2">
                Kategori
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm"
              >
                <option value="">Kategori seçiniz</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-900 mb-2">
                  Şehir *
                </label>
                <select
                  name="city_id"
                  value={formData.city_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm"
                >
                  <option value="">Şehir seçiniz</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-900 mb-2">
                  İlçe
                </label>
                <select
                  name="district_id"
                  value={formData.district_id}
                  onChange={handleChange}
                  disabled={!formData.city_id || loadingDistricts}
                  className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm disabled:opacity-50"
                >
                  <option value="">
                    {!formData.city_id
                      ? 'Önce şehir seçiniz'
                      : loadingDistricts
                        ? 'Yükleniyor...'
                        : 'İlçe seçiniz'}
                  </option>
                  {districts.map((district) => (
                    <option key={district.id} value={district.id}>
                      {district.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-900 mb-2">
                Adres
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={2}
                placeholder="İşyeri adresi..."
                className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm resize-none"
              />
            </div>
          </div>
        )}

        {/* Step 2: Schedule & Requirements */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-secondary-900">
              Çalışma Koşulları
            </h2>

            {/* Shift Types */}
            <div>
              <label className="block text-sm font-medium text-secondary-900 mb-3">
                Vardiya Tipleri * (Birden fazla seçebilirsiniz)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(SHIFT_TYPE_LABELS).map(([value, label]) => (
                  <label
                    key={value}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer border transition-colors ${
                      formData.shift_types.includes(value as ShiftType)
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-secondary-200 hover:border-secondary-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.shift_types.includes(value as ShiftType)}
                      onChange={() =>
                        handleArrayToggle('shift_types', value as ShiftType)
                      }
                      className="sr-only"
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Working Days */}
            <div>
              <label className="block text-sm font-medium text-secondary-900 mb-2">
                Çalışma Günleri
              </label>
              <select
                name="working_days"
                value={formData.working_days}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm"
              >
                <option value="">Seçiniz</option>
                {Object.entries(WORKING_DAYS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Experience Level */}
            <div>
              <label className="block text-sm font-medium text-secondary-900 mb-2">
                Deneyim Seviyesi
              </label>
              <select
                name="experience_level"
                value={formData.experience_level}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm"
              >
                <option value="">Seçiniz</option>
                {Object.entries(EXPERIENCE_LEVEL_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Required Certificates */}
            <div>
              <label className="block text-sm font-medium text-secondary-900 mb-3">
                Gerekli Sertifikalar
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                {Object.entries(CERTIFICATE_TYPE_LABELS).map(([value, label]) => (
                  <label
                    key={value}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer border transition-colors ${
                      formData.required_certificates.includes(
                        value as CertificateType
                      )
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-secondary-200 hover:border-secondary-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.required_certificates.includes(
                        value as CertificateType
                      )}
                      onChange={() =>
                        handleArrayToggle(
                          'required_certificates',
                          value as CertificateType
                        )
                      }
                      className="sr-only"
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Age & Gender */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-900 mb-2">
                  Minimum Yaş
                </label>
                <input
                  type="number"
                  name="age_min"
                  value={formData.age_min}
                  onChange={handleChange}
                  min="18"
                  max="65"
                  placeholder="18"
                  className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-900 mb-2">
                  Maksimum Yaş
                </label>
                <input
                  type="number"
                  name="age_max"
                  value={formData.age_max}
                  onChange={handleChange}
                  min="18"
                  max="65"
                  placeholder="45"
                  className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-900 mb-2">
                  Cinsiyet Tercihi
                </label>
                <select
                  name="gender_preference"
                  value={formData.gender_preference}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm"
                >
                  <option value="any">Farketmez</option>
                  <option value="male">Erkek</option>
                  <option value="female">Kadın</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Cuisine & Skills */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-secondary-900">
              Mutfak Türü & Beceriler
            </h2>

            {/* Cuisine Types */}
            <div>
              <label className="block text-sm font-medium text-secondary-900 mb-3">
                Mutfak Türleri (Birden fazla seçebilirsiniz)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(CUISINE_TYPE_LABELS).map(([value, label]) => (
                  <label
                    key={value}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer border transition-colors ${
                      formData.cuisine_types.includes(value as CuisineType)
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-secondary-200 hover:border-secondary-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.cuisine_types.includes(
                        value as CuisineType
                      )}
                      onChange={() =>
                        handleArrayToggle('cuisine_types', value as CuisineType)
                      }
                      className="sr-only"
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Languages - Simple text input for now */}
            <div>
              <label className="block text-sm font-medium text-secondary-900 mb-2">
                Gerekli Diller (virgülle ayırın)
              </label>
              <input
                type="text"
                value={formData.languages_required.join(', ')}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    languages_required: e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean),
                  }))
                }
                placeholder="Türkçe, İngilizce..."
                className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm"
              />
            </div>

            {/* Skills - Simple text input */}
            <div>
              <label className="block text-sm font-medium text-secondary-900 mb-2">
                Gerekli Beceriler (virgülle ayırın)
              </label>
              <input
                type="text"
                value={formData.skills_required.join(', ')}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    skills_required: e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean),
                  }))
                }
                placeholder="Latte Art, Cocktail Yapımı..."
                className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm"
              />
            </div>
          </div>
        )}

        {/* Step 4: Salary & Benefits */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-secondary-900">
              Maaş ve Yan Haklar
            </h2>

            {/* Salary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-900 mb-2">
                  Minimum Maaş (TL)
                </label>
                <input
                  type="number"
                  name="salary_min"
                  value={formData.salary_min}
                  onChange={handleChange}
                  placeholder="20000"
                  className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-900 mb-2">
                  Maksimum Maaş (TL)
                </label>
                <input
                  type="number"
                  name="salary_max"
                  value={formData.salary_max}
                  onChange={handleChange}
                  placeholder="35000"
                  className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-900 mb-2">
                  Ödeme Tipi
                </label>
                <select
                  name="salary_payment_type"
                  value={formData.salary_payment_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm"
                >
                  {Object.entries(SALARY_PAYMENT_TYPE_LABELS).map(
                    ([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="show_salary"
                name="show_salary"
                checked={formData.show_salary}
                onChange={handleChange}
                className="w-4 h-4 text-primary-600 border-secondary-300 rounded"
              />
              <label htmlFor="show_salary" className="text-sm text-secondary-900">
                Maaş bilgisini ilanda göster
              </label>
            </div>

            {/* Benefits */}
            <div>
              <label className="block text-sm font-medium text-secondary-900 mb-3">
                Yan Haklar
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(BENEFIT_TYPE_LABELS).map(([value, label]) => (
                  <label
                    key={value}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer border transition-colors ${
                      formData.benefits.includes(value as BenefitType)
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-secondary-200 hover:border-secondary-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.benefits.includes(value as BenefitType)}
                      onChange={() =>
                        handleArrayToggle('benefits', value as BenefitType)
                      }
                      className="sr-only"
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Policies */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-900 mb-2">
                  Üniforma Politikası
                </label>
                <select
                  name="uniform_policy"
                  value={formData.uniform_policy}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm"
                >
                  <option value="">Seçiniz</option>
                  {Object.entries(UNIFORM_POLICY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-900 mb-2">
                  Yemek Politikası
                </label>
                <select
                  name="meal_policy"
                  value={formData.meal_policy}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm"
                >
                  <option value="">Seçiniz</option>
                  {Object.entries(MEAL_POLICY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-900 mb-2">
                  Bahşiş Politikası
                </label>
                <select
                  name="tip_policy"
                  value={formData.tip_policy}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm"
                >
                  <option value="">Seçiniz</option>
                  {Object.entries(TIP_POLICY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Description */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-secondary-900">
              İş Açıklaması
            </h2>

            <div>
              <label className="block text-sm font-medium text-secondary-900 mb-2">
                İş Açıklaması * (En az 50 karakter)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                placeholder="İş pozisyonu hakkında detaylı açıklama yazın..."
                className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm resize-none"
              />
              <p className="text-xs text-secondary-500 mt-1">
                {formData.description.length} / 50 minimum karakter
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-900 mb-2">
                Sorumluluklar
              </label>
              <textarea
                name="responsibilities"
                value={formData.responsibilities}
                onChange={handleChange}
                rows={4}
                placeholder="İş sorumluluklarını listeleyin..."
                className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-900 mb-2">
                Aranan Nitelikler
              </label>
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                rows={4}
                placeholder="İdeal adayda aradığınız özellikler..."
                className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-900 mb-2">
                Ek Bilgiler
              </label>
              <textarea
                name="additional_info"
                value={formData.additional_info}
                onChange={handleChange}
                rows={3}
                placeholder="Diğer bilgiler..."
                className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm resize-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_urgent"
                name="is_urgent"
                checked={formData.is_urgent}
                onChange={handleChange}
                className="w-4 h-4 text-red-600 border-secondary-300 rounded"
              />
              <label htmlFor="is_urgent" className="text-sm text-secondary-900">
                Acil personel aranıyor
              </label>
            </div>
          </div>
        )}

        {/* Step 6: Preview */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-secondary-900">
              İlan Önizlemesi
            </h2>

            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-secondary-900">
                    {formData.title ||
                      JOB_POSITION_LABELS[
                        formData.position_type as JobPositionType
                      ]}
                  </h3>
                  <p className="text-sm text-secondary-600 flex items-center gap-1 mt-1">
                    <MapPin className="h-4 w-4" />
                    {cities.find((c) => c.id === formData.city_id)?.name}
                    {formData.district_id &&
                      `, ${districts.find((d) => d.id === formData.district_id)?.name}`}
                  </p>
                </div>
                {formData.is_urgent && (
                  <span className="px-3 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                    ACİL
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.position_type && (
                  <span className="px-3 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded-full">
                    {JOB_POSITION_LABELS[formData.position_type as JobPositionType]}
                  </span>
                )}
                {formData.venue_type && (
                  <span className="px-3 py-1 text-xs font-medium bg-secondary-100 text-secondary-700 rounded-full">
                    {VENUE_TYPE_LABELS[formData.venue_type as VenueType]}
                  </span>
                )}
                {formData.experience_level && (
                  <span className="px-3 py-1 text-xs font-medium bg-secondary-100 text-secondary-700 rounded-full">
                    {
                      EXPERIENCE_LEVEL_LABELS[
                        formData.experience_level as ServiceExperienceLevel
                      ]
                    }
                  </span>
                )}
              </div>

              {formData.shift_types.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.shift_types.map((shift) => (
                    <span
                      key={shift}
                      className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded"
                    >
                      {SHIFT_TYPE_LABELS[shift]}
                    </span>
                  ))}
                </div>
              )}

              {formData.show_salary &&
                (formData.salary_min || formData.salary_max) && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-900">
                      Maaş:{' '}
                      {formData.salary_min &&
                        `${parseInt(formData.salary_min).toLocaleString('tr-TR')} TL`}
                      {formData.salary_min && formData.salary_max && ' - '}
                      {formData.salary_max &&
                        `${parseInt(formData.salary_max).toLocaleString('tr-TR')} TL`}
                      {' '}({SALARY_PAYMENT_TYPE_LABELS[formData.salary_payment_type]})
                    </p>
                  </div>
                )}

              {formData.description && (
                <div>
                  <h4 className="text-sm font-medium text-secondary-900 mb-2">
                    İş Açıklaması
                  </h4>
                  <p className="text-sm text-secondary-700 whitespace-pre-wrap">
                    {formData.description}
                  </p>
                </div>
              )}

              {formData.cuisine_types.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-secondary-900 mb-2">
                    Mutfak Türleri
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {formData.cuisine_types.map((cuisine) => (
                      <span
                        key={cuisine}
                        className="px-2 py-1 text-xs bg-orange-50 text-orange-700 rounded"
                      >
                        {CUISINE_TYPE_LABELS[cuisine]}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {formData.benefits.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-secondary-900 mb-2">
                    Yan Haklar
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {formData.benefits.map((benefit) => (
                      <span
                        key={benefit}
                        className="px-2 py-1 text-xs bg-purple-50 text-purple-700 rounded"
                      >
                        {BENEFIT_TYPE_LABELS[benefit]}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                {formData.uniform_policy && (
                  <div>
                    <p className="text-xs text-secondary-500">Üniforma</p>
                    <p className="text-sm font-medium">
                      {UNIFORM_POLICY_LABELS[formData.uniform_policy as UniformPolicy]}
                    </p>
                  </div>
                )}
                {formData.meal_policy && (
                  <div>
                    <p className="text-xs text-secondary-500">Yemek</p>
                    <p className="text-sm font-medium">
                      {MEAL_POLICY_LABELS[formData.meal_policy as MealPolicy]}
                    </p>
                  </div>
                )}
                {formData.tip_policy && (
                  <div>
                    <p className="text-xs text-secondary-500">Bahşiş</p>
                    <p className="text-sm font-medium">
                      {TIP_POLICY_LABELS[formData.tip_policy as TipPolicy]}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-4">
        {currentStep > 1 && (
          <button
            onClick={prevStep}
            className="px-6 py-2.5 text-sm font-medium text-secondary-700 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Önceki
          </button>
        )}

        <div className="flex-1" />

        {currentStep < 6 ? (
          <button
            onClick={nextStep}
            className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            Sonraki
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSubmit(false)}
              disabled={loading}
              className="px-6 py-2.5 bg-white border border-secondary-200 hover:bg-secondary-50 text-secondary-900 font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Taslak Kaydet
            </button>
            <button
              onClick={() => handleSubmit(true)}
              disabled={loading}
              className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-secondary-300 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Yayınla
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
