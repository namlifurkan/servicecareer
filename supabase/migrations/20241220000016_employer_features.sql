-- =============================================
-- İŞVEREN ÖZELLİKLERİ
-- Migration: 20241220000016_employer_features.sql
-- =============================================

-- Kaydedilen adaylar
CREATE TABLE IF NOT EXISTS saved_candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    saved_by UUID NOT NULL REFERENCES profiles(id),

    -- Kategorileme
    folder TEXT DEFAULT 'general',           -- 'general', 'favorites', 'potential', 'contacted', 'interviewed'
    tags TEXT[],
    notes TEXT,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),

    -- Davet durumu
    invite_sent BOOLEAN DEFAULT false,
    invite_sent_at TIMESTAMPTZ,
    invite_job_id UUID REFERENCES jobs(id),
    invite_message TEXT,
    invite_response TEXT,                    -- 'accepted', 'declined', 'pending'
    invite_response_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, candidate_id)
);

-- Aday görüntüleme geçmişi
CREATE TABLE IF NOT EXISTS candidate_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    viewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    view_source TEXT,                        -- 'search', 'application', 'saved', 'recommendation'
    viewed_at TIMESTAMPTZ DEFAULT NOW(),
    view_date DATE DEFAULT CURRENT_DATE
);

-- Aday arama geçmişi
CREATE TABLE IF NOT EXISTS candidate_searches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    searched_by UUID NOT NULL REFERENCES profiles(id),

    -- Arama kriterleri
    search_query TEXT,
    position_types job_position_type[],
    experience_levels service_experience_level[],
    cities TEXT[],
    skills UUID[],
    certificates certificate_type[],
    salary_max INTEGER,

    -- Sonuçlar
    result_count INTEGER,

    -- Kaydetme
    is_saved BOOLEAN DEFAULT false,
    saved_name TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Şirket ekip üyeleri
CREATE TABLE IF NOT EXISTS company_team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member',     -- 'owner', 'admin', 'recruiter', 'member'

    -- İzinler
    can_post_jobs BOOLEAN DEFAULT false,
    can_edit_jobs BOOLEAN DEFAULT false,
    can_view_applications BOOLEAN DEFAULT true,
    can_manage_applications BOOLEAN DEFAULT false,
    can_message_candidates BOOLEAN DEFAULT true,
    can_view_analytics BOOLEAN DEFAULT false,
    can_manage_team BOOLEAN DEFAULT false,
    can_manage_billing BOOLEAN DEFAULT false,

    -- Atama
    invited_by UUID REFERENCES profiles(id),
    invited_at TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ,
    status TEXT DEFAULT 'pending',           -- 'pending', 'active', 'suspended', 'removed'

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, user_id)
);

-- Şirket aktivite logu
CREATE TABLE IF NOT EXISTS company_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

    -- Aktivite
    action_type TEXT NOT NULL,               -- 'job_created', 'job_updated', 'application_reviewed', etc.
    action_description TEXT,
    entity_type TEXT,                        -- 'job', 'application', 'candidate', etc.
    entity_id UUID,
    old_value JSONB,
    new_value JSONB,

    -- Meta
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Şirket istatistikleri (günlük snapshot)
CREATE TABLE IF NOT EXISTS company_daily_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    stat_date DATE NOT NULL DEFAULT CURRENT_DATE,

    -- İlan istatistikleri
    active_jobs_count INTEGER DEFAULT 0,
    total_job_views INTEGER DEFAULT 0,
    total_phone_reveals INTEGER DEFAULT 0,

    -- Başvuru istatistikleri
    new_applications INTEGER DEFAULT 0,
    total_applications INTEGER DEFAULT 0,
    applications_reviewed INTEGER DEFAULT 0,
    applications_shortlisted INTEGER DEFAULT 0,
    interviews_scheduled INTEGER DEFAULT 0,
    offers_sent INTEGER DEFAULT 0,
    hires_made INTEGER DEFAULT 0,

    -- Aday istatistikleri
    candidates_viewed INTEGER DEFAULT 0,
    candidates_saved INTEGER DEFAULT 0,
    invites_sent INTEGER DEFAULT 0,

    -- Mesaj istatistikleri
    messages_sent INTEGER DEFAULT 0,
    messages_received INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, stat_date)
);

-- Aday önerileri (işverene)
CREATE OR REPLACE VIEW recommended_candidates AS
SELECT
    cp.id as candidate_id,
    cp.title as candidate_title,
    p.full_name,
    p.avatar_url,
    cp.city,
    cp.service_experience,
    cp.position_types,
    j.id as job_id,
    j.title as job_title,
    j.company_id,
    -- Basit uyumluluk skoru
    CASE
        WHEN j.position_type = ANY(cp.position_types) THEN 30
        ELSE 0
    END +
    CASE
        WHEN j.location_city = cp.city THEN 20
        ELSE 0
    END +
    CASE
        WHEN j.service_experience_required <= cp.service_experience THEN 25
        ELSE 0
    END +
    CASE
        WHEN cp.is_open_to_work = true THEN 25
        ELSE 10
    END as match_score
