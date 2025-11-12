'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Search,
  Filter,
  LayoutGrid,
  List,
  MapPin,
  Users,
  Eye,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  Power,
  PowerOff,
  Calendar,
  Plus
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Job {
  id: string
  title: string
  status: string
  work_type: string
  created_at: string
  view_count: number
  cities: {
    id: string
    name: string
  }
  categories: {
    id: string
    name: string
  }
  applications: any[]
}

interface EmployerJobsClientProps {
  jobs: Job[]
  companyId: string
}

export function EmployerJobsClient({ jobs, companyId }: EmployerJobsClientProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [loading, setLoading] = useState<string | null>(null)

  // Filter jobs
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = !statusFilter || job.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Count by status
  const statusCounts = {
    all: jobs.length,
    active: jobs.filter(j => j.status === 'active').length,
    inactive: jobs.filter(j => j.status === 'inactive').length,
    draft: jobs.filter(j => j.status === 'draft').length,
  }

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    setLoading(jobId)
    const supabase = createClient()

    const { error } = await supabase
      .from('jobs')
      .update({ status: newStatus })
      .eq('id', jobId)

    setLoading(null)

    if (!error) {
      router.refresh()
    }
  }

  const handleDelete = async (jobId: string) => {
    if (!confirm('Bu ilanı silmek istediğinizden emin misiniz?')) return

    setLoading(jobId)
    const supabase = createClient()

    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', jobId)

    setLoading(null)

    if (!error) {
      router.refresh()
    }
  }

  const handleDuplicate = async (job: Job) => {
    setLoading(job.id)
    const supabase = createClient()

    const { error } = await supabase
      .from('jobs')
      .insert({
        company_id: companyId,
        title: `${job.title} (Kopya)`,
        status: 'draft',
        work_type: job.work_type,
        // Add other fields as needed
      })

    setLoading(null)

    if (!error) {
      router.refresh()
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="bg-white rounded-xl border border-secondary-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="İlan başlığı ara..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-secondary-200 rounded-lg text-sm text-secondary-900 placeholder:text-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-secondary-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Tüm Durumlar ({statusCounts.all})</option>
              <option value="active">Aktif ({statusCounts.active})</option>
              <option value="inactive">Pasif ({statusCounts.inactive})</option>
              <option value="draft">Taslak ({statusCounts.draft})</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 p-1 bg-secondary-50 rounded-lg">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${
                viewMode === 'list'
                  ? 'bg-white text-secondary-900 shadow-sm'
                  : 'text-secondary-600 hover:text-secondary-900'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${
                viewMode === 'grid'
                  ? 'bg-white text-secondary-900 shadow-sm'
                  : 'text-secondary-600 hover:text-secondary-900'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Jobs List/Grid */}
      {filteredJobs.length > 0 ? (
        viewMode === 'list' ? (
          <div className="bg-white rounded-xl border border-secondary-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary-50 border-b border-secondary-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-600 uppercase tracking-wider">
                      İlan
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
                  {filteredJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-secondary-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-secondary-900">{job.title}</p>
                          <p className="text-sm text-secondary-600">{job.categories?.name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4 text-secondary-500" />
                          <span className="text-sm text-secondary-900">{job.cities?.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          job.status === 'active' ? 'bg-green-100 text-green-700' :
                          job.status === 'draft' ? 'bg-secondary-100 text-secondary-700' :
                          'bg-accent-100 text-accent-700'
                        }`}>
                          {job.status === 'active' ? 'Aktif' :
                           job.status === 'draft' ? 'Taslak' :
                           'Pasif'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5">
                            <Users className="h-4 w-4 text-secondary-500" />
                            <span className="text-sm text-secondary-900">
                              {job.applications?.length || 0}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Eye className="h-4 w-4 text-secondary-500" />
                            <span className="text-sm text-secondary-900">
                              {job.view_count || 0}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-secondary-600">
                          {new Date(job.created_at).toLocaleDateString('tr-TR')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/isveren/dashboard/ilan-duzenle/${job.id}`}
                            className="p-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg transition-colors"
                            title="Düzenle"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>

                          {job.status === 'active' ? (
                            <button
                              onClick={() => handleStatusChange(job.id, 'inactive')}
                              disabled={loading === job.id}
                              className="p-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg transition-colors disabled:opacity-50"
                              title="Pasif Yap"
                            >
                              <PowerOff className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStatusChange(job.id, 'active')}
                              disabled={loading === job.id}
                              className="p-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg transition-colors disabled:opacity-50"
                              title="Aktif Yap"
                            >
                              <Power className="h-4 w-4" />
                            </button>
                          )}

                          <button
                            onClick={() => handleDuplicate(job)}
                            disabled={loading === job.id}
                            className="p-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg transition-colors disabled:opacity-50"
                            title="Kopyala"
                          >
                            <Copy className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(job.id)}
                            disabled={loading === job.id}
                            className="p-2 text-accent-600 hover:text-accent-700 hover:bg-accent-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Sil"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredJobs.map((job) => (
              <div key={job.id} className="bg-white rounded-xl border border-secondary-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-secondary-900 mb-1">{job.title}</h3>
                    <p className="text-sm text-secondary-600">{job.categories?.name}</p>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    job.status === 'active' ? 'bg-green-100 text-green-700' :
                    job.status === 'draft' ? 'bg-secondary-100 text-secondary-700' :
                    'bg-accent-100 text-accent-700'
                  }`}>
                    {job.status === 'active' ? 'Aktif' :
                     job.status === 'draft' ? 'Taslak' :
                     'Pasif'}
                  </span>
                </div>

                <div className="flex items-center gap-4 mb-4 text-sm text-secondary-600">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {job.cities?.name}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {new Date(job.created_at).toLocaleDateString('tr-TR')}
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-secondary-500" />
                    <span className="text-sm text-secondary-900">
                      {job.applications?.length || 0} başvuru
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Eye className="h-4 w-4 text-secondary-500" />
                    <span className="text-sm text-secondary-900">
                      {job.view_count || 0} görüntülenme
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/isveren/dashboard/ilan-duzenle/${job.id}`}
                    className="flex-1 px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors text-center"
                  >
                    Düzenle
                  </Link>

                  {job.status === 'active' ? (
                    <button
                      onClick={() => handleStatusChange(job.id, 'inactive')}
                      disabled={loading === job.id}
                      className="px-4 py-2 text-sm font-medium text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Pasif Yap
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusChange(job.id, 'active')}
                      disabled={loading === job.id}
                      className="px-4 py-2 text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Aktif Yap
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(job.id)}
                    disabled={loading === job.id}
                    className="p-2 text-accent-600 hover:text-accent-700 hover:bg-accent-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="bg-white rounded-xl border border-secondary-200 p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary-100 rounded-full mb-4">
            <Search className="h-8 w-8 text-secondary-400" />
          </div>
          <h3 className="text-lg font-semibold text-secondary-900 mb-2">
            {searchQuery || statusFilter ? 'İlan bulunamadı' : 'Henüz ilan yok'}
          </h3>
          <p className="text-secondary-600 mb-6">
            {searchQuery || statusFilter
              ? 'Farklı filtreler deneyebilirsiniz'
              : 'İlk iş ilanınızı oluşturarak başlayın'}
          </p>
          {!searchQuery && !statusFilter && (
            <Link
              href="/isveren/dashboard/ilan-olustur"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              Yeni İlan Oluştur
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
