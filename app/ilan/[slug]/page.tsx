import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { JobDetailClient } from '@/components/job/job-detail-client'
import {
  MapPin,
  Briefcase,
  Clock,
  GraduationCap,
  DollarSign,
  Building2,
  Calendar
} from 'lucide-react'
import Link from 'next/link'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: job } = await supabase
    .from('jobs')
    .select('title, description, location_city')
    .eq('slug', slug)
    .single()

  if (!job) {
    return {
      title: 'İlan Bulunamadı',
    }
  }

  return {
    title: `${job.title} - ${job.location_city} | ServiceCareer`,
    description: job.description.substring(0, 160),
  }
}

// Turkish translations for enum values
const workTypeLabels: Record<string, string> = {
  'full_time': 'Tam Zamanlı',
  'part_time': 'Yarı Zamanlı',
  'contract': 'Sözleşmeli',
  'freelance': 'Serbest',
  'internship': 'Staj'
}

const experienceLevelLabels: Record<string, string> = {
  'entry': 'Deneyimsiz',
  'junior': 'Deneyimli',
  'mid': 'Kıdemli',
  'senior': 'Uzman',
  'lead': 'Lider',
  'executive': 'Yönetici'
}

const educationLevelLabels: Record<string, string> = {
  'high_school': 'Lise',
  'associate': 'Ön Lisans',
  'bachelor': 'Lisans',
  'master': 'Yüksek Lisans',
  'doctorate': 'Doktora'
}

