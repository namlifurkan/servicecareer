'use client';

import { MapPin, Building2, ExternalLink } from 'lucide-react';
import { ExternalJob, getDomainInfo } from '@/lib/types/external-job';
import { buildExternalJobUrl } from '@/lib/external-job-utils';

interface ExternalJobCardProps {
  job: ExternalJob;
  onClickTrack?: (jobId: string) => void;
}

export function ExternalJobCard({ job, onClickTrack }: ExternalJobCardProps) {
  const domainInfo = getDomainInfo(job.source_domain);
  const externalUrl = buildExternalJobUrl(job);

  const handleClick = () => {
    // Track the click
    if (onClickTrack) {
      onClickTrack(job.id);
    }

    // Also send to API for server-side tracking
    fetch('/api/external-job-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId: job.id }),
    }).catch(() => {
      // Silently fail - don't block navigation
    });
  };

  return (
    <a
      href={externalUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="group bg-white rounded-xl border border-secondary-200 hover:border-primary-200 hover:shadow-lg transition-all p-5 block"
    >
      {/* Source Badge */}
      <div className="flex items-center justify-between mb-3">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${domainInfo.bgColor} ${domainInfo.textColor}`}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: domainInfo.color }}
          />
          {domainInfo.name}
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-secondary-400">
          <ExternalLink className="h-3 w-3" />
          Dış Kaynak
        </span>
      </div>

      <div className="flex items-start gap-4">
        {/* Company Placeholder */}
        <div className="w-12 h-12 rounded-lg bg-secondary-100 flex items-center justify-center flex-shrink-0">
          <Building2 className="h-6 w-6 text-secondary-400" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors line-clamp-1">
            {job.title}
          </h3>
          <p className="text-sm text-secondary-600 truncate">{job.company_name}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm text-secondary-500">
        {job.location_city && (
          <>
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span>
              {job.location_city}
              {job.location_district && `, ${job.location_district}`}
            </span>
          </>
        )}
        {job.position_type && (
          <>
            {job.location_city && <span className="text-secondary-300">·</span>}
            <span>{job.position_type}</span>
          </>
        )}
      </div>

      {/* View on source site indicator */}
      <div className="mt-4 pt-3 border-t border-secondary-100">
        <span className="text-xs text-primary-600 font-medium group-hover:underline">
          {domainInfo.name} sitesinde görüntüle
        </span>
      </div>
    </a>
  );
}
