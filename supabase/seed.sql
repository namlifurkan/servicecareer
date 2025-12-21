-- =============================================
-- SERVICECAREER SEED DATA
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. CREATE CATEGORIES
INSERT INTO categories (name, slug, description, icon, is_active, display_order)
VALUES
  ('Restoran', 'restoran', 'Restoran ve yemek hizmetleri', 'utensils', true, 1),
  ('Kafe & Kahve', 'kafe-kahve', 'Kafe ve kahve dükkanları', 'coffee', true, 2),
  ('Bar & Gece Kulübü', 'bar-gece-kulubu', 'Bar, pub ve gece kulüpleri', 'wine', true, 3),
  ('Otel & Konaklama', 'otel-konaklama', 'Otel ve konaklama hizmetleri', 'hotel', true, 4),
  ('Fast Food', 'fast-food', 'Hızlı yemek servisi', 'burger', true, 5),
  ('Teslimat & Kurye', 'teslimat-kurye', 'Yemek teslimat ve kurye hizmetleri', 'bike', true, 6),
  ('Pastane & Fırın', 'pastane-firin', 'Pastane ve fırın işletmeleri', 'cake', true, 7),
  ('Catering', 'catering', 'Catering ve organizasyon hizmetleri', 'catering', true, 8)
ON CONFLICT (slug) DO NOTHING;

-- 2. First create a dummy owner profile for seed companies
-- (You can later transfer ownership to real users)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'seed-owner@servicecareer.com',
  crypt('SeedOwner123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Seed Owner"}',
  'authenticated',
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, email, full_name, role, is_active)
VALUES ('a0000000-0000-0000-0000-000000000001', 'seed-owner@servicecareer.com', 'Seed Owner', 'company', true)
ON CONFLICT (id) DO NOTHING;

