import { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { HomeSearchForm } from '@/components/home-search-form'
import { createClient } from '@/lib/supabase/server'
import {
  MapPin,
  Clock,
  Building2,
  Briefcase,
  UserPlus,
  FileText,
  Send,
  CheckCircle,
  Upload,
  Users,
  TrendingUp,
  ChefHat,
  Coffee,
  Wine,
  Bike,
  Sparkles,
  User,
  DollarSign,
  Truck,
  Cake,
  PartyPopper,
  AlertCircle,
  Utensils,
  Star,
  Award,
  Building,
  GraduationCap,
  Zap
} from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import { JOB_POSITION_LABELS, VENUE_TYPE_LABELS, type JobPositionType, type VenueType } from '@/lib/types/service-industry'

export const metadata: Metadata = {
  title: 'Ana Sayfa - Hizmet Sektörü İş İlanları',
  description: 'Restoran, kafe, bar ve otel sektöründe kariyer fırsatları. Garson, aşçı, barista, kurye ve daha fazlası. Binlerce iş ilanı arasından size en uygun pozisyonu bulun.',
}

// Kategori icon mapping
const categoryIcons: Record<string, any> = {
  'asci-mutfak': ChefHat,
  'garsonluk-servis': User,
  'barista-kahve': Coffee,
  'bar-icecek': Wine,
  'kurye-teslimat': Bike,
  'temizlik-bulasik': Sparkles,
  'mudur-yonetici': Briefcase,
  'kasiyer': DollarSign,
  'fast-food': Truck,
  'pastane-firin': Cake,
  'catering-organizasyon': PartyPopper,
}

// Popüler pozisyonlar
const popularPositions: Array<{
  key: JobPositionType
  icon: any
  color: string
  bgColor: string
}> = [
  { key: 'waiter', icon: User, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  { key: 'line_cook', icon: ChefHat, color: 'text-orange-600', bgColor: 'bg-orange-50' },
  { key: 'barista', icon: Coffee, color: 'text-amber-700', bgColor: 'bg-amber-50' },
  { key: 'bartender', icon: Wine, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  { key: 'delivery_driver', icon: Bike, color: 'text-green-600', bgColor: 'bg-green-50' },
  { key: 'host_hostess', icon: Star, color: 'text-pink-600', bgColor: 'bg-pink-50' },
  { key: 'sous_chef', icon: Award, color: 'text-red-600', bgColor: 'bg-red-50' },
  { key: 'restaurant_manager', icon: Briefcase, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
]

export default async function HomePage() {
  const supabase = await createClient()

  // TÜM SORGULARI PARALEL ÇALIŞTIR - Performans optimizasyonu
  const [
    recentJobsResult,
    urgentJobsResult,
    totalJobsResult,
    totalCompaniesResult,
    totalCandidatesResult,
    urgentJobsCountResult,
    categoriesResult,
    citiesResult
  ] = await Promise.all([
    // Son ilanları getir
    supabase
      .from('jobs')
      .select(`
        id,
        title,
        slug,
        location_city,
        work_type,
        published_at,
        position_type,
        venue_type,
        is_urgent,
        salary_min,
        salary_max,
        show_salary,
        tip_policy,
        meal_policy,
        benefits,
        companies (
          name,
          logo_url
        )
      `)
      .eq('status', 'active')
      .not('published_at', 'is', null)
      .order('is_urgent', { ascending: false })
      .order('published_at', { ascending: false })
      .limit(12),

    // Acil ilanları getir
    supabase
      .from('jobs')
      .select(`
        id,
        title,
        slug,
        location_city,
        position_type,
        salary_min,
        salary_max,
        show_salary,
        companies (name, logo_url)
      `)
      .eq('status', 'active')
      .eq('is_urgent', true)
      .not('published_at', 'is', null)
      .order('published_at', { ascending: false })
      .limit(6),

    // Platform istatistikleri - paralel
    supabase
      .from('jobs')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active'),

    supabase
      .from('companies')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true),

    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'candidate'),

    supabase
      .from('jobs')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active')
      .eq('is_urgent', true),

    // Kategorileri getir
    supabase
      .from('categories')
      .select(`
        id,
        name,
        slug,
        icon
      `)
      .eq('is_active', true)
      .is('parent_id', null)
      .order('display_order', { ascending: true })
      .limit(8),

    // Popüler şehirleri getir - tek sorgu ile
    supabase
      .from('cities')
      .select('id, name, slug')
      .in('name', ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana'])
  ])

  // Sonuçları çıkar
  const recentJobs = recentJobsResult.data
  const urgentJobs = urgentJobsResult.data
  const totalJobs = totalJobsResult.count
  const totalCompanies = totalCompaniesResult.count
  const totalCandidates = totalCandidatesResult.count
  const urgentJobsCount = urgentJobsCountResult.count
  const categories = categoriesResult.data
  const cities = citiesResult.data

  // Kategori ve şehir job count'larını paralel getir (N+1 optimizasyonu)
  const categoryIds = (categories || []).map(c => c.id)
  const cityIds = (cities || []).map(c => c.id)

  const [categoryCountsResult, cityCountsResult] = await Promise.all([
    categoryIds.length > 0
      ? supabase
          .from('jobs')
          .select('category_id')
          .eq('status', 'active')
          .in('category_id', categoryIds)
      : Promise.resolve({ data: [] }),

    cityIds.length > 0
      ? supabase
          .from('jobs')
          .select('city_id')
          .eq('status', 'active')
          .in('city_id', cityIds)
      : Promise.resolve({ data: [] })
  ])

  // Job count'ları hesapla
  const categoryJobCounts: Record<string, number> = {}
  const cityJobCounts: Record<string, number> = {}

  if (categoryCountsResult.data) {
    categoryCountsResult.data.forEach((job: any) => {
      if (job.category_id) {
        categoryJobCounts[job.category_id] = (categoryJobCounts[job.category_id] || 0) + 1
      }
    })
  }

  if (cityCountsResult.data) {
    cityCountsResult.data.forEach((job: any) => {
      if (job.city_id) {
        cityJobCounts[job.city_id] = (cityJobCounts[job.city_id] || 0) + 1
      }
    })
  }

  // Kategorileri count ile birleştir
  const categoriesWithCount = (categories || []).map(category => ({
    ...category,
    jobCount: categoryJobCounts[category.id] || 0
  }))

  // Şehirleri count ile birleştir
  const topCities = (cities || []).map(city => ({
    ...city,
    jobCount: cityJobCounts[city.id] || 0
  }))

  return (
    <>
      <Header />

      <main className="min-h-screen bg-secondary-50">
        {/* Hero Section - Hizmet Sektörü Odaklı */}
        <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10">
              <ChefHat className="h-24 w-24 text-white" />
            </div>
            <div className="absolute top-20 right-20">
              <Coffee className="h-20 w-20 text-white" />
            </div>
            <div className="absolute bottom-20 left-1/4">
              <Wine className="h-16 w-16 text-white" />
            </div>
            <div className="absolute bottom-10 right-1/3">
              <Utensils className="h-18 w-18 text-white" />
            </div>
          </div>

          <div className="container mx-auto px-4 md:px-6 pt-16 md:pt-24 pb-20 md:pb-28 relative z-10">
            <div className="max-w-4xl mx-auto text-center mb-10 md:mb-12">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
                <Zap className="h-4 w-4 text-yellow-300" />
                <span className="text-sm font-medium text-white">
                  Türkiye&apos;nin Hizmet Sektörü Kariyer Platformu
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-5 md:mb-6 leading-tight">
                Restoran, Kafe ve Bar
                <br />
                <span className="text-primary-200">Sektöründe Kariyer</span>
              </h1>
              <p className="text-lg md:text-xl text-primary-100 max-w-2xl mx-auto">
                Garson, aşçı, barista, kurye ve daha fazlası.
                Hizmet sektöründe hayalinizdeki işi bulun.
              </p>
            </div>

            {/* Arama Formu */}
            <div className="max-w-4xl mx-auto">
              <HomeSearchForm />
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-6 md:gap-10 mt-10 md:mt-14">
              <div className="text-center">
                <p className="text-2xl md:text-3xl font-bold text-white">
                  {totalJobs || 0}+
                </p>
                <p className="text-sm text-primary-200">Aktif İlan</p>
              </div>
              <div className="text-center">
                <p className="text-2xl md:text-3xl font-bold text-white">
                  {totalCompanies || 0}+
                </p>
                <p className="text-sm text-primary-200">İşveren</p>
              </div>
              <div className="text-center">
                <p className="text-2xl md:text-3xl font-bold text-white">
                  {totalCandidates || 0}+
                </p>
                <p className="text-sm text-primary-200">Aday</p>
              </div>
              {(urgentJobsCount || 0) > 0 && (
                <div className="text-center">
                  <p className="text-2xl md:text-3xl font-bold text-yellow-300">
                    {urgentJobsCount}
                  </p>
                  <p className="text-sm text-primary-200">Acil İlan</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Acil İlanlar Banner */}
        {urgentJobs && urgentJobs.length > 0 && (
          <section className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-100">
            <div className="container mx-auto px-4 md:px-6 py-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 rounded-full">
                  <AlertCircle className="h-4 w-4 text-red-600 animate-pulse" />
                  <span className="text-sm font-semibold text-red-700">ACİL İLANLAR</span>
                </div>
                <span className="text-sm text-secondary-600">
                  Hemen başvurun, fırsatları kaçırmayın!
                </span>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                {urgentJobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/ilan/${job.slug}`}
                    className="flex-shrink-0 bg-white rounded-xl border-2 border-red-200 hover:border-red-400 p-4 min-w-[280px] max-w-[320px] transition-all hover:shadow-lg"
                  >
                    <div className="flex items-start gap-3">
                      {(job.companies as any)?.logo_url ? (
                        <img
                          src={(job.companies as any).logo_url}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-red-500" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-secondary-900 truncate">{job.title}</h3>
                        <p className="text-sm text-secondary-600 truncate">{(job.companies as any)?.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-secondary-500 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {job.location_city}
                          </span>
                          {job.show_salary && job.salary_min && (
                            <span className="text-xs font-medium text-green-600">
                              {job.salary_min.toLocaleString('tr-TR')} TL
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Popüler Pozisyonlar */}
        <section className="bg-white border-b border-secondary-200">
          <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
            <div className="text-center mb-8 md:mb-10">
              <h2 className="text-2xl md:text-3xl font-semibold text-secondary-900 mb-2">
                Popüler Pozisyonlar
              </h2>
              <p className="text-base text-secondary-600">
                En çok aranan hizmet sektörü pozisyonları
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
              {popularPositions.map((pos) => {
                const IconComponent = pos.icon
                return (
                  <Link
                    key={pos.key}
                    href={`/ilanlar?position=${pos.key}`}
                    className="group flex flex-col items-center p-4 rounded-xl hover:bg-secondary-50 transition-all"
                  >
                    <div className={`w-14 h-14 ${pos.bgColor} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <IconComponent className={`h-7 w-7 ${pos.color}`} />
                    </div>
                    <span className="text-sm font-medium text-secondary-700 text-center group-hover:text-primary-600 transition-colors">
                      {JOB_POSITION_LABELS[pos.key]}
                    </span>
                  </Link>
                )
              })}
            </div>

            <div className="text-center mt-8">
              <Link
                href="/ilanlar"
                className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
              >
                Tüm Pozisyonları Gör
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* Son İlanlar - Zenginleştirilmiş Kartlar */}
        <section className="bg-secondary-50">
          <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold text-secondary-900">
                  Son İlanlar
                </h2>
                <p className="text-sm text-secondary-600 mt-1">
                  En yeni iş fırsatları
                </p>
              </div>
              <Link
                href="/ilanlar"
                className="text-sm md:text-base font-medium text-primary-600 hover:text-primary-700 underline whitespace-nowrap"
              >
                Tümünü göster
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentJobs && recentJobs.length > 0 ? (
                recentJobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/ilan/${job.slug}`}
                    className={`group bg-white rounded-2xl border-2 ${
                      job.is_urgent
                        ? 'border-red-200 hover:border-red-300'
                        : 'border-secondary-200 hover:border-primary-200'
                    } hover:shadow-xl transition-all overflow-hidden`}
                  >
                    <div className="p-6">
                      {/* Urgent Badge */}
                      {job.is_urgent && (
                        <div className="flex items-center gap-1.5 mb-3">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">
                            <AlertCircle className="h-3 w-3" />
                            ACİL
                          </span>
                        </div>
                      )}

                      {/* Header: Logo + Title */}
                      <div className="flex items-start gap-3 mb-4">
                        {(job.companies as any)?.logo_url ? (
                          <img
                            src={(job.companies as any).logo_url}
                            alt={(job.companies as any).name}
                            className="w-14 h-14 rounded-lg object-cover border border-secondary-200 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-lg bg-secondary-100 border border-secondary-200 flex items-center justify-center flex-shrink-0">
                            <Building2 className="h-7 w-7 text-secondary-400" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <h3 className="text-lg font-semibold text-secondary-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
                            {job.title}
                          </h3>
                          <p className="text-sm text-secondary-600 truncate">
                            {(job.companies as any)?.name || 'Şirket'}
                          </p>
                        </div>
                      </div>

                      {/* Location & Time */}
                      <div className="flex items-center gap-3 text-sm text-secondary-500 mb-4">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{job.location_city}</span>
                        </div>
                        {job.published_at && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{formatRelativeTime(job.published_at)}</span>
                          </div>
                        )}
                      </div>

                      {/* Service Industry Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {job.position_type && JOB_POSITION_LABELS[job.position_type as JobPositionType] && (
                          <span className="px-2 py-1 text-xs font-medium bg-primary-50 text-primary-700 rounded">
                            {JOB_POSITION_LABELS[job.position_type as JobPositionType]}
                          </span>
                        )}
                        {job.venue_type && VENUE_TYPE_LABELS[job.venue_type as VenueType] && (
                          <span className="px-2 py-1 text-xs font-medium bg-secondary-100 text-secondary-700 rounded">
                            {VENUE_TYPE_LABELS[job.venue_type as VenueType]}
                          </span>
                        )}
                        {job.work_type && (
                          <span className="px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded">
                            {job.work_type === 'full_time' ? 'Tam Zamanlı' :
                             job.work_type === 'part_time' ? 'Yarı Zamanlı' :
                             job.work_type === 'contract' ? 'Sözleşmeli' :
                             job.work_type === 'freelance' ? 'Freelance' :
                             job.work_type === 'internship' ? 'Staj' : job.work_type}
                          </span>
                        )}
                      </div>

                      {/* Benefits Row */}
                      <div className="flex items-center gap-3 text-xs text-secondary-500 mb-3">
                        {((job.meal_policy && job.meal_policy !== 'none' && job.meal_policy !== 'not_provided') || job.benefits?.includes('Yemek')) && (
                          <span className="flex items-center gap-1">
                            <Utensils className="h-3 w-3 text-orange-500" />
                            Yemek
                          </span>
                        )}
                        {((job.tip_policy && job.tip_policy !== 'no_tips') || job.benefits?.includes('Bahşiş')) && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3 text-green-500" />
                            Bahşiş
                          </span>
                        )}
                        {job.benefits?.includes('Sağlık Sigortası') && (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-purple-500" />
                            Sigorta
                          </span>
                        )}
                      </div>

                      {/* Salary */}
                      {job.show_salary && job.salary_min && (
                        <div className="pt-3 border-t border-secondary-100">
                          <p className="text-base font-semibold text-green-700">
                            {job.salary_min.toLocaleString('tr-TR')} TL
                            {job.salary_max && job.salary_max !== job.salary_min && (
                              <span className="text-secondary-500 font-normal"> - {job.salary_max.toLocaleString('tr-TR')} TL</span>
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-secondary-200">
                  <p className="text-lg text-secondary-600">Henüz ilan bulunmamaktadır.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Popüler Kategoriler */}
        <section className="bg-white border-b border-secondary-200">
          <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
            <div className="text-center mb-8 md:mb-10">
              <h2 className="text-2xl md:text-3xl font-semibold text-secondary-900 mb-2">
                Kategorilere Göre İlanlar
              </h2>
              <p className="text-base text-secondary-600">
                Aradığınız pozisyonu kategorilere göre bulun
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categoriesWithCount && categoriesWithCount.length > 0 ? (
                categoriesWithCount.map((category) => {
                  const IconComponent = categoryIcons[category.slug] || Briefcase

                  return (
                    <Link
                      key={category.id}
                      href={`/ilanlar?category=${category.slug}`}
                      className="group bg-secondary-50 hover:bg-primary-50 rounded-xl p-5 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        {/* Icon */}
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:shadow transition-shadow">
                          <IconComponent className="h-6 w-6 text-secondary-600 group-hover:text-primary-600 transition-colors" />
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-secondary-900 group-hover:text-primary-700 transition-colors truncate">
                            {category.name}
                          </h3>
                          <p className="text-sm text-secondary-500">
                            {category.jobCount} ilan
                          </p>
                        </div>
                      </div>
                    </Link>
                  )
                })
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-secondary-600">Henüz kategori bulunmamaktadır.</p>
                </div>
              )}
            </div>

            {/* View All Link */}
            {categoriesWithCount && categoriesWithCount.length > 0 && (
              <div className="text-center mt-8">
                <Link
                  href="/ilanlar"
                  className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
                >
                  Tüm Kategorileri Gör
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Şehirlere Göre İş İlanları */}
        <section className="bg-secondary-50">
          <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold text-secondary-900 mb-1">
                  Popüler Şehirler
                </h2>
                <p className="text-sm text-secondary-600">
                  Şehrinizdeki iş fırsatlarını keşfedin
                </p>
              </div>
              <Link
                href="/ilanlar"
                className="text-sm md:text-base font-medium text-primary-600 hover:text-primary-700 underline whitespace-nowrap"
              >
                Tümünü göster
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {topCities && topCities.length > 0 ? (
                topCities.map((city) => (
                  <Link
                    key={city.id}
                    href={`/ilanlar/${city.slug}`}
                    className="group bg-white rounded-xl p-4 border border-secondary-200 hover:border-primary-300 hover:shadow-md transition-all text-center"
                  >
                    <div className="w-10 h-10 bg-secondary-100 group-hover:bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3 transition-colors">
                      <MapPin className="h-5 w-5 text-secondary-500 group-hover:text-primary-600 transition-colors" />
                    </div>
                    <h3 className="font-semibold text-secondary-900 group-hover:text-primary-700 transition-colors">
                      {city.name}
                    </h3>
                    <p className="text-sm text-secondary-500 mt-1">
                      {city.jobCount > 0 ? `${city.jobCount} ilan` : 'Yakında'}
                    </p>
                  </Link>
                ))
              ) : (
                <div className="col-span-full text-center py-8 bg-white rounded-xl border border-secondary-200">
                  <p className="text-secondary-600">Şehir bilgisi yüklenemedi.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Employer CTA Banner - Geliştirilmiş */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800">
          {/* Background decorations */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
            <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
          </div>

          <div className="container mx-auto px-4 md:px-6 py-16 md:py-24 relative z-10">
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-10 items-center">
                {/* Content */}
                <div className="text-center md:text-left">
                  <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-full mb-6">
                    İşverenler İçin
                  </span>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                    Ekibinizi
                    <br />
                    <span className="text-primary-200">Güçlendirin</span>
                  </h2>
                  <p className="text-lg text-primary-100 mb-8">
                    İlk 3 ilanınız tamamen ücretsiz! Binlerce kalifiye adaya hemen ulaşın ve hayalinizdeki ekibi kurun.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                    <Link
                      href="/isveren/kayit"
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary-700 font-bold rounded-xl hover:bg-primary-50 transition-all shadow-lg hover:shadow-xl"
                    >
                      Ücretsiz İlan Ver
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                    <Link
                      href="/isveren/giris"
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all"
                    >
                      Giriş Yap
                    </Link>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                    <p className="text-4xl font-bold text-white mb-1">{totalJobs || 0}+</p>
                    <p className="text-primary-200 text-sm">Aktif İlan</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                    <p className="text-4xl font-bold text-white mb-1">{totalCandidates || 0}+</p>
                    <p className="text-primary-200 text-sm">Kayıtlı Aday</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                    <p className="text-4xl font-bold text-white mb-1">{totalCompanies || 0}+</p>
                    <p className="text-primary-200 text-sm">İşveren</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                    <p className="text-4xl font-bold text-yellow-300 mb-1">3</p>
                    <p className="text-primary-200 text-sm">Ücretsiz İlan</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Nasıl Çalışır? - Geliştirilmiş */}
        <section className="bg-gradient-to-b from-secondary-50 to-white">
          <div className="container mx-auto px-4 md:px-6 py-16 md:py-24">
            <div className="text-center mb-14 md:mb-20">
              <span className="inline-block px-4 py-1.5 bg-purple-100 text-purple-700 text-sm font-medium rounded-full mb-4">
                Nasıl Çalışır
              </span>
              <h2 className="text-2xl md:text-4xl font-bold text-secondary-900 mb-3">
                Başlamak Çok Kolay
              </h2>
              <p className="text-base md:text-lg text-secondary-600 max-w-2xl mx-auto">
                İster iş arıyor olun ister ekibinize yeni üyeler katmak isteyin, birkaç adımda hedefinize ulaşın
              </p>
            </div>

            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
              {/* İş Arayanlar İçin */}
              <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-secondary-100">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                    <User className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-secondary-900">İş Arayanlar</h3>
                    <p className="text-sm text-secondary-500">4 adımda iş bulun</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {[
                    { icon: UserPlus, title: 'Ücretsiz Kayıt Ol', desc: 'Hesabınızı oluşturun, tüm özelliklere sınırsız erişin' },
                    { icon: FileText, title: 'Profilini Oluştur', desc: 'Deneyimlerinizi, sertifikalarınızı ve yeteneklerinizi ekleyin' },
                    { icon: Send, title: 'İlanlara Başvur', desc: 'Size uygun ilanları bulun ve tek tıkla başvurun' },
                    { icon: CheckCircle, title: 'İşe Başla', desc: 'İşverenlerle görüşün ve hayalinizdeki işe başlayın' },
                  ].map((step, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                          {index + 1}
                        </div>
                        {index < 3 && (
                          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-primary-200" />
                        )}
                      </div>
                      <div className="flex-1 pb-2">
                        <h4 className="font-semibold text-secondary-900 mb-1">{step.title}</h4>
                        <p className="text-sm text-secondary-600">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-secondary-100">
                  <Link
                    href="/kayit"
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
                  >
                    Hemen Kayıt Ol
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* İşverenler İçin */}
              <div className="bg-gradient-to-br from-secondary-900 to-secondary-800 rounded-3xl p-8 md:p-10 shadow-xl">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">İşverenler</h3>
                    <p className="text-sm text-secondary-400">3 adımda ekibinizi oluşturun</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {[
                    { icon: Upload, title: 'Ücretsiz İlan Ver', desc: 'İlk 3 ilanınız tamamen ücretsiz, hemen yayınlayın' },
                    { icon: Users, title: 'Başvuruları İncele', desc: 'Binlerce aktif adaydan gelen başvuruları değerlendirin' },
                    { icon: TrendingUp, title: 'Ekibinizi Güçlendirin', desc: 'En uygun adayları işe alın ve ekibinizi büyütün' },
                  ].map((step, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                          {index + 1}
                        </div>
                        {index < 2 && (
                          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-white/20" />
                        )}
                      </div>
                      <div className="flex-1 pb-2">
                        <h4 className="font-semibold text-white mb-1">{step.title}</h4>
                        <p className="text-sm text-secondary-400">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-white/10">
                  <Link
                    href="/isveren/kayit"
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-secondary-900 font-semibold rounded-xl transition-all hover:bg-secondary-100 shadow-lg"
                  >
                    İlan Vermeye Başla
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}

export const revalidate = 60 // 1 dakikada bir yenile

