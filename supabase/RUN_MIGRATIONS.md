# Migration Çalıştırma Rehberi

## Sıralama

Aşağıdaki migration dosyalarını Supabase SQL Editor'da **sırasıyla** çalıştırın:

### 1. Enum'lar ve Temel Tipler
```
20241220000001_service_industry_enums.sql
```

### 2. Aday Profil Tabloları
```
20241220000002_extended_candidate_profiles.sql
20241220000003_candidate_experiences.sql
20241220000004_candidate_certificates.sql
20241220000005_candidate_skills.sql
```

### 3. İlan Tabloları
```
20241220000006_extended_jobs.sql
20241220000007_job_benefits.sql
20241220000008_job_requirements.sql
20241220000009_working_hours.sql
20241220000010_salary_ranges.sql
```

### 4. Özellik Tabloları
```
20241220000011_reference_system.sql
20241220000012_extended_applications.sql
20241220000013_notifications.sql
20241220000014_messages.sql
20241220000015_reviews.sql
20241220000016_employer_features.sql
20241220000017_packages.sql
```

### 5. Index'ler, Fonksiyonlar ve Seed Data
```
20241220000018_additional_indexes.sql
20241220000019_utility_functions.sql
20241220000020_seed_positions.sql
```

---

## Hızlı Çalıştırma

Tüm migration'ları tek seferde çalıştırmak için:

1. Supabase Dashboard > SQL Editor'a git
2. "New Query" tıkla
3. Her dosyanın içeriğini sırayla yapıştır ve çalıştır

---

## Hata Durumunda

Eğer bir migration hata verirse:

1. Hatayı oku ve düzelt
2. Sadece o migration'ı tekrar çalıştır
3. Sonraki migration'larla devam et

### Yaygın Hatalar

**"type already exists"**
- Enum zaten var, `CREATE TYPE ... IF NOT EXISTS` yapılmış olmalı
- Yoksay ve devam et

**"relation already exists"**
- Tablo zaten var
- `IF NOT EXISTS` ekli olmalı, yoksay

**"column already exists"**
- `ADD COLUMN IF NOT EXISTS` kullanılmış
- Yoksay ve devam et

---

## TypeScript Tiplerini Güncelleme

Migration'ları çalıştırdıktan sonra TypeScript tiplerini güncelleyin:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/database.types.ts
```

Veya Supabase Dashboard'dan:
1. Settings > API
2. "Generate types" butonuna tıkla
3. TypeScript seç ve kopyala
4. `lib/database.types.ts` dosyasını güncelle

---

## Yeni Tablolar Özeti

### Aday Tabloları
- `candidate_vehicle_info` - Kurye araç bilgileri
- `candidate_languages` - Dil bilgileri
- `candidate_preferences` - İş tercihleri
- `candidate_certificates` - Sertifikalar
- `candidate_skills` - Yetenekler
- `candidate_custom_skills` - Özel yetenekler
- `experience_details` - Deneyim detayları

### İlan Tabloları
- `job_benefits` - Yan haklar
- `job_requirements` - Gereksinimler
- `job_requirement_items` - Gereksinim maddeleri
- `job_skills` - İlan yetenekleri
- `job_languages` - İlan dil gereksinimleri
- `job_working_hours` - Çalışma saatleri
- `salary_statistics` - Maaş istatistikleri

### Özellik Tabloları
- `reference_requests` - Referans talepleri
- `reference_responses` - Referans yanıtları
- `guest_application_details` - Misafir başvuru detayları
- `application_history` - Başvuru geçmişi
- `application_messages` - Başvuru mesajları
- `notifications` - Bildirimler
- `notification_preferences` - Bildirim tercihleri
- `notification_templates` - Bildirim şablonları
- `conversations` - Mesaj konuşmaları
- `messages` - Mesajlar
- `message_templates` - Mesaj şablonları
- `company_reviews` - Şirket değerlendirmeleri
- `review_votes` - Değerlendirme oyları
- `review_responses` - İşveren yanıtları
- `saved_candidates` - Kaydedilen adaylar
- `candidate_views` - Aday görüntüleme
- `candidate_searches` - Aday aramaları
- `company_team_members` - Şirket ekip üyeleri
- `company_activity_log` - Aktivite logu
- `company_daily_stats` - Günlük istatistikler
- `packages` - Abonelik paketleri
- `subscriptions` - Abonelikler
- `payment_history` - Ödeme geçmişi
- `credit_purchases` - Kredi satın alımları
- `promo_codes` - Promosyon kodları
- `promo_code_uses` - Promosyon kullanımları

### Lookup Tabloları
- `position_type_names` - Pozisyon isimleri
- `venue_type_names` - Mekan tipi isimleri
- `certificate_type_names` - Sertifika isimleri
- `benefit_type_names` - Yan hak isimleri
- `shift_type_names` - Vardiya isimleri
- `working_days_names` - Çalışma günleri
- `cuisine_type_names` - Mutfak türleri
- `experience_level_names` - Deneyim seviyeleri
- `salary_payment_type_names` - Ödeme tipleri
- `tip_policy_names` - Bahşiş politikaları
- `uniform_policy_names` - Üniforma politikaları
- `meal_policy_names` - Yemek politikaları
- `vehicle_type_names` - Araç tipleri
- `languages` - Diller
- `language_levels` - Dil seviyeleri
- `skills` - Yetenekler

---

## Toplam: 20 Migration Dosyası
