'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { GraduationCap, Plus, Edit2, Trash2, Calendar } from 'lucide-react'

interface Education {
  id: string
  school_name: string
  department: string | null
  degree: string
  description: string | null
  start_date: string
  end_date: string | null
  is_current: boolean
  gpa: number | null
}

interface EducationsSectionProps {
  candidateId: string
  educations: Education[]
}

const degreeLabels: Record<string, string> = {
  high_school: 'Lise',
  associate: 'Ön Lisans',
  bachelor: 'Lisans',
  master: 'Yüksek Lisans',
  doctorate: 'Doktora'
}

export function EducationsSection({ candidateId, educations: initialEducations }: EducationsSectionProps) {
  const [educations, setEducations] = useState(initialEducations)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    school_name: '',
    department: '',
    degree: 'bachelor',
    description: '',
    start_date: '',
    end_date: '',
    is_current: false,
    gpa: '',
  })

  const resetForm = () => {
    setFormData({
      school_name: '',
      department: '',
      degree: 'bachelor',
      description: '',
      start_date: '',
      end_date: '',
      is_current: false,
      gpa: '',
    })
    setEditingId(null)
  }

  const handleAdd = () => {
    resetForm()
    setIsModalOpen(true)
  }

  const handleEdit = (edu: Education) => {
    setFormData({
      school_name: edu.school_name,
      department: edu.department || '',
      degree: edu.degree,
      description: edu.description || '',
      start_date: edu.start_date,
      end_date: edu.end_date || '',
      is_current: edu.is_current,
      gpa: edu.gpa?.toString() || '',
    })
    setEditingId(edu.id)
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()

    try {
      const payload = {
        ...formData,
        end_date: formData.is_current ? null : formData.end_date,
        gpa: formData.gpa ? parseFloat(formData.gpa) : null,
      }

      if (editingId) {
        // Update
        const { error } = await supabase
          .from('educations')
          .update(payload)
          .eq('id', editingId)

        if (error) throw error

        setEducations(educations.map(edu =>
          edu.id === editingId
            ? { ...edu, ...payload }
            : edu
        ))
      } else {
        // Insert
        const { data, error } = await supabase
          .from('educations')
          .insert({
            candidate_id: candidateId,
            ...payload,
          })
          .select()
          .single()

        if (error) throw error
        if (data) setEducations([...educations, data])
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
    if (!confirm('Bu eğitimi silmek istediğinizden emin misiniz?')) return

    setIsLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('educations')
        .delete()
        .eq('id', id)

      if (error) throw error
      setEducations(educations.filter(edu => edu.id !== id))
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

  return (
    <>
      <div id="egitim" className="bg-white rounded-xl border border-secondary-200">
        <div className="p-6 border-b border-secondary-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-secondary-900">Eğitim</h2>
            <p className="text-sm text-secondary-600 mt-0.5">
              Eğitim geçmişini ve mezuniyet bilgilerini ekle
            </p>
          </div>
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            Eğitim Ekle
          </button>
        </div>

        <div className="p-6">
          {educations.length > 0 ? (
            <div className="space-y-4">
              {educations.map((edu) => (
                <div
                  key={edu.id}
                  className="border border-secondary-200 rounded-lg p-4 hover:border-secondary-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-secondary-900">{edu.school_name}</h3>
                        <span className="px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-700 rounded-full">
                          {degreeLabels[edu.degree]}
                        </span>
                      </div>
                      {edu.department && (
                        <p className="text-sm text-secondary-700">{edu.department}</p>
                      )}
                      <div className="flex items-center gap-2 text-sm text-secondary-600 mt-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {formatDate(edu.start_date)} - {edu.is_current ? 'Devam Ediyor' : edu.end_date ? formatDate(edu.end_date) : 'Bilinmiyor'}
                        </span>
                        {edu.gpa && (
                          <>
                            <span>•</span>
                            <span>GPA: {edu.gpa.toFixed(2)}</span>
                          </>
                        )}
                      </div>
                      {edu.description && (
                        <p className="text-sm text-secondary-700 mt-3 whitespace-pre-wrap">
                          {edu.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(edu)}
                        className="p-2 text-secondary-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(edu.id)}
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
              <GraduationCap className="h-12 w-12 text-secondary-300 mx-auto mb-3" />
              <p className="text-sm text-secondary-600">Henüz eğitim bilgisi eklenmedi</p>
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
                {editingId ? 'Eğitimi Düzenle' : 'Yeni Eğitim Ekle'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-secondary-900 mb-2">
                    Okul Adı *
                  </label>
                  <input
                    type="text"
                    value={formData.school_name}
                    onChange={(e) => setFormData({ ...formData, school_name: e.target.value })}
                    className="w-full px-4 py-2 bg-white border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="İstanbul Üniversitesi"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-900 mb-2">
                    Bölüm
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-2 bg-white border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Turizm ve Otel İşletmeciliği"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-900 mb-2">
                    Derece *
                  </label>
                  <select
                    value={formData.degree}
                    onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                    className="w-full px-4 py-2 bg-white border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    {Object.entries(degreeLabels).map(([value, label]) => (
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
                    Mezuniyet Tarihi
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
                  <span className="text-sm text-secondary-900">Şu anda burada okuyorum</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-900 mb-2">
                  Not Ortalaması (GPA)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="4"
                  value={formData.gpa}
                  onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="3.50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-900 mb-2">
                  Açıklama
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-white border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  placeholder="Aldığın ödüller, sertifikalar veya özel başarılar..."
                />
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
