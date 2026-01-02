import { ExternalJob } from '@/lib/types/external-job';

/**
 * Builds a URL with UTM parameters for external job tracking
 */
export function buildExternalJobUrl(job: ExternalJob): string {
  try {
    const url = new URL(job.source_url);

    // Add UTM parameters
    url.searchParams.set('utm_source', job.utm_source || 'yemeicmeisleri');
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
    return `${job.source_url}${separator}utm_source=${job.utm_source || 'yemeicmeisleri'}&utm_medium=${job.utm_medium || 'referral'}`;
  }
}

/**
 * Validates if a URL is from a known job source
 */
export function isValidJobSourceUrl(url: string): boolean {
  const validDomains = [
    'kariyer.net',
    'indeed.com',
    'indeed.com.tr',
    'linkedin.com',
    'yenibiris.com',
    'eleman.net',
    'secretcv.com',
  ];

  try {
    const parsedUrl = new URL(url);
    return validDomains.some((domain) => parsedUrl.hostname.includes(domain));
  } catch {
    return false;
  }
}

/**
 * Detects the source from a job URL
 */
export function detectSourceFromUrl(
  url: string
): 'kariyer' | 'indeed' | 'linkedin' | 'yenibiris' | 'eleman' | 'secretcv' | null {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();

    if (hostname.includes('kariyer.net')) return 'kariyer';
    if (hostname.includes('indeed.com')) return 'indeed';
    if (hostname.includes('linkedin.com')) return 'linkedin';
    if (hostname.includes('yenibiris.com')) return 'yenibiris';
    if (hostname.includes('eleman.net')) return 'eleman';
    if (hostname.includes('secretcv.com')) return 'secretcv';

    return null;
  } catch {
    return null;
  }
}

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

  if (parts.length === 0) {
    return 'hizmet-sektoru';
  }

  return parts.join('-');
}
