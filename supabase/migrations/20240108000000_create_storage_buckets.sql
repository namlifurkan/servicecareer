-- Create Storage Buckets for Yeme İçme İşleri
-- Run this in Supabase Dashboard SQL Editor

-- =============================================
-- STEP 1: Create CVs Bucket
-- =============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('cvs', 'cvs', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload CVs
CREATE POLICY "Authenticated users can upload CVs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'cvs');

-- Allow public to upload CVs (for guest applications)
CREATE POLICY "Public can upload CVs"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'cvs');

-- Allow users to read their own CVs
CREATE POLICY "Users can read CVs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'cvs');

-- Allow public to read CVs (since bucket is public)
CREATE POLICY "Public can read CVs"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id = 'cvs');

-- =============================================
-- STEP 2: Create Company Logos Bucket
-- =============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('company-logos', 'company-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload company logos
CREATE POLICY "Company owners can upload logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'company-logos');

-- Allow authenticated users to update their logos
CREATE POLICY "Company owners can update logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'company-logos');

-- Allow public to read company logos
CREATE POLICY "Public can read company logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'company-logos');

-- =============================================
-- SUCCESS MESSAGE
-- =============================================
SELECT
  'STORAGE BUCKETS OLUŞTURULDU!' as durum,
  'CVs ve company-logos bucket''ları hazır' as mesaj;
