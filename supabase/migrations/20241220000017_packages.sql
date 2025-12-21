-- =============================================
-- PAKET VE ABONELİK SİSTEMİ
-- Migration: 20241220000017_packages.sql
-- =============================================

-- Paket tanımları
CREATE TABLE IF NOT EXISTS packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,               -- 'free', 'starter', 'professional', 'enterprise'
    name TEXT NOT NULL,
    description TEXT,

    -- Fiyatlandırma
    price_monthly INTEGER DEFAULT 0,         -- Aylık fiyat (TRY kuruş)
    price_yearly INTEGER DEFAULT 0,          -- Yıllık fiyat (TRY kuruş)
    price_per_job INTEGER DEFAULT 0,         -- İlan başı fiyat

    -- Limitler
    job_post_limit INTEGER DEFAULT 1,        -- Aynı anda aktif ilan limiti
    featured_job_limit INTEGER DEFAULT 0,    -- Öne çıkan ilan hakkı
    candidate_view_limit INTEGER DEFAULT 10, -- Günlük aday görüntüleme
    candidate_contact_limit INTEGER DEFAULT 5, -- Günlük aday iletişim
    team_member_limit INTEGER DEFAULT 1,     -- Ekip üyesi limiti
    saved_search_limit INTEGER DEFAULT 3,    -- Kayıtlı arama limiti

    -- Özellikler
    features JSONB,                          -- Özellik listesi
    has_analytics BOOLEAN DEFAULT false,
    has_priority_support BOOLEAN DEFAULT false,
    has_api_access BOOLEAN DEFAULT false,
    has_bulk_messaging BOOLEAN DEFAULT false,
    has_custom_branding BOOLEAN DEFAULT false,
    has_ats_integration BOOLEAN DEFAULT false,
    job_validity_days INTEGER DEFAULT 30,    -- İlan geçerlilik süresi

    -- Görünüm
    display_order INTEGER DEFAULT 0,
    is_popular BOOLEAN DEFAULT false,        -- Popüler rozeti
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Paketleri ekle
INSERT INTO packages (code, name, description, price_monthly, price_yearly, job_post_limit, featured_job_limit, candidate_view_limit, candidate_contact_limit, team_member_limit, job_validity_days, has_analytics, display_order, is_popular, features) VALUES
    ('free', 'Ücretsiz', 'Küçük işletmeler için başlangıç paketi', 0, 0, 1, 0, 10, 5, 1, 15,
     false, 1, false,
     '{"job_posting": true, "basic_analytics": false, "email_support": true}'::jsonb),

    ('starter', 'Başlangıç', 'Büyüyen işletmeler için', 49900, 479000, 3, 1, 30, 15, 2, 30,
     true, 2, false,
     '{"job_posting": true, "basic_analytics": true, "email_support": true, "candidate_search": true}'::jsonb),

    ('professional', 'Profesyonel', 'Aktif işe alım yapan işletmeler için', 149900, 1439000, 10, 3, 100, 50, 5, 45,
     true, 3, true,
     '{"job_posting": true, "advanced_analytics": true, "priority_support": true, "candidate_search": true, "bulk_messaging": true, "saved_searches": true}'::jsonb),

    ('enterprise', 'Kurumsal', 'Büyük işletmeler ve zincirler için', 499900, 4799000, -1, 10, -1, -1, 20, 60,
     true, 4, false,
     '{"job_posting": true, "advanced_analytics": true, "dedicated_support": true, "candidate_search": true, "bulk_messaging": true, "saved_searches": true, "api_access": true, "custom_branding": true, "ats_integration": true}'::jsonb)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price_monthly = EXCLUDED.price_monthly,
    price_yearly = EXCLUDED.price_yearly,
    job_post_limit = EXCLUDED.job_post_limit,
    featured_job_limit = EXCLUDED.featured_job_limit,
    candidate_view_limit = EXCLUDED.candidate_view_limit,
    candidate_contact_limit = EXCLUDED.candidate_contact_limit,
    team_member_limit = EXCLUDED.team_member_limit,
    job_validity_days = EXCLUDED.job_validity_days,
    has_analytics = EXCLUDED.has_analytics,
    display_order = EXCLUDED.display_order,
    is_popular = EXCLUDED.is_popular,
    features = EXCLUDED.features,
    updated_at = NOW();

