'use client'

import { useState } from 'react'
import {
  Search,
  Filter,
  X,
  User,
  Mail,
  Phone,
  FileText,
  Calendar,
  Briefcase,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { sendApplicationStatusEmail } from '@/lib/email'
import { useRouter } from 'next/navigation'

interface Application {
  id: string
  status: string
  created_at: string
  cv_url: string
  cover_letter: string | null
  contact_preference: string
  guest_name: string | null
  guest_email: string | null
  guest_phone: string | null
  jobs: {
    id: string
    title: string
    slug: string
  }
  profiles: {
    id: string
    full_name: string
    email: string
    avatar_url: string | null
    phone: string | null
  } | null
}

interface EmployerApplicationsClientProps {
  applications: Application[]
  jobs: { id: string; title: string }[]
}

export function EmployerApplicationsClient({ applications, jobs }: EmployerApplicationsClientProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [jobFilter, setJobFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState<string | null>(null)

  // Filter applications
  const filteredApplications = applications.filter(app => {
    const fullName = app.profiles?.full_name || app.guest_name || ''
    const email = app.profiles?.email || app.guest_email || ''
    const matchesSearch =
      fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesJob = !jobFilter || app.jobs?.id === jobFilter
    const matchesStatus = !statusFilter || app.status === statusFilter
    return matchesSearch && matchesJob && matchesStatus
  })

  // Count by status
  const statusCounts = {
    all: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    reviewing: applications.filter(a => a.status === 'reviewing').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  }

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    setLoading(applicationId)
    const supabase = createClient()

    // Find the application to get its details
    const application = applications.find(app => app.id === applicationId)

    const { error } = await supabase
      .from('applications')
      .update({ status: newStatus })
      .eq('id', applicationId)

    setLoading(null)

    if (!error && application) {
      // Send status update email to candidate
      const candidateEmail = application.profiles?.email || application.guest_email
      const candidateName = application.profiles?.full_name || application.guest_name || 'Aday'
      const jobTitle = application.jobs?.title || 'İş İlanı'

      if (candidateEmail) {
        // Get company name for the email
        const { data: jobData } = await supabase
          .from('jobs')
          .select('company_id')
          .eq('id', application.jobs.id)
          .single()

        let companyName = 'Şirket'
        if (jobData?.company_id) {
          const { data: companyData } = await supabase
            .from('companies')
            .select('name')
            .eq('id', jobData.company_id)
            .single()
          companyName = companyData?.name || 'Şirket'
        }

        const emailResult = await sendApplicationStatusEmail(
          candidateEmail,
          candidateName,
          jobTitle,
          newStatus as 'pending' | 'reviewing' | 'approved' | 'rejected',
          companyName
        )

        if (!emailResult.success) {
          console.error('Failed to send status update email:', emailResult.error)
        }
      }

      router.refresh()
      // Update selected application if open
      if (selectedApplication?.id === applicationId) {
        setSelectedApplication({ ...selectedApplication, status: newStatus })
      }
    }
  }

  const getStatusBadge = (status: string) => {
    const configs = {
      pending: { bg: 'bg-secondary-100', text: 'text-secondary-700', label: 'Beklemede' },
      reviewing: { bg: 'bg-primary-100', text: 'text-primary-700', label: 'İnceleniyor' },
      approved: { bg: 'bg-green-100', text: 'text-green-700', label: 'Uygun' },
      rejected: { bg: 'bg-accent-100', text: 'text-accent-700', label: 'Uygun Değil' },
    }
    const config = configs[status as keyof typeof configs] || configs.pending
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    )
  }

  const activeFiltersCount = [jobFilter, statusFilter].filter(Boolean).length

  return (
    <>
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
                placeholder="Aday adı veya email ara..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-secondary-200 rounded-lg text-sm text-secondary-900 placeholder:text-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Job Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-secondary-500" />
              <select
                value={jobFilter}
                onChange={(e) => setJobFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Tüm İlanlar</option>
                {jobs.map(job => (
                  <option key={job.id} value={job.id}>{job.title}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Tüm Durumlar ({statusCounts.all})</option>
              <option value="pending">Beklemede ({statusCounts.pending})</option>
              <option value="reviewing">İnceleniyor ({statusCounts.reviewing})</option>
              <option value="approved">Uygun ({statusCounts.approved})</option>
              <option value="rejected">Uygun Değil ({statusCounts.rejected})</option>
            </select>

            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
              <button
                onClick={() => {
                  setJobFilter('')
                  setStatusFilter('')
                }}
                className="px-3 py-2 text-sm font-medium text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50 rounded-lg transition-colors flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Temizle ({activeFiltersCount})
              </button>
            )}
          </div>
        </div>

        {/* Applications Table */}
        {filteredApplications.length > 0 ? (
          <div className="bg-white rounded-xl border border-secondary-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary-50 border-b border-secondary-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-600 uppercase tracking-wider">
                      Aday
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-600 uppercase tracking-wider">
                      İlan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-600 uppercase tracking-wider">
                      Durum
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
                  {filteredApplications.map((application) => (
                    <tr
                      key={application.id}
                      className="hover:bg-secondary-50 transition-colors cursor-pointer"
                      onClick={() => setSelectedApplication(application)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {application.profiles?.avatar_url ? (
                            <img
                              src={application.profiles.avatar_url}
                              alt={application.profiles.full_name || application.guest_name || 'Aday'}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-primary-700">
                                {(application.profiles?.full_name || application.guest_name)?.charAt(0) || 'A'}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-secondary-900">
                              {application.profiles?.full_name || application.guest_name || 'Anonim'}
                              {application.guest_name && <span className="ml-2 text-xs text-secondary-500">(Misafir)</span>}
                            </p>
                            <p className="text-sm text-secondary-600">
                              {application.profiles?.email || application.guest_email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-secondary-900">{application.jobs?.title}</p>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(application.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4 text-secondary-500" />
                          <span className="text-sm text-secondary-600">
                            {new Date(application.created_at).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {application.status === 'pending' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleStatusChange(application.id, 'reviewing')
                              }}
                              disabled={loading === application.id}
                              className="px-3 py-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors disabled:opacity-50"
                            >
                              İncele
                            </button>
                          )}
                          {application.status === 'reviewing' && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleStatusChange(application.id, 'approved')
                                }}
                                disabled={loading === application.id}
                                className="px-3 py-1.5 text-xs font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                              >
                                Uygun
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleStatusChange(application.id, 'rejected')
                                }}
                                disabled={loading === application.id}
                                className="px-3 py-1.5 text-xs font-medium text-accent-600 hover:text-accent-700 hover:bg-accent-50 rounded-lg transition-colors disabled:opacity-50"
                              >
                                Uygun Değil
                              </button>
                            </>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedApplication(application)
                            }}
                            className="px-3 py-1.5 text-xs font-medium text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg transition-colors"
                          >
                            Detay
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
          <div className="bg-white rounded-xl border border-secondary-200 p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary-100 rounded-full mb-4">
              <Search className="h-8 w-8 text-secondary-400" />
            </div>
            <h3 className="text-lg font-semibold text-secondary-900 mb-2">
              Başvuru bulunamadı
            </h3>
            <p className="text-secondary-600">
              {searchQuery || jobFilter || statusFilter
                ? 'Farklı filtreler deneyebilirsiniz'
                : 'Henüz başvuru almadınız'}
            </p>
          </div>
        )}
      </div>

      {/* Application Detail Modal */}
      {selectedApplication && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedApplication(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-secondary-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-semibold text-secondary-900">Başvuru Detayı</h2>
              <button
                onClick={() => setSelectedApplication(null)}
                className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-secondary-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Candidate Info */}
              <div>
                <h3 className="text-sm font-medium text-secondary-900 mb-3">Aday Bilgileri</h3>
                <div className="flex items-start gap-4">
                  {selectedApplication.profiles?.avatar_url ? (
                    <img
                      src={selectedApplication.profiles.avatar_url}
                      alt={selectedApplication.profiles.full_name || selectedApplication.guest_name || 'Aday'}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                      <User className="h-8 w-8 text-primary-600" />
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <div>
                      <p className="font-semibold text-secondary-900">
                        {selectedApplication.profiles?.full_name || selectedApplication.guest_name || 'Anonim'}
                      </p>
                      {selectedApplication.guest_name && (
                        <p className="text-xs text-secondary-500 mt-1">Misafir Başvuru</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-secondary-600">
                      <Mail className="h-4 w-4" />
                      {selectedApplication.profiles?.email || selectedApplication.guest_email}
                    </div>
                    {(selectedApplication.profiles?.phone || selectedApplication.guest_phone) && (
                      <div className="flex items-center gap-2 text-sm text-secondary-600">
                        <Phone className="h-4 w-4" />
                        {selectedApplication.profiles?.phone || selectedApplication.guest_phone}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Job Info */}
              <div>
                <h3 className="text-sm font-medium text-secondary-900 mb-3">İlan Bilgisi</h3>
                <div className="flex items-center gap-2 text-sm text-secondary-600">
                  <Briefcase className="h-4 w-4" />
                  {selectedApplication.jobs?.title}
                </div>
              </div>

              {/* Application Status */}
              <div>
                <h3 className="text-sm font-medium text-secondary-900 mb-3">Durum</h3>
                <div className="flex items-center gap-3">
                  {getStatusBadge(selectedApplication.status)}
                  <span className="text-sm text-secondary-600">
                    {new Date(selectedApplication.created_at).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {/* CV */}
              <div>
                <h3 className="text-sm font-medium text-secondary-900 mb-3">CV</h3>
                <a
                  href={selectedApplication.cv_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-50 hover:bg-secondary-100 text-secondary-900 rounded-lg transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  CV&apos;yi Görüntüle
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              {/* Cover Letter */}
              {selectedApplication.cover_letter && (
                <div>
                  <h3 className="text-sm font-medium text-secondary-900 mb-3">Ön Yazı</h3>
                  <div className="p-4 bg-secondary-50 rounded-lg">
                    <p className="text-sm text-secondary-700 whitespace-pre-wrap">
                      {selectedApplication.cover_letter}
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4">
                {selectedApplication.status === 'pending' && (
                  <button
                    onClick={() => handleStatusChange(selectedApplication.id, 'reviewing')}
                    disabled={loading === selectedApplication.id}
                    className="flex-1 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Clock className="h-4 w-4" />
                    İncelemeye Al
                  </button>
                )}
                {selectedApplication.status === 'reviewing' && (
                  <>
                    <button
                      onClick={() => handleStatusChange(selectedApplication.id, 'approved')}
                      disabled={loading === selectedApplication.id}
                      className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Uygun
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedApplication.id, 'rejected')}
                      disabled={loading === selectedApplication.id}
                      className="flex-1 px-4 py-2.5 bg-accent-600 hover:bg-accent-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      Uygun Değil
                    </button>
                  </>
                )}
                {(selectedApplication.status === 'approved' || selectedApplication.status === 'rejected') && (
                  <button
                    onClick={() => handleStatusChange(selectedApplication.id, 'reviewing')}
                    disabled={loading === selectedApplication.id}
                    className="flex-1 px-4 py-2.5 bg-secondary-100 hover:bg-secondary-200 text-secondary-900 font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    Tekrar İncele
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
