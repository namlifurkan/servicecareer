'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Link as LinkIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import {
  ExternalJobSource,
  ExternalJobInsert,
  SOURCE_INFO,
  EXTERNAL_JOB_POSITIONS,
  EXTERNAL_JOB_VENUES,
} from '@/lib/types/external-job';
import { detectSourceFromUrl, generateCampaignName } from '@/lib/external-job-utils';

interface ExternalJobFormProps {
  initialData?: {
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
    source_name: initialData?.source_name || ('' as ExternalJobSource | ''),
    source_url: initialData?.source_url || '',
    position_type: initialData?.position_type || '',
    venue_type: initialData?.venue_type || '',
    utm_campaign: initialData?.utm_campaign || '',
    is_active: initialData?.is_active ?? true,
  });

  // Auto-detect source from URL
  const handleUrlChange = (url: string) => {
    setFormData((prev) => ({ ...prev, source_url: url }));

    const detectedSource = detectSourceFromUrl(url);
    if (detectedSource && !formData.source_name) {
      setFormData((prev) => ({ ...prev, source_name: detectedSource }));
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
      if (!formData.source_name) {
        throw new Error('Kaynak site seçin');
      }
      if (!formData.source_url.trim()) {
        throw new Error('İlan URL gerekli');
      }

      const supabase = createClient();

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const jobData: ExternalJobInsert = {
        title: formData.title.trim(),
        company_name: formData.company_name.trim(),
        location_city: formData.location_city || null,
        location_district: formData.location_district?.trim() || null,
        description: formData.description?.trim() || null,
        source_name: formData.source_name as ExternalJobSource,
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
            placeholder="https://kariyer.net/is-ilani/..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            required
          />
        </div>
        <p className="mt-1 text-xs text-secondary-500">
          İlan URL adresini yapıştırın, kaynak otomatik algılanır
        </p>
      </div>

      {/* Source Selection */}
      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-2">
          Kaynak Site <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {(Object.keys(SOURCE_INFO) as ExternalJobSource[]).map((source) => {
            const info = SOURCE_INFO[source];
            return (
              <button
                key={source}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, source_name: source }))}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-colors ${
                  formData.source_name === source
                    ? `${info.bgColor} ${info.textColor} border-current`
                    : 'bg-white border-secondary-200 text-secondary-700 hover:bg-secondary-50'
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: info.color }}
                />
                <span className="font-medium">{info.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Title and Company */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            İlan Başlığı <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="Örn: Garson Aranıyor"
            className="w-full px-4 py-2.5 bg-white border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Şirket Adı <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.company_name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, company_name: e.target.value }))
            }
            placeholder="Örn: ABC Restoran"
            className="w-full px-4 py-2.5 bg-white border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            required
          />
        </div>
      </div>

      {/* Location */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">Şehir</label>
          <select
            value={formData.location_city}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, location_city: e.target.value }))
            }
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
            İlçe (Opsiyonel)
          </label>
          <input
            type="text"
            value={formData.location_district}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, location_district: e.target.value }))
            }
            placeholder="Örn: Kadıköy"
            className="w-full px-4 py-2.5 bg-white border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Position and Venue */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Pozisyon Türü
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
            Mekan Türü
          </label>
          <select
            value={formData.venue_type}
            onChange={(e) => handlePositionOrVenueChange('venue_type', e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Mekan türü seçin</option>
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
          Kısa Açıklama (Opsiyonel)
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="İlan hakkında kısa bir açıklama..."
          rows={3}
          className="w-full px-4 py-2.5 bg-white border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
        />
      </div>

      {/* UTM Campaign */}
      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-2">
          UTM Kampanya Adı (Opsiyonel)
        </label>
        <input
          type="text"
          value={formData.utm_campaign}
          onChange={(e) => setFormData((prev) => ({ ...prev, utm_campaign: e.target.value }))}
          placeholder="Örn: garson-ilanlari"
          className="w-full px-4 py-2.5 bg-white border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
        <p className="mt-1 text-xs text-secondary-500">
          Tracking için kullanılır. Boş bırakırsanız pozisyon ve mekan türünden otomatik
          oluşturulur.
        </p>
      </div>

      {/* Active Status */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="is_active"
          checked={formData.is_active}
          onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
          className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
        />
        <label htmlFor="is_active" className="text-sm text-secondary-700">
          İlan aktif (kullanıcılara gösterilsin)
        </label>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-secondary-100">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2.5 text-secondary-700 hover:bg-secondary-50 rounded-lg font-medium transition-colors"
        >
          İptal
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium rounded-lg transition-colors"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {initialData ? 'Güncelle' : 'İlan Ekle'}
        </button>
      </div>
    </form>
  );
}
