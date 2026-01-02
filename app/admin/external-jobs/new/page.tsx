import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ExternalJobForm } from '@/components/admin/external-job-form';

export const metadata: Metadata = {
  title: 'Yeni Dış İlan Ekle - Admin',
  description: 'Partner sitelerden yeni ilan ekleyin',
};

export default function NewExternalJobPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/external-jobs"
          className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-secondary-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-secondary-900">Yeni Dış İlan Ekle</h1>
          <p className="text-sm text-secondary-600 mt-1">
            Partner sitelerden ilan bilgilerini girin
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-secondary-200 p-6">
        <ExternalJobForm />
      </div>
    </div>
  );
}
