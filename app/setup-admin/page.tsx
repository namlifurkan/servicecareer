'use client'

import { useState } from 'react'
import { Header } from '@/components/header'

export default function SetupAdminPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/setup-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: data.message })
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
            <h1 className="text-2xl font-semibold text-secondary-900 mb-2">
              Admin Kurulum
            </h1>
            <p className="text-sm text-secondary-600 mb-6">
              Bir kullanıcıyı admin yapmak için email adresini girin
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-secondary-900 mb-2">
                  Email Adresi
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@example.com"
                  className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm text-secondary-900 placeholder:text-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {message && (
                <div className={`p-3 rounded-lg ${
                  message.type === 'success'
                    ? 'bg-primary-50 border border-primary-200 text-primary-700'
                    : 'bg-accent-50 border border-accent-200 text-accent-700'
                }`}>
                  <p className="text-sm">{message.text}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-accent-600 hover:bg-accent-700 disabled:bg-secondary-300 text-white font-medium rounded-lg transition-colors"
              >
                {loading ? 'İşleniyor...' : 'Admin Yap'}
              </button>
            </form>

            <div className="mt-6 p-4 bg-secondary-50 rounded-lg">
              <p className="text-xs text-secondary-600">
                <strong>Not:</strong> Bu sayfa sadece ilk kurulum için kullanılmalıdır.
                Kullanıcının sistemde kayıtlı olması gerekir.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
