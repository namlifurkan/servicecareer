-- Test Data for ServiceCareer

-- Create test user in auth.users first
DO $$
DECLARE
  test_user_id UUID := '00000000-0000-0000-0000-000000000099';
BEGIN
  -- Insert test user if not exists
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role)
  VALUES (
    test_user_id,
    'test@techsolutions.com',
    crypt('TestPassword123!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    false,
    'authenticated'
  ) ON CONFLICT (id) DO NOTHING;

  -- Insert profile for test user
  INSERT INTO profiles (id, role, email, full_name, is_active)
  VALUES (
    test_user_id,
    'company',
    'test@techsolutions.com',
    'Tech Solutions Admin',
    true
  ) ON CONFLICT (id) DO NOTHING;
END $$;

-- Insert test company
INSERT INTO companies (id, owner_id, name, slug, description, website, city, phone, is_verified, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000099',
  'Tech Solutions A.Ş.',
  'tech-solutions',
  'Türkiye''nin önde gelen teknoloji şirketlerinden biri olan Tech Solutions, yazılım geliştirme ve danışmanlık hizmeti vermektedir.',
  'https://techsolutions.com.tr',
  'İstanbul',
  '02121234567',
  true,
  true
) ON CONFLICT (slug) DO NOTHING;

-- Insert test jobs
INSERT INTO jobs (
  company_id,
  title,
  slug,
  description,
  requirements,
  benefits,
  status,
  work_type,
  experience_level,
  education_level,
  salary_min,
  salary_max,
  salary_currency,
  show_salary,
  location_city,
  location_district,
  is_remote,
  published_at
) VALUES
(
  '00000000-0000-0000-0000-000000000001',
  'Senior Frontend Developer',
  'senior-frontend-developer-istanbul',
  'Modern web teknolojileri kullanarak kullanıcı deneyimini ön planda tutan uygulamalar geliştirmek üzere ekibimize katılacak Senior Frontend Developer arıyoruz.

Projelerimizde React, Next.js ve TypeScript kullanıyoruz. Temiz kod yazmayı, test yazmayı ve takım çalışmasını seven, yeni teknolojilere açık bir geliştirici arıyoruz.',
  '• En az 5 yıl frontend geliştirme deneyimi
• React ve Next.js ile ileri seviye deneyim
• TypeScript bilgisi
• RESTful API ve GraphQL deneyimi
• Git ve versiyon kontrol sistemleri bilgisi
• Responsive design ve cross-browser uyumluluk deneyimi
• Takım çalışmasına yatkınlık',
  '• Rekabetçi maaş paketi
• Esnek çalışma saatleri
• Uzaktan çalışma imkanı
• Sağlık sigortası
• Yemek kartı
• Eğitim ve gelişim desteği
• Genç ve dinamik çalışma ortamı',
  'active',
  'full_time',
  'senior',
  'bachelor',
  45000,
  65000,
  'TRY',
  true,
  'İstanbul',
  'Kadıköy',
  true,
  NOW()
),
(
  '00000000-0000-0000-0000-000000000001',
  'Müşteri Hizmetleri Temsilcisi',
  'musteri-hizmetleri-temsilcisi-ankara',
  'Müşterilerimize en iyi hizmeti sunmak için ekibimize katılacak Müşteri Hizmetleri Temsilcisi arıyoruz.',
  '• Lise veya üniversite mezunu
• İyi iletişim becerileri
• Müşteri odaklı yaklaşım
• Bilgisayar kullanımı bilgisi',
  '• Sosyal haklar
• Yemek kartı
• Ulaşım desteği
• Eğitim imkanı',
  'active',
  'full_time',
  'entry',
  'high_school',
  15000,
  20000,
  'TRY',
  true,
  'Ankara',
  'Çankaya',
  false,
  NOW()
),
(
  '00000000-0000-0000-0000-000000000001',
  'Backend Developer (Node.js)',
  'backend-developer-nodejs-izmir',
  'Ölçeklenebilir backend sistemleri geliştirmek üzere ekibimize Backend Developer arıyoruz.',
  '• En az 3 yıl backend geliştirme deneyimi
• Node.js ve Express.js deneyimi
• PostgreSQL veya MongoDB deneyimi
• RESTful API tasarımı bilgisi
• Docker ve Kubernetes deneyimi artı',
  '• Rekabetçi maaş
• Esnek çalışma
• Sağlık sigortası
• Özel eğitim bütçesi',
  'active',
  'full_time',
  'mid',
  'bachelor',
  35000,
  50000,
  'TRY',
  true,
  'İzmir',
  'Bornova',
  false,
  NOW()
);
