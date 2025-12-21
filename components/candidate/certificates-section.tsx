'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Award, Plus, Edit2, Trash2, Calendar, ExternalLink, Upload, Loader2 } from 'lucide-react'
import {
  CertificateType,
  CERTIFICATE_TYPE_LABELS,
} from '@/lib/types/service-industry'

interface Certificate {
  id: string
  certificate_type: CertificateType
  certificate_name: string
  issuing_organization: string | null
  issue_date: string | null
  expiry_date: string | null
  verification_url: string | null
  is_verified: boolean
}

interface CertificatesSectionProps {
  candidateId: string
  certificates: Certificate[]
}

export function CertificatesSection({ candidateId, certificates: initialCertificates }: CertificatesSectionProps) {
  const [certificates, setCertificates] = useState(initialCertificates)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    certificate_type: '' as CertificateType | '',
    certificate_name: '',
    issuing_organization: '',
    issue_date: '',
    expiry_date: '',
    verification_url: '',
  })

  const resetForm = () => {
    setFormData({
      certificate_type: '',
      certificate_name: '',
      issuing_organization: '',
      issue_date: '',
      expiry_date: '',
      verification_url: '',
    })
    setEditingId(null)
  }

  const handleAdd = () => {
    resetForm()
    setIsModalOpen(true)
  }

  const handleEdit = (cert: Certificate) => {
    setFormData({
      certificate_type: cert.certificate_type,
      certificate_name: cert.certificate_name || '',
      issuing_organization: cert.issuing_organization || '',
      issue_date: cert.issue_date || '',
      expiry_date: cert.expiry_date || '',
      verification_url: cert.verification_url || '',
    })
    setEditingId(cert.id)
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.certificate_type) return

    setIsLoading(true)

    const supabase = createClient()

    try {
      if (editingId) {
        // Update
        const { error } = await supabase
          .from('candidate_certificates')
          .update({
            certificate_type: formData.certificate_type,
            certificate_name: formData.certificate_name || CERTIFICATE_TYPE_LABELS[formData.certificate_type as CertificateType] || formData.certificate_type,
            issuing_organization: formData.issuing_organization || null,
            issue_date: formData.issue_date || null,
            expiry_date: formData.expiry_date || null,
            verification_url: formData.verification_url || null,
          })
          .eq('id', editingId)

        if (error) throw error

        setCertificates(certificates.map(cert =>
          cert.id === editingId
            ? {
                ...cert,
                certificate_type: formData.certificate_type as CertificateType,
                certificate_name: formData.certificate_name || CERTIFICATE_TYPE_LABELS[formData.certificate_type as CertificateType] || formData.certificate_type,
                issuing_organization: formData.issuing_organization || null,
                issue_date: formData.issue_date || null,
                expiry_date: formData.expiry_date || null,
                verification_url: formData.verification_url || null,
              }
            : cert
        ))
      } else {
        // Insert
        const { data, error } = await supabase
          .from('candidate_certificates')
          .insert({
            candidate_id: candidateId,
            certificate_type: formData.certificate_type,
            certificate_name: formData.certificate_name || CERTIFICATE_TYPE_LABELS[formData.certificate_type as CertificateType] || formData.certificate_type,
            issuing_organization: formData.issuing_organization || null,
            issue_date: formData.issue_date || null,
            expiry_date: formData.expiry_date || null,
            verification_url: formData.verification_url || null,
          })
          .select()
          .single()

        if (error) throw error
        if (data) setCertificates([...certificates, data])
      }

      setIsModalOpen(false)
      resetForm()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu sertifikayı silmek istediğinizden emin misiniz?')) return

    setIsLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('candidate_certificates')
        .delete()
        .eq('id', id)

      if (error) throw error
      setCertificates(certificates.filter(cert => cert.id !== id))
    } catch (error: any) {
      alert(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long'
    })
  }

  const isExpired = (expiryDate: string | null) => {
    if (!expiryDate) return false
    return new Date(expiryDate) < new Date()
  }

  // Group certificates by category
  const categorizedCertificates = {
    mandatory: certificates.filter(c => ['hygiene_certificate', 'food_safety', 'health_certificate', 'alcohol_license'].includes(c.certificate_type)),
    professional: certificates.filter(c => ['culinary_arts', 'pastry_arts', 'barista_certification', 'sommelier_certification', 'bartending_license', 'mixology_certification', 'food_styling'].includes(c.certificate_type)),
    driver: certificates.filter(c => ['driver_license_a', 'driver_license_b', 'src_certificate'].includes(c.certificate_type)),
    safety: certificates.filter(c => ['first_aid', 'fire_safety', 'occupational_safety'].includes(c.certificate_type)),
    language: certificates.filter(c => ['english_certificate', 'german_certificate', 'arabic_certificate'].includes(c.certificate_type)),
    other: certificates.filter(c => ['haccp', 'iso_22000', 'other'].includes(c.certificate_type)),
  }

  return (
    <>
      <div id="sertifikalar" className="bg-white rounded-xl border border-secondary-200">
        <div className="p-6 border-b border-secondary-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-secondary-900">Sertifikalar</h2>
            <p className="text-sm text-secondary-600 mt-0.5">
              Mesleki sertifikalarınızı ve belgelerinizi ekleyin
            </p>
          </div>
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            Sertifika Ekle
          </button>
        </div>

        <div className="p-6">
          {certificates.length > 0 ? (
            <div className="space-y-6">
              {/* Mandatory Certificates */}
              {categorizedCertificates.mandatory.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-secondary-500 mb-3">Zorunlu Belgeler</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {categorizedCertificates.mandatory.map((cert) => (
                      <CertificateCard
                        key={cert.id}
                        certificate={cert}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        formatDate={formatDate}
                        isExpired={isExpired}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Professional Certificates */}
              {categorizedCertificates.professional.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-secondary-500 mb-3">Mesleki Sertifikalar</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {categorizedCertificates.professional.map((cert) => (
                      <CertificateCard
                        key={cert.id}
                        certificate={cert}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        formatDate={formatDate}
                        isExpired={isExpired}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Driver Certificates */}
              {categorizedCertificates.driver.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-secondary-500 mb-3">Sürücü Belgeleri</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {categorizedCertificates.driver.map((cert) => (
                      <CertificateCard
                        key={cert.id}
                        certificate={cert}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        formatDate={formatDate}
                        isExpired={isExpired}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Safety Certificates */}
              {categorizedCertificates.safety.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-secondary-500 mb-3">İş Güvenliği</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {categorizedCertificates.safety.map((cert) => (
                      <CertificateCard
                        key={cert.id}
                        certificate={cert}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        formatDate={formatDate}
                        isExpired={isExpired}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Language Certificates */}
              {categorizedCertificates.language.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-secondary-500 mb-3">Dil Sertifikaları</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {categorizedCertificates.language.map((cert) => (
                      <CertificateCard
                        key={cert.id}
                        certificate={cert}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        formatDate={formatDate}
                        isExpired={isExpired}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Other Certificates */}
              {categorizedCertificates.other.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-secondary-500 mb-3">Diğer</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {categorizedCertificates.other.map((cert) => (
                      <CertificateCard
                        key={cert.id}
                        certificate={cert}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        formatDate={formatDate}
                        isExpired={isExpired}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Award className="h-12 w-12 text-secondary-300 mx-auto mb-3" />
              <p className="text-sm text-secondary-600 mb-2">Henüz sertifika eklenmedi</p>
              <p className="text-xs text-secondary-500">
                Hijyen sertifikası, ehliyet gibi belgelerinizi ekleyerek profilinizi güçlendirin
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-secondary-200">
              <h3 className="text-lg font-semibold text-secondary-900">
                {editingId ? 'Sertifikayı Düzenle' : 'Yeni Sertifika Ekle'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-900 mb-2">
                  Sertifika Türü *
                </label>
                <select
                  value={formData.certificate_type}
                  onChange={(e) => setFormData({ ...formData, certificate_type: e.target.value as CertificateType })}
                  className="w-full px-4 py-2 bg-white border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Seçiniz...</option>
                  <optgroup label="Zorunlu Belgeler">
                    <option value="hygiene_certificate">Hijyen Sertifikası</option>
                    <option value="food_safety">Gıda Güvenliği Sertifikası</option>
                    <option value="health_certificate">Sağlık Karnesi / Portör</option>
                    <option value="alcohol_license">Alkollü İçki Satış Belgesi</option>
                  </optgroup>
                  <optgroup label="Mesleki Sertifikalar">
                    <option value="culinary_arts">Aşçılık Diploması</option>
                    <option value="pastry_arts">Pastacılık Sertifikası</option>
                    <option value="barista_certification">Barista Sertifikası</option>
                    <option value="sommelier_certification">Sommelier Sertifikası</option>
                    <option value="bartending_license">Barmenlik Sertifikası</option>
                    <option value="mixology_certification">Mixology Sertifikası</option>
                    <option value="food_styling">Yemek Süsleme Sertifikası</option>
                  </optgroup>
                  <optgroup label="Sürücü Belgeleri">
                    <option value="driver_license_a">A Sınıfı Ehliyet</option>
                    <option value="driver_license_b">B Sınıfı Ehliyet</option>
                    <option value="src_certificate">SRC Belgesi</option>
                  </optgroup>
                  <optgroup label="İş Güvenliği">
                    <option value="first_aid">İlk Yardım Sertifikası</option>
                    <option value="fire_safety">Yangın Güvenliği</option>
                    <option value="occupational_safety">İş Güvenliği Sertifikası</option>
                  </optgroup>
                  <optgroup label="Dil Sertifikaları">
                    <option value="english_certificate">İngilizce Sertifikası</option>
                    <option value="german_certificate">Almanca Sertifikası</option>
                    <option value="arabic_certificate">Arapça Sertifikası</option>
                  </optgroup>
                  <optgroup label="Diğer">
                    <option value="haccp">HACCP Sertifikası</option>
                    <option value="iso_22000">ISO 22000 Sertifikası</option>
                    <option value="other">Diğer</option>
                  </optgroup>
                </select>
              </div>

              {formData.certificate_type === 'other' && (
                <div>
                  <label className="block text-sm font-medium text-secondary-900 mb-2">
                    Sertifika Adı *
                  </label>
                  <input
                    type="text"
                    value={formData.certificate_name}
                    onChange={(e) => setFormData({ ...formData, certificate_name: e.target.value })}
                    className="w-full px-4 py-2 bg-white border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required={formData.certificate_type === 'other'}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-secondary-900 mb-2">
                  Veren Kurum
                </label>
                <input
                  type="text"
                  value={formData.issuing_organization}
                  onChange={(e) => setFormData({ ...formData, issuing_organization: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Örn: Milli Eğitim Bakanlığı, TOBB"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-900 mb-2">
                    Alınma Tarihi
                  </label>
                  <input
                    type="date"
                    value={formData.issue_date}
                    onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                    className="w-full px-4 py-2 bg-white border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-900 mb-2">
                    Geçerlilik Tarihi
                  </label>
                  <input
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                    className="w-full px-4 py-2 bg-white border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-900 mb-2">
                  Sertifika Bağlantısı (Opsiyonel)
                </label>
                <input
                  type="url"
                  value={formData.verification_url}
                  onChange={(e) => setFormData({ ...formData, verification_url: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="https://..."
                />
                <p className="text-xs text-secondary-500 mt-1">
                  Sertifikanızın doğrulama linkini veya PDF bağlantısını ekleyebilirsiniz
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false)
                    resetForm()
                  }}
                  className="px-4 py-2 text-secondary-700 hover:bg-secondary-50 font-medium rounded-lg transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-secondary-300 text-white font-medium rounded-lg transition-colors"
                >
                  {isLoading ? 'Kaydediliyor...' : editingId ? 'Güncelle' : 'Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

// Certificate Card Component
function CertificateCard({
  certificate,
  onEdit,
  onDelete,
  formatDate,
  isExpired,
}: {
  certificate: Certificate
  onEdit: (cert: Certificate) => void
  onDelete: (id: string) => void
  formatDate: (date: string | null) => string | null
  isExpired: (date: string | null) => boolean
}) {
  const expired = isExpired(certificate.expiry_date)

  return (
    <div
      className={`border rounded-lg p-4 transition-colors ${
        expired
          ? 'border-accent-200 bg-accent-50'
          : certificate.is_verified
          ? 'border-green-200 bg-green-50'
          : 'border-secondary-200 hover:border-secondary-300'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Award className={`h-4 w-4 flex-shrink-0 ${
              expired ? 'text-accent-500' : certificate.is_verified ? 'text-green-600' : 'text-primary-500'
            }`} />
            <h4 className="font-medium text-secondary-900 truncate">
              {certificate.certificate_type === 'other' && certificate.certificate_name
                ? certificate.certificate_name
                : CERTIFICATE_TYPE_LABELS[certificate.certificate_type]}
            </h4>
          </div>

          {certificate.issuing_organization && (
            <p className="text-sm text-secondary-600 mb-2">
              {certificate.issuing_organization}
            </p>
          )}

          <div className="flex items-center gap-3 text-xs text-secondary-500">
            {certificate.issue_date && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(certificate.issue_date)}
              </span>
            )}
            {certificate.expiry_date && (
              <span className={`flex items-center gap-1 ${expired ? 'text-accent-600 font-medium' : ''}`}>
                {expired ? 'Süresi doldu:' : 'Geçerlilik:'} {formatDate(certificate.expiry_date)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-2">
            {certificate.is_verified && (
              <span className="inline-flex items-center px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                Doğrulanmış
              </span>
            )}
            {expired && (
              <span className="inline-flex items-center px-2 py-0.5 bg-accent-100 text-accent-700 text-xs rounded-full">
                Süresi Dolmuş
              </span>
            )}
            {certificate.verification_url && (
              <a
                href={certificate.verification_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700"
              >
                <ExternalLink className="h-3 w-3" />
                Görüntüle
              </a>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(certificate)}
            className="p-1.5 text-secondary-600 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(certificate.id)}
            className="p-1.5 text-secondary-600 hover:text-accent-600 hover:bg-accent-50 rounded transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
