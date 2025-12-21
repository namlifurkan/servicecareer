-- =============================================
-- ÇALIŞMA SAATLERİ
-- Migration: 20241220000009_working_hours.sql
-- =============================================

-- İş çalışma saatleri tablosu
CREATE TABLE IF NOT EXISTS job_working_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,

    -- Vardiya bilgisi
    shift_types shift_type[] NOT NULL DEFAULT '{}',
    working_days working_days,

    -- Detaylı saatler
    monday_start TIME,
    monday_end TIME,
    monday_off BOOLEAN DEFAULT false,

    tuesday_start TIME,
    tuesday_end TIME,
    tuesday_off BOOLEAN DEFAULT false,

    wednesday_start TIME,
    wednesday_end TIME,
    wednesday_off BOOLEAN DEFAULT false,

    thursday_start TIME,
    thursday_end TIME,
    thursday_off BOOLEAN DEFAULT false,

    friday_start TIME,
    friday_end TIME,
    friday_off BOOLEAN DEFAULT false,

    saturday_start TIME,
    saturday_end TIME,
    saturday_off BOOLEAN DEFAULT false,

    sunday_start TIME,
    sunday_end TIME,
    sunday_off BOOLEAN DEFAULT false,

    -- Genel bilgiler
    weekly_hours INTEGER,                    -- Haftalık çalışma saati
    break_duration_minutes INTEGER DEFAULT 60, -- Mola süresi (dakika)
    is_break_paid BOOLEAN DEFAULT false,
    overtime_expected BOOLEAN DEFAULT false,
    overtime_frequency TEXT,                 -- 'never', 'rarely', 'sometimes', 'often', 'always'

    -- Özel durumlar
    shift_rotation TEXT,                     -- Vardiya rotasyonu açıklaması
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(job_id)
);

-- Vardiya tipleri için Türkçe isimler
CREATE TABLE IF NOT EXISTS shift_type_names (
    shift_type shift_type PRIMARY KEY,
    name_tr TEXT NOT NULL,
    name_en TEXT NOT NULL,
    time_range TEXT,                         -- "06:00 - 14:00"
    description TEXT,
    display_order INTEGER DEFAULT 0
);

INSERT INTO shift_type_names (shift_type, name_tr, name_en, time_range, description, display_order) VALUES
    ('morning', 'Sabah Vardiyası', 'Morning Shift', '06:00 - 14:00', 'Erken sabah başlayan vardiya', 1),
    ('afternoon', 'Öğlen Vardiyası', 'Afternoon Shift', '14:00 - 22:00', 'Öğleden akşama vardiya', 2),
    ('evening', 'Akşam Vardiyası', 'Evening Shift', '18:00 - 02:00', 'Akşam başlayan gece vardiyası', 3),
    ('night', 'Gece Vardiyası', 'Night Shift', '22:00 - 06:00', 'Gece boyunca çalışma', 4),
    ('split', 'Bölünmüş Vardiya', 'Split Shift', 'Değişken', 'Gün içinde bölünmüş çalışma', 5),
    ('rotating', 'Dönüşümlü Vardiya', 'Rotating Shift', 'Değişken', 'Haftalık değişen vardiya', 6),
    ('flexible', 'Esnek Çalışma', 'Flexible Hours', 'Esnek', 'Esnek çalışma saatleri', 7),
    ('weekend_only', 'Sadece Hafta Sonu', 'Weekend Only', 'Cumartesi-Pazar', 'Sadece hafta sonu çalışma', 8),
    ('weekday_only', 'Sadece Hafta İçi', 'Weekday Only', 'Pazartesi-Cuma', 'Sadece hafta içi çalışma', 9)
ON CONFLICT (shift_type) DO UPDATE SET
    name_tr = EXCLUDED.name_tr,
    name_en = EXCLUDED.name_en,
    time_range = EXCLUDED.time_range,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order;

