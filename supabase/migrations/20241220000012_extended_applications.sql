-- =============================================
-- GENİŞLETİLMİŞ BAŞVURU SİSTEMİ
-- Migration: 20241220000012_extended_applications.sql
-- =============================================

-- Mevcut applications tablosunu genişlet
ALTER TABLE applications
ADD COLUMN IF NOT EXISTS status_new application_status DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'platform',         -- 'platform', 'quick_apply', 'guest', 'invited', 'referral'
ADD COLUMN IF NOT EXISTS is_guest BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS match_score INTEGER,                    -- 0-100 arası uygunluk puanı
ADD COLUMN IF NOT EXISTS employer_rating INTEGER CHECK (employer_rating BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS employer_notes TEXT,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS interview_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS interview_location TEXT,
ADD COLUMN IF NOT EXISTS interview_notes TEXT,
ADD COLUMN IF NOT EXISTS trial_date DATE,
ADD COLUMN IF NOT EXISTS trial_shift shift_type,
ADD COLUMN IF NOT EXISTS trial_result TEXT,                      -- 'passed', 'failed', 'pending'
ADD COLUMN IF NOT EXISTS offer_salary INTEGER,
ADD COLUMN IF NOT EXISTS offer_start_date DATE,
ADD COLUMN IF NOT EXISTS offer_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS offer_response TEXT,                    -- 'accepted', 'rejected', 'negotiating'
ADD COLUMN IF NOT EXISTS offer_response_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS hired_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS withdrawn_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS withdrawn_reason TEXT,
ADD COLUMN IF NOT EXISTS last_status_change_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT false;      -- İşveren favorisi

-- Misafir başvuruları için genişletilmiş tablo
CREATE TABLE IF NOT EXISTS guest_application_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,

    -- Kişisel bilgiler
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    age INTEGER,
    gender TEXT,
    city TEXT,
    district TEXT,

    -- Deneyim bilgisi
    experience_level service_experience_level,
    experience_years INTEGER,
    previous_positions job_position_type[],
    previous_venues venue_type[],

    -- Belge durumu
    has_health_certificate BOOLEAN DEFAULT false,
    has_hygiene_certificate BOOLEAN DEFAULT false,
    has_driver_license BOOLEAN DEFAULT false,
    driver_license_class TEXT,

    -- İletişim tercihleri
    can_call BOOLEAN DEFAULT true,
    can_whatsapp BOOLEAN DEFAULT true,
    best_call_time TEXT,

    -- Ek bilgiler
    available_from DATE,
    salary_expectation INTEGER,
    note TEXT,

    -- Doğrulama
    phone_verified BOOLEAN DEFAULT false,
    phone_verified_at TIMESTAMPTZ,
    ip_address TEXT,
    user_agent TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Başvuru geçmişi (status değişiklikleri)
CREATE TABLE IF NOT EXISTS application_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    old_status application_status,
    new_status application_status NOT NULL,
    changed_by UUID REFERENCES profiles(id),
    change_reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Başvuru mesajları (aday-işveren iletişimi)
CREATE TABLE IF NOT EXISTS application_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id),
    sender_type TEXT NOT NULL,               -- 'candidate', 'employer'
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Başvuru istatistikleri view'ı
CREATE OR REPLACE VIEW job_application_stats AS
SELECT
    j.id as job_id,
    j.title,
    j.company_id,
    COUNT(a.id) as total_applications,
    COUNT(a.id) FILTER (WHERE a.status_new = 'pending') as pending_count,
    COUNT(a.id) FILTER (WHERE a.status_new = 'viewed') as viewed_count,
    COUNT(a.id) FILTER (WHERE a.status_new = 'shortlisted') as shortlisted_count,
    COUNT(a.id) FILTER (WHERE a.status_new IN ('interview_scheduled', 'interview_completed')) as interview_count,
    COUNT(a.id) FILTER (WHERE a.status_new = 'hired') as hired_count,
    COUNT(a.id) FILTER (WHERE a.status_new = 'rejected') as rejected_count,
    COUNT(a.id) FILTER (WHERE a.is_guest = true) as guest_applications,
    AVG(a.match_score) as avg_match_score,
    MIN(a.applied_at) as first_application,
    MAX(a.applied_at) as last_application
FROM jobs j
LEFT JOIN applications a ON j.id = a.job_id
GROUP BY j.id, j.title, j.company_id;

-- Indexler
CREATE INDEX IF NOT EXISTS idx_applications_status_new ON applications(status_new);
CREATE INDEX IF NOT EXISTS idx_applications_source ON applications(source);
CREATE INDEX IF NOT EXISTS idx_applications_match_score ON applications(match_score DESC);
CREATE INDEX IF NOT EXISTS idx_applications_is_favorite ON applications(is_favorite) WHERE is_favorite = true;
CREATE INDEX IF NOT EXISTS idx_applications_last_change ON applications(last_status_change_at DESC);
CREATE INDEX IF NOT EXISTS idx_guest_application_details_app ON guest_application_details(application_id);
CREATE INDEX IF NOT EXISTS idx_application_history_app ON application_history(application_id);
CREATE INDEX IF NOT EXISTS idx_application_messages_app ON application_messages(application_id);
CREATE INDEX IF NOT EXISTS idx_application_messages_unread ON application_messages(is_read) WHERE is_read = false;

