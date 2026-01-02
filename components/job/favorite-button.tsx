'use client'

import { useState, useTransition } from 'react'
import { Heart } from 'lucide-react'
import { toast } from 'sonner'
import { toggleFavorite } from '@/lib/favorite-actions'
import { cn } from '@/lib/utils'

interface FavoriteButtonProps {
  jobId: string
  initialFavorited?: boolean
  isLoggedIn?: boolean
  variant?: 'default' | 'card' | 'icon-only'
  className?: string
}

export function FavoriteButton({
  jobId,
  initialFavorited = false,
  isLoggedIn = false,
  variant = 'default',
  className
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited)
  const [isPending, startTransition] = useTransition()

  const handleToggle = async () => {
    if (!isLoggedIn) {
      toast.error('Favorilere eklemek için giriş yapın', {
        action: {
          label: 'Giriş Yap',
          onClick: () => window.location.href = '/giris'
        }
      })
      return
    }

    // Optimistic update
    setIsFavorited(!isFavorited)

    startTransition(async () => {
      const result = await toggleFavorite(jobId)

      if (!result.success) {
        // Revert on error
        setIsFavorited(isFavorited)
        toast.error(result.error || 'Bir hata oluştu')
      } else {
        toast.success(result.isFavorited ? 'Favorilere eklendi' : 'Favorilerden kaldırıldı')
      }
    })
  }

  if (variant === 'icon-only') {
    return (
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          handleToggle()
        }}
        disabled={isPending}
        className={cn(
          'p-1.5 rounded-full transition-all duration-200',
          isFavorited
            ? 'text-red-500 bg-red-50 hover:bg-red-100'
            : 'text-secondary-400 bg-white/80 hover:bg-white hover:text-red-500',
          isPending && 'opacity-50 cursor-not-allowed',
          className
        )}
        aria-label={isFavorited ? 'Favorilerden kaldır' : 'Favorilere ekle'}
      >
        <Heart
          className={cn(
            'h-4 w-4 transition-transform duration-200',
            isFavorited && 'fill-current scale-110',
            !isPending && 'hover:scale-110'
          )}
        />
      </button>
    )
  }

  if (variant === 'card') {
    return (
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          handleToggle()
        }}
        disabled={isPending}
        className={cn(
          'absolute top-3 right-3 p-2 rounded-full transition-all duration-200 shadow-sm',
          isFavorited
            ? 'text-red-500 bg-white hover:bg-red-50'
            : 'text-secondary-400 bg-white/90 hover:bg-white hover:text-red-500 opacity-0 group-hover:opacity-100',
          isFavorited && 'opacity-100',
          isPending && 'opacity-50 cursor-not-allowed',
          className
        )}
        aria-label={isFavorited ? 'Favorilerden kaldır' : 'Favorilere ekle'}
      >
        <Heart
          className={cn(
            'h-5 w-5 transition-transform duration-200',
            isFavorited && 'fill-current scale-110'
          )}
        />
      </button>
    )
  }

  // Default variant - full button
  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={cn(
        'w-full rounded-xl border p-4 flex items-center justify-center gap-2 transition-all duration-200',
        isFavorited
          ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
          : 'bg-white border-secondary-200 text-secondary-600 hover:bg-secondary-50',
        isPending && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <Heart
        className={cn(
          'h-4 w-4 transition-transform duration-200',
          isFavorited && 'fill-current'
        )}
      />
      <span className="text-sm font-medium">
        {isFavorited ? 'Kaydedildi' : 'Kaydet'}
      </span>
    </button>
  )
}
