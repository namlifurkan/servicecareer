'use client'

import { useState } from 'react'
import { Share2, Check } from 'lucide-react'
import { toast } from 'sonner'

interface JobShareButtonProps {
  jobTitle: string
  jobSlug: string
}

export function JobShareButton({ jobTitle, jobSlug }: JobShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/ilan/${jobSlug}`
    const shareData = {
      title: jobTitle,
      text: `${jobTitle} - Yeme İçme İşleri'nde bu ilanı inceleyin!`,
      url: shareUrl
    }

    // Try native share first (mobile)
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData)
        toast.success('Paylaşıldı!')
        return
      } catch (err) {
        // User cancelled or error, fall through to clipboard
        if ((err as Error).name === 'AbortError') return
      }
    }

    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success('Link kopyalandı!')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error('Link kopyalanamadı')
    }
  }

  return (
    <button
      onClick={handleShare}
      className="w-full bg-white rounded-xl border border-secondary-200 p-4 flex items-center justify-center gap-2 text-secondary-600 hover:bg-secondary-50 transition-colors"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-600">Kopyalandı!</span>
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" />
          <span className="text-sm font-medium">İlanı Paylaş</span>
        </>
      )}
    </button>
  )
}
