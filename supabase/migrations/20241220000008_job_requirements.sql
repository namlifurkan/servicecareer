-- =============================================
-- İLAN GEREKSİNİMLERİ
-- Migration: 20241220000008_job_requirements.sql
-- =============================================

-- İş gereksinimleri tablosu
CREATE TABLE IF NOT EXISTS job_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,

    -- Sertifika gereksinimleri
    required_certificates certificate_type[],
    preferred_certificates certificate_type[],

    -- Yetenek gereksinimleri
    required_skill_ids UUID[],               -- skills tablosundan
    preferred_skill_ids UUID[],

    -- Mutfak/mekan deneyimi
    required_cuisine_experience cuisine_type[],
    required_venue_experience venue_type[],

    -- Dil gereksinimleri
    required_languages JSONB,                -- [{"code": "en", "level": "B1"}, ...]

    -- Fiziksel gereksinimler
    requires_heavy_lifting BOOLEAN DEFAULT false,
    requires_standing_long BOOLEAN DEFAULT true,
    requires_night_vision BOOLEAN DEFAULT false,   -- Loş ortam (bar/gece kulübü)

    -- Araç gereksinimleri (kurye için)
    vehicle_required BOOLEAN DEFAULT false,
    accepted_vehicle_types vehicle_type[],
    own_vehicle_required BOOLEAN DEFAULT false,

    -- Diğer
    requires_references BOOLEAN DEFAULT false,
    min_references INTEGER DEFAULT 0,
    requires_portfolio BOOLEAN DEFAULT false,      -- Pastacı, barmen vb.
    requires_trial BOOLEAN DEFAULT false,          -- Deneme günü zorunlu mu
    trial_is_paid BOOLEAN DEFAULT true,

    -- Özel notlar
    additional_requirements TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(job_id)
);

-- İlan aranan özellikler (madde madde)
CREATE TABLE IF NOT EXISTS job_requirement_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    requirement_text TEXT NOT NULL,          -- "Fine dining deneyimi"
    is_required BOOLEAN DEFAULT true,        -- Zorunlu mu, tercih mi
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- İlanın tercih ettiği yetenekleri sakla (çoka-çok ilişki)
CREATE TABLE IF NOT EXISTS job_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    is_required BOOLEAN DEFAULT false,       -- Zorunlu mu tercih mi
    min_proficiency INTEGER DEFAULT 1 CHECK (min_proficiency BETWEEN 1 AND 5),
    min_years NUMERIC(3,1) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(job_id, skill_id)
);

-- İlanın dil gereksinimleri
CREATE TABLE IF NOT EXISTS job_languages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    language_code TEXT NOT NULL,             -- 'en', 'de', 'ar'
    language_name TEXT NOT NULL,             -- 'İngilizce'
    min_level TEXT NOT NULL,                 -- 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'
    is_required BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(job_id, language_code)
);

-- Indexler
CREATE INDEX IF NOT EXISTS idx_job_requirements_job ON job_requirements(job_id);
CREATE INDEX IF NOT EXISTS idx_job_requirements_certs ON job_requirements USING GIN(required_certificates);
CREATE INDEX IF NOT EXISTS idx_job_requirement_items_job ON job_requirement_items(job_id);
CREATE INDEX IF NOT EXISTS idx_job_skills_job ON job_skills(job_id);
CREATE INDEX IF NOT EXISTS idx_job_skills_skill ON job_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_job_languages_job ON job_languages(job_id);

-- RLS
ALTER TABLE job_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_requirement_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_languages ENABLE ROW LEVEL SECURITY;

-- SELECT herkes görebilir
CREATE POLICY "İş gereksinimleri herkese görünür" ON job_requirements FOR SELECT USING (true);
CREATE POLICY "İş gereksinim maddeleri herkese görünür" ON job_requirement_items FOR SELECT USING (true);
CREATE POLICY "İş yetenekleri herkese görünür" ON job_skills FOR SELECT USING (true);
CREATE POLICY "İş dilleri herkese görünür" ON job_languages FOR SELECT USING (true);

-- Şirketler kendi ilanlarını yönetebilir
CREATE POLICY "Şirketler kendi ilanlarının gereksinimlerini yönetebilir"
    ON job_requirements FOR ALL
    USING (
        job_id IN (
            SELECT id FROM jobs WHERE company_id IN (
                SELECT id FROM companies WHERE owner_id = auth.uid()
            )
        )
    );

CREATE POLICY "Şirketler kendi ilanlarının gereksinim maddelerini yönetebilir"
    ON job_requirement_items FOR ALL
    USING (
        job_id IN (
            SELECT id FROM jobs WHERE company_id IN (
                SELECT id FROM companies WHERE owner_id = auth.uid()
            )
        )
    );

CREATE POLICY "Şirketler kendi ilanlarının yeteneklerini yönetebilir"
    ON job_skills FOR ALL
    USING (
        job_id IN (
            SELECT id FROM jobs WHERE company_id IN (
                SELECT id FROM companies WHERE owner_id = auth.uid()
            )
        )
    );

