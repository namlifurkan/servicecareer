import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Briefcase,
  Users,
  Eye,
  TrendingUp,
  Clock,
  MapPin,
  ArrowUpRight
} from 'lucide-react'

export default async function EmployerDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/isveren/giris')
  }

  // Get company
  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  if (!company) {
    redirect('/isveren/giris')
  }

  // Get statistics
  const [
    { count: totalJobs },
    { count: activeJobs },
    { count: totalApplications },
    { count: thisMonthApplications }
  ] = await Promise.all([
    supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', company.id),
    supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', company.id)
      .eq('status', 'active'),
    supabase
      .from('applications')
      .select('*, jobs!inner(*)', { count: 'exact', head: true })
      .eq('jobs.company_id', company.id),
    supabase
      .from('applications')
      .select('*, jobs!inner(*)', { count: 'exact', head: true })
      .eq('jobs.company_id', company.id)
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
  ])

  // Get total views (sum of all job view_counts)
  const { data: jobsWithViews } = await supabase
    .from('jobs')
    .select('view_count')
    .eq('company_id', company.id)

  const totalViews = jobsWithViews?.reduce((sum, job) => sum + (job.view_count || 0), 0) || 0

  // Get recent applications
  const { data: recentApplications } = await supabase
    .from('applications')
    .select(`
      *,
      jobs (
        id,
        title,
        slug
      ),
      profiles (
        id,
        full_name,
        email,
        avatar_url
      )
    `)
    .eq('jobs.company_id', company.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Get active jobs
  const { data: activeJobsList } = await supabase
    .from('jobs')
    .select(`
      *,
      cities (
        id,
        name
      ),
      applications (count)
    `)
    .eq('company_id', company.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(5)

  const stats = [
    {
      name: 'Aktif İlanlar',
      value: activeJobs || 0,
      total: totalJobs || 0,
      icon: Briefcase,
      color: 'primary',
      href: '/isveren/dashboard/ilanlarim',
    },
    {
      name: 'Toplam Başvuru',
      value: totalApplications || 0,
      trend: thisMonthApplications || 0,
      trendLabel: 'Bu ay',
      icon: Users,
      color: 'secondary',
      href: '/isveren/dashboard/basvurular',
    },
    {
      name: 'Görüntülenme',
      value: totalViews,
      icon: Eye,
      color: 'accent',
    },
    {
      name: 'Başvuru Oranı',
      value: totalViews > 0 ? `%${((totalApplications || 0) / totalViews * 100).toFixed(1)}` : '%0',
      icon: TrendingUp,
      color: 'primary',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-secondary-900">
          Dashboard
        </h1>
        <p className="text-secondary-600 mt-1">
          İş ilanlarınızı ve başvurularınızı yönetin
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white rounded-xl border border-secondary-200 p-6 hover:border-secondary-300 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg ${
                stat.color === 'primary' ? 'bg-primary-100' :
                stat.color === 'accent' ? 'bg-accent-100' :
                'bg-secondary-100'
              }`}>
                <stat.icon className={`h-5 w-5 ${
                  stat.color === 'primary' ? 'text-primary-600' :
                  stat.color === 'accent' ? 'text-accent-600' :
                  'text-secondary-600'
                }`} />
              </div>
              {stat.href && (
                <Link
                  href={stat.href}
                  className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  Görüntüle
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              )}
            </div>

            <div>
              <p className="text-sm text-secondary-600 mb-1">{stat.name}</p>
              <p className="text-2xl font-semibold text-secondary-900">
                {stat.value}
                {stat.total !== undefined && (
                  <span className="text-sm font-normal text-secondary-500"> / {stat.total}</span>
                )}
              </p>
              {stat.trend !== undefined && (
                <p className="text-sm text-secondary-600 mt-1">
                  +{stat.trend} {stat.trendLabel}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Applications */}
        <div className="bg-white rounded-xl border border-secondary-200">
          <div className="p-6 border-b border-secondary-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-secondary-900">Son Başvurular</h2>
              <p className="text-sm text-secondary-600 mt-0.5">Son alınan başvurular</p>
            </div>
            <Link
              href="/isveren/dashboard/basvurular"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Tümünü Gör
            </Link>
          </div>

          <div className="divide-y divide-secondary-200">
            {recentApplications && recentApplications.length > 0 ? (
              recentApplications.map((application: any) => (
                <div key={application.id} className="p-6 hover:bg-secondary-50 transition-colors">
                  <div className="flex items-start gap-3">
                    {application.profiles?.avatar_url ? (
                      <img
                        src={application.profiles.avatar_url}
                        alt={application.profiles.full_name || 'Aday'}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-700">
                          {application.profiles?.full_name?.charAt(0) || 'A'}
                        </span>
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-secondary-900">
                        {application.profiles?.full_name || 'Anonim'}
                      </p>
                      <p className="text-sm text-secondary-600 truncate">
                        {application.jobs?.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3 text-secondary-500" />
                        <span className="text-xs text-secondary-500">
                          {new Date(application.created_at).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                    </div>

                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      application.status === 'pending' ? 'bg-secondary-100 text-secondary-700' :
                      application.status === 'reviewing' ? 'bg-primary-100 text-primary-700' :
                      application.status === 'approved' ? 'bg-green-100 text-green-700' :
                      'bg-accent-100 text-accent-700'
                    }`}>
                      {application.status === 'pending' ? 'Beklemede' :
                       application.status === 'reviewing' ? 'İnceleniyor' :
                       application.status === 'approved' ? 'Uygun' :
                       'Uygun Değil'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <Users className="h-12 w-12 text-secondary-300 mx-auto mb-3" />
                <p className="text-sm text-secondary-600">Henüz başvuru yok</p>
              </div>
            )}
          </div>
        </div>

        {/* Active Jobs */}
        <div className="bg-white rounded-xl border border-secondary-200">
          <div className="p-6 border-b border-secondary-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-secondary-900">Aktif İlanlar</h2>
              <p className="text-sm text-secondary-600 mt-0.5">Yayında olan ilanlarınız</p>
            </div>
            <Link
              href="/isveren/dashboard/ilanlarim"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Tümünü Gör
            </Link>
          </div>

          <div className="divide-y divide-secondary-200">
            {activeJobsList && activeJobsList.length > 0 ? (
              activeJobsList.map((job: any) => (
                <div key={job.id} className="p-6 hover:bg-secondary-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-secondary-900 truncate">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="h-3 w-3 text-secondary-500" />
                        <span className="text-sm text-secondary-600">
                          {job.cities?.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-secondary-500" />
                          <span className="text-sm text-secondary-600">
                            {job.applications?.length || 0} başvuru
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Eye className="h-3.5 w-3.5 text-secondary-500" />
                          <span className="text-sm text-secondary-600">
                            {job.view_count || 0} görüntülenme
                          </span>
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/isveren/dashboard/ilanlarim`}
                      className="px-3 py-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      Düzenle
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <Briefcase className="h-12 w-12 text-secondary-300 mx-auto mb-3" />
                <p className="text-sm text-secondary-600 mb-4">Henüz aktif ilan yok</p>
                <Link
                  href="/isveren/dashboard/ilan-olustur"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Briefcase className="h-4 w-4" />
                  İlk İlanını Oluştur
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
