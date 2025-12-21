// Niche-Specific Job Attributes Configuration
// Category-specific attribute types and filter configurations for service industry jobs

export type CategoryAttributeKey =
  | 'cuisine_types'
  | 'kitchen_positions'
  | 'equipment_skills'
  | 'coffee_skills'
  | 'bar_skills'
  | 'service_experience'
  | 'service_skills'
  | 'delivery_areas'
  | 'platform_experience'
  | 'cleaning_areas'
  | 'venue_experience'
  | 'management_experience'
  | 'venue_management'
  | 'management_skills'
  | 'pos_systems'
  | 'payment_systems'
  | 'cashier_experience'
  | 'additional_skills'
  | 'pastry_specialization'
  | 'bakery_experience'
  | 'event_types'
  | 'catering_position'
  | 'catering_experience'
  | 'cafe_experience'
  | 'bar_experience';

export type CategoryAttributes = {
  [key in CategoryAttributeKey]?: string[];
};

export type CommonAttributes = {
  certifications?: string[];
  vehicle_required?: boolean;
  vehicle_types?: string[];
  languages?: string[];
  shift_types?: string[];
};

// Filter configuration interface
export interface FilterConfig {
  label: string;
  key: string;
  type: 'select' | 'multi-select' | 'boolean';
  options: { value: string; label: string }[];
  priority: 'high' | 'medium' | 'low';
  filterable: boolean;
}

