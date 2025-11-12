import { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Users, Building2, Briefcase, TrendingUp } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Yönetim paneli',
}

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Get statistics
  const [
    { count: totalUsers },
    { count: totalCompanies },
    { count: totalJobs },
    { count: activeJobs },
    { data: recentUsers },
    { data: recentJobs },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('companies').select('*', { count: 'exact', head: true }),
    supabase.from('jobs').select('*', { count: 'exact', head: true }),
    supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('profiles').select('id, email, full_name, role, created_at').order('created_at', { ascending: false }).limit(5),
    supabase.from('jobs').select('id, title, status, created_at, companies(name)').order('created_at', { ascending: false }).limit(5),
  ])

  const stats = [
    {
      name: 'Toplam Kullanıcı',
      value: totalUsers || 0,
      icon: Users,
      color: 'bg-primary-500',
      link: '/admin/users',
    },
    {
      name: 'Toplam Şirket',
      value: totalCompanies || 0,
      icon: Building2,
      color: 'bg-secondary-500',
      link: '/admin/companies',
    },
    {
      name: 'Toplam İlan',
      value: totalJobs || 0,
      icon: Briefcase,
      color: 'bg-accent-500',
      link: '/admin/jobs',
    },
    {
      name: 'Aktif İlan',
      value: activeJobs || 0,
      icon: TrendingUp,
      color: 'bg-primary-500',
      link: '/admin/jobs',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            href={stat.link}
            className="bg-white rounded-xl border border-secondary-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">{stat.name}</p>
                <p className="text-3xl font-semibold text-secondary-900 mt-2">
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Users */}
        <div className="bg-white rounded-xl border border-secondary-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-secondary-900">
              Son Kayıtlar
            </h2>
            <Link
              href="/admin/users"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Tümünü Gör →
            </Link>
          </div>

          <div className="space-y-4">
            {recentUsers && recentUsers.length > 0 ? (
              recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between py-3 border-b border-secondary-100 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-secondary-900">
                      {user.full_name || 'İsimsiz'}
                    </p>
                    <p className="text-xs text-secondary-500">{user.email}</p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-primary-50 text-primary-700 rounded-full">
                    {user.role === 'company' ? 'İşveren' :
                     user.role === 'candidate' ? 'Aday' :
                     user.role === 'admin' ? 'Yönetici' : user.role}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-secondary-500 text-center py-8">
                Henüz kullanıcı yok
              </p>
            )}
          </div>
        </div>

        {/* Recent Jobs */}
        <div className="bg-white rounded-xl border border-secondary-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-secondary-900">
              Son İlanlar
            </h2>
            <Link
              href="/admin/jobs"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Tümünü Gör →
            </Link>
          </div>

          <div className="space-y-4">
            {recentJobs && recentJobs.length > 0 ? (
              recentJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between py-3 border-b border-secondary-100 last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-secondary-900 truncate">
                      {job.title}
                    </p>
                    <p className="text-xs text-secondary-500">
                      {(job.companies as any)?.name || 'Şirket'}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      job.status === 'active'
                        ? 'bg-primary-50 text-primary-700'
                        : job.status === 'draft'
                        ? 'bg-secondary-100 text-secondary-700'
                        : 'bg-accent-50 text-accent-700'
                    }`}
                  >
                    {job.status === 'active' ? 'Aktif' :
                     job.status === 'draft' ? 'Taslak' :
                     job.status === 'closed' ? 'Kapalı' : job.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-secondary-500 text-center py-8">
                Henüz ilan yok
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
