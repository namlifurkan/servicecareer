-- =============================================
-- SERVICECAREER MİGRATION SCRIPT
-- =============================================
-- Bu dosyayı Supabase Dashboard SQL Editor'de çalıştırın
-- Sırayla tüm migration'ları uygular

-- =============================================
-- STEP 1: Update Jobs Schema
-- =============================================
-- File: 20240103000000_update_jobs_schema.sql

-- Add missing columns
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS additional_info TEXT,
  ADD COLUMN IF NOT EXISTS responsibilities TEXT,
  ADD COLUMN IF NOT EXISTS qualifications TEXT,
  ADD COLUMN IF NOT EXISTS category_id UUID,
  ADD COLUMN IF NOT EXISTS city_id UUID;

-- Make education_level and experience_level nullable if they exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs'
    AND column_name = 'education_level'
  ) THEN
    ALTER TABLE jobs ALTER COLUMN education_level DROP NOT NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs'
    AND column_name = 'experience_level'
  ) THEN
    ALTER TABLE jobs ALTER COLUMN experience_level DROP NOT NULL;
  END IF;
END $$;

-- Update benefits column type to TEXT[] if it's TEXT
DO $$
BEGIN
  -- Check if benefits column exists and is TEXT type
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs'
    AND column_name = 'benefits'
    AND data_type = 'text'
  ) THEN
    -- Convert TEXT to TEXT[]
    ALTER TABLE jobs ALTER COLUMN benefits TYPE TEXT[] USING
      CASE
        WHEN benefits IS NOT NULL THEN ARRAY[benefits]::TEXT[]
        ELSE NULL
      END;
  END IF;
END $$;

-- Add foreign key constraints
DO $$
BEGIN
  -- Add category_id foreign key if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'jobs_category_id_fkey'
    AND table_name = 'jobs'
  ) THEN
    ALTER TABLE jobs
      ADD CONSTRAINT jobs_category_id_fkey
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;
  END IF;

  -- Add city_id foreign key if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'jobs_city_id_fkey'
    AND table_name = 'jobs'
  ) THEN
    ALTER TABLE jobs
      ADD CONSTRAINT jobs_city_id_fkey
      FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create indexes for new foreign keys
CREATE INDEX IF NOT EXISTS idx_jobs_category_id ON jobs(category_id);
CREATE INDEX IF NOT EXISTS idx_jobs_city_id ON jobs(city_id);

-- Add comments
COMMENT ON COLUMN jobs.additional_info IS 'Additional information about the job';
COMMENT ON COLUMN jobs.responsibilities IS 'Job responsibilities and duties';
COMMENT ON COLUMN jobs.qualifications IS 'Required qualifications and skills';
COMMENT ON COLUMN jobs.category_id IS 'Foreign key reference to categories table';
COMMENT ON COLUMN jobs.city_id IS 'Foreign key reference to cities table';

-- =============================================
-- STEP 2: Create Districts Table
-- =============================================
-- File: 20240107000000_create_districts_table.sql

CREATE TABLE IF NOT EXISTS districts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(city_id, slug)
);

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_districts_slug ON districts(slug);
CREATE INDEX IF NOT EXISTS idx_districts_name ON districts(name);
CREATE INDEX IF NOT EXISTS idx_districts_city_id ON districts(city_id);

-- Add district_id to jobs table (optional, city-level is still required)
ALTER TABLE jobs
    ADD COLUMN IF NOT EXISTS district_id UUID;

-- Add foreign key constraint for district_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'jobs_district_id_fkey'
    AND table_name = 'jobs'
  ) THEN
    ALTER TABLE jobs
      ADD CONSTRAINT jobs_district_id_fkey
      FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_jobs_district_id ON jobs(district_id);

-- Add comments
COMMENT ON TABLE districts IS 'Turkish districts (ilçeler) for each city with hierarchical parent_id reference';
COMMENT ON COLUMN jobs.district_id IS 'Optional district specification (city_id is still required)';

-- =============================================
-- SUCCESS MESSAGE
-- =============================================
SELECT
  'MİGRATION TAMAMLANDI!' as durum,
  'Şimdi seed-categories-cities.sql ve seed-districts.sql dosyalarını çalıştırın' as sonraki_adim;
