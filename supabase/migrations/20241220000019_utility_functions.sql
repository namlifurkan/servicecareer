-- =============================================
-- YARDIMCI FONKSİYONLAR VE VIEW'LAR
-- Migration: 20241220000019_utility_functions.sql
-- =============================================

-- İlan arama fonksiyonu (gelişmiş)
CREATE OR REPLACE FUNCTION search_jobs(
    p_query TEXT DEFAULT NULL,
    p_city TEXT DEFAULT NULL,
    p_district TEXT DEFAULT NULL,
    p_position_types job_position_type[] DEFAULT NULL,
    p_venue_types venue_type[] DEFAULT NULL,
    p_experience_level service_experience_level DEFAULT NULL,
    p_work_type work_type DEFAULT NULL,
    p_shift_types shift_type[] DEFAULT NULL,
    p_salary_min INTEGER DEFAULT NULL,
    p_salary_max INTEGER DEFAULT NULL,
    p_has_meal BOOLEAN DEFAULT NULL,
    p_has_transport BOOLEAN DEFAULT NULL,
    p_has_insurance BOOLEAN DEFAULT NULL,
    p_has_tip BOOLEAN DEFAULT NULL,
    p_sort_by TEXT DEFAULT 'newest',         -- 'newest', 'salary_high', 'salary_low', 'relevance'
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    job_id UUID,
    title TEXT,
    slug TEXT,
    company_id UUID,
    company_name TEXT,
    company_logo TEXT,
    is_verified BOOLEAN,
    position_type job_position_type,
    position_name TEXT,
    venue_type venue_type,
    venue_name TEXT,
    location_city TEXT,
    location_district TEXT,
    work_type work_type,
    experience_required service_experience_level,
    salary_min INTEGER,
    salary_max INTEGER,
    show_salary BOOLEAN,
    tip_policy tip_policy,
    urgency_level TEXT,
    is_featured BOOLEAN,
    premium_level INTEGER,
    published_at TIMESTAMPTZ,
    view_count INTEGER,
    application_count INTEGER,
    benefits benefit_type[],
    relevance_score REAL
) AS $$
BEGIN
    RETURN QUERY
    WITH job_benefits_agg AS (
        SELECT job_id, array_agg(benefit_type) as benefits
        FROM job_benefits
        GROUP BY job_id
    )
    SELECT
        j.id as job_id,
        j.title,
        j.slug,
        j.company_id,
        c.name as company_name,
        c.logo_url as company_logo,
        c.is_verified,
        j.position_type,
        ptn.name_tr as position_name,
        j.venue_type,
        vtn.name_tr as venue_name,
        j.location_city,
        j.location_district,
        j.work_type,
        j.service_experience_required as experience_required,
        j.salary_min,
        j.salary_max,
        j.show_salary,
        j.tip_policy,
        j.urgency_level,
        j.is_featured,
        j.premium_level,
        j.published_at,
        j.view_count,
        j.application_count,
        COALESCE(jba.benefits, '{}') as benefits,
        CASE
            WHEN p_query IS NOT NULL AND j.search_vector IS NOT NULL THEN
                ts_rank(j.search_vector, plainto_tsquery('turkish', p_query))
            ELSE 0
        END as relevance_score
    FROM jobs j
    LEFT JOIN companies c ON j.company_id = c.id
    LEFT JOIN position_type_names ptn ON j.position_type = ptn.position_type
    LEFT JOIN venue_type_names vtn ON j.venue_type = vtn.venue_type
    LEFT JOIN job_benefits_agg jba ON j.id = jba.job_id
    WHERE j.status = 'active'
    AND (p_query IS NULL OR j.search_vector @@ plainto_tsquery('turkish', p_query))
    AND (p_city IS NULL OR j.location_city = p_city)
    AND (p_district IS NULL OR j.location_district = p_district)
    AND (p_position_types IS NULL OR j.position_type = ANY(p_position_types))
    AND (p_venue_types IS NULL OR j.venue_type = ANY(p_venue_types))
    AND (p_experience_level IS NULL OR j.service_experience_required <= p_experience_level)
    AND (p_work_type IS NULL OR j.work_type = p_work_type)
    AND (p_salary_min IS NULL OR j.salary_max >= p_salary_min OR j.salary_max IS NULL)
    AND (p_salary_max IS NULL OR j.salary_min <= p_salary_max OR j.salary_min IS NULL)
    AND (p_has_insurance IS NULL OR j.has_insurance = p_has_insurance)
    AND (p_has_tip IS NULL OR (p_has_tip = true AND j.tip_policy IS NOT NULL AND j.tip_policy != 'no_tips'))
    ORDER BY
        CASE WHEN p_sort_by = 'newest' THEN j.published_at END DESC NULLS LAST,
        CASE WHEN p_sort_by = 'salary_high' THEN j.salary_max END DESC NULLS LAST,
        CASE WHEN p_sort_by = 'salary_low' THEN j.salary_min END ASC NULLS LAST,
        CASE WHEN p_sort_by = 'relevance' AND p_query IS NOT NULL THEN
            ts_rank(j.search_vector, plainto_tsquery('turkish', p_query))
        END DESC NULLS LAST,
        j.premium_level DESC,
        j.is_featured DESC,
        j.published_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Aday arama fonksiyonu
