import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EmployerApplicationsClient } from '@/components/employer/employer-applications-client'

export default async function EmployerApplicationsPage() {
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

  // Get jobs list for this company
  const { data: jobs } = await supabase
    .from('jobs')
    .select('id, title')
    .eq('company_id', company.id)
    .order('title')

  // Get job IDs
  const jobIds = jobs?.map(job => job.id) || []

  // Get all applications for this company's jobs
  const { data: applications, error: applicationsError } = await supabase
    .from('applications')
    .select(`
      *,
      jobs!inner (
        id,
        title,
        slug,
        company_id
      )
    `)
    .in('job_id', jobIds)
    .order('created_at', { ascending: false })

  // Manually join profiles data for registered users
  const applicationsWithProfiles = await Promise.all(
    (applications || []).map(async (app) => {
      if (app.candidate_id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, full_name, email, avatar_url, phone')
          .eq('id', app.candidate_id)
          .single()
        return { ...app, profiles: profile }
      }
      return { ...app, profiles: null }
    })
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-secondary-900">
          Başvurular
        </h1>
        <p className="text-secondary-600 mt-1">
          İş ilanlarınıza gelen başvuruları inceleyin ve yönetin
        </p>
      </div>

      {/* Applications List */}
      <EmployerApplicationsClient
        applications={applicationsWithProfiles || []}
        jobs={jobs || []}
      />
    </div>
  )
}