CREATE POLICY "Şirketler kendi ilanlarının dillerini yönetebilir"
    ON job_languages FOR ALL
    USING (
        job_id IN (
            SELECT id FROM jobs WHERE company_id IN (
                SELECT id FROM companies WHERE owner_id = auth.uid()
            )
        )
    );

-- Aday uygunluk kontrolü fonksiyonu
CREATE OR REPLACE FUNCTION check_candidate_job_match(
    p_candidate_id UUID,
    p_job_id UUID
)
RETURNS TABLE (
    match_score INTEGER,                     -- 0-100 arası
    missing_required_certs certificate_type[],
    missing_required_skills UUID[],
    missing_languages TEXT[],
    experience_match BOOLEAN,
    has_required_vehicle BOOLEAN
) AS $$
DECLARE
    v_job jobs%ROWTYPE;
    v_req job_requirements%ROWTYPE;
    v_candidate candidate_profiles%ROWTYPE;
    v_score INTEGER := 0;
    v_missing_certs certificate_type[] := '{}';
    v_missing_skills UUID[] := '{}';
    v_missing_langs TEXT[] := '{}';
    v_exp_match BOOLEAN := true;
    v_vehicle_ok BOOLEAN := true;
BEGIN
    -- İlan ve gereksinimlerini al
    SELECT * INTO v_job FROM jobs WHERE id = p_job_id;
    SELECT * INTO v_req FROM job_requirements WHERE job_id = p_job_id;
    SELECT * INTO v_candidate FROM candidate_profiles WHERE id = p_candidate_id;

    IF NOT FOUND THEN
        RETURN;
    END IF;

    -- Deneyim kontrolü
    IF v_job.service_experience_required IS NOT NULL THEN
        -- Basit deneyim karşılaştırması
        v_exp_match := true; -- Detaylı kontrol eklenebilir
        IF v_exp_match THEN
            v_score := v_score + 25;
        END IF;
    ELSE
        v_score := v_score + 25;
    END IF;

    -- Sertifika kontrolü
    IF v_req.required_certificates IS NOT NULL THEN
        SELECT array_agg(rc)
        INTO v_missing_certs
        FROM unnest(v_req.required_certificates) rc
        WHERE NOT EXISTS (
            SELECT 1 FROM candidate_certificates cc
            WHERE cc.candidate_id = p_candidate_id
            AND cc.certificate_type = rc
            AND (cc.expiry_date IS NULL OR cc.expiry_date > CURRENT_DATE)
        );

        IF array_length(v_missing_certs, 1) IS NULL OR array_length(v_missing_certs, 1) = 0 THEN
            v_score := v_score + 25;
            v_missing_certs := '{}';
        END IF;
    ELSE
        v_score := v_score + 25;
    END IF;

    -- Yetenek kontrolü
    SELECT array_agg(js.skill_id)
    INTO v_missing_skills
    FROM job_skills js
    WHERE js.job_id = p_job_id
    AND js.is_required = true
    AND NOT EXISTS (
        SELECT 1 FROM candidate_skills cs
        WHERE cs.candidate_id = p_candidate_id
        AND cs.skill_id = js.skill_id
        AND cs.proficiency_level >= js.min_proficiency
    );

    IF array_length(v_missing_skills, 1) IS NULL OR array_length(v_missing_skills, 1) = 0 THEN
        v_score := v_score + 25;
        v_missing_skills := '{}';
    END IF;

    -- Dil kontrolü
    SELECT array_agg(jl.language_code)
    INTO v_missing_langs
    FROM job_languages jl
    WHERE jl.job_id = p_job_id
    AND jl.is_required = true
    AND NOT EXISTS (
        SELECT 1 FROM candidate_languages cl
        WHERE cl.candidate_id = p_candidate_id
        AND cl.language_code = jl.language_code
        -- Seviye karşılaştırması basitleştirildi
    );

    IF array_length(v_missing_langs, 1) IS NULL OR array_length(v_missing_langs, 1) = 0 THEN
        v_score := v_score + 15;
        v_missing_langs := '{}';
    END IF;

    -- Araç kontrolü
    IF v_req.vehicle_required THEN
        SELECT EXISTS (
            SELECT 1 FROM candidate_vehicle_info cvi
            WHERE cvi.candidate_id = p_candidate_id
            AND cvi.vehicle_type = ANY(v_req.accepted_vehicle_types)
        ) INTO v_vehicle_ok;

        IF v_vehicle_ok THEN
            v_score := v_score + 10;
        END IF;
    ELSE
        v_score := v_score + 10;
        v_vehicle_ok := true;
    END IF;

    RETURN QUERY SELECT
        v_score,
        v_missing_certs,
        v_missing_skills,
        v_missing_langs,
        v_exp_match,
        v_vehicle_ok;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE job_requirements IS 'İlan ana gereksinimleri';
COMMENT ON TABLE job_requirement_items IS 'İlan gereksinim maddeleri (metin olarak)';
COMMENT ON TABLE job_skills IS 'İlan yetenek gereksinimleri';
COMMENT ON TABLE job_languages IS 'İlan dil gereksinimleri';