CREATE OR REPLACE FUNCTION search_candidates(
    p_query TEXT DEFAULT NULL,
    p_city TEXT DEFAULT NULL,
    p_position_types job_position_type[] DEFAULT NULL,
    p_experience_level service_experience_level DEFAULT NULL,
    p_has_health_certificate BOOLEAN DEFAULT NULL,
    p_has_hygiene_certificate BOOLEAN DEFAULT NULL,
    p_has_vehicle BOOLEAN DEFAULT NULL,
    p_available_now BOOLEAN DEFAULT NULL,
    p_sort_by TEXT DEFAULT 'active',         -- 'active', 'experience', 'newest'
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    candidate_id UUID,
    full_name TEXT,
    avatar_url TEXT,
    headline TEXT,
    city TEXT,
    district TEXT,
    experience_level service_experience_level,
    experience_years INTEGER,
    position_types job_position_type[],
    has_health_certificate BOOLEAN,
    has_hygiene_certificate BOOLEAN,
    is_open_to_work BOOLEAN,
    last_active_at TIMESTAMPTZ,
    profile_completion INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        cp.id as candidate_id,
        p.full_name,
        p.avatar_url,
        cp.headline,
        cp.city,
        cp.district,
        cp.service_experience as experience_level,
        cp.experience_years,
        cp.position_types,
        cp.has_health_certificate,
        cp.has_hygiene_certificate,
        cp.is_open_to_work,
        cp.last_active_at,
        cp.profile_completion_percentage as profile_completion
    FROM candidate_profiles cp
    JOIN profiles p ON cp.id = p.id
    WHERE p.is_active = true
    AND cp.is_open_to_work = true
    AND (p_query IS NULL OR cp.search_vector @@ plainto_tsquery('turkish', p_query))
    AND (p_city IS NULL OR cp.city = p_city)
    AND (p_position_types IS NULL OR cp.position_types && p_position_types)
    AND (p_experience_level IS NULL OR cp.service_experience >= p_experience_level)
    AND (p_has_health_certificate IS NULL OR cp.has_health_certificate = p_has_health_certificate)
    AND (p_has_hygiene_certificate IS NULL OR cp.has_hygiene_certificate = p_has_hygiene_certificate)
    AND (p_available_now IS NULL OR (p_available_now = true AND (cp.available_from IS NULL OR cp.available_from <= CURRENT_DATE)))
    ORDER BY
        CASE WHEN p_sort_by = 'active' THEN cp.last_active_at END DESC NULLS LAST,
        CASE WHEN p_sort_by = 'experience' THEN cp.experience_years END DESC NULLS LAST,
        CASE WHEN p_sort_by = 'newest' THEN cp.created_at END DESC NULLS LAST,
        cp.profile_completion_percentage DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Dashboard istatistikleri (İşveren)
CREATE OR REPLACE FUNCTION get_employer_dashboard_stats(p_company_id UUID)
RETURNS TABLE (
    active_jobs INTEGER,
    total_applications INTEGER,
    new_applications_today INTEGER,
    new_applications_week INTEGER,
    total_views_today INTEGER,
    total_phone_reveals INTEGER,
    interviews_scheduled INTEGER,
    pending_reviews INTEGER,
    subscription_status TEXT,
    package_name TEXT,
    remaining_job_posts INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*)::INTEGER FROM jobs WHERE company_id = p_company_id AND status = 'active'),
        (SELECT COUNT(*)::INTEGER FROM applications a
         JOIN jobs j ON a.job_id = j.id WHERE j.company_id = p_company_id),
        (SELECT COUNT(*)::INTEGER FROM applications a
         JOIN jobs j ON a.job_id = j.id
         WHERE j.company_id = p_company_id AND DATE(a.applied_at) = CURRENT_DATE),
        (SELECT COUNT(*)::INTEGER FROM applications a
         JOIN jobs j ON a.job_id = j.id
         WHERE j.company_id = p_company_id AND a.applied_at >= NOW() - INTERVAL '7 days'),
        (SELECT COALESCE(SUM(view_count), 0)::INTEGER FROM jobs
         WHERE company_id = p_company_id AND status = 'active'),
        (SELECT COALESCE(SUM(phone_reveal_count), 0)::INTEGER FROM jobs
         WHERE company_id = p_company_id),
        (SELECT COUNT(*)::INTEGER FROM applications a
         JOIN jobs j ON a.job_id = j.id
         WHERE j.company_id = p_company_id AND a.status_new = 'interview_scheduled'),
        (SELECT COUNT(*)::INTEGER FROM applications a
         JOIN jobs j ON a.job_id = j.id
         WHERE j.company_id = p_company_id AND a.status_new = 'pending'),
        (SELECT s.status FROM subscriptions s WHERE s.company_id = p_company_id AND s.status IN ('active', 'trialing') LIMIT 1),
        (SELECT pk.name FROM subscriptions s JOIN packages pk ON s.package_id = pk.id WHERE s.company_id = p_company_id LIMIT 1),
        (SELECT GREATEST(0, pk.job_post_limit - s.jobs_posted_this_period)::INTEGER
         FROM subscriptions s JOIN packages pk ON s.package_id = pk.id
         WHERE s.company_id = p_company_id LIMIT 1);
