'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Briefcase, Plus, Edit2, Trash2, Calendar, MapPin, Building, ChefHat } from 'lucide-react'
import {
  JobPositionType,
  VenueType,
  JOB_POSITION_LABELS,
  VENUE_TYPE_LABELS,
  getPositionsGrouped,
} from '@/lib/types/service-industry'

interface Experience {
  id: string
  company_name: string
  position: string
  position_type: JobPositionType | null
  venue_type: VenueType | null
  description: string | null
  start_date: string
  end_date: string | null
  is_current: boolean
  location: string | null
}

interface ExperiencesSectionEnhancedProps {
  candidateId: string
  experiences: Experience[]
}

export function ExperiencesSectionEnhanced({ candidateId, experiences: initialExperiences }: ExperiencesSectionEnhancedProps) {
  const [experiences, setExperiences] = useState(initialExperiences)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    company_name: '',
    position: '',
    position_type: '' as JobPositionType | '',
    venue_type: '' as VenueType | '',
    description: '',
    start_date: '',
    end_date: '',
    is_current: false,
    location: '',
  })

  const resetForm = () => {
    setFormData({
      company_name: '',
      position: '',
      position_type: '',
      venue_type: '',
      description: '',
      start_date: '',
      end_date: '',
      is_current: false,
      location: '',
    })
    setEditingId(null)
  }

  const handleAdd = () => {
    resetForm()
    setIsModalOpen(true)
  }

  const handleEdit = (exp: Experience) => {
    setFormData({
      company_name: exp.company_name,
      position: exp.position,
      position_type: exp.position_type || '',
      venue_type: exp.venue_type || '',
      description: exp.description || '',
      start_date: exp.start_date,
      end_date: exp.end_date || '',
      is_current: exp.is_current,
      location: exp.location || '',
    })
    setEditingId(exp.id)
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()

    try {
      const dataToSave = {
        company_name: formData.company_name,
        position: formData.position,
        position_type: formData.position_type || null,
        venue_type: formData.venue_type || null,
        description: formData.description || null,
        start_date: formData.start_date,
        end_date: formData.is_current ? null : formData.end_date || null,
        is_current: formData.is_current,
        location: formData.location || null,
      }

      if (editingId) {
        // Update
        const { error } = await supabase
          .from('experiences')
          .update(dataToSave)
          .eq('id', editingId)

        if (error) throw error

        setExperiences(experiences.map(exp =>
          exp.id === editingId
            ? { ...exp, ...dataToSave }
            : exp
        ))
      } else {
        // Insert
        const { data, error } = await supabase
          .from('experiences')
          .insert({
            candidate_id: candidateId,
            ...dataToSave,
          })
          .select()
          .single()

        if (error) throw error
        if (data) setExperiences([...experiences, data])
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
    if (!confirm('Bu deneyimi silmek istediğinizden emin misiniz?')) return

    setIsLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('experiences')
        .delete()
        .eq('id', id)

      if (error) throw error
      setExperiences(experiences.filter(exp => exp.id !== id))
    } catch (error: any) {
      alert(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long'
    })
  }

  // Calculate duration
  const calculateDuration = (startDate: string, endDate: string | null, isCurrent: boolean) => {
    const start = new Date(startDate)
    const end = isCurrent ? new Date() : endDate ? new Date(endDate) : new Date()

    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
    const years = Math.floor(months / 12)
    const remainingMonths = months % 12

    if (years > 0 && remainingMonths > 0) {
      return `${years} yıl ${remainingMonths} ay`
    } else if (years > 0) {
      return `${years} yıl`
    } else {
      return `${remainingMonths} ay`
    }
  }

  const positionsGrouped = getPositionsGrouped()

  return (
    <>
      <div id="deneyimler" className="bg-white rounded-xl border border-secondary-200">
        <div className="p-6 border-b border-secondary-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-secondary-900">Deneyimler</h2>
            <p className="text-sm text-secondary-600 mt-0.5">
              Hizmet sektöründeki iş deneyimlerinizi ekleyin
            </p>
          </div>
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            Deneyim Ekle
          </button>
        </div>

        <div className="p-6">
          {experiences.length > 0 ? (
            <div className="space-y-4">
              {experiences.map((exp) => (
                <div
                  key={exp.id}
                  className="border border-secondary-200 rounded-lg p-4 hover:border-secondary-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary-100 rounded-lg">
                          <Briefcase className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-secondary-900">{exp.position}</h3>
                          <p className="text-sm text-secondary-700">{exp.company_name}</p>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-2 mt-2">
                            {exp.position_type && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-50 text-primary-700 text-xs rounded-full">
                                <ChefHat className="h-3 w-3" />
                                {JOB_POSITION_LABELS[exp.position_type]}
                              </span>
                            )}
                            {exp.venue_type && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-secondary-100 text-secondary-700 text-xs rounded-full">
                                <Building className="h-3 w-3" />
                                {VENUE_TYPE_LABELS[exp.venue_type]}
                              </span>
                            )}
                          </div>

                          {/* Date and Location */}
                          <div className="flex items-center flex-wrap gap-3 text-sm text-secondary-600 mt-3">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {formatDate(exp.start_date)} - {exp.is_current ? 'Devam Ediyor' : exp.end_date ? formatDate(exp.end_date) : 'Bilinmiyor'}
                              </span>
                              <span className="text-secondary-400 ml-1">
                                ({calculateDuration(exp.start_date, exp.end_date, exp.is_current)})
                              </span>
                            </div>
                            {exp.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span>{exp.location}</span>
                              </div>
                            )}
                          </div>

                          {exp.description && (
                            <p className="text-sm text-secondary-700 mt-3 whitespace-pre-wrap">
                              {exp.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(exp)}
                        className="p-2 text-secondary-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(exp.id)}
                        className="p-2 text-secondary-600 hover:text-accent-600 hover:bg-accent-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 text-secondary-300 mx-auto mb-3" />
              <p className="text-sm text-secondary-600 mb-2">Henüz deneyim eklenmedi</p>
              <p className="text-xs text-secondary-500">
                İş deneyimlerinizi ekleyerek profilinizi güçlendirin
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-secondary-200">
              <h3 className="text-lg font-semibold text-secondary-900">
                {editingId ? 'Deneyimi Düzenle' : 'Yeni Deneyim Ekle'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-900 mb-2">
                    Pozisyon Başlığı *
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-4 py-2 bg-white border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Örn: Kıdemli Garson"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-900 mb-2">
                    Şirket/İşyeri Adı *
                  </label>
                  <input
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    className="w-full px-4 py-2 bg-white border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Örn: Nusr-Et Steakhouse"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-900 mb-2">
                    Pozisyon Kategorisi
                  </label>
                  <select
                    value={formData.position_type}
                    onChange={(e) => setFormData({ ...formData, position_type: e.target.value as JobPositionType })}
                    className="w-full px-4 py-2 bg-white border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Seçiniz (Opsiyonel)</option>
                    {positionsGrouped.map((group) => (
                      <optgroup key={group.category} label={group.categoryLabel}>
                        {group.positions.map((pos) => (
                          <option key={pos.value} value={pos.value}>{pos.label}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-900 mb-2">
                    Mekan Türü
                  </label>
                  <select
                    value={formData.venue_type}
                    onChange={(e) => setFormData({ ...formData, venue_type: e.target.value as VenueType })}
                    className="w-full px-4 py-2 bg-white border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Seçiniz (Opsiyonel)</option>
                    {Object.entries(VENUE_TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-900 mb-2">
                    Başlangıç Tarihi *
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-4 py-2 bg-white border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-900 mb-2">
                    Bitiş Tarihi
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-4 py-2 bg-white border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    disabled={formData.is_current}
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_current}
                    onChange={(e) => setFormData({ ...formData, is_current: e.target.checked, end_date: '' })}
                    className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-secondary-900">Şu anda burada çalışıyorum</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-900 mb-2">
                  Lokasyon
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="İstanbul, Türkiye"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-900 mb-2">
                  Açıklama
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 bg-white border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  placeholder="- Günlük 200+ müşteriye hizmet verdim&#10;- Takım liderliği yaptım&#10;- Eğitim verdiğim personel sayısı: 10+"
                />
                <p className="text-xs text-secondary-500 mt-1">
                  Başarılarınızı ve sorumluluklarınızı maddeler halinde yazabilirsiniz
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
