-- =============================================
-- GENİŞLETİLMİŞ İLAN TABLOSU
-- Migration: 20241220000006_extended_jobs.sql
-- =============================================

-- Mevcut jobs tablosunu genişlet
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS position_type job_position_type,
ADD COLUMN IF NOT EXISTS venue_type venue_type,
ADD COLUMN IF NOT EXISTS cuisine_types cuisine_type[],
ADD COLUMN IF NOT EXISTS service_experience_required service_experience_level DEFAULT 'no_experience',
ADD COLUMN IF NOT EXISTS urgency_level TEXT DEFAULT 'normal',  -- 'normal', 'urgent', 'very_urgent'
ADD COLUMN IF NOT EXISTS is_urgent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS positions_available INTEGER DEFAULT 1,    -- Kaç kişi alınacak
ADD COLUMN IF NOT EXISTS gender_preference TEXT,                    -- 'male', 'female', 'any'
ADD COLUMN IF NOT EXISTS age_min INTEGER,
ADD COLUMN IF NOT EXISTS age_max INTEGER,
ADD COLUMN IF NOT EXISTS military_status_required TEXT,             -- 'completed', 'exempt', 'any'
ADD COLUMN IF NOT EXISTS nationality_preference TEXT[],
ADD COLUMN IF NOT EXISTS salary_payment_type salary_payment_type DEFAULT 'monthly',
ADD COLUMN IF NOT EXISTS tip_policy tip_policy,
ADD COLUMN IF NOT EXISTS uniform_policy uniform_policy,
ADD COLUMN IF NOT EXISTS meal_policy meal_policy,
ADD COLUMN IF NOT EXISTS accommodation_policy accommodation_policy,
ADD COLUMN IF NOT EXISTS has_insurance BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS has_bonus BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS bonus_description TEXT,
ADD COLUMN IF NOT EXISTS trial_period_days INTEGER DEFAULT 0,       -- Deneme süresi
ADD COLUMN IF NOT EXISTS contact_method TEXT DEFAULT 'platform',    -- 'platform', 'phone', 'whatsapp', 'email'
ADD COLUMN IF NOT EXISTS contact_phone TEXT,
ADD COLUMN IF NOT EXISTS contact_whatsapp TEXT,
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS contact_person TEXT,                       -- İletişim kişisi
ADD COLUMN IF NOT EXISTS hide_company_name BOOLEAN DEFAULT false,   -- Şirket adı gizlensin mi
ADD COLUMN IF NOT EXISTS application_type TEXT DEFAULT 'all',      -- 'registered_only', 'guest_allowed', 'all'
ADD COLUMN IF NOT EXISTS auto_reject_unqualified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS internal_notes TEXT,                       -- Sadece işveren görebilir
ADD COLUMN IF NOT EXISTS rejection_reason_required BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS quick_apply_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS premium_level INTEGER DEFAULT 0;           -- 0: normal, 1: öne çıkan, 2: premium

-- Pozisyon tipleri için Türkçe isimler tablosu
CREATE TABLE IF NOT EXISTS position_type_names (
    position_type job_position_type PRIMARY KEY,
    name_tr TEXT NOT NULL,
    name_en TEXT NOT NULL,
    category TEXT NOT NULL,                  -- 'kitchen', 'service', 'bar', 'delivery', 'management', 'support', 'other'
    description TEXT,
    typical_salary_min INTEGER,
    typical_salary_max INTEGER,
    required_certificates certificate_type[],
    display_order INTEGER DEFAULT 0
);