END;
$$ LANGUAGE plpgsql;

-- Dashboard istatistikleri (Aday)
CREATE OR REPLACE FUNCTION get_candidate_dashboard_stats(p_candidate_id UUID)
RETURNS TABLE (
    total_applications INTEGER,
    pending_applications INTEGER,
    interviews_scheduled INTEGER,
    offers_received INTEGER,
    profile_views_week INTEGER,
    saved_jobs INTEGER,
    matching_jobs INTEGER,
    profile_completion INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*)::INTEGER FROM applications WHERE candidate_id = p_candidate_id),
        (SELECT COUNT(*)::INTEGER FROM applications WHERE candidate_id = p_candidate_id AND status_new = 'pending'),
        (SELECT COUNT(*)::INTEGER FROM applications WHERE candidate_id = p_candidate_id AND status_new = 'interview_scheduled'),
        (SELECT COUNT(*)::INTEGER FROM applications WHERE candidate_id = p_candidate_id AND status_new = 'offer_sent'),
        (SELECT COUNT(*)::INTEGER FROM candidate_views WHERE candidate_id = p_candidate_id AND viewed_at >= NOW() - INTERVAL '7 days'),
        (SELECT COUNT(*)::INTEGER FROM favorites WHERE user_id = p_candidate_id),
        (SELECT COUNT(*)::INTEGER FROM jobs j WHERE j.status = 'active' AND j.position_type = ANY(
            SELECT unnest(position_types) FROM candidate_profiles WHERE id = p_candidate_id
        )),
        (SELECT profile_completion_percentage FROM candidate_profiles WHERE id = p_candidate_id);
END;
$$ LANGUAGE plpgsql;

