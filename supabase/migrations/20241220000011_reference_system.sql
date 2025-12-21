-- =============================================
-- REFERANS SİSTEMİ
-- Migration: 20241220000011_reference_system.sql
-- =============================================

-- Referans talepleri tablosu
CREATE TABLE IF NOT EXISTS reference_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    experience_id UUID REFERENCES experiences(id) ON DELETE SET NULL,

    -- Referans kişi bilgileri
    referee_name TEXT NOT NULL,
    referee_title TEXT,                      -- Pozisyon/Ünvan
    referee_company TEXT,                    -- Çalıştığı şirket
    referee_phone TEXT,
    referee_email TEXT,
    referee_relationship TEXT,               -- 'manager', 'colleague', 'subordinate', 'other'

    -- Talep durumu
    status reference_status DEFAULT 'pending',
    request_sent_at TIMESTAMPTZ,
    request_method TEXT,                     -- 'email', 'sms', 'phone', 'whatsapp'
    reminder_count INTEGER DEFAULT 0,
    last_reminder_at TIMESTAMPTZ,

    -- Yanıt
    response_received_at TIMESTAMPTZ,
    verification_code TEXT,                  -- Doğrulama için benzersiz kod
    verification_code_expires_at TIMESTAMPTZ,

    -- Meta
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Referans yanıtları tablosu
CREATE TABLE IF NOT EXISTS reference_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_request_id UUID NOT NULL REFERENCES reference_requests(id) ON DELETE CASCADE UNIQUE,

    -- Değerlendirme puanları (1-5)
    overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5),
    work_quality_rating INTEGER CHECK (work_quality_rating BETWEEN 1 AND 5),
    reliability_rating INTEGER CHECK (reliability_rating BETWEEN 1 AND 5),
    teamwork_rating INTEGER CHECK (teamwork_rating BETWEEN 1 AND 5),
    communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 5),
    punctuality_rating INTEGER CHECK (punctuality_rating BETWEEN 1 AND 5),

    -- Metin değerlendirmeler
    strengths TEXT,                          -- Güçlü yönler
    areas_to_improve TEXT,                   -- Gelişim alanları
    additional_comments TEXT,

    -- Önemli sorular
    would_rehire BOOLEAN,                    -- Tekrar işe alır mısınız?
    left_on_good_terms BOOLEAN,              -- İyi ayrıldı mı?
    employment_verified BOOLEAN DEFAULT true, -- Çalışma doğrulandı mı?

    -- Çalışma dönemi doğrulama
    verified_start_date DATE,
    verified_end_date DATE,
    verified_position TEXT,

    -- Meta
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address TEXT,
    user_agent TEXT
);

-- Referans özet view'ı
CREATE OR REPLACE VIEW candidate_reference_summary AS
SELECT
    cp.id as candidate_id,
    COUNT(rr.id) as total_requests,
    COUNT(rr.id) FILTER (WHERE rr.status = 'verified') as verified_count,
    COUNT(rr.id) FILTER (WHERE rr.status = 'pending') as pending_count,
    AVG(res.overall_rating) as avg_overall_rating,
    AVG(res.work_quality_rating) as avg_work_quality,
    AVG(res.reliability_rating) as avg_reliability,
    AVG(res.teamwork_rating) as avg_teamwork,
    COUNT(res.id) FILTER (WHERE res.would_rehire = true) as would_rehire_count,
    COUNT(res.id) FILTER (WHERE res.would_rehire = false) as would_not_rehire_count
FROM candidate_profiles cp
LEFT JOIN reference_requests rr ON cp.id = rr.candidate_id
LEFT JOIN reference_responses res ON rr.id = res.reference_request_id
GROUP BY cp.id;

-- Indexler
CREATE INDEX IF NOT EXISTS idx_reference_requests_candidate ON reference_requests(candidate_id);
CREATE INDEX IF NOT EXISTS idx_reference_requests_experience ON reference_requests(experience_id);
CREATE INDEX IF NOT EXISTS idx_reference_requests_status ON reference_requests(status);
CREATE INDEX IF NOT EXISTS idx_reference_requests_code ON reference_requests(verification_code) WHERE verification_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_reference_responses_request ON reference_responses(reference_request_id);

-- RLS
ALTER TABLE reference_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reference_responses ENABLE ROW LEVEL SECURITY;

-- Adaylar kendi referanslarını yönetebilir
CREATE POLICY "Adaylar kendi referans taleplerini yönetebilir"
    ON reference_requests FOR ALL
    USING (candidate_id = auth.uid());

-- İşverenler doğrulanmış referansları görebilir
CREATE POLICY "İşverenler doğrulanmış referansları görebilir"
    ON reference_requests FOR SELECT
    USING (
        status = 'verified' AND
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('company', 'admin')
        )
    );

