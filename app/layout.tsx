import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'ServiceCareer - Hizmet Sektörü İş İlanları',
    template: '%s | ServiceCareer'
  },
  description: 'Hizmet sektöründe iş arayanlar ve işverenler için profesyonel platform. En güncel iş ilanlarını keşfedin.',
  keywords: ['iş ilanları', 'hizmet sektörü', 'kariyer', 'işveren', 'iş arama', 'CRM'],
  authors: [{ name: 'ServiceCareer' }],
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://servicecareer.com',
    siteName: 'ServiceCareer',
    title: 'ServiceCareer - Hizmet Sektörü İş İlanları',
    description: 'Hizmet sektöründe iş arayanlar ve işverenler için profesyonel platform',
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
