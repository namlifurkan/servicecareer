-- =============================================
-- EK INDEX'LER VE PERFORMANS OPTİMİZASYONLARI
-- Migration: 20241220000018_additional_indexes.sql
-- =============================================

-- Composite indexler (sık kullanılan sorgular için)

-- İlan aramaları için
CREATE INDEX IF NOT EXISTS idx_jobs_search_composite ON jobs(
    status,
    location_city,
    position_type,
    service_experience_required,
    published_at DESC
) WHERE status = 'active';

-- Maaş filtresi için
CREATE INDEX IF NOT EXISTS idx_jobs_salary_range ON jobs(salary_min, salary_max)
WHERE status = 'active' AND show_salary = true;

-- Öne çıkan ilanlar için
CREATE INDEX IF NOT EXISTS idx_jobs_featured_active ON jobs(
    premium_level DESC,
    is_featured DESC,
    published_at DESC
) WHERE status = 'active';

-- Aday aramaları için
CREATE INDEX IF NOT EXISTS idx_candidates_search ON candidate_profiles(
    is_open_to_work,
    city,
    service_experience,
    last_active_at DESC
) WHERE is_open_to_work = true;

-- Başvuru yönetimi için
CREATE INDEX IF NOT EXISTS idx_applications_management ON applications(
    job_id,
    status_new,
    applied_at DESC
);

-- Şirket ilanları için
CREATE INDEX IF NOT EXISTS idx_jobs_company_status ON jobs(
    company_id,
    status,
    created_at DESC
);

-- Full-text search indexleri
-- İlan başlığı ve açıklaması
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE INDEX IF NOT EXISTS idx_jobs_fts ON jobs USING GIN(search_vector);

-- Search vector güncelleme fonksiyonu
CREATE OR REPLACE FUNCTION jobs_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('turkish', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('turkish', COALESCE(NEW.description, '')), 'B') ||
        setweight(to_tsvector('turkish', COALESCE(NEW.requirements, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS jobs_search_vector_trigger ON jobs;
CREATE TRIGGER jobs_search_vector_trigger
    BEFORE INSERT OR UPDATE OF title, description, requirements
    ON jobs
    FOR EACH ROW EXECUTE FUNCTION jobs_search_vector_update();

-- Mevcut ilanları güncelle (sadece search_vector doldurulanlar)
UPDATE jobs SET search_vector =
    setweight(to_tsvector('turkish', COALESCE(title, '')), 'A') ||
    setweight(to_tsvector('turkish', COALESCE(description, '')), 'B') ||
    setweight(to_tsvector('turkish', COALESCE(requirements, '')), 'C')
WHERE search_vector IS NULL OR title IS NOT NULL;

-- Aday profili için full-text
ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE INDEX IF NOT EXISTS idx_candidates_fts ON candidate_profiles USING GIN(search_vector);

CREATE OR REPLACE FUNCTION candidate_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('turkish', COALESCE(NEW.headline, '')), 'A') ||
        setweight(to_tsvector('turkish', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('turkish', COALESCE(NEW.bio, '')), 'B');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS candidate_search_vector_trigger ON candidate_profiles;
CREATE TRIGGER candidate_search_vector_trigger
    BEFORE INSERT OR UPDATE OF headline, title, bio
    ON candidate_profiles
    FOR EACH ROW EXECUTE FUNCTION candidate_search_vector_update();

-- Partial indexler (sık sorgulanan durumlar için)

-- Sadece aktif ilanlar
CREATE INDEX IF NOT EXISTS idx_jobs_active_only ON jobs(id)
WHERE status = 'active';

-- Sadece iş arayan adaylar
CREATE INDEX IF NOT EXISTS idx_candidates_available ON candidate_profiles(id)
WHERE is_open_to_work = true;

-- Okunmamış bildirimler
CREATE INDEX IF NOT EXISTS idx_notifications_unread_partial ON notifications(user_id, created_at DESC)
WHERE is_read = false;

-- Bekleyen başvurular
CREATE INDEX IF NOT EXISTS idx_applications_pending ON applications(job_id, applied_at DESC)
WHERE status_new = 'pending';

-- Materialized view: Şehir bazlı ilan sayıları
CREATE MATERIALIZED VIEW IF NOT EXISTS city_job_counts AS
SELECT
    location_city as city,
    COUNT(*) as job_count,
    COUNT(*) FILTER (WHERE position_type IN ('waiter', 'waitress', 'head_waiter', 'busser', 'host_hostess')) as service_jobs,
    COUNT(*) FILTER (WHERE position_type IN ('line_cook', 'prep_cook', 'chef_de_partie', 'sous_chef', 'executive_chef')) as kitchen_jobs,
    COUNT(*) FILTER (WHERE position_type IN ('barista', 'bartender', 'head_bartender')) as bar_jobs,
    COUNT(*) FILTER (WHERE position_type IN ('delivery_driver', 'bicycle_courier')) as delivery_jobs
FROM jobs
WHERE status = 'active'
GROUP BY location_city;

CREATE UNIQUE INDEX IF NOT EXISTS idx_city_job_counts ON city_job_counts(city);

-- Materialized view: Pozisyon bazlı ilan sayıları
CREATE MATERIALIZED VIEW IF NOT EXISTS position_job_counts AS
SELECT
    position_type,
    COUNT(*) as job_count,
    AVG(salary_min) as avg_salary_min,
    AVG(salary_max) as avg_salary_max
FROM jobs
WHERE status = 'active'
GROUP BY position_type;

CREATE UNIQUE INDEX IF NOT EXISTS idx_position_job_counts ON position_job_counts(position_type);

-- Refresh fonksiyonu
CREATE OR REPLACE FUNCTION refresh_job_count_views()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY city_job_counts;
    REFRESH MATERIALIZED VIEW CONCURRENTLY position_job_counts;
END;
$$ LANGUAGE plpgsql;

COMMENT ON INDEX idx_jobs_search_composite IS 'İlan arama sorguları için composite index';
COMMENT ON INDEX idx_jobs_fts IS 'Full-text search index for jobs';
COMMENT ON MATERIALIZED VIEW city_job_counts IS 'Şehir bazlı aktif ilan sayıları (cache)';
COMMENT ON MATERIALIZED VIEW position_job_counts IS 'Pozisyon bazlı aktif ilan sayıları (cache)';
