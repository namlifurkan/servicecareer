'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { submitApplication } from '@/lib/application-actions'
import { toast } from 'sonner'
import {
  Send,
  Check,
  Loader2,
  Upload,
  X,
  FileText,
  AlertCircle,
  Phone
} from 'lucide-react'

interface JobDetailClientProps {
  jobId: string
  companyPhone: string | null
  hasApplied: boolean
  isLoggedIn: boolean
}

export function JobDetailClient({ jobId, companyPhone, hasApplied, isLoggedIn }: JobDetailClientProps) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [showPhone, setShowPhone] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [coverLetter, setCoverLetter] = useState('')
  const [contactPreference, setContactPreference] = useState('email')

  // Form fields for non-logged in users
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  const handlePhoneReveal = async () => {
    if (showPhone) {
      // Already showing, redirect to call
      window.location.href = `tel:${companyPhone}`
      return
    }

    const supabase = createClient()

    // Track phone reveal if user is logged in
    if (isLoggedIn) {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        await supabase.from('phone_reveals').insert({
          job_id: jobId,
          user_id: user.id
        })
      }
    }

    // Increment phone reveal count for all users (logged in or not)
    await supabase.rpc('increment_phone_reveal_count', { job_id_param: jobId })

    setShowPhone(true)
    toast.success('Telefon numarası gösteriliyor')
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!validTypes.includes(file.type)) {
      const errorMsg = 'Sadece PDF veya Word dosyası yükleyebilirsiniz'
      setError(errorMsg)
      toast.error(errorMsg)
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      const errorMsg = 'Dosya boyutu 5MB\'dan küçük olmalıdır'
      setError(errorMsg)
      toast.error(errorMsg)
      return
    }

    setCvFile(file)
    setError(null)
    toast.success('CV başarıyla yüklendi')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!cvFile) {
      const errorMsg = 'Lütfen CV yükleyin'
      setError(errorMsg)
      toast.error(errorMsg)
      return
    }

    // Validate fields for non-logged in users
    if (!isLoggedIn) {
      if (!fullName.trim()) {
        const errorMsg = 'Lütfen ad soyad girin'
        setError(errorMsg)
        toast.error(errorMsg)
        return
      }
      if (!email.trim()) {
        const errorMsg = 'Lütfen email girin'
        setError(errorMsg)
        toast.error(errorMsg)
        return
      }
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        const errorMsg = 'Lütfen geçerli bir email girin'
        setError(errorMsg)
        toast.error(errorMsg)
        return
      }
      if (!phone.trim()) {
        const errorMsg = 'Lütfen telefon numarası girin'
        setError(errorMsg)
        toast.error(errorMsg)
        return
      }
    }

    setLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()

      // Upload CV to Supabase Storage
      setUploading(true)
      toast.loading('CV yükleniyor...', { id: 'cv-upload' })
      const fileExt = cvFile.name.split('.').pop()
      const fileName = user ? `${user.id}/${jobId}-${Date.now()}.${fileExt}` : `guest/${jobId}-${Date.now()}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('cvs')
        .upload(fileName, cvFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError
      toast.success('CV başarıyla yüklendi', { id: 'cv-upload' })

      // Get public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('cvs')
        .getPublicUrl(fileName)

      setUploading(false)

      // Submit application using server action
      toast.loading('Başvurunuz gönderiliyor...', { id: 'application' })

      const result = await submitApplication(
        jobId,
        publicUrl,
        coverLetter || null,
        contactPreference,
        !isLoggedIn ? {
          fullName,
          email,
          phone
        } : undefined
      )

      if (!result.success) {
        throw new Error(result.error || 'Başvuru sırasında bir hata oluştu')
      }

      toast.success('Başvurunuz başarıyla gönderildi!', { id: 'application' })

      // Success - refresh page
      setShowModal(false)
      router.refresh()
    } catch (err: any) {
      const errorMsg = err.message || 'Başvuru sırasında bir hata oluştu'
      setError(errorMsg)
      toast.error(errorMsg)
      toast.dismiss('cv-upload')
      toast.dismiss('application')
    } finally {
      setLoading(false)
      setUploading(false)
    }
  }

  const handleApplyClick = () => {
    setShowModal(true)
  }

  return (
    <>
      {/* Apply Card */}
      <div className="bg-white rounded-xl border border-secondary-200 p-6 sticky top-24 z-10">
        {hasApplied ? (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <p className="font-semibold text-secondary-900 mb-2">Başvurdunuz</p>
            <p className="text-sm text-secondary-600 mb-4">
              Başvurunuz alındı. Şirket size geri dönecektir.
            </p>
            <button
              onClick={() => router.push('/dashboard/basvurularim')}
              className="w-full px-6 py-3 bg-secondary-100 hover:bg-secondary-200 text-secondary-900 font-medium rounded-lg transition-colors"
            >
              Başvurularımı Görüntüle
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">
              Hemen Başvur
            </h3>
            <button
              onClick={handleApplyClick}
              className="w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 mb-3"
            >
              <Send className="h-4 w-4" />
              Başvuru Yap
            </button>

            {companyPhone && (
              <button
                onClick={handlePhoneReveal}
                className="w-full px-6 py-3 bg-white border-2 border-primary-600 text-primary-600 hover:bg-primary-50 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 mb-4"
              >
                <Phone className="h-4 w-4" />
                {showPhone ? companyPhone : 'Telefonu Göster'}
              </button>
            )}

            <p className="text-xs text-secondary-500 text-center">
              Başvurunuz şirkete iletilecektir
            </p>
          </>
        )}
      </div>

      {/* Application Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-secondary-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-semibold text-secondary-900">Başvuru Yap</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-secondary-600" />
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-3">
              {/* Error Message */}
              {error && (
                <div className="p-3 bg-accent-50 border border-accent-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-accent-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-accent-700">{error}</p>
                </div>
              )}

              {/* Guest User Fields */}
              {!isLoggedIn && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label htmlFor="fullName" className="block text-xs font-medium text-secondary-900 mb-1">
                      Ad Soyad *
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Adınız ve soyadınız"
                      className="w-full px-3 py-1.5 bg-white border border-secondary-200 rounded-lg text-sm text-secondary-900 placeholder:text-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-xs font-medium text-secondary-900 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ornek@email.com"
                      className="w-full px-3 py-1.5 bg-white border border-secondary-200 rounded-lg text-sm text-secondary-900 placeholder:text-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-xs font-medium text-secondary-900 mb-1">
                      Telefon *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0555 555 55 55"
                      className="w-full px-3 py-1.5 bg-white border border-secondary-200 rounded-lg text-sm text-secondary-900 placeholder:text-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              )}

              {/* CV Upload */}
              <div>
                <label className="block text-xs font-medium text-secondary-900 mb-1">
                  CV Yükle *
                </label>

                {cvFile ? (
                  <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                    <FileText className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-green-900 truncate">
                        {cvFile.name}
                      </p>
                      <p className="text-xs text-green-600">
                        {(cvFile.size / 1024).toFixed(0)} KB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCvFile(null)}
                      className="p-1 hover:bg-green-100 rounded transition-colors"
                    >
                      <X className="h-3 w-3 text-green-700" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-secondary-300 rounded-lg cursor-pointer bg-white hover:bg-secondary-50 transition-colors">
                    <Upload className="h-5 w-5 text-secondary-400 mb-1" />
                    <p className="text-xs text-secondary-600">
                      <span className="font-semibold">Dosya seç</span>
                    </p>
                    <p className="text-xs text-secondary-500">PDF/Word (Max 5MB)</p>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Cover Letter & Contact Preference - Side by Side */}
              <div className="grid grid-cols-2 gap-3">
                {/* Cover Letter */}
                <div className="col-span-2">
                  <label htmlFor="coverLetter" className="block text-xs font-medium text-secondary-900 mb-1">
                    Ön Yazı (Opsiyonel)
                  </label>
                  <textarea
                    id="coverLetter"
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    rows={2}
                    placeholder="Kendinizi kısaca tanıtın..."
                    className="w-full px-3 py-1.5 bg-white border border-secondary-200 rounded-lg text-sm text-secondary-900 placeholder:text-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                  />
                </div>

                {/* Contact Preference */}
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-secondary-900 mb-1">
                    İletişim Tercihi
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="contactPreference"
                        value="email"
                        checked={contactPreference === 'email'}
                        onChange={(e) => setContactPreference(e.target.value)}
                        className="w-3.5 h-3.5 text-primary-600 border-secondary-300 focus:ring-primary-500"
                      />
                      <span className="text-xs text-secondary-900">Email</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="contactPreference"
                        value="phone"
                        checked={contactPreference === 'phone'}
                        onChange={(e) => setContactPreference(e.target.value)}
                        className="w-3.5 h-3.5 text-primary-600 border-secondary-300 focus:ring-primary-500"
                      />
                      <span className="text-xs text-secondary-900">Telefon</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* KVKK Consent */}
              <div className="p-2 bg-secondary-50 rounded-lg">
                <p className="text-xs text-secondary-600">
                  Başvuru yaparak, kişisel verilerimin işlenmesine ve şirket ile paylaşılmasına onay veriyorum.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || uploading || !cvFile}
                className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-secondary-300 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading || uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {uploading ? 'Yükleniyor...' : 'Gönderiliyor...'}
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Başvuruyu Gönder
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
