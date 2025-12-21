-- =============================================
-- İLAN YAN HAKLARI
-- Migration: 20241220000007_job_benefits.sql
-- =============================================

-- Yan hak tipleri
CREATE TYPE benefit_type AS ENUM (
    -- Yemek & İçecek
    'meal_all',              -- Tüm öğünler
    'meal_shift',            -- Vardiya yemeği
    'meal_discount',         -- İndirimli yemek
    'free_drinks',           -- Ücretsiz içecek

    -- Ulaşım
    'transport_provided',    -- Servis
    'transport_allowance',   -- Yol parası
    'parking',               -- Otopark

    -- Konaklama
    'accommodation',         -- Konaklama
    'accommodation_subsidy', -- Konaklama yardımı

    -- Mali Haklar
    'insurance',             -- SGK
    'private_health',        -- Özel sağlık sigortası
    'bonus',                 -- Prim/Bonus
    'tip_share',             -- Bahşiş payı
    'overtime_pay',          -- Fazla mesai ücreti
    'holiday_bonus',         -- Bayram ikramiyesi
    '13th_salary',           -- 13. maaş

    -- Kıyafet
    'uniform_provided',      -- Üniforma verilir
    'uniform_allowance',     -- Kıyafet yardımı
    'laundry',               -- Kuru temizleme

    -- Eğitim & Gelişim
    'training',              -- Eğitim imkanı
    'career_growth',         -- Kariyer gelişimi
    'certification_support', -- Sertifika desteği

    -- Diğer
    'staff_discount',        -- Personel indirimi
    'flexible_schedule',     -- Esnek çalışma
    'phone_allowance',       -- Telefon hattı
    'birthday_off',          -- Doğum günü izni
    'extra_leave'            -- Ek izin
);

-- Yan haklar tablosu
CREATE TABLE IF NOT EXISTS job_benefits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    benefit_type benefit_type NOT NULL,
    description TEXT,                        -- Ek açıklama
    value_amount NUMERIC(10,2),              -- Parasal değer (varsa)
    value_type TEXT,                         -- 'monthly', 'daily', 'one_time'
    is_highlighted BOOLEAN DEFAULT false,    -- Öne çıkan yan hak
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(job_id, benefit_type)
);

-- Yan hak isimleri
CREATE TABLE IF NOT EXISTS benefit_type_names (
    benefit_type benefit_type PRIMARY KEY,
    name_tr TEXT NOT NULL,
    name_en TEXT NOT NULL,
    icon TEXT,
    category TEXT NOT NULL,                  -- 'meal', 'transport', 'accommodation', 'financial', 'clothing', 'development', 'other'
    description TEXT,
    display_order INTEGER DEFAULT 0
);

