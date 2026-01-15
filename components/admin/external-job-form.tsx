'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Link as LinkIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import {
  ExternalJobInsert,
  extractDomain,
  getDomainInfo,
} from '@/lib/types/external-job';
import { generateCampaignName } from '@/lib/external-job-utils';

// Position types for dropdown
const EXTERNAL_JOB_POSITIONS = [
  'Garson',
  'Aşçı',
  'Aşçı Yardımcısı',
  'Barista',
  'Barmen',
  'Kasiyer',
  'Bulaşıkçı',
  'Komi',
  'Şef',
  'Mutfak Şefi',
  'Restoran Müdürü',
  'Cafe Müdürü',
  'Host/Hostes',
  'Paketçi/Kurye',
  'Temizlik Görevlisi',
];

// Venue types for dropdown
const EXTERNAL_JOB_VENUES = [
  'Restoran',
  'Cafe',
  'Bar',
  'Otel',
  'Fast Food',
  'Pastane',
  'Catering',
  'Yemek Fabrikası',
];

interface ExternalJobFormProps {
  initialData?: {
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
    utm_campaign: string | null;
    is_active: boolean;
  };
}

// Turkish cities for dropdown
const CITIES = [
  'İstanbul',
  'Ankara',
  'İzmir',
  'Antalya',
  'Bursa',
  'Adana',
  'Konya',
  'Gaziantep',
  'Mersin',
  'Kayseri',
  'Eskişehir',
  'Diyarbakır',
  'Samsun',
  'Denizli',
  'Şanlıurfa',
  'Adapazarı',
  'Malatya',
  'Trabzon',
  'Erzurum',
  'Van',
  'Batman',
  'Elazığ',
  'Manisa',
  'Balıkesir',
  'Kocaeli',
  'Muğla',
  'Aydın',
  'Tekirdağ',
  'Hatay',
  'Kahramanmaraş',
];

