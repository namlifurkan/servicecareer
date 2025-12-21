-- =============================================
-- ADAY YETENEKLERİ
-- Migration: 20241220000005_candidate_skills.sql
-- =============================================

-- Ana yetenekler tablosu (sistem tanımlı)
CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    name_en TEXT,
    category TEXT NOT NULL,                  -- 'kitchen', 'service', 'bar', 'delivery', 'management', 'language', 'software', 'other'
    subcategory TEXT,                        -- Alt kategori
    description TEXT,
    icon TEXT,                               -- Emoji veya icon ismi
    relevant_positions job_position_type[],  -- İlgili pozisyonlar
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Aday-Yetenek ilişki tablosu
CREATE TABLE IF NOT EXISTS candidate_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    proficiency_level INTEGER DEFAULT 3 CHECK (proficiency_level BETWEEN 1 AND 5),  -- 1-5 arası
    years_of_experience NUMERIC(3,1),        -- Yıl deneyimi
    is_primary BOOLEAN DEFAULT false,        -- Ana yetenek mi
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(candidate_id, skill_id)
);

-- Özel yetenekler (kullanıcı tanımlı)
CREATE TABLE IF NOT EXISTS candidate_custom_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'other',
    proficiency_level INTEGER DEFAULT 3 CHECK (proficiency_level BETWEEN 1 AND 5),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(candidate_id, name)
);

