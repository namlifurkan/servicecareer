import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Yeme İçme İşleri - Restoran ve Kafe İş İlanları',
    template: '%s | Yeme İçme İşleri'
  },
  description: 'Restoran, kafe ve otel sektöründe iş arayanlar ve işverenler için profesyonel platform. En güncel iş ilanlarını keşfedin.',
  keywords: ['iş ilanları', 'restoran iş ilanları', 'kafe iş ilanları', 'garson ilanları', 'aşçı ilanları', 'yeme içme sektörü'],
  authors: [{ name: 'Yeme İçme İşleri' }],
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-16x16.svg', sizes: '16x16', type: 'image/svg+xml' },
      { url: '/favicon-32x32.svg', sizes: '32x32', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.svg', sizes: '180x180', type: 'image/svg+xml' },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://yemeicmeisleri.com',
    siteName: 'Yeme İçme İşleri',
    title: 'Yeme İçme İşleri - Restoran ve Kafe İş İlanları',
    description: 'Restoran, kafe ve otel sektöründe iş arayanlar ve işverenler için profesyonel platform',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Toaster position="top-right" richColors />
        {children}
      </body>
    </html>
  )
}
