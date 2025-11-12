-- =============================================
-- SERVICECAREER - TÜM EKSİK MİGRATION'LAR
-- =============================================
-- Bu dosyayı Supabase Dashboard SQL Editor'de çalıştırın
-- Sırayla tüm eksik migration'ları uygular

-- =============================================
-- 1. STORAGE BUCKETS
-- =============================================

-- Create CVs Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('cvs', 'cvs', true)
ON CONFLICT (id) DO NOTHING;

-- Create Company Logos Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-logos', 'company-logos', true)
ON CONFLICT (id) DO NOTHING;

-- CVs bucket policies
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Authenticated users can upload CVs" ON storage.objects;
  DROP POLICY IF EXISTS "Public can upload CVs" ON storage.objects;
  DROP POLICY IF EXISTS "Users can read CVs" ON storage.objects;
  DROP POLICY IF EXISTS "Public can read CVs" ON storage.objects;

  -- Create new policies
  CREATE POLICY "Authenticated users can upload CVs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'cvs');

  CREATE POLICY "Public can upload CVs"
  ON storage.objects FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'cvs');

  CREATE POLICY "Users can read CVs"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'cvs');

  CREATE POLICY "Public can read CVs"
  ON storage.objects FOR SELECT
  TO anon
  USING (bucket_id = 'cvs');
END $$;

-- Company logos bucket policies
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Company owners can upload logos" ON storage.objects;
  DROP POLICY IF EXISTS "Company owners can update logos" ON storage.objects;
  DROP POLICY IF EXISTS "Public can read company logos" ON storage.objects;

  -- Create new policies
  CREATE POLICY "Company owners can upload logos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'company-logos');

  CREATE POLICY "Company owners can update logos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'company-logos');

  CREATE POLICY "Public can read company logos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'company-logos');
END $$;

-- =============================================
-- 2. COMPANIES TABLE - ADD MISSING COLUMNS
-- =============================================

ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS city_id UUID REFERENCES cities(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS sector TEXT,
  ADD COLUMN IF NOT EXISTS employee_count TEXT,
  ADD COLUMN IF NOT EXISTS linkedin TEXT,
  ADD COLUMN IF NOT EXISTS twitter TEXT,
  ADD COLUMN IF NOT EXISTS instagram TEXT;

CREATE INDEX IF NOT EXISTS idx_companies_city_id ON companies(city_id);

-- Add comments
COMMENT ON COLUMN companies.city_id IS 'Foreign key reference to cities table for company location';
COMMENT ON COLUMN companies.sector IS 'Company sector/industry (e.g., Technology, Hospitality, etc.)';
COMMENT ON COLUMN companies.employee_count IS 'Number of employees (e.g., 1-10, 11-50, 51-200, etc.)';
COMMENT ON COLUMN companies.linkedin IS 'Company LinkedIn profile URL';
COMMENT ON COLUMN companies.twitter IS 'Company Twitter/X profile URL';
COMMENT ON COLUMN companies.instagram IS 'Company Instagram profile URL';

-- =============================================
-- 3. APPLICATIONS TABLE - ADD MISSING COLUMNS
-- =============================================

ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS contact_preference TEXT CHECK (contact_preference IN ('email', 'phone')) DEFAULT 'email',
  ADD COLUMN IF NOT EXISTS guest_name TEXT,
  ADD COLUMN IF NOT EXISTS guest_email TEXT,
  ADD COLUMN IF NOT EXISTS guest_phone TEXT;

-- Add comments
COMMENT ON COLUMN applications.contact_preference IS 'Preferred contact method (email or phone)';
COMMENT ON COLUMN applications.guest_name IS 'Full name for guest (non-registered) applicants';
COMMENT ON COLUMN applications.guest_email IS 'Email for guest applicants';
COMMENT ON COLUMN applications.guest_phone IS 'Phone number for guest applicants';

-- =============================================
-- SUCCESS MESSAGE
-- =============================================
SELECT
  'TÜM MİGRATION''LAR TAMAMLANDI!' as durum,
  'Storage buckets, company columns ve application columns eklendi' as mesaj;
