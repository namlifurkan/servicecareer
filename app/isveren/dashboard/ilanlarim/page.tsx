import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { EmployerJobsClient } from '@/components/employer/employer-jobs-client'
import { Plus } from 'lucide-react'

export default async function EmployerJobsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/isveren/giris')
  }

  // Get company
  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  if (!company) {
    redirect('/isveren/giris')
  }

  // Get all jobs for this company
  const { data: jobs, error: jobsError } = await supabase
    .from('jobs')
    .select(`
      *,
      cities!jobs_city_id_fkey (
        id,
        name
      ),
      categories!jobs_category_id_fkey (
        id,
        name
      ),
      applications (
        id
      )
    `)
    .eq('company_id', company.id)
    .order('created_at', { ascending: false })

  // Handle database errors
  if (jobsError) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-secondary-900">
              İlanlarım
            </h1>
            <p className="text-secondary-600 mt-1">
              Tüm iş ilanlarınızı görüntüleyin ve yönetin
            </p>
          </div>

          <Link
            href="/isveren/dashboard/ilan-olustur"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            Yeni İlan
          </Link>
        </div>

        {/* Error Message */}
        <div className="bg-accent-50 border border-accent-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-accent-900 mb-2">
            Veriler yüklenirken bir hata oluştu
          </h3>
          <p className="text-accent-700 mb-4">
            {jobsError.message}
          </p>
          {jobsError.hint && (
            <p className="text-sm text-accent-600 bg-white rounded-lg p-3 mb-4">
              <strong>İpucu:</strong> {jobsError.hint}
            </p>
          )}
          {process.env.NODE_ENV === 'development' && (
            <details className="text-sm text-accent-600">
              <summary className="cursor-pointer font-medium mb-2">
                Teknik Detaylar (Sadece Development)
              </summary>
              <pre className="bg-white rounded-lg p-3 overflow-x-auto">
                {JSON.stringify(jobsError, null, 2)}
              </pre>
            </details>
          )}
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white font-medium rounded-lg transition-colors"
          >
            Sayfayı Yenile
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-secondary-900">
            İlanlarım
          </h1>
          <p className="text-secondary-600 mt-1">
            Tüm iş ilanlarınızı görüntüleyin ve yönetin
          </p>
        </div>

        <Link
          href="/isveren/dashboard/ilan-olustur"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          Yeni İlan
        </Link>
      </div>

      {/* Jobs List */}
      <EmployerJobsClient jobs={jobs || []} companyId={company.id} />
    </div>
  )
}
