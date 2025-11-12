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
  Save
} from 'lucide-react'

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
  category_id: string
  city_id: string
  district_id: string
  address: string

  // Step 2: Details
  description: string
  responsibilities: string
  qualifications: string
  work_type: string
  experience_level: string
  education_level: string

  // Step 3: Salary & Benefits
  salary_min: string
  salary_max: string
  salary_currency: string
  show_salary: boolean
  benefits: string[]
  additional_info: string

  // Meta
  status: 'draft' | 'active'
}

export function JobCreateForm({ companyId, categories, cities }: JobCreateFormProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [districts, setDistricts] = useState<District[]>([])
  const [loadingDistricts, setLoadingDistricts] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    title: '',
    category_id: '',
    city_id: '',
    district_id: '',
    address: '',
    description: '',
    responsibilities: '',
    qualifications: '',
    work_type: 'full_time',
    experience_level: '',
    education_level: '',
    salary_min: '',
    salary_max: '',
    salary_currency: 'TRY',
    show_salary: false,
    benefits: [],
    additional_info: '',
    status: 'draft'
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
    // Reset district_id when city changes
    setFormData(prev => ({ ...prev, district_id: '' }))
  }, [formData.city_id])

  const steps = [
    { number: 1, title: 'Temel Bilgiler', icon: Briefcase },
    { number: 2, title: 'İş Detayları', icon: FileText },
    { number: 3, title: 'Maaş ve Haklar', icon: DollarSign },
    { number: 4, title: 'Önizleme', icon: Eye },
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleBenefitToggle = (benefit: string) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.includes(benefit)
        ? prev.benefits.filter(b => b !== benefit)
        : [...prev.benefits, benefit]
    }))
  }

  const validateStep = (step: number): boolean => {
    setError(null)

    if (step === 1) {
      if (!formData.title.trim()) {
        setError('İş pozisyonu gerekli')
        return false
      }
      if (!formData.category_id) {
        setError('Kategori seçmelisiniz')
        return false
      }
      if (!formData.city_id) {
        setError('Şehir seçmelisiniz')
        return false
      }
    }

    if (step === 2) {
      if (!formData.description.trim() || formData.description.length < 100) {
        setError('İş açıklaması en az 100 karakter olmalı')
        return false
      }
      if (!formData.work_type) {
        setError('Çalışma tipi seçmelisiniz')
        return false
      }
    }

    return true
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async (publishNow: boolean) => {
    setLoading(true)
    setError(null)

    // Taslak olarak kaydediliyorsa validasyon yapma
    if (publishNow) {
      // Sadece yayınlarken validasyon yap
      if (!formData.title.trim()) {
        setError('İş pozisyonu gerekli')
        setLoading(false)
        return
      }
      if (!formData.category_id) {
        setError('Kategori seçmelisiniz')
        setLoading(false)
        return
      }
      if (!formData.city_id) {
        setError('Şehir seçmelisiniz')
        setLoading(false)
        return
      }
      if (!formData.description.trim() || formData.description.length < 100) {
        setError('İş açıklaması en az 100 karakter olmalı')
        setLoading(false)
        return
      }
    }

    const supabase = createClient()

    try {
      // Generate slug
      const slug = formData.title
        .toLowerCase()
        .replace(/ğ/g, 'g').replace(/ü/g, 'u')
        .replace(/ş/g, 's').replace(/ı/g, 'i')
        .replace(/ö/g, 'o').replace(/ç/g, 'c')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

      const { data, error: insertError } = await supabase
        .from('jobs')
        .insert({
          company_id: companyId,
          title: formData.title,
          slug: `${slug}-${Date.now().toString(36)}`,
          category_id: formData.category_id || null,
          city_id: formData.city_id || null,
          location_city: cities.find(c => c.id === formData.city_id)?.name || null,
          district_id: formData.district_id || null,
          address: formData.address || null,
          description: formData.description,
          responsibilities: formData.responsibilities || null,
          qualifications: formData.qualifications || null,
          work_type: formData.work_type,
          experience_level: formData.experience_level || null,
          education_level: formData.education_level || null,
          salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
          salary_max: formData.salary_max ? parseInt(formData.salary_max) : null,
          salary_currency: formData.salary_currency,
          show_salary: formData.show_salary,
          benefits: formData.benefits.length > 0 ? formData.benefits : null,
          additional_info: formData.additional_info || null,
          status: publishNow ? 'active' : 'draft',
          published_at: publishNow ? new Date().toISOString() : null,
          view_count: 0,
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Redirect with cache invalidation
      window.location.href = '/isveren/dashboard/ilanlarim'
    } catch (err: any) {
      console.error('Job creation error:', err)

      // User-friendly error messages
      let errorMessage = 'İlan oluşturulurken bir hata oluştu'

      if (err.code === 'PGRST116') {
        errorMessage = 'Veritabanı bağlantı hatası. Lütfen tekrar deneyin.'
      } else if (err.message?.includes('foreign key')) {
        errorMessage = 'Seçilen kategori veya şehir geçersiz. Lütfen kontrol edin.'
      } else if (err.message?.includes('enum')) {
        errorMessage = 'Form değerlerinde hata var. Lütfen tüm alanları kontrol edin.'
      } else if (err.message) {
        errorMessage = err.message
      }

      // Show hint in development
      if (process.env.NODE_ENV === 'development' && err.hint) {
        errorMessage += `\n\nİpucu: ${err.hint}`
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const benefitOptions = [
    'Yemek',
    'Servis',
    'Sağlık Sigortası',
    'Performans Primi',
    'Esnek Çalışma Saatleri',
    'Uzaktan Çalışma',
  ]

  const getEducationLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      'high_school': 'Lise',
      'associate': 'Ön Lisans',
      'bachelor': 'Lisans',
      'master': 'Yüksek Lisans',
      'doctorate': 'Doktora'
    }
    return labels[level] || level
  }

  const getExperienceLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      'entry': 'Deneyimsiz',
      'junior': 'Junior (1-3 Yıl)',
      'mid': 'Orta Seviye (3-5 Yıl)',
      'senior': 'Senior (5+ Yıl)',
      'lead': 'Lead',
      'executive': 'Yönetici'
    }
    return labels[level] || level
  }

  const getWorkTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'full_time': 'Tam Zamanlı',
      'part_time': 'Yarı Zamanlı',
      'contract': 'Sözleşmeli',
      'freelance': 'Freelance',
      'internship': 'Staj'
    }
    return labels[type] || type
  }

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="bg-white rounded-xl border border-secondary-200 p-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  currentStep > step.number ? 'bg-green-100' :
                  currentStep === step.number ? 'bg-primary-100' :
                  'bg-secondary-100'
                }`}>
                  {currentStep > step.number ? (
                    <Check className="h-5 w-5 text-green-600" />
                  ) : (
                    <step.icon className={`h-5 w-5 ${
                      currentStep === step.number ? 'text-primary-600' : 'text-secondary-500'
                    }`} />
                  )}
                </div>
                <div className="hidden md:block">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.number ? 'text-secondary-900' : 'text-secondary-500'
                  }`}>
                    Adım {step.number}
                  </p>
                  <p className={`text-xs ${
                    currentStep >= step.number ? 'text-secondary-600' : 'text-secondary-400'
                  }`}>
                    {step.title}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  currentStep > step.number ? 'bg-green-200' : 'bg-secondary-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-accent-50 border border-accent-200 rounded-lg">
          <p className="text-sm text-accent-700">{error}</p>
        </div>
      )}

      {/* Step Content */}
      <div className="bg-white rounded-xl border border-secondary-200 p-6">
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-secondary-900 mb-4">Temel Bilgiler</h2>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-secondary-900 mb-2">
                İş Pozisyonu *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Örn: Garson, Aşçı, Barista"
                className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm text-secondary-900 placeholder:text-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label htmlFor="category_id" className="block text-sm font-medium text-secondary-900 mb-2">
                Kategori *
              </label>
              <select
                id="category_id"
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Kategori seçiniz</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="city_id" className="block text-sm font-medium text-secondary-900 mb-2">
                  Şehir *
                </label>
                <select
                  id="city_id"
                  name="city_id"
                  value={formData.city_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Şehir seçiniz</option>
                  {cities.map(city => (
                    <option key={city.id} value={city.id}>{city.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="district_id" className="block text-sm font-medium text-secondary-900 mb-2">
                  İlçe
                </label>
                <select
                  id="district_id"
                  name="district_id"
                  value={formData.district_id}
                  onChange={handleChange}
                  disabled={!formData.city_id || loadingDistricts}
                  className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {!formData.city_id ? 'Önce şehir seçiniz' : loadingDistricts ? 'Yükleniyor...' : 'İlçe seçiniz'}
                  </option>
                  {districts.map(district => (
                    <option key={district.id} value={district.id}>{district.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-secondary-900 mb-2">
                Adres
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={2}
                placeholder="Tam adres..."
                className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm text-secondary-900 placeholder:text-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
              />
            </div>
          </div>
        )}

        {/* Step 2: Details */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-secondary-900 mb-4">İş Detayları</h2>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-secondary-900 mb-2">
                İş Açıklaması * (En az 100 karakter)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                placeholder="İş pozisyonu hakkında detaylı açıklama yazın..."
                className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm text-secondary-900 placeholder:text-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
              />
              <p className="text-xs text-secondary-500 mt-1">
                {formData.description.length} / 100 minimum karakter
              </p>
            </div>

            <div>
              <label htmlFor="responsibilities" className="block text-sm font-medium text-secondary-900 mb-2">
                Sorumluluklar
              </label>
              <textarea
                id="responsibilities"
                name="responsibilities"
                value={formData.responsibilities}
                onChange={handleChange}
                rows={4}
                placeholder="İş sorumluluklarını listeleyin..."
                className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm text-secondary-900 placeholder:text-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
              />
            </div>

            <div>
              <label htmlFor="qualifications" className="block text-sm font-medium text-secondary-900 mb-2">
                Aranan Nitelikler
              </label>
              <textarea
                id="qualifications"
                name="qualifications"
                value={formData.qualifications}
                onChange={handleChange}
                rows={4}
                placeholder="İdeal adayda aradığınız özellikler..."
                className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm text-secondary-900 placeholder:text-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="work_type" className="block text-sm font-medium text-secondary-900 mb-2">
                  Çalışma Tipi *
                </label>
                <select
                  id="work_type"
                  name="work_type"
                  value={formData.work_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="full_time">Tam Zamanlı</option>
                  <option value="part_time">Yarı Zamanlı</option>
                  <option value="contract">Sözleşmeli</option>
                  <option value="freelance">Freelance</option>
                  <option value="internship">Staj</option>
                </select>
              </div>

              <div>
                <label htmlFor="experience_level" className="block text-sm font-medium text-secondary-900 mb-2">
                  Deneyim Seviyesi
                </label>
                <select
                  id="experience_level"
                  name="experience_level"
                  value={formData.experience_level}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Seçiniz</option>
                  <option value="entry">Deneyimsiz</option>
                  <option value="junior">Junior (1-3 Yıl)</option>
                  <option value="mid">Orta Seviye (3-5 Yıl)</option>
                  <option value="senior">Senior (5+ Yıl)</option>
                  <option value="lead">Lead</option>
                  <option value="executive">Yönetici</option>
                </select>
              </div>

              <div>
                <label htmlFor="education_level" className="block text-sm font-medium text-secondary-900 mb-2">
                  Eğitim Seviyesi
                </label>
                <select
                  id="education_level"
                  name="education_level"
                  value={formData.education_level}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Seçiniz</option>
                  <option value="high_school">Lise</option>
                  <option value="associate">Ön Lisans</option>
                  <option value="bachelor">Lisans</option>
                  <option value="master">Yüksek Lisans</option>
                  <option value="doctorate">Doktora</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Salary & Benefits */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-secondary-900 mb-4">Maaş ve Yan Haklar</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="salary_min" className="block text-sm font-medium text-secondary-900 mb-2">
                  Minimum Maaş (TL)
                </label>
                <input
                  type="number"
                  id="salary_min"
                  name="salary_min"
                  value={formData.salary_min}
                  onChange={handleChange}
                  placeholder="17000"
                  className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm text-secondary-900 placeholder:text-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label htmlFor="salary_max" className="block text-sm font-medium text-secondary-900 mb-2">
                  Maksimum Maaş (TL)
                </label>
                <input
                  type="number"
                  id="salary_max"
                  name="salary_max"
                  value={formData.salary_max}
                  onChange={handleChange}
                  placeholder="25000"
                  className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm text-secondary-900 placeholder:text-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="show_salary"
                name="show_salary"
                checked={formData.show_salary}
                onChange={handleChange}
                className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="show_salary" className="text-sm text-secondary-900">
                Maaş bilgisini ilanda göster
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-900 mb-3">
                Yan Haklar
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {benefitOptions.map(benefit => (
                  <label
                    key={benefit}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.benefits.includes(benefit)}
                      onChange={() => handleBenefitToggle(benefit)}
                      className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-secondary-900">{benefit}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="additional_info" className="block text-sm font-medium text-secondary-900 mb-2">
                Ek Bilgiler
              </label>
              <textarea
                id="additional_info"
                name="additional_info"
                value={formData.additional_info}
                onChange={handleChange}
                rows={4}
                placeholder="İlanla ilgili eklemek istediğiniz diğer bilgiler..."
                className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm text-secondary-900 placeholder:text-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
              />
            </div>
          </div>
        )}

        {/* Step 4: Preview */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-secondary-900 mb-4">İlan Önizlemesi</h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-secondary-900">{formData.title}</h3>
                <p className="text-sm text-secondary-600">
                  {cities.find(c => c.id === formData.city_id)?.name}
                  {formData.district_id && `, ${districts.find(d => d.id === formData.district_id)?.name}`}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded-full">
                  {getWorkTypeLabel(formData.work_type)}
                </span>
                {formData.experience_level && (
                  <span className="px-3 py-1 text-xs font-medium bg-secondary-100 text-secondary-700 rounded-full">
                    {getExperienceLevelLabel(formData.experience_level)}
                  </span>
                )}
                {formData.education_level && (
                  <span className="px-3 py-1 text-xs font-medium bg-secondary-100 text-secondary-700 rounded-full">
                    {getEducationLevelLabel(formData.education_level)}
                  </span>
                )}
              </div>

              {formData.show_salary && (formData.salary_min || formData.salary_max) && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-green-900">
                    Maaş: {formData.salary_min && `${parseInt(formData.salary_min).toLocaleString('tr-TR')} TL`}
                    {formData.salary_min && formData.salary_max && ' - '}
                    {formData.salary_max && `${parseInt(formData.salary_max).toLocaleString('tr-TR')} TL`}
                  </p>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium text-secondary-900 mb-2">İş Açıklaması</h4>
                <p className="text-sm text-secondary-700 whitespace-pre-wrap">{formData.description}</p>
              </div>

              {formData.responsibilities && (
                <div>
                  <h4 className="text-sm font-medium text-secondary-900 mb-2">Sorumluluklar</h4>
                  <p className="text-sm text-secondary-700 whitespace-pre-wrap">{formData.responsibilities}</p>
                </div>
              )}

              {formData.qualifications && (
                <div>
                  <h4 className="text-sm font-medium text-secondary-900 mb-2">Aranan Nitelikler</h4>
                  <p className="text-sm text-secondary-700 whitespace-pre-wrap">{formData.qualifications}</p>
                </div>
              )}

              {formData.benefits.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-secondary-900 mb-2">Yan Haklar</h4>
                  <div className="flex flex-wrap gap-2">
                    {formData.benefits.map(benefit => (
                      <span key={benefit} className="px-3 py-1 text-xs bg-secondary-100 text-secondary-700 rounded-full">
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {formData.additional_info && (
                <div>
                  <h4 className="text-sm font-medium text-secondary-900 mb-2">Ek Bilgiler</h4>
                  <p className="text-sm text-secondary-700 whitespace-pre-wrap">{formData.additional_info}</p>
                </div>
              )}
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

        {currentStep < 4 ? (
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
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Taslak Kaydet
            </button>
            <button
              onClick={() => handleSubmit(true)}
              disabled={loading}
              className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-secondary-300 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Yayınla
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
