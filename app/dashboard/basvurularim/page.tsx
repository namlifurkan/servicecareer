import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Briefcase,
  MapPin,
  Calendar,
  Building2,
  ExternalLink,
  FileText
} from 'lucide-react'

export default async function MyApplicationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/giris')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'candidate') {
    redirect('/')
  }

  // Get all applications for this candidate
  const { data: applications } = await supabase
    .from('applications')
    .select(`
      *,
      jobs (
        id,
        title,
        slug,
        location_city,
        work_type,
        company_id,
        companies (
          name,
          logo_url
        )
      )
    `)
    .eq('candidate_id', user.id)
    .order('created_at', { ascending: false })

  const getStatusBadge = (status: string) => {
    const configs = {
      pending: { bg: 'bg-secondary-100', text: 'text-secondary-700', label: 'Beklemede' },
      reviewing: { bg: 'bg-primary-100', text: 'text-primary-700', label: 'İnceleniyor' },
      approved: { bg: 'bg-green-100', text: 'text-green-700', label: 'Uygun' },
      rejected: { bg: 'bg-accent-100', text: 'text-accent-700', label: 'Uygun Değil' },
    }
    const config = configs[status as keyof typeof configs] || configs.pending
    return { ...config }
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold text-secondary-900 mb-2">
            Başvurularım
          </h1>
          <p className="text-secondary-600">
            Yaptığınız {applications?.length || 0} başvuruyu görüntüleyin
          </p>
        </div>

        {/* Applications List */}
        {applications && applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((application: any) => {
              const statusConfig = getStatusBadge(application.status)

              return (
                <div
                  key={application.id}
                  className="bg-white rounded-xl border border-secondary-200 p-6 hover:border-secondary-300 transition-all"
                >
                  <div className="flex items-start gap-4">
                    {/* Company Logo */}
                    {application.jobs?.companies?.logo_url ? (
                      <img
                        src={application.jobs.companies.logo_url}
                        alt={application.jobs.companies.name}
                        className="w-16 h-16 rounded-xl object-cover border border-secondary-200"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-primary-100 flex items-center justify-center border border-secondary-200">
                        <Building2 className="h-8 w-8 text-primary-600" />
                      </div>
                    )}

                    {/* Application Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <Link
                            href={`/ilanlar/${application.jobs?.slug}`}
                            className="text-lg font-semibold text-secondary-900 hover:text-primary-600 transition-colors"
                          >
                            {application.jobs?.title}
                          </Link>
                          <p className="text-sm text-secondary-600">
                            {application.jobs?.companies?.name}
                          </p>
                        </div>

                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusConfig.bg} ${statusConfig.text}`}>
                          {statusConfig.label}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-secondary-600 mb-4">
                        {application.jobs?.location_city && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4" />
                            {application.jobs.location_city}
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <Briefcase className="h-4 w-4" />
                          {application.jobs?.work_type}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" />
                          Başvuru: {new Date(application.created_at).toLocaleDateString('tr-TR')}
                        </div>
                      </div>

                      {/* Cover Letter */}
                      {application.cover_letter && (
                        <div className="mb-4">
                          <p className="text-xs font-medium text-secondary-900 mb-1">Ön Yazı:</p>
                          <p className="text-sm text-secondary-700 line-clamp-2">
                            {application.cover_letter}
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        <a
                          href={application.cv_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-50 hover:bg-secondary-100 text-secondary-900 text-sm font-medium rounded-lg transition-colors"
                        >
                          <FileText className="h-4 w-4" />
                          CV&apos;mi Görüntüle
                        </a>
                        <Link
                          href={`/ilanlar/${application.jobs?.slug}`}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          İlanı Görüntüle
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-secondary-200 p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary-100 rounded-full mb-4">
              <Briefcase className="h-8 w-8 text-secondary-400" />
            </div>
            <h3 className="text-lg font-semibold text-secondary-900 mb-2">
              Henüz başvuru yapmadınız
            </h3>
            <p className="text-secondary-600 mb-6">
              İlgilendiğiniz pozisyonlara başvurmaya başlayın
            </p>
            <Link
              href="/ilanlar"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
            >
              <Briefcase className="h-4 w-4" />
              İlanları İncele
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
