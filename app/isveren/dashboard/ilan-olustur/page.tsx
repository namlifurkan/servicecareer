import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { JobCreateFormEnhanced } from '@/components/employer/job-create-form-enhanced'

export default async function CreateJobPage() {
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
          Yeni İlan Oluştur
        </h1>
        <p className="text-secondary-600 mt-1">
          Hizmet sektörüne özel ilan oluşturun - 6 adımda tamamlayın
        </p>
      </div>

      {/* Job Create Form - Enhanced for Service Industry */}
      <JobCreateFormEnhanced
        companyId={company.id}
        categories={categories || []}
        cities={cities || []}
      />
    </div>
  )
}
