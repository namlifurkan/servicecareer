import Link from 'next/link'
import { Users, Building2, Briefcase, BarChart3, Settings, LogOut, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/giris')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/')
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: BarChart3 },
    { name: 'Kullanıcılar', href: '/admin/users', icon: Users },
    { name: 'Şirketler', href: '/admin/companies', icon: Building2 },
    { name: 'İlanlar', href: '/admin/jobs', icon: Briefcase },
    { name: 'Dış İlanlar', href: '/admin/external-jobs', icon: ExternalLink },
    { name: 'Ayarlar', href: '/admin/settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-secondary-200 flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-secondary-200">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="p-1.5 bg-accent-600 rounded-lg">
              <Settings className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-secondary-900">Admin Panel</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-secondary-700 hover:bg-secondary-50 hover:text-secondary-900 rounded-lg transition-colors"
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          ))}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-secondary-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-accent-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-accent-600">
                {profile?.full_name?.charAt(0).toUpperCase() || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-secondary-900 truncate">
                {profile?.full_name || 'Admin'}
              </p>
              <p className="text-xs text-secondary-500">Yönetici</p>
            </div>
          </div>
          <form action="/api/auth/signout" method="post">
            <button
              type="submit"
              className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-accent-600 hover:bg-accent-50 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Çıkış Yap
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <div className="pl-64">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-secondary-200 flex items-center justify-between px-8">
          <h1 className="text-lg font-semibold text-secondary-900">
            Yönetim Paneli
          </h1>
          <Link
            href="/"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Siteye Dön →
          </Link>
        </header>

        {/* Page Content */}
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