-- Pozisyon isimlerini ekle
INSERT INTO position_type_names (position_type, name_tr, name_en, category, description, typical_salary_min, typical_salary_max, display_order) VALUES
    -- Mutfak
    ('executive_chef', 'Executive Şef', 'Executive Chef', 'kitchen', 'Mutfağın en üst düzey yöneticisi', 80000, 150000, 1),
    ('sous_chef', 'Sous Şef', 'Sous Chef', 'kitchen', 'Executive şefin yardımcısı', 50000, 80000, 2),
    ('chef_de_partie', 'Kısım Şefi', 'Chef de Partie', 'kitchen', 'Belirli bir mutfak bölümünün sorumlusu', 35000, 50000, 3),
    ('line_cook', 'Aşçı', 'Line Cook', 'kitchen', 'Yemek hazırlayan mutfak personeli', 25000, 40000, 4),
    ('prep_cook', 'Hazırlık Aşçısı', 'Prep Cook', 'kitchen', 'Malzeme hazırlama ve ön hazırlık', 20000, 30000, 5),
    ('pastry_chef', 'Pasta Şefi', 'Pastry Chef', 'kitchen', 'Tatlı ve pastane ürünleri uzmanı', 40000, 70000, 6),
    ('pizza_chef', 'Pizza Ustası', 'Pizza Chef', 'kitchen', 'Pizza hazırlama uzmanı', 30000, 50000, 7),
    ('grill_master', 'Mangal/Izgara Ustası', 'Grill Master', 'kitchen', 'Izgara ve mangal uzmanı', 30000, 50000, 8),
    ('doner_master', 'Döner Ustası', 'Doner Master', 'kitchen', 'Döner kesim ve hazırlama uzmanı', 25000, 45000, 9),
    ('sushi_chef', 'Sushi Şefi', 'Sushi Chef', 'kitchen', 'Japon mutfağı ve sushi uzmanı', 40000, 70000, 10),
    ('kitchen_helper', 'Mutfak Yardımcısı', 'Kitchen Helper', 'kitchen', 'Genel mutfak destek personeli', 17000, 25000, 11),

    -- Servis
    ('restaurant_manager', 'Restoran Müdürü', 'Restaurant Manager', 'management', 'Restoran işletme yöneticisi', 60000, 100000, 20),
    ('floor_manager', 'Salon Şefi', 'Floor Manager', 'management', 'Servis alanı yöneticisi', 40000, 60000, 21),
    ('head_waiter', 'Baş Garson', 'Head Waiter', 'service', 'Garson ekibinin sorumlusu', 30000, 45000, 22),
    ('waiter', 'Garson', 'Waiter', 'service', 'Erkek servis personeli', 20000, 35000, 23),
    ('waitress', 'Bayan Garson', 'Waitress', 'service', 'Kadın servis personeli', 20000, 35000, 24),
    ('busser', 'Komi', 'Busser', 'service', 'Masa temizleme ve destek', 17000, 25000, 25),
    ('host_hostess', 'Host/Hostes', 'Host/Hostess', 'service', 'Müşteri karşılama ve yerleştirme', 22000, 35000, 26),
    ('food_runner', 'Servis Elemanı', 'Food Runner', 'service', 'Yemek taşıma personeli', 18000, 28000, 27),

    -- Bar
    ('bar_manager', 'Bar Müdürü', 'Bar Manager', 'management', 'Bar işletme yöneticisi', 50000, 80000, 30),
    ('head_bartender', 'Baş Barmen', 'Head Bartender', 'bar', 'Barmen ekibinin sorumlusu', 35000, 55000, 31),
    ('bartender', 'Barmen', 'Bartender', 'bar', 'İçecek hazırlama uzmanı', 25000, 45000, 32),
    ('barista', 'Barista', 'Barista', 'bar', 'Kahve hazırlama uzmanı', 20000, 35000, 33),
    ('senior_barista', 'Kıdemli Barista', 'Senior Barista', 'bar', 'Deneyimli kahve uzmanı', 25000, 40000, 34),
    ('sommelier', 'Sommelier', 'Sommelier', 'bar', 'Şarap uzmanı', 40000, 70000, 35),
    ('barback', 'Bar Yardımcısı', 'Barback', 'bar', 'Bar destek personeli', 17000, 25000, 36),

    -- Kafe
    ('cafe_manager', 'Kafe Müdürü', 'Cafe Manager', 'management', 'Kafe işletme yöneticisi', 40000, 60000, 40),
    ('cafe_attendant', 'Kafe Görevlisi', 'Cafe Attendant', 'service', 'Genel kafe personeli', 18000, 28000, 41),

    -- Teslimat
    ('delivery_driver', 'Motorlu Kurye', 'Delivery Driver', 'delivery', 'Motorlu araçla teslimat', 20000, 35000, 50),
    ('bicycle_courier', 'Bisikletli Kurye', 'Bicycle Courier', 'delivery', 'Bisikletle teslimat', 18000, 30000, 51),
    ('delivery_coordinator', 'Teslimat Koordinatörü', 'Delivery Coordinator', 'management', 'Teslimat operasyonu yönetimi', 35000, 50000, 52),

    -- Destek
    ('dishwasher', 'Bulaşıkçı', 'Dishwasher', 'support', 'Bulaşık yıkama personeli', 17000, 23000, 60),
    ('cleaner', 'Temizlik Görevlisi', 'Cleaner', 'support', 'Genel temizlik personeli', 17000, 23000, 61),
    ('cashier', 'Kasiyer', 'Cashier', 'support', 'Kasa ve ödeme işlemleri', 20000, 30000, 62),
    ('security', 'Güvenlik', 'Security', 'support', 'Güvenlik personeli', 25000, 40000, 63),

    -- Fast Food
    ('fast_food_crew', 'Fast Food Ekibi', 'Fast Food Crew', 'service', 'Fast food restoran personeli', 17000, 25000, 70),
    ('shift_supervisor', 'Vardiya Amiri', 'Shift Supervisor', 'management', 'Vardiya sorumlusu', 25000, 40000, 71),

    -- Catering & Organizasyon
    ('catering_manager', 'Catering Müdürü', 'Catering Manager', 'management', 'Catering operasyon yöneticisi', 50000, 80000, 80),
    ('event_coordinator', 'Organizasyon Koordinatörü', 'Event Coordinator', 'management', 'Etkinlik planlama ve yönetimi', 40000, 60000, 81),
    ('banquet_server', 'Banket Görevlisi', 'Banquet Server', 'service', 'Organizasyon servis personeli', 20000, 30000, 82),

    -- Pastane & Fırın
    ('baker', 'Fırıncı', 'Baker', 'kitchen', 'Ekmek ve unlu mamul uzmanı', 25000, 40000, 90),
    ('pastry_cook', 'Pastacı', 'Pastry Cook', 'kitchen', 'Pasta ve tatlı hazırlama', 22000, 35000, 91),
    ('cake_decorator', 'Pasta Dekoratörü', 'Cake Decorator', 'kitchen', 'Pasta süsleme uzmanı', 25000, 40000, 92),

    -- Otel F&B
    ('fb_manager', 'F&B Müdürü', 'F&B Manager', 'management', 'Yiyecek içecek departman müdürü', 70000, 120000, 100),
    ('room_service', 'Oda Servisi', 'Room Service', 'service', 'Otel oda servisi personeli', 22000, 35000, 101),
    ('breakfast_attendant', 'Kahvaltı Görevlisi', 'Breakfast Attendant', 'service', 'Kahvaltı servisi personeli', 18000, 28000, 102),

    -- Diğer
    ('other', 'Diğer', 'Other', 'other', 'Diğer pozisyonlar', 17000, 30000, 999)