FROM candidate_profiles cp
JOIN profiles p ON cp.id = p.id
CROSS JOIN jobs j
WHERE j.status = 'active'
AND cp.is_open_to_work = true
AND p.is_active = true
AND NOT EXISTS (
    SELECT 1 FROM applications a
    WHERE a.job_id = j.id AND a.candidate_id = cp.id
)
AND NOT EXISTS (
    SELECT 1 FROM saved_candidates sc
    WHERE sc.company_id = j.company_id AND sc.candidate_id = cp.id
);

-- Indexler
CREATE INDEX IF NOT EXISTS idx_saved_candidates_company ON saved_candidates(company_id);
CREATE INDEX IF NOT EXISTS idx_saved_candidates_candidate ON saved_candidates(candidate_id);
CREATE INDEX IF NOT EXISTS idx_saved_candidates_folder ON saved_candidates(company_id, folder);
CREATE INDEX IF NOT EXISTS idx_candidate_views_candidate ON candidate_views(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_views_viewer ON candidate_views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_candidate_views_date ON candidate_views(view_date);
CREATE INDEX IF NOT EXISTS idx_candidate_searches_company ON candidate_searches(company_id);
CREATE INDEX IF NOT EXISTS idx_company_team_members_company ON company_team_members(company_id);
CREATE INDEX IF NOT EXISTS idx_company_team_members_user ON company_team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_company_activity_log_company ON company_activity_log(company_id);
CREATE INDEX IF NOT EXISTS idx_company_activity_log_created ON company_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_company_daily_stats_company_date ON company_daily_stats(company_id, stat_date DESC);

-- RLS
ALTER TABLE saved_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_daily_stats ENABLE ROW LEVEL SECURITY;

-- Kaydedilen adaylar
CREATE POLICY "Şirketler kendi kayıtlı adaylarını yönetebilir"
    ON saved_candidates FOR ALL
    USING (
        company_id IN (
            SELECT id FROM companies WHERE owner_id = auth.uid()
        ) OR
        company_id IN (
            SELECT company_id FROM company_team_members
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Aday görüntüleme
CREATE POLICY "Adaylar kendi görüntülenmelerini görebilir"
    ON candidate_views FOR SELECT
    USING (candidate_id = auth.uid());

CREATE POLICY "Şirketler görüntüleme kaydedebilir"
    ON candidate_views FOR INSERT
    WITH CHECK (viewer_id = auth.uid());

-- Arama geçmişi
CREATE POLICY "Şirketler kendi arama geçmişlerini yönetebilir"
    ON candidate_searches FOR ALL
    USING (
        company_id IN (
            SELECT id FROM companies WHERE owner_id = auth.uid()
        )
    );

-- Ekip üyeleri
CREATE POLICY "Şirket sahipleri ekibi yönetebilir"
    ON company_team_members FOR ALL
    USING (
        company_id IN (
            SELECT id FROM companies WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Ekip üyeleri kendi kaydını görebilir"
    ON company_team_members FOR SELECT
    USING (user_id = auth.uid());

-- Aktivite logu
CREATE POLICY "Şirketler kendi aktivite loglarını görebilir"
    ON company_activity_log FOR SELECT
    USING (
        company_id IN (
            SELECT id FROM companies WHERE owner_id = auth.uid()
        ) OR
        company_id IN (
            SELECT company_id FROM company_team_members
            WHERE user_id = auth.uid() AND status = 'active' AND can_view_analytics = true
        )
    );

CREATE POLICY "Aktivite logu eklenebilir"
    ON company_activity_log FOR INSERT
    WITH CHECK (true);

-- Günlük istatistikler
CREATE POLICY "Şirketler kendi istatistiklerini görebilir"
    ON company_daily_stats FOR SELECT
    USING (
        company_id IN (
            SELECT id FROM companies WHERE owner_id = auth.uid()
        ) OR
        company_id IN (
            SELECT company_id FROM company_team_members
            WHERE user_id = auth.uid() AND status = 'active' AND can_view_analytics = true
        )
    );

-- Aday görüntüleme kaydet ve sayacı güncelle
CREATE OR REPLACE FUNCTION log_candidate_view(
    p_candidate_id UUID,
    p_job_id UUID DEFAULT NULL,
    p_source TEXT DEFAULT 'search'
)
RETURNS VOID AS $$
DECLARE
    v_company_id UUID;
BEGIN
    -- Şirket ID'sini bul
    SELECT id INTO v_company_id
    FROM companies
    WHERE owner_id = auth.uid();

    -- Görüntüleme kaydı
    INSERT INTO candidate_views (
        candidate_id,
        viewer_id,
        company_id,
        job_id,
        view_source
    ) VALUES (
        p_candidate_id,
        auth.uid(),
        v_company_id,
        p_job_id,
        p_source
    );

    -- Aday profil görüntüleme sayacını güncelle
    UPDATE candidate_profiles
    SET profile_views = profile_views + 1,
        last_active_at = NOW()
    WHERE id = p_candidate_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE saved_candidates IS 'İşverenlerin kaydettiği adaylar';
COMMENT ON TABLE candidate_views IS 'Aday profil görüntüleme geçmişi';
COMMENT ON TABLE candidate_searches IS 'İşveren aday arama geçmişi';
COMMENT ON TABLE company_team_members IS 'Şirket ekip üyeleri ve izinleri';
COMMENT ON TABLE company_activity_log IS 'Şirket aktivite geçmişi';
COMMENT ON TABLE company_daily_stats IS 'Günlük şirket istatistikleri';
