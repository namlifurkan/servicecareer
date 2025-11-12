-- Add guest user fields to applications table
-- This allows non-registered users to apply for jobs

ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS guest_name TEXT,
  ADD COLUMN IF NOT EXISTS guest_email TEXT,
  ADD COLUMN IF NOT EXISTS guest_phone TEXT;

-- Make candidate_id nullable since guest users don't have an account
ALTER TABLE applications
  ALTER COLUMN candidate_id DROP NOT NULL;

-- Add check constraint: either candidate_id OR guest_email must be present
ALTER TABLE applications
  ADD CONSTRAINT check_candidate_or_guest
  CHECK (
    (candidate_id IS NOT NULL AND guest_email IS NULL) OR
    (candidate_id IS NULL AND guest_email IS NOT NULL)
  );

-- Add index for guest applications
CREATE INDEX IF NOT EXISTS idx_applications_guest_email ON applications(guest_email);

-- Add comment
COMMENT ON COLUMN applications.guest_name IS 'Full name for guest (non-registered) applicants';
COMMENT ON COLUMN applications.guest_email IS 'Email for guest (non-registered) applicants';
COMMENT ON COLUMN applications.guest_phone IS 'Phone for guest (non-registered) applicants';
