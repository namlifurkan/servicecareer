// =============================================
// HİZMET SEKTÖRÜ TİP TANIMLARI
// Bu dosya veritabanı enum'larıyla senkronize olmalıdır
// Migration: 20241220000001_service_industry_enums.sql
// =============================================

// =============================================
// 1. MESLEK TİPLERİ
// =============================================
export type JobPositionType =
  // Mutfak Pozisyonları
  | 'executive_chef'
  | 'sous_chef'
  | 'chef_de_partie'
  | 'line_cook'
  | 'prep_cook'
  | 'pastry_chef'
  | 'pizza_chef'
  | 'grill_master'
  | 'doner_master'
  | 'sushi_chef'
  | 'kitchen_helper'
  // Yönetim Pozisyonları
  | 'manager'
  // Servis Pozisyonları
  | 'restaurant_manager'
  | 'floor_manager'
  | 'head_waiter'
  | 'waiter'
  | 'waitress'
  | 'busser'
  | 'host_hostess'
  | 'food_runner'
  // Bar Pozisyonları
  | 'bar_manager'
  | 'head_bartender'
  | 'bartender'
  | 'barista'
  | 'sommelier'
  | 'barback'
  // Kafe Pozisyonları
  | 'cafe_manager'
  | 'senior_barista'
  | 'cafe_attendant'
  // Teslimat & Kurye
  | 'delivery_driver'
  | 'bicycle_courier'
  | 'delivery_coordinator'
  // Destek Pozisyonları
  | 'dishwasher'
  | 'cleaner'
  | 'cashier'
  | 'security'
  // Fast Food
  | 'fast_food_crew'
  | 'shift_supervisor'
  // Catering & Organizasyon
  | 'catering_manager'
  | 'event_coordinator'
  | 'banquet_server'
  // Pastane & Fırın
  | 'baker'
  | 'pastry_cook'
  | 'cake_decorator'
  // Otel F&B
  | 'fb_manager'
  | 'room_service'
  | 'breakfast_attendant'
  // Diğer
  | 'other';

export const JOB_POSITION_LABELS: Record<JobPositionType, string> = {
  // Mutfak
  executive_chef: 'Executive Şef',
  sous_chef: 'Sous Şef',
  chef_de_partie: 'Kısım Şefi',
  line_cook: 'Aşçı',
  prep_cook: 'Hazırlık Aşçısı',
  pastry_chef: 'Pasta Şefi',
  pizza_chef: 'Pizza Ustası',
  grill_master: 'Mangal/Izgara Ustası',
  doner_master: 'Döner Ustası',
  sushi_chef: 'Sushi Şefi',
  kitchen_helper: 'Mutfak Yardımcısı',
  // Yönetim
  manager: 'Yönetici',
  // Servis
  restaurant_manager: 'Restoran Müdürü',
  floor_manager: 'Salon Şefi',
  head_waiter: 'Baş Garson',
  waiter: 'Garson',
  waitress: 'Bayan Garson',
  busser: 'Komi',
  host_hostess: 'Host/Hostes',
  food_runner: 'Servis Elemanı',
  // Bar
  bar_manager: 'Bar Müdürü',
  head_bartender: 'Baş Barmen',
  bartender: 'Barmen',
  barista: 'Barista',
  sommelier: 'Sommelier',
  barback: 'Bar Yardımcısı',
  // Kafe
  cafe_manager: 'Kafe Müdürü',
  senior_barista: 'Kıdemli Barista',
  cafe_attendant: 'Kafe Görevlisi',
  // Kurye
  delivery_driver: 'Motorlu Kurye',
  bicycle_courier: 'Bisikletli Kurye',
  delivery_coordinator: 'Teslimat Koordinatörü',
  // Destek
  dishwasher: 'Bulaşıkçı',
  cleaner: 'Temizlik Görevlisi',
  cashier: 'Kasiyer',
  security: 'Güvenlik',
  // Fast Food
  fast_food_crew: 'Fast Food Ekibi',
  shift_supervisor: 'Vardiya Amiri',
  // Catering
  catering_manager: 'Catering Müdürü',
  event_coordinator: 'Organizasyon Koordinatörü',
  banquet_server: 'Banket Görevlisi',
  // Pastane
  baker: 'Fırıncı',
  pastry_cook: 'Pastacı',
  cake_decorator: 'Pasta Dekoratörü',
  // Otel
  fb_manager: 'F&B Müdürü',
  room_service: 'Oda Servisi',
  breakfast_attendant: 'Kahvaltı Görevlisi',
  // Diğer
  other: 'Diğer',
};

