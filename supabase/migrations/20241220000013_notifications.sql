-- =============================================
-- BİLDİRİM SİSTEMİ
-- Migration: 20241220000013_notifications.sql
-- =============================================

-- Bildirim tipleri
CREATE TYPE notification_type AS ENUM (
    -- Başvuru bildirimleri
    'new_application',           -- Yeni başvuru geldi
    'application_viewed',        -- Başvurunuz görüntülendi
    'application_shortlisted',   -- Ön seçime alındınız
    'interview_scheduled',       -- Mülakat planlandı
    'interview_reminder',        -- Mülakat hatırlatması
    'trial_scheduled',           -- Deneme günü planlandı
    'offer_received',            -- Teklif aldınız
    'application_rejected',      -- Başvuru reddedildi
    'application_hired',         -- İşe alındınız

    -- İlan bildirimleri
    'job_expiring',              -- İlan süresi doluyor
    'job_expired',               -- İlan süresi doldu
    'new_matching_job',          -- Size uygun yeni ilan

    -- Mesaj bildirimleri
    'new_message',               -- Yeni mesaj
    'message_reply',             -- Mesaj yanıtı

    -- Profil bildirimleri
    'profile_incomplete',        -- Profil eksik
    'profile_viewed',            -- Profiliniz görüntülendi
    'certificate_expiring',      -- Sertifika süresi doluyor
    'reference_request',         -- Referans talebi
    'reference_received',        -- Referans yanıtı geldi

    -- Sistem bildirimleri
    'system_announcement',       -- Sistem duyurusu
    'subscription_expiring',     -- Abonelik bitiyor
    'welcome',                   -- Hoş geldiniz
    'tips'                       -- İpuçları
);

-- Bildirim kanalları
CREATE TYPE notification_channel AS ENUM (
    'in_app',        -- Uygulama içi
    'email',         -- E-posta
    'sms',           -- SMS
    'push',          -- Push notification
    'whatsapp'       -- WhatsApp
);

-- Ana bildirim tablosu
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB,                              -- Ek veri (job_id, application_id vb.)
    action_url TEXT,                         -- Tıklandığında yönlenecek URL

    -- Durum
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    is_archived BOOLEAN DEFAULT false,

    -- Gönderim durumu
    channels_sent notification_channel[] DEFAULT '{}',
    email_sent_at TIMESTAMPTZ,
    sms_sent_at TIMESTAMPTZ,
    push_sent_at TIMESTAMPTZ,

    -- Meta
    priority TEXT DEFAULT 'normal',          -- 'low', 'normal', 'high', 'urgent'
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kullanıcı bildirim tercihleri
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,

    -- Kanal tercihleri
    in_app_enabled BOOLEAN DEFAULT true,
    email_enabled BOOLEAN DEFAULT true,
    sms_enabled BOOLEAN DEFAULT false,
    push_enabled BOOLEAN DEFAULT true,
    whatsapp_enabled BOOLEAN DEFAULT false,

    -- Tür bazlı tercihler
    application_notifications BOOLEAN DEFAULT true,
    message_notifications BOOLEAN DEFAULT true,
    job_notifications BOOLEAN DEFAULT true,
    profile_notifications BOOLEAN DEFAULT true,
    system_notifications BOOLEAN DEFAULT true,
    marketing_notifications BOOLEAN DEFAULT false,

    -- Zaman tercihleri
    quiet_hours_enabled BOOLEAN DEFAULT false,
    quiet_hours_start TIME DEFAULT '22:00',
    quiet_hours_end TIME DEFAULT '08:00',

    -- E-posta özet tercihi
    email_digest TEXT DEFAULT 'instant',     -- 'instant', 'daily', 'weekly', 'never'
    email_digest_time TIME DEFAULT '09:00',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bildirim şablonları
CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type notification_type NOT NULL UNIQUE,
    title_template TEXT NOT NULL,
    message_template TEXT NOT NULL,
    email_subject TEXT,
    email_body TEXT,
    sms_template TEXT,
    push_title TEXT,
    push_body TEXT,
    default_channels notification_channel[] DEFAULT '{in_app}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bildirim şablonlarını ekle
