import { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { HomeSearchForm } from '@/components/home-search-form'
import { createClient } from '@/lib/supabase/server'
import { MapPin, Clock, Building2, Briefcase, UserPlus, FileText, Send, CheckCircle, Upload, Users, TrendingUp, ChefHat, Coffee, Wine, Bike, Sparkles, User, DollarSign, Truck, Cake, PartyPopper } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Ana Sayfa',
  description: 'Hizmet sektöründe kariyer fırsatları. Binlerce iş ilanı arasından size en uygun pozisyonu bulun.',
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

export default async function HomePage() {
  const supabase = await createClient()

  // Son ilanları getir
  const { data: recentJobs } = await supabase
    .from('jobs')
    .select(`
      id,
      title,
      slug,
      location_city,
      work_type,
      published_at,
      companies (
        name,
        logo_url
      )
    `)
    .eq('status', 'active')
    .not('published_at', 'is', null)
    .order('published_at', { ascending: false })
    .limit(12)

  // Kategorileri ve ilan sayılarını getir
  const { data: categories } = await supabase
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
    .limit(8)

  // Her kategori için ilan sayısını al
  const categoriesWithCount = await Promise.all(
    (categories || []).map(async (category) => {
      const { count } = await supabase
        .from('jobs')
        .select('id', { count: 'exact', head: true })
        .eq('category_id', category.id)
        .eq('status', 'active')

      return { ...category, jobCount: count || 0 }
    })
  )

  // Popüler şehirleri ve ilan sayılarını getir
  const popularCityNames = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana']

  const citiesWithJobs = await Promise.all(
    popularCityNames.map(async (cityName) => {
      const { data: city } = await supabase
        .from('cities')
        .select('id, name, slug')
        .eq('name', cityName)
        .single()

      if (!city) return null

      const { count } = await supabase
        .from('jobs')
        .select('id', { count: 'exact', head: true })
        .eq('city_id', city.id)
        .eq('status', 'active')

      return { ...city, jobCount: count || 0 }
    })
  )

  const topCities = citiesWithJobs.filter((city) => city !== null)

  return (
    <>
      <Header />

      <main className="min-h-screen bg-secondary-50">
        {/* Hero Section - Sade */}
        <section className="bg-gradient-to-b from-white to-secondary-50 border-b border-secondary-200">
          <div className="container mx-auto px-4 md:px-6 pt-16 md:pt-20 pb-16 md:pb-20">
            <div className="max-w-3xl mx-auto text-center mb-10 md:mb-12">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-secondary-900 mb-4 md:mb-5 leading-tight">
                Hizmet sektöründe hayalinizdeki işi bulun
              </h1>
              <p className="text-base md:text-lg text-secondary-600">
                Kafe, restoran ve pub sektöründe binlerce iş fırsatı
              </p>
            </div>

            {/* Arama Formu */}
            <div className="max-w-4xl mx-auto">
              <HomeSearchForm />
            </div>
          </div>
        </section>

        {/* Son İlanlar - Airbnb Card Style */}
        <section className="bg-secondary-50">
          <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <h2 className="text-2xl md:text-3xl font-semibold text-secondary-900">
                Son İlanlar
              </h2>
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
                    className="group bg-white rounded-2xl border border-secondary-200 hover:shadow-xl transition-all overflow-hidden"
                  >
                    <div className="p-6">
                      {/* Company Logo */}
                      <div className="mb-4">
                        {(job.companies as any)?.logo_url ? (
                          <img
                            src={(job.companies as any).logo_url}
                            alt={(job.companies as any).name}
                            className="w-16 h-16 rounded-lg object-cover border border-secondary-200"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-secondary-100 border border-secondary-200 flex items-center justify-center">
                            <Building2 className="h-8 w-8 text-secondary-400" />
                          </div>
                        )}
                      </div>

                      <h3 className="text-lg font-semibold text-secondary-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                        {job.title}
                      </h3>

                      <p className="text-base text-secondary-600 mb-4">
                        {(job.companies as any)?.name || 'Şirket'}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-secondary-500 mb-4">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4" />
                          <span>{job.location_city}</span>
                        </div>
                        {job.published_at && (
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4" />
                            <span>{formatRelativeTime(job.published_at)}</span>
                          </div>
                        )}
                      </div>

                      {job.work_type && (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700 border border-primary-200">
                          {job.work_type === 'full_time' ? 'Tam Zamanlı' :
                           job.work_type === 'part_time' ? 'Yarı Zamanlı' :
                           job.work_type === 'contract' ? 'Sözleşmeli' :
                           job.work_type === 'freelance' ? 'Freelance' :
                           job.work_type === 'internship' ? 'Staj' : job.work_type}
                        </span>
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
                Popüler Kategoriler
              </h2>
              <p className="text-base text-secondary-600">
                En çok ilan verilen pozisyonlara göz atın
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {categoriesWithCount && categoriesWithCount.length > 0 ? (
                categoriesWithCount.map((category) => {
                  const IconComponent = categoryIcons[category.slug] || Briefcase

                  return (
                    <Link
                      key={category.id}
                      href={`/ilanlar?category=${category.slug}`}
                      className="group bg-white rounded-xl border border-secondary-200 hover:border-primary-600 hover:shadow-lg transition-all p-6 text-center"
                    >
                      {/* Icon */}
                      <div className="w-14 h-14 mx-auto mb-4 bg-primary-50 rounded-lg flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                        <IconComponent className="h-7 w-7 text-primary-600" />
                      </div>

                      {/* Category Name */}
                      <h3 className="text-base md:text-lg font-semibold text-secondary-900 mb-2 group-hover:text-primary-600 transition-colors">
                        {category.name}
                      </h3>

                      {/* Job Count */}
                      <p className="text-sm text-secondary-500">
                        {category.jobCount} ilan
                      </p>
                    </Link>
                  )
                })
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-secondary-600">Henüz kategori bulunmamaktadır.</p>
                </div>
              )}
            </div>

            {/* View All Categories Link */}
            {categoriesWithCount && categoriesWithCount.length > 0 && (
              <div className="text-center mt-8">
                <Link
                  href="/ilanlar"
                  className="inline-flex items-center text-sm md:text-base font-medium text-primary-600 hover:text-primary-700 underline"
                >
                  Tüm Kategorileri Gör
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Şehirlere Göre İş İlanları */}
        <section className="bg-secondary-50">
          <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
            <div className="text-center mb-8 md:mb-10">
              <h2 className="text-2xl md:text-3xl font-semibold text-secondary-900 mb-2">
                Şehirlere Göre İş Ara
              </h2>
              <p className="text-base text-secondary-600">
                Türkiye&apos;nin en popüler şehirlerinde binlerce iş fırsatı
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {topCities && topCities.length > 0 ? (
                topCities.map((city) => (
                  <Link
                    key={city.id}
                    href={`/ilanlar/${city.slug}`}
                    className="group bg-white rounded-xl border-2 border-secondary-200 hover:border-primary-600 hover:shadow-xl transition-all p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* City Icon */}
                        <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                          <MapPin className="h-6 w-6 text-primary-600" />
                        </div>

                        {/* City Info */}
                        <div>
                          <h3 className="text-lg font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors">
                            {city.name}
                          </h3>
                          <p className="text-sm text-secondary-600">
                            {city.jobCount > 0 ? (
                              <>
                                <span className="font-semibold text-primary-600">{city.jobCount}</span> aktif ilan
                              </>
                            ) : (
                              'Henüz ilan yok'
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Arrow Icon */}
                      <div className="text-secondary-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-full text-center py-8 bg-white rounded-xl border border-secondary-200">
                  <p className="text-secondary-600">Şehir bilgisi yüklenemedi.</p>
                </div>
              )}
            </div>

            {/* View All Cities Link */}
            {topCities && topCities.length > 0 && (
              <div className="text-center mt-8">
                <Link
                  href="/ilanlar"
                  className="inline-flex items-center text-sm md:text-base font-medium text-primary-600 hover:text-primary-700 underline"
                >
                  Tüm Şehirleri Gör
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Employer CTA Banner */}
        <section className="bg-primary-50 border-y border-primary-200">
          <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-4xl font-semibold text-secondary-900 mb-4">
                Şirketiniz için Ücretsiz İlan Verin
              </h2>
              <p className="text-base md:text-lg text-secondary-600 mb-8">
                İlk 3 ilanınız tamamen ücretsiz! Binlerce kalifiye adaya hemen ulaşın.
              </p>
              <Link
                href="/isveren/kayit"
                className="inline-flex items-center px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors text-lg"
              >
                Ücretsiz İlan Ver
              </Link>
            </div>
          </div>
        </section>

        {/* Nasıl Çalışır? */}
        <section className="bg-white border-y border-secondary-200">
          <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-2xl md:text-3xl font-semibold text-secondary-900 mb-2">
                Nasıl Çalışır?
              </h2>
              <p className="text-base text-secondary-600">
                Hayalinizdeki işe ulaşmak sadece birkaç adım uzağınızda
              </p>
            </div>

            {/* İş Arayanlar İçin */}
            <div className="mb-16">
              <div className="text-center mb-8">
                <h3 className="text-xl md:text-2xl font-semibold text-secondary-900 mb-2">
                  İş Arayanlar İçin
                </h3>
                <p className="text-sm text-secondary-600">
                  4 basit adımda iş bulun
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                {/* Step 1 */}
                <div className="text-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 bg-primary-50 rounded-full flex items-center justify-center relative">
                    <UserPlus className="h-8 w-8 md:h-10 md:w-10 text-primary-600" />
                    <span className="absolute -top-2 -right-2 w-8 h-8 bg-primary-600 text-white text-sm font-bold rounded-full flex items-center justify-center">
                      1
                    </span>
                  </div>
                  <h4 className="text-lg font-semibold text-secondary-900 mb-2">
                    Ücretsiz Kayıt Ol
                  </h4>
                  <p className="text-sm text-secondary-600">
                    Hesabınızı oluşturun, tüm özelliklere sınırsız erişin
                  </p>
                </div>

                {/* Step 2 */}
                <div className="text-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 bg-primary-50 rounded-full flex items-center justify-center relative">
                    <FileText className="h-8 w-8 md:h-10 md:w-10 text-primary-600" />
                    <span className="absolute -top-2 -right-2 w-8 h-8 bg-primary-600 text-white text-sm font-bold rounded-full flex items-center justify-center">
                      2
                    </span>
                  </div>
                  <h4 className="text-lg font-semibold text-secondary-900 mb-2">
                    Profilini Oluştur
                  </h4>
                  <p className="text-sm text-secondary-600">
                    CV&apos;nizi yükleyin, deneyimlerinizi ve yeteneklerinizi ekleyin
                  </p>
                </div>

                {/* Step 3 */}
                <div className="text-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 bg-primary-50 rounded-full flex items-center justify-center relative">
                    <Send className="h-8 w-8 md:h-10 md:w-10 text-primary-600" />
                    <span className="absolute -top-2 -right-2 w-8 h-8 bg-primary-600 text-white text-sm font-bold rounded-full flex items-center justify-center">
                      3
                    </span>
                  </div>
                  <h4 className="text-lg font-semibold text-secondary-900 mb-2">
                    İlanlara Başvur
                  </h4>
                  <p className="text-sm text-secondary-600">
                    Size uygun ilanları bulun ve tek tıkla başvurun
                  </p>
                </div>

                {/* Step 4 */}
                <div className="text-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 bg-primary-50 rounded-full flex items-center justify-center relative">
                    <CheckCircle className="h-8 w-8 md:h-10 md:w-10 text-primary-600" />
                    <span className="absolute -top-2 -right-2 w-8 h-8 bg-primary-600 text-white text-sm font-bold rounded-full flex items-center justify-center">
                      4
                    </span>
                  </div>
                  <h4 className="text-lg font-semibold text-secondary-900 mb-2">
                    İşe Başla
                  </h4>
                  <p className="text-sm text-secondary-600">
                    İşverenlerle görüşün ve hayalinizdeki işe başlayın
                  </p>
                </div>
              </div>

              <div className="text-center mt-8">
                <Link
                  href="/kayit"
                  className="inline-flex items-center px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Hemen Başla
                </Link>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-secondary-200 my-12 md:my-16"></div>

            {/* İşverenler İçin */}
            <div>
              <div className="text-center mb-8">
                <h3 className="text-xl md:text-2xl font-semibold text-secondary-900 mb-2">
                  İşverenler İçin
                </h3>
                <p className="text-sm text-secondary-600">
                  3 adımda yetenekli çalışanları bulun
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
                {/* Step 1 */}
                <div className="text-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 bg-accent-50 rounded-full flex items-center justify-center relative">
                    <Upload className="h-8 w-8 md:h-10 md:w-10 text-accent-600" />
                    <span className="absolute -top-2 -right-2 w-8 h-8 bg-accent-600 text-white text-sm font-bold rounded-full flex items-center justify-center">
                      1
                    </span>
                  </div>
                  <h4 className="text-lg font-semibold text-secondary-900 mb-2">
                    Ücretsiz İlan Ver
                  </h4>
                  <p className="text-sm text-secondary-600">
                    İlk 3 ilanınız tamamen ücretsiz, hesap oluşturun ve hemen yayınlayın
                  </p>
                </div>

                {/* Step 2 */}
                <div className="text-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 bg-accent-50 rounded-full flex items-center justify-center relative">
                    <Users className="h-8 w-8 md:h-10 md:w-10 text-accent-600" />
                    <span className="absolute -top-2 -right-2 w-8 h-8 bg-accent-600 text-white text-sm font-bold rounded-full flex items-center justify-center">
                      2
                    </span>
                  </div>
                  <h4 className="text-lg font-semibold text-secondary-900 mb-2">
                    Başvuruları İncele
                  </h4>
                  <p className="text-sm text-secondary-600">
                    Binlerce aktif adaydan gelen başvuruları değerlendirin
                  </p>
                </div>

                {/* Step 3 */}
                <div className="text-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 bg-accent-50 rounded-full flex items-center justify-center relative">
                    <TrendingUp className="h-8 w-8 md:h-10 md:w-10 text-accent-600" />
                    <span className="absolute -top-2 -right-2 w-8 h-8 bg-accent-600 text-white text-sm font-bold rounded-full flex items-center justify-center">
                      3
                    </span>
                  </div>
                  <h4 className="text-lg font-semibold text-secondary-900 mb-2">
                    Ekibinizi Güçlendirin
                  </h4>
                  <p className="text-sm text-secondary-600">
                    En uygun adayları işe alın ve ekibinizi büyütün
                  </p>
                </div>
              </div>

              <div className="text-center mt-8">
                <Link
                  href="/isveren/kayit"
                  className="inline-flex items-center px-8 py-3 bg-accent-600 hover:bg-accent-700 text-white font-semibold rounded-lg transition-colors"
                >
                  İlan Vermeye Başla
                </Link>
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