-- Benzer ilanlar bulma
CREATE OR REPLACE FUNCTION get_similar_jobs(
    p_job_id UUID,
    p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
    job_id UUID,
    title TEXT,
    company_name TEXT,
    location_city TEXT,
    salary_min INTEGER,
    salary_max INTEGER,
    similarity_score INTEGER
) AS $$
DECLARE
    v_job jobs%ROWTYPE;
BEGIN
    SELECT * INTO v_job FROM jobs WHERE id = p_job_id;

    RETURN QUERY
    SELECT
        j.id,
        j.title,
        c.name,
        j.location_city,
        j.salary_min,
        j.salary_max,
        (
            CASE WHEN j.position_type = v_job.position_type THEN 40 ELSE 0 END +
            CASE WHEN j.location_city = v_job.location_city THEN 30 ELSE 0 END +
            CASE WHEN j.venue_type = v_job.venue_type THEN 20 ELSE 0 END +
            CASE WHEN j.work_type = v_job.work_type THEN 10 ELSE 0 END
        ) as similarity_score
    FROM jobs j
    JOIN companies c ON j.company_id = c.id
    WHERE j.id != p_job_id
    AND j.status = 'active'
    AND (
        j.position_type = v_job.position_type OR
        j.location_city = v_job.location_city OR
        j.venue_type = v_job.venue_type
    )
    ORDER BY similarity_score DESC, j.published_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Slug oluşturma fonksiyonu
CREATE OR REPLACE FUNCTION generate_slug(p_text TEXT)
RETURNS TEXT AS $$
DECLARE
    v_slug TEXT;
BEGIN
    -- Türkçe karakterleri değiştir
    v_slug := p_text;
    v_slug := replace(v_slug, 'ı', 'i');
    v_slug := replace(v_slug, 'İ', 'i');
    v_slug := replace(v_slug, 'ğ', 'g');
    v_slug := replace(v_slug, 'Ğ', 'g');
    v_slug := replace(v_slug, 'ü', 'u');
    v_slug := replace(v_slug, 'Ü', 'u');
    v_slug := replace(v_slug, 'ş', 's');
    v_slug := replace(v_slug, 'Ş', 's');
    v_slug := replace(v_slug, 'ö', 'o');
    v_slug := replace(v_slug, 'Ö', 'o');
    v_slug := replace(v_slug, 'ç', 'c');
    v_slug := replace(v_slug, 'Ç', 'c');

    -- Küçük harfe çevir
    v_slug := lower(v_slug);

    -- Alfanumerik olmayan karakterleri tire ile değiştir
    v_slug := regexp_replace(v_slug, '[^a-z0-9]+', '-', 'g');

    -- Baştaki ve sondaki tireleri kaldır
    v_slug := trim(both '-' from v_slug);

    -- Çoklu tireleri tekile düşür
    v_slug := regexp_replace(v_slug, '-+', '-', 'g');

    RETURN v_slug;
END;
$$ LANGUAGE plpgsql;

-- Benzersiz slug oluşturma (jobs için)
CREATE OR REPLACE FUNCTION generate_unique_job_slug(
    p_company_id UUID,
    p_title TEXT
)
RETURNS TEXT AS $$
DECLARE
    v_base_slug TEXT;
    v_slug TEXT;
    v_counter INTEGER := 0;
BEGIN
    v_base_slug := generate_slug(p_title);
    v_slug := v_base_slug;

    WHILE EXISTS (SELECT 1 FROM jobs WHERE company_id = p_company_id AND slug = v_slug) LOOP
        v_counter := v_counter + 1;
        v_slug := v_base_slug || '-' || v_counter;
    END LOOP;

    RETURN v_slug;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION search_jobs IS 'Gelişmiş ilan arama fonksiyonu';
COMMENT ON FUNCTION search_candidates IS 'Gelişmiş aday arama fonksiyonu';
COMMENT ON FUNCTION get_employer_dashboard_stats IS 'İşveren dashboard istatistikleri';
COMMENT ON FUNCTION get_candidate_dashboard_stats IS 'Aday dashboard istatistikleri';
COMMENT ON FUNCTION get_similar_jobs IS 'Benzer ilan önerileri';
COMMENT ON FUNCTION generate_slug IS 'URL-friendly slug oluşturma';