-- Çalışma günleri için Türkçe isimler
CREATE TABLE IF NOT EXISTS working_days_names (
    working_days working_days PRIMARY KEY,
    name_tr TEXT NOT NULL,
    name_en TEXT NOT NULL,
    days_per_week INTEGER,
    off_day TEXT,
    display_order INTEGER DEFAULT 0
);

INSERT INTO working_days_names (working_days, name_tr, name_en, days_per_week, off_day, display_order) VALUES
    ('monday_friday', 'Pazartesi - Cuma', 'Monday - Friday', 5, 'Cumartesi-Pazar', 1),
    ('monday_saturday', 'Pazartesi - Cumartesi', 'Monday - Saturday', 6, 'Pazar', 2),
    ('tuesday_sunday', 'Salı - Pazar', 'Tuesday - Sunday', 6, 'Pazartesi', 3),
    ('all_week', 'Haftanın 7 Günü (Rotasyon)', '7 Days (Rotation)', 6, 'Rotasyonlu', 4),
    ('weekends_only', 'Sadece Hafta Sonu', 'Weekends Only', 2, 'Hafta içi', 5),
    ('flexible', 'Esnek', 'Flexible', NULL, 'Değişken', 6)
ON CONFLICT (working_days) DO UPDATE SET
    name_tr = EXCLUDED.name_tr,
    name_en = EXCLUDED.name_en,
    days_per_week = EXCLUDED.days_per_week,
    off_day = EXCLUDED.off_day,
    display_order = EXCLUDED.display_order;

-- Indexler
CREATE INDEX IF NOT EXISTS idx_job_working_hours_job ON job_working_hours(job_id);
CREATE INDEX IF NOT EXISTS idx_job_working_hours_shifts ON job_working_hours USING GIN(shift_types);
CREATE INDEX IF NOT EXISTS idx_job_working_hours_days ON job_working_hours(working_days);

-- RLS
ALTER TABLE job_working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_type_names ENABLE ROW LEVEL SECURITY;
ALTER TABLE working_days_names ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Çalışma saatleri herkese görünür"
    ON job_working_hours FOR SELECT
    USING (true);

CREATE POLICY "Şirketler kendi ilanlarının çalışma saatlerini yönetebilir"
    ON job_working_hours FOR ALL
    USING (
        job_id IN (
            SELECT id FROM jobs WHERE company_id IN (
                SELECT id FROM companies WHERE owner_id = auth.uid()
            )
        )
    );

CREATE POLICY "Vardiya tipleri herkese görünür"
    ON shift_type_names FOR SELECT
    USING (true);

CREATE POLICY "Çalışma günleri herkese görünür"
    ON working_days_names FOR SELECT
    USING (true);

-- Çalışma saati özeti fonksiyonu
CREATE OR REPLACE FUNCTION get_working_hours_summary(p_job_id UUID)
RETURNS TEXT AS $$
DECLARE
    v_hours job_working_hours%ROWTYPE;
    v_summary TEXT := '';
    v_shifts TEXT[];
BEGIN
    SELECT * INTO v_hours FROM job_working_hours WHERE job_id = p_job_id;

    IF NOT FOUND THEN
        RETURN NULL;
    END IF;

    -- Vardiyaları Türkçe'ye çevir
    SELECT array_agg(stn.name_tr)
    INTO v_shifts
    FROM unnest(v_hours.shift_types) st
    JOIN shift_type_names stn ON st = stn.shift_type;

    IF v_shifts IS NOT NULL THEN
        v_summary := array_to_string(v_shifts, ', ');
    END IF;

    -- Haftalık saat ekle
    IF v_hours.weekly_hours IS NOT NULL THEN
        v_summary := v_summary || ' | Haftalık ' || v_hours.weekly_hours || ' saat';
    END IF;

    RETURN v_summary;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE job_working_hours IS 'İlan çalışma saatleri ve vardiya bilgileri';
COMMENT ON TABLE shift_type_names IS 'Vardiya tiplerinin Türkçe/İngilizce isimleri';
COMMENT ON TABLE working_days_names IS 'Çalışma günlerinin Türkçe/İngilizce isimleri';
