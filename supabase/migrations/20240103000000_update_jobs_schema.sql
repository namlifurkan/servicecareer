-- Update jobs table schema
-- Add missing columns for job listings

-- Add missing columns
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS additional_info TEXT,
  ADD COLUMN IF NOT EXISTS responsibilities TEXT,
  ADD COLUMN IF NOT EXISTS qualifications TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS city_id UUID REFERENCES cities(id) ON DELETE SET NULL;

-- Make education_level nullable if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs'
    AND column_name = 'education_level'
  ) THEN
    ALTER TABLE jobs ALTER COLUMN education_level DROP NOT NULL;
  END IF;
END $$;

-- Rename existing columns to match new schema
ALTER TABLE jobs
  RENAME COLUMN location_address TO location_address_old;

-- Add proper address column
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS address TEXT;

-- Copy data from old column to new
UPDATE jobs SET address = location_address_old WHERE location_address_old IS NOT NULL;

-- Drop old column
ALTER TABLE jobs
  DROP COLUMN IF EXISTS location_address_old;

-- Update benefits column type to TEXT[] if it's TEXT
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs'
    AND column_name = 'benefits'
    AND data_type = 'text'
  ) THEN
    ALTER TABLE jobs ALTER COLUMN benefits TYPE TEXT[] USING
      CASE
        WHEN benefits IS NOT NULL THEN ARRAY[benefits]::TEXT[]
        ELSE NULL
      END;
  END IF;
END $$;

-- Create indexes for new foreign keys
CREATE INDEX IF NOT EXISTS idx_jobs_category_id ON jobs(category_id);
CREATE INDEX IF NOT EXISTS idx_jobs_city_id ON jobs(city_id);

-- Add comments
COMMENT ON COLUMN jobs.additional_info IS 'Additional information about the job';
COMMENT ON COLUMN jobs.responsibilities IS 'Job responsibilities and duties';
COMMENT ON COLUMN jobs.qualifications IS 'Required qualifications and skills';
COMMENT ON COLUMN jobs.address IS 'Detailed address for the job location';
COMMENT ON COLUMN jobs.category_id IS 'Foreign key reference to categories table';
COMMENT ON COLUMN jobs.city_id IS 'Foreign key reference to cities table';
