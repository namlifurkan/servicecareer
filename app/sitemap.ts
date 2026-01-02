import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

// Türkiye'nin 81 ili (URL-friendly sluglar)
const cityList = [
  'adana', 'adiyaman', 'afyonkarahisar', 'agri', 'aksaray', 'amasya', 'ankara',
  'antalya', 'ardahan', 'artvin', 'aydin', 'balikesir', 'bartin', 'batman',
  'bayburt', 'bilecik', 'bingol', 'bitlis', 'bolu', 'burdur', 'bursa',
  'canakkale', 'cankiri', 'corum', 'denizli', 'diyarbakir', 'duzce', 'edirne',
  'elazig', 'erzincan', 'erzurum', 'eskisehir', 'gaziantep', 'giresun',
  'gumushane', 'hakkari', 'hatay', 'igdir', 'isparta', 'istanbul', 'izmir',
  'kahramanmaras', 'karabuk', 'karaman', 'kars', 'kastamonu', 'kayseri',
  'kilis', 'kirikkale', 'kirklareli', 'kirsehir', 'kocaeli', 'konya', 'kutahya',
  'malatya', 'manisa', 'mardin', 'mersin', 'mugla', 'mus', 'nevsehir', 'nigde',
  'ordu', 'osmaniye', 'rize', 'sakarya', 'samsun', 'sanliurfa', 'siirt',
  'sinop', 'sirnak', 'sivas', 'tekirdag', 'tokat', 'trabzon', 'tunceli',
  'usak', 'van', 'yalova', 'yozgat', 'zonguldak'
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const baseUrl = 'https://yemeicmeisi.com'

  // Aktif iş ilanlarını getir
  const { data: jobs } = await supabase
    .from('jobs')
    .select('slug, published_at, updated_at')
    .eq('status', 'active')
    .not('published_at', 'is', null)
    .order('published_at', { ascending: false })

  // Ana sayfalar
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/ilanlar`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
  ]

  // Şehir sayfaları
  const cityPages: MetadataRoute.Sitemap = cityList.map((city) => ({
    url: `${baseUrl}/ilanlar/${city}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  // İlan detay sayfaları
  const jobPages: MetadataRoute.Sitemap = (jobs || []).map((job) => ({
    url: `${baseUrl}/ilan/${job.slug}`,
    lastModified: new Date(job.updated_at || job.published_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...cityPages, ...jobPages]
}
