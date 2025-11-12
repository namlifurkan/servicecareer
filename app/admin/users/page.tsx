import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { UsersTable } from '@/components/admin/users-table'

export const metadata: Metadata = {
  title: 'Kullanıcı Yönetimi',
  description: 'Tüm kullanıcıları yönetin',
}

export default async function UsersPage() {
  const supabase = await createClient()

  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-secondary-900">
            Kullanıcı Yönetimi
          </h1>
          <p className="text-sm text-secondary-600 mt-1">
            Sistemdeki tüm kullanıcıları görüntüleyin ve yönetin
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-secondary-200">
        <UsersTable users={users || []} />
      </div>
    </div>
  )
}
