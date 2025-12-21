-- =============================================
-- GENİŞLETİLMİŞ ADAY PROFİLLERİ
-- Migration: 20241220000002_extended_candidate_profiles.sql
-- =============================================

-- Mevcut candidate_profiles tablosunu genişlet
ALTER TABLE candidate_profiles
ADD COLUMN IF NOT EXISTS headline TEXT,                          -- Kısa başlık: "Deneyimli Garson"
ADD COLUMN IF NOT EXISTS position_types job_position_type[],     -- Tercih edilen pozisyonlar
ADD COLUMN IF NOT EXISTS venue_types venue_type[],               -- Tercih edilen mekan tipleri
ADD COLUMN IF NOT EXISTS cuisine_specialties cuisine_type[],     -- Mutfak uzmanlıkları (aşçılar için)
ADD COLUMN IF NOT EXISTS service_experience service_experience_level DEFAULT 'no_experience',
ADD COLUMN IF NOT EXISTS shift_preferences shift_type[],         -- Vardiya tercihleri
ADD COLUMN IF NOT EXISTS working_days_preference working_days,   -- Çalışma günü tercihi
ADD COLUMN IF NOT EXISTS district TEXT,                          -- İlçe
ADD COLUMN IF NOT EXISTS nationality TEXT DEFAULT 'TR',          -- Uyruk
ADD COLUMN IF NOT EXISTS military_status TEXT,                   -- Askerlik durumu
ADD COLUMN IF NOT EXISTS marital_status TEXT,                    -- Medeni durum
ADD COLUMN IF NOT EXISTS has_health_certificate BOOLEAN DEFAULT false,  -- Sağlık karnesi var mı
ADD COLUMN IF NOT EXISTS health_certificate_expiry DATE,         -- Sağlık karnesi geçerlilik
ADD COLUMN IF NOT EXISTS has_hygiene_certificate BOOLEAN DEFAULT false, -- Hijyen sertifikası var mı
ADD COLUMN IF NOT EXISTS smoking_status TEXT,                    -- Sigara: 'yes', 'no', 'social'
ADD COLUMN IF NOT EXISTS available_from DATE,                    -- Ne zaman başlayabilir
ADD COLUMN IF NOT EXISTS notice_period INTEGER DEFAULT 0,        -- İhbar süresi (gün)
ADD COLUMN IF NOT EXISTS profile_completion_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS profile_views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS featured_until TIMESTAMPTZ;

-- Kurye bilgileri için ayrı tablo
CREATE TABLE IF NOT EXISTS candidate_vehicle_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    vehicle_type vehicle_type NOT NULL,
    vehicle_brand TEXT,                      -- Marka
    vehicle_model TEXT,                      -- Model
    vehicle_year INTEGER,                    -- Yıl
    license_plate TEXT,                      -- Plaka (opsiyonel)
    has_driver_license BOOLEAN DEFAULT false,
    driver_license_class TEXT,               -- A, A2, B, vb.
    driver_license_expiry DATE,
    has_src_certificate BOOLEAN DEFAULT false, -- SRC belgesi
    src_certificate_type TEXT,               -- SRC1, SRC2, vb.
    insurance_valid_until DATE,              -- Sigorta geçerliliği
    is_own_vehicle BOOLEAN DEFAULT true,     -- Kendi aracı mı
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(candidate_id, vehicle_type)
);

-- Aday dil bilgileri
CREATE TABLE IF NOT EXISTS candidate_languages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    language_code TEXT NOT NULL,             -- 'en', 'de', 'ar', vb.
    language_name TEXT NOT NULL,             -- 'İngilizce', 'Almanca', vb.
    speaking_level TEXT NOT NULL,            -- 'A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'native'
    reading_level TEXT,
    writing_level TEXT,
    has_certificate BOOLEAN DEFAULT false,
    certificate_name TEXT,                   -- 'TOEFL', 'IELTS', vb.
    certificate_score TEXT,                  -- '90', '7.5', vb.
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(candidate_id, language_code)
);

