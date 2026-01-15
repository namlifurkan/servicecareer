'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ExternalLink,
  MoreHorizontal,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  MousePointerClick,
} from 'lucide-react';
import { ExternalJob, getDomainInfo } from '@/lib/types/external-job';
import { formatRelativeTime } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

interface ExternalJobsTableProps {
  jobs: ExternalJob[];
}

export function ExternalJobsTable({ jobs: initialJobs }: ExternalJobsTableProps) {
  const [jobs, setJobs] = useState(initialJobs);
  const [selectedDomain, setSelectedDomain] = useState<string | 'all'>('all');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filteredJobs =
    selectedDomain === 'all' ? jobs : jobs.filter((j) => j.source_domain === selectedDomain);

  // Get unique domains
  const domains = Array.from(new Set(jobs.map((j) => j.source_domain)));

  const toggleActive = async (jobId: string, currentState: boolean) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('external_jobs')
      .update({ is_active: !currentState })
      .eq('id', jobId);

    if (!error) {
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, is_active: !currentState } : j))
      );
    }
    setOpenMenuId(null);
  };

  const deleteJob = async (jobId: string) => {
    if (!confirm('Bu ilanı silmek istediğinizden emin misiniz?')) return;

    const supabase = createClient();
    const { error } = await supabase.from('external_jobs').delete().eq('id', jobId);

    if (!error) {
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
    }
    setOpenMenuId(null);
  };

  return (
    <div>
      {/* Domain Filter */}
      <div className="p-4 border-b border-secondary-100 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedDomain('all')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selectedDomain === 'all'
              ? 'bg-secondary-900 text-white'
              : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
          }`}
        >
          Tümü ({jobs.length})
        </button>
        {domains.map((domain) => {
          const domainInfo = getDomainInfo(domain);
          const count = jobs.filter((j) => j.source_domain === domain).length;
          return (
            <button
              key={domain}
              onClick={() => setSelectedDomain(domain)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors inline-flex items-center gap-1.5 ${
                selectedDomain === domain
                  ? `${domainInfo.bgColor} ${domainInfo.textColor}`
                  : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: domainInfo.color }}
              />
              {domainInfo.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-secondary-100">
              <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                İlan
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Kaynak
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Lokasyon
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Tıklama
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Durum
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Eklenme
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                İşlem
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-100">
            {filteredJobs.map((job) => {
              const domainInfo = getDomainInfo(job.source_domain);
              return (
                <tr key={job.id} className="hover:bg-secondary-50">
                  <td className="px-4 py-4">
                    <div className="max-w-xs">
                      <p className="font-medium text-secondary-900 truncate">{job.title}</p>
                      <p className="text-sm text-secondary-500 truncate">{job.company_name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${domainInfo.bgColor} ${domainInfo.textColor}`}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: domainInfo.color }}
                      />
                      {domainInfo.name}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-secondary-600">
                    {job.location_city || '-'}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="inline-flex items-center gap-1 text-sm text-secondary-600">
                      <MousePointerClick className="h-3.5 w-3.5" />
                      {job.click_count}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    {job.is_active ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                        Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary-100 text-secondary-600">
                        Pasif
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-secondary-500">
                    {formatRelativeTime(job.created_at)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === job.id ? null : job.id)}
                        className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
                      >
                        <MoreHorizontal className="h-4 w-4 text-secondary-500" />
                      </button>

                      {openMenuId === job.id && (
                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-secondary-200 py-1 z-10">
                          <a
                            href={job.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Kaynakta Görüntüle
                          </a>
                          <Link
                            href={`/admin/external-jobs/${job.id}/edit`}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                          >
                            <Pencil className="h-4 w-4" />
                            Düzenle
                          </Link>
                          <button
                            onClick={() => toggleActive(job.id, job.is_active)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                          >
                            {job.is_active ? (
                              <>
                                <ToggleLeft className="h-4 w-4" />
                                Pasif Yap
                              </>
                            ) : (
                              <>
                                <ToggleRight className="h-4 w-4" />
                                Aktif Yap
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => deleteJob(job.id)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            Sil
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-secondary-500">Henüz harici ilan eklenmemiş.</p>
        </div>
      )}
    </div>
  );
}
