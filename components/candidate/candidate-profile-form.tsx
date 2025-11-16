'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, MapPin, Briefcase, FileText, Upload, Loader2 } from 'lucide-react'

interface CandidateProfileFormProps {
  profile: any
  candidateProfile: any
}

export function CandidateProfileForm({ profile, candidateProfile }: CandidateProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    title: candidateProfile?.title || '',
    bio: candidateProfile?.bio || '',
    city: candidateProfile?.city || '',
    skills: candidateProfile?.skills?.join(', ') || '',
    linkedin_url: candidateProfile?.linkedin_url || '',
    portfolio_url: candidateProfile?.portfolio_url || '',
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
          skills: formData.skills.split(',').map((s: string) => s.trim()).filter(Boolean),
          linkedin_url: formData.linkedin_url,
          portfolio_url: formData.portfolio_url,
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

  return (
    <div className="bg-white rounded-xl border border-secondary-200">
      <div className="p-6 border-b border-secondary-200">
        <h2 className="text-lg font-semibold text-secondary-900">Kişisel Bilgiler</h2>
        <p className="text-sm text-secondary-600 mt-0.5">
          Temel bilgilerini ve iletişim detaylarını güncelle
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
            {isLoading && (
              <p className="text-sm text-primary-600 font-medium mb-2">
                Yükleniyor...
              </p>
            )}
            <p className="text-sm text-secondary-600 mb-2">
              JPG, PNG veya WebP formatında, maksimum 2MB
            </p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
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

          {/* Phone */}
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

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-secondary-900 mb-2">
              <Briefcase className="h-4 w-4 inline mr-1" />
              Unvan
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 bg-white border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Örn: Kıdemli Garson"
            />
          </div>

          {/* City */}
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
            placeholder="Kendini tanıt, yeteneklerini ve hedeflerini paylaş..."
          />
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm font-medium text-secondary-900 mb-2">
            Yetenekler
          </label>
          <input
            type="text"
            value={formData.skills}
            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
            className="w-full px-4 py-2 bg-white border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Virgülle ayırarak yaz: Garsonluk, Müşteri İlişkileri, POS Sistemi"
          />
          <p className="text-xs text-secondary-500 mt-1">
            Yeteneklerini virgülle ayırarak yaz
          </p>
        </div>

        {/* Social Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-secondary-900 mb-2">
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

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-accent-50 text-accent-700 border border-accent-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
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
