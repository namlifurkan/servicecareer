import { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { JobListingsClient } from '@/components/job-listings-client'
import { createClient } from '@/lib/supabase/server'

// Popüler şehirler için statik sayfa oluşturma - Footer'daki tüm şehirler
export async function generateStaticParams() {
  const popularCities = [
    'istanbul',
    'ankara',
    'izmir',
    'bursa',
    'antalya',
    'adana',
    'gaziantep',
    'konya',
    'kayseri',
    'mersin',
    'eskisehir',
    'diyarbakir',
  ]

  return popularCities.map((city) => ({
    city: city,
  }))
}

type Props = {
  params: Promise<{ city: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params
  const cityName = city.charAt(0).toUpperCase() + city.slice(1)

  return {
    title: `${cityName} İş İlanları`,
    description: `${cityName} ilinde hizmet sektöründe güncel iş ilanları. ${cityName}'da iş arıyorsanız doğru yerdesiniz.`,
    openGraph: {
      title: `${cityName} İş İlanları | ServiceCareer`,
      description: `${cityName} ilinde güncel iş ilanları`,
    },
    alternates: {
      canonical: `/ilanlar/${city}`,
    },
  }
}

export default async function CityJobListingsPage({ params }: Props) {
  const { city } = await params
  const supabase = await createClient()

  // Map slug back to Turkish city name
  const citySlugToName: Record<string, string> = {
    'istanbul': 'İstanbul',
    'ankara': 'Ankara',
    'izmir': 'İzmir',
    'bursa': 'Bursa',
    'antalya': 'Antalya',
    'adana': 'Adana',
    'gaziantep': 'Gaziantep',
    'konya': 'Konya',
    'kayseri': 'Kayseri',
    'mersin': 'Mersin',
    'eskisehir': 'Eskişehir',
    'diyarbakir': 'Diyarbakır',
  }

  // Get city name from mapping or capitalize slug
  const cityName = citySlugToName[city] || city
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  // Fetch jobs for the specific city
  const { data: jobs, error } = await supabase
    .from('jobs')
    .select(`
      *,
      companies (
        name,
        logo_url,
        city
      ),
      cities (
        id,
        name
      )
    `)
    .eq('status', 'active')
    .ilike('location_city', `%${cityName}%`)
    .not('published_at', 'is', null)
    .order('is_featured', { ascending: false })
    .order('published_at', { ascending: false })
    .limit(50)

  return (
    <>
      <Header />
      <main className="min-h-screen bg-secondary-50">
      {/* Breadcrumb for SEO */}
      <nav className="bg-white border-b border-secondary-200" aria-label="Breadcrumb">
        <div className="container mx-auto px-4 py-3">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link href="/" className="text-primary-600 hover:text-primary-700">
                Ana Sayfa
              </Link>
            </li>
            <li className="text-secondary-400">/</li>
            <li>
              <Link href="/ilanlar" className="text-primary-600 hover:text-primary-700">
                İş İlanları
              </Link>
            </li>
            <li className="text-secondary-400">/</li>
            <li className="text-secondary-900 font-medium">{cityName}</li>
          </ol>
        </div>
      </nav>

      <div className="container mx-auto px-4 md:px-6 py-8">
        {/* SEO-Optimized Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold text-secondary-900 mb-2">
            {cityName} İş İlanları
          </h1>
          <p className="text-base md:text-lg text-secondary-600">
            {jobs?.length || 0} aktif ilan
          </p>

          {/* Structured Data for SEO */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'ItemList',
                name: `${cityName} İş İlanları`,
                description: `${cityName} ilinde hizmet sektöründe iş ilanları`,
                numberOfItems: jobs?.length || 0,
                itemListElement: jobs?.slice(0, 10).map((job, index) => ({
                  '@type': 'ListItem',
                  position: index + 1,
                  item: {
                    '@type': 'JobPosting',
                    title: job.title,
                    datePosted: job.published_at,
                    jobLocation: {
                      '@type': 'Place',
                      address: {
                        '@type': 'PostalAddress',
                        addressLocality: job.location_city,
                        addressCountry: 'TR',
                      },
                    },
                    hiringOrganization: {
                      '@type': 'Organization',
                      name: (job.companies as any)?.name || 'Şirket',
                    },
                  },
                })),
              }),
            }}
          />
        </div>

        {/* Error State */}
        {error ? (
          <div className="bg-white rounded-2xl border border-accent-200 p-8 text-center">
            <p className="text-accent-600">İlanlar yüklenirken bir hata oluştu.</p>
          </div>
        ) : jobs && jobs.length > 0 ? (
          <JobListingsClient jobs={jobs} />
        ) : (
          <div className="bg-white rounded-xl border border-secondary-200 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                {cityName} için ilan bulunamadı
              </h3>
              <p className="text-secondary-600 mb-6">
                Bu şehirde henüz aktif iş ilanı bulunmuyor. Diğer şehirlerdeki ilanları inceleyebilir veya tüm ilanları görebilirsiniz.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/ilanlar"
                  className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Tüm İlanları Görüntüle
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center px-6 py-3 border border-secondary-200 text-secondary-700 font-medium rounded-lg hover:bg-secondary-50 transition-colors"
                >
                  Ana Sayfaya Dön
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* SEO Text Content */}
        <section className="mt-12 bg-white rounded-xl border border-secondary-200 p-6">
          <h2 className="text-2xl font-semibold text-secondary-900 mb-4">
            {cityName} İş İlanları Hakkında
          </h2>
          <div className="text-secondary-700">
            <p>
              {cityName} ilinde hizmet sektöründe kariyer arayanlar için en güncel iş ilanları.
              ServiceCareer platformu üzerinden {cityName}&apos;da yayınlanan tüm iş fırsatlarını
              inceleyebilir, size uygun pozisyonlara başvurabilirsiniz.
            </p>
          </div>
        </section>
      </div>
    </main>
    <Footer />
    </>
  )
}

// ISR: Her 5 dakikada bir yeniden oluştur
export const revalidate = 300
