'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Menu, User, LogOut, LayoutDashboard } from 'lucide-react'
import Image from 'next/image'

export function Header() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        // Get profile
        supabase
          .from('profiles')
          .select('role, full_name')
          .eq('id', user.id)
          .single()
          .then(({ data }) => setProfile(data))
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        supabase
          .from('profiles')
          .select('role, full_name')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => setProfile(data))
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const getDashboardLink = () => {
    if (profile?.role === 'company') return '/isveren/dashboard'
    if (profile?.role === 'candidate') return '/dashboard'
    if (profile?.role === 'admin') return '/admin'
    return '/'
  }

  return (
    <header className="bg-white border-b border-secondary-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 md:gap-2.5 group">
            <Image
              src="/android-chrome-192x192.png"
              alt="Yeme İçme İşi"
              width={40}
              height={40}
              className="h-8 w-8 md:h-10 md:w-10 rounded-xl object-cover"
            />
            <span className="text-lg md:text-xl font-semibold text-secondary-900">Yeme İçme İşi</span>
          </Link>

          <div className="flex-1"></div>

          {/* CTA Buttons / User Menu */}
          <div className="flex items-center gap-2 md:gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 md:px-4 py-2 text-sm font-medium text-secondary-700 hover:bg-secondary-50 rounded-lg transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden md:inline">{profile?.full_name || 'Hesabım'}</span>
                </button>

                {showUserMenu && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserMenu(false)}
                    />
                    {/* Menu */}
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-secondary-200 shadow-xl z-50">
                      <div className="py-2">
                        <Link
                          href={getDashboardLink()}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Dashboard
                        </Link>
                        <button
                          onClick={() => {
                            handleLogout()
                            setShowUserMenu(false)
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-accent-600 hover:bg-accent-50"
                        >
                          <LogOut className="h-4 w-4" />
                          Çıkış Yap
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/giris"
                  className="hidden md:block px-4 py-2 text-sm font-medium text-secondary-700 hover:text-secondary-900 hover:bg-secondary-50 rounded-lg transition-colors"
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/isveren/giris"
                  className="px-3 md:px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs md:text-sm font-medium rounded-lg transition-colors shadow-sm whitespace-nowrap"
                >
                  İlan Ver
                </Link>
              </>
            )}
            <button className="md:hidden text-secondary-700 p-2">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
