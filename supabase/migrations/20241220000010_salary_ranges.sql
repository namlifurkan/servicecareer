-- =============================================
-- MAAŞ ARALIKLARI VE ÖDEME BİLGİLERİ
-- Migration: 20241220000010_salary_ranges.sql
-- =============================================

-- Pozisyon bazlı maaş istatistikleri (piyasa verisi)
CREATE TABLE IF NOT EXISTS salary_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    position_type job_position_type NOT NULL,
    venue_type venue_type,
    city TEXT,
    experience_level service_experience_level,

    -- Maaş verileri
    salary_min INTEGER NOT NULL,
    salary_max INTEGER NOT NULL,
    salary_median INTEGER,
    salary_average INTEGER,
    sample_count INTEGER DEFAULT 0,          -- Kaç ilan baz alındı
    currency TEXT DEFAULT 'TRY',

    -- Bahşiş verileri
    avg_tip_monthly INTEGER,                 -- Ortalama aylık bahşiş
    tip_policy_common tip_policy,

    -- Meta
    data_period TEXT,                        -- '2024-Q4' gibi
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(position_type, venue_type, city, experience_level)
);

-- Varsayılan maaş verileri ekle (2024 Türkiye piyasa tahminleri)
INSERT INTO salary_statistics (position_type, experience_level, salary_min, salary_max, salary_median, avg_tip_monthly) VALUES
    -- Mutfak (deneyimsiz - uzman arası)
    ('kitchen_helper', 'no_experience', 17002, 20000, 18000, 500),
    ('kitchen_helper', 'beginner', 18000, 23000, 20000, 700),
    ('prep_cook', 'beginner', 20000, 28000, 24000, 800),
    ('prep_cook', 'intermediate', 25000, 35000, 30000, 1000),
    ('line_cook', 'beginner', 22000, 30000, 26000, 1000),
    ('line_cook', 'intermediate', 28000, 40000, 34000, 1500),
    ('line_cook', 'experienced', 35000, 50000, 42000, 2000),
    ('chef_de_partie', 'intermediate', 32000, 45000, 38000, 2000),
    ('chef_de_partie', 'experienced', 40000, 55000, 47000, 2500),
    ('sous_chef', 'experienced', 50000, 70000, 60000, 3000),
    ('sous_chef', 'senior', 60000, 90000, 75000, 4000),
    ('executive_chef', 'senior', 80000, 120000, 100000, 5000),
    ('executive_chef', 'expert', 100000, 180000, 140000, 8000),

    -- Özel pozisyonlar
    ('pizza_chef', 'intermediate', 30000, 45000, 37000, 1500),
    ('doner_master', 'intermediate', 28000, 42000, 35000, 1000),
    ('grill_master', 'intermediate', 30000, 48000, 38000, 1500),
    ('sushi_chef', 'experienced', 45000, 70000, 55000, 3000),
    ('pastry_chef', 'experienced', 40000, 60000, 50000, 2000),

    -- Servis
    ('busser', 'no_experience', 17002, 22000, 19000, 2000),
    ('busser', 'beginner', 18000, 25000, 21000, 2500),
    ('food_runner', 'beginner', 18000, 26000, 22000, 2500),
    ('waiter', 'no_experience', 17002, 22000, 19000, 3000),
    ('waiter', 'beginner', 20000, 28000, 24000, 4000),
    ('waiter', 'intermediate', 25000, 35000, 30000, 5000),
    ('waiter', 'experienced', 30000, 45000, 37000, 7000),
    ('waitress', 'beginner', 20000, 28000, 24000, 4000),
    ('waitress', 'intermediate', 25000, 35000, 30000, 5000),
    ('head_waiter', 'experienced', 35000, 50000, 42000, 6000),
    ('host_hostess', 'beginner', 22000, 32000, 27000, 1500),
    ('floor_manager', 'experienced', 45000, 65000, 55000, 4000),
    ('restaurant_manager', 'senior', 60000, 100000, 80000, 5000),

    -- Bar
    ('barback', 'no_experience', 17002, 22000, 19000, 2000),
    ('barista', 'no_experience', 17002, 22000, 19000, 1500),
    ('barista', 'beginner', 20000, 28000, 24000, 2000),
    ('barista', 'intermediate', 25000, 35000, 30000, 2500),
    ('senior_barista', 'experienced', 30000, 42000, 36000, 3000),
    ('bartender', 'beginner', 22000, 32000, 27000, 5000),
    ('bartender', 'intermediate', 28000, 42000, 35000, 7000),
    ('bartender', 'experienced', 35000, 55000, 45000, 10000),
    ('head_bartender', 'experienced', 40000, 60000, 50000, 8000),
    ('sommelier', 'experienced', 45000, 70000, 55000, 4000),
    ('bar_manager', 'senior', 55000, 85000, 70000, 6000),

    -- Teslimat
    ('bicycle_courier', 'no_experience', 15000, 20000, 17000, 3000),
    ('delivery_driver', 'beginner', 18000, 28000, 23000, 5000),
    ('delivery_driver', 'intermediate', 22000, 35000, 28000, 7000),
    ('delivery_coordinator', 'experienced', 35000, 50000, 42000, 2000),

    -- Destek
    ('dishwasher', 'no_experience', 17002, 20000, 18000, 500),
    ('cleaner', 'no_experience', 17002, 20000, 18000, 300),
    ('cashier', 'beginner', 20000, 28000, 24000, 500),
    ('security', 'intermediate', 28000, 40000, 34000, 0),

    -- Fast Food
    ('fast_food_crew', 'no_experience', 17002, 22000, 19000, 500),
    ('shift_supervisor', 'intermediate', 28000, 40000, 34000, 1000),

    -- Pastane
    ('baker', 'intermediate', 25000, 40000, 32000, 500),
    ('pastry_cook', 'intermediate', 25000, 38000, 31000, 500),
    ('cake_decorator', 'experienced', 30000, 45000, 37000, 1000),

    -- Catering
    ('banquet_server', 'beginner', 20000, 28000, 24000, 3000),
    ('event_coordinator', 'experienced', 40000, 60000, 50000, 2000),
    ('catering_manager', 'senior', 55000, 85000, 70000, 3000),

    -- Otel
    ('room_service', 'beginner', 22000, 32000, 27000, 3000),
    ('breakfast_attendant', 'beginner', 20000, 28000, 24000, 1000),
    ('fb_manager', 'senior', 70000, 120000, 95000, 5000),

    -- Kafe
    ('cafe_manager', 'experienced', 40000, 60000, 50000, 3000),
    ('cafe_attendant', 'beginner', 18000, 26000, 22000, 1500)