ON CONFLICT (position_type) DO UPDATE SET
    name_tr = EXCLUDED.name_tr,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    typical_salary_min = EXCLUDED.typical_salary_min,
    typical_salary_max = EXCLUDED.typical_salary_max,
    display_order = EXCLUDED.display_order;

-- Mekan tipleri için Türkçe isimler
CREATE TABLE IF NOT EXISTS venue_type_names (
    venue_type venue_type PRIMARY KEY,
    name_tr TEXT NOT NULL,
    name_en TEXT NOT NULL,
    category TEXT NOT NULL,                  -- 'restaurant', 'cafe', 'bar', 'hotel', 'catering', 'other'
    description TEXT,
    display_order INTEGER DEFAULT 0
);

INSERT INTO venue_type_names (venue_type, name_tr, name_en, category, display_order) VALUES
    ('fine_dining_restaurant', 'Fine Dining Restoran', 'Fine Dining Restaurant', 'restaurant', 1),
    ('casual_restaurant', 'Günlük Restoran', 'Casual Restaurant', 'restaurant', 2),
    ('fast_food_restaurant', 'Fast Food', 'Fast Food Restaurant', 'restaurant', 3),
    ('cafe', 'Kafe', 'Cafe', 'cafe', 10),
    ('coffee_shop', 'Kahve Dükkanı', 'Coffee Shop', 'cafe', 11),
    ('pub', 'Pub', 'Pub', 'bar', 20),
    ('bar', 'Bar', 'Bar', 'bar', 21),
    ('nightclub', 'Gece Kulübü', 'Nightclub', 'bar', 22),
    ('lounge', 'Lounge', 'Lounge', 'bar', 23),
    ('rooftop', 'Rooftop', 'Rooftop', 'bar', 24),
    ('hotel_restaurant', 'Otel Restoranı', 'Hotel Restaurant', 'hotel', 30),
    ('hotel_bar', 'Otel Barı', 'Hotel Bar', 'hotel', 31),
    ('beach_club', 'Beach Club', 'Beach Club', 'bar', 32),
    ('patisserie', 'Pastane', 'Patisserie', 'cafe', 40),
    ('bakery', 'Fırın', 'Bakery', 'cafe', 41),
    ('food_truck', 'Yemek Tırı', 'Food Truck', 'other', 50),
    ('catering_company', 'Catering Şirketi', 'Catering Company', 'catering', 51),
    ('canteen', 'Yemekhane', 'Canteen', 'catering', 52),
    ('buffet', 'Açık Büfe', 'Buffet', 'restaurant', 53),
    ('diner', 'Lokanta', 'Diner', 'restaurant', 54),
    ('kebab_house', 'Kebapçı', 'Kebab House', 'restaurant', 55),
    ('pide_lahmacun', 'Pide/Lahmacun Salonu', 'Pide/Lahmacun', 'restaurant', 56),
    ('fish_restaurant', 'Balık Restoranı', 'Fish Restaurant', 'restaurant', 57),
    ('steakhouse', 'Steakhouse', 'Steakhouse', 'restaurant', 58),
    ('pizzeria', 'Pizzacı', 'Pizzeria', 'restaurant', 59),
    ('sushi_bar', 'Sushi Bar', 'Sushi Bar', 'restaurant', 60),
    ('ice_cream_shop', 'Dondurma Dükkanı', 'Ice Cream Shop', 'cafe', 61),
    ('dessert_shop', 'Tatlıcı', 'Dessert Shop', 'cafe', 62),
    ('tea_house', 'Çay Bahçesi', 'Tea House', 'cafe', 63),
    ('hookah_lounge', 'Nargile Kafe', 'Hookah Lounge', 'cafe', 64),
    ('other', 'Diğer', 'Other', 'other', 99)