-- Şirket abonelikleri
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    package_id UUID NOT NULL REFERENCES packages(id),

    -- Dönem
    billing_period TEXT NOT NULL DEFAULT 'monthly', -- 'monthly', 'yearly'
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_period_end TIMESTAMPTZ NOT NULL,
    trial_end TIMESTAMPTZ,

    -- Durum
    status TEXT NOT NULL DEFAULT 'active',   -- 'active', 'trialing', 'past_due', 'canceled', 'expired'
    cancel_at_period_end BOOLEAN DEFAULT false,
    canceled_at TIMESTAMPTZ,
    cancellation_reason TEXT,

    -- Kullanım
    jobs_posted_this_period INTEGER DEFAULT 0,
    featured_jobs_used INTEGER DEFAULT 0,
    candidate_views_today INTEGER DEFAULT 0,
    candidate_contacts_today INTEGER DEFAULT 0,
    last_usage_reset_at DATE DEFAULT CURRENT_DATE,

    -- Ödeme
    payment_method TEXT,
    last_payment_at TIMESTAMPTZ,
    last_payment_amount INTEGER,
    next_payment_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ödeme geçmişi
CREATE TABLE IF NOT EXISTS payment_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    -- Ödeme detayları
    amount INTEGER NOT NULL,                 -- Kuruş cinsinden
    currency TEXT DEFAULT 'TRY',
    payment_method TEXT,
    payment_status TEXT NOT NULL,            -- 'pending', 'completed', 'failed', 'refunded'
    payment_provider TEXT,                   -- 'iyzico', 'stripe', 'bank_transfer'
    provider_transaction_id TEXT,

    -- Fatura
    invoice_number TEXT,
    invoice_url TEXT,
    billing_name TEXT,
    billing_address TEXT,
    tax_id TEXT,

    -- Açıklama
    description TEXT,
    period_start TIMESTAMPTZ,
    period_end TIMESTAMPTZ,

    -- Meta
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ek kredi/hak satın alımları
CREATE TABLE IF NOT EXISTS credit_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    credit_type TEXT NOT NULL,               -- 'featured_job', 'candidate_view', 'bulk_message'
    quantity INTEGER NOT NULL,
    unit_price INTEGER NOT NULL,
    total_price INTEGER NOT NULL,

    -- Kullanım
    used_quantity INTEGER DEFAULT 0,
    expires_at TIMESTAMPTZ,

    payment_id UUID REFERENCES payment_history(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Promosyon kodları
CREATE TABLE IF NOT EXISTS promo_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    description TEXT,

    -- İndirim
    discount_type TEXT NOT NULL,             -- 'percentage', 'fixed_amount', 'free_trial'
    discount_value INTEGER NOT NULL,         -- Yüzde veya kuruş
    max_discount INTEGER,                    -- Maksimum indirim tutarı

    -- Geçerlilik
    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,

    -- Kısıtlamalar
    applicable_packages UUID[],              -- Geçerli paketler
    min_billing_period TEXT,                 -- 'monthly', 'yearly'
    first_subscription_only BOOLEAN DEFAULT true,

    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Promosyon kod kullanımları
CREATE TABLE IF NOT EXISTS promo_code_uses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    promo_code_id UUID NOT NULL REFERENCES promo_codes(id),
    company_id UUID NOT NULL REFERENCES companies(id),
    subscription_id UUID REFERENCES subscriptions(id),
    discount_applied INTEGER NOT NULL,
    used_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(promo_code_id, company_id)
);

-- Aktif abonelik view'ı
CREATE OR REPLACE VIEW active_subscriptions AS
SELECT
    s.*,
    p.code as package_code,
    p.name as package_name,
    p.job_post_limit,
    p.featured_job_limit,
    p.candidate_view_limit,
    p.candidate_contact_limit,
    p.team_member_limit,
    p.job_validity_days,
    p.features,
    c.name as company_name,
    c.owner_id,
    CASE
        WHEN s.status = 'active' AND s.current_period_end > NOW() THEN true
        WHEN s.status = 'trialing' AND s.trial_end > NOW() THEN true
        ELSE false
    END as is_valid,
    GREATEST(0, p.job_post_limit - s.jobs_posted_this_period) as remaining_job_posts,
    GREATEST(0, p.featured_job_limit - s.featured_jobs_used) as remaining_featured_jobs,
    CASE
        WHEN p.candidate_view_limit = -1 THEN 999999
        ELSE GREATEST(0, p.candidate_view_limit - s.candidate_views_today)
    END as remaining_candidate_views
FROM subscriptions s
JOIN packages p ON s.package_id = p.id
JOIN companies c ON s.company_id = c.id
WHERE s.status IN ('active', 'trialing');

