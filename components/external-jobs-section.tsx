'use client';

import { useState, useMemo } from 'react';
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { ExternalJob, ExternalJobSource, SOURCE_INFO } from '@/lib/types/external-job';
import { ExternalJobCard } from './external-job-card';

interface ExternalJobsSectionProps {
  jobs: ExternalJob[];
  initialLimit?: number;
  cityName?: string;
}

export function ExternalJobsSection({
  jobs,
  initialLimit = 6,
  cityName,
}: ExternalJobsSectionProps) {
  const [selectedSource, setSelectedSource] = useState<ExternalJobSource | 'all'>('all');
  const [showAll, setShowAll] = useState(false);

  // Get unique sources from jobs
  const availableSources = useMemo(() => {
    const sources = new Set<ExternalJobSource>();
    jobs.forEach((job) => sources.add(job.source_name));
    return Array.from(sources);
  }, [jobs]);

  // Filter jobs by selected source
  const filteredJobs = useMemo(() => {
    if (selectedSource === 'all') {
      return jobs;
    }
    return jobs.filter((job) => job.source_name === selectedSource);
  }, [jobs, selectedSource]);

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

        {/* Source count badge */}
        <div className="text-sm text-secondary-500">
          {filteredJobs.length} ilan
        </div>
      </div>

      {/* Source Filter Tabs */}
      {availableSources.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedSource('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedSource === 'all'
                ? 'bg-secondary-900 text-white'
                : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
            }`}
          >
            Tümü ({jobs.length})
          </button>
          {availableSources.map((source) => {
            const sourceInfo = SOURCE_INFO[source];
            const count = jobs.filter((j) => j.source_name === source).length;
            return (
              <button
                key={source}
                onClick={() => setSelectedSource(source)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors inline-flex items-center gap-2 ${
                  selectedSource === source
                    ? `${sourceInfo.bgColor} ${sourceInfo.textColor} ring-2 ring-offset-1`
                    : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                }`}
                style={
                  selectedSource === source
                    ? { '--tw-ring-color': sourceInfo.color } as React.CSSProperties
                    : undefined
                }
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: sourceInfo.color }}
                />
                {sourceInfo.shortName} ({count})
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