// Category filter configurations - 10 categories
export const CATEGORY_FILTERS: Record<string, FilterConfig[]> = {
  // 1. Aşçı & Mutfak Personeli
  'asci-mutfak': [
    {
      label: 'Mutfak Türü',
      key: 'cuisine_types',
      type: 'multi-select',
      options: [
        { value: 'turk', label: 'Türk Mutfağı' },
        { value: 'italyan', label: 'İtalyan' },
        { value: 'fransiz', label: 'Fransız' },
        { value: 'asya', label: 'Asya' },
        { value: 'uzakdogu', label: 'Uzakdoğu' },
        { value: 'bbq_mangal', label: 'BBQ/Mangal' },
        { value: 'deniz_urunleri', label: 'Deniz Ürünleri' },
        { value: 'vegan_vejetaryen', label: 'Vegan/Vejetaryen' },
      ],
      priority: 'high',
      filterable: true,
    },
    {
      label: 'Pozisyon/Uzmanlık',
      key: 'kitchen_positions',
      type: 'multi-select',
      options: [
        { value: 'soguk_mutfak', label: 'Soğuk Mutfak' },
        { value: 'sicak_mutfak', label: 'Sıcak Mutfak' },
        { value: 'sous_chef', label: 'Sous Chef' },
        { value: 'chef_de_partie', label: 'Chef de Partie' },
        { value: 'pastry_chef', label: 'Pastry Chef' },
        { value: 'commis', label: 'Commis' },
      ],
      priority: 'high',
      filterable: true,
    },
    {
      label: 'Sertifikalar',
      key: 'certifications',
      type: 'multi-select',
      options: [
        { value: 'hijyen_belgesi', label: 'Hijyen Belgesi' },
        { value: 'haccp', label: 'HACCP' },
        { value: 'ascilik_sertifikasi', label: 'Aşçılık Sertifikası' },
        { value: 'pastacilik_sertifikasi', label: 'Pastacılık Sertifikası' },
        { value: 'uluslararasi_sertifika', label: 'Uluslararası Sertifika' },
      ],
      priority: 'medium',
      filterable: true,
    },
    {
      label: 'Ekipman Bilgisi',
      key: 'equipment_skills',
      type: 'multi-select',
      options: [
        { value: 'firin', label: 'Fırın' },
        { value: 'izgara', label: 'Izgara' },
        { value: 'deep_fryer', label: 'Deep Fryer' },
        { value: 'combi_oven', label: 'Combi Oven' },
        { value: 'salamander', label: 'Salamander' },
        { value: 'planetary_mikser', label: 'Planetary Mikser' },
      ],
      priority: 'medium',
      filterable: true,
    },
    {
      label: 'Diller',
      key: 'languages',
      type: 'multi-select',
      options: [
        { value: 'turkce', label: 'Türkçe' },
        { value: 'ingilizce', label: 'İngilizce' },
        { value: 'almanca', label: 'Almanca' },
        { value: 'rusca', label: 'Rusça' },
        { value: 'arapca', label: 'Arapça' },
      ],
      priority: 'low',
      filterable: true,
    },
  ],

  // 2. Garsonluk & Servis
  'garsonluk-servis': [
    {
      label: 'Deneyim Alanı',
      key: 'service_experience',
      type: 'multi-select',
      options: [
        { value: 'fine_dining', label: 'Fine Dining' },
        { value: 'casual_dining', label: 'Casual Dining' },
        { value: 'fast_casual', label: 'Fast Casual' },
        { value: 'cafe', label: 'Cafe' },
        { value: 'bar', label: 'Bar' },
        { value: 'otel_restorani', label: 'Otel Restoranı' },
      ],
      priority: 'high',
      filterable: true,
    },
    {
      label: 'Diller',
      key: 'languages',
      type: 'multi-select',
      options: [
        { value: 'turkce', label: 'Türkçe' },
        { value: 'ingilizce', label: 'İngilizce' },
        { value: 'almanca', label: 'Almanca' },
        { value: 'rusca', label: 'Rusça' },
        { value: 'arapca', label: 'Arapça' },
        { value: 'fransizca', label: 'Fransızca' },
      ],
      priority: 'high',
      filterable: true,
    },
    {
      label: 'Servis Becerileri',
      key: 'service_skills',
      type: 'multi-select',
      options: [
        { value: 'tepsi_tasima', label: 'Tepsi Taşıma' },
        { value: 'sarap_servisi', label: 'Şarap Servisi' },
        { value: 'cocktail_servisi', label: 'Cocktail Servisi' },
        { value: 'fine_dining_etiquette', label: 'Fine Dining Etiquette' },
        { value: 'tableside_service', label: 'Tableside Service' },
      ],
      priority: 'medium',
      filterable: true,
    },
    {
      label: 'Vardiya Tercihi',
      key: 'shift_types',
      type: 'multi-select',
      options: [
        { value: 'sabah', label: 'Sabah' },
        { value: 'oglen', label: 'Öğlen' },
        { value: 'aksam', label: 'Akşam' },
        { value: 'gece', label: 'Gece' },
        { value: 'hafta_sonu', label: 'Hafta Sonu' },
      ],
      priority: 'medium',
      filterable: true,
    },
    {
      label: 'POS Sistemi',
      key: 'pos_systems',
      type: 'multi-select',
      options: [
        { value: 'ikas', label: 'İkas' },
        { value: 'platon', label: 'Platon' },
        { value: 'logo', label: 'Logo' },
        { value: 'nebim', label: 'Nebim' },
        { value: 'diger', label: 'Diğer' },
      ],
      priority: 'low',
      filterable: true,
    },
  ],

  // 3. Barista & Kahve Uzmanı
  'barista-kahve': [
    {
      label: 'Kahve Becerileri',
      key: 'coffee_skills',
      type: 'multi-select',
      options: [
        { value: 'espresso', label: 'Espresso' },
        { value: 'latte_art', label: 'Latte Art' },
        { value: 'filter_coffee', label: 'Filter Coffee' },
        { value: 'cold_brew', label: 'Cold Brew' },
        { value: 'turkish_coffee', label: 'Turkish Coffee' },
        { value: 'siphon', label: 'Siphon' },
      ],
      priority: 'high',
      filterable: true,
    },
    {
      label: 'Sertifikalar',
      key: 'certifications',
      type: 'multi-select',
      options: [
        { value: 'sca_barista', label: 'SCA Barista' },
        { value: 'sca_brewing', label: 'SCA Brewing' },
        { value: 'latte_art_sertifikasi', label: 'Latte Art Sertifikası' },
        { value: 'q_grader', label: 'Q Grader' },
        { value: 'hijyen_belgesi', label: 'Hijyen Belgesi' },
      ],
      priority: 'high',
      filterable: true,
    },
    {
      label: 'Ekipman Bilgisi',
      key: 'equipment_skills',
      type: 'multi-select',
      options: [
        { value: 'espresso_makinesi', label: 'Espresso Makinesi' },
        { value: 'grinder', label: 'Grinder' },
        { value: 'french_press', label: 'French Press' },
        { value: 'v60', label: 'V60' },
        { value: 'chemex', label: 'Chemex' },
        { value: 'aeropress', label: 'Aeropress' },
      ],
      priority: 'medium',
      filterable: true,
    },
    {
      label: 'Cafe Türü Deneyimi',
      key: 'cafe_experience',
      type: 'multi-select',
      options: [
        { value: 'specialty_coffee', label: 'Specialty Coffee' },
        { value: 'zincir_cafe', label: 'Zincir Cafe' },
        { value: 'butik_cafe', label: 'Butik Cafe' },
        { value: 'kurumsal', label: 'Kurumsal' },
      ],
      priority: 'medium',
      filterable: true,
    },
    {
      label: 'Vardiya Tercihi',
      key: 'shift_types',
      type: 'multi-select',
      options: [
        { value: 'sabah', label: 'Sabah' },
        { value: 'oglen', label: 'Öğlen' },
        { value: 'aksam', label: 'Akşam' },
        { value: 'hafta_sonu', label: 'Hafta Sonu' },
      ],
      priority: 'low',
      filterable: true,
    },
  ],

  // 4. Bar & İçecek Uzmanı
  'bar-icecek': [
    {
      label: 'Bar Becerileri',
      key: 'bar_skills',
      type: 'multi-select',
      options: [
        { value: 'klasik_kokteyller', label: 'Klasik Kokteyller' },
        { value: 'modern_mixology', label: 'Modern Mixology' },
        { value: 'flair_bartending', label: 'Flair Bartending' },
        { value: 'wine_service', label: 'Wine Service' },
        { value: 'beer_knowledge', label: 'Beer Knowledge' },
      ],
      priority: 'high',
      filterable: true,
    },
    {
      label: 'Sertifikalar',
      key: 'certifications',
      type: 'multi-select',
      options: [
        { value: 'bartending_sertifikasi', label: 'Bartending Sertifikası' },
        { value: 'sommelier', label: 'Sommelier' },
        { value: 'wset', label: 'WSET' },
        { value: 'flair_sertifikasi', label: 'Flair Sertifikası' },
        { value: 'hijyen_belgesi', label: 'Hijyen Belgesi' },
      ],
      priority: 'medium',
      filterable: true,
    },
    {
      label: 'Bar Türü Deneyimi',
      key: 'bar_experience',
      type: 'multi-select',
      options: [
        { value: 'cocktail_bar', label: 'Cocktail Bar' },
        { value: 'beach_bar', label: 'Beach Bar' },
        { value: 'night_club', label: 'Night Club' },
        { value: 'otel_bari', label: 'Otel Barı' },
        { value: 'restaurant_bar', label: 'Restaurant Bar' },
      ],
      priority: 'high',
      filterable: true,
    },
    {
      label: 'Diller',
      key: 'languages',
      type: 'multi-select',
      options: [
        { value: 'turkce', label: 'Türkçe' },
        { value: 'ingilizce', label: 'İngilizce' },
        { value: 'rusca', label: 'Rusça' },
        { value: 'almanca', label: 'Almanca' },
      ],
      priority: 'medium',
      filterable: true,
    },
    {
      label: 'Vardiya Tercihi',
      key: 'shift_types',
      type: 'multi-select',
      options: [
        { value: 'aksam', label: 'Akşam' },
        { value: 'gece', label: 'Gece' },
        { value: 'hafta_sonu', label: 'Hafta Sonu' },
      ],
      priority: 'low',
      filterable: true,
    },
  ],

  // 5. Kurye & Teslimat
  'kurye-teslimat': [
    {
      label: 'Araç Tipi',
      key: 'vehicle_types',
      type: 'multi-select',
      options: [
        { value: 'araba', label: 'Araba' },
        { value: 'motor', label: 'Motor' },
        { value: 'bisiklet', label: 'Bisiklet' },
        { value: 'elektrikli_scooter', label: 'Elektrikli Scooter' },
        { value: 'yaya', label: 'Yaya' },
      ],
      priority: 'high',
      filterable: true,
    },
    {
      label: 'Ehliyet',
      key: 'certifications',
      type: 'multi-select',
      options: [
        { value: 'b_sinifi', label: 'B Sınıfı' },
        { value: 'a2', label: 'A2' },
        { value: 'a1', label: 'A1' },
        { value: 'src', label: 'SRC' },
        { value: 'motorlu_kurye_belgesi', label: 'Motorlu Kurye Belgesi' },
      ],
      priority: 'high',
      filterable: true,
    },
    {
      label: 'Teslimat Alanı',
      key: 'delivery_areas',
      type: 'multi-select',
      options: [
        { value: 'avrupa_yakasi', label: 'Avrupa Yakası' },
        { value: 'anadolu_yakasi', label: 'Anadolu Yakası' },
        { value: 'sehir_ici', label: 'Şehir İçi' },
        { value: 'sehir_disi', label: 'Şehir Dışı' },
        { value: 'uluslararasi', label: 'Uluslararası' },
      ],
      priority: 'medium',
      filterable: true,
    },
    {
      label: 'Platform Deneyimi',
      key: 'platform_experience',
      type: 'multi-select',
      options: [
        { value: 'yemeksepeti', label: 'Yemeksepeti' },
        { value: 'getir', label: 'Getir' },
        { value: 'trendyol_yemek', label: 'Trendyol Yemek' },
        { value: 'migros', label: 'Migros' },
        { value: 'diger', label: 'Diğer' },
      ],
      priority: 'medium',
      filterable: true,
    },
    {
      label: 'Vardiya Tercihi',
      key: 'shift_types',
      type: 'multi-select',
      options: [
        { value: 'sabah', label: 'Sabah' },
        { value: 'oglen', label: 'Öğlen' },
        { value: 'aksam', label: 'Akşam' },
        { value: 'gece', label: 'Gece' },
        { value: 'esnek', label: 'Esnek' },
      ],
      priority: 'low',
      filterable: true,
    },
  ],

  // 6. Temizlik & Bulaşık
  'temizlik-bulasik': [
    {
      label: 'Temizlik Alanı',
      key: 'cleaning_areas',
      type: 'multi-select',
      options: [
        { value: 'mutfak', label: 'Mutfak' },
        { value: 'salon', label: 'Salon' },
        { value: 'banyo_wc', label: 'Banyo/WC' },
        { value: 'depo', label: 'Depo' },
        { value: 'acik_alan', label: 'Açık Alan' },
        { value: 'tum_alanlar', label: 'Tüm Alanlar' },
      ],
      priority: 'high',
      filterable: true,
    },
    {
      label: 'Ekipman Bilgisi',
      key: 'equipment_skills',
      type: 'multi-select',
      options: [
        { value: 'endustriyel_bulasik_makinesi', label: 'Endüstriyel Bulaşık Makinesi' },
        { value: 'basincli_yikama', label: 'Basınçlı Yıkama' },
        { value: 'zemin_cilalama', label: 'Zemin Cilalama' },
        { value: 'dezenfeksiyon', label: 'Dezenfeksiyon' },
      ],
      priority: 'medium',
      filterable: true,
    },
    {
      label: 'Sertifikalar',
      key: 'certifications',
      type: 'multi-select',
      options: [
        { value: 'hijyen_belgesi', label: 'Hijyen Belgesi' },
        { value: 'is_guvenligi', label: 'İş Güvenliği' },
        { value: 'kimyasal_kullanim', label: 'Kimyasal Kullanım' },
      ],
      priority: 'low',
      filterable: true,
    },
    {
      label: 'Mekan Türü',
      key: 'venue_experience',
      type: 'multi-select',
      options: [
        { value: 'restoran', label: 'Restoran' },
        { value: 'kafe', label: 'Kafe' },
        { value: 'otel', label: 'Otel' },
        { value: 'catering_firmasi', label: 'Catering Firması' },
        { value: 'fast_food', label: 'Fast Food' },
      ],
      priority: 'medium',
      filterable: true,
    },
    {
      label: 'Vardiya Tercihi',
      key: 'shift_types',
      type: 'multi-select',
      options: [
        { value: 'sabah', label: 'Sabah' },
        { value: 'oglen', label: 'Öğlen' },
        { value: 'aksam', label: 'Akşam' },
        { value: 'gece', label: 'Gece' },
        { value: 'hafta_sonu', label: 'Hafta Sonu' },
      ],
      priority: 'low',
      filterable: true,
    },
  ],

  // 7. Kafe & Restoran Müdürü
  'kafe-restoran-muduru': [
    {
      label: 'Yönetim Deneyimi',
      key: 'management_experience',
      type: 'multi-select',
      options: [
        { value: 'genel_mudur', label: 'Genel Müdür' },
        { value: 'operasyon_muduru', label: 'Operasyon Müdürü' },
        { value: 'kat_muduru', label: 'Kat Müdürü' },
        { value: 'mutfak_muduru', label: 'Mutfak Müdürü' },
        { value: 'shift_manager', label: 'Shift Manager' },
      ],
      priority: 'high',
      filterable: true,
    },
    {
      label: 'Mekan Türü',
      key: 'venue_management',
      type: 'multi-select',
      options: [
        { value: 'fine_dining', label: 'Fine Dining' },
        { value: 'casual_dining', label: 'Casual Dining' },
        { value: 'fast_food', label: 'Fast Food' },
        { value: 'cafe', label: 'Cafe' },
        { value: 'otel_restorani', label: 'Otel Restoranı' },
        { value: 'zincir_restoran', label: 'Zincir Restoran' },
      ],
      priority: 'high',
      filterable: true,
    },
    {
      label: 'Yönetim Becerileri',
      key: 'management_skills',
      type: 'multi-select',
      options: [
        { value: 'ekip_yonetimi', label: 'Ekip Yönetimi' },
        { value: 'maliyet_kontrolu', label: 'Maliyet Kontrolü' },
        { value: 'stok_yonetimi', label: 'Stok Yönetimi' },
        { value: 'musteri_iliskileri', label: 'Müşteri İlişkileri' },
        { value: 'pazarlama', label: 'Pazarlama' },
      ],
      priority: 'medium',
      filterable: true,
    },
    {
      label: 'Sertifikalar',
      key: 'certifications',
      type: 'multi-select',
      options: [
        { value: 'fb_yonetimi', label: 'F&B Yönetimi' },
        { value: 'haccp', label: 'HACCP' },
        { value: 'is_guvenligi', label: 'İş Güvenliği' },
        { value: 'hijyen_belgesi', label: 'Hijyen Belgesi' },
        { value: 'mba', label: 'MBA' },
      ],
      priority: 'low',
      filterable: true,
    },
    {
      label: 'Diller',
      key: 'languages',
      type: 'multi-select',
      options: [
        { value: 'turkce', label: 'Türkçe' },
        { value: 'ingilizce', label: 'İngilizce' },
        { value: 'almanca', label: 'Almanca' },
        { value: 'rusca', label: 'Rusça' },
        { value: 'arapca', label: 'Arapça' },
      ],
      priority: 'medium',
      filterable: true,
    },
  ],

  // 8. Kasiyerlik
  'kasiyerlik': [
    {
      label: 'POS Sistemi Bilgisi',
      key: 'pos_systems',
      type: 'multi-select',
      options: [
        { value: 'ikas', label: 'İkas' },
        { value: 'platon', label: 'Platon' },
        { value: 'logo', label: 'Logo' },
        { value: 'ticimax', label: 'Ticimax' },
        { value: 'nebim', label: 'Nebim' },
        { value: 'adisyo', label: 'Adisyo' },
        { value: 'menulux', label: 'Menulux' },
      ],
      priority: 'high',
      filterable: true,
    },
    {
      label: 'Ödeme Sistemleri',
      key: 'payment_systems',
      type: 'multi-select',
      options: [
        { value: 'nakit', label: 'Nakit' },
        { value: 'kredi_karti', label: 'Kredi Kartı' },
        { value: 'mobil_odeme', label: 'Mobil Ödeme' },
        { value: 'yemek_karti', label: 'Yemek Kartı' },
        { value: 'multinet', label: 'Multinet' },
        { value: 'ticket', label: 'Ticket' },
      ],
      priority: 'medium',
      filterable: true,
    },
    {
      label: 'Deneyim Alanı',
      key: 'cashier_experience',
      type: 'multi-select',
      options: [
        { value: 'restoran', label: 'Restoran' },
        { value: 'kafe', label: 'Kafe' },
        { value: 'fast_food', label: 'Fast Food' },
        { value: 'market', label: 'Market' },
        { value: 'otel', label: 'Otel' },
      ],
      priority: 'medium',
      filterable: true,
    },
    {
      label: 'Vardiya Tercihi',
      key: 'shift_types',
      type: 'multi-select',
      options: [
        { value: 'sabah', label: 'Sabah' },
        { value: 'oglen', label: 'Öğlen' },
        { value: 'aksam', label: 'Akşam' },
        { value: 'gece', label: 'Gece' },
        { value: 'hafta_sonu', label: 'Hafta Sonu' },
      ],
      priority: 'medium',
      filterable: true,
    },
    {
      label: 'Ek Beceriler',
      key: 'additional_skills',
      type: 'multi-select',
      options: [
        { value: 'musteri_hizmetleri', label: 'Müşteri Hizmetleri' },
        { value: 'temel_muhasebe', label: 'Temel Muhasebe' },
        { value: 'stok_takibi', label: 'Stok Takibi' },
        { value: 'siparis_alma', label: 'Sipariş Alma' },
      ],
      priority: 'low',
      filterable: true,
    },
  ],

  // 9. Pastane & Fırın
  'pastane-firin': [
    {
      label: 'Uzmanlık Alanı',
      key: 'pastry_specialization',
      type: 'multi-select',
      options: [
        { value: 'pasta', label: 'Pasta' },
        { value: 'kurabiye', label: 'Kurabiye' },
        { value: 'ekmek', label: 'Ekmek' },
        { value: 'borek', label: 'Börek' },
        { value: 'tatli', label: 'Tatlı' },
        { value: 'cikolata', label: 'Çikolata' },
        { value: 'dekorasyon', label: 'Dekorasyon' },
      ],
      priority: 'high',
      filterable: true,
    },
    {
      label: 'Sertifikalar',
      key: 'certifications',
      type: 'multi-select',
      options: [
        { value: 'pastacilik_sertifikasi', label: 'Pastacılık Sertifikası' },
        { value: 'firincilik', label: 'Fırıncılık' },
        { value: 'cikolata_yapimi', label: 'Çikolata Yapımı' },
        { value: 'hijyen_belgesi', label: 'Hijyen Belgesi' },
      ],
      priority: 'medium',
      filterable: true,
    },
    {
      label: 'Ekipman Bilgisi',
      key: 'equipment_skills',
      type: 'multi-select',
      options: [
        { value: 'firin', label: 'Fırın' },
        { value: 'planetary_mikser', label: 'Planetary Mikser' },
        { value: 'sekerleme_ekipmani', label: 'Şekerleme Ekipmanı' },
        { value: 'dekorasyon_aletleri', label: 'Dekorasyon Aletleri' },
      ],
      priority: 'medium',
      filterable: true,
    },
    {
      label: 'Mekan Türü',
      key: 'bakery_experience',
      type: 'multi-select',
      options: [
        { value: 'pastane', label: 'Pastane' },
        { value: 'firin', label: 'Fırın' },
        { value: 'otel_pastanesi', label: 'Otel Pastanesi' },
        { value: 'cafe', label: 'Cafe' },
        { value: 'ozel_siparis', label: 'Özel Sipariş' },
      ],
      priority: 'medium',
      filterable: true,
    },
    {
      label: 'Vardiya Tercihi',
      key: 'shift_types',
      type: 'multi-select',
      options: [
        { value: 'sabah_erken', label: 'Sabah (Erken)' },
        { value: 'oglen', label: 'Öğlen' },
        { value: 'aksam', label: 'Akşam' },
        { value: 'gece', label: 'Gece' },
        { value: 'hafta_sonu', label: 'Hafta Sonu' },
      ],
      priority: 'low',
      filterable: true,
    },
  ],

  // 10. Catering & Organizasyon
  'catering-organizasyon': [
    {
      label: 'Etkinlik Türü',
      key: 'event_types',
      type: 'multi-select',
      options: [
        { value: 'dugun', label: 'Düğün' },
        { value: 'kurumsal_etkinlik', label: 'Kurumsal Etkinlik' },
        { value: 'dogum_gunu', label: 'Doğum Günü' },
        { value: 'kokteyl', label: 'Kokteyl' },
        { value: 'acilis', label: 'Açılış' },
        { value: 'festival', label: 'Festival' },
      ],
      priority: 'high',
      filterable: true,
    },
    {
      label: 'Pozisyon',
      key: 'catering_position',
      type: 'multi-select',
      options: [
        { value: 'servis_elemani', label: 'Servis Elemanı' },
        { value: 'mutfak_ekibi', label: 'Mutfak Ekibi' },
        { value: 'etkinlik_koordinatoru', label: 'Etkinlik Koordinatörü' },
        { value: 'kaptanbasi', label: 'Kaptanbaşı' },
      ],
      priority: 'high',
      filterable: true,
    },
    {
      label: 'Deneyim Alanı',
      key: 'catering_experience',
      type: 'multi-select',
      options: [
        { value: 'buyuk_etkinlik_500plus', label: 'Büyük Etkinlik (500+)' },
        { value: 'orta_etkinlik_100_500', label: 'Orta Etkinlik (100-500)' },
        { value: 'kucuk_etkinlik_100minus', label: 'Küçük Etkinlik (<100)' },
        { value: 'vip', label: 'VIP' },
      ],
      priority: 'medium',
      filterable: true,
    },
    {
      label: 'Ek Beceriler',
      key: 'additional_skills',
      type: 'multi-select',
      options: [
        { value: 'organizasyon', label: 'Organizasyon' },
        { value: 'setup_breakdown', label: 'Setup/Breakdown' },
        { value: 'ekip_yonetimi', label: 'Ekip Yönetimi' },
        { value: 'musteri_iletisimi', label: 'Müşteri İletişimi' },
      ],
      priority: 'medium',
      filterable: true,
    },
    {
      label: 'Vardiya Tercihi',
      key: 'shift_types',
      type: 'multi-select',
      options: [
        { value: 'hafta_ici', label: 'Hafta İçi' },
        { value: 'hafta_sonu', label: 'Hafta Sonu' },
        { value: 'aksam', label: 'Akşam' },
        { value: 'esnek', label: 'Esnek' },
      ],
      priority: 'low',
      filterable: true,
    },
  ],
};

