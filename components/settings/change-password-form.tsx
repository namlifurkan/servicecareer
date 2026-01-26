'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Eye, EyeOff, Check } from 'lucide-react'

export function ChangePasswordForm() {
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    const formData = new FormData(e.currentTarget)
    const newPassword = formData.get('newPassword') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (newPassword !== confirmPassword) {
      setError('Şifreler eşleşmiyor')
      setLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır')
      setLoading(false)
      return
    }

    const supabase = createClient()

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)

    // Reset form after 2 seconds
    setTimeout(() => {
      setShowForm(false)
      setSuccess(false)
    }, 2000)
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
      >
        Şifre Değiştir
      </button>
    )
  }

  if (success) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
        <Check className="h-5 w-5 text-green-600" />
        <p className="text-sm text-green-700">Şifreniz başarıyla güncellendi!</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 p-4 bg-secondary-50 rounded-lg space-y-4">
      <div>
        <label className="block text-sm font-medium text-secondary-900 mb-1">
          Yeni Şifre
        </label>
        <div className="relative">
          <input
            type={showNewPassword ? 'text' : 'password'}
            name="newPassword"
            required
            minLength={6}
            className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 pr-10"
            placeholder="En az 6 karakter"
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
          >
            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-secondary-900 mb-1">
          Yeni Şifre (Tekrar)
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            name="confirmPassword"
            required
            minLength={6}
            className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 pr-10"
            placeholder="Şifreyi tekrar girin"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-accent-600">{error}</p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Şifreyi Güncelle
        </button>
        <button
          type="button"
          onClick={() => {
            setShowForm(false)
            setError(null)
          }}
          disabled={loading}
          className="px-4 py-2 border border-secondary-200 text-secondary-700 hover:bg-secondary-50 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          İptal
        </button>
      </div>
    </form>
  )
}