ON CONFLICT (position_type, venue_type, city, experience_level) DO UPDATE SET
    salary_min = EXCLUDED.salary_min,
    salary_max = EXCLUDED.salary_max,
    salary_median = EXCLUDED.salary_median,
    avg_tip_monthly = EXCLUDED.avg_tip_monthly,
    last_updated = NOW();

-- İlan maaş karşılaştırma view'ı
CREATE OR REPLACE VIEW job_salary_comparison AS
SELECT
    j.id as job_id,
    j.title,
    j.position_type,
    j.salary_min as offered_min,
    j.salary_max as offered_max,
    ss.salary_min as market_min,
    ss.salary_max as market_max,
    ss.salary_median as market_median,
    ss.avg_tip_monthly,
    CASE
        WHEN j.salary_min IS NULL THEN 'not_shown'
        WHEN j.salary_min < ss.salary_min THEN 'below_market'
        WHEN j.salary_min > ss.salary_median THEN 'above_market'
        ELSE 'competitive'
    END as salary_competitiveness
FROM jobs j
LEFT JOIN salary_statistics ss ON
    j.position_type = ss.position_type
    AND (ss.city IS NULL OR ss.city = j.location_city)
    AND (ss.experience_level IS NULL OR ss.experience_level = j.service_experience_required)
WHERE j.status = 'active';

-- Indexler
CREATE INDEX IF NOT EXISTS idx_salary_stats_position ON salary_statistics(position_type);
CREATE INDEX IF NOT EXISTS idx_salary_stats_city ON salary_statistics(city);
CREATE INDEX IF NOT EXISTS idx_salary_stats_experience ON salary_statistics(experience_level);

-- RLS
ALTER TABLE salary_statistics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Maaş istatistikleri herkese görünür"
    ON salary_statistics FOR SELECT
    USING (true);

CREATE POLICY "Adminler maaş istatistiklerini yönetebilir"
    ON salary_statistics FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Maaş önerisi fonksiyonu
CREATE OR REPLACE FUNCTION get_salary_suggestion(
    p_position_type job_position_type,
    p_experience_level service_experience_level,
    p_city TEXT DEFAULT NULL
)
RETURNS TABLE (
    suggested_min INTEGER,
    suggested_max INTEGER,
    market_median INTEGER,
    avg_tip INTEGER,
    confidence TEXT
) AS $$
DECLARE
    v_stats salary_statistics%ROWTYPE;
    v_confidence TEXT := 'low';
BEGIN
    -- Önce şehir + deneyim ile dene
    SELECT * INTO v_stats
    FROM salary_statistics
    WHERE position_type = p_position_type
    AND experience_level = p_experience_level
    AND city = p_city;

    IF FOUND THEN
        v_confidence := 'high';
    ELSE
        -- Sadece deneyim ile dene
        SELECT * INTO v_stats
        FROM salary_statistics
        WHERE position_type = p_position_type
        AND experience_level = p_experience_level
        AND city IS NULL;

        IF FOUND THEN
            v_confidence := 'medium';
        ELSE
            -- Sadece pozisyon ile dene
            SELECT * INTO v_stats
            FROM salary_statistics
            WHERE position_type = p_position_type
            AND experience_level IS NULL
            AND city IS NULL;

            v_confidence := 'low';
        END IF;
    END IF;

    IF NOT FOUND THEN
        RETURN;
    END IF;

    RETURN QUERY SELECT
        v_stats.salary_min,
        v_stats.salary_max,
        v_stats.salary_median,
        v_stats.avg_tip_monthly,
        v_confidence;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE salary_statistics IS 'Pozisyon bazlı piyasa maaş istatistikleri';
COMMENT ON VIEW job_salary_comparison IS 'İlan maaşlarının piyasa ile karşılaştırması';