-- Aday tercihleri
CREATE TABLE IF NOT EXISTS candidate_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE UNIQUE,

    -- Maaş tercihleri
    salary_expectation_min INTEGER,
    salary_expectation_max INTEGER,
    salary_payment_type salary_payment_type DEFAULT 'monthly',
    tip_expectation TEXT,                    -- 'required', 'preferred', 'not_important'

    -- Yan hak tercihleri
    requires_meal BOOLEAN DEFAULT false,
    requires_transport BOOLEAN DEFAULT false,
    requires_insurance BOOLEAN DEFAULT true,
    requires_accommodation BOOLEAN DEFAULT false,

    -- Konum tercihleri
    preferred_cities TEXT[],
    preferred_districts TEXT[],
    max_commute_minutes INTEGER DEFAULT 60,

    -- Çalışma tercihleri
    preferred_work_types work_type[],
    preferred_shifts shift_type[],
    can_work_weekends BOOLEAN DEFAULT true,
    can_work_holidays BOOLEAN DEFAULT false,
    can_work_nights BOOLEAN DEFAULT false,

    -- İletişim tercihleri
    contact_by_phone BOOLEAN DEFAULT true,
    contact_by_whatsapp BOOLEAN DEFAULT true,
    contact_by_email BOOLEAN DEFAULT true,
    best_contact_time TEXT,                  -- 'morning', 'afternoon', 'evening', 'anytime'

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexler
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_position_types ON candidate_profiles USING GIN(position_types);
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_venue_types ON candidate_profiles USING GIN(venue_types);
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_city ON candidate_profiles(city);
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_experience ON candidate_profiles(service_experience);
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_active ON candidate_profiles(is_open_to_work, last_active_at DESC);
CREATE INDEX IF NOT EXISTS idx_candidate_vehicle_candidate ON candidate_vehicle_info(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_languages_candidate ON candidate_languages(candidate_id);

-- RLS
ALTER TABLE candidate_vehicle_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_preferences ENABLE ROW LEVEL SECURITY;

-- Araç bilgileri RLS
CREATE POLICY "Adaylar kendi araç bilgilerini yönetebilir"
    ON candidate_vehicle_info FOR ALL
    USING (candidate_id = auth.uid());

CREATE POLICY "İşverenler aday araç bilgilerini görebilir"
    ON candidate_vehicle_info FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('company', 'admin')
        )
    );

-- Dil bilgileri RLS
CREATE POLICY "Adaylar kendi dil bilgilerini yönetebilir"
    ON candidate_languages FOR ALL
    USING (candidate_id = auth.uid());

CREATE POLICY "Dil bilgileri herkese görünür"
    ON candidate_languages FOR SELECT
    USING (true);

-- Tercihler RLS
CREATE POLICY "Adaylar kendi tercihlerini yönetebilir"
    ON candidate_preferences FOR ALL
    USING (candidate_id = auth.uid());

CREATE POLICY "İşverenler aday tercihlerini görebilir"
    ON candidate_preferences FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('company', 'admin')
        )
    );

-- Profil tamamlama yüzdesi hesaplama fonksiyonu
CREATE OR REPLACE FUNCTION calculate_candidate_profile_completion(p_candidate_id UUID)
RETURNS INTEGER AS $$
DECLARE
    completion INTEGER := 0;
    v_profile candidate_profiles%ROWTYPE;
    v_exp_count INTEGER;
    v_cert_count INTEGER;
    v_skill_count INTEGER;
BEGIN
    SELECT * INTO v_profile FROM candidate_profiles WHERE id = p_candidate_id;

    IF NOT FOUND THEN
        RETURN 0;
    END IF;

    -- Temel bilgiler (40%)
    IF v_profile.title IS NOT NULL THEN completion := completion + 5; END IF;
    IF v_profile.bio IS NOT NULL AND LENGTH(v_profile.bio) > 50 THEN completion := completion + 10; END IF;
    IF v_profile.date_of_birth IS NOT NULL THEN completion := completion + 5; END IF;
    IF v_profile.city IS NOT NULL THEN completion := completion + 5; END IF;
    IF v_profile.position_types IS NOT NULL AND array_length(v_profile.position_types, 1) > 0 THEN completion := completion + 10; END IF;
    IF v_profile.service_experience IS NOT NULL THEN completion := completion + 5; END IF;

    -- Deneyim (25%)
    SELECT COUNT(*) INTO v_exp_count FROM experiences WHERE candidate_id = p_candidate_id;
    IF v_exp_count >= 1 THEN completion := completion + 15; END IF;
    IF v_exp_count >= 2 THEN completion := completion + 10; END IF;

    -- Sertifikalar (20%)
    SELECT COUNT(*) INTO v_cert_count FROM candidate_certificates WHERE candidate_id = p_candidate_id;
    IF v_cert_count >= 1 THEN completion := completion + 10; END IF;
    IF v_cert_count >= 2 THEN completion := completion + 5; END IF;
    IF v_profile.has_hygiene_certificate THEN completion := completion + 5; END IF;

    -- Yetenekler (15%)
    SELECT COUNT(*) INTO v_skill_count FROM candidate_skills WHERE candidate_id = p_candidate_id;
    IF v_skill_count >= 3 THEN completion := completion + 10; END IF;
    IF v_skill_count >= 5 THEN completion := completion + 5; END IF;

    RETURN LEAST(completion, 100);
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE candidate_vehicle_info IS 'Kurye adayları için araç bilgileri';
COMMENT ON TABLE candidate_languages IS 'Aday dil bilgileri ve seviyeleri';
COMMENT ON TABLE candidate_preferences IS 'Aday iş tercihleri ve beklentileri';
