import { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { RegisterForm } from '@/components/auth/register-form'

export const metadata: Metadata = {
  title: 'Kayıt Ol',
  description: 'Yeme İçme İşleri hesabı oluşturun',
}

export default function RegisterPage() {
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
                Kayıt Ol
              </h1>
              <p className="text-secondary-600">
                Ücretsiz hesap oluşturun
              </p>
            </div>

            {/* Register Form */}
            <RegisterForm />

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-secondary-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-secondary-500">veya</span>
              </div>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-sm text-secondary-600">
                Zaten hesabınız var mı?{' '}
                <Link href="/giris" className="text-primary-600 hover:text-primary-700 font-medium">
                  Giriş Yap
                </Link>
              </p>
            </div>

            {/* Role-specific Links */}
            <div className="mt-6 pt-6 border-t border-secondary-200">
              <p className="text-sm text-secondary-600 mb-3 text-center">
                Özel kayıt sayfaları:
              </p>
              <div className="flex flex-col gap-2">
                <Link
                  href="/isveren/kayit"
                  className="text-sm text-center px-4 py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-lg transition-colors border border-primary-200"
                >
                  İşveren Olarak Kayıt Ol
                </Link>
                <Link
                  href="/aday/kayit"
                  className="text-sm text-center px-4 py-2 bg-secondary-50 hover:bg-secondary-100 text-secondary-700 rounded-lg transition-colors"
                >
                  Aday Olarak Kayıt Ol
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