-- Indexler
CREATE INDEX IF NOT EXISTS idx_subscriptions_company ON subscriptions(company_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_period_end ON subscriptions(current_period_end);
CREATE INDEX IF NOT EXISTS idx_payment_history_subscription ON payment_history(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_company ON payment_history(company_id);
CREATE INDEX IF NOT EXISTS idx_credit_purchases_company ON credit_purchases(company_id);
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_code_uses_company ON promo_code_uses(company_id);

-- RLS
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_code_uses ENABLE ROW LEVEL SECURITY;

-- Paketler herkese görünür
CREATE POLICY "Paketler herkese görünür"
    ON packages FOR SELECT
    USING (is_active = true);

-- Abonelikler
CREATE POLICY "Şirketler kendi aboneliklerini görebilir"
    ON subscriptions FOR SELECT
    USING (
        company_id IN (
            SELECT id FROM companies WHERE owner_id = auth.uid()
        )
    );

-- Ödeme geçmişi
CREATE POLICY "Şirketler kendi ödeme geçmişlerini görebilir"
    ON payment_history FOR SELECT
    USING (
        company_id IN (
            SELECT id FROM companies WHERE owner_id = auth.uid()
        )
    );

-- Kredi satın alımları
CREATE POLICY "Şirketler kendi kredilerini görebilir"
    ON credit_purchases FOR SELECT
    USING (
        company_id IN (
            SELECT id FROM companies WHERE owner_id = auth.uid()
        )
    );

-- Promosyon kodları (aktif olanlar görünür)
CREATE POLICY "Aktif promosyon kodları görünür"
    ON promo_codes FOR SELECT
    USING (is_active = true AND (valid_until IS NULL OR valid_until > NOW()));

-- Promosyon kullanımları
CREATE POLICY "Şirketler kendi kullanımlarını görebilir"
    ON promo_code_uses FOR SELECT
    USING (
        company_id IN (
            SELECT id FROM companies WHERE owner_id = auth.uid()
        )
    );

-- Günlük kullanım sıfırlama fonksiyonu
CREATE OR REPLACE FUNCTION reset_daily_subscription_usage()
RETURNS VOID AS $$
BEGIN
    UPDATE subscriptions
    SET candidate_views_today = 0,
        candidate_contacts_today = 0,
        last_usage_reset_at = CURRENT_DATE
    WHERE last_usage_reset_at < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Abonelik limit kontrolü fonksiyonu
CREATE OR REPLACE FUNCTION check_subscription_limit(
    p_company_id UUID,
    p_limit_type TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_sub active_subscriptions%ROWTYPE;
BEGIN
    SELECT * INTO v_sub
    FROM active_subscriptions
    WHERE company_id = p_company_id
    AND is_valid = true;

    IF NOT FOUND THEN
        RETURN false;
    END IF;

    CASE p_limit_type
        WHEN 'job_post' THEN
            RETURN v_sub.job_post_limit = -1 OR v_sub.remaining_job_posts > 0;
        WHEN 'featured_job' THEN
            RETURN v_sub.featured_job_limit = -1 OR v_sub.remaining_featured_jobs > 0;
        WHEN 'candidate_view' THEN
            RETURN v_sub.candidate_view_limit = -1 OR v_sub.remaining_candidate_views > 0;
        ELSE
            RETURN false;
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Kullanım artırma fonksiyonu
CREATE OR REPLACE FUNCTION increment_subscription_usage(
    p_company_id UUID,
    p_usage_type TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_updated BOOLEAN := false;
BEGIN
    CASE p_usage_type
        WHEN 'job_post' THEN
            UPDATE subscriptions
            SET jobs_posted_this_period = jobs_posted_this_period + 1
            WHERE company_id = p_company_id
            AND status IN ('active', 'trialing');
            v_updated := FOUND;
        WHEN 'featured_job' THEN
            UPDATE subscriptions
            SET featured_jobs_used = featured_jobs_used + 1
            WHERE company_id = p_company_id
            AND status IN ('active', 'trialing');
            v_updated := FOUND;
        WHEN 'candidate_view' THEN
            UPDATE subscriptions
            SET candidate_views_today = candidate_views_today + 1
            WHERE company_id = p_company_id
            AND status IN ('active', 'trialing');
            v_updated := FOUND;
        WHEN 'candidate_contact' THEN
            UPDATE subscriptions
            SET candidate_contacts_today = candidate_contacts_today + 1
            WHERE company_id = p_company_id
            AND status IN ('active', 'trialing');
            v_updated := FOUND;
    END CASE;

    RETURN v_updated;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE packages IS 'Abonelik paket tanımları';
COMMENT ON TABLE subscriptions IS 'Şirket abonelikleri';
COMMENT ON TABLE payment_history IS 'Ödeme geçmişi';
COMMENT ON TABLE credit_purchases IS 'Ek kredi satın alımları';
COMMENT ON TABLE promo_codes IS 'Promosyon kodları';
COMMENT ON TABLE promo_code_uses IS 'Promosyon kodu kullanım geçmişi';