ON CONFLICT (venue_type) DO UPDATE SET
    name_tr = EXCLUDED.name_tr,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    display_order = EXCLUDED.display_order;

-- Indexler
CREATE INDEX IF NOT EXISTS idx_jobs_position_type ON jobs(position_type);
CREATE INDEX IF NOT EXISTS idx_jobs_venue_type ON jobs(venue_type);
CREATE INDEX IF NOT EXISTS idx_jobs_cuisine_types ON jobs USING GIN(cuisine_types);
CREATE INDEX IF NOT EXISTS idx_jobs_urgency ON jobs(urgency_level);
CREATE INDEX IF NOT EXISTS idx_jobs_is_urgent ON jobs(is_urgent DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_premium ON jobs(premium_level DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_experience_required ON jobs(service_experience_required);

-- RLS for lookup tables
ALTER TABLE position_type_names ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_type_names ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Pozisyon tipleri herkese görünür" ON position_type_names;
CREATE POLICY "Pozisyon tipleri herkese görünür"
    ON position_type_names FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Mekan tipleri herkese görünür" ON venue_type_names;
CREATE POLICY "Mekan tipleri herkese görünür"
    ON venue_type_names FOR SELECT
    USING (true);

COMMENT ON TABLE position_type_names IS 'Pozisyon tiplerinin Türkçe/İngilizce isimleri ve metadata';
COMMENT ON TABLE venue_type_names IS 'Mekan tiplerinin Türkçe/İngilizce isimleri';
