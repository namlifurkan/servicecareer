import { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { JobListingsClient } from '@/components/job-listings-client'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'İş İlanları',
  description: 'Hizmet sektöründe güncel iş ilanları. Binlerce iş fırsatı arasından size en uygun pozisyonu bulun.',
  openGraph: {
    title: 'İş İlanları | ServiceCareer',
    description: 'Hizmet sektöründe güncel iş ilanları',
  },
}

export default async function JobListingsPage() {
  const supabase = await createClient()

  // SEO-friendly data fetching with proper error handling
  const { data: jobs, error } = await supabase
    .from('jobs')
    .select(`
      *,
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
    .order('published_at', { ascending: false})
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

  return (
    <>
      <Header />
      <main className="min-h-screen bg-secondary-50">
        <div className="container mx-auto px-4 md:px-6 py-8">
          {/* SEO-Friendly Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-semibold text-secondary-900 mb-2">
              Tüm İş İlanları
            </h1>
            <p className="text-base md:text-lg text-secondary-600">
              {jobs?.length || 0} aktif ilan
            </p>
          </div>

          {/* Employer CTA */}
          <div className="bg-primary-50 border border-primary-200 rounded-2xl p-8 mb-8 text-center">
            <h3 className="text-xl md:text-2xl font-semibold text-secondary-900 mb-3">
              İlanınızı Ücretsiz Yayınlayın
            </h3>
            <p className="text-secondary-600 mb-6">
              İlk 3 ilan ücretsiz! Binlerce adaya hemen ulaşın.
            </p>
            <Link
              href="/isveren/kayit"
              className="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
            >
              Hemen Başlayın
            </Link>
          </div>

          {/* Error State */}
          {error ? (
            <div className="bg-white rounded-2xl border border-accent-200 p-8 text-center">
              <p className="text-accent-600">İlanlar yüklenirken bir hata oluştu.</p>
            </div>
          ) : jobs && jobs.length > 0 ? (
            <JobListingsClient jobs={jobs} />
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
