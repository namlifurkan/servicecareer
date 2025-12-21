'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Globe, Plus, Edit2, Trash2 } from 'lucide-react'
import {
  LanguageCode,
  LanguageLevel,
  LANGUAGE_LABELS,
  LANGUAGE_LEVEL_LABELS,
} from '@/lib/types/service-industry'

interface Language {
  id: string
  language_code: string
  language_name: string
  speaking_level: string
}

interface LanguagesSectionProps {
  candidateId: string
  languages: Language[]
}

export function LanguagesSection({ candidateId, languages: initialLanguages }: LanguagesSectionProps) {
  const [languages, setLanguages] = useState(initialLanguages)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    language_code: '',
    language_name: '',
    speaking_level: '',
  })

  const resetForm = () => {
    setFormData({
      language_code: '',
      language_name: '',
      speaking_level: '',
    })
    setEditingId(null)
  }

  const handleAdd = () => {
    resetForm()
    setIsModalOpen(true)
  }

  const handleEdit = (lang: Language) => {
    setFormData({
      language_code: lang.language_code,
      language_name: lang.language_name,
      speaking_level: lang.speaking_level,
    })
    setEditingId(lang.id)
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.language_code || !formData.speaking_level) return

    setIsLoading(true)

    const supabase = createClient()
    const languageName = LANGUAGE_LABELS[formData.language_code as LanguageCode] || formData.language_code

    try {
      if (editingId) {
        // Update
        const { error } = await supabase
          .from('candidate_languages')
          .update({
            language_code: formData.language_code,
            language_name: languageName,
            speaking_level: formData.speaking_level,
          })
          .eq('id', editingId)

        if (error) throw error

        setLanguages(languages.map(lang =>
          lang.id === editingId
            ? {
                ...lang,
                language_code: formData.language_code,
                language_name: languageName,
                speaking_level: formData.speaking_level,
              }
            : lang
        ))
      } else {
        // Check if language already exists
        const exists = languages.some(l => l.language_code === formData.language_code)
        if (exists) {
          alert('Bu dil zaten eklenmiş')
          setIsLoading(false)
          return
        }

        // Insert
        const { data, error } = await supabase
          .from('candidate_languages')
          .insert({
            candidate_id: candidateId,
            language_code: formData.language_code,
            language_name: languageName,
            speaking_level: formData.speaking_level,
          })
          .select()
          .single()

        if (error) throw error
        if (data) setLanguages([...languages, data])
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
    if (!confirm('Bu dili silmek istediğinizden emin misiniz?')) return

    setIsLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('candidate_languages')
        .delete()
        .eq('id', id)

      if (error) throw error
      setLanguages(languages.filter(lang => lang.id !== id))
    } catch (error: any) {
      alert(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Get proficiency color
  const getProficiencyColor = (level: string) => {
    if (level === 'native') return 'bg-green-100 text-green-700'
    if (level === 'C1' || level === 'C2') return 'bg-blue-100 text-blue-700'
    if (level === 'B1' || level === 'B2') return 'bg-yellow-100 text-yellow-700'
    return 'bg-secondary-100 text-secondary-700'
  }

  // Get progress percentage
  const getProgressPercentage = (level: string) => {
    const levels: Record<string, number> = {
      'A1': 15,
      'A2': 30,
      'B1': 50,
      'B2': 65,
      'C1': 80,
      'C2': 95,
      'native': 100
    }
    return levels[level] || 0
  }

  return (
    <>
      <div id="diller" className="bg-white rounded-xl border border-secondary-200">
        <div className="p-6 border-b border-secondary-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-secondary-900">Dil Bilgisi</h2>
            <p className="text-sm text-secondary-600 mt-0.5">
              Bildiğiniz dilleri ve seviyelerinizi ekleyin
            </p>
          </div>
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            Dil Ekle
          </button>
        </div>

        <div className="p-6">
          {languages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {languages.map((lang) => (
                <div
                  key={lang.id}
                  className="border border-secondary-200 rounded-lg p-4 hover:border-secondary-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-primary-500" />
                      <div>
                        <h4 className="font-medium text-secondary-900">
                          {lang.language_name || LANGUAGE_LABELS[lang.language_code as LanguageCode] || lang.language_code}
                        </h4>
                        <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${getProficiencyColor(lang.speaking_level)}`}>
                          {lang.speaking_level === 'native' ? 'Ana Dil' : LANGUAGE_LEVEL_LABELS[lang.speaking_level as LanguageLevel] || lang.speaking_level}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(lang)}
                        className="p-1.5 text-secondary-600 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(lang.id)}
                        className="p-1.5 text-secondary-600 hover:text-accent-600 hover:bg-accent-50 rounded transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2 bg-secondary-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        lang.speaking_level === 'native'
                          ? 'bg-green-500'
                          : 'bg-primary-500'
                      }`}
                      style={{ width: `${getProgressPercentage(lang.speaking_level)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Globe className="h-12 w-12 text-secondary-300 mx-auto mb-3" />
              <p className="text-sm text-secondary-600 mb-2">Henüz dil eklenmedi</p>
              <p className="text-xs text-secondary-500">
                Birden fazla dil bilmek, hizmet sektöründe avantaj sağlar
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-secondary-200">
              <h3 className="text-lg font-semibold text-secondary-900">
                {editingId ? 'Dil Bilgisini Düzenle' : 'Yeni Dil Ekle'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-900 mb-2">
                  Dil *
                </label>
                <select
                  value={formData.language_code}
                  onChange={(e) => setFormData({ ...formData, language_code: e.target.value as LanguageCode })}
                  className="w-full px-4 py-2 bg-white border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Seçiniz...</option>
                  {Object.entries(LANGUAGE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-900 mb-2">
                  Seviye *
                </label>
                <select
                  value={formData.speaking_level}
                  onChange={(e) => setFormData({ ...formData, speaking_level: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Seçiniz...</option>
                  <option value="native">Ana Dil</option>
                  <option value="C2">C2 - Uzman</option>
                  <option value="C1">C1 - İleri</option>
                  <option value="B2">B2 - Orta</option>
                  <option value="B1">B1 - Orta Altı</option>
                  <option value="A2">A2 - Temel</option>
                  <option value="A1">A1 - Başlangıç</option>
                </select>
                <p className="text-xs text-secondary-500 mt-2">
                  Avrupa Dil Portfolyosu (CEFR) seviyesine göre değerlendirin
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
