import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CompanyProfileForm } from '@/components/employer/company-profile-form'

export default async function CompanyProfilePage() {
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
          Şirket Profili
        </h1>
        <p className="text-secondary-600 mt-1">
          Şirket bilgilerinizi güncelleyin
        </p>
      </div>

      {/* Profile Form */}
      <CompanyProfileForm company={company} cities={cities || []} />
    </div>
  )
}