// Pozisyon kategorileri
export const POSITION_CATEGORIES = {
  kitchen: [
    'executive_chef',
    'sous_chef',
    'chef_de_partie',
    'line_cook',
    'prep_cook',
    'pastry_chef',
    'pizza_chef',
    'grill_master',
    'doner_master',
    'sushi_chef',
    'kitchen_helper',
  ] as JobPositionType[],
  management: ['manager'] as JobPositionType[],
  service: [
    'restaurant_manager',
    'floor_manager',
    'head_waiter',
    'waiter',
    'waitress',
    'busser',
    'host_hostess',
    'food_runner',
  ] as JobPositionType[],
  bar: [
    'bar_manager',
    'head_bartender',
    'bartender',
    'barista',
    'sommelier',
    'barback',
  ] as JobPositionType[],
  cafe: ['cafe_manager', 'senior_barista', 'cafe_attendant'] as JobPositionType[],
  delivery: [
    'delivery_driver',
    'bicycle_courier',
    'delivery_coordinator',
  ] as JobPositionType[],
  support: ['dishwasher', 'cleaner', 'cashier', 'security'] as JobPositionType[],
  fast_food: ['fast_food_crew', 'shift_supervisor'] as JobPositionType[],
  catering: [
    'catering_manager',
    'event_coordinator',
    'banquet_server',
  ] as JobPositionType[],
  pastry: ['baker', 'pastry_cook', 'cake_decorator'] as JobPositionType[],
  hotel: ['fb_manager', 'room_service', 'breakfast_attendant'] as JobPositionType[],
};

// =============================================
// 2. VARDİYA TİPLERİ
// =============================================
export type ShiftType =
  | 'morning'
  | 'afternoon'
  | 'evening'
  | 'night'
  | 'split'
  | 'rotating'
  | 'flexible'
  | 'weekend_only'
  | 'weekday_only';

export const SHIFT_TYPE_LABELS: Record<ShiftType, string> = {
  morning: 'Sabah (06:00 - 14:00)',
  afternoon: 'Öğlen (14:00 - 22:00)',
  evening: 'Akşam (18:00 - 02:00)',
  night: 'Gece (22:00 - 06:00)',
  split: 'Bölünmüş Vardiya',
  rotating: 'Dönüşümlü',
  flexible: 'Esnek',
  weekend_only: 'Sadece Hafta Sonu',
  weekday_only: 'Sadece Hafta İçi',
};

// =============================================
// 3. SERTİFİKA TİPLERİ
// =============================================
export type CertificateType =
  // Zorunlu
  | 'hygiene_certificate'
  | 'food_safety'
  | 'health_certificate'
  | 'alcohol_license'
  // Mesleki
  | 'culinary_arts'
  | 'pastry_arts'
  | 'barista_certification'
  | 'sommelier_certification'
  | 'bartending_license'
  | 'mixology_certification'
  | 'food_styling'
  // Sürücü
  | 'driver_license_a'
  | 'driver_license_b'
  | 'src_certificate'
  // İş Güvenliği
  | 'first_aid'
  | 'fire_safety'
  | 'occupational_safety'
  // Dil
  | 'english_certificate'
  | 'german_certificate'
  | 'arabic_certificate'
  // Diğer
  | 'haccp'
  | 'iso_22000'
  | 'other';

export const CERTIFICATE_TYPE_LABELS: Record<CertificateType, string> = {
  hygiene_certificate: 'Hijyen Sertifikası',
  food_safety: 'Gıda Güvenliği Sertifikası',
  health_certificate: 'Sağlık Karnesi / Portör Muayenesi',
  alcohol_license: 'Alkollü İçki Satış Belgesi',
  culinary_arts: 'Aşçılık Diploması',
  pastry_arts: 'Pastacılık Sertifikası',
  barista_certification: 'Barista Sertifikası',
  sommelier_certification: 'Sommelier Sertifikası',
  bartending_license: 'Barmenlik Sertifikası',
  mixology_certification: 'Mixology Sertifikası',
  food_styling: 'Yemek Süsleme Sertifikası',
  driver_license_a: 'A Sınıfı Ehliyet',
  driver_license_b: 'B Sınıfı Ehliyet',
  src_certificate: 'SRC Belgesi',
  first_aid: 'İlk Yardım Sertifikası',
  fire_safety: 'Yangın Güvenliği Sertifikası',
  occupational_safety: 'İş Güvenliği Sertifikası',
  english_certificate: 'İngilizce Sertifikası',
  german_certificate: 'Almanca Sertifikası',
  arabic_certificate: 'Arapça Sertifikası',
  haccp: 'HACCP Sertifikası',
  iso_22000: 'ISO 22000 Sertifikası',
  other: 'Diğer Sertifika',
};