-- 3. CREATE COMPANIES (with owner_id)
INSERT INTO companies (owner_id, name, slug, description, industry, company_size, city, website, phone, logo_url, is_active, is_verified)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Nusret Steakhouse', 'nusret-steakhouse', 'Dünyaca ünlü steakhouse zinciri.', 'Restoran', 'enterprise', 'İstanbul', 'https://nusr-et.com.tr', '0212 999 0001', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&h=200&fit=crop', true, true),
  ('a0000000-0000-0000-0000-000000000001', 'Starbucks Türkiye', 'starbucks-turkiye', 'Dünyanın en büyük kahve zinciri.', 'Kafe', 'enterprise', 'İstanbul', 'https://starbucks.com.tr', '0216 999 0002', 'https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=200&h=200&fit=crop', true, true),
  ('a0000000-0000-0000-0000-000000000001', 'Hilton Istanbul', 'hilton-istanbul', '5 yıldızlı otel.', 'Otel', 'large', 'İstanbul', 'https://hilton.com', '0212 999 0003', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&h=200&fit=crop', true, true),
  ('a0000000-0000-0000-0000-000000000001', 'Big Chefs', 'big-chefs', 'Türkiye''nin en büyük casual dining restoran zinciri.', 'Restoran', 'enterprise', 'Ankara', 'https://bigchefs.com.tr', '0312 999 0004', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&h=200&fit=crop', true, true),
  ('a0000000-0000-0000-0000-000000000001', 'Kahve Dünyası', 'kahve-dunyasi', 'Türk kahve kültürünü yaşatan yerli kahve zinciri.', 'Kafe', 'large', 'İstanbul', 'https://kahvedunyasi.com', '0212 999 0005', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200&h=200&fit=crop', true, true),
  ('a0000000-0000-0000-0000-000000000001', 'Getir Yemek', 'getir-yemek', 'Türkiye''nin lider yemek teslimat platformu.', 'Teslimat', 'enterprise', 'İstanbul', 'https://getir.com', '0216 999 0006', 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=200&h=200&fit=crop', true, true),
  ('a0000000-0000-0000-0000-000000000001', 'Baylan Pastanesi', 'baylan-pastanesi', '1923''ten beri İstanbul''un efsane pastanesi.', 'Pastane', 'small', 'İstanbul', 'https://baylan.com.tr', '0216 999 0007', 'https://images.unsplash.com/photo-1517433670267-30f41c09d89c?w=200&h=200&fit=crop', true, true),
  ('a0000000-0000-0000-0000-000000000001', 'Sunset Grill & Bar', 'sunset-grill-bar', 'Boğaz manzaralı fine dining restoran ve bar.', 'Bar/Restoran', 'medium', 'İstanbul', 'https://sunsetgrillbar.com', '0212 999 0008', 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=200&h=200&fit=crop', true, true)
ON CONFLICT (slug) DO NOTHING;

-- 4. CREATE JOBS
DO $$
DECLARE
  nusret_id uuid;
  starbucks_id uuid;
  hilton_id uuid;
  bigchefs_id uuid;
  kahvedunyasi_id uuid;
  getir_id uuid;
  baylan_id uuid;
  sunset_id uuid;
  cat_restoran uuid;
  cat_kafe uuid;
  cat_bar uuid;
  cat_otel uuid;
  cat_teslimat uuid;
  cat_pastane uuid;
BEGIN
  SELECT id INTO nusret_id FROM companies WHERE slug = 'nusret-steakhouse';
  SELECT id INTO starbucks_id FROM companies WHERE slug = 'starbucks-turkiye';
  SELECT id INTO hilton_id FROM companies WHERE slug = 'hilton-istanbul';
  SELECT id INTO bigchefs_id FROM companies WHERE slug = 'big-chefs';
  SELECT id INTO kahvedunyasi_id FROM companies WHERE slug = 'kahve-dunyasi';
  SELECT id INTO getir_id FROM companies WHERE slug = 'getir-yemek';
  SELECT id INTO baylan_id FROM companies WHERE slug = 'baylan-pastanesi';
  SELECT id INTO sunset_id FROM companies WHERE slug = 'sunset-grill-bar';
  
  SELECT id INTO cat_restoran FROM categories WHERE slug = 'restoran';
  SELECT id INTO cat_kafe FROM categories WHERE slug = 'kafe-kahve';
  SELECT id INTO cat_bar FROM categories WHERE slug = 'bar-gece-kulubu';
  SELECT id INTO cat_otel FROM categories WHERE slug = 'otel-konaklama';
  SELECT id INTO cat_teslimat FROM categories WHERE slug = 'teslimat-kurye';
  SELECT id INTO cat_pastane FROM categories WHERE slug = 'pastane-firin';

  -- Job 1: Garson - Nusret (ACİL)
  INSERT INTO jobs (company_id, category_id, title, slug, description, requirements, location_city, work_type, experience_level, salary_min, salary_max, salary_currency, show_salary, salary_payment_type, position_type, venue_type, shift_types, cuisine_types, service_experience_required, is_urgent, positions_available, uniform_policy, meal_policy, tip_policy, has_insurance, status, published_at, expires_at)
  VALUES (nusret_id, cat_restoran, 'Deneyimli Garson', 'deneyimli-garson-nusret', 'Nusret Steakhouse ailesi büyüyor! Beşiktaş şubemiz için deneyimli garson arkadaşlar arıyoruz.', '- En az 2 yıl fine dining deneyimi
- İyi derecede İngilizce', 'İstanbul', 'full_time', 'mid', 35000, 50000, 'TRY', true, 'monthly', 'waiter', 'fine_dining_restaurant', ARRAY['evening', 'night']::shift_type[], ARRAY['turkish', 'fusion']::cuisine_type[], 'experienced', true, 3, 'provided', 'provided_all', 'pooled', true, 'active', NOW() - INTERVAL '2 days', NOW() + INTERVAL '30 days');

  -- Job 2: Barista - Starbucks
  INSERT INTO jobs (company_id, category_id, title, slug, description, requirements, location_city, work_type, experience_level, salary_min, salary_max, salary_currency, show_salary, salary_payment_type, position_type, venue_type, shift_types, service_experience_required, is_urgent, positions_available, uniform_policy, meal_policy, tip_policy, has_insurance, status, published_at, expires_at)
  VALUES (starbucks_id, cat_kafe, 'Barista', 'barista-starbucks-kadikoy', 'Starbucks Türkiye olarak Kadıköy bölgesindeki şubelerimiz için barista arkadaşlar arıyoruz.', '- Müşteri odaklı çalışma
- Takım çalışmasına yatkınlık', 'İstanbul', 'full_time', 'entry', 22000, 28000, 'TRY', true, 'monthly', 'barista', 'coffee_shop', ARRAY['morning', 'afternoon', 'evening']::shift_type[], 'no_experience', false, 5, 'provided', 'provided_all', 'individual', true, 'active', NOW() - INTERVAL '1 day', NOW() + INTERVAL '30 days');

  -- Job 3: Aşçı - Hilton
  INSERT INTO jobs (company_id, category_id, title, slug, description, requirements, location_city, work_type, experience_level, salary_min, salary_max, salary_currency, show_salary, salary_payment_type, position_type, venue_type, shift_types, cuisine_types, service_experience_required, is_urgent, positions_available, uniform_policy, meal_policy, tip_policy, has_insurance, status, published_at, expires_at)
  VALUES (hilton_id, cat_otel, 'Sıcak Mutfak Aşçısı', 'sicak-mutfak-ascisi-hilton', 'Hilton Istanbul Bosphorus oteli için deneyimli sıcak mutfak aşçısı arıyoruz.', '- En az 3 yıl otel mutfağı deneyimi
- Hijyen sertifikası', 'İstanbul', 'full_time', 'mid', 40000, 55000, 'TRY', true, 'monthly', 'line_cook', 'hotel_restaurant', ARRAY['morning', 'afternoon']::shift_type[], ARRAY['turkish', 'fusion', 'mediterranean']::cuisine_type[], 'experienced', false, 2, 'provided', 'provided_all', 'no_tips', true, 'active', NOW() - INTERVAL '5 days', NOW() + INTERVAL '30 days');

  -- Job 4: Barmen - Sunset (ACİL)
  INSERT INTO jobs (company_id, category_id, title, slug, description, requirements, location_city, work_type, experience_level, salary_min, salary_max, salary_currency, show_salary, salary_payment_type, position_type, venue_type, shift_types, service_experience_required, is_urgent, positions_available, uniform_policy, meal_policy, tip_policy, has_insurance, status, published_at, expires_at)
  VALUES (sunset_id, cat_bar, 'Kıdemli Barmen', 'kidemli-barmen-sunset', 'Sunset Grill & Bar için yaratıcı ve deneyimli barmen arıyoruz.', '- En az 4 yıl bar deneyimi
- İyi derecede İngilizce', 'İstanbul', 'full_time', 'senior', 45000, 65000, 'TRY', true, 'monthly', 'head_bartender', 'rooftop', ARRAY['evening', 'night']::shift_type[], 'senior', true, 1, 'provided', 'discount', 'pooled', true, 'active', NOW() - INTERVAL '3 days', NOW() + INTERVAL '30 days');

  -- Job 5: Kurye - Getir (ACİL)
  INSERT INTO jobs (company_id, category_id, title, slug, description, requirements, location_city, work_type, experience_level, salary_min, salary_max, salary_currency, show_salary, salary_payment_type, position_type, venue_type, shift_types, service_experience_required, is_urgent, positions_available, uniform_policy, meal_policy, tip_policy, has_insurance, status, published_at, expires_at)
  VALUES (getir_id, cat_teslimat, 'Motorlu Kurye', 'motorlu-kurye-getir', 'Getir Yemek ailesi büyüyor! İstanbul için motorlu kurye arkadaşlar arıyoruz.', '- B sınıfı ehliyet
- İstanbul trafiğine hakim', 'İstanbul', 'full_time', 'entry', 25000, 40000, 'TRY', true, 'monthly', 'delivery_driver', 'food_truck', ARRAY['morning', 'afternoon', 'evening', 'night']::shift_type[], 'no_experience', true, 10, 'allowance', 'not_provided', 'individual', true, 'active', NOW(), NOW() + INTERVAL '30 days');

  -- Job 6: Pasta Şefi - Baylan
  INSERT INTO jobs (company_id, category_id, title, slug, description, requirements, location_city, work_type, experience_level, salary_min, salary_max, salary_currency, show_salary, salary_payment_type, position_type, venue_type, shift_types, service_experience_required, is_urgent, positions_available, uniform_policy, meal_policy, tip_policy, has_insurance, status, published_at, expires_at)
  VALUES (baylan_id, cat_pastane, 'Pasta Şefi', 'pasta-sefi-baylan', 'Baylan Pastanesi, 100 yıllık geleneğini sürdürecek pasta şefi arıyor.', '- En az 5 yıl pastacılık deneyimi
- Hijyen sertifikası', 'İstanbul', 'full_time', 'senior', 50000, 70000, 'TRY', true, 'monthly', 'pastry_chef', 'patisserie', ARRAY['morning', 'afternoon']::shift_type[], 'expert', false, 1, 'provided', 'provided_all', 'no_tips', true, 'active', NOW() - INTERVAL '7 days', NOW() + INTERVAL '30 days');

  -- Job 7: Komi - Big Chefs
  INSERT INTO jobs (company_id, category_id, title, slug, description, requirements, location_city, work_type, experience_level, salary_min, salary_max, salary_currency, show_salary, salary_payment_type, position_type, venue_type, shift_types, cuisine_types, service_experience_required, is_urgent, positions_available, uniform_policy, meal_policy, tip_policy, has_insurance, status, published_at, expires_at)
  VALUES (bigchefs_id, cat_restoran, 'Komi (Busser)', 'komi-big-chefs-ankara', 'Big Chefs Ankara şubeleri için komi arkadaşlar arıyoruz.', '- Deneyim şartı yok
- 18 yaşını doldurmuş olmak', 'Ankara', 'full_time', 'entry', 17500, 22000, 'TRY', true, 'monthly', 'busser', 'casual_restaurant', ARRAY['afternoon', 'evening']::shift_type[], ARRAY['turkish', 'fusion']::cuisine_type[], 'no_experience', false, 4, 'provided', 'provided_all', 'pooled', true, 'active', NOW() - INTERVAL '4 days', NOW() + INTERVAL '30 days');

  -- Job 8: Host/Hostes - Hilton
  INSERT INTO jobs (company_id, category_id, title, slug, description, requirements, location_city, work_type, experience_level, salary_min, salary_max, salary_currency, show_salary, salary_payment_type, position_type, venue_type, shift_types, service_experience_required, is_urgent, positions_available, uniform_policy, meal_policy, tip_policy, has_insurance, status, published_at, expires_at)
  VALUES (hilton_id, cat_otel, 'Host/Hostes', 'host-hostes-hilton', 'Hilton Istanbul lobby lounge için host/hostes arıyoruz.', '- Prezentabl görünüm
- İyi derecede İngilizce', 'İstanbul', 'full_time', 'entry', 25000, 32000, 'TRY', true, 'monthly', 'host_hostess', 'hotel_bar', ARRAY['morning', 'afternoon', 'evening']::shift_type[], 'beginner', false, 2, 'provided', 'provided_all', 'no_tips', true, 'active', NOW() - INTERVAL '1 day', NOW() + INTERVAL '30 days');

  -- Job 9: Şef Garson - Nusret (ACİL)
  INSERT INTO jobs (company_id, category_id, title, slug, description, requirements, location_city, work_type, experience_level, salary_min, salary_max, salary_currency, show_salary, salary_payment_type, position_type, venue_type, shift_types, cuisine_types, service_experience_required, is_urgent, positions_available, uniform_policy, meal_policy, tip_policy, has_insurance, status, published_at, expires_at)
  VALUES (nusret_id, cat_restoran, 'Şef Garson', 'sef-garson-nusret-etiler', 'ACİL! Nusret Etiler şubemiz için şef garson arıyoruz.', '- En az 5 yıl garson deneyimi
- Akıcı İngilizce', 'İstanbul', 'full_time', 'senior', 55000, 75000, 'TRY', true, 'monthly', 'head_waiter', 'fine_dining_restaurant', ARRAY['afternoon', 'evening', 'night']::shift_type[], ARRAY['turkish', 'fusion']::cuisine_type[], 'senior', true, 1, 'provided', 'provided_all', 'pooled', true, 'active', NOW(), NOW() + INTERVAL '15 days');

  -- Job 10: Kafe Görevlisi - Kahve Dünyası
  INSERT INTO jobs (company_id, category_id, title, slug, description, requirements, location_city, work_type, experience_level, salary_min, salary_max, salary_currency, show_salary, salary_payment_type, position_type, venue_type, shift_types, service_experience_required, is_urgent, positions_available, uniform_policy, meal_policy, tip_policy, has_insurance, status, published_at, expires_at)
  VALUES (kahvedunyasi_id, cat_kafe, 'Kafe Görevlisi', 'kafe-gorevlisi-kahve-dunyasi', 'Kahve Dünyası İstiklal Caddesi şubesi için kafe görevlisi arıyoruz.', '- Tercihen kafe deneyimi
- Güler yüzlü ve enerjik', 'İstanbul', 'part_time', 'entry', 15000, 20000, 'TRY', true, 'monthly', 'cafe_attendant', 'cafe', ARRAY['morning', 'afternoon', 'evening']::shift_type[], 'no_experience', false, 3, 'provided', 'discount', 'individual', true, 'active', NOW() - INTERVAL '6 days', NOW() + INTERVAL '30 days');

END $$;

SELECT 'Seed completed!' as status, (SELECT COUNT(*) FROM categories) as categories, (SELECT COUNT(*) FROM companies) as companies, (SELECT COUNT(*) FROM jobs WHERE status = 'active') as active_jobs;