-- Sistem yeteneklerini ekle
INSERT INTO skills (name, name_en, category, subcategory, relevant_positions, display_order) VALUES
    -- MUTFAK YETENEKLERİ
    ('Türk Mutfağı', 'Turkish Cuisine', 'kitchen', 'cuisine', ARRAY['line_cook', 'chef_de_partie', 'sous_chef', 'executive_chef']::job_position_type[], 1),
    ('Osmanlı Mutfağı', 'Ottoman Cuisine', 'kitchen', 'cuisine', ARRAY['line_cook', 'chef_de_partie', 'sous_chef', 'executive_chef']::job_position_type[], 2),
    ('İtalyan Mutfağı', 'Italian Cuisine', 'kitchen', 'cuisine', ARRAY['line_cook', 'chef_de_partie', 'sous_chef', 'executive_chef', 'pizza_chef']::job_position_type[], 3),
    ('Fransız Mutfağı', 'French Cuisine', 'kitchen', 'cuisine', ARRAY['line_cook', 'chef_de_partie', 'sous_chef', 'executive_chef']::job_position_type[], 4),
    ('Uzak Doğu Mutfağı', 'Asian Cuisine', 'kitchen', 'cuisine', ARRAY['line_cook', 'chef_de_partie', 'sous_chef', 'executive_chef', 'sushi_chef']::job_position_type[], 5),
    ('Japon Mutfağı / Sushi', 'Japanese Cuisine / Sushi', 'kitchen', 'cuisine', ARRAY['sushi_chef', 'line_cook']::job_position_type[], 6),
    ('Akdeniz Mutfağı', 'Mediterranean Cuisine', 'kitchen', 'cuisine', ARRAY['line_cook', 'chef_de_partie', 'sous_chef', 'executive_chef']::job_position_type[], 7),
    ('Kebap / Mangal', 'Kebab / Grill', 'kitchen', 'technique', ARRAY['grill_master', 'doner_master', 'line_cook']::job_position_type[], 8),
    ('Döner Kesimi', 'Doner Cutting', 'kitchen', 'technique', ARRAY['doner_master']::job_position_type[], 9),
    ('Pizza Hazırlama', 'Pizza Making', 'kitchen', 'technique', ARRAY['pizza_chef', 'line_cook']::job_position_type[], 10),
    ('Hamur İşleri', 'Dough Work', 'kitchen', 'technique', ARRAY['baker', 'pizza_chef', 'pastry_cook']::job_position_type[], 11),
    ('Pasta Yapımı', 'Cake Making', 'kitchen', 'technique', ARRAY['pastry_chef', 'pastry_cook', 'cake_decorator']::job_position_type[], 12),
    ('Pasta Dekorasyon', 'Cake Decoration', 'kitchen', 'technique', ARRAY['cake_decorator', 'pastry_chef']::job_position_type[], 13),
    ('Çorba Hazırlama', 'Soup Preparation', 'kitchen', 'technique', ARRAY['line_cook', 'prep_cook']::job_position_type[], 14),
    ('Salata Bar', 'Salad Bar', 'kitchen', 'technique', ARRAY['prep_cook', 'line_cook']::job_position_type[], 15),
    ('Soğuk Mutfak', 'Cold Kitchen', 'kitchen', 'section', ARRAY['line_cook', 'prep_cook', 'chef_de_partie']::job_position_type[], 16),
    ('Sıcak Mutfak', 'Hot Kitchen', 'kitchen', 'section', ARRAY['line_cook', 'chef_de_partie', 'sous_chef']::job_position_type[], 17),
    ('Izgara / Grill', 'Grill Station', 'kitchen', 'section', ARRAY['grill_master', 'line_cook']::job_position_type[], 18),
    ('Fritöz', 'Fry Station', 'kitchen', 'section', ARRAY['line_cook', 'fast_food_crew']::job_position_type[], 19),
    ('Garnitür', 'Garnish', 'kitchen', 'technique', ARRAY['line_cook', 'chef_de_partie']::job_position_type[], 20),
    ('Porsiyon Kontrolü', 'Portion Control', 'kitchen', 'management', ARRAY['chef_de_partie', 'sous_chef', 'executive_chef']::job_position_type[], 21),
    ('Maliyet Hesaplama', 'Cost Calculation', 'kitchen', 'management', ARRAY['sous_chef', 'executive_chef', 'restaurant_manager']::job_position_type[], 22),
    ('Menü Planlama', 'Menu Planning', 'kitchen', 'management', ARRAY['sous_chef', 'executive_chef']::job_position_type[], 23),

    -- SERVİS YETENEKLERİ
    ('Fine Dining Servisi', 'Fine Dining Service', 'service', 'style', ARRAY['waiter', 'waitress', 'head_waiter', 'floor_manager']::job_position_type[], 30),
    ('A La Carte Servis', 'A La Carte Service', 'service', 'style', ARRAY['waiter', 'waitress', 'head_waiter']::job_position_type[], 31),
    ('Açık Büfe Servis', 'Buffet Service', 'service', 'style', ARRAY['waiter', 'waitress', 'busser', 'food_runner']::job_position_type[], 32),
    ('Banket Servisi', 'Banquet Service', 'service', 'style', ARRAY['banquet_server', 'waiter', 'waitress']::job_position_type[], 33),
    ('Oda Servisi', 'Room Service', 'service', 'style', ARRAY['room_service', 'waiter', 'waitress']::job_position_type[], 34),
    ('Tepsi Taşıma', 'Tray Carrying', 'service', 'technique', ARRAY['waiter', 'waitress', 'busser', 'food_runner']::job_position_type[], 35),
    ('Şarap Servisi', 'Wine Service', 'service', 'technique', ARRAY['waiter', 'waitress', 'head_waiter', 'sommelier']::job_position_type[], 36),
    ('Şarap Bilgisi', 'Wine Knowledge', 'service', 'knowledge', ARRAY['sommelier', 'head_waiter', 'waiter', 'waitress']::job_position_type[], 37),
    ('Flambe Servis', 'Flambe Service', 'service', 'technique', ARRAY['head_waiter', 'waiter']::job_position_type[], 38),
    ('Müşteri İlişkileri', 'Customer Relations', 'service', 'soft', ARRAY['waiter', 'waitress', 'head_waiter', 'host_hostess', 'floor_manager']::job_position_type[], 39),
    ('Şikayet Yönetimi', 'Complaint Handling', 'service', 'soft', ARRAY['head_waiter', 'floor_manager', 'restaurant_manager']::job_position_type[], 40),
    ('Upselling', 'Upselling', 'service', 'sales', ARRAY['waiter', 'waitress', 'head_waiter', 'bartender']::job_position_type[], 41),
    ('Rezervasyon Yönetimi', 'Reservation Management', 'service', 'management', ARRAY['host_hostess', 'floor_manager', 'restaurant_manager']::job_position_type[], 42),

    -- BAR YETENEKLERİ
    ('Espresso Hazırlama', 'Espresso Making', 'bar', 'coffee', ARRAY['barista', 'senior_barista']::job_position_type[], 50),
    ('Latte Art', 'Latte Art', 'bar', 'coffee', ARRAY['barista', 'senior_barista']::job_position_type[], 51),
    ('Pour Over / Demleme', 'Pour Over / Brewing', 'bar', 'coffee', ARRAY['barista', 'senior_barista']::job_position_type[], 52),
    ('Kahve Kavurma Bilgisi', 'Coffee Roasting Knowledge', 'bar', 'coffee', ARRAY['senior_barista']::job_position_type[], 53),
    ('Klasik Kokteyller', 'Classic Cocktails', 'bar', 'cocktail', ARRAY['bartender', 'head_bartender']::job_position_type[], 54),
    ('Signature Kokteyller', 'Signature Cocktails', 'bar', 'cocktail', ARRAY['bartender', 'head_bartender', 'bar_manager']::job_position_type[], 55),
    ('Flair Bartending', 'Flair Bartending', 'bar', 'technique', ARRAY['bartender', 'head_bartender']::job_position_type[], 56),
    ('Bira Bilgisi', 'Beer Knowledge', 'bar', 'knowledge', ARRAY['bartender', 'head_bartender']::job_position_type[], 57),
    ('Viski Bilgisi', 'Whiskey Knowledge', 'bar', 'knowledge', ARRAY['bartender', 'head_bartender', 'sommelier']::job_position_type[], 58),
    ('Bar Stok Yönetimi', 'Bar Stock Management', 'bar', 'management', ARRAY['head_bartender', 'bar_manager']::job_position_type[], 59),

    -- TESLİMAT YETENEKLERİ
    ('Şehir İçi Navigasyon', 'City Navigation', 'delivery', 'navigation', ARRAY['delivery_driver', 'bicycle_courier']::job_position_type[], 70),
    ('Güvenli Sürüş', 'Safe Driving', 'delivery', 'driving', ARRAY['delivery_driver']::job_position_type[], 71),
    ('Paket Taşıma', 'Package Handling', 'delivery', 'handling', ARRAY['delivery_driver', 'bicycle_courier']::job_position_type[], 72),
    ('Zaman Yönetimi', 'Time Management', 'delivery', 'soft', ARRAY['delivery_driver', 'bicycle_courier', 'delivery_coordinator']::job_position_type[], 73),
    ('Müşteri İletişimi', 'Customer Communication', 'delivery', 'soft', ARRAY['delivery_driver', 'bicycle_courier']::job_position_type[], 74),

    -- YÖNETİM YETENEKLERİ
    ('Ekip Yönetimi', 'Team Management', 'management', 'leadership', ARRAY['restaurant_manager', 'floor_manager', 'bar_manager', 'cafe_manager', 'executive_chef', 'sous_chef']::job_position_type[], 80),
    ('Vardiya Planlama', 'Shift Planning', 'management', 'operations', ARRAY['restaurant_manager', 'floor_manager', 'bar_manager', 'shift_supervisor']::job_position_type[], 81),
    ('Envanter Yönetimi', 'Inventory Management', 'management', 'operations', ARRAY['restaurant_manager', 'bar_manager', 'sous_chef']::job_position_type[], 82),
    ('Bütçe Yönetimi', 'Budget Management', 'management', 'finance', ARRAY['restaurant_manager', 'fb_manager']::job_position_type[], 83),
    ('Personel Eğitimi', 'Staff Training', 'management', 'hr', ARRAY['restaurant_manager', 'floor_manager', 'executive_chef', 'head_bartender']::job_position_type[], 84),

    -- YAZILIM YETENEKLERİ
    ('Adisyon/POS Sistemi', 'POS System', 'software', 'pos', ARRAY['waiter', 'waitress', 'cashier', 'bartender', 'barista']::job_position_type[], 90),
    ('Rezervasyon Sistemi', 'Reservation System', 'software', 'management', ARRAY['host_hostess', 'floor_manager', 'restaurant_manager']::job_position_type[], 91),
    ('Stok Takip Programı', 'Inventory Software', 'software', 'management', ARRAY['restaurant_manager', 'bar_manager', 'sous_chef']::job_position_type[], 92),
    ('Getir/Yemeksepeti', 'Delivery Apps', 'software', 'delivery', ARRAY['cashier', 'fast_food_crew', 'delivery_coordinator']::job_position_type[], 93),
    ('MS Office', 'MS Office', 'software', 'office', ARRAY['restaurant_manager', 'fb_manager', 'catering_manager']::job_position_type[], 94)
