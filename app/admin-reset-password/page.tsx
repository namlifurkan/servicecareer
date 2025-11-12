'use client'

import { useState } from 'react'
import { Header } from '@/components/header'
import { Loader2 } from 'lucide-react'

export default function AdminResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/admin-reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: data.message })
        setEmail('')
        setNewPassword('')
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-secondary-50 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-secondary-200 p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-secondary-900 mb-2">
                Şifre Sıfırlama (Admin)
              </h1>
              <p className="text-sm text-secondary-600">
                Herhangi bir kullanıcının şifresini değiştirin
              </p>
            </div>

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
                  Kullanıcı Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm text-secondary-900 placeholder:text-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="kullanici@email.com"
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-secondary-900 mb-2">
                  Yeni Şifre
                </label>
                <input
                  id="newPassword"
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm text-secondary-900 placeholder:text-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="En az 6 karakter"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-accent-600 hover:bg-accent-700 disabled:bg-secondary-300 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
              </button>
            </form>

            <div className="mt-6 p-4 bg-accent-50 rounded-lg border border-accent-200">
              <p className="text-xs text-accent-700">
                ⚠️ <strong>Dikkat:</strong> Bu sayfa sadece development için kullanılmalıdır.
                Production&apos;da bu sayfayı kaldırın veya güçlü authentication ekleyin.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
