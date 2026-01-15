import { ExternalJob, extractDomain } from '@/lib/types/external-job';

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
