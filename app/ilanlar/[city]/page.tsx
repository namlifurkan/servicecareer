import { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { JobListingsEnhanced } from '@/components/job-listings-enhanced'
import { createClient } from '@/lib/supabase/server'
import { MapPin, AlertCircle, Briefcase } from 'lucide-react'

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

  // Fetch all categories for filter
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  // Acil ilan sayısı bu şehir için
  const { count: urgentCount } = await supabase
    .from('jobs')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'active')
    .eq('is_urgent', true)
    .ilike('location_city', `%${cityName}%`)

  // Fetch jobs for the specific city with service industry fields
  const { data: jobs, error } = await supabase
    .from('jobs')
    .select(`
      id,
      title,
      slug,
      location_city,
      work_type,
      experience_level,
      salary_min,
      salary_max,
      salary_currency,
      show_salary,
      published_at,
      position_type,
      venue_type,
      shift_types,
      cuisine_types,
      service_experience_required,
      is_urgent,
      uniform_policy,
      meal_policy,
      tip_policy,
      benefits,
      companies (
        name,
        logo_url,
        city
      ),
      categories!jobs_category_id_fkey (
        id,
        name,
        slug
      )
    `)
    .eq('status', 'active')
    .ilike('location_city', `%${cityName}%`)
    .not('published_at', 'is', null)
    .order('is_urgent', { ascending: false })
    .order('published_at', { ascending: false })
    .limit(50)

  // Transform jobs to ensure companies and categories are single objects
  const transformedJobs = jobs?.map(job => ({
    ...job,
    companies: Array.isArray(job.companies) ? job.companies[0] || null : job.companies,
    categories: Array.isArray(job.categories) ? job.categories[0] || null : job.categories,
  })) || []

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
        <div className="bg-white rounded-xl border border-secondary-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <MapPin className="h-5 w-5 text-primary-600" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-secondary-900">
                  {cityName} İş İlanları
                </h1>
              </div>
              <p className="text-secondary-600">
                {cityName} ilinde hizmet sektöründe {transformedJobs.length} aktif iş ilanı
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4">
              <div className="text-center px-4 py-2 bg-primary-50 rounded-lg">
                <p className="text-xl font-bold text-primary-600">{transformedJobs.length}</p>
                <p className="text-xs text-primary-600">İlan</p>
              </div>
              {(urgentCount || 0) > 0 && (
                <Link
                  href={`/ilanlar/${city}?urgent=true`}
                  className="text-center px-4 py-2 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <p className="text-xl font-bold text-red-600">{urgentCount}</p>
                  <p className="text-xs text-red-600">Acil</p>
                </Link>
              )}
            </div>
          </div>

          {/* Structured Data for SEO */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'ItemList',
                name: `${cityName} İş İlanları`,
                description: `${cityName} ilinde hizmet sektöründe iş ilanları`,
                numberOfItems: transformedJobs.length,
                itemListElement: transformedJobs.slice(0, 10).map((job, index) => ({
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
        ) : transformedJobs && transformedJobs.length > 0 ? (
          <JobListingsEnhanced jobs={transformedJobs} categories={categories || []} initialCity={cityName} />
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
