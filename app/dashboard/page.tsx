import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  User,
  Briefcase,
  GraduationCap,
  FileText,
  TrendingUp,
  Eye,
  MapPin,
  Clock
} from 'lucide-react'

export default async function CandidateDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/giris')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, email')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'candidate') {
    redirect('/')
  }

  // Get candidate profile
  const { data: candidateProfile } = await supabase
    .from('candidate_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get applications count
  const { count: applicationsCount } = await supabase
    .from('applications')
    .select('*', { count: 'exact', head: true })
    .eq('candidate_id', user.id)

  // Get experiences count
  const { count: experiencesCount } = await supabase
    .from('experiences')
    .select('*', { count: 'exact', head: true })
    .eq('candidate_id', user.id)

  // Get educations count
  const { count: educationsCount } = await supabase
    .from('educations')
    .select('*', { count: 'exact', head: true })
    .eq('candidate_id', user.id)

  // Get recent applications
  const { data: recentApplications } = await supabase
    .from('applications')
    .select(`
      *,
      jobs (
        id,
        title,
        slug,
        location_city,
        companies (
          name,
          logo_url
        )
      )
    `)
    .eq('candidate_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Calculate profile completion
  const calculateCompletion = () => {
    let score = 0
    if (candidateProfile?.bio) score += 15
    if (candidateProfile?.title) score += 10
    if (candidateProfile?.city) score += 10
    if (candidateProfile?.skills && candidateProfile.skills.length > 0) score += 15
    if (candidateProfile?.resume_url) score += 20
    if (experiencesCount && experiencesCount > 0) score += 20
    if (educationsCount && educationsCount > 0) score += 10
    return score
  }

  const completionScore = calculateCompletion()

  const stats = [
    {
      name: 'Profil Tamamlanma',
      value: `%${completionScore}`,
      icon: User,
      color: completionScore >= 70 ? 'green' : completionScore >= 40 ? 'primary' : 'accent',
      href: '/dashboard/profil',
    },
    {
      name: 'Başvurularım',
      value: applicationsCount || 0,
      icon: Briefcase,
      color: 'primary',
      href: '/dashboard/basvurularim',
    },
    {
      name: 'Deneyimler',
      value: experiencesCount || 0,
      icon: TrendingUp,
      color: 'secondary',
      href: '/dashboard/profil#deneyimler',
    },
    {
      name: 'Eğitim',
      value: educationsCount || 0,
      icon: GraduationCap,
      color: 'secondary',
      href: '/dashboard/profil#egitim',
    },
  ]

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold text-secondary-900 mb-2">
            Hoş Geldin, {profile?.full_name || user.email?.split('@')[0]}
          </h1>
          <p className="text-secondary-600">
            İş arama sürecini takip et ve profilini güçlendir
          </p>
        </div>

        {/* Profile Completion Alert */}
        {completionScore < 70 && (
          <div className="mb-6 bg-primary-50 border border-primary-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <User className="h-5 w-5 text-primary-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-primary-900 mb-1">
                  Profilini Tamamla
                </h3>
                <p className="text-sm text-primary-700 mb-3">
                  Profil tamamlama oranın %{completionScore}. Daha fazla iş fırsatı için profilini güçlendir.
                </p>
                <Link
                  href="/dashboard/profil"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Profilimi Düzenle
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <Link
              key={stat.name}
              href={stat.href}
              className="bg-white rounded-xl border border-secondary-200 p-6 hover:border-secondary-300 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${
                  stat.color === 'green' ? 'bg-green-100' :
                  stat.color === 'primary' ? 'bg-primary-100' :
                  stat.color === 'accent' ? 'bg-accent-100' :
                  'bg-secondary-100'
                }`}>
                  <stat.icon className={`h-5 w-5 ${
                    stat.color === 'green' ? 'text-green-600' :
                    stat.color === 'primary' ? 'text-primary-600' :
                    stat.color === 'accent' ? 'text-accent-600' :
                    'text-secondary-600'
                  }`} />
                </div>
              </div>

              <div>
                <p className="text-sm text-secondary-600 mb-1">{stat.name}</p>
                <p className="text-2xl font-semibold text-secondary-900">
                  {stat.value}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Applications */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-secondary-200">
              <div className="p-6 border-b border-secondary-200 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-secondary-900">Son Başvurular</h2>
                  <p className="text-sm text-secondary-600 mt-0.5">Son yaptığın başvurular</p>
                </div>
                <Link
                  href="/dashboard/basvurularim"
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
                        {application.jobs?.companies?.logo_url ? (
                          <img
                            src={application.jobs.companies.logo_url}
                            alt={application.jobs.companies.name}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
                            <Briefcase className="h-5 w-5 text-primary-600" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/ilanlar/${application.jobs?.slug}`}
                            className="font-medium text-secondary-900 hover:text-primary-600 transition-colors"
                          >
                            {application.jobs?.title}
                          </Link>
                          <p className="text-sm text-secondary-600 truncate">
                            {application.jobs?.companies?.name}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-secondary-500">
                            {application.jobs?.location_city && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {application.jobs.location_city}
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(application.created_at).toLocaleDateString('tr-TR')}
                            </div>
                          </div>
                        </div>

                        <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
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
                    <Briefcase className="h-12 w-12 text-secondary-300 mx-auto mb-3" />
                    <p className="text-sm text-secondary-600 mb-4">Henüz başvuru yapmadınız</p>
                    <Link
                      href="/ilanlar"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      İlanları İncele
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-secondary-200 p-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">Hızlı İşlemler</h3>

              <div className="space-y-3">
                <Link
                  href="/dashboard/profil"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary-50 transition-colors group"
                >
                  <div className="p-2 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors">
                    <User className="h-4 w-4 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-secondary-900">Profili Düzenle</p>
                    <p className="text-xs text-secondary-600">Bilgilerini güncelle</p>
                  </div>
                </Link>

                <Link
                  href="/ilanlar"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary-50 transition-colors group"
                >
                  <div className="p-2 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors">
                    <Eye className="h-4 w-4 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-secondary-900">İş İlanları</p>
                    <p className="text-xs text-secondary-600">Fırsatları keşfet</p>
                  </div>
                </Link>

                <Link
                  href="/dashboard/basvurularim"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary-50 transition-colors group"
                >
                  <div className="p-2 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors">
                    <FileText className="h-4 w-4 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-secondary-900">Başvurularım</p>
                    <p className="text-xs text-secondary-600">Durumunu takip et</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl border border-primary-200 p-6">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 bg-primary-600 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-primary-900 mb-1">İpucu</h4>
                  <p className="text-sm text-primary-700">
                    Profilinde deneyim ve eğitim bilgilerini ekleyerek işverenlere daha profesyonel görün.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
