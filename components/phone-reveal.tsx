'use client'

import { useState } from 'react'
import { Phone } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface PhoneRevealProps {
  jobId: string
  phoneNumber: string
  companyName: string
}

export function PhoneReveal({ jobId, phoneNumber, companyName }: PhoneRevealProps) {
  const [isRevealed, setIsRevealed] = useState(false)
  const [isTracking, setIsTracking] = useState(false)

  const handleReveal = async () => {
    if (isRevealed || isTracking) return

    setIsTracking(true)

    try {
      const supabase = createClient()

      // Get current user if authenticated
      const { data: { user } } = await supabase.auth.getUser()

      // Track phone reveal
      const { error } = await supabase
        .from('phone_reveals')
        .insert({
          job_id: jobId,
          user_id: user?.id || null,
          ip_address: null, // IP will be captured server-side if needed
          user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : null,
        })

      if (error) {
        console.error('Phone reveal tracking error:', error)
        // Continue showing phone even if tracking fails
      }

      setIsRevealed(true)
    } catch (error) {
      console.error('Phone reveal error:', error)
      setIsRevealed(true) // Show phone anyway on error
    } finally {
      setIsTracking(false)
    }
  }

  if (isRevealed) {
    return (
      <div className="p-4 bg-secondary-50 border border-secondary-200 rounded-xl">
        <div className="flex items-center gap-2 text-secondary-700 mb-2">
          <Phone className="h-4 w-4" />
          <span className="text-sm font-medium">İletişim Numarası</span>
        </div>
        <a
          href={`tel:${phoneNumber}`}
          className="text-xl font-semibold text-primary-600 hover:text-primary-700 transition-colors block mb-1"
        >
          {formatPhoneNumber(phoneNumber)}
        </a>
        <p className="text-xs text-secondary-600">
          {companyName} ile doğrudan iletişime geçin
        </p>
      </div>
    )
  }

  return (
    <button
      onClick={handleReveal}
      disabled={isTracking}
      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-primary-50 border-2 border-primary-600 hover:border-primary-700 text-primary-600 hover:text-primary-700 font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Phone className="h-5 w-5" />
      {isTracking ? 'Yükleniyor...' : 'Telefon Numarasını Göster'}
    </button>
  )
}

function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '')

  // Format as Turkish phone number
  if (cleaned.length === 10) {
    return `0${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8)}`
  }

  return phone
}