// =============================================
// 4. MUTFAK TÜRLERİ
// =============================================
export type CuisineType =
  | 'turkish'
  | 'ottoman'
  | 'mediterranean'
  | 'italian'
  | 'french'
  | 'asian'
  | 'japanese'
  | 'chinese'
  | 'indian'
  | 'mexican'
  | 'american'
  | 'middle_eastern'
  | 'seafood'
  | 'vegetarian'
  | 'vegan'
  | 'fusion'
  | 'street_food'
  | 'fine_dining'
  | 'casual_dining'
  | 'fast_food'
  | 'cafe_bakery'
  | 'other';

export const CUISINE_TYPE_LABELS: Record<CuisineType, string> = {
  turkish: 'Türk Mutfağı',
  ottoman: 'Osmanlı Mutfağı',
  mediterranean: 'Akdeniz Mutfağı',
  italian: 'İtalyan Mutfağı',
  french: 'Fransız Mutfağı',
  asian: 'Asya Mutfağı',
  japanese: 'Japon Mutfağı',
  chinese: 'Çin Mutfağı',
  indian: 'Hint Mutfağı',
  mexican: 'Meksika Mutfağı',
  american: 'Amerikan Mutfağı',
  middle_eastern: 'Orta Doğu Mutfağı',
  seafood: 'Deniz Ürünleri',
  vegetarian: 'Vejetaryen',
  vegan: 'Vegan',
  fusion: 'Fusion',
  street_food: 'Sokak Lezzetleri',
  fine_dining: 'Fine Dining',
  casual_dining: 'Casual Dining',
  fast_food: 'Fast Food',
  cafe_bakery: 'Kafe & Pastane',
  other: 'Diğer',
};

// =============================================
// 5. MEKAN TİPLERİ
// =============================================
export type VenueType =
  | 'fine_dining_restaurant'
  | 'casual_restaurant'
  | 'fast_food_restaurant'
  | 'cafe'
  | 'coffee_shop'
  | 'pub'
  | 'bar'
  | 'nightclub'
  | 'lounge'
  | 'rooftop'
  | 'hotel_restaurant'
  | 'hotel_bar'
  | 'beach_club'
  | 'patisserie'
  | 'bakery'
  | 'food_truck'
  | 'catering_company'
  | 'canteen'
  | 'buffet'
  | 'diner'
  | 'kebab_house'
  | 'pide_lahmacun'
  | 'fish_restaurant'
  | 'steakhouse'
  | 'pizzeria'
  | 'sushi_bar'
  | 'ice_cream_shop'
  | 'dessert_shop'
  | 'tea_house'
  | 'hookah_lounge'
  | 'other';

export const VENUE_TYPE_LABELS: Record<VenueType, string> = {
  fine_dining_restaurant: 'Fine Dining Restoran',
  casual_restaurant: 'Günlük Restoran',
  fast_food_restaurant: 'Fast Food',
  cafe: 'Kafe',
  coffee_shop: 'Kahve Dükkanı',
  pub: 'Pub',
  bar: 'Bar',
  nightclub: 'Gece Kulübü',
  lounge: 'Lounge',
  rooftop: 'Rooftop',
  hotel_restaurant: 'Otel Restoranı',
  hotel_bar: 'Otel Barı',
  beach_club: 'Beach Club',
  patisserie: 'Pastane',
  bakery: 'Fırın',
  food_truck: 'Yemek Tırı',
  catering_company: 'Catering Şirketi',
  canteen: 'Yemekhane',
  buffet: 'Açık Büfe',
  diner: 'Lokanta',
  kebab_house: 'Kebapçı',
  pide_lahmacun: 'Pide/Lahmacun Salonu',
  fish_restaurant: 'Balık Restoranı',
  steakhouse: 'Steakhouse',
  pizzeria: 'Pizzacı',
  sushi_bar: 'Sushi Bar',
  ice_cream_shop: 'Dondurma Dükkanı',
  dessert_shop: 'Tatlıcı',
  tea_house: 'Çay Bahçesi',
  hookah_lounge: 'Nargile Kafe',
  other: 'Diğer',
};