INSERT INTO notification_templates (type, title_template, message_template, email_subject, default_channels) VALUES
    ('new_application', 'Yeni Başvuru', '{{candidate_name}} {{job_title}} ilanınıza başvurdu.', 'Yeni Başvuru: {{job_title}}', '{in_app,email,push}'),
    ('application_viewed', 'Başvurunuz Görüntülendi', '{{company_name}} başvurunuzu inceledi.', 'Başvurunuz görüntülendi', '{in_app,push}'),
    ('application_shortlisted', 'Ön Seçime Alındınız', '{{company_name}} sizi ön seçime aldı.', 'Tebrikler! Ön seçime alındınız', '{in_app,email,push}'),
    ('interview_scheduled', 'Mülakat Planlandı', '{{company_name}} ile mülakatınız {{interview_date}} tarihine planlandı.', 'Mülakat Davetiyesi', '{in_app,email,sms,push}'),
    ('interview_reminder', 'Mülakat Hatırlatması', 'Yarın {{interview_time}} saatinde {{company_name}} ile mülakatınız var.', 'Mülakat Hatırlatması', '{in_app,email,push}'),
    ('offer_received', 'Teklif Aldınız', '{{company_name}} size iş teklifi gönderdi.', 'İş Teklifi Aldınız!', '{in_app,email,sms,push}'),
    ('application_rejected', 'Başvuru Sonucu', '{{company_name}} başvurunuzu değerlendirdi.', 'Başvuru Sonucu', '{in_app,email}'),
    ('application_hired', 'Tebrikler!', '{{company_name}} sizi işe aldı!', 'Tebrikler! İşe Alındınız', '{in_app,email,push}'),
    ('job_expiring', 'İlan Süresi Doluyor', '{{job_title}} ilanınızın süresi {{days}} gün içinde doluyor.', 'İlan Süresi Doluyor', '{in_app,email}'),
    ('new_matching_job', 'Size Uygun İlan', '{{company_name}} yeni bir {{position}} ilanı yayınladı.', 'Size Uygun Yeni İlan', '{in_app,email,push}'),
    ('new_message', 'Yeni Mesaj', '{{sender_name}} size mesaj gönderdi.', 'Yeni Mesajınız Var', '{in_app,push}'),
    ('profile_viewed', 'Profil Görüntüleme', '{{company_name}} profilinizi inceledi.', NULL, '{in_app}'),
    ('certificate_expiring', 'Sertifika Süresi Doluyor', '{{certificate_name}} sertifikanızın süresi {{days}} gün içinde doluyor.', 'Sertifika Yenileme Hatırlatması', '{in_app,email}'),
    ('reference_received', 'Referans Yanıtı', '{{referee_name}} referans talebinize yanıt verdi.', 'Referans Yanıtı Geldi', '{in_app,email,push}'),
    ('welcome', 'Hoş Geldiniz', 'Yeme İçme İşleri''ne hoş geldiniz! Profilinizi tamamlayarak başlayın.', 'Yeme İçme İşleri''ne Hoş Geldiniz', '{in_app,email}')
ON CONFLICT (type) DO NOTHING;

-- Okunmamış bildirim sayısı view'ı
CREATE OR REPLACE VIEW unread_notification_counts AS
SELECT
    user_id,
    COUNT(*) as total_unread,
    COUNT(*) FILTER (WHERE type IN ('new_application', 'application_viewed', 'application_shortlisted', 'interview_scheduled', 'offer_received', 'application_hired')) as application_unread,
    COUNT(*) FILTER (WHERE type IN ('new_message', 'message_reply')) as message_unread,
    COUNT(*) FILTER (WHERE type IN ('new_matching_job')) as job_unread,
    COUNT(*) FILTER (WHERE priority = 'urgent') as urgent_unread
FROM notifications
WHERE is_read = false
AND is_archived = false
AND (expires_at IS NULL OR expires_at > NOW())
GROUP BY user_id;

-- Indexler
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user ON notification_preferences(user_id);

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kullanıcılar kendi bildirimlerini görebilir"
    ON notifications FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Kullanıcılar kendi bildirimlerini güncelleyebilir"
    ON notifications FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Sistem bildirimleri ekleyebilir"
    ON notifications FOR INSERT
    WITH CHECK (true);  -- Uygulama tarafından kontrol edilecek

CREATE POLICY "Kullanıcılar kendi tercihlerini yönetebilir"
    ON notification_preferences FOR ALL
    USING (user_id = auth.uid());

CREATE POLICY "Bildirim şablonları herkese görünür"
    ON notification_templates FOR SELECT
    USING (is_active = true);

-- Bildirim oluşturma fonksiyonu
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_type notification_type,
    p_data JSONB DEFAULT NULL,
    p_action_url TEXT DEFAULT NULL,
    p_priority TEXT DEFAULT 'normal'
)
RETURNS UUID AS $$
DECLARE
    v_template notification_templates%ROWTYPE;
    v_notification_id UUID;
    v_title TEXT;
    v_message TEXT;
BEGIN
    -- Şablonu al
    SELECT * INTO v_template FROM notification_templates WHERE type = p_type;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Notification template not found for type: %', p_type;
    END IF;

    -- Şablonu doldur (basit değişken değiştirme)
    v_title := v_template.title_template;
    v_message := v_template.message_template;

    IF p_data IS NOT NULL THEN
        -- JSONB'deki her key için değiştir
        SELECT
            regexp_replace(
                regexp_replace(v_title, '\{\{' || key || '\}\}', value::text, 'g'),
                '\{\{' || key || '\}\}', value::text, 'g'
            ),
            regexp_replace(
                regexp_replace(v_message, '\{\{' || key || '\}\}', value::text, 'g'),
                '\{\{' || key || '\}\}', value::text, 'g'
            )
        INTO v_title, v_message
        FROM jsonb_each_text(p_data) AS x(key, value);
    END IF;

    -- Bildirimi oluştur
    INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        data,
        action_url,
        priority
    ) VALUES (
        p_user_id,
        p_type,
        v_title,
        v_message,
        p_data,
        p_action_url,
        p_priority
    )
    RETURNING id INTO v_notification_id;

    RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bildirimleri okundu işaretle
CREATE OR REPLACE FUNCTION mark_notifications_read(p_notification_ids UUID[])
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE notifications
    SET is_read = true,
        read_at = NOW()
    WHERE id = ANY(p_notification_ids)
    AND user_id = auth.uid()
    AND is_read = false;

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Tüm bildirimleri okundu işaretle
CREATE OR REPLACE FUNCTION mark_all_notifications_read()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE notifications
    SET is_read = true,
        read_at = NOW()
    WHERE user_id = auth.uid()
    AND is_read = false;

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE notifications IS 'Kullanıcı bildirimleri';
COMMENT ON TABLE notification_preferences IS 'Kullanıcı bildirim tercihleri';
COMMENT ON TABLE notification_templates IS 'Bildirim şablonları';
