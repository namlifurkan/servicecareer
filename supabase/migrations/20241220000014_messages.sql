-- =============================================
-- MESAJLAŞMA SİSTEMİ
-- Migration: 20241220000014_messages.sql
-- =============================================

-- Mesaj konuşmaları
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    application_id UUID REFERENCES applications(id) ON DELETE SET NULL,

    -- Katılımcılar
    participant_1_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    participant_2_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Konuşma durumu
    is_active BOOLEAN DEFAULT true,
    is_blocked BOOLEAN DEFAULT false,
    blocked_by UUID REFERENCES profiles(id),
    blocked_at TIMESTAMPTZ,

    -- Son aktivite
    last_message_at TIMESTAMPTZ,
    last_message_preview TEXT,

    -- Okunma durumları
    participant_1_last_read_at TIMESTAMPTZ,
    participant_2_last_read_at TIMESTAMPTZ,
    participant_1_unread_count INTEGER DEFAULT 0,
    participant_2_unread_count INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(participant_1_id, participant_2_id, job_id)
);

-- Mesajlar
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Mesaj içeriği
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text',        -- 'text', 'image', 'file', 'system'
    attachment_url TEXT,
    attachment_name TEXT,
    attachment_size INTEGER,

    -- Durum
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMPTZ,

    -- Sistem mesajı için
    system_message_type TEXT,                -- 'interview_scheduled', 'offer_sent', etc.
    system_message_data JSONB,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mesaj şablonları (işverenler için hazır yanıtlar)
CREATE TABLE IF NOT EXISTS message_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    is_system BOOLEAN DEFAULT false,         -- Sistem şablonu mu

    -- Şablon bilgileri
    name TEXT NOT NULL,
    category TEXT,                           -- 'greeting', 'interview', 'rejection', 'offer', etc.
    content TEXT NOT NULL,
    variables TEXT[],                        -- Kullanılabilir değişkenler

    -- Kullanım
    use_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sistem şablonları ekle
INSERT INTO message_templates (is_system, name, category, content, variables) VALUES
    (true, 'Başvuru Teşekkür', 'greeting', 'Merhaba {{candidate_name}}, başvurunuz için teşekkür ederiz. En kısa sürede değerlendirip size dönüş yapacağız.', '{candidate_name}'),
    (true, 'Mülakat Daveti', 'interview', 'Merhaba {{candidate_name}}, başvurunuzu değerlendirdik ve sizinle tanışmak istiyoruz. {{interview_date}} tarihinde mülakata davet ediyoruz.', '{candidate_name,interview_date}'),
    (true, 'Mülakat Hatırlatma', 'interview', 'Merhaba {{candidate_name}}, yarın saat {{interview_time}}''de gerçekleşecek mülakatımızı hatırlatmak isteriz. Görüşmek üzere!', '{candidate_name,interview_time}'),
    (true, 'Deneme Günü Daveti', 'trial', 'Merhaba {{candidate_name}}, mülakat süreciniz olumlu geçti. {{trial_date}} tarihinde deneme çalışması için bekliyoruz.', '{candidate_name,trial_date}'),
    (true, 'İş Teklifi', 'offer', 'Merhaba {{candidate_name}}, değerlendirmelerimiz sonucunda size iş teklifi sunmaktan mutluluk duyuyoruz. Detaylar için lütfen bize ulaşın.', '{candidate_name}'),
    (true, 'Kibarca Red', 'rejection', 'Merhaba {{candidate_name}}, başvurunuz için teşekkür ederiz. Maalesef şu an için farklı bir profile yöneldik. Gelecekte açılacak pozisyonlarda tekrar değerlendirmek isteriz.', '{candidate_name}'),
    (true, 'Bilgi Talebi', 'info', 'Merhaba {{candidate_name}}, başvurunuzla ilgili ek bilgi almak istiyoruz. Müsait olduğunuzda bize dönüş yapabilir misiniz?', '{candidate_name}'),
    (true, 'İşe Alım Onay', 'hired', 'Merhaba {{candidate_name}}, işe alım süreciniz tamamlandı. {{start_date}} tarihinde sizi aramızda görmekten mutluluk duyacağız!', '{candidate_name,start_date}')
ON CONFLICT DO NOTHING;

-- Konuşma özeti view'ı
CREATE OR REPLACE VIEW conversation_summary AS
SELECT
    c.id,
    c.job_id,
    c.application_id,
    c.participant_1_id,
    c.participant_2_id,
    c.last_message_at,
    c.last_message_preview,
    c.is_active,
    c.is_blocked,
    j.title as job_title,
    p1.full_name as participant_1_name,
    p1.avatar_url as participant_1_avatar,
    p2.full_name as participant_2_name,
    p2.avatar_url as participant_2_avatar,
    CASE
        WHEN c.participant_1_id = auth.uid() THEN c.participant_1_unread_count
        ELSE c.participant_2_unread_count
    END as my_unread_count
FROM conversations c
LEFT JOIN jobs j ON c.job_id = j.id
LEFT JOIN profiles p1 ON c.participant_1_id = p1.id
LEFT JOIN profiles p2 ON c.participant_2_id = p2.id
WHERE c.participant_1_id = auth.uid() OR c.participant_2_id = auth.uid();

