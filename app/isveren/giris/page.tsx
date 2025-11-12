import { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { LoginForm } from '@/components/auth/login-form'
import { Briefcase } from 'lucide-react'

export const metadata: Metadata = {
  title: 'İşveren Girişi',
  description: 'İşveren hesabınıza giriş yapın',
}

export default function EmployerLoginPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-secondary-50 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-2xl border border-secondary-200 p-8">
            {/* Header with Icon */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-4">
                <Briefcase className="h-8 w-8 text-primary-600" />
              </div>
              <h1 className="text-2xl md:text-3xl font-semibold text-secondary-900 mb-2">
                İşveren Girişi
              </h1>
              <p className="text-secondary-600">
                İşveren hesabınıza giriş yapın
              </p>
            </div>

            {/* Login Form */}
            <LoginForm />

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-secondary-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-secondary-500">veya</span>
              </div>
            </div>

            {/* Register Link */}
            <div className="text-center">
              <p className="text-sm text-secondary-600 mb-4">
                İşveren hesabınız yok mu?{' '}
                <Link href="/isveren/kayit" className="text-primary-600 hover:text-primary-700 font-medium">
                  Kayıt Ol
                </Link>
              </p>
              <Link
                href="/giris"
                className="text-sm text-secondary-500 hover:text-secondary-700"
              >
                ← Genel giriş sayfasına dön
              </Link>
            </div>
          </div>

          {/* Info Card */}
          <div className="mt-6 bg-primary-50 border border-primary-200 rounded-xl p-4">
            <h3 className="text-sm font-medium text-primary-900 mb-2">
              İşveren Panelinde Neler Var?
            </h3>
            <ul className="space-y-1 text-sm text-primary-700">
              <li>• İlan yayınlama ve yönetme</li>
              <li>• Başvuruları görüntüleme</li>
              <li>• Aday havuzu oluşturma</li>
              <li>• Detaylı raporlama</li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
