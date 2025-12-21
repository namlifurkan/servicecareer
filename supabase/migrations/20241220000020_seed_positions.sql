-- =============================================
-- BAŞLANGIÇ VERİLERİ (SEED DATA)
-- Migration: 20241220000020_seed_positions.sql
-- =============================================

-- Mutfak türleri için Türkçe isimler
CREATE TABLE IF NOT EXISTS cuisine_type_names (
    cuisine_type cuisine_type PRIMARY KEY,
    name_tr TEXT NOT NULL,
    name_en TEXT NOT NULL,
    display_order INTEGER DEFAULT 0
);

INSERT INTO cuisine_type_names (cuisine_type, name_tr, name_en, display_order) VALUES
    ('turkish', 'Türk Mutfağı', 'Turkish Cuisine', 1),
    ('ottoman', 'Osmanlı Mutfağı', 'Ottoman Cuisine', 2),
    ('mediterranean', 'Akdeniz Mutfağı', 'Mediterranean Cuisine', 3),
    ('italian', 'İtalyan Mutfağı', 'Italian Cuisine', 4),
    ('french', 'Fransız Mutfağı', 'French Cuisine', 5),
    ('asian', 'Asya Mutfağı', 'Asian Cuisine', 6),
    ('japanese', 'Japon Mutfağı', 'Japanese Cuisine', 7),
    ('chinese', 'Çin Mutfağı', 'Chinese Cuisine', 8),
    ('indian', 'Hint Mutfağı', 'Indian Cuisine', 9),
    ('mexican', 'Meksika Mutfağı', 'Mexican Cuisine', 10),
    ('american', 'Amerikan Mutfağı', 'American Cuisine', 11),
    ('middle_eastern', 'Orta Doğu Mutfağı', 'Middle Eastern Cuisine', 12),
    ('seafood', 'Deniz Ürünleri', 'Seafood', 13),
    ('vegetarian', 'Vejetaryen', 'Vegetarian', 14),
    ('vegan', 'Vegan', 'Vegan', 15),
    ('fusion', 'Fusion', 'Fusion', 16),
    ('street_food', 'Sokak Lezzetleri', 'Street Food', 17),
    ('fine_dining', 'Fine Dining', 'Fine Dining', 18),
    ('casual_dining', 'Casual Dining', 'Casual Dining', 19),
    ('fast_food', 'Fast Food', 'Fast Food', 20),
    ('cafe_bakery', 'Kafe & Pastane', 'Cafe & Bakery', 21),
    ('other', 'Diğer', 'Other', 99)
ON CONFLICT (cuisine_type) DO UPDATE SET
    name_tr = EXCLUDED.name_tr,
    name_en = EXCLUDED.name_en,
    display_order = EXCLUDED.display_order;

-- Deneyim seviyesi isimleri
CREATE TABLE IF NOT EXISTS experience_level_names (
    experience_level service_experience_level PRIMARY KEY,
    name_tr TEXT NOT NULL,
    name_en TEXT NOT NULL,
    years_description TEXT,
    display_order INTEGER DEFAULT 0
);

INSERT INTO experience_level_names (experience_level, name_tr, name_en, years_description, display_order) VALUES
    ('no_experience', 'Deneyimsiz', 'No Experience', 'Yetiştirilir', 1),
    ('beginner', 'Başlangıç', 'Beginner', '0-1 Yıl', 2),
    ('intermediate', 'Orta', 'Intermediate', '1-3 Yıl', 3),
    ('experienced', 'Deneyimli', 'Experienced', '3-5 Yıl', 4),
    ('senior', 'Kıdemli', 'Senior', '5-10 Yıl', 5),
    ('expert', 'Uzman', 'Expert', '10+ Yıl', 6),
    ('master', 'Usta', 'Master', '15+ Yıl', 7)
ON CONFLICT (experience_level) DO UPDATE SET
    name_tr = EXCLUDED.name_tr,
    name_en = EXCLUDED.name_en,
    years_description = EXCLUDED.years_description,
    display_order = EXCLUDED.display_order;

-- Maaş ödeme tipi isimleri
CREATE TABLE IF NOT EXISTS salary_payment_type_names (
    payment_type salary_payment_type PRIMARY KEY,
    name_tr TEXT NOT NULL,
    name_en TEXT NOT NULL,
    display_order INTEGER DEFAULT 0
);

INSERT INTO salary_payment_type_names (payment_type, name_tr, name_en, display_order) VALUES
    ('monthly', 'Aylık', 'Monthly', 1),
    ('weekly', 'Haftalık', 'Weekly', 2),
    ('daily', 'Günlük (Yevmiye)', 'Daily', 3),
    ('hourly', 'Saatlik', 'Hourly', 4),
    ('per_delivery', 'Teslimat Başına', 'Per Delivery', 5)
ON CONFLICT (payment_type) DO UPDATE SET
    name_tr = EXCLUDED.name_tr,
    name_en = EXCLUDED.name_en,
    display_order = EXCLUDED.display_order;

-- Bahşiş politikası isimleri
CREATE TABLE IF NOT EXISTS tip_policy_names (
    tip_policy tip_policy PRIMARY KEY,
    name_tr TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0
);