-- Indexler
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations(participant_1_id, participant_2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_job ON conversations(job_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(conversation_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_message_templates_company ON message_templates(company_id);

-- RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;

-- Konuşmalar
CREATE POLICY "Kullanıcılar kendi konuşmalarını görebilir"
    ON conversations FOR SELECT
    USING (participant_1_id = auth.uid() OR participant_2_id = auth.uid());

CREATE POLICY "Kullanıcılar konuşma başlatabilir"
    ON conversations FOR INSERT
    WITH CHECK (participant_1_id = auth.uid() OR participant_2_id = auth.uid());

CREATE POLICY "Kullanıcılar kendi konuşmalarını güncelleyebilir"
    ON conversations FOR UPDATE
    USING (participant_1_id = auth.uid() OR participant_2_id = auth.uid());

-- Mesajlar
CREATE POLICY "Kullanıcılar konuşmalarındaki mesajları görebilir"
    ON messages FOR SELECT
    USING (
        conversation_id IN (
            SELECT id FROM conversations
            WHERE participant_1_id = auth.uid() OR participant_2_id = auth.uid()
        )
    );

CREATE POLICY "Kullanıcılar mesaj gönderebilir"
    ON messages FOR INSERT
    WITH CHECK (
        sender_id = auth.uid() AND
        conversation_id IN (
            SELECT id FROM conversations
            WHERE (participant_1_id = auth.uid() OR participant_2_id = auth.uid())
            AND is_active = true
            AND is_blocked = false
        )
    );

CREATE POLICY "Kullanıcılar kendi mesajlarını silebilir"
    ON messages FOR UPDATE
    USING (sender_id = auth.uid());

-- Şablonlar
CREATE POLICY "Sistem şablonları herkese görünür"
    ON message_templates FOR SELECT
    USING (is_system = true);

CREATE POLICY "Şirketler kendi şablonlarını yönetebilir"
    ON message_templates FOR ALL
    USING (
        company_id IN (
            SELECT id FROM companies WHERE owner_id = auth.uid()
        )
    );

-- Mesaj gönderildiğinde konuşmayı güncelle
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations
    SET last_message_at = NEW.created_at,
        last_message_preview = LEFT(NEW.content, 100),
        updated_at = NOW(),
        participant_1_unread_count = CASE
            WHEN NEW.sender_id = participant_1_id THEN participant_1_unread_count
            ELSE participant_1_unread_count + 1
        END,
        participant_2_unread_count = CASE
            WHEN NEW.sender_id = participant_2_id THEN participant_2_unread_count
            ELSE participant_2_unread_count + 1
        END
    WHERE id = NEW.conversation_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS message_insert_trigger ON messages;
CREATE TRIGGER message_insert_trigger
    AFTER INSERT ON messages
    FOR EACH ROW EXECUTE FUNCTION update_conversation_on_message();

-- Konuşma başlatma/bulma fonksiyonu
CREATE OR REPLACE FUNCTION get_or_create_conversation(
    p_other_user_id UUID,
    p_job_id UUID DEFAULT NULL,
    p_application_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_conversation_id UUID;
    v_user_1 UUID;
    v_user_2 UUID;
BEGIN
    -- Katılımcıları sırala (tutarlılık için)
    IF auth.uid() < p_other_user_id THEN
        v_user_1 := auth.uid();
        v_user_2 := p_other_user_id;
    ELSE
        v_user_1 := p_other_user_id;
        v_user_2 := auth.uid();
    END IF;

    -- Mevcut konuşmayı ara
    SELECT id INTO v_conversation_id
    FROM conversations
    WHERE participant_1_id = v_user_1
    AND participant_2_id = v_user_2
    AND (job_id = p_job_id OR (job_id IS NULL AND p_job_id IS NULL));

    -- Yoksa oluştur
    IF NOT FOUND THEN
        INSERT INTO conversations (
            participant_1_id,
            participant_2_id,
            job_id,
            application_id
        ) VALUES (
            v_user_1,
            v_user_2,
            p_job_id,
            p_application_id
        )
        RETURNING id INTO v_conversation_id;
    END IF;

    RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mesajları okundu işaretle
CREATE OR REPLACE FUNCTION mark_conversation_read(p_conversation_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Mesajları okundu işaretle
    UPDATE messages
    SET is_read = true,
        read_at = NOW()
    WHERE conversation_id = p_conversation_id
    AND sender_id != auth.uid()
    AND is_read = false;

    -- Konuşmadaki okunmamış sayısını sıfırla
    UPDATE conversations
    SET participant_1_last_read_at = CASE WHEN participant_1_id = auth.uid() THEN NOW() ELSE participant_1_last_read_at END,
        participant_2_last_read_at = CASE WHEN participant_2_id = auth.uid() THEN NOW() ELSE participant_2_last_read_at END,
        participant_1_unread_count = CASE WHEN participant_1_id = auth.uid() THEN 0 ELSE participant_1_unread_count END,
        participant_2_unread_count = CASE WHEN participant_2_id = auth.uid() THEN 0 ELSE participant_2_unread_count END
    WHERE id = p_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE conversations IS 'Mesaj konuşmaları';
COMMENT ON TABLE messages IS 'Mesajlar';
COMMENT ON TABLE message_templates IS 'İşveren mesaj şablonları';
