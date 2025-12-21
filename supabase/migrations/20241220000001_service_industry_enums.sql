-- =============================================
-- HİZMET SEKTÖRÜ ENUM'LARI
-- Migration: 20241220000001_service_industry_enums.sql
-- =============================================

-- 1. MESLEK TİPLERİ (Hizmet Sektörü Odaklı)
CREATE TYPE job_position_type AS ENUM (
    -- Mutfak Pozisyonları
    'executive_chef',           -- Executive Şef
    'sous_chef',                -- Sous Şef
    'chef_de_partie',           -- Kısım Şefi
    'line_cook',                -- Aşçı
    'prep_cook',                -- Hazırlık Aşçısı
    'pastry_chef',              -- Pasta Şefi
    'pizza_chef',               -- Pizza Ustası
    'grill_master',             -- Mangal/Izgara Ustası
    'doner_master',             -- Döner Ustası
    'sushi_chef',               -- Sushi Şefi
    'kitchen_helper',           -- Mutfak Yardımcısı

    -- Servis Pozisyonları
    'restaurant_manager',       -- Restoran Müdürü
    'floor_manager',            -- Salon Şefi
    'head_waiter',              -- Baş Garson
    'waiter',                   -- Garson
    'waitress',                 -- Bayan Garson
    'busser',                   -- Komi
    'host_hostess',             -- Host/Hostes
    'food_runner',              -- Servis Elemanı

    -- Bar Pozisyonları
    'bar_manager',              -- Bar Müdürü
    'head_bartender',           -- Baş Barmen
    'bartender',                -- Barmen
    'barista',                  -- Barista
    'sommelier',                -- Sommelier
    'barback',                  -- Bar Yardımcısı

    -- Kafe Pozisyonları
    'cafe_manager',             -- Kafe Müdürü
    'senior_barista',           -- Kıdemli Barista
    'cafe_attendant',           -- Kafe Görevlisi

    -- Teslimat & Kurye
    'delivery_driver',          -- Motorlu Kurye
    'bicycle_courier',          -- Bisikletli Kurye
    'delivery_coordinator',     -- Teslimat Koordinatörü

    -- Destek Pozisyonları
    'dishwasher',               -- Bulaşıkçı
    'cleaner',                  -- Temizlik Görevlisi
    'cashier',                  -- Kasiyer
    'security',                 -- Güvenlik

    -- Fast Food
    'fast_food_crew',           -- Fast Food Ekibi
    'shift_supervisor',         -- Vardiya Amiri

    -- Catering & Organizasyon
    'catering_manager',         -- Catering Müdürü
    'event_coordinator',        -- Organizasyon Koordinatörü
    'banquet_server',           -- Banket Görevlisi

    -- Pastane & Fırın
    'baker',                    -- Fırıncı
    'pastry_cook',              -- Pastacı
    'cake_decorator',           -- Pasta Dekoratörü

    -- Otel F&B
    'fb_manager',               -- F&B Müdürü
    'room_service',             -- Oda Servisi
    'breakfast_attendant',      -- Kahvaltı Görevlisi

    -- Diğer
    'other'                     -- Diğer
);

-- 2. VARDİYA TİPLERİ
CREATE TYPE shift_type AS ENUM (
    'morning',          -- Sabah (06:00 - 14:00)
    'afternoon',        -- Öğlen (14:00 - 22:00)
    'evening',          -- Akşam (18:00 - 02:00)
    'night',            -- Gece (22:00 - 06:00)
    'split',            -- Bölünmüş Vardiya
    'rotating',         -- Dönüşümlü
    'flexible',         -- Esnek
    'weekend_only',     -- Sadece Hafta Sonu
    'weekday_only'      -- Sadece Hafta İçi
);

