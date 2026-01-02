import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/dashboard/',
          '/isveren/dashboard/',
          '/api/',
          '/giris',
          '/kayit',
          '/sifremi-unuttum',
          '/sifre-sifirla',
        ],
      },
    ],
    sitemap: 'https://yemeicmeisi.com/sitemap.xml',
  }
}
