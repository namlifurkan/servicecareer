-- =============================================
-- ADAY SERTİFİKALARI
-- Migration: 20241220000004_candidate_certificates.sql
-- =============================================

CREATE TABLE IF NOT EXISTS candidate_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,

    -- Sertifika bilgileri
    certificate_type certificate_type NOT NULL,
    certificate_name TEXT NOT NULL,          -- Özel isim (örn: "SCA Barista Level 2")
    issuing_organization TEXT,               -- Veren kurum
    issue_date DATE,
    expiry_date DATE,                        -- NULL = Süresiz

    -- Doğrulama
    certificate_number TEXT,                 -- Sertifika numarası
    verification_url TEXT,                   -- Doğrulama linki
    is_verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES profiles(id),

    -- Dosya
    document_url TEXT,                       -- Yüklenen belge

    -- Notlar
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- is_expired view olarak hesaplanacak (CURRENT_DATE immutable değil)
CREATE OR REPLACE VIEW candidate_certificates_with_expiry AS
SELECT
    *,
    CASE
        WHEN expiry_date IS NULL THEN false
        WHEN expiry_date < CURRENT_DATE THEN true
        ELSE false
    END as is_expired
FROM candidate_certificates;

-- Sertifika tipleri için Türkçe isimler
CREATE TABLE IF NOT EXISTS certificate_type_names (
    certificate_type certificate_type PRIMARY KEY,
    name_tr TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description TEXT,
    is_mandatory BOOLEAN DEFAULT false,      -- Zorunlu mu?
    validity_months INTEGER,                 -- Geçerlilik süresi (ay)
    required_for_positions job_position_type[], -- Hangi pozisyonlar için gerekli
    display_order INTEGER DEFAULT 0
);

-- Sertifika isimlerini ekle
INSERT INTO certificate_type_names (certificate_type, name_tr, name_en, description, is_mandatory, validity_months, required_for_positions, display_order) VALUES
    ('hygiene_certificate', 'Hijyen Sertifikası', 'Hygiene Certificate', 'Gıda işletmelerinde çalışmak için zorunlu hijyen eğitimi sertifikası', true, 24, ARRAY['line_cook', 'prep_cook', 'chef_de_partie', 'sous_chef', 'executive_chef', 'pastry_chef', 'pizza_chef', 'grill_master', 'doner_master', 'sushi_chef', 'kitchen_helper', 'waiter', 'waitress', 'busser', 'food_runner', 'barista', 'bartender', 'fast_food_crew', 'baker', 'pastry_cook']::job_position_type[], 1),
    ('health_certificate', 'Sağlık Karnesi / Portör Muayenesi', 'Health Certificate', 'Gıda sektöründe çalışanlar için zorunlu sağlık taraması', true, 12, ARRAY['line_cook', 'prep_cook', 'chef_de_partie', 'sous_chef', 'executive_chef', 'pastry_chef', 'pizza_chef', 'grill_master', 'doner_master', 'sushi_chef', 'kitchen_helper', 'waiter', 'waitress', 'busser', 'food_runner', 'barista', 'bartender', 'fast_food_crew', 'baker', 'pastry_cook']::job_position_type[], 2),
    ('food_safety', 'Gıda Güvenliği Sertifikası', 'Food Safety Certificate', 'Gıda güvenliği ve HACCP eğitimi', false, 36, ARRAY['sous_chef', 'executive_chef', 'restaurant_manager', 'floor_manager', 'cafe_manager', 'bar_manager', 'catering_manager']::job_position_type[], 3),
    ('alcohol_license', 'Alkollü İçki Satış Belgesi', 'Alcohol Service License', 'Alkollü içki servisi yapabilme belgesi', true, NULL, ARRAY['bartender', 'head_bartender', 'bar_manager', 'sommelier', 'waiter', 'waitress', 'head_waiter']::job_position_type[], 4),
    ('culinary_arts', 'Aşçılık Diploması', 'Culinary Arts Diploma', 'Mesleki aşçılık eğitimi diploması', false, NULL, ARRAY['line_cook', 'chef_de_partie', 'sous_chef', 'executive_chef']::job_position_type[], 5),
    ('pastry_arts', 'Pastacılık Sertifikası', 'Pastry Arts Certificate', 'Profesyonel pastacılık eğitimi', false, NULL, ARRAY['pastry_chef', 'pastry_cook', 'cake_decorator', 'baker']::job_position_type[], 6),
    ('barista_certification', 'Barista Sertifikası', 'Barista Certification', 'SCA veya muadili barista sertifikası', false, NULL, ARRAY['barista', 'senior_barista', 'cafe_manager']::job_position_type[], 7),
    ('sommelier_certification', 'Sommelier Sertifikası', 'Sommelier Certification', 'Profesyonel şarap uzmanlığı sertifikası', false, NULL, ARRAY['sommelier', 'head_waiter', 'restaurant_manager']::job_position_type[], 8),
    ('bartending_license', 'Barmenlik Sertifikası', 'Bartending License', 'Profesyonel barmenlik eğitimi', false, NULL, ARRAY['bartender', 'head_bartender', 'bar_manager']::job_position_type[], 9),
    ('mixology_certification', 'Mixology Sertifikası', 'Mixology Certification', 'Kokteyl hazırlama uzmanlığı', false, NULL, ARRAY['bartender', 'head_bartender', 'bar_manager']::job_position_type[], 10),
    ('driver_license_a', 'A Sınıfı Ehliyet', 'Class A Driver License', 'Motosiklet ehliyeti', true, NULL, ARRAY['delivery_driver']::job_position_type[], 11),
    ('driver_license_b', 'B Sınıfı Ehliyet', 'Class B Driver License', 'Otomobil ehliyeti', false, NULL, ARRAY['delivery_driver', 'delivery_coordinator']::job_position_type[], 12),
    ('src_certificate', 'SRC Belgesi', 'SRC Certificate', 'Mesleki yeterlilik belgesi (kurye)', false, 60, ARRAY['delivery_driver', 'delivery_coordinator']::job_position_type[], 13),
    ('first_aid', 'İlk Yardım Sertifikası', 'First Aid Certificate', 'Temel ilk yardım eğitimi', false, 36, ARRAY['restaurant_manager', 'floor_manager', 'bar_manager', 'cafe_manager', 'shift_supervisor']::job_position_type[], 14),
    ('fire_safety', 'Yangın Güvenliği Sertifikası', 'Fire Safety Certificate', 'İşyeri yangın güvenliği eğitimi', false, 24, ARRAY['restaurant_manager', 'floor_manager', 'bar_manager', 'cafe_manager', 'shift_supervisor']::job_position_type[], 15),
    ('english_certificate', 'İngilizce Sertifikası', 'English Certificate', 'İngilizce dil yeterliliği', false, NULL, NULL, 16),
    ('german_certificate', 'Almanca Sertifikası', 'German Certificate', 'Almanca dil yeterliliği', false, NULL, NULL, 17),
    ('arabic_certificate', 'Arapça Sertifikası', 'Arabic Certificate', 'Arapça dil yeterliliği', false, NULL, NULL, 18),
    ('haccp', 'HACCP Sertifikası', 'HACCP Certificate', 'Tehlike analizi ve kritik kontrol noktaları', false, 36, ARRAY['executive_chef', 'sous_chef', 'restaurant_manager', 'catering_manager', 'fb_manager']::job_position_type[], 19),
    ('iso_22000', 'ISO 22000 Sertifikası', 'ISO 22000 Certificate', 'Gıda güvenliği yönetim sistemi', false, 36, ARRAY['executive_chef', 'restaurant_manager', 'catering_manager', 'fb_manager']::job_position_type[], 20),
    ('food_styling', 'Yemek Süsleme Sertifikası', 'Food Styling Certificate', 'Profesyonel yemek sunum eğitimi', false, NULL, ARRAY['executive_chef', 'sous_chef', 'pastry_chef']::job_position_type[], 21),
    ('occupational_safety', 'İş Güvenliği Sertifikası', 'Occupational Safety Certificate', 'İş sağlığı ve güvenliği eğitimi', false, 24, NULL, 22),
    ('other', 'Diğer Sertifika', 'Other Certificate', 'Diğer mesleki sertifikalar', false, NULL, NULL, 99)
