// External Job Types for UTM Referral System

export type ExternalJobSource =
  | 'kariyer'
  | 'indeed'
  | 'linkedin'
  | 'yenibiris'
  | 'eleman'
  | 'secretcv';

export interface ExternalJob {
  id: string;
  title: string;
  company_name: string;
  location_city: string | null;
  location_district: string | null;
  description: string | null;
  source_name: ExternalJobSource;
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
  source_name: ExternalJobSource;
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
  source_name?: ExternalJobSource;
  source_url?: string;
  position_type?: string | null;
  venue_type?: string | null;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string | null;
  is_active?: boolean;
  expires_at?: string | null;
}

// Source site information with branding
export interface SourceInfo {
  name: string;
  shortName: string;
  color: string;
  bgColor: string;
  textColor: string;
}

export const SOURCE_INFO: Record<ExternalJobSource, SourceInfo> = {
  kariyer: {
    name: 'Kariyer.net',
    shortName: 'Kariyer',
    color: '#E31937',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
  },
  indeed: {
    name: 'Indeed',
    shortName: 'Indeed',
    color: '#2164F3',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
  },
  linkedin: {
    name: 'LinkedIn',
    shortName: 'LinkedIn',
    color: '#0A66C2',
    bgColor: 'bg-sky-50',
    textColor: 'text-sky-700',
  },
  yenibiris: {
    name: 'Yenibiris.com',
    shortName: 'Yenibiris',
    color: '#FF6B00',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
  },
  eleman: {
    name: 'Eleman.net',
    shortName: 'Eleman',
    color: '#00A651',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
  },
  secretcv: {
    name: 'SecretCV',
    shortName: 'SecretCV',
    color: '#6B21A8',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
  },
};

// Position types commonly found in service industry (Turkish)
export const EXTERNAL_JOB_POSITIONS = [
  'Garson',
  'Aşçı',
  'Aşçı Yardımcısı',
  'Barista',
  'Barmen',
  'Hostes',
  'Kasiyer',
  'Kurye',
  'Mutfak Şefi',
  'Restoran Müdürü',
  'Bulaşıkçı',
  'Temizlik Görevlisi',
  'Vale',
  'Komi',
  'Pastacı',
] as const;

// Venue types (Turkish)
export const EXTERNAL_JOB_VENUES = [
  'Restoran',
  'Cafe',
  'Bar',
  'Otel',
  'Fast Food',
  'Pastane',
  'Fırın',
  'Catering',
  'Pub',
  'Gece Kulübü',
] as const;
