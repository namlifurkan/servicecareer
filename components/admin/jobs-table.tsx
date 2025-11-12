'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Check,
  X,
  Search,
  Building2,
  MapPin,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Eye,
  Briefcase,
  FileText
} from 'lucide-react'
import Link from 'next/link'

interface Job {
  id: string
  title: string
  slug: string
  description: string
  status: 'draft' | 'active' | 'closed'
  work_type: string | null
  experience_level: string | null
  location_city: string
  location_district: string | null
  salary_min: number | null
  salary_max: number | null
  show_salary: boolean
  created_at: string
  published_at: string | null
  view_count: number
  application_count: number
  companies: {
    id: string
    name: string
    logo_url: string | null
    is_verified: boolean
  } | null
  cities: {
    id: string
    name: string
  } | null
  categories: {
    id: string
    name: string
  } | null
}

interface JobsTableProps {
  jobs: Job[]
}

const workTypeLabels: Record<string, string> = {
  'full_time': 'Tam Zamanlı',
  'part_time': 'Yarı Zamanlı',
  'contract': 'Sözleşmeli',
  'freelance': 'Serbest',
  'internship': 'Staj'
}

const experienceLevelLabels: Record<string, string> = {
  'entry': 'Deneyimsiz',
  'junior': 'Deneyimli',
  'mid': 'Kıdemli',
  'senior': 'Uzman',
  'lead': 'Lider',
  'executive': 'Yönetici'
}

const statusLabels: Record<string, string> = {
  'draft': 'Taslak',
  'active': 'Aktif',
  'closed': 'Kapalı'
}

