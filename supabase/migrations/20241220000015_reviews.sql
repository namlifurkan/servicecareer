-- =============================================
-- DEĞERLENDİRME SİSTEMİ
-- Migration: 20241220000015_reviews.sql
-- =============================================

-- Şirket değerlendirmeleri (çalışanlar/eski çalışanlar tarafından)
CREATE TABLE IF NOT EXISTS company_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    application_id UUID REFERENCES applications(id) ON DELETE SET NULL,

    -- Değerlendirme durumu
    employment_status TEXT NOT NULL,         -- 'current', 'former', 'interviewed', 'trial'
    position_type job_position_type,
    employment_duration_months INTEGER,      -- Çalışma süresi

    -- Puanlar (1-5)
    overall_rating INTEGER NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
    work_environment_rating INTEGER CHECK (work_environment_rating BETWEEN 1 AND 5),
    management_rating INTEGER CHECK (management_rating BETWEEN 1 AND 5),
    salary_rating INTEGER CHECK (salary_rating BETWEEN 1 AND 5),
    work_life_balance_rating INTEGER CHECK (work_life_balance_rating BETWEEN 1 AND 5),
    career_growth_rating INTEGER CHECK (career_growth_rating BETWEEN 1 AND 5),

    -- Metin değerlendirmeler
    title TEXT,
    pros TEXT,                               -- Artılar
    cons TEXT,                               -- Eksiler
    advice_to_management TEXT,               -- Yönetime tavsiye

    -- Maaş bilgisi (anonim)
    reported_salary INTEGER,
    reported_tip_monthly INTEGER,
    salary_accurate BOOLEAN,                 -- İlandaki maaş doğru muydu?

    -- Öneriler
    would_recommend BOOLEAN,
    would_work_again BOOLEAN,

    -- Moderasyon
    status TEXT DEFAULT 'pending',           -- 'pending', 'approved', 'rejected', 'hidden'
    rejection_reason TEXT,
    moderated_by UUID REFERENCES profiles(id),
    moderated_at TIMESTAMPTZ,

    -- Anonimlik
    is_anonymous BOOLEAN DEFAULT true,

    -- Yararlılık
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,

    -- Meta
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Değerlendirme yararlılık oyları
CREATE TABLE IF NOT EXISTS review_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL REFERENCES company_reviews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    is_helpful BOOLEAN NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(review_id, user_id)
);

-- Şirket değerlendirme yanıtları (işveren tarafından)
CREATE TABLE IF NOT EXISTS review_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL REFERENCES company_reviews(id) ON DELETE CASCADE UNIQUE,
    responder_id UUID NOT NULL REFERENCES profiles(id),
    response TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Şirket değerlendirme özeti view'ı
CREATE OR REPLACE VIEW company_rating_summary AS
SELECT
    c.id as company_id,
    c.name as company_name,
    COUNT(cr.id) as review_count,
    ROUND(AVG(cr.overall_rating)::numeric, 1) as avg_overall,
    ROUND(AVG(cr.work_environment_rating)::numeric, 1) as avg_work_environment,
    ROUND(AVG(cr.management_rating)::numeric, 1) as avg_management,
    ROUND(AVG(cr.salary_rating)::numeric, 1) as avg_salary,
    ROUND(AVG(cr.work_life_balance_rating)::numeric, 1) as avg_work_life_balance,
    ROUND(AVG(cr.career_growth_rating)::numeric, 1) as avg_career_growth,
    COUNT(cr.id) FILTER (WHERE cr.would_recommend = true) as recommend_count,
    COUNT(cr.id) FILTER (WHERE cr.would_recommend = false) as not_recommend_count,
    ROUND(
        (COUNT(cr.id) FILTER (WHERE cr.would_recommend = true)::numeric /
        NULLIF(COUNT(cr.id) FILTER (WHERE cr.would_recommend IS NOT NULL), 0)) * 100
    , 0) as recommend_percentage,
    ROUND(AVG(cr.reported_salary), 0) as avg_reported_salary,
    ROUND(AVG(cr.reported_tip_monthly), 0) as avg_reported_tip
FROM companies c
LEFT JOIN company_reviews cr ON c.id = cr.company_id AND cr.status = 'approved'
GROUP BY c.id, c.name;

-- Pozisyon bazlı maaş raporu
CREATE OR REPLACE VIEW position_salary_reports AS
SELECT
    cr.position_type,
    ptn.name_tr as position_name,
    COUNT(cr.id) as report_count,
    ROUND(AVG(cr.reported_salary), 0) as avg_salary,
    MIN(cr.reported_salary) as min_salary,
    MAX(cr.reported_salary) as max_salary,
    ROUND(AVG(cr.reported_tip_monthly), 0) as avg_tip,
    ROUND(
        (COUNT(cr.id) FILTER (WHERE cr.salary_accurate = true)::numeric /
        NULLIF(COUNT(cr.id) FILTER (WHERE cr.salary_accurate IS NOT NULL), 0)) * 100
    , 0) as salary_accuracy_percentage
