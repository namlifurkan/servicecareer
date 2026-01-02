import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getFavorites } from '@/lib/favorite-actions'
import { FavoriteButton } from '@/components/job/favorite-button'
import { Heart, MapPin, Building2, Clock, Briefcase } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'

export const metadata = {
  title: 'Favorilerim | Yeme İçme İşleri',
  description: 'Kaydettiğiniz iş ilanları'
}

export default async function FavoritesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/giris')
  }

  const { favorites, error } = await getFavorites()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-secondary-900 mb-2">Favorilerim</h1>
        <p className="text-secondary-600">Kaydettiğiniz iş ilanları</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {favorites.length === 0 ? (
        <div className="bg-white rounded-xl border border-secondary-200 p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary-100 rounded-full mb-4">
            <Heart className="h-8 w-8 text-secondary-400" />
          </div>
          <h2 className="text-lg font-semibold text-secondary-900 mb-2">
            Henüz kayıtlı ilanınız yok
          </h2>
          <p className="text-secondary-600 mb-6 max-w-md mx-auto">
            Beğendiğiniz ilanları kaydedin, daha sonra kolayca erişin.
          </p>
          <Link
            href="/ilanlar"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
          >
            <Briefcase className="h-4 w-4" />
            İlanlara Göz At
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {favorites.map((favorite: any) => {
            const job = favorite.jobs
            if (!job) return null

            return (
              <div
                key={favorite.id}
                className="group bg-white rounded-xl border border-secondary-200 hover:shadow-lg transition-all overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Company Logo */}
                    <div className="flex-shrink-0">
                      {job.companies?.logo_url ? (
                        <img
                          src={job.companies.logo_url}
                          alt={job.companies.name}
                          className="w-16 h-16 rounded-lg object-cover border border-secondary-200"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-secondary-100 border border-secondary-200 flex items-center justify-center">
                          <Building2 className="h-8 w-8 text-secondary-400" />
                        </div>
                      )}
                    </div>

                    {/* Job Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <Link
                            href={`/ilan/${job.slug}`}
                            className="text-lg font-semibold text-secondary-900 hover:text-primary-600 transition-colors"
                          >
                            {job.title}
                          </Link>
                          <p className="text-secondary-600 font-medium mt-1">
                            {job.companies?.name || 'Şirket'}
                          </p>
                        </div>

                        {/* Favorite Button */}
                        <FavoriteButton
                          jobId={job.id}
                          initialFavorited={true}
                          isLoggedIn={true}
                          variant="icon-only"
                          className="flex-shrink-0"
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-secondary-600">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4 text-secondary-400" />
                          <span>{job.location_city}</span>
                        </div>

                        {job.show_salary && job.salary_min && (
                          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                            {job.salary_min.toLocaleString('tr-TR')}
                            {job.salary_max && ` - ${job.salary_max.toLocaleString('tr-TR')}`} TL
                          </span>
                        )}

                        {job.published_at && (
                          <div className="flex items-center gap-1.5 text-secondary-500">
                            <Clock className="h-4 w-4" />
                            <span>{formatRelativeTime(job.published_at)}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3 mt-4">
                        <Link
                          href={`/ilan/${job.slug}`}
                          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          İlanı Görüntüle
                        </Link>
                        <span className="text-xs text-secondary-500">
                          {new Date(favorite.created_at).toLocaleDateString('tr-TR', {
                            day: 'numeric',
                            month: 'long'
                          })} tarihinde kaydedildi
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