// Helper function to get category slug from category ID or name
export function getCategorySlug(categoryNameOrSlug: string): string | null {
  const slugMap: Record<string, string> = {
    'aşçı & mutfak personeli': 'asci-mutfak',
    'garsonluk & servis': 'garsonluk-servis',
    'barista & kahve uzmanı': 'barista-kahve',
    'bar & İçecek uzmanı': 'bar-icecek',
    'kurye & teslimat': 'kurye-teslimat',
    'temizlik & bulaşık': 'temizlik-bulasik',
    'kafe & restoran müdürü': 'kafe-restoran-muduru',
    'kasiyerlik': 'kasiyerlik',
    'pastane & fırın': 'pastane-firin',
    'catering & organizasyon': 'catering-organizasyon',
  };

  const normalized = categoryNameOrSlug.toLowerCase().trim();
  return slugMap[normalized] || categoryNameOrSlug;
}

// Helper to get filters for a specific category
export function getFiltersForCategory(categorySlug: string): FilterConfig[] {
  return CATEGORY_FILTERS[categorySlug] || [];
}

// Helper to get high priority filters only
export function getHighPriorityFilters(categorySlug: string): FilterConfig[] {
  const filters = getFiltersForCategory(categorySlug);
  return filters.filter((f) => f.priority === 'high');
}
