import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CompaniesTable } from '@/components/admin/companies-table'

export const metadata = {
  title: 'Şirket Yönetimi | Admin Panel',
  description: 'Şirketleri görüntüle, onayla ve yönet'
}

export default async function AdminCompaniesPage() {
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

  // Get all companies with owner details
  const { data: companies, error } = await supabase
    .from('companies')
    .select(`
      id,
      name,
      slug,
      description,
      website,
      logo_url,
      industry,
      phone,
      email,
      is_verified,
      is_active,
      created_at,
      profiles!companies_owner_id_fkey (
        id,
        full_name,
        email
      ),
      cities (
        id,
        name
      )
    `)
    .order('created_at', { ascending: false })

  // Log error if any
  if (error) {
    console.error('Admin companies query error:', error)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-secondary-900 mb-2">Şirket Yönetimi</h1>
        <p className="text-secondary-600">Tüm şirketleri görüntüle, onayla ve yönet</p>
      </div>

      <CompaniesTable companies={companies || []} />
    </div>
  )
}
