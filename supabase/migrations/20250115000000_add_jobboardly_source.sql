-- Convert source_name enum to source_domain VARCHAR
-- This allows dynamic domain extraction from job URLs

-- Step 1: Add new source_domain column (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'external_jobs' AND column_name = 'source_domain'
  ) THEN
    ALTER TABLE external_jobs ADD COLUMN source_domain VARCHAR(255);
  END IF;
END $$;

-- Step 2: Migrate existing data - convert enum to domain string
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'external_jobs' AND column_name = 'source_name'
  ) THEN
    UPDATE external_jobs
    SET source_domain = CASE source_name::text
      WHEN 'kariyer' THEN 'kariyer.net'
      WHEN 'indeed' THEN 'indeed.com'
      WHEN 'linkedin' THEN 'linkedin.com'
      WHEN 'yenibiris' THEN 'yenibiris.com'
      WHEN 'eleman' THEN 'eleman.net'
      WHEN 'secretcv' THEN 'secretcv.com'
      ELSE source_name::text
    END
    WHERE source_domain IS NULL;
  END IF;
END $$;

-- Step 3: Set default for any NULL values
UPDATE external_jobs SET source_domain = 'unknown' WHERE source_domain IS NULL;

-- Step 4: Make source_domain NOT NULL
ALTER TABLE external_jobs ALTER COLUMN source_domain SET NOT NULL;

-- Step 5: Drop old enum column if exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'external_jobs' AND column_name = 'source_name'
  ) THEN
    ALTER TABLE external_jobs DROP COLUMN source_name;
  END IF;
END $$;

-- Step 6: Drop enum type if exists
DROP TYPE IF EXISTS external_job_source;

-- Step 7: Add index for source_domain
DROP INDEX IF EXISTS idx_external_jobs_source;
CREATE INDEX IF NOT EXISTS idx_external_jobs_domain ON external_jobs(source_domain);

-- Comments
COMMENT ON COLUMN external_jobs.source_domain IS 'Domain of the original job posting (e.g., softgarden.io, join.com, kariyer.net)';
