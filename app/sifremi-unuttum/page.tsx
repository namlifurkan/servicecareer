'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { createClient } from '@/lib/supabase/client'
import { Loader2, ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const supabase = createClient()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/sifre-sifirla`,
    })

    setLoading(false)

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({
        type: 'success',
        text: 'Şifre sıfırlama linki email adresinize gönderildi. Lütfen email kutunuzu kontrol edin.',
      })
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-secondary-50 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-secondary-200 p-8">
            {/* Back Link */}
            <Link
              href="/giris"
              className="inline-flex items-center gap-2 text-sm text-secondary-600 hover:text-secondary-900 mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Giriş sayfasına dön
            </Link>

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-semibold text-secondary-900 mb-2">
                Şifremi Unuttum
              </h1>
              <p className="text-secondary-600">
                Email adresinize şifre sıfırlama linki göndereceğiz
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {message && (
                <div
                  className={`p-3 rounded-lg ${
                    message.type === 'success'
                      ? 'bg-primary-50 border border-primary-200 text-primary-700'
                      : 'bg-accent-50 border border-accent-200 text-accent-600'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-secondary-900 mb-2">
                  E-posta
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm text-secondary-900 placeholder:text-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="ornek@email.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-secondary-300 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? 'Gönderiliyor...' : 'Şifre Sıfırlama Linki Gönder'}
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
