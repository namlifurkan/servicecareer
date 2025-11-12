-- ServiceCareer Seed Data
-- Yeni şirketler ve ilanlar (tech-solutions zaten var)

-- ============================================
-- 1. COMPANY OWNERS (İşveren Kullanıcıları)
-- ============================================
DO $$
DECLARE
  owner2_id UUID := '10000000-0000-0000-0000-000000000002';
  owner3_id UUID := '10000000-0000-0000-0000-000000000003';
  owner4_id UUID := '10000000-0000-0000-0000-000000000004';
  owner5_id UUID := '10000000-0000-0000-0000-000000000005';
  tech_company_id UUID;
BEGIN
  -- Get existing tech-solutions company ID
  SELECT id INTO tech_company_id FROM companies WHERE slug = 'tech-solutions' LIMIT 1;

  -- Owner 2
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role)
  VALUES (owner2_id, 'info@gidalezzetleri.com', crypt('GidaPass123!', gen_salt('bf')), NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Ayşe Demir","role":"company"}'::jsonb, false, 'authenticated')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO profiles (id, role, email, full_name, is_active)
  VALUES (owner2_id, 'company', 'info@gidalezzetleri.com', 'Ayşe Demir', true)
  ON CONFLICT (id) DO NOTHING;

  -- Owner 3
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role)
  VALUES (owner3_id, 'hr@hizlikargo.com', crypt('KargoPass123!', gen_salt('bf')), NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Mehmet Kaya","role":"company"}'::jsonb, false, 'authenticated')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO profiles (id, role, email, full_name, is_active)
  VALUES (owner3_id, 'company', 'hr@hizlikargo.com', 'Mehmet Kaya', true)
  ON CONFLICT (id) DO NOTHING;

  -- Owner 4
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role)
  VALUES (owner4_id, 'ik@temizev.com', crypt('TemizPass123!', gen_salt('bf')), NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Fatma Arslan","role":"company"}'::jsonb, false, 'authenticated')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO profiles (id, role, email, full_name, is_active)
  VALUES (owner4_id, 'company', 'ik@temizev.com', 'Fatma Arslan', true)
  ON CONFLICT (id) DO NOTHING;

  -- Owner 5
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role)
  VALUES (owner5_id, 'kariyer@guzelotel.com', crypt('OtelPass123!', gen_salt('bf')), NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Ali Özdemir","role":"company"}'::jsonb, false, 'authenticated')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO profiles (id, role, email, full_name, is_active)
  VALUES (owner5_id, 'company', 'kariyer@guzelotel.com', 'Ali Özdemir', true)
  ON CONFLICT (id) DO NOTHING;
END $$;

-- ============================================
-- 2. COMPANIES (Şirketler)
-- ============================================
INSERT INTO companies (id, owner_id, name, slug, description, website, city, phone, is_verified, is_active, created_at)
VALUES
('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Gıda Lezzetleri Ltd. Şti.', 'gida-lezzetleri',
 'Gıda Lezzetleri, 25 yıldır Türkiye genelinde kaliteli gıda ürünleri üretimi ve dağıtımı yapan köklü bir firmadır.',
 'https://www.gidalezzetleri.com', 'Ankara', '03122345678', true, true, NOW() - INTERVAL '4 months'),

('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'Hızlı Kargo ve Lojistik A.Ş.', 'hizli-kargo',
 'Hızlı Kargo, Türkiye''nin en hızlı büyüyen kargo ve lojistik firmalarından biridir. 81 ilde 300+ şube ile hizmet vermekteyiz.',
 'https://www.hizlikargo.com.tr', 'İzmir', '02323456789', true, true, NOW() - INTERVAL '3 months'),

('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', 'Temiz Ev Temizlik Hizmetleri', 'temiz-ev',
 'Temiz Ev, 2010 yılından bu yana profesyonel ev ve ofis temizliği hizmeti sunmaktadır.',
 'https://www.temizev.com.tr', 'Bursa', '02244567890', true, true, NOW() - INTERVAL '2 months'),

('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', 'Güzel Otel Turizm İşletmeleri', 'guzel-otel',
 'Güzel Otel Turizm, Antalya''da 5 yıldızlı otel işletmeciliği yapan bir turizm şirketidir.',
 'https://www.guzelotel.com', 'Antalya', '02425678901', true, true, NOW() - INTERVAL '1 month')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 3. JOBS (İş İlanları)
-- ============================================
INSERT INTO jobs (
  company_id, title, slug, description, requirements, benefits,
  status, work_type, experience_level, education_level,
  salary_min, salary_max, salary_currency, show_salary,
  location_city, location_district, is_remote, published_at, created_at
) VALUES

-- Gıda Lezzetleri İlanları
('20000000-0000-0000-0000-000000000002', 'Üretim Müdürü', 'uretim-muduru-ankara-1',
 'Gıda üretim tesisimizin yönetiminden sorumlu olacak deneyimli Üretim Müdürü arıyoruz.',
 'En az 8 yıl gıda üretim deneyimi, En az 5 yıl yönetim, Gıda Mühendisliği mezunu, HACCP ve ISO 22000, Liderlik becerileri, SAP deneyimi',
 ARRAY['Rekabetçi maaş', 'Performans primi', 'Şirket aracı', 'Sağlık sigortası', '24 gün izin', 'Yemek', 'Servis', 'Eğitim desteği'],
 'active', 'full_time', 'senior', 'bachelor', 55000, 80000, 'TRY', false,
 'Ankara', 'Sincan', false, NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),

('20000000-0000-0000-0000-000000000002', 'Kalite Kontrol Elemanı', 'kalite-kontrol-elemani-ankara-1',
 'Üretim süreçlerinde kalite kontrolünden sorumlu olacak titiz Kalite Kontrol Elemanı arıyoruz.',
 'Gıda veya Kimya Mühendisliği mezunu, 2-4 yıl kalite kontrol deneyimi, HACCP ve GMP bilgisi, Laboratuvar cihazları kullanımı, Detaycı',
 ARRAY['Düzenli maaş artışı', 'Sağlık sigortası', 'Yemek', 'Servis', 'Yıllık izin', 'Eğitim'],
 'active', 'full_time', 'mid', 'bachelor', 28000, 38000, 'TRY', true,
 'Ankara', 'Sincan', false, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),

('20000000-0000-0000-0000-000000000002', 'Üretim Operatörü', 'uretim-operatoru-ankara-1',
 'Gıda üretim hattında çalışacak üretim operatörleri arıyoruz. Vardiyalı çalışma.',
 'Lise mezunu, Gıda üretim deneyimi tercih, Vardiyalı çalışmaya uygun, Takım çalışması, Dikkatli ve titiz',
 ARRAY['SGK', 'Özel sağlık', 'Servis', 'Yemek', 'Vardiya primi', 'İş kıyafeti'],
 'active', 'full_time', 'entry', 'high_school', 17002, 20000, 'TRY', true,
 'Ankara', 'Sincan', false, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),

-- Hızlı Kargo İlanları
('20000000-0000-0000-0000-000000000003', 'Kargo Dağıtım Elemanı', 'kargo-dagitim-elemani-izmir-1',
 'İzmir genelinde kargo dağıtımı yapacak güler yüzlü elemanlar arıyoruz. B sınıfı ehliyet şart.',
 'Lise mezunu, B sınıfı ehliyet, İzmir coğrafyası bilgisi, Müşteri odaklı, Fiziksel olarak aktif, Sorumluluk sahibi',
 ARRAY['Maaş + yakıt primi', 'SGK', 'Yemek kartı', 'Cep telefonu', 'İş kıyafeti', 'Performans primi', 'Sigorta'],
 'active', 'full_time', 'entry', 'high_school', 18000, 24000, 'TRY', true,
 'İzmir', 'Konak', false, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

('20000000-0000-0000-0000-000000000003', 'Şube Müdürü', 'sube-muduru-izmir-1',
 'İzmir Bornova şubemizi yönetecek deneyimli Şube Müdürü arıyoruz.',
 'En az 5 yıl kargo/lojistik deneyimi, En az 3 yıl yöneticilik, Liderlik becerileri, Müşteri odaklı, Stres yönetimi, MS Office',
 ARRAY['Rekabetçi maaş + prim', 'Şirket aracı', 'Sağlık sigortası', 'Yemek kartı', 'Cep telefonu', 'Kariyer imkanı'],
 'active', 'full_time', 'senior', 'bachelor', 38000, 50000, 'TRY', false,
 'İzmir', 'Bornova', false, NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),

('20000000-0000-0000-0000-000000000003', 'Müşteri Hizmetleri Temsilcisi', 'musteri-hizmetleri-temsilcisi-izmir-1',
 'Çağrı merkezimizde çalışacak Müşteri Hizmetleri Temsilcileri arıyoruz. Vardiyalı çalışma.',
 'Lise veya üniversite mezunu, İyi iletişim, Bilgisayar kullanımı, Müşteri odaklı, Hızlı klavye, Sorun çözme',
 ARRAY['Maaş + performans primi', 'Sağlık sigortası', 'Yemek kartı', 'Servis', 'Eğitim programları', 'Sosyal aktiviteler'],
 'active', 'full_time', 'entry', 'high_school', 17002, 22000, 'TRY', true,
 'İzmir', 'Bornova', false, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),

-- Temiz Ev İlanları
('20000000-0000-0000-0000-000000000004', 'Ev Temizlik Elemanı', 'ev-temizlik-elemani-bursa-1',
 'Bursa genelinde evlerde temizlik hizmeti verecek deneyimli elemanlar arıyoruz. Part-time veya full-time.',
 'Temizlik deneyimi, Güler yüzlü, Güvenilir, Fiziksel olarak aktif, Referans tercih',
 ARRAY['Esnek çalışma', 'SGK', 'Ulaşım desteği', 'İş kıyafeti', 'Performans primi', 'Ek gelir'],
 'active', 'part_time', 'entry', NULL, 15000, 22000, 'TRY', true,
 'Bursa', 'Nilüfer', false, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),

('20000000-0000-0000-0000-000000000004', 'Ofis Temizlik Görevlisi', 'ofis-temizlik-gorevlisi-bursa-1',
 'Kurumsal ofislerde sabah veya akşam saatlerinde çalışacak temizlik görevlileri arıyoruz.',
 'Temizlik deneyimi, Gece vardiyası uygun, Sorumluluk sahibi, Takım çalışması, Dikkatli',
 ARRAY['Düzenli maaş', 'SGK', 'Vardiya primi', 'Servis', 'İş kıyafeti', 'Malzemeler'],
 'active', 'full_time', 'entry', NULL, 17002, 20000, 'TRY', true,
 'Bursa', 'Osmangazi', false, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),

('20000000-0000-0000-0000-000000000004', 'Temizlik Ekip Lideri', 'temizlik-ekip-lideri-bursa-1',
 'Temizlik ekiplerini yönetecek, kalite kontrolü yapacak deneyimli Ekip Lideri arıyoruz.',
 'En az 3 yıl temizlik deneyimi, Ekip yönetimi, Liderlik, Müşteri ilişkileri, Sorun çözme, B sınıfı ehliyet',
 ARRAY['Rekabetçi maaş', 'Performans primi', 'Şirket aracı', 'Sağlık sigortası', 'Cep telefonu', 'Kariyer'],
 'active', 'full_time', 'mid', 'high_school', 25000, 32000, 'TRY', true,
 'Bursa', 'Nilüfer', false, NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'),

-- Güzel Otel İlanları
('20000000-0000-0000-0000-000000000005', 'Resepsiyon Görevlisi', 'resepsiyon-gorevlisi-antalya-1',
 '5 yıldızlı otelimizde ön büro departmanında çalışacak deneyimli Resepsiyon Görevlileri arıyoruz.',
 'Turizm mezunu, En az 2 yıl otel deneyimi, İyi İngilizce (zorunlu), Rusça/Almanca (tercih), Opera PMS, Güler yüzlü, Takım çalışması',
 ARRAY['Rekabetçi maaş', 'Servis ücreti', 'Konaklama', '3 öğün yemek', 'Sağlık sigortası', 'Dil kursu', 'Sezon primi'],
 'active', 'full_time', 'mid', 'associate', 22000, 30000, 'TRY', true,
 'Antalya', 'Muratpaşa', false, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),

('20000000-0000-0000-0000-000000000005', 'Aşçı (Chef de Partie)', 'asci-chef-de-partie-antalya-1',
 'A la carte restoranımızda çalışacak deneyimli Aşçı arıyoruz. Türk ve dünya mutfakları deneyimi tercih.',
 'Aşçılık eğitimi, En az 4 yıl mutfak deneyimi, Türk ve dünya mutfakları, Hijyen ve HACCP, Stres altında çalışma',
 ARRAY['Yüksek maaş', 'Konaklama', '3 öğün yemek', 'Sağlık sigortası', 'Sezon primi', 'Eğitim', 'Kariyer'],
 'active', 'full_time', 'mid', 'high_school', 28000, 40000, 'TRY', true,
 'Antalya', 'Muratpaşa', false, NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),

('20000000-0000-0000-0000-000000000005', 'Kat Hizmetleri Görevlisi', 'kat-hizmetleri-gorevlisi-antalya-1',
 'Oda temizliği ve kat hizmetlerinde çalışacak titiz elemanlar arıyoruz. Deneyimsiz adaylara eğitim verilir.',
 'Lise mezunu, Temizlik deneyimi tercih, Fiziksel aktif, Dikkatli ve titiz, Takım çalışması, Güler yüzlü',
 ARRAY['Maaş + bahşiş', 'Konaklama', '3 öğün yemek', 'SGK', 'Kıyafet', 'Sezon primi', 'İş güvencesi'],
 'active', 'full_time', 'entry', 'high_school', 17002, 22000, 'TRY', true,
 'Antalya', 'Muratpaşa', false, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

('20000000-0000-0000-0000-000000000005', 'Animatör', 'animator-antalya-1',
 'Otel misafirlerini eğlendirecek enerjik Animatörler arıyoruz. Dans, müzik veya spor yeteneği tercih.',
 '18-35 yaş, İyi İngilizce, Sahne tecrübesi, Dans/müzik/spor yeteneği, Enerjik ve sosyal, Takım çalışması',
 ARRAY['İyi maaş + prim', 'Konaklama', '3 öğün yemek', 'Seyahat', 'Eğlenceli ortam', 'Sosyal aktivite', 'Sezon primi'],
 'active', 'contract', 'entry', 'high_school', 20000, 28000, 'TRY', true,
 'Antalya', 'Muratpaşa', false, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days');

-- Update view counts
UPDATE jobs SET view_count = floor(random() * 500 + 50)::int
WHERE company_id IN ('20000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000005');

-- Success
DO $$
BEGIN
  RAISE NOTICE '✅ Seed tamamlandı!';
  RAISE NOTICE '📊 4 şirket ve 15 iş ilanı eklendi.';
  RAISE NOTICE '';
  RAISE NOTICE '🔐 İşveren Girişleri:';
  RAISE NOTICE '  Gıda Lezzetleri: info@gidalezzetleri.com / GidaPass123!';
  RAISE NOTICE '  Hızlı Kargo: hr@hizlikargo.com / KargoPass123!';
  RAISE NOTICE '  Temiz Ev: ik@temizev.com / TemizPass123!';
  RAISE NOTICE '  Güzel Otel: kariyer@guzelotel.com / OtelPass123!';
END $$;
