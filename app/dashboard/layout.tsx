import Link from 'next/link'
import { User, FileText, Briefcase, Settings, LogOut, Home } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function CandidateDashboardLayout({
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
    .select('role, full_name, avatar_url')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'candidate') {
    redirect('/')
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Profilim', href: '/dashboard/profil', icon: User },
    { name: 'Başvurularım', href: '/dashboard/basvurularim', icon: FileText },
    { name: 'İş Ara', href: '/ilanlar', icon: Briefcase },
  ]

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-secondary-200 flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-secondary-200">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="p-1.5 bg-primary-600 rounded-lg">
              <Briefcase className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-secondary-900">Aday Paneli</span>
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
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name || 'User'}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-primary-600">
                  {profile?.full_name?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-secondary-900 truncate">
                {profile?.full_name || 'Aday'}
              </p>
              <p className="text-xs text-secondary-500">Aday</p>
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
            İş Arama Paneli
          </h1>
          <Link
            href="/"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Anasayfa →
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