-- RLS
ALTER TABLE guest_application_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_messages ENABLE ROW LEVEL SECURITY;

-- Misafir başvuru detayları
CREATE POLICY "Şirketler kendi ilanlarına yapılan misafir başvurularını görebilir"
    ON guest_application_details FOR SELECT
    USING (
        application_id IN (
            SELECT a.id FROM applications a
            JOIN jobs j ON a.job_id = j.id
            JOIN companies c ON j.company_id = c.id
            WHERE c.owner_id = auth.uid()
        )
    );

CREATE POLICY "Misafir başvuru detayı eklenebilir"
    ON guest_application_details FOR INSERT
    WITH CHECK (true);

-- Başvuru geçmişi
CREATE POLICY "Adaylar kendi başvurularının geçmişini görebilir"
    ON application_history FOR SELECT
    USING (
        application_id IN (
            SELECT id FROM applications WHERE candidate_id = auth.uid()
        )
    );

CREATE POLICY "Şirketler kendi ilanlarına yapılan başvuruların geçmişini görebilir"
    ON application_history FOR SELECT
    USING (
        application_id IN (
            SELECT a.id FROM applications a
            JOIN jobs j ON a.job_id = j.id
            JOIN companies c ON j.company_id = c.id
            WHERE c.owner_id = auth.uid()
        )
    );

-- Başvuru mesajları
CREATE POLICY "Kullanıcılar kendi başvuru mesajlarını görebilir"
    ON application_messages FOR SELECT
    USING (
        sender_id = auth.uid() OR
        application_id IN (
            SELECT id FROM applications WHERE candidate_id = auth.uid()
        ) OR
        application_id IN (
            SELECT a.id FROM applications a
            JOIN jobs j ON a.job_id = j.id
            JOIN companies c ON j.company_id = c.id
            WHERE c.owner_id = auth.uid()
        )
    );

CREATE POLICY "Kullanıcılar mesaj gönderebilir"
    ON application_messages FOR INSERT
    WITH CHECK (sender_id = auth.uid());

-- Status değişikliği trigger'ı
CREATE OR REPLACE FUNCTION log_application_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status_new IS DISTINCT FROM NEW.status_new THEN
        INSERT INTO application_history (
            application_id,
            old_status,
            new_status,
            changed_by
        ) VALUES (
            NEW.id,
            OLD.status_new,
            NEW.status_new,
            auth.uid()
        );

        NEW.last_status_change_at := NOW();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS application_status_change_trigger ON applications;
CREATE TRIGGER application_status_change_trigger
    BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION log_application_status_change();

-- Hızlı başvuru fonksiyonu (kayıtlı aday)
CREATE OR REPLACE FUNCTION quick_apply(
    p_job_id UUID,
    p_cover_letter TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_application_id UUID;
    v_match_score INTEGER;
BEGIN
    -- Uygunluk puanı hesapla
    SELECT (check_candidate_job_match(auth.uid(), p_job_id)).match_score INTO v_match_score;

    INSERT INTO applications (
        job_id,
        candidate_id,
        cover_letter,
        source,
        match_score,
        status_new
    ) VALUES (
        p_job_id,
        auth.uid(),
        p_cover_letter,
        'quick_apply',
        v_match_score,
        'pending'
    )
    RETURNING id INTO v_application_id;

    RETURN v_application_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Misafir başvuru fonksiyonu
CREATE OR REPLACE FUNCTION guest_apply(
    p_job_id UUID,
    p_full_name TEXT,
    p_phone TEXT,
    p_email TEXT DEFAULT NULL,
    p_experience_level service_experience_level DEFAULT 'no_experience',
    p_note TEXT DEFAULT NULL,
    p_can_call BOOLEAN DEFAULT true,
    p_can_whatsapp BOOLEAN DEFAULT true
)
RETURNS UUID AS $$
DECLARE
    v_application_id UUID;
BEGIN
    -- Başvuru oluştur
    INSERT INTO applications (
        job_id,
        candidate_id,
        source,
        is_guest,
        status_new
    ) VALUES (
        p_job_id,
        NULL,
        'guest',
        true,
        'pending'
    )
    RETURNING id INTO v_application_id;

    -- Misafir detaylarını kaydet
    INSERT INTO guest_application_details (
        application_id,
        full_name,
        phone,
        email,
        experience_level,
        note,
        can_call,
        can_whatsapp
    ) VALUES (
        v_application_id,
        p_full_name,
        p_phone,
        p_email,
        p_experience_level,
        p_note,
        p_can_call,
        p_can_whatsapp
    );

    RETURN v_application_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE guest_application_details IS 'Misafir başvuru detayları';
COMMENT ON TABLE application_history IS 'Başvuru durum değişiklik geçmişi';
COMMENT ON TABLE application_messages IS 'Başvuru içi mesajlaşma';