FROM company_reviews cr
LEFT JOIN position_type_names ptn ON cr.position_type = ptn.position_type
WHERE cr.status = 'approved'
AND cr.reported_salary IS NOT NULL
GROUP BY cr.position_type, ptn.name_tr;

-- Indexler
CREATE INDEX IF NOT EXISTS idx_company_reviews_company ON company_reviews(company_id);
CREATE INDEX IF NOT EXISTS idx_company_reviews_reviewer ON company_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_company_reviews_status ON company_reviews(status);
CREATE INDEX IF NOT EXISTS idx_company_reviews_rating ON company_reviews(overall_rating DESC);
CREATE INDEX IF NOT EXISTS idx_company_reviews_created ON company_reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_review_votes_review ON review_votes(review_id);
CREATE INDEX IF NOT EXISTS idx_review_responses_review ON review_responses(review_id);

-- RLS
ALTER TABLE company_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_responses ENABLE ROW LEVEL SECURITY;

-- Onaylanmış değerlendirmeler herkese görünür
CREATE POLICY "Onaylanmış değerlendirmeler herkese görünür"
    ON company_reviews FOR SELECT
    USING (status = 'approved');

-- Kullanıcılar kendi değerlendirmelerini görebilir
CREATE POLICY "Kullanıcılar kendi değerlendirmelerini görebilir"
    ON company_reviews FOR SELECT
    USING (reviewer_id = auth.uid());

-- Şirket sahipleri değerlendirmeleri görebilir
CREATE POLICY "Şirket sahipleri değerlendirmeleri görebilir"
    ON company_reviews FOR SELECT
    USING (
        company_id IN (
            SELECT id FROM companies WHERE owner_id = auth.uid()
        )
    );

-- Adminler tüm değerlendirmeleri görebilir
CREATE POLICY "Adminler tüm değerlendirmeleri görebilir"
    ON company_reviews FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Kullanıcılar değerlendirme yazabilir
CREATE POLICY "Kullanıcılar değerlendirme yazabilir"
    ON company_reviews FOR INSERT
    WITH CHECK (reviewer_id = auth.uid());

-- Oylar
CREATE POLICY "Oylar herkese görünür"
    ON review_votes FOR SELECT
    USING (true);

CREATE POLICY "Kullanıcılar oy verebilir"
    ON review_votes FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Kullanıcılar kendi oylarını güncelleyebilir"
    ON review_votes FOR UPDATE
    USING (user_id = auth.uid());

-- Yanıtlar
CREATE POLICY "Yanıtlar herkese görünür"
    ON review_responses FOR SELECT
    USING (true);

CREATE POLICY "Şirket sahipleri yanıt yazabilir"
    ON review_responses FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM company_reviews cr
            JOIN companies c ON cr.company_id = c.id
            WHERE cr.id = review_responses.review_id
            AND c.owner_id = auth.uid()
        )
    );

-- Oy güncelleme trigger'ı
CREATE OR REPLACE FUNCTION update_review_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.is_helpful THEN
            UPDATE company_reviews SET helpful_count = helpful_count + 1 WHERE id = NEW.review_id;
        ELSE
            UPDATE company_reviews SET not_helpful_count = not_helpful_count + 1 WHERE id = NEW.review_id;
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.is_helpful AND NOT NEW.is_helpful THEN
            UPDATE company_reviews SET helpful_count = helpful_count - 1, not_helpful_count = not_helpful_count + 1 WHERE id = NEW.review_id;
        ELSIF NOT OLD.is_helpful AND NEW.is_helpful THEN
            UPDATE company_reviews SET helpful_count = helpful_count + 1, not_helpful_count = not_helpful_count - 1 WHERE id = NEW.review_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.is_helpful THEN
            UPDATE company_reviews SET helpful_count = helpful_count - 1 WHERE id = OLD.review_id;
        ELSE
            UPDATE company_reviews SET not_helpful_count = not_helpful_count - 1 WHERE id = OLD.review_id;
        END IF;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS review_vote_trigger ON review_votes;
CREATE TRIGGER review_vote_trigger
    AFTER INSERT OR UPDATE OR DELETE ON review_votes
    FOR EACH ROW EXECUTE FUNCTION update_review_vote_counts();

COMMENT ON TABLE company_reviews IS 'Şirket değerlendirmeleri';
COMMENT ON TABLE review_votes IS 'Değerlendirme yararlılık oyları';
COMMENT ON TABLE review_responses IS 'İşveren değerlendirme yanıtları';