// =============================================
// 6. ARAÇ TİPLERİ (Kurye için)
// =============================================
export type VehicleType =
  | 'motorcycle'
  | 'scooter'
  | 'bicycle'
  | 'electric_bike'
  | 'car'
  | 'van'
  | 'none';

export const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  motorcycle: 'Motosiklet',
  scooter: 'Scooter',
  bicycle: 'Bisiklet',
  electric_bike: 'Elektrikli Bisiklet',
  car: 'Araba',
  van: 'Minivan',
  none: 'Araç Yok',
};

// =============================================
// 7. ÜNİFORMA DURUMU
// =============================================
export type UniformPolicy =
  | 'provided'
  | 'allowance'
  | 'own_black'
  | 'own_white'
  | 'casual'
  | 'smart_casual'
  | 'formal';

export const UNIFORM_POLICY_LABELS: Record<UniformPolicy, string> = {
  provided: 'Üniforma Verilir',
  allowance: 'Üniforma Yardımı',
  own_black: 'Siyah Kıyafet (Kendi)',
  own_white: 'Beyaz Kıyafet (Kendi)',
  casual: 'Serbest Kıyafet',
  smart_casual: 'Smart Casual',
  formal: 'Resmi',
};

// =============================================
// 8. YEMEK DURUMU
// =============================================
export type MealPolicy =
  | 'provided_all'
  | 'provided_shift'
  | 'discount'
  | 'not_provided';

export const MEAL_POLICY_LABELS: Record<MealPolicy, string> = {
  provided_all: 'Tüm Öğünler Verilir',
  provided_shift: 'Vardiya Yemeği',
  discount: 'İndirimli Yemek',
  not_provided: 'Yemek Verilmez',
};

// =============================================
// 9. KONAKLAMA DURUMU
// =============================================
export type AccommodationPolicy = 'provided' | 'subsidy' | 'not_provided';

export const ACCOMMODATION_POLICY_LABELS: Record<AccommodationPolicy, string> = {
  provided: 'Konaklama Sağlanır',
  subsidy: 'Konaklama Yardımı',
  not_provided: 'Konaklama Sağlanmaz',
};

// =============================================
// 10. BAHŞİŞ POLİTİKASI
// =============================================
export type TipPolicy = 'individual' | 'pooled' | 'service_charge' | 'no_tips';

export const TIP_POLICY_LABELS: Record<TipPolicy, string> = {
  individual: 'Bireysel Bahşiş',
  pooled: 'Havuz Sistemi',
  service_charge: 'Servis Ücreti Dahil',
  no_tips: 'Bahşiş Yok',
};

// =============================================
// 11. DENEYİM SEVİYESİ
// =============================================
export type ServiceExperienceLevel =
  | 'no_experience'
  | 'beginner'
  | 'intermediate'
  | 'experienced'
  | 'senior'
  | 'expert'
  | 'master';

export const EXPERIENCE_LEVEL_LABELS: Record<ServiceExperienceLevel, string> = {
  no_experience: 'Deneyimsiz (Yetiştirilir)',
  beginner: 'Başlangıç (0-1 Yıl)',
  intermediate: 'Orta (1-3 Yıl)',
  experienced: 'Deneyimli (3-5 Yıl)',
  senior: 'Kıdemli (5-10 Yıl)',
  expert: 'Uzman (10+ Yıl)',
  master: 'Usta (15+ Yıl)',
};

// =============================================
// 12. ÇALIŞMA GÜNLERİ
// =============================================
export type WorkingDays =
  | 'monday_friday'
  | 'monday_saturday'
  | 'tuesday_sunday'
  | 'all_week'
  | 'weekends_only'
  | 'flexible';

export const WORKING_DAYS_LABELS: Record<WorkingDays, string> = {
  monday_friday: 'Pazartesi - Cuma',
  monday_saturday: 'Pazartesi - Cumartesi',
  tuesday_sunday: 'Salı - Pazar (Pazartesi Tatil)',
  all_week: 'Haftanın 7 Günü (Rotasyon)',
  weekends_only: 'Sadece Hafta Sonu',
  flexible: 'Esnek',
};