export function ExternalJobForm({ initialData }: ExternalJobFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    company_name: initialData?.company_name || '',
    location_city: initialData?.location_city || '',
    location_district: initialData?.location_district || '',
    description: initialData?.description || '',
    source_domain: initialData?.source_domain || '',
    source_url: initialData?.source_url || '',
    position_type: initialData?.position_type || '',
    venue_type: initialData?.venue_type || '',
    utm_campaign: initialData?.utm_campaign || '',
    is_active: initialData?.is_active ?? true,
  });

  // Auto-detect domain from URL
  const handleUrlChange = (url: string) => {
    setFormData((prev) => ({ ...prev, source_url: url }));

    const domain = extractDomain(url);
    if (domain && domain !== 'unknown') {
      setFormData((prev) => ({ ...prev, source_domain: domain }));
    }
  };

  // Auto-generate campaign name
  const handlePositionOrVenueChange = (
    field: 'position_type' | 'venue_type',
    value: string
  ) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    // Auto-generate campaign if empty
    if (!formData.utm_campaign) {
      const campaign = generateCampaignName(
        field === 'position_type' ? value : newFormData.position_type,
        field === 'venue_type' ? value : newFormData.venue_type
      );
      setFormData((prev) => ({ ...prev, [field]: value, utm_campaign: campaign }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Validation
      if (!formData.title.trim()) {
        throw new Error('İlan başlığı gerekli');
      }
      if (!formData.company_name.trim()) {
        throw new Error('Şirket adı gerekli');
      }
      if (!formData.source_url.trim()) {
        throw new Error('İlan URL gerekli');
      }

      const supabase = createClient();

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Extract domain if not set
      const domain = formData.source_domain || extractDomain(formData.source_url);

      const jobData: ExternalJobInsert = {
        title: formData.title.trim(),
        company_name: formData.company_name.trim(),
        location_city: formData.location_city || null,
        location_district: formData.location_district?.trim() || null,
        description: formData.description?.trim() || null,
        source_domain: domain,
        source_url: formData.source_url.trim(),
        position_type: formData.position_type || null,
        venue_type: formData.venue_type || null,
        utm_campaign: formData.utm_campaign?.trim() || null,
        is_active: formData.is_active,
        created_by: user?.id || null,
      };

      if (initialData?.id) {
        // Update
        const { error: updateError } = await supabase
          .from('external_jobs')
          .update(jobData)
          .eq('id', initialData.id);

        if (updateError) throw updateError;
      } else {
        // Insert
        const { error: insertError } = await supabase.from('external_jobs').insert(jobData);

        if (insertError) throw insertError;
      }

      router.push('/admin/external-jobs');
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Bir hata oluştu');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const domainInfo = formData.source_domain ? getDomainInfo(formData.source_domain) : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Source URL - First for auto-detection */}
      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-2">
          İlan URL <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" />
          <input
            type="url"
            value={formData.source_url}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="https://example.com/jobs/123"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            required
          />
        </div>
        {domainInfo && (
          <p className="mt-2 text-sm text-secondary-500">
            Kaynak:{' '}
            <span className={`font-medium ${domainInfo.textColor}`}>
              {domainInfo.name}
            </span>
          </p>
        )}
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-2">
          İlan Başlığı <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
          placeholder="Garson, Aşçı, Barista..."
          className="w-full px-4 py-2.5 bg-white border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          required
        />
      </div>

      {/* Company Name */}
      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-2">
          Şirket Adı <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.company_name}
          onChange={(e) => setFormData((prev) => ({ ...prev, company_name: e.target.value }))}
          placeholder="ABC Restaurant"
          className="w-full px-4 py-2.5 bg-white border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          required
        />
      </div>

      {/* Location */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Şehir
          </label>
          <select
            value={formData.location_city}
            onChange={(e) => setFormData((prev) => ({ ...prev, location_city: e.target.value }))}
            className="w-full px-4 py-2.5 bg-white border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Şehir seçin</option>
            {CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            İlçe
          </label>
          <input
            type="text"
            value={formData.location_district}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, location_district: e.target.value }))
            }
            placeholder="Kadıköy, Beşiktaş..."
            className="w-full px-4 py-2.5 bg-white border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Position and Venue Type */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Pozisyon Tipi
          </label>
          <select
            value={formData.position_type}
            onChange={(e) => handlePositionOrVenueChange('position_type', e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Pozisyon seçin</option>
            {EXTERNAL_JOB_POSITIONS.map((pos) => (
              <option key={pos} value={pos}>
                {pos}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Mekan Tipi
          </label>
          <select
            value={formData.venue_type}
            onChange={(e) => handlePositionOrVenueChange('venue_type', e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Mekan tipi seçin</option>
            {EXTERNAL_JOB_VENUES.map((venue) => (
              <option key={venue} value={venue}>
                {venue}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-2">
          Açıklama (Opsiyonel)
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="İlan hakkında kısa açıklama..."
          rows={3}
          className="w-full px-4 py-2.5 bg-white border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      {/* UTM Campaign */}
      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-2">
          UTM Campaign
        </label>
        <input
          type="text"
          value={formData.utm_campaign}
          onChange={(e) => setFormData((prev) => ({ ...prev, utm_campaign: e.target.value }))}
          placeholder="garson-restoran"
          className="w-full px-4 py-2.5 bg-white border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
        <p className="mt-1 text-xs text-secondary-500">
          Otomatik oluşturulur, değiştirmek isterseniz yazabilirsiniz.
        </p>
      </div>

      {/* Active Status */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="is_active"
          checked={formData.is_active}
          onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
          className="w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
        />
        <label htmlFor="is_active" className="text-sm text-secondary-700">
          İlan aktif olarak yayınlansın
        </label>
      </div>

      {/* Submit */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {initialData ? 'Güncelle' : 'Ekle'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 border border-secondary-200 text-secondary-700 rounded-lg hover:bg-secondary-50 transition-colors font-medium"
        >
          İptal
        </button>
      </div>
    </form>
  );
}
