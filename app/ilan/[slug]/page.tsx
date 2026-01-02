import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { JobDetailClient } from '@/components/job/job-detail-client'
import { JobShareButton } from '@/components/job/job-share-button'
import { FavoriteButton } from '@/components/job/favorite-button'
import { checkIsFavorited } from '@/lib/favorite-actions'
import {
  MapPin,
  Briefcase,
  Clock,
  Building2,
  Calendar,
  AlertCircle,
  Utensils,
  Shirt,
  Coins,
  Award,
  CheckCircle2,
  Users,
  Globe,
  Eye,
  ChevronRight,
  Home,
  Banknote,
  Timer,
  GraduationCap,
} from 'lucide-react'
import Link from 'next/link'
import {
  type JobPositionType,
  type ShiftType,
  type ServiceExperienceLevel,
  type VenueType,
  type CuisineType,
  type CertificateType,
  type UniformPolicy,
  type MealPolicy,
  type TipPolicy,
  type WorkingDays,
  type SalaryPaymentType,
  JOB_POSITION_LABELS,
  SHIFT_TYPE_LABELS,
  EXPERIENCE_LEVEL_LABELS,
  VENUE_TYPE_LABELS,
  CUISINE_TYPE_LABELS,
  CERTIFICATE_TYPE_LABELS,
  UNIFORM_POLICY_LABELS,
  MEAL_POLICY_LABELS,
  TIP_POLICY_LABELS,
  WORKING_DAYS_LABELS,
  SALARY_PAYMENT_TYPE_LABELS,
} from '@/lib/types/service-industry'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: job } = await supabase
    .from('jobs')
    .select('title, description, location_city, position_type')
    .eq('slug', slug)
    .single()

  if (!job) {
    return { title: 'İlan Bulunamadı' }
  }

  const positionLabel = job.position_type
    ? JOB_POSITION_LABELS[job.position_type as JobPositionType]
    : job.title

  return {
    title: `${job.title} - ${job.location_city} | Yeme İçme İşleri`,
    description: `${positionLabel} pozisyonu ${job.location_city} konumunda. ${job.description?.substring(0, 120)}...`,
    openGraph: {
      title: `${job.title} - ${job.location_city}`,
      description: job.description?.substring(0, 160),
      type: 'article',
      locale: 'tr_TR',
    },
    alternates: {
      canonical: `/ilan/${slug}`,
    },
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Bugün'
  if (diffDays === 1) return 'Dün'
  if (diffDays < 7) return `${diffDays} gün önce`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce`
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })
}

// Employment type mapping for schema.org
function getEmploymentType(workType: string | null): string {
  const mapping: Record<string, string> = {
    'full_time': 'FULL_TIME',
    'part_time': 'PART_TIME',
    'contract': 'CONTRACTOR',
    'freelance': 'CONTRACTOR',
    'internship': 'INTERN',
  }
  return mapping[workType || ''] || 'FULL_TIME'
}

// Generate JobPosting schema
function generateJobPostingSchema(job: any, slug: string) {
  const baseUrl = 'https://yemeicmeisleri.com'

  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description || '',
    datePosted: job.published_at,
    employmentType: getEmploymentType(job.work_type),
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
      name: job.companies?.name || 'Yeme İçme İşleri',
      logo: job.companies?.logo_url || `${baseUrl}/android-chrome-512x512.png`,
    },
    url: `${baseUrl}/ilan/${slug}`,
  }

  // Add salary if available
  if (job.show_salary && job.salary_min) {
    schema.baseSalary = {
      '@type': 'MonetaryAmount',
      currency: 'TRY',
      value: {
        '@type': 'QuantitativeValue',
        minValue: job.salary_min,
        maxValue: job.salary_max || job.salary_min,
        unitText: 'MONTH',
      },
    }
  }

  // Add expiration date if available
  if (job.expires_at) {
    schema.validThrough = job.expires_at
  }

  return schema
}

// Generate BreadcrumbList schema
function generateBreadcrumbSchema(job: any, slug: string) {
  const baseUrl = 'https://yemeicmeisleri.com'

  const items = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Ana Sayfa',
      item: baseUrl,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'İlanlar',
      item: `${baseUrl}/ilanlar`,
    },
  ]

  if (job.categories) {
    items.push({
      '@type': 'ListItem',
      position: 3,
      name: job.categories.name,
      item: `${baseUrl}/ilanlar?category=${job.categories.slug}`,
    })
    items.push({
      '@type': 'ListItem',
      position: 4,
      name: job.title,
      item: `${baseUrl}/ilan/${slug}`,
    })
  } else {
    items.push({
      '@type': 'ListItem',
      position: 3,
      name: job.title,
      item: `${baseUrl}/ilan/${slug}`,
    })
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  }
}

export default async function JobDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: job } = await supabase
    .from('jobs')
    .select(`
      *,
      companies (
        id, name, logo_url, description, industry, company_size, website, phone
      ),
      categories!jobs_category_id_fkey (
        id, name, slug
      )
    `)
    .eq('slug', slug)
    .eq('status', 'active')
    .single()

  if (!job) {
    notFound()
  }

  let hasApplied = false
  let isFavorited = false
  if (user) {
    const { data: application } = await supabase
      .from('applications')
      .select('id')
      .eq('job_id', job.id)
      .eq('candidate_id', user.id)
      .single()
    hasApplied = !!application
    isFavorited = await checkIsFavorited(job.id)
  }

  // Increment view count using RPC (bypasses RLS)
  await supabase.rpc('increment_view_count', { job_id_param: job.id })

  const { data: similarJobs } = await supabase
    .from('jobs')
    .select(`
      id, title, slug, location_city, position_type, salary_min, salary_max, show_salary, is_urgent,
      companies (name, logo_url)
    `)
    .eq('status', 'active')
    .or(`category_id.eq.${job.category_id},position_type.eq.${job.position_type}`)
    .neq('id', job.id)
    .limit(4)

  const getExperienceLabel = (level: string | null) => {
    if (!level) return null
    return EXPERIENCE_LEVEL_LABELS[level as ServiceExperienceLevel] || level
  }

  // Collect benefits for quick display
  const quickBenefits: Array<{ icon: any; label: string; value: string }> = []

  // Check meal_policy enum OR benefits array
  if (job.meal_policy && job.meal_policy !== 'none' && job.meal_policy !== 'not_provided') {
    quickBenefits.push({ icon: Utensils, label: 'Yemek', value: MEAL_POLICY_LABELS[job.meal_policy as MealPolicy] })
  } else if (job.benefits?.includes('Yemek')) {
    quickBenefits.push({ icon: Utensils, label: 'Yemek', value: 'Yemek Sağlanır' })
  }

  // Check tip_policy enum OR benefits array
  if (job.tip_policy && job.tip_policy !== 'no_tips') {
    quickBenefits.push({ icon: Coins, label: 'Bahşiş', value: TIP_POLICY_LABELS[job.tip_policy as TipPolicy] })
  } else if (job.benefits?.includes('Bahşiş')) {
    quickBenefits.push({ icon: Coins, label: 'Bahşiş', value: 'Bahşiş Var' })
  }

  // Check uniform_policy enum OR benefits array
  if (job.uniform_policy && job.uniform_policy !== 'none') {
    quickBenefits.push({ icon: Shirt, label: 'Üniforma', value: UNIFORM_POLICY_LABELS[job.uniform_policy as UniformPolicy] })
  }

  // Check has_insurance OR benefits array
  if (job.has_insurance) {
    quickBenefits.push({ icon: CheckCircle2, label: 'Sigorta', value: 'SGK' })
  } else if (job.benefits?.includes('Sağlık Sigortası')) {
    quickBenefits.push({ icon: CheckCircle2, label: 'Sigorta', value: 'Sağlık Sigortası' })
  }

  // Generate structured data
  const jobPostingSchema = generateJobPostingSchema(job, slug)
  const breadcrumbSchema = generateBreadcrumbSchema(job, slug)

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jobPostingSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />

      <Header />
      <main className="min-h-screen bg-secondary-50">
        {/* Breadcrumb */}
        <nav className="bg-white border-b border-secondary-100">
          <div className="container mx-auto px-4 py-3">
            <ol className="flex items-center gap-2 text-sm text-secondary-500">
              <li>
                <Link href="/" className="hover:text-secondary-900 flex items-center gap-1">
                  <Home className="h-3.5 w-3.5" />
                </Link>
              </li>
              <ChevronRight className="h-3.5 w-3.5" />
              <li>
                <Link href="/ilanlar" className="hover:text-secondary-900">İlanlar</Link>
              </li>
              {job.categories && (
                <>
                  <ChevronRight className="h-3.5 w-3.5" />
                  <li>
                    <Link href={`/ilanlar?category=${job.categories.slug}`} className="hover:text-secondary-900">
                      {job.categories.name}
                    </Link>
                  </li>
                </>
              )}
              <ChevronRight className="h-3.5 w-3.5" />
              <li className="text-secondary-900 font-medium truncate max-w-[200px]">{job.title}</li>
            </ol>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-6 lg:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4">
              {/* Job Header Card */}
              <div className="bg-white rounded-xl border border-secondary-200 overflow-hidden">
                {/* Urgent Banner */}
                {job.is_urgent && (
                  <div className="bg-red-500 text-white px-4 py-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Acil Personel Aranıyor</span>
                  </div>
                )}

                <div className="p-5 lg:p-6">
                  {/* Company + Title */}
                  <div className="flex items-start gap-4 mb-4">
                    {job.companies?.logo_url ? (
                      <Image
                        src={job.companies.logo_url}
                        alt={`${job.companies.name} logosu`}
                        width={56}
                        height={56}
                        className="w-14 h-14 rounded-lg object-cover border border-secondary-100 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-secondary-100 flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-7 w-7 text-secondary-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h1 className="text-xl lg:text-2xl font-semibold text-secondary-900 mb-1">
                        {job.title}
                      </h1>
                      <p className="text-secondary-600">{job.companies?.name}</p>
                    </div>
                  </div>

                  {/* Key Info Row */}
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-secondary-600 mb-4">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-secondary-400" />
                      {job.location_city}
                    </span>
                    {job.position_type && (
                      <span className="flex items-center gap-1.5">
                        <Briefcase className="h-4 w-4 text-secondary-400" />
                        {JOB_POSITION_LABELS[job.position_type as JobPositionType]}
                      </span>
                    )}
                    {job.venue_type && (
                      <span className="flex items-center gap-1.5">
                        <Building2 className="h-4 w-4 text-secondary-400" />
                        {VENUE_TYPE_LABELS[job.venue_type as VenueType]}
                      </span>
                    )}
                    {job.published_at && (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-secondary-400" />
                        {formatDate(job.published_at)}
                      </span>
                    )}
                  </div>

                  {/* Salary */}
                  {job.show_salary && (job.salary_min || job.salary_max) && (
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg mb-4">
                      <Banknote className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-semibold text-green-800">
                          {job.salary_min && `${job.salary_min.toLocaleString('tr-TR')} TL`}
                          {job.salary_min && job.salary_max && ' - '}
                          {job.salary_max && `${job.salary_max.toLocaleString('tr-TR')} TL`}
                          {job.salary_payment_type && (
                            <span className="font-normal text-green-600 ml-1">
                              / {SALARY_PAYMENT_TYPE_LABELS[job.salary_payment_type as SalaryPaymentType]}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Quick Benefits */}
                  {quickBenefits.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {quickBenefits.map((benefit, i) => {
                        const Icon = benefit.icon
                        return (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary-50 text-secondary-700 rounded-lg text-sm"
                          >
                            <Icon className="h-4 w-4 text-secondary-500" />
                            {benefit.label}
                          </span>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Details Grid */}
              <div className="bg-white rounded-xl border border-secondary-200 p-5 lg:p-6">
                <h2 className="font-semibold text-secondary-900 mb-4">Pozisyon Detayları</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {job.position_type && (
                    <div>
                      <p className="text-xs text-secondary-500 mb-1">Pozisyon</p>
                      <p className="text-sm font-medium text-secondary-900">
                        {JOB_POSITION_LABELS[job.position_type as JobPositionType]}
                      </p>
                    </div>
                  )}
                  {(job.service_experience_required || job.experience_level) && (
                    <div>
                      <p className="text-xs text-secondary-500 mb-1">Deneyim</p>
                      <p className="text-sm font-medium text-secondary-900">
                        {getExperienceLabel(job.service_experience_required || job.experience_level)}
                      </p>
                    </div>
                  )}
                  {job.shift_types && job.shift_types.length > 0 && (
                    <div className="col-span-2">
                      <p className="text-xs text-secondary-500 mb-2">Vardiya</p>
                      <div className="flex flex-wrap gap-1.5">
                        {job.shift_types.map((s: ShiftType) => (
                          <span
                            key={s}
                            className="inline-flex items-center px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full"
                          >
                            {SHIFT_TYPE_LABELS[s]}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {job.working_days && (
                    <div>
                      <p className="text-xs text-secondary-500 mb-1">Çalışma Günleri</p>
                      <p className="text-sm font-medium text-secondary-900">
                        {WORKING_DAYS_LABELS[job.working_days as WorkingDays]}
                      </p>
                    </div>
                  )}
                  {job.venue_type && (
                    <div>
                      <p className="text-xs text-secondary-500 mb-1">Mekan Türü</p>
                      <p className="text-sm font-medium text-secondary-900">
                        {VENUE_TYPE_LABELS[job.venue_type as VenueType]}
                      </p>
                    </div>
                  )}
                  {job.age_min && (
                    <div>
                      <p className="text-xs text-secondary-500 mb-1">Yaş Aralığı</p>
                      <p className="text-sm font-medium text-secondary-900">
                        {job.age_min}{job.age_max ? ` - ${job.age_max}` : '+'}
                      </p>
                    </div>
                  )}
                  {job.positions_available && job.positions_available > 1 && (
                    <div>
                      <p className="text-xs text-secondary-500 mb-1">Alınacak Kişi</p>
                      <p className="text-sm font-medium text-secondary-900">{job.positions_available} kişi</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Working Conditions */}
              {quickBenefits.length > 0 && (
                <div className="bg-white rounded-xl border border-secondary-200 p-5 lg:p-6">
                  <h2 className="font-semibold text-secondary-900 mb-4">Yan Haklar</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {((job.meal_policy && job.meal_policy !== 'none' && job.meal_policy !== 'not_provided') || job.benefits?.includes('Yemek')) && (
                      <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                        <Utensils className="h-5 w-5 text-orange-600" />
                        <div>
                          <p className="text-sm font-medium text-secondary-900">Yemek</p>
                          <p className="text-xs text-secondary-600">
                            {job.meal_policy && job.meal_policy !== 'none' && job.meal_policy !== 'not_provided'
                              ? MEAL_POLICY_LABELS[job.meal_policy as MealPolicy]
                              : 'Yemek Sağlanır'}
                          </p>
                        </div>
                      </div>
                    )}
                    {((job.tip_policy && job.tip_policy !== 'no_tips') || job.benefits?.includes('Bahşiş')) && (
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <Coins className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-secondary-900">Bahşiş</p>
                          <p className="text-xs text-secondary-600">
                            {job.tip_policy && job.tip_policy !== 'no_tips'
                              ? TIP_POLICY_LABELS[job.tip_policy as TipPolicy]
                              : 'Bahşiş Var'}
                          </p>
                        </div>
                      </div>
                    )}
                    {job.uniform_policy && job.uniform_policy !== 'none' && (
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <Shirt className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-secondary-900">Üniforma</p>
                          <p className="text-xs text-secondary-600">{UNIFORM_POLICY_LABELS[job.uniform_policy as UniformPolicy]}</p>
                        </div>
                      </div>
                    )}
                    {(job.has_insurance || job.benefits?.includes('Sağlık Sigortası')) && (
                      <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                        <CheckCircle2 className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="text-sm font-medium text-secondary-900">Sigorta</p>
                          <p className="text-xs text-secondary-600">SGK Güvencesi</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Cuisine Types */}
              {job.cuisine_types && job.cuisine_types.length > 0 && (
                <div className="bg-white rounded-xl border border-secondary-200 p-5 lg:p-6">
                  <h2 className="font-semibold text-secondary-900 mb-3">Mutfak Türleri</h2>
                  <div className="flex flex-wrap gap-2">
                    {job.cuisine_types.map((cuisine: CuisineType) => (
                      <span key={cuisine} className="px-3 py-1.5 text-sm bg-orange-50 text-orange-700 rounded-lg">
                        {CUISINE_TYPE_LABELS[cuisine]}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Required Certificates */}
              {job.required_certificates && job.required_certificates.length > 0 && (
                <div className="bg-white rounded-xl border border-secondary-200 p-5 lg:p-6">
                  <h2 className="font-semibold text-secondary-900 mb-3 flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-600" />
                    Gerekli Sertifikalar
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {job.required_certificates.map((cert: CertificateType) => (
                      <span key={cert} className="px-3 py-1.5 text-sm bg-yellow-50 text-yellow-700 rounded-lg">
                        {CERTIFICATE_TYPE_LABELS[cert]}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Job Description */}
              <div className="bg-white rounded-xl border border-secondary-200 p-5 lg:p-6">
                <h2 className="font-semibold text-secondary-900 mb-3">İş Tanımı</h2>
                <div className="prose prose-sm prose-secondary max-w-none">
                  <p className="text-secondary-700 whitespace-pre-wrap leading-relaxed">
                    {job.description}
                  </p>
                </div>
              </div>

              {/* Responsibilities */}
              {job.responsibilities && (
                <div className="bg-white rounded-xl border border-secondary-200 p-5 lg:p-6">
                  <h2 className="font-semibold text-secondary-900 mb-3">Görev ve Sorumluluklar</h2>
                  <p className="text-secondary-700 whitespace-pre-wrap leading-relaxed text-sm">
                    {job.responsibilities}
                  </p>
                </div>
              )}

              {/* Requirements */}
              {(job.qualifications || job.requirements) && (
                <div className="bg-white rounded-xl border border-secondary-200 p-5 lg:p-6">
                  <h2 className="font-semibold text-secondary-900 mb-3">Aranan Nitelikler</h2>
                  <p className="text-secondary-700 whitespace-pre-wrap leading-relaxed text-sm">
                    {job.requirements || job.qualifications}
                  </p>
                </div>
              )}

              {/* Benefits List */}
              {job.benefits && job.benefits.length > 0 && (
                <div className="bg-white rounded-xl border border-secondary-200 p-5 lg:p-6">
                  <h2 className="font-semibold text-secondary-900 mb-3">Sunulan İmkanlar</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {job.benefits.map((benefit: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-secondary-700">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Apply Card */}
              <JobDetailClient
                jobId={job.id}
                companyPhone={job.companies?.phone || null}
                hasApplied={hasApplied}
                isLoggedIn={!!user}
              />

              {/* Stats Card */}
              <div className="bg-white rounded-xl border border-secondary-200 p-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-secondary-600 flex items-center gap-1.5">
                    <Eye className="h-4 w-4" />
                    Görüntülenme
                  </span>
                  <span className="font-medium text-secondary-900">
                    {(job.view_count || 0).toLocaleString('tr-TR')}
                  </span>
                </div>
              </div>

              {/* Company Card */}
              <div className="bg-white rounded-xl border border-secondary-200 p-5">
                <h3 className="font-semibold text-secondary-900 mb-4">Şirket Bilgileri</h3>
                <div className="flex items-center gap-3 mb-4">
                  {job.companies?.logo_url ? (
                    <Image
                      src={job.companies.logo_url}
                      alt={`${job.companies.name} logosu`}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-lg object-cover border border-secondary-100"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-secondary-100 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-secondary-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-secondary-900">{job.companies?.name}</p>
                    {job.companies?.industry && (
                      <p className="text-sm text-secondary-600">{job.companies.industry}</p>
                    )}
                  </div>
                </div>

                {job.companies?.description && (
                  <p className="text-sm text-secondary-600 mb-4 line-clamp-3">
                    {job.companies.description}
                  </p>
                )}

                <div className="space-y-2">
                  {job.companies?.company_size && (
                    <div className="flex items-center gap-2 text-sm text-secondary-600">
                      <Users className="h-4 w-4 text-secondary-400" />
                      {(() => {
                        const sizeLabels: Record<string, string> = {
                          'startup': '1-10 Çalışan',
                          'small': '11-50 Çalışan',
                          'medium': '51-200 Çalışan',
                          'large': '201-1000 Çalışan',
                          'enterprise': '1000+ Çalışan'
                        }
                        return sizeLabels[job.companies.company_size] || job.companies.company_size
                      })()}
                    </div>
                  )}
                  {job.companies?.website && (
                    <a
                      href={job.companies.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
                    >
                      <Globe className="h-4 w-4" />
                      Web Sitesi
                    </a>
                  )}
                </div>
              </div>

              {/* Favorite */}
              <FavoriteButton
                jobId={job.id}
                initialFavorited={isFavorited}
                isLoggedIn={!!user}
              />

              {/* Share */}
              <JobShareButton jobTitle={job.title} jobSlug={job.slug} />
            </div>
          </div>

          {/* Similar Jobs */}
          {similarJobs && similarJobs.length > 0 && (
            <div className="mt-10">
              <h2 className="text-xl font-semibold text-secondary-900 mb-4">Benzer İlanlar</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {similarJobs.map((sJob: any) => (
                  <Link
                    key={sJob.id}
                    href={`/ilan/${sJob.slug}`}
                    className="bg-white rounded-xl border border-secondary-200 p-4 hover:border-primary-200 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      {sJob.companies?.logo_url ? (
                        <Image
                          src={sJob.companies.logo_url}
                          alt={`${sJob.companies.name} logosu`}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-lg object-cover border border-secondary-100"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-secondary-100 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-secondary-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-secondary-900 truncate text-sm">
                          {sJob.title}
                        </h3>
                        <p className="text-xs text-secondary-600 truncate">
                          {sJob.companies?.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-secondary-500 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {sJob.location_city}
                      </span>
                      {sJob.show_salary && sJob.salary_min && (
                        <span className="text-xs font-medium text-green-600">
                          {sJob.salary_min.toLocaleString('tr-TR')} TL
                        </span>
                      )}
                    </div>

                    {sJob.is_urgent && (
                      <div className="mt-2">
                        <span className="text-xs text-red-600 font-medium">Acil</span>
                      </div>
                    )}
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