// =============================================
// 13. BAŞVURU DURUMU
// =============================================
export type ApplicationStatus =
  | 'pending'
  | 'viewed'
  | 'shortlisted'
  | 'interview_scheduled'
  | 'interview_completed'
  | 'trial_scheduled'
  | 'trial_completed'
  | 'offer_sent'
  | 'offer_accepted'
  | 'offer_rejected'
  | 'hired'
  | 'rejected'
  | 'withdrawn';

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  pending: 'Beklemede',
  viewed: 'Görüntülendi',
  shortlisted: 'Ön Seçime Alındı',
  interview_scheduled: 'Mülakat Planlandı',
  interview_completed: 'Mülakat Tamamlandı',
  trial_scheduled: 'Deneme Günü Planlandı',
  trial_completed: 'Deneme Tamamlandı',
  offer_sent: 'Teklif Gönderildi',
  offer_accepted: 'Teklif Kabul Edildi',
  offer_rejected: 'Teklif Reddedildi',
  hired: 'İşe Alındı',
  rejected: 'Reddedildi',
  withdrawn: 'Geri Çekildi',
};

// Başvuru durumu renkleri
export const APPLICATION_STATUS_COLORS: Record<
  ApplicationStatus,
  { bg: string; text: string }
> = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  viewed: { bg: 'bg-blue-100', text: 'text-blue-800' },
  shortlisted: { bg: 'bg-purple-100', text: 'text-purple-800' },
  interview_scheduled: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
  interview_completed: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
  trial_scheduled: { bg: 'bg-cyan-100', text: 'text-cyan-800' },
  trial_completed: { bg: 'bg-cyan-100', text: 'text-cyan-800' },
  offer_sent: { bg: 'bg-emerald-100', text: 'text-emerald-800' },
  offer_accepted: { bg: 'bg-green-100', text: 'text-green-800' },
  offer_rejected: { bg: 'bg-red-100', text: 'text-red-800' },
  hired: { bg: 'bg-green-100', text: 'text-green-800' },
  rejected: { bg: 'bg-red-100', text: 'text-red-800' },
  withdrawn: { bg: 'bg-gray-100', text: 'text-gray-800' },
};

// =============================================
// 14. MAAŞ ÖDEME TİPİ
// =============================================
export type SalaryPaymentType =
  | 'monthly'
  | 'weekly'
  | 'daily'
  | 'hourly'
  | 'per_delivery';

export const SALARY_PAYMENT_TYPE_LABELS: Record<SalaryPaymentType, string> = {
  monthly: 'Aylık',
  weekly: 'Haftalık',
  daily: 'Günlük (Yevmiye)',
  hourly: 'Saatlik',
  per_delivery: 'Teslimat Başına',
};

// =============================================
// 15. REFERANS DURUMU
// =============================================
export type ReferenceStatus = 'pending' | 'verified' | 'rejected' | 'expired';

export const REFERENCE_STATUS_LABELS: Record<ReferenceStatus, string> = {
  pending: 'Beklemede',
  verified: 'Doğrulandı',
  rejected: 'Reddedildi',
  expired: 'Süresi Doldu',
};

// =============================================
// 16. YAN HAK TİPLERİ (job_benefits tablosundan)
// =============================================
export type BenefitType =
  | 'meal'
  | 'transportation'
  | 'accommodation'
  | 'health_insurance'
  | 'bonus'
  | 'tips'
  | 'uniform'
  | 'training'
  | 'career_growth'
  | 'flexible_hours'
  | 'weekend_off'
  | 'annual_leave'
  | 'overtime_pay'
  | 'performance_bonus'
  | 'referral_bonus'
  | 'childcare'
  | 'gym_membership'
  | 'staff_discount'
  | 'other';

export const BENEFIT_TYPE_LABELS: Record<BenefitType, string> = {
  meal: 'Yemek',
  transportation: 'Yol/Servis',
  accommodation: 'Konaklama',
  health_insurance: 'Sağlık Sigortası',
  bonus: 'Prim',
  tips: 'Bahşiş',
  uniform: 'Üniforma',
  training: 'Eğitim',
  career_growth: 'Kariyer Gelişimi',
  flexible_hours: 'Esnek Çalışma',
  weekend_off: 'Hafta Sonu Tatil',
  annual_leave: 'Yıllık İzin',
  overtime_pay: 'Fazla Mesai Ücreti',
  performance_bonus: 'Performans Primi',
  referral_bonus: 'Referans Primi',
  childcare: 'Çocuk Bakımı',
  gym_membership: 'Spor Salonu',
  staff_discount: 'Personel İndirimi',
  other: 'Diğer',
};

// =============================================
// DİL BİLGİSİ
// =============================================
export type LanguageCode =
  | 'tr'
  | 'en'
  | 'de'
  | 'fr'
  | 'ar'
  | 'ru'
  | 'es'
  | 'it'
  | 'zh'
  | 'ja'
  | 'ko'
  | 'fa'
  | 'ku'
  | 'other';