export function JobsTable({ jobs: initialJobs }: JobsTableProps) {
  const [jobs, setJobs] = useState(initialJobs)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'active' | 'closed'>('all')
  const [loading, setLoading] = useState<string | null>(null)

  const filteredJobs = jobs.filter(job => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.companies?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location_city.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus =
      statusFilter === 'all' || job.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleApprove = async (jobId: string) => {
    setLoading(jobId)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('jobs')
        .update({
          status: 'active',
          published_at: new Date().toISOString()
        })
        .eq('id', jobId)

      if (error) throw error

      setJobs(jobs.map(j =>
        j.id === jobId ? { ...j, status: 'active' as const, published_at: new Date().toISOString() } : j
      ))

      toast.success('İlan onaylandı ve yayınlandı')
    } catch (error: any) {
      toast.error(error.message || 'İşlem başarısız')
    } finally {
      setLoading(null)
    }
  }

  const handleReject = async (jobId: string) => {
    setLoading(jobId)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('jobs')
        .update({ status: 'closed' })
        .eq('id', jobId)

      if (error) throw error

      setJobs(jobs.map(j =>
        j.id === jobId ? { ...j, status: 'closed' as const } : j
      ))

      toast.success('İlan reddedildi')
    } catch (error: any) {
      toast.error(error.message || 'İşlem başarısız')
    } finally {
      setLoading(null)
    }
  }

  const handleDelete = async (jobId: string) => {
    if (!confirm('Bu ilanı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      return
    }

    setLoading(jobId)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId)

      if (error) throw error

      setJobs(jobs.filter(j => j.id !== jobId))

      toast.success('İlan silindi')
    } catch (error: any) {
      toast.error(error.message || 'İşlem başarısız')
    } finally {
      setLoading(null)
    }
  }

  const stats = {
    total: jobs.length,
    draft: jobs.filter(j => j.status === 'draft').length,
    active: jobs.filter(j => j.status === 'active').length,
    closed: jobs.filter(j => j.status === 'closed').length,
    totalViews: jobs.reduce((sum, j) => sum + j.view_count, 0),
    totalApplications: jobs.reduce((sum, j) => sum + j.application_count, 0)
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl border border-secondary-200 p-4">
          <div className="text-2xl font-semibold text-secondary-900">{stats.total}</div>
          <div className="text-sm text-secondary-600">Toplam İlan</div>
        </div>
        <div className="bg-white rounded-xl border border-secondary-200 p-4">
          <div className="text-2xl font-semibold text-yellow-600">{stats.draft}</div>
          <div className="text-sm text-secondary-600">Taslak</div>
        </div>
        <div className="bg-white rounded-xl border border-secondary-200 p-4">
          <div className="text-2xl font-semibold text-green-600">{stats.active}</div>
          <div className="text-sm text-secondary-600">Aktif</div>
        </div>
        <div className="bg-white rounded-xl border border-secondary-200 p-4">
          <div className="text-2xl font-semibold text-secondary-400">{stats.closed}</div>
          <div className="text-sm text-secondary-600">Kapalı</div>
        </div>
        <div className="bg-white rounded-xl border border-secondary-200 p-4">
          <div className="text-2xl font-semibold text-primary-600">{stats.totalViews}</div>
          <div className="text-sm text-secondary-600">Toplam Görüntüleme</div>
        </div>
        <div className="bg-white rounded-xl border border-secondary-200 p-4">
          <div className="text-2xl font-semibold text-primary-600">{stats.totalApplications}</div>
          <div className="text-sm text-secondary-600">Toplam Başvuru</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-secondary-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" />
            <input
              type="text"
              placeholder="İlan başlığı, şirket adı, şehir ile ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-secondary-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 bg-white border border-secondary-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="draft">Taslak</option>
            <option value="active">Aktif</option>
            <option value="closed">Kapalı</option>
          </select>
        </div>
      </div>

      {/* Jobs List */}
      <div className="bg-white rounded-xl border border-secondary-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary-50 border-b border-secondary-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-600 uppercase tracking-wider">
                  İlan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-600 uppercase tracking-wider">
                  Şirket
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-600 uppercase tracking-wider">
                  Konum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-600 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-600 uppercase tracking-wider">
                  İstatistikler
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-600 uppercase tracking-wider">
                  Tarih
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-secondary-600 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-200">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-secondary-500">
                    İlan bulunamadı
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-secondary-50">
                    {/* Job Info */}
                    <td className="px-6 py-4">
                      <div className="min-w-0">
                        <div className="font-medium text-secondary-900 truncate mb-1">
                          {job.title}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          {job.work_type && (
                            <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full">
                              {workTypeLabels[job.work_type] || job.work_type}
                            </span>
                          )}
                          {job.experience_level && (
                            <span className="px-2 py-0.5 bg-secondary-100 text-secondary-700 rounded-full">
                              {experienceLevelLabels[job.experience_level] || job.experience_level}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Company */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {job.companies?.logo_url ? (
                          <img
                            src={job.companies.logo_url}
                            alt={job.companies.name}
                            className="w-8 h-8 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                            <Building2 className="h-4 w-4 text-primary-600" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-secondary-900 truncate">
                            {job.companies?.name}
                          </div>
                          {job.companies?.is_verified && (
                            <div className="text-xs text-green-600 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Onaylı
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-secondary-600">
                        <MapPin className="h-4 w-4" />
                        <span>{job.cities?.name || job.location_city}</span>
                      </div>
                      {job.location_district && (
                        <div className="text-xs text-secondary-500 mt-0.5">
                          {job.location_district}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      {job.status === 'draft' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
                          <Clock className="h-3 w-3" />
                          {statusLabels[job.status]}
                        </span>
                      )}
                      {job.status === 'active' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                          <CheckCircle2 className="h-3 w-3" />
                          {statusLabels[job.status]}
                        </span>
                      )}
                      {job.status === 'closed' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-secondary-100 text-secondary-700 rounded-full">
                          <XCircle className="h-3 w-3" />
                          {statusLabels[job.status]}
                        </span>
                      )}
                    </td>

                    {/* Stats */}
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-xs text-secondary-600">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {job.view_count} görüntüleme
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {job.application_count} başvuru
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-secondary-600">
                        <Calendar className="h-4 w-4" />
                        {new Date(job.created_at).toLocaleDateString('tr-TR')}
                      </div>
                      {job.published_at && (
                        <div className="text-xs text-secondary-500 mt-0.5">
                          Yayın: {new Date(job.published_at).toLocaleDateString('tr-TR')}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/ilan/${job.slug}`}
                          target="_blank"
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Görüntüle"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        {job.status === 'draft' && (
                          <button
                            onClick={() => handleApprove(job.id)}
                            disabled={loading === job.id}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Onayla ve Yayınla"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        {job.status === 'active' && (
                          <button
                            onClick={() => handleReject(job.id)}
                            disabled={loading === job.id}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Kapat"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(job.id)}
                          disabled={loading === job.id}
                          className="p-2 text-accent-600 hover:bg-accent-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Sil"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-secondary-600 text-center">
        {filteredJobs.length} ilan görüntüleniyor
        {filteredJobs.length !== jobs.length && ` (${jobs.length} toplam)`}
      </div>
    </div>
  )
}
