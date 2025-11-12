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
  const { data: jobs, error } = await supabase
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
      companies (
        id,
        name,
        logo_url,
        is_verified
      ),
      cities (
        id,
        name
      ),
      categories!jobs_category_id_fkey (
        id,
        name
      )
    `)
    .order('created_at', { ascending: false })

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
