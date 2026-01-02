-- External Jobs Table for UTM Referral System
-- Stores job listings from external sources (Kariyer.net, Indeed, LinkedIn, etc.)

-- Create external job source enum
CREATE TYPE external_job_source AS ENUM (
  'kariyer',
  'indeed',
  'linkedin',
  'yenibiris',
  'eleman',
  'secretcv'
);

-- Create external_jobs table
CREATE TABLE external_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Job details
  title VARCHAR(255) NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  location_city VARCHAR(100),
  location_district VARCHAR(100),
  description TEXT,

  -- Source information
  source_name external_job_source NOT NULL,
  source_url TEXT NOT NULL,

  -- Category (matches internal job categories)
  position_type VARCHAR(100),  -- Garson, Aşçı, Barista, etc.
  venue_type VARCHAR(100),     -- Restoran, Cafe, Otel, etc.

  -- UTM parameters for tracking
  utm_source VARCHAR(50) DEFAULT 'yemeicmeisleri',
  utm_medium VARCHAR(50) DEFAULT 'referral',
  utm_campaign VARCHAR(100),

  -- Analytics
  click_count INTEGER DEFAULT 0,

  -- Management
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,

  -- Who added this job
  created_by UUID REFERENCES profiles(id)
);

-- Indexes for performance
CREATE INDEX idx_external_jobs_active ON external_jobs(is_active, created_at DESC);
CREATE INDEX idx_external_jobs_source ON external_jobs(source_name);
CREATE INDEX idx_external_jobs_city ON external_jobs(location_city) WHERE is_active = true;
CREATE INDEX idx_external_jobs_position ON external_jobs(position_type) WHERE is_active = true;

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_external_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_external_jobs_updated_at
  BEFORE UPDATE ON external_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_external_jobs_updated_at();

-- RLS Policies
ALTER TABLE external_jobs ENABLE ROW LEVEL SECURITY;

-- Anyone can read active external jobs
CREATE POLICY "Anyone can view active external jobs"
  ON external_jobs FOR SELECT
  USING (is_active = true);

-- Admins can do everything
CREATE POLICY "Admins can manage external jobs"
  ON external_jobs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Function to increment click count
CREATE OR REPLACE FUNCTION increment_external_job_click(job_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE external_jobs
  SET click_count = click_count + 1
  WHERE id = job_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users and anon
GRANT EXECUTE ON FUNCTION increment_external_job_click(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_external_job_click(UUID) TO anon;

-- Comments
COMMENT ON TABLE external_jobs IS 'External job listings from partner sites for UTM referral tracking';
COMMENT ON COLUMN external_jobs.source_name IS 'Source site: kariyer, indeed, linkedin, yenibiris, eleman, secretcv';
COMMENT ON COLUMN external_jobs.source_url IS 'Original job listing URL on the source site';
COMMENT ON COLUMN external_jobs.click_count IS 'Number of times users clicked through to this job';
COMMENT ON COLUMN external_jobs.utm_campaign IS 'Optional campaign identifier for tracking specific promotions';
