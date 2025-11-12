'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Building2,
  Upload,
  Loader2,
  MapPin,
  Globe,
  Users,
  FileText,
  Save
} from 'lucide-react'

interface Company {
  id: string
  name: string
  description: string | null
  logo_url: string | null
  sector: string | null
  employee_count: string | null
  address: string | null
  city_id: string | null
  website: string | null
  linkedin: string | null
  twitter: string | null
  instagram: string | null
}

interface CompanyProfileFormProps {
  company: Company
  cities: { id: string; name: string }[]
}

export function CompanyProfileForm({ company, cities }: CompanyProfileFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    name: company.name || '',
    description: company.description || '',
    logo_url: company.logo_url || '',
    sector: company.sector || '',
    employee_count: company.employee_count || '',
    address: company.address || '',
    city_id: company.city_id || '',
    website: company.website || '',
    linkedin: company.linkedin || '',
    twitter: company.twitter || '',
    instagram: company.instagram || '',
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    if (!file.type.startsWith('image/')) {
      setError('Lütfen bir görsel dosyası seçin')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Dosya boyutu 2MB\'dan küçük olmalıdır')
      return
    }

    setUploading(true)
    setError(null)

    const supabase = createClient()
    const fileExt = file.name.split('.').pop()
    const fileName = `${company.id}-${Date.now()}.${fileExt}`

    try {
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('company-logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('company-logos')
        .getPublicUrl(fileName)

      setFormData(prev => ({ ...prev, logo_url: publicUrl }))
      setSuccess('Logo başarıyla yüklendi')
    } catch (err: any) {
      setError(err.message || 'Logo yüklenirken bir hata oluştu')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    const supabase = createClient()

    try {
      const { error: updateError } = await supabase
        .from('companies')
        .update({
          name: formData.name,
          description: formData.description || null,
          logo_url: formData.logo_url || null,
          sector: formData.sector || null,
          employee_count: formData.employee_count || null,
          address: formData.address || null,
          city_id: formData.city_id || null,
          website: formData.website || null,
          linkedin: formData.linkedin || null,
          twitter: formData.twitter || null,
          instagram: formData.instagram || null,
        })
        .eq('id', company.id)

      if (updateError) throw updateError

      setSuccess('Profil başarıyla güncellendi')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Messages */}
      {error && (
        <div className="p-4 bg-accent-50 border border-accent-200 rounded-lg">
          <p className="text-sm text-accent-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      {/* Logo Upload */}
      <div className="bg-white rounded-xl border border-secondary-200 p-6">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">Şirket Logosu</h2>

        <div className="flex items-start gap-6">
          {/* Logo Preview */}
          <div className="flex-shrink-0">
            {formData.logo_url ? (
              <img
                src={formData.logo_url}
                alt="Company Logo"
                className="h-24 w-24 rounded-xl object-cover border border-secondary-200"
              />
            ) : (
              <div className="h-24 w-24 rounded-xl bg-secondary-100 flex items-center justify-center border border-secondary-200">
                <Building2 className="h-10 w-10 text-secondary-400" />
              </div>
            )}
          </div>

          {/* Upload Button */}
          <div className="flex-1">
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-secondary-200 hover:bg-secondary-50 text-secondary-900 font-medium rounded-lg cursor-pointer transition-colors">
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Yükleniyor...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Logo Yükle
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
            <p className="text-sm text-secondary-600 mt-2">
              PNG, JPG veya GIF. Maksimum 2MB.
            </p>
          </div>
        </div>
      </div>

      {/* Basic Info */}
      <div className="bg-white rounded-xl border border-secondary-200 p-6">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Temel Bilgiler
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Company Name */}
          <div className="md:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-secondary-900 mb-2">
              Şirket Adı *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm text-secondary-900 placeholder:text-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Sector */}
          <div>
            <label htmlFor="sector" className="block text-sm font-medium text-secondary-900 mb-2">
              Sektör
            </label>
            <input
              type="text"
              id="sector"
              name="sector"
              value={formData.sector}
              onChange={handleChange}
              placeholder="Örn: Restoran, Otel, Kafe"
              className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm text-secondary-900 placeholder:text-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Employee Count */}
          <div>
            <label htmlFor="employee_count" className="block text-sm font-medium text-secondary-900 mb-2 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Çalışan Sayısı
            </label>
            <select
              id="employee_count"
              name="employee_count"
              value={formData.employee_count}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Seçiniz</option>
              <option value="1-10">1-10</option>
              <option value="11-50">11-50</option>
              <option value="51-200">51-200</option>
              <option value="201-500">201-500</option>
              <option value="501+">501+</option>
            </select>
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-secondary-900 mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Şirket Açıklaması
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Şirketiniz hakkında kısa bir açıklama yazın..."
              className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm text-secondary-900 placeholder:text-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
            />
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="bg-white rounded-xl border border-secondary-200 p-6">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Konum Bilgileri
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* City */}
          <div>
            <label htmlFor="city_id" className="block text-sm font-medium text-secondary-900 mb-2">
              Şehir
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

          {/* Address */}
          <div className="md:col-span-2">
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
      </div>

      {/* Social & Web */}
      <div className="bg-white rounded-xl border border-secondary-200 p-6">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Web ve Sosyal Medya
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Website */}
          <div className="md:col-span-2">
            <label htmlFor="website" className="block text-sm font-medium text-secondary-900 mb-2">
              Website
            </label>
            <input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://www.sirketiniz.com"
              className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm text-secondary-900 placeholder:text-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* LinkedIn */}
          <div>
            <label htmlFor="linkedin" className="block text-sm font-medium text-secondary-900 mb-2">
              LinkedIn
            </label>
            <input
              type="url"
              id="linkedin"
              name="linkedin"
              value={formData.linkedin}
              onChange={handleChange}
              placeholder="https://linkedin.com/company/..."
              className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm text-secondary-900 placeholder:text-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Twitter */}
          <div>
            <label htmlFor="twitter" className="block text-sm font-medium text-secondary-900 mb-2">
              Twitter
            </label>
            <input
              type="url"
              id="twitter"
              name="twitter"
              value={formData.twitter}
              onChange={handleChange}
              placeholder="https://twitter.com/..."
              className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm text-secondary-900 placeholder:text-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Instagram */}
          <div>
            <label htmlFor="instagram" className="block text-sm font-medium text-secondary-900 mb-2">
              Instagram
            </label>
            <input
              type="url"
              id="instagram"
              name="instagram"
              value={formData.instagram}
              onChange={handleChange}
              placeholder="https://instagram.com/..."
              className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm text-secondary-900 placeholder:text-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 text-sm font-medium text-secondary-700 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg transition-colors"
        >
          İptal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-secondary-300 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Kaydediliyor...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Değişiklikleri Kaydet
            </>
          )}
        </button>
      </div>
    </form>
  )
}