ON CONFLICT (certificate_type) DO UPDATE SET
    name_tr = EXCLUDED.name_tr,
    name_en = EXCLUDED.name_en,
    description = EXCLUDED.description,
    is_mandatory = EXCLUDED.is_mandatory,
    validity_months = EXCLUDED.validity_months,
    required_for_positions = EXCLUDED.required_for_positions,
    display_order = EXCLUDED.display_order;

-- Indexler
CREATE INDEX IF NOT EXISTS idx_candidate_certificates_candidate ON candidate_certificates(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_certificates_type ON candidate_certificates(certificate_type);
CREATE INDEX IF NOT EXISTS idx_candidate_certificates_expiry ON candidate_certificates(expiry_date) WHERE expiry_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_candidate_certificates_verified ON candidate_certificates(is_verified) WHERE is_verified = true;

-- RLS
ALTER TABLE candidate_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificate_type_names ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Adaylar kendi sertifikalarını yönetebilir"
    ON candidate_certificates FOR ALL
    USING (candidate_id = auth.uid());

CREATE POLICY "Sertifikalar herkese görünür"
    ON candidate_certificates FOR SELECT
    USING (true);

CREATE POLICY "Sertifika tipleri herkese görünür"
    ON certificate_type_names FOR SELECT
    USING (true);

-- Sertifika güncellendiğinde updated_at güncelle
CREATE TRIGGER update_certificates_updated_at
    BEFORE UPDATE ON candidate_certificates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sertifika süresi dolmadan önce uyarı için view
CREATE OR REPLACE VIEW expiring_certificates AS
SELECT
    cc.*,
    cp.id as profile_id,
    p.email,
    p.full_name,
    ctn.name_tr as certificate_name_tr,
    (cc.expiry_date - CURRENT_DATE) as days_until_expiry
FROM candidate_certificates cc
JOIN candidate_profiles cp ON cc.candidate_id = cp.id
JOIN profiles p ON cp.id = p.id
JOIN certificate_type_names ctn ON cc.certificate_type = ctn.certificate_type
WHERE cc.expiry_date IS NOT NULL
AND cc.expiry_date <= CURRENT_DATE + INTERVAL '30 days'
AND cc.expiry_date >= CURRENT_DATE
ORDER BY cc.expiry_date;

COMMENT ON TABLE candidate_certificates IS 'Aday sertifikaları ve belgeleri';
COMMENT ON TABLE certificate_type_names IS 'Sertifika tiplerinin Türkçe/İngilizce isimleri ve metadata';