-- Referans yanıtları - aday ve işverenler görebilir
CREATE POLICY "Adaylar kendi referans yanıtlarını görebilir"
    ON reference_responses FOR SELECT
    USING (
        reference_request_id IN (
            SELECT id FROM reference_requests WHERE candidate_id = auth.uid()
        )
    );

CREATE POLICY "İşverenler doğrulanmış referans yanıtlarını görebilir"
    ON reference_responses FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM reference_requests rr
            WHERE rr.id = reference_responses.reference_request_id
            AND rr.status = 'verified'
        ) AND
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('company', 'admin')
        )
    );

-- Referans yanıtı ekleme (doğrulama kodu ile)
CREATE POLICY "Referans yanıtı eklenebilir"
    ON reference_responses FOR INSERT
    WITH CHECK (true);  -- Doğrulama kodu kontrolü uygulama tarafında yapılacak

-- Doğrulama kodu oluşturma fonksiyonu
CREATE OR REPLACE FUNCTION generate_reference_verification_code()
RETURNS TEXT AS $$
DECLARE
    v_code TEXT;
BEGIN
    v_code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
    RETURN v_code;
END;
$$ LANGUAGE plpgsql;

-- Referans talebi oluşturma fonksiyonu
CREATE OR REPLACE FUNCTION create_reference_request(
    p_candidate_id UUID,
    p_experience_id UUID,
    p_referee_name TEXT,
    p_referee_phone TEXT,
    p_referee_email TEXT,
    p_referee_title TEXT DEFAULT NULL,
    p_referee_company TEXT DEFAULT NULL,
    p_referee_relationship TEXT DEFAULT 'manager'
)
RETURNS UUID AS $$
DECLARE
    v_request_id UUID;
    v_code TEXT;
BEGIN
    -- Doğrulama kodu oluştur
    v_code := generate_reference_verification_code();

    INSERT INTO reference_requests (
        candidate_id,
        experience_id,
        referee_name,
        referee_phone,
        referee_email,
        referee_title,
        referee_company,
        referee_relationship,
        verification_code,
        verification_code_expires_at
    ) VALUES (
        p_candidate_id,
        p_experience_id,
        p_referee_name,
        p_referee_phone,
        p_referee_email,
        p_referee_title,
        p_referee_company,
        p_referee_relationship,
        v_code,
        NOW() + INTERVAL '7 days'
    )
    RETURNING id INTO v_request_id;

    RETURN v_request_id;
END;
$$ LANGUAGE plpgsql;

-- Referans doğrulama fonksiyonu
CREATE OR REPLACE FUNCTION verify_reference(
    p_verification_code TEXT,
    p_overall_rating INTEGER,
    p_work_quality_rating INTEGER,
    p_reliability_rating INTEGER,
    p_teamwork_rating INTEGER,
    p_communication_rating INTEGER,
    p_punctuality_rating INTEGER,
    p_would_rehire BOOLEAN,
    p_left_on_good_terms BOOLEAN,
    p_strengths TEXT DEFAULT NULL,
    p_areas_to_improve TEXT DEFAULT NULL,
    p_additional_comments TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_request_id UUID;
BEGIN
    -- Doğrulama kodunu kontrol et
    SELECT id INTO v_request_id
    FROM reference_requests
    WHERE verification_code = p_verification_code
    AND verification_code_expires_at > NOW()
    AND status = 'pending';

    IF NOT FOUND THEN
        RETURN false;
    END IF;

    -- Yanıtı kaydet
    INSERT INTO reference_responses (
        reference_request_id,
        overall_rating,
        work_quality_rating,
        reliability_rating,
        teamwork_rating,
        communication_rating,
        punctuality_rating,
        would_rehire,
        left_on_good_terms,
        employment_verified,
        strengths,
        areas_to_improve,
        additional_comments
    ) VALUES (
        v_request_id,
        p_overall_rating,
        p_work_quality_rating,
        p_reliability_rating,
        p_teamwork_rating,
        p_communication_rating,
        p_punctuality_rating,
        p_would_rehire,
        p_left_on_good_terms,
        true,
        p_strengths,
        p_areas_to_improve,
        p_additional_comments
    );

    -- Talebi güncelle
    UPDATE reference_requests
    SET status = 'verified',
        response_received_at = NOW(),
        updated_at = NOW()
    WHERE id = v_request_id;

    -- Deneyimdeki referans durumunu güncelle
    UPDATE experiences
    SET reference_status = 'verified',
        reference_verified_at = NOW()
    WHERE id = (SELECT experience_id FROM reference_requests WHERE id = v_request_id);

    RETURN true;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE reference_requests IS 'Aday referans talepleri';
COMMENT ON TABLE reference_responses IS 'Referans kişilerden gelen yanıtlar';