INSERT INTO tip_policy_names (tip_policy, name_tr, name_en, description, display_order) VALUES
    ('individual', 'Bireysel Bahşiş', 'Individual Tips', 'Bahşişler kişiye özel', 1),
    ('pooled', 'Havuz Sistemi', 'Pooled Tips', 'Bahşişler bölüşülür', 2),
    ('service_charge', 'Servis Ücreti', 'Service Charge', 'Servis ücreti dahil', 3),
    ('no_tips', 'Bahşiş Yok', 'No Tips', 'Bahşiş alınmaz', 4)
ON CONFLICT (tip_policy) DO UPDATE SET
    name_tr = EXCLUDED.name_tr,
    name_en = EXCLUDED.name_en,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order;

-- Üniforma politikası isimleri
CREATE TABLE IF NOT EXISTS uniform_policy_names (
    uniform_policy uniform_policy PRIMARY KEY,
    name_tr TEXT NOT NULL,
    name_en TEXT NOT NULL,
    display_order INTEGER DEFAULT 0
);

INSERT INTO uniform_policy_names (uniform_policy, name_tr, name_en, display_order) VALUES
    ('provided', 'Üniforma Verilir', 'Uniform Provided', 1),
    ('allowance', 'Üniforma Yardımı', 'Uniform Allowance', 2),
    ('own_black', 'Siyah Kıyafet (Kendi)', 'Own Black Attire', 3),
    ('own_white', 'Beyaz Kıyafet (Kendi)', 'Own White Attire', 4),
    ('casual', 'Serbest Kıyafet', 'Casual', 5),
    ('smart_casual', 'Smart Casual', 'Smart Casual', 6),
    ('formal', 'Resmi', 'Formal', 7)
ON CONFLICT (uniform_policy) DO UPDATE SET
    name_tr = EXCLUDED.name_tr,
    name_en = EXCLUDED.name_en,
    display_order = EXCLUDED.display_order;

-- Yemek politikası isimleri
CREATE TABLE IF NOT EXISTS meal_policy_names (
    meal_policy meal_policy PRIMARY KEY,
    name_tr TEXT NOT NULL,
    name_en TEXT NOT NULL,
    display_order INTEGER DEFAULT 0
);

INSERT INTO meal_policy_names (meal_policy, name_tr, name_en, display_order) VALUES
    ('provided_all', 'Tüm Öğünler', 'All Meals Provided', 1),
    ('provided_shift', 'Vardiya Yemeği', 'Shift Meal', 2),
    ('discount', 'İndirimli Yemek', 'Discounted Meal', 3),
    ('not_provided', 'Yemek Yok', 'Not Provided', 4)
ON CONFLICT (meal_policy) DO UPDATE SET
    name_tr = EXCLUDED.name_tr,
    name_en = EXCLUDED.name_en,
    display_order = EXCLUDED.display_order;

-- Araç tipi isimleri
CREATE TABLE IF NOT EXISTS vehicle_type_names (
    vehicle_type vehicle_type PRIMARY KEY,
    name_tr TEXT NOT NULL,
    name_en TEXT NOT NULL,
    display_order INTEGER DEFAULT 0
);

INSERT INTO vehicle_type_names (vehicle_type, name_tr, name_en, display_order) VALUES
    ('motorcycle', 'Motosiklet', 'Motorcycle', 1),
    ('scooter', 'Scooter', 'Scooter', 2),
    ('bicycle', 'Bisiklet', 'Bicycle', 3),
    ('electric_bike', 'Elektrikli Bisiklet', 'Electric Bike', 4),
    ('car', 'Araba', 'Car', 5),
    ('van', 'Minivan', 'Van', 6),
    ('none', 'Araç Yok', 'None', 7)
ON CONFLICT (vehicle_type) DO UPDATE SET
    name_tr = EXCLUDED.name_tr,
    name_en = EXCLUDED.name_en,
    display_order = EXCLUDED.display_order;

-- Dil listesi
CREATE TABLE IF NOT EXISTS languages (
    code TEXT PRIMARY KEY,
    name_tr TEXT NOT NULL,
    name_en TEXT NOT NULL,
    display_order INTEGER DEFAULT 0
);

INSERT INTO languages (code, name_tr, name_en, display_order) VALUES
    ('tr', 'Türkçe', 'Turkish', 1),
    ('en', 'İngilizce', 'English', 2),
    ('de', 'Almanca', 'German', 3),
    ('fr', 'Fransızca', 'French', 4),
    ('ar', 'Arapça', 'Arabic', 5),
    ('ru', 'Rusça', 'Russian', 6),
    ('es', 'İspanyolca', 'Spanish', 7),
    ('it', 'İtalyanca', 'Italian', 8),
    ('zh', 'Çince', 'Chinese', 9),
    ('ja', 'Japonca', 'Japanese', 10),
    ('ko', 'Korece', 'Korean', 11),
    ('fa', 'Farsça', 'Persian', 12),
    ('ku', 'Kürtçe', 'Kurdish', 13),
    ('other', 'Diğer', 'Other', 99)