-- 3. SERTİFİKA TİPLERİ
CREATE TYPE certificate_type AS ENUM (
    -- Zorunlu Sertifikalar
    'hygiene_certificate',      -- Hijyen Sertifikası
    'food_safety',              -- Gıda Güvenliği
    'health_certificate',       -- Sağlık Karnesi/Portör Muayenesi
    'alcohol_license',          -- Alkol Satış Belgesi

    -- Mesleki Sertifikalar
    'culinary_arts',            -- Aşçılık Diploması
    'pastry_arts',              -- Pastacılık Sertifikası
    'barista_certification',    -- Barista Sertifikası (SCA vb.)
    'sommelier_certification',  -- Sommelier Sertifikası
    'bartending_license',       -- Barmenlik Sertifikası
    'mixology_certification',   -- Mixology Sertifikası
    'food_styling',             -- Yemek Süsleme

    -- Sürücü Belgeleri
    'driver_license_a',         -- A Sınıfı Ehliyet (Motosiklet)
    'driver_license_b',         -- B Sınıfı Ehliyet
    'src_certificate',          -- SRC Belgesi

    -- İş Güvenliği
    'first_aid',                -- İlk Yardım Sertifikası
    'fire_safety',              -- Yangın Güvenliği
    'occupational_safety',      -- İş Güvenliği

    -- Dil Sertifikaları
    'english_certificate',      -- İngilizce Sertifikası
    'german_certificate',       -- Almanca Sertifikası
    'arabic_certificate',       -- Arapça Sertifikası

    -- Diğer
    'haccp',                    -- HACCP Sertifikası
    'iso_22000',                -- ISO 22000
    'other'                     -- Diğer
);

-- 4. MUTFAK TÜRLERİ
CREATE TYPE cuisine_type AS ENUM (
    'turkish',          -- Türk Mutfağı
    'ottoman',          -- Osmanlı Mutfağı
    'mediterranean',    -- Akdeniz Mutfağı
    'italian',          -- İtalyan Mutfağı
    'french',           -- Fransız Mutfağı
    'asian',            -- Asya Mutfağı
    'japanese',         -- Japon Mutfağı
    'chinese',          -- Çin Mutfağı
    'indian',           -- Hint Mutfağı
    'mexican',          -- Meksika Mutfağı
    'american',         -- Amerikan Mutfağı
    'middle_eastern',   -- Orta Doğu Mutfağı
    'seafood',          -- Deniz Ürünleri
    'vegetarian',       -- Vejetaryen
    'vegan',            -- Vegan
    'fusion',           -- Fusion
    'street_food',      -- Sokak Lezzetleri
    'fine_dining',      -- Fine Dining
    'casual_dining',    -- Casual Dining
    'fast_food',        -- Fast Food
    'cafe_bakery',      -- Kafe & Pastane
    'other'             -- Diğer
);

-- 5. MEKAN TİPLERİ
CREATE TYPE venue_type AS ENUM (
    'fine_dining_restaurant',   -- Fine Dining Restoran
    'casual_restaurant',        -- Günlük Restoran
    'fast_food_restaurant',     -- Fast Food
    'cafe',                     -- Kafe
    'coffee_shop',              -- Kahve Dükkanı
    'pub',                      -- Pub
    'bar',                      -- Bar
    'nightclub',                -- Gece Kulübü
    'lounge',                   -- Lounge
    'rooftop',                  -- Rooftop
    'hotel_restaurant',         -- Otel Restoranı
    'hotel_bar',                -- Otel Barı
    'beach_club',               -- Beach Club
    'patisserie',               -- Pastane
    'bakery',                   -- Fırın
    'food_truck',               -- Yemek Tırı
    'catering_company',         -- Catering Şirketi
    'canteen',                  -- Yemekhane
    'buffet',                   -- Açık Büfe
    'diner',                    -- Lokanta
    'kebab_house',              -- Kebapçı
    'pide_lahmacun',            -- Pide/Lahmacun Salonu
    'fish_restaurant',          -- Balık Restoranı
    'steakhouse',               -- Steakhouse
    'pizzeria',                 -- Pizzacı
    'sushi_bar',                -- Sushi Bar
    'ice_cream_shop',           -- Dondurma Dükkanı
    'dessert_shop',             -- Tatlıcı
    'tea_house',                -- Çay Bahçesi
    'hookah_lounge',            -- Nargile Kafe
    'other'                     -- Diğer
);

-- 6. ARAÇ TİPLERİ (Kurye için)
CREATE TYPE vehicle_type AS ENUM (
    'motorcycle',       -- Motosiklet
    'scooter',          -- Scooter
    'bicycle',          -- Bisiklet
    'electric_bike',    -- Elektrikli Bisiklet
    'car',              -- Araba
    'van',              -- Minivan
    'none'              -- Araç Yok
);

