import { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { LoginForm } from '@/components/auth/login-form'

export const metadata: Metadata = {
  title: 'Giriş Yap',
  description: 'Yeme İçme İşleri hesabınıza giriş yapın',
}

export default function LoginPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-secondary-50 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-2xl border border-secondary-200 p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl md:text-3xl font-semibold text-secondary-900 mb-2">
                Giriş Yap
              </h1>
              <p className="text-secondary-600">
                Hesabınıza giriş yapın
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
              <p className="text-sm text-secondary-600">
                Hesabınız yok mu?{' '}
                <Link href="/kayit" className="text-primary-600 hover:text-primary-700 font-medium">
                  Kayıt Ol
                </Link>
              </p>
            </div>

            {/* Role-specific Links */}
            <div className="mt-6 pt-6 border-t border-secondary-200">
              <p className="text-sm text-secondary-600 mb-3 text-center">
                Özel giriş sayfaları:
              </p>
              <div className="flex flex-col gap-2">
                <Link
                  href="/isveren/giris"
                  className="text-sm text-center px-4 py-2 bg-secondary-50 hover:bg-secondary-100 text-secondary-700 rounded-lg transition-colors"
                >
                  İşveren Girişi
                </Link>
                <Link
                  href="/aday/giris"
                  className="text-sm text-center px-4 py-2 bg-secondary-50 hover:bg-secondary-100 text-secondary-700 rounded-lg transition-colors"
                >
                  Aday Girişi
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
