import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://yemeicmeisleri.com'),
  title: {
    default: 'Yeme İçme İşleri - Restoran ve Kafe İş İlanları',
    template: '%s | Yeme İçme İşleri'
  },
  description: 'Restoran, kafe ve otel sektöründe iş arayanlar ve işverenler için profesyonel platform. En güncel iş ilanlarını keşfedin.',
  keywords: ['iş ilanları', 'restoran iş ilanları', 'kafe iş ilanları', 'garson ilanları', 'aşçı ilanları', 'yeme içme sektörü'],
  authors: [{ name: 'Yeme İçme İşleri' }],
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://yemeicmeisleri.com',
    siteName: 'Yeme İçme İşleri',
    title: 'Yeme İçme İşleri - Restoran ve Kafe İş İlanları',
    description: 'Restoran, kafe ve otel sektöründe iş arayanlar ve işverenler için profesyonel platform',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'Yeme İçme İşleri - Restoran ve Kafe İş İlanları',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Yeme İçme İşleri - Restoran ve Kafe İş İlanları',
    description: 'Restoran, kafe ve otel sektöründe iş arayanlar ve işverenler için profesyonel platform',
    images: ['/opengraph-image.png'],
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
  alternates: {
    canonical: '/',
  },
}

// Organization Schema for SEO
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Yeme İçme İşleri',
  url: 'https://yemeicmeisleri.com',
  logo: 'https://yemeicmeisleri.com/android-chrome-512x512.png',
  description: 'Türkiye\'nin restoran ve kafe iş ilanları platformu',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'TR',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <Toaster position="top-right" richColors />
        {children}
      </body>
    </html>
  )
}