INSERT INTO benefit_type_names (benefit_type, name_tr, name_en, icon, category, display_order) VALUES
    -- Yemek
    ('meal_all', 'Tüm Öğünler', 'All Meals', '🍽️', 'meal', 1),
    ('meal_shift', 'Vardiya Yemeği', 'Shift Meal', '🍲', 'meal', 2),
    ('meal_discount', 'İndirimli Yemek', 'Discounted Meal', '🏷️', 'meal', 3),
    ('free_drinks', 'Ücretsiz İçecek', 'Free Drinks', '☕', 'meal', 4),

    -- Ulaşım
    ('transport_provided', 'Servis', 'Transport Provided', '🚐', 'transport', 10),
    ('transport_allowance', 'Yol Parası', 'Transport Allowance', '💵', 'transport', 11),
    ('parking', 'Otopark', 'Parking', '🅿️', 'transport', 12),

    -- Konaklama
    ('accommodation', 'Konaklama', 'Accommodation', '🏠', 'accommodation', 20),
    ('accommodation_subsidy', 'Konaklama Yardımı', 'Accommodation Subsidy', '💰', 'accommodation', 21),

    -- Mali
    ('insurance', 'SGK', 'Social Insurance', '🏥', 'financial', 30),
    ('private_health', 'Özel Sağlık Sigortası', 'Private Health Insurance', '💊', 'financial', 31),
    ('bonus', 'Prim/Bonus', 'Bonus', '💎', 'financial', 32),
    ('tip_share', 'Bahşiş', 'Tip Share', '💵', 'financial', 33),
    ('overtime_pay', 'Fazla Mesai Ücreti', 'Overtime Pay', '⏰', 'financial', 34),
    ('holiday_bonus', 'Bayram İkramiyesi', 'Holiday Bonus', '🎁', 'financial', 35),
    ('13th_salary', '13. Maaş', '13th Month Salary', '💰', 'financial', 36),

    -- Kıyafet
    ('uniform_provided', 'Üniforma Verilir', 'Uniform Provided', '👔', 'clothing', 40),
    ('uniform_allowance', 'Kıyafet Yardımı', 'Clothing Allowance', '👕', 'clothing', 41),
    ('laundry', 'Kuru Temizleme', 'Laundry', '🧺', 'clothing', 42),

    -- Gelişim
    ('training', 'Eğitim İmkanı', 'Training', '📚', 'development', 50),
    ('career_growth', 'Kariyer Gelişimi', 'Career Growth', '📈', 'development', 51),
    ('certification_support', 'Sertifika Desteği', 'Certification Support', '🎓', 'development', 52),

    -- Diğer
    ('staff_discount', 'Personel İndirimi', 'Staff Discount', '🏷️', 'other', 60),
    ('flexible_schedule', 'Esnek Çalışma', 'Flexible Schedule', '⏳', 'other', 61),
    ('phone_allowance', 'Telefon Hattı', 'Phone Allowance', '📱', 'other', 62),
    ('birthday_off', 'Doğum Günü İzni', 'Birthday Off', '🎂', 'other', 63),
    ('extra_leave', 'Ek İzin', 'Extra Leave', '🏖️', 'other', 64)
ON CONFLICT (benefit_type) DO UPDATE SET
    name_tr = EXCLUDED.name_tr,
    name_en = EXCLUDED.name_en,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    display_order = EXCLUDED.display_order;

-- Indexler
CREATE INDEX IF NOT EXISTS idx_job_benefits_job ON job_benefits(job_id);
CREATE INDEX IF NOT EXISTS idx_job_benefits_type ON job_benefits(benefit_type);
CREATE INDEX IF NOT EXISTS idx_job_benefits_highlighted ON job_benefits(is_highlighted) WHERE is_highlighted = true;

-- RLS
ALTER TABLE job_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE benefit_type_names ENABLE ROW LEVEL SECURITY;

CREATE POLICY "İş yan hakları herkese görünür"
    ON job_benefits FOR SELECT
    USING (true);

CREATE POLICY "Şirketler kendi ilanlarının yan haklarını yönetebilir"
    ON job_benefits FOR ALL
    USING (
        job_id IN (
            SELECT id FROM jobs WHERE company_id IN (
                SELECT id FROM companies WHERE owner_id = auth.uid()
            )
        )
    );

CREATE POLICY "Yan hak tipleri herkese görünür"
    ON benefit_type_names FOR SELECT
    USING (true);

-- İlan için toplu yan hak ekleme fonksiyonu
CREATE OR REPLACE FUNCTION add_job_benefits(
    p_job_id UUID,
    p_benefits benefit_type[]
)
RETURNS VOID AS $$
BEGIN
    -- Mevcut yan hakları sil
    DELETE FROM job_benefits WHERE job_id = p_job_id;

    -- Yeni yan hakları ekle
    INSERT INTO job_benefits (job_id, benefit_type)
    SELECT p_job_id, unnest(p_benefits);
END;
$$ LANGUAGE plpgsql;

-- İlanın yan haklarını getir
CREATE OR REPLACE FUNCTION get_job_benefits_display(p_job_id UUID)
RETURNS TABLE (
    benefit_type benefit_type,
    name_tr TEXT,
    icon TEXT,
    description TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT jb.benefit_type, btn.name_tr, btn.icon, jb.description
    FROM job_benefits jb
    JOIN benefit_type_names btn ON jb.benefit_type = btn.benefit_type
    WHERE jb.job_id = p_job_id
    ORDER BY btn.display_order;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE job_benefits IS 'İlan yan hakları';
COMMENT ON TABLE benefit_type_names IS 'Yan hak tiplerinin isimleri ve ikonları';
