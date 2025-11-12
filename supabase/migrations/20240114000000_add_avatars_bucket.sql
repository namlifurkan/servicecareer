-- Add Avatars Storage Bucket
-- Run this in Supabase Dashboard SQL Editor

-- =============================================
-- STEP 1: Create Avatars Bucket
-- =============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- STEP 2: Storage Policies for Avatars
-- =============================================

-- Allow authenticated users to upload their own avatars
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own avatars
CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own avatars
CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public to read avatars (for profile viewing)
CREATE POLICY "Public can read avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- =============================================
-- SUCCESS MESSAGE
-- =============================================
SELECT
  'AVATARS BUCKET OLUŞTURULDU!' as durum,
  'Kullanıcılar profil fotoğrafı yükleyebilir' as mesaj;
