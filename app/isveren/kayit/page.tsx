import { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { EmployerRegisterForm } from '@/components/auth/employer-register-form'
import { Briefcase } from 'lucide-react'

export const metadata: Metadata = {
  title: 'İşveren Kayıt',
  description: 'İşveren hesabı oluşturun',
}

export default function EmployerRegisterPage() {
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
                İşveren Kayıt
              </h1>
              <p className="text-secondary-600">
                Ücretsiz işveren hesabı oluşturun
              </p>
            </div>

            {/* Register Form */}
            <EmployerRegisterForm />

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
              <p className="text-sm text-secondary-600 mb-4">
                Zaten hesabınız var mı?{' '}
                <Link href="/isveren/giris" className="text-primary-600 hover:text-primary-700 font-medium">
                  Giriş Yap
                </Link>
              </p>
              <Link
                href="/kayit"
                className="text-sm text-secondary-500 hover:text-secondary-700"
              >
                ← Genel kayıt sayfasına dön
              </Link>
            </div>
          </div>

          {/* Info Card */}
          <div className="mt-6 bg-primary-50 border border-primary-200 rounded-xl p-4">
            <h3 className="text-sm font-medium text-primary-900 mb-2">
              Neden ServiceCareer?
            </h3>
            <ul className="space-y-1 text-sm text-primary-700">
              <li>• Hizmet sektörüne özel platform</li>
              <li>• Nitelikli aday havuzu</li>
              <li>• Kolay ilan yönetimi</li>
              <li>• Uygun fiyatlandırma</li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
