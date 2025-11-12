import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { JobEditForm } from '@/components/employer/job-edit-form'

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

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

  // Get job
  const { data: job } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .eq('company_id', company.id)
    .single()

  if (!job) {
    notFound()
  }

  // Get categories for dropdown
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .order('name')

  // Get cities for dropdown
  const { data: cities } = await supabase
    .from('cities')
    .select('id, name')
    .order('name')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-secondary-900">
          İlan Düzenle
        </h1>
        <p className="text-secondary-600 mt-1">
          {job.title}
        </p>
      </div>

      {/* Job Edit Form */}
      <JobEditForm
        job={job}
        companyId={company.id}
        categories={categories || []}
        cities={cities || []}
      />
    </div>
  )
}