export default async function JobDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  // Get job with company and category details
  const { data: job } = await supabase
    .from('jobs')
    .select(`
      *,
      companies (
        id,
        name,
        logo_url,
        description,
        industry,
        company_size,
        website,
        phone
      ),
      categories!jobs_category_id_fkey (
        id,
        name,
        slug
      )
    `)
    .eq('slug', slug)
    .eq('status', 'active')
    .single()

  if (!job) {
    notFound()
  }

  // Check if user already applied
  let hasApplied = false
  if (user) {
    const { data: application } = await supabase
      .from('applications')
      .select('id')
      .eq('job_id', job.id)
      .eq('candidate_id', user.id)
      .single()

    hasApplied = !!application
  }

  // Increment view count
  await supabase
    .from('jobs')
    .update({ view_count: (job.view_count || 0) + 1 })
    .eq('id', job.id)

  // Get similar jobs
  const { data: similarJobs } = await supabase
    .from('jobs')
    .select(`
      id,
      title,
      slug,
      location_city,
      work_type,
      experience_level,
      published_at,
      companies (
        name,
        logo_url
      ),
      categories!jobs_category_id_fkey (
        name,
        slug
      )
    `)
    .eq('status', 'active')
    .eq('category_id', job.category_id)
    .neq('id', job.id)
    .limit(3)

  return (
    <>
      <Header />
      <main className="min-h-screen bg-secondary-50">
        {/* Breadcrumb */}
        <nav className="bg-white border-b border-secondary-200">
          <div className="container mx-auto px-4 py-3">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <Link href="/" className="text-secondary-600 hover:text-secondary-900">
                  Ana Sayfa
                </Link>
              </li>
              <li className="text-secondary-400">/</li>
              <li>
                <Link href="/ilanlar" className="text-secondary-600 hover:text-secondary-900">
                  İlanlar
                </Link>
              </li>
              {job.categories && (
                <>
                  <li className="text-secondary-400">/</li>
                  <li>
                    <span className="text-secondary-600">
                      {job.categories.name}
                    </span>
                  </li>
                </>
              )}
              <li className="text-secondary-400">/</li>
              <li className="text-secondary-900 font-medium truncate max-w-xs">
                {job.title}
              </li>
            </ol>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Job Header */}
              <div className="bg-white rounded-xl border border-secondary-200 p-6">
                <div className="flex items-start gap-4">
                  {job.companies?.logo_url ? (
                    <img
                      src={job.companies.logo_url}
                      alt={job.companies.name}
                      className="w-16 h-16 rounded-xl object-cover border border-secondary-200"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-primary-100 flex items-center justify-center border border-secondary-200">
                      <Building2 className="h-8 w-8 text-primary-600" />
                    </div>
                  )}

                  <div className="flex-1">
                    <h1 className="text-2xl md:text-3xl font-semibold text-secondary-900 mb-2">
                      {job.title}
                    </h1>
                    <p className="text-lg text-secondary-600 mb-3">
                      {job.companies?.name}
                    </p>

                    <div className="flex flex-wrap gap-4 text-sm text-secondary-600">
                      {job.location_city && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4" />
                          {job.location_city}
                          {job.location_district && `, ${job.location_district}`}
                        </div>
                      )}
                      {job.work_type && (
                        <div className="flex items-center gap-1.5">
                          <Briefcase className="h-4 w-4" />
                          {workTypeLabels[job.work_type] || job.work_type}
                        </div>
                      )}
                      {job.experience_level && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4" />
                          {experienceLevelLabels[job.experience_level] || job.experience_level}
                        </div>
                      )}
                      {job.education_level && (
                        <div className="flex items-center gap-1.5">
                          <GraduationCap className="h-4 w-4" />
                          {educationLevelLabels[job.education_level] || job.education_level}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Salary */}
                {job.show_salary && (job.salary_min || job.salary_max) && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-900">
                        {job.salary_min && `${job.salary_min.toLocaleString('tr-TR')} TL`}
                        {job.salary_min && job.salary_max && ' - '}
                        {job.salary_max && `${job.salary_max.toLocaleString('tr-TR')} TL`}
                      </span>
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {job.categories && (
                    <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                      {job.categories.name}
                    </span>
                  )}
                  {job.work_type && (
                    <span className="px-3 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded-full">
                      {workTypeLabels[job.work_type] || job.work_type}
                    </span>
                  )}
                  {job.experience_level && (
                    <span className="px-3 py-1 text-xs font-medium bg-secondary-100 text-secondary-700 rounded-full">
                      {experienceLevelLabels[job.experience_level] || job.experience_level}
                    </span>
                  )}
                  {job.education_level && (
                    <span className="px-3 py-1 text-xs font-medium bg-secondary-100 text-secondary-700 rounded-full">
                      {educationLevelLabels[job.education_level] || job.education_level}
                    </span>
                  )}
                  {job.published_at && (
                    <span className="px-3 py-1 text-xs font-medium bg-secondary-100 text-secondary-700 rounded-full flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(job.published_at).toLocaleDateString('tr-TR')}
                    </span>
                  )}
                </div>
              </div>

              {/* Job Description */}
              <div className="bg-white rounded-xl border border-secondary-200 p-6">
                <h2 className="text-lg font-semibold text-secondary-900 mb-4">İş Açıklaması</h2>
                <p className="text-secondary-700 whitespace-pre-wrap leading-relaxed">
                  {job.description}
                </p>
              </div>

              {/* Responsibilities */}
              {job.responsibilities && (
                <div className="bg-white rounded-xl border border-secondary-200 p-6">
                  <h2 className="text-lg font-semibold text-secondary-900 mb-4">Sorumluluklar</h2>
                  <p className="text-secondary-700 whitespace-pre-wrap leading-relaxed">
                    {job.responsibilities}
                  </p>
                </div>
              )}

              {/* Qualifications */}
              {job.qualifications && (
                <div className="bg-white rounded-xl border border-secondary-200 p-6">
                  <h2 className="text-lg font-semibold text-secondary-900 mb-4">Aranan Nitelikler</h2>
                  <p className="text-secondary-700 whitespace-pre-wrap leading-relaxed">
                    {job.qualifications}
                  </p>
                </div>
              )}

              {/* Benefits */}
              {job.benefits && job.benefits.length > 0 && (
                <div className="bg-white rounded-xl border border-secondary-200 p-6">
                  <h2 className="text-lg font-semibold text-secondary-900 mb-4">Yan Haklar</h2>
                  <ul className="list-disc list-inside space-y-2">
                    {job.benefits.map((benefit: string, index: number) => (
                      <li key={index} className="text-secondary-700">
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Additional Info */}
              {job.additional_info && (
                <div className="bg-white rounded-xl border border-secondary-200 p-6">
                  <h2 className="text-lg font-semibold text-secondary-900 mb-4">Ek Bilgiler</h2>
                  <p className="text-secondary-700 whitespace-pre-wrap leading-relaxed">
                    {job.additional_info}
                  </p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Apply Card - Client Component */}
              <JobDetailClient
                jobId={job.id}
                companyPhone={job.companies?.phone || null}
                hasApplied={hasApplied}
                isLoggedIn={!!user}
              />

              {/* Company Info */}
              <div className="bg-white rounded-xl border border-secondary-200 p-6 sticky top-24">
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">Şirket Hakkında</h3>

                <div className="flex items-center gap-3 mb-4">
                  {job.companies?.logo_url ? (
                    <img
                      src={job.companies.logo_url}
                      alt={job.companies.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-primary-600" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-secondary-900">{job.companies?.name}</p>
                    {job.companies?.industry && (
                      <p className="text-sm text-secondary-600">{job.companies.industry}</p>
                    )}
                  </div>
                </div>

                {job.companies?.description && (
                  <p className="text-sm text-secondary-700 mb-4 line-clamp-3">
                    {job.companies.description}
                  </p>
                )}

                {job.companies?.company_size && (
                  <div className="text-sm text-secondary-600 mb-2">
                    Şirket Büyüklüğü: {job.companies.company_size}
                  </div>
                )}

                {job.companies?.website && (
                  <a
                    href={job.companies.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
                  >
                    Website →
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Similar Jobs */}
          {similarJobs && similarJobs.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-semibold text-secondary-900 mb-6">Benzer İlanlar</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {similarJobs.map((similarJob: any) => (
                  <Link
                    key={similarJob.id}
                    href={`/ilan/${similarJob.slug}`}
                    className="bg-white rounded-xl border border-secondary-200 p-6 hover:border-primary-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      {similarJob.companies?.logo_url ? (
                        <img
                          src={similarJob.companies.logo_url}
                          alt={similarJob.companies.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-primary-600" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-secondary-900 truncate">
                          {similarJob.title}
                        </h3>
                        <p className="text-sm text-secondary-600 truncate">
                          {similarJob.companies?.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-secondary-600">
                      <MapPin className="h-4 w-4" />
                      {similarJob.location_city}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {similarJob.categories && (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                          {similarJob.categories.name}
                        </span>
                      )}
                      {similarJob.work_type && (
                        <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded-full">
                          {workTypeLabels[similarJob.work_type] || similarJob.work_type}
                        </span>
                      )}
                      {similarJob.experience_level && (
                        <span className="px-2 py-1 text-xs font-medium bg-secondary-100 text-secondary-700 rounded-full">
                          {experienceLevelLabels[similarJob.experience_level] || similarJob.experience_level}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
