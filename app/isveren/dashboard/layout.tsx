import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Building2,
  Settings,
  LogOut,
  ChevronLeft,
  Menu
} from 'lucide-react'

export default async function EmployerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/isveren/giris')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'company') {
    redirect('/')
  }

  // Get company info
  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  // Get stats for sidebar
  const { count: activeJobsCount } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', company?.id)
    .eq('status', 'active')

  const { count: totalApplicationsCount } = await supabase
    .from('applications')
    .select('*, jobs!inner(*)', { count: 'exact', head: true })
    .eq('jobs.company_id', company?.id)

  const navigation = [
    {
      name: 'Dashboard',
      href: '/isveren/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'İlanlarım',
      href: '/isveren/dashboard/ilanlarim',
      icon: Briefcase,
      badge: activeJobsCount || 0,
    },
    {
      name: 'Başvurular',
      href: '/isveren/dashboard/basvurular',
      icon: Users,
      badge: totalApplicationsCount || 0,
    },
    {
      name: 'Şirket Profili',
      href: '/isveren/dashboard/profil',
      icon: Building2,
    },
    {
      name: 'Ayarlar',
      href: '/isveren/dashboard/ayarlar',
      icon: Settings,
    },
  ]

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-secondary-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          {company?.logo_url ? (
            <img
              src={company.logo_url}
              alt={company.name}
              className="h-8 w-8 rounded-lg object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded-lg bg-primary-100 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-primary-600" />
            </div>
          )}
          <span className="font-medium text-secondary-900">{company?.name || 'Şirket'}</span>
        </div>
        <button className="p-2 hover:bg-secondary-50 rounded-lg">
          <Menu className="h-5 w-5 text-secondary-600" />
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-secondary-200 min-h-screen sticky top-0">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-secondary-200">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-secondary-600 hover:text-secondary-900 mb-4"
            >
              <ChevronLeft className="h-4 w-4" />
              Ana Sayfaya Dön
            </Link>

            <div className="flex items-center gap-3">
              {company?.logo_url ? (
                <img
                  src={company.logo_url}
                  alt={company.name}
                  className="h-12 w-12 rounded-xl object-cover"
                />
              ) : (
                <div className="h-12 w-12 rounded-xl bg-primary-100 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-primary-600" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-secondary-900 truncate">
                  {company?.name || 'Şirket Adı'}
                </h2>
                <p className="text-sm text-secondary-600 truncate">
                  {profile?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-secondary-700 hover:text-secondary-900 hover:bg-secondary-50 rounded-lg transition-colors group"
              >
                <item.icon className="h-5 w-5 text-secondary-500 group-hover:text-secondary-700" />
                <span className="flex-1">{item.name}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-700 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-secondary-200">
            <form action="/api/auth/signout" method="post">
              <button
                type="submit"
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-accent-600 hover:text-accent-700 hover:bg-accent-50 rounded-lg transition-colors w-full"
              >
                <LogOut className="h-5 w-5" />
                Çıkış Yap
              </button>
            </form>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
