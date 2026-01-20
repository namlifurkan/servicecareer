import { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { JobListingsEnhanced } from '@/components/job-listings-enhanced'
import { createClient } from '@/lib/supabase/server'
import { ExternalJob } from '@/lib/types/external-job'
import { transformExternalJobsToUnified, mergeJobsWithExternal, type UnifiedJob } from '@/lib/external-job-utils'

export const metadata: Metadata = {
  title: 'İş İlanları - Restoran ve Kafe | Yeme İçme İşi',
  description: 'Restoran, kafe, bar ve otel sektöründe güncel iş ilanları. Garson, aşçı, barista, kurye ve daha fazlası.',
  openGraph: {
    title: 'İş İlanları | Yeme İçme İşi',
    description: 'Restoran ve kafe sektöründe güncel iş ilanları - Garson, aşçı, barista pozisyonları',
  },
  alternates: {
    canonical: '/ilanlar',
  },
}

// Hızlı filtre kısayolları
const quickFilters = [
  { key: 'waiter', label: 'Garson' },
  { key: 'line_cook', label: 'Aşçı' },
  { key: 'barista', label: 'Barista' },
  { key: 'bartender', label: 'Barmen' },
  { key: 'delivery_driver', label: 'Kurye' },
  { key: 'host_hostess', label: 'Hostes' },
]

export default async function JobListingsPage() {
  const supabase = await createClient()

  // Fetch all categories for filter
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  // Acil ilan sayısı
  const { count: urgentCount } = await supabase
    .from('jobs')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'active')
    .eq('is_urgent', true)

  // Bugün eklenen ilan sayısı
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const { count: todayCount } = await supabase
    .from('jobs')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'active')
    .gte('published_at', today.toISOString())

  // Fetch external jobs from partner sites
  const { data: externalJobs } = await supabase
    .from('external_jobs')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(30)

  // SEO-friendly data fetching with service industry fields
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
    .not('published_at', 'is', null)
    .order('is_urgent', { ascending: false })
    .order('published_at', { ascending: false })
    .limit(100)

  // Log error details for debugging
  if (error) {
    console.error('Error fetching jobs:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    })
  }

  // Transform jobs to ensure companies and categories are single objects
  const transformedJobs = jobs?.map(job => ({
    ...job,
    companies: Array.isArray(job.companies) ? job.companies[0] || null : job.companies,
    categories: Array.isArray(job.categories) ? job.categories[0] || null : job.categories,
    isExternal: false,
  })) || []

  // Transform and merge external jobs with internal jobs
  const transformedExternalJobs = externalJobs
    ? transformExternalJobsToUnified(externalJobs as ExternalJob[])
    : []

  // Merge jobs - external jobs will be interleaved (1 external every 5 internal)
  const mergedJobs = mergeJobsWithExternal(
    transformedJobs as UnifiedJob[],
    transformedExternalJobs,
    5
  )

  return (
    <>
      <Header />
      <main className="min-h-screen bg-secondary-50">
        {/* Hero Header */}
        <div className="bg-white border-b border-secondary-200">
          <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-2">
                  Hizmet Sektörü İş İlanları
                </h1>
                <p className="text-base md:text-lg text-secondary-600">
                  Restoran, kafe, bar ve otel sektöründe {mergedJobs.length} aktif ilan
                </p>
              </div>

              {/* Quick Stats */}
              <div className="flex items-center gap-4 md:gap-6">
                <div className="text-center px-4 py-2 bg-secondary-50 rounded-lg">
                  <p className="text-2xl font-bold text-primary-600">{mergedJobs.length}</p>
                  <p className="text-xs text-secondary-500">Toplam İlan</p>
                </div>
                {(urgentCount || 0) > 0 && (
                  <div className="text-center px-4 py-2 bg-red-50 rounded-lg">
                    <p className="text-2xl font-bold text-red-600">{urgentCount}</p>
                    <p className="text-xs text-red-600">Acil İlan</p>
                  </div>
                )}
                {(todayCount || 0) > 0 && (
                  <div className="text-center px-4 py-2 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{todayCount}</p>
                    <p className="text-xs text-green-600">Bugün Eklenen</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Position Filters */}
            <div className="mt-6 flex flex-wrap items-center gap-x-1 gap-y-2">
              <span className="text-sm text-secondary-500 mr-1">Popüler:</span>
              {quickFilters.map((filter, index) => (
                <span key={filter.key} className="inline-flex items-center">
                  <Link
                    href={`/ilanlar?position=${filter.key}`}
                    className="text-sm text-secondary-700 hover:text-primary-600 underline-offset-2 hover:underline"
                  >
                    {filter.label}
                  </Link>
                  {index < quickFilters.length - 1 && (
                    <span className="text-secondary-300 mx-2">·</span>
                  )}
                </span>
              ))}
              {(urgentCount || 0) > 0 && (
                <>
                  <span className="text-secondary-300 mx-2">·</span>
                  <Link
                    href="/ilanlar?urgent=true"
                    className="text-sm text-red-600 hover:text-red-700 underline-offset-2 hover:underline font-medium"
                  >
                    Acil İlanlar ({urgentCount})
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-6 py-8">
          {/* Employer CTA - More Compact */}
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 rounded-xl p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h3 className="text-lg font-semibold text-secondary-900 mb-1">
                İşveren misiniz? İlanınızı Ücretsiz Yayınlayın
              </h3>
              <p className="text-sm text-secondary-600">
                İlk 3 ilan ücretsiz! Binlerce adaya hemen ulaşın.
              </p>
            </div>
            <Link
              href="/isveren/kayit"
              className="inline-flex items-center px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors whitespace-nowrap"
            >
              Hemen Başlayın
            </Link>
          </div>

          {/* Error State */}
          {error ? (
            <div className="bg-white rounded-2xl border border-accent-200 p-8 text-center">
              <p className="text-accent-600">İlanlar yüklenirken bir hata oluştu.</p>
            </div>
          ) : mergedJobs.length > 0 ? (
            <JobListingsEnhanced
              jobs={mergedJobs as any}
              categories={categories || []}
            />
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-secondary-200">
              <p className="text-lg text-secondary-600">Henüz ilan bulunmamaktadır.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

export const revalidate = 300 // ISR: 5 dakikada bir yenile
