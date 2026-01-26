import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Settings, Bell, Shield, CreditCard } from 'lucide-react'
import { DeleteAccountButton } from '@/components/settings/delete-account-button'
import { ChangePasswordForm } from '@/components/settings/change-password-form'

export default async function EmployerSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/isveren/giris')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'company') {
    redirect('/')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-secondary-900">
          Ayarlar
        </h1>
        <p className="text-secondary-600 mt-1">
          Hesap ve bildirim ayarlarınızı yönetin
        </p>
      </div>

      {/* Settings Sections */}
      <div className="grid gap-6">
        {/* Account Settings */}
        <div className="bg-white rounded-xl border border-secondary-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Settings className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-secondary-900">Hesap Bilgileri</h2>
              <p className="text-sm text-secondary-600">Email ve şifre ayarları</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-900 mb-1">Email</label>
              <p className="text-secondary-600">{profile?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-900 mb-1">Şifre</label>
              <p className="text-sm text-secondary-500">••••••••</p>
              <div className="mt-2">
                <ChangePasswordForm />
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-xl border border-secondary-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Bell className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-secondary-900">Bildirim Ayarları</h2>
              <p className="text-sm text-secondary-600">Email bildirim tercihleriniz</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-900">Yeni başvuru bildirimi</p>
                <p className="text-xs text-secondary-500">Yeni başvuru geldiğinde email al</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
              />
            </label>
            <label className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-900">Haftalık özet</p>
                <p className="text-xs text-secondary-500">Haftalık istatistik raporu al</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
              />
            </label>
          </div>
        </div>

        {/* Subscription */}
        <div className="bg-white rounded-xl border border-secondary-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CreditCard className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-secondary-900">Abonelik</h2>
              <p className="text-sm text-secondary-600">Mevcut planınız ve faturalama</p>
            </div>
          </div>

          <div className="p-4 bg-secondary-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-secondary-900">Ücretsiz Plan</p>
                <p className="text-sm text-secondary-600">3 ücretsiz ilan hakkı</p>
              </div>
              <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors">
                Planı Yükselt
              </button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-xl border border-accent-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-accent-100 rounded-lg">
              <Shield className="h-5 w-5 text-accent-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-secondary-900">Tehlikeli Bölge</h2>
              <p className="text-sm text-secondary-600">Geri alınamaz işlemler</p>
            </div>
          </div>

          <DeleteAccountButton />
        </div>
      </div>
    </div>
  )
}
