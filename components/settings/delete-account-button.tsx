'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, AlertTriangle } from 'lucide-react'

export function DeleteAccountButton() {
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmText, setConfirmText] = useState('')

  async function handleDelete() {
    if (confirmText !== 'HESABIMI SIL') {
      setError('Lütfen "HESABIMI SIL" yazarak onaylayın')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/delete-account', {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Hesap silinemedi')
      }

      router.push('/')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  if (!showConfirm) {
    return (
      <button
        onClick={() => setShowConfirm(true)}
        className="px-4 py-2 border border-accent-300 text-accent-600 hover:bg-accent-50 text-sm font-medium rounded-lg transition-colors"
      >
        Hesabı Sil
      </button>
    )
  }

  return (
    <div className="p-4 bg-accent-50 border border-accent-200 rounded-lg">
      <div className="flex items-start gap-3 mb-4">
        <AlertTriangle className="h-5 w-5 text-accent-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-accent-900">Bu işlem geri alınamaz!</p>
          <p className="text-sm text-accent-700 mt-1">
            Hesabınız, şirket bilgileriniz, ilanlarınız ve tüm verileriniz kalıcı olarak silinecektir.
          </p>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-secondary-900 mb-2">
          Onaylamak için <span className="font-bold">HESABIMI SIL</span> yazın:
        </label>
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
          placeholder="HESABIMI SIL"
        />
      </div>

      {error && (
        <p className="text-sm text-accent-600 mb-4">{error}</p>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleDelete}
          disabled={loading}
          className="px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Hesabımı Kalıcı Olarak Sil
        </button>
        <button
          onClick={() => {
            setShowConfirm(false)
            setConfirmText('')
            setError(null)
          }}
          disabled={loading}
          className="px-4 py-2 border border-secondary-200 text-secondary-700 hover:bg-secondary-50 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          İptal
        </button>
      </div>
    </div>
  )
}
