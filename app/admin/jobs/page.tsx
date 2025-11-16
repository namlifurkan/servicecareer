import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { JobsTable } from '@/components/admin/jobs-table'

export const metadata = {
  title: 'İlan Yönetimi | Admin Panel',
  description: 'İlanları görüntüle, onayla ve yönet'
}

export default async function AdminJobsPage() {
  const supabase = await createClient()

  // Check if user is admin
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/giris')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/')
  }

  // Get all jobs with company details
  const { data: jobsRaw, error } = await supabase
    .from('jobs')
    .select(`
      id,
      title,
      slug,
      description,
      status,
      work_type,
      experience_level,
      location_city,
      location_district,
      salary_min,
      salary_max,
      show_salary,
      created_at,
      published_at,
      view_count,
      application_count,
      company_id,
      city_id,
      category_id
    `)
    .order('created_at', { ascending: false })

  // Transform data to match expected structure
  const jobs = await Promise.all(
    (jobsRaw || []).map(async (job) => {
      // Get company
      const { data: company } = job.company_id
        ? await supabase
            .from('companies')
            .select('id, name, logo_url, is_verified')
            .eq('id', job.company_id)
            .single()
        : { data: null }

      // Get city
      const { data: city } = job.city_id
        ? await supabase
            .from('cities')
            .select('id, name')
            .eq('id', job.city_id)
            .single()
        : { data: null }

      // Get category
      const { data: category } = job.category_id
        ? await supabase
            .from('categories')
            .select('id, name')
            .eq('id', job.category_id)
            .single()
        : { data: null }

      return {
        ...job,
        companies: company,
        cities: city,
        categories: category,
      }
    })
  )

  // Log error if any
  if (error) {
    console.error('Admin jobs query error:', error)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-secondary-900 mb-2">İlan Yönetimi</h1>
        <p className="text-secondary-600">Tüm ilanları görüntüle, onayla ve yönet</p>
      </div>

      <JobsTable jobs={jobs || []} />
    </div>
  )
}
