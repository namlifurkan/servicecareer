-- Add phone reveal count to jobs table
-- This tracks how many times the company phone number was revealed (both logged in and guest users)

ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS phone_reveal_count INTEGER DEFAULT 0 NOT NULL;

-- Add comment
COMMENT ON COLUMN jobs.phone_reveal_count IS 'Total number of times the company phone was revealed to users';

-- Create RPC function to increment phone reveal count atomically
CREATE OR REPLACE FUNCTION increment_phone_reveal_count(job_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE jobs
  SET phone_reveal_count = phone_reveal_count + 1
  WHERE id = job_id_param;
END;
$$;