ON CONFLICT (code) DO UPDATE SET
    name_tr = EXCLUDED.name_tr,
    name_en = EXCLUDED.name_en,
    display_order = EXCLUDED.display_order;

-- Dil seviyeleri
CREATE TABLE IF NOT EXISTS language_levels (
    code TEXT PRIMARY KEY,
    name_tr TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0
);

INSERT INTO language_levels (code, name_tr, name_en, description, display_order) VALUES
    ('A1', 'Başlangıç', 'Beginner', 'Temel düzey', 1),
    ('A2', 'Temel', 'Elementary', 'Temel iletişim', 2),
    ('B1', 'Orta Altı', 'Intermediate', 'Günlük iletişim', 3),
    ('B2', 'Orta', 'Upper Intermediate', 'Akıcı iletişim', 4),
    ('C1', 'İleri', 'Advanced', 'Profesyonel düzey', 5),
    ('C2', 'Uzman', 'Proficient', 'Ana dil seviyesi', 6),
    ('native', 'Ana Dil', 'Native', 'Ana dil', 7)
ON CONFLICT (code) DO UPDATE SET
    name_tr = EXCLUDED.name_tr,
    name_en = EXCLUDED.name_en,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order;

-- RLS for lookup tables
ALTER TABLE cuisine_type_names ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience_level_names ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_payment_type_names ENABLE ROW LEVEL SECURITY;
ALTER TABLE tip_policy_names ENABLE ROW LEVEL SECURITY;
ALTER TABLE uniform_policy_names ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_policy_names ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_type_names ENABLE ROW LEVEL SECURITY;
ALTER TABLE languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE language_levels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lookup tables are public" ON cuisine_type_names FOR SELECT USING (true);
CREATE POLICY "Lookup tables are public" ON experience_level_names FOR SELECT USING (true);
CREATE POLICY "Lookup tables are public" ON salary_payment_type_names FOR SELECT USING (true);
CREATE POLICY "Lookup tables are public" ON tip_policy_names FOR SELECT USING (true);
CREATE POLICY "Lookup tables are public" ON uniform_policy_names FOR SELECT USING (true);
CREATE POLICY "Lookup tables are public" ON meal_policy_names FOR SELECT USING (true);
CREATE POLICY "Lookup tables are public" ON vehicle_type_names FOR SELECT USING (true);
CREATE POLICY "Lookup tables are public" ON languages FOR SELECT USING (true);
CREATE POLICY "Lookup tables are public" ON language_levels FOR SELECT USING (true);

-- Kategorileri güncelle (hizmet sektörüne özel)
UPDATE categories SET description = 'Executive şef, sous şef, kısım şefi, aşçı, hazırlık aşçısı, pizza ustası, döner ustası, sushi şefi, mangal ustası' WHERE slug = 'asci-mutfak';
UPDATE categories SET description = 'Garson, bayan garson, baş garson, komi, host/hostes, servis elemanı, salon şefi' WHERE slug = 'garsonluk-servis';
UPDATE categories SET description = 'Barista, kıdemli barista, kahve uzmanı, latte art, espresso uzmanı, demleme yöntemleri' WHERE slug = 'barista-kahve';
UPDATE categories SET description = 'Barmen, baş barmen, bar müdürü, sommelier, bar yardımcısı, kokteyl uzmanı, mixologist' WHERE slug = 'bar-icecek';
UPDATE categories SET description = 'Motorlu kurye, bisikletli kurye, teslimat koordinatörü, paket servis, yemek teslimat' WHERE slug = 'kurye-teslimat';
UPDATE categories SET description = 'Bulaşıkçı, temizlik görevlisi, mutfak temizliği, salon temizliği, genel temizlik' WHERE slug = 'temizlik-bulasik';
UPDATE categories SET description = 'Restoran müdürü, kafe müdürü, bar müdürü, salon şefi, vardiya amiri, F&B müdürü' WHERE slug = 'mudur-yonetici';
UPDATE categories SET description = 'Kasa görevlisi, ön büro, ödeme işlemleri, müşteri karşılama, POS kullanımı' WHERE slug = 'kasiyer';
UPDATE categories SET description = 'Fast food ekibi, hamburgerci, sandviççi, dürümcü, patates kızartma, hazır yemek' WHERE slug = 'fast-food';
UPDATE categories SET description = 'Pastacı, fırıncı, pasta şefi, pasta dekoratörü, hamur işi ustası, ekmek yapımı' WHERE slug = 'pastane-firin';
UPDATE categories SET description = 'Catering elemanı, organizasyon koordinatörü, banket görevlisi, etkinlik servisi' WHERE slug = 'catering-organizasyon';

COMMENT ON TABLE cuisine_type_names IS 'Mutfak türlerinin Türkçe/İngilizce isimleri';
COMMENT ON TABLE experience_level_names IS 'Deneyim seviyelerinin Türkçe/İngilizce isimleri';
COMMENT ON TABLE languages IS 'Desteklenen diller listesi';
COMMENT ON TABLE language_levels IS 'Dil seviyeleri (CEFR)';