ON CONFLICT (name) DO NOTHING;

-- Indexler
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);
CREATE INDEX IF NOT EXISTS idx_skills_positions ON skills USING GIN(relevant_positions);
CREATE INDEX IF NOT EXISTS idx_candidate_skills_candidate ON candidate_skills(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_skills_skill ON candidate_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_candidate_skills_primary ON candidate_skills(is_primary) WHERE is_primary = true;
CREATE INDEX IF NOT EXISTS idx_candidate_custom_skills_candidate ON candidate_custom_skills(candidate_id);

-- RLS
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_custom_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Yetenekler herkese görünür"
    ON skills FOR SELECT
    USING (is_active = true);

CREATE POLICY "Adaylar kendi yeteneklerini yönetebilir"
    ON candidate_skills FOR ALL
    USING (candidate_id = auth.uid());

CREATE POLICY "Aday yetenekleri herkese görünür"
    ON candidate_skills FOR SELECT
    USING (true);

CREATE POLICY "Adaylar kendi özel yeteneklerini yönetebilir"
    ON candidate_custom_skills FOR ALL
    USING (candidate_id = auth.uid());

CREATE POLICY "Özel yetenekler herkese görünür"
    ON candidate_custom_skills FOR SELECT
    USING (true);

-- Yetenek önerisi fonksiyonu (pozisyona göre)
CREATE OR REPLACE FUNCTION get_suggested_skills(p_position_type job_position_type)
RETURNS TABLE (
    skill_id UUID,
    skill_name TEXT,
    category TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT s.id, s.name, s.category
    FROM skills s
    WHERE p_position_type = ANY(s.relevant_positions)
    AND s.is_active = true
    ORDER BY s.display_order;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE skills IS 'Sistem tanımlı yetenek listesi';
COMMENT ON TABLE candidate_skills IS 'Aday-yetenek ilişkisi ve seviye bilgisi';
COMMENT ON TABLE candidate_custom_skills IS 'Kullanıcı tanımlı özel yetenekler';
