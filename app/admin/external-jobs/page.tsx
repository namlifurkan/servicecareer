import { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { ExternalJobsTable } from '@/components/admin/external-jobs-table';

export const metadata: Metadata = {
  title: 'Dış İlanlar - Admin',
  description: 'Partner sitelerden gelen ilanları yönetin',
};

export default async function ExternalJobsPage() {
  const supabase = await createClient();

  const { data: externalJobs } = await supabase
    .from('external_jobs')
    .select('*')
    .order('created_at', { ascending: false });

  // Get stats
  const totalJobs = externalJobs?.length || 0;
  const activeJobs = externalJobs?.filter((j) => j.is_active).length || 0;
  const totalClicks = externalJobs?.reduce((sum, j) => sum + (j.click_count || 0), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-secondary-900">Dış İlanlar</h1>
          <p className="text-sm text-secondary-600 mt-1">
            Partner sitelerden gelen ilanları yönetin
          </p>
        </div>
        <Link
          href="/admin/external-jobs/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          Yeni İlan Ekle
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-secondary-200 p-4">
          <p className="text-sm text-secondary-500">Toplam İlan</p>
          <p className="text-2xl font-bold text-secondary-900">{totalJobs}</p>
        </div>
        <div className="bg-white rounded-xl border border-secondary-200 p-4">
          <p className="text-sm text-secondary-500">Aktif İlan</p>
          <p className="text-2xl font-bold text-green-600">{activeJobs}</p>
        </div>
        <div className="bg-white rounded-xl border border-secondary-200 p-4">
          <p className="text-sm text-secondary-500">Toplam Tıklama</p>
          <p className="text-2xl font-bold text-primary-600">{totalClicks}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-secondary-200">
        <ExternalJobsTable jobs={externalJobs || []} />
      </div>
    </div>
  );
}
