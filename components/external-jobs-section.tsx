'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ExternalLink, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { ExternalJob, getDomainInfo } from '@/lib/types/external-job';
import { ExternalJobCard } from './external-job-card';

interface ExternalJobsSectionProps {
  jobs: ExternalJob[];
  initialLimit?: number;
  cityName?: string;
  showViewAll?: boolean;
  totalCount?: number;
}

export function ExternalJobsSection({
  jobs,
  initialLimit = 6,
  cityName,
  showViewAll = false,
  totalCount,
}: ExternalJobsSectionProps) {
  const [selectedDomain, setSelectedDomain] = useState<string | 'all'>('all');
  const [showAll, setShowAll] = useState(false);

  // Get unique domains from jobs
  const availableDomains = useMemo(() => {
    const domains = new Set<string>();
    jobs.forEach((job) => domains.add(job.source_domain));
    return Array.from(domains);
  }, [jobs]);

  // Filter jobs by selected domain
  const filteredJobs = useMemo(() => {
    if (selectedDomain === 'all') {
      return jobs;
    }
    return jobs.filter((job) => job.source_domain === selectedDomain);
  }, [jobs, selectedDomain]);

  // Limit displayed jobs
  const displayedJobs = showAll ? filteredJobs : filteredJobs.slice(0, initialLimit);
  const hasMore = filteredJobs.length > initialLimit;

  if (jobs.length === 0) {
    return null;
  }

  return (
    <section className="mt-12 pt-10 border-t border-secondary-200">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-secondary-900 flex items-center gap-2">
            <ExternalLink className="h-5 w-5 text-primary-600" />
            {cityName ? `${cityName} - Diğer Sitelerden İlanlar` : 'Diğer Sitelerden İlanlar'}
          </h2>
          <p className="text-sm text-secondary-500 mt-1">
            {cityName
              ? `${cityName} ilindeki partner site ilanları`
              : 'Partner sitelerden hizmet sektörü ilanları'
            }
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Source count badge */}
          <div className="text-sm text-secondary-500">
            {totalCount ? `${totalCount} ilan` : `${filteredJobs.length} ilan`}
          </div>

          {/* View All Link */}
          {showViewAll && (
            <Link
              href="/ilanlar#external-jobs"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              Tümünü Gör
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>

      {/* Domain Filter Tabs */}
      {availableDomains.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedDomain('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedDomain === 'all'
                ? 'bg-secondary-900 text-white'
                : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
            }`}
          >
            Tümü ({jobs.length})
          </button>
          {availableDomains.map((domain) => {
            const domainInfo = getDomainInfo(domain);
            const count = jobs.filter((j) => j.source_domain === domain).length;
            return (
              <button
                key={domain}
                onClick={() => setSelectedDomain(domain)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors inline-flex items-center gap-2 ${
                  selectedDomain === domain
                    ? `${domainInfo.bgColor} ${domainInfo.textColor} ring-2 ring-offset-1`
                    : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                }`}
                style={
                  selectedDomain === domain
                    ? { '--tw-ring-color': domainInfo.color } as React.CSSProperties
                    : undefined
                }
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
      )}

      {/* Jobs Grid */}
      {displayedJobs.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedJobs.map((job) => (
              <ExternalJobCard key={job.id} job={job} />
            ))}
          </div>

          {/* Show More/Less Button */}
          {hasMore && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowAll(!showAll)}
                className="inline-flex items-center gap-2 px-6 py-2.5 border border-secondary-200 text-secondary-700 rounded-lg hover:bg-secondary-50 transition-colors font-medium"
              >
                {showAll ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Daha az göster
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    {filteredJobs.length - initialLimit} ilan daha göster
                  </>
                )}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-10 bg-secondary-50 rounded-xl">
          <p className="text-secondary-600">Bu kaynakta ilan bulunamadı.</p>
        </div>
      )}

      {/* Disclaimer */}
      <p className="mt-6 text-xs text-secondary-400 text-center">
        Bu ilanlar partner sitelerden alınmıştır. Başvuru işlemleri ilgili sitede
        gerçekleştirilir.
      </p>
    </section>
  );
}