-- 7. ÜNİFORMA DURUMU
CREATE TYPE uniform_policy AS ENUM (
    'provided',         -- Üniforma Verilir
    'allowance',        -- Üniforma Yardımı
    'own_black',        -- Siyah Kıyafet (Kendi)
    'own_white',        -- Beyaz Kıyafet (Kendi)
    'casual',           -- Serbest Kıyafet
    'smart_casual',     -- Smart Casual
    'formal'            -- Resmi
);

-- 8. YEMEK DURUMU
CREATE TYPE meal_policy AS ENUM (
    'provided_all',     -- Tüm Öğünler Verilir
    'provided_shift',   -- Vardiya Yemeği
    'discount',         -- İndirimli Yemek
    'not_provided'      -- Yemek Verilmez
);

-- 9. KONAKLAMA DURUMU
CREATE TYPE accommodation_policy AS ENUM (
    'provided',         -- Konaklama Sağlanır
    'subsidy',          -- Konaklama Yardımı
    'not_provided'      -- Konaklama Sağlanmaz
);

-- 10. TİP/BAHŞİŞ POLİTİKASI
CREATE TYPE tip_policy AS ENUM (
    'individual',       -- Bireysel Bahşiş
    'pooled',           -- Havuz Sistemi
    'service_charge',   -- Servis Ücreti Dahil
    'no_tips'           -- Bahşiş Yok
);

-- 11. DENEYİM SEVİYESİ (Sektöre Özel)
CREATE TYPE service_experience_level AS ENUM (
    'no_experience',    -- Deneyimsiz (Yetiştirilir)
    'beginner',         -- Başlangıç (0-1 Yıl)
    'intermediate',     -- Orta (1-3 Yıl)
    'experienced',      -- Deneyimli (3-5 Yıl)
    'senior',           -- Kıdemli (5-10 Yıl)
    'expert',           -- Uzman (10+ Yıl)
    'master'            -- Usta (15+ Yıl)
);

-- 12. ÇALIŞMA GÜNLERİ
CREATE TYPE working_days AS ENUM (
    'monday_friday',    -- Pazartesi-Cuma
    'monday_saturday',  -- Pazartesi-Cumartesi
    'tuesday_sunday',   -- Salı-Pazar (Pazartesi Tatil)
    'all_week',         -- Haftanın 7 Günü (Rotasyon)
    'weekends_only',    -- Sadece Hafta Sonu
    'flexible'          -- Esnek
);

-- 13. BAŞVURU DURUMU (Genişletilmiş)
CREATE TYPE application_status AS ENUM (
    'pending',          -- Beklemede
    'viewed',           -- Görüntülendi
    'shortlisted',      -- Ön Seçime Alındı
    'interview_scheduled',  -- Mülakat Planlandı
    'interview_completed',  -- Mülakat Tamamlandı
    'trial_scheduled',  -- Deneme Günü Planlandı
    'trial_completed',  -- Deneme Tamamlandı
    'offer_sent',       -- Teklif Gönderildi
    'offer_accepted',   -- Teklif Kabul Edildi
    'offer_rejected',   -- Teklif Reddedildi
    'hired',            -- İşe Alındı
    'rejected',         -- Reddedildi
    'withdrawn'         -- Geri Çekildi
);

-- 14. MAAŞ ÖDEME TİPİ
CREATE TYPE salary_payment_type AS ENUM (
    'monthly',          -- Aylık
    'weekly',           -- Haftalık
    'daily',            -- Günlük (Yevmiye)
    'hourly',           -- Saatlik
    'per_delivery'      -- Teslimat Başına
);

-- 15. REFERANS DURUMU
CREATE TYPE reference_status AS ENUM (
    'pending',          -- Beklemede
    'verified',         -- Doğrulandı
    'rejected',         -- Reddedildi
    'expired'           -- Süresi Doldu
);

COMMENT ON TYPE job_position_type IS 'Hizmet sektörü meslek pozisyonları';
COMMENT ON TYPE shift_type IS 'Vardiya tipleri';
COMMENT ON TYPE certificate_type IS 'Mesleki ve zorunlu sertifikalar';
COMMENT ON TYPE cuisine_type IS 'Mutfak türleri';
COMMENT ON TYPE venue_type IS 'Mekan türleri';
COMMENT ON TYPE vehicle_type IS 'Araç tipleri (kurye için)';
