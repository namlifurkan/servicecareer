// External Job Types for UTM Referral System

export interface ExternalJob {
  id: string;
  title: string;
  company_name: string;
  location_city: string | null;
  location_district: string | null;
  description: string | null;
  source_domain: string;
  source_url: string;
  position_type: string | null;
  venue_type: string | null;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string | null;
  click_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
  created_by: string | null;
}

export interface ExternalJobInsert {
  title: string;
  company_name: string;
  location_city?: string | null;
  location_district?: string | null;
  description?: string | null;
  source_domain: string;
  source_url: string;
  position_type?: string | null;
  venue_type?: string | null;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string | null;
  is_active?: boolean;
  expires_at?: string | null;
  created_by?: string | null;
}

export interface ExternalJobUpdate {
  title?: string;
  company_name?: string;
  location_city?: string | null;
  location_district?: string | null;
  description?: string | null;
  source_domain?: string;
  source_url?: string;
  position_type?: string | null;
  venue_type?: string | null;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string | null;
  is_active?: boolean;
  expires_at?: string | null;
}

// Extract domain from URL
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, '');
  } catch {
    return 'unknown';
  }
}

// Domain display info with branding
export interface DomainInfo {
  name: string;
  color: string;
  bgColor: string;
  textColor: string;
}

// Known domains with custom branding
const KNOWN_DOMAINS: Record<string, DomainInfo> = {
  'kariyer.net': {
    name: 'Kariyer.net',
    color: '#E31937',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
  },
  'indeed.com': {
    name: 'Indeed',
    color: '#2164F3',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
  },
  'linkedin.com': {
    name: 'LinkedIn',
    color: '#0A66C2',
    bgColor: 'bg-sky-50',
    textColor: 'text-sky-700',
  },
  'yenibiris.com': {
    name: 'Yenibiris.com',
    color: '#00A651',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
  },
  'eleman.net': {
    name: 'Eleman.net',
    color: '#FF6B00',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
  },
  'secretcv.com': {
    name: 'SecretCV',
    color: '#6B21A8',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
  },
  'softgarden.io': {
    name: 'Softgarden',
    color: '#10B981',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
  },
  'join.com': {
    name: 'JOIN',
    color: '#6366F1',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-700',
  },
};

// Default styling for unknown domains
const DEFAULT_DOMAIN_INFO: DomainInfo = {
  name: '',
  color: '#6B7280',
  bgColor: 'bg-gray-50',
  textColor: 'text-gray-700',
};

export function getDomainInfo(domain: string): DomainInfo {
  const known = KNOWN_DOMAINS[domain];
  if (known) return known;

  // Generate name from domain
  return {
    ...DEFAULT_DOMAIN_INFO,
    name: domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1),
  };
}
