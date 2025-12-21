-- =============================================
-- ADAY DENEYİMLERİ (GENİŞLETİLMİŞ)
-- Migration: 20241220000003_candidate_experiences.sql
-- =============================================

-- Mevcut experiences tablosunu kontrol et, yoksa oluştur
CREATE TABLE IF NOT EXISTS experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Yeni alanları ekle
ALTER TABLE experiences
ADD COLUMN IF NOT EXISTS company_name TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS position_title TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS position_type job_position_type,
ADD COLUMN IF NOT EXISTS venue_type venue_type,
ADD COLUMN IF NOT EXISTS cuisine_types cuisine_type[],
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS district TEXT,
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE,                          -- NULL = Hala çalışıyor
ADD COLUMN IF NOT EXISTS is_current BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS responsibilities TEXT[],                -- Görevler listesi
ADD COLUMN IF NOT EXISTS achievements TEXT[],                    -- Başarılar
ADD COLUMN IF NOT EXISTS team_size INTEGER,                      -- Ekip büyüklüğü
ADD COLUMN IF NOT EXISTS monthly_covers INTEGER,                 -- Aylık servis edilen müşteri sayısı
ADD COLUMN IF NOT EXISTS salary_at_leave INTEGER,                -- Ayrılırken maaş (opsiyonel)
ADD COLUMN IF NOT EXISTS leaving_reason TEXT,                    -- Ayrılma nedeni
ADD COLUMN IF NOT EXISTS reference_name TEXT,                    -- Referans kişi adı
ADD COLUMN IF NOT EXISTS reference_title TEXT,                   -- Referans kişi pozisyonu
ADD COLUMN IF NOT EXISTS reference_phone TEXT,                   -- Referans telefon
ADD COLUMN IF NOT EXISTS reference_email TEXT,                   -- Referans email
ADD COLUMN IF NOT EXISTS reference_status reference_status DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS reference_verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS can_contact_reference BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Default constraint kaldır (sadece migration için eklenmişti)
ALTER TABLE experiences ALTER COLUMN company_name DROP DEFAULT;
ALTER TABLE experiences ALTER COLUMN position_title DROP DEFAULT;

-- Deneyim detayları için ek tablo (mutfak/bar deneyimleri)
CREATE TABLE IF NOT EXISTS experience_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experience_id UUID NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
    detail_type TEXT NOT NULL,               -- 'menu_item', 'technique', 'equipment', 'software'
    detail_value TEXT NOT NULL,
    proficiency_level INTEGER DEFAULT 3,     -- 1-5 arası
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Örnek: Aşçı için hazırladığı yemekler, barista için makineler, vb.

-- Indexler
CREATE INDEX IF NOT EXISTS idx_experiences_candidate ON experiences(candidate_id);
CREATE INDEX IF NOT EXISTS idx_experiences_position_type ON experiences(position_type);
CREATE INDEX IF NOT EXISTS idx_experiences_dates ON experiences(start_date DESC, end_date DESC);
CREATE INDEX IF NOT EXISTS idx_experiences_current ON experiences(is_current) WHERE is_current = true;
CREATE INDEX IF NOT EXISTS idx_experience_details_exp ON experience_details(experience_id);

-- RLS
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience_details ENABLE ROW LEVEL SECURITY;

-- Deneyim RLS politikaları
DROP POLICY IF EXISTS "Adaylar kendi deneyimlerini yönetebilir" ON experiences;
CREATE POLICY "Adaylar kendi deneyimlerini yönetebilir"
    ON experiences FOR ALL
    USING (candidate_id = auth.uid());

DROP POLICY IF EXISTS "Deneyimler herkese görünür" ON experiences;
CREATE POLICY "Deneyimler herkese görünür"
    ON experiences FOR SELECT
    USING (true);

-- Deneyim detayları RLS
DROP POLICY IF EXISTS "Adaylar kendi deneyim detaylarını yönetebilir" ON experience_details;
CREATE POLICY "Adaylar kendi deneyim detaylarını yönetebilir"
    ON experience_details FOR ALL
    USING (
        experience_id IN (
            SELECT id FROM experiences WHERE candidate_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Deneyim detayları herkese görünür" ON experience_details;
CREATE POLICY "Deneyim detayları herkese görünür"
    ON experience_details FOR SELECT
    USING (true);

-- Deneyim yılı hesaplama fonksiyonu
CREATE OR REPLACE FUNCTION calculate_total_experience_years(p_candidate_id UUID)
RETURNS NUMERIC AS $$
DECLARE
    total_months INTEGER := 0;
    exp_record RECORD;
BEGIN
    FOR exp_record IN
        SELECT start_date, COALESCE(end_date, CURRENT_DATE) as end_date
        FROM experiences
        WHERE candidate_id = p_candidate_id
        ORDER BY start_date
    LOOP
        total_months := total_months +
            (EXTRACT(YEAR FROM exp_record.end_date) - EXTRACT(YEAR FROM exp_record.start_date)) * 12 +
            (EXTRACT(MONTH FROM exp_record.end_date) - EXTRACT(MONTH FROM exp_record.start_date));
    END LOOP;

    RETURN ROUND(total_months / 12.0, 1);
END;
$$ LANGUAGE plpgsql;

-- Trigger: Deneyim eklendiğinde/güncellendiğinde toplam yılı güncelle
CREATE OR REPLACE FUNCTION update_candidate_experience_years()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE candidate_profiles
    SET experience_years = calculate_total_experience_years(
        COALESCE(NEW.candidate_id, OLD.candidate_id)
    ),
    updated_at = NOW()
    WHERE id = COALESCE(NEW.candidate_id, OLD.candidate_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_experience_years_trigger ON experiences;
CREATE TRIGGER update_experience_years_trigger
    AFTER INSERT OR UPDATE OR DELETE ON experiences
    FOR EACH ROW EXECUTE FUNCTION update_candidate_experience_years();

COMMENT ON TABLE experiences IS 'Aday iş deneyimleri - hizmet sektörüne özel alanlarla';
COMMENT ON TABLE experience_details IS 'Deneyim detayları - teknik beceriler, kullanılan ekipmanlar';