export const LANGUAGE_LABELS: Record<LanguageCode, string> = {
  tr: 'Türkçe',
  en: 'İngilizce',
  de: 'Almanca',
  fr: 'Fransızca',
  ar: 'Arapça',
  ru: 'Rusça',
  es: 'İspanyolca',
  it: 'İtalyanca',
  zh: 'Çince',
  ja: 'Japonca',
  ko: 'Korece',
  fa: 'Farsça',
  ku: 'Kürtçe',
  other: 'Diğer',
};

export type LanguageLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'native';

export const LANGUAGE_LEVEL_LABELS: Record<LanguageLevel, string> = {
  A1: 'Başlangıç',
  A2: 'Temel',
  B1: 'Orta Altı',
  B2: 'Orta',
  C1: 'İleri',
  C2: 'Uzman',
  native: 'Ana Dil',
};

// =============================================
// HELPER FUNCTIONS
// =============================================

// Generic helper to get options array for select components
export function getOptionsFromLabels<T extends string>(
  labels: Record<T, string>
): Array<{ value: T; label: string }> {
  return Object.entries(labels).map(([value, label]) => ({
    value: value as T,
    label: label as string,
  }));
}

// Specific helper functions
export const getPositionOptions = () => getOptionsFromLabels(JOB_POSITION_LABELS);
export const getShiftOptions = () => getOptionsFromLabels(SHIFT_TYPE_LABELS);
export const getCertificateOptions = () =>
  getOptionsFromLabels(CERTIFICATE_TYPE_LABELS);
export const getCuisineOptions = () => getOptionsFromLabels(CUISINE_TYPE_LABELS);
export const getVenueOptions = () => getOptionsFromLabels(VENUE_TYPE_LABELS);
export const getVehicleOptions = () => getOptionsFromLabels(VEHICLE_TYPE_LABELS);
export const getUniformOptions = () => getOptionsFromLabels(UNIFORM_POLICY_LABELS);
export const getMealOptions = () => getOptionsFromLabels(MEAL_POLICY_LABELS);
export const getAccommodationOptions = () =>
  getOptionsFromLabels(ACCOMMODATION_POLICY_LABELS);
export const getTipOptions = () => getOptionsFromLabels(TIP_POLICY_LABELS);
export const getExperienceOptions = () =>
  getOptionsFromLabels(EXPERIENCE_LEVEL_LABELS);
export const getWorkingDaysOptions = () =>
  getOptionsFromLabels(WORKING_DAYS_LABELS);
export const getApplicationStatusOptions = () =>
  getOptionsFromLabels(APPLICATION_STATUS_LABELS);
export const getSalaryPaymentOptions = () =>
  getOptionsFromLabels(SALARY_PAYMENT_TYPE_LABELS);
export const getBenefitOptions = () => getOptionsFromLabels(BENEFIT_TYPE_LABELS);
export const getLanguageOptions = () => getOptionsFromLabels(LANGUAGE_LABELS);
export const getLanguageLevelOptions = () =>
  getOptionsFromLabels(LANGUAGE_LEVEL_LABELS);

// Get positions by category
export function getPositionsByCategory(
  category: keyof typeof POSITION_CATEGORIES
): Array<{ value: JobPositionType; label: string }> {
  return POSITION_CATEGORIES[category].map((value) => ({
    value,
    label: JOB_POSITION_LABELS[value],
  }));
}

// Get all positions grouped by category
export function getPositionsGrouped(): Array<{
  category: string;
  categoryLabel: string;
  positions: Array<{ value: JobPositionType; label: string }>;
}> {
  const categoryLabels: Record<keyof typeof POSITION_CATEGORIES, string> = {
    kitchen: 'Mutfak',
    management: 'Yönetim',
    service: 'Servis',
    bar: 'Bar',
    cafe: 'Kafe',
    delivery: 'Kurye & Teslimat',
    support: 'Destek',
    fast_food: 'Fast Food',
    catering: 'Catering & Organizasyon',
    pastry: 'Pastane & Fırın',
    hotel: 'Otel F&B',
  };

  return Object.entries(POSITION_CATEGORIES).map(([category, positions]) => ({
    category,
    categoryLabel: categoryLabels[category as keyof typeof POSITION_CATEGORIES],
    positions: positions.map((value) => ({
      value,
      label: JOB_POSITION_LABELS[value],
    })),
  }));
}
