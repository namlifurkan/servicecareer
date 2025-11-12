-- Fix applications table schema
-- Add all missing columns for job applications

ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS cv_url TEXT,
  ADD COLUMN IF NOT EXISTS cover_letter TEXT,
  ADD COLUMN IF NOT EXISTS contact_preference TEXT CHECK (contact_preference IN ('email', 'phone')) DEFAULT 'email',
  ADD COLUMN IF NOT EXISTS guest_name TEXT,
  ADD COLUMN IF NOT EXISTS guest_email TEXT,
  ADD COLUMN IF NOT EXISTS guest_phone TEXT;

-- Add comments
COMMENT ON COLUMN applications.cv_url IS 'URL to uploaded CV file in storage';
COMMENT ON COLUMN applications.cover_letter IS 'Optional cover letter text';
COMMENT ON COLUMN applications.contact_preference IS 'Preferred contact method (email or phone)';
COMMENT ON COLUMN applications.guest_name IS 'Full name for guest (non-registered) applicants';
COMMENT ON COLUMN applications.guest_email IS 'Email for guest applicants';
COMMENT ON COLUMN applications.guest_phone IS 'Phone number for guest applicants';

-- Success message
SELECT
  'APPLICATIONS TABLOSU GÜNCELLENDİ!' as durum,
  'cv_url ve diğer kolonlar eklendi' as mesaj;
