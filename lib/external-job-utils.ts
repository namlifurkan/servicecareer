import { ExternalJob, extractDomain, getDomainInfo } from '@/lib/types/external-job';

/**
 * Unified job type for displaying both internal and external jobs together
 */
export interface UnifiedJob {
  id: string;
  title: string;
  slug: string;
  location_city: string;
  work_type: string;
  experience_level: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  show_salary: boolean;
  published_at: string;
  position_type: string | null;
  venue_type: string | null;
  shift_types: string[] | null;
  cuisine_types: string[] | null;
  service_experience_required: string | null;
  is_urgent: boolean;
  uniform_policy: string | null;
  meal_policy: string | null;
  tip_policy: string | null;
  benefits: string[] | null;
  companies: {
    name: string;
    logo_url: string | null;
    city: string | null;
  } | null;
  categories: {
    id: string;
    name: string;
    slug: string;
  } | null;
  // External job specific fields
  isExternal?: boolean;
  source_domain?: string;
  source_url?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string | null;
}

/**
 * Transforms an external job to unified job format
 */
export function transformExternalToUnified(externalJob: ExternalJob): UnifiedJob {
  return {
    id: externalJob.id,
    title: externalJob.title,
    slug: '', // External jobs don't have internal slugs
    location_city: externalJob.location_city || 'Türkiye',
    work_type: 'full_time', // Default
    experience_level: null,
    salary_min: null,
    salary_max: null,
    salary_currency: null,
    show_salary: false,
    published_at: externalJob.created_at,
    position_type: externalJob.position_type,
    venue_type: externalJob.venue_type,
    shift_types: null,
    cuisine_types: null,
    service_experience_required: null,
    is_urgent: false,
    uniform_policy: null,
    meal_policy: null,
    tip_policy: null,
    benefits: null,
    companies: {
      name: externalJob.company_name,
      logo_url: null,
      city: externalJob.location_city,
    },
    categories: null,
    // External specific
    isExternal: true,
    source_domain: externalJob.source_domain,
    source_url: externalJob.source_url,
    utm_source: externalJob.utm_source,
    utm_medium: externalJob.utm_medium,
    utm_campaign: externalJob.utm_campaign,
  };
}

/**
 * Transforms multiple external jobs to unified format
 */
export function transformExternalJobsToUnified(externalJobs: ExternalJob[]): UnifiedJob[] {
  return externalJobs.map(transformExternalToUnified);
}

/**
 * Merges internal jobs with external jobs, interleaving them
 * External jobs are distributed throughout the list (1 external every N internal jobs)
 */
export function mergeJobsWithExternal(
  internalJobs: UnifiedJob[],
  externalJobs: UnifiedJob[],
  externalEvery: number = 5
): UnifiedJob[] {
  if (externalJobs.length === 0) return internalJobs;
  if (internalJobs.length === 0) return externalJobs;

  const result: UnifiedJob[] = [];
  let externalIndex = 0;

  for (let i = 0; i < internalJobs.length; i++) {
    result.push(internalJobs[i]);

    // Insert an external job after every N internal jobs
    if ((i + 1) % externalEvery === 0 && externalIndex < externalJobs.length) {
      result.push(externalJobs[externalIndex]);
      externalIndex++;
    }
  }

  // Add remaining external jobs at the end
  while (externalIndex < externalJobs.length) {
    result.push(externalJobs[externalIndex]);
    externalIndex++;
  }

  return result;
}

// Re-export getDomainInfo for use in components
export { getDomainInfo } from '@/lib/types/external-job';

/**
 * Builds a URL with UTM parameters for external job tracking
 */
export function buildExternalJobUrl(job: ExternalJob): string {
  try {
    const url = new URL(job.source_url);

    // Add UTM parameters
    url.searchParams.set('utm_source', job.utm_source || 'yemeicmeisi');
    url.searchParams.set('utm_medium', job.utm_medium || 'referral');

    if (job.utm_campaign) {
      url.searchParams.set('utm_campaign', job.utm_campaign);
    }

    // Add job ID as utm_content for tracking specific jobs
    url.searchParams.set('utm_content', job.id);

    return url.toString();
  } catch {
    // If URL parsing fails, return original URL with basic params
    const separator = job.source_url.includes('?') ? '&' : '?';
    return `${job.source_url}${separator}utm_source=${job.utm_source || 'yemeicmeisi'}&utm_medium=${job.utm_medium || 'referral'}`;
  }
}

/**
 * Validates if a URL is a valid job URL
 */
export function isValidJobUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'https:' || parsedUrl.protocol === 'http:';
  } catch {
    return false;
  }
}

/**
 * Extracts domain from URL (re-exported from types for convenience)
 */
export { extractDomain } from '@/lib/types/external-job';

/**
 * Generates a campaign name from job details
 */
export function generateCampaignName(
  positionType?: string | null,
  venueType?: string | null
): string {
  const parts: string[] = [];

  if (positionType) {
    parts.push(
      positionType
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
    );
  }

  if (venueType) {
    parts.push(
      venueType
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
    );
  }

  return parts.join('-') || 'external-job';
}
