-- Add timestamp columns to applications table

ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create index for faster sorting
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at DESC);

-- Add comments
COMMENT ON COLUMN applications.created_at IS 'Timestamp when the application was submitted';
COMMENT ON COLUMN applications.updated_at IS 'Timestamp when the application was last updated';

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS applications_updated_at_trigger ON applications;

CREATE TRIGGER applications_updated_at_trigger
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_applications_updated_at();

-- Success message
SELECT
  'APPLICATIONS TIMESTAMPS EKLENDI!' as durum,
  'created_at ve updated_at kolonları hazır' as mesaj;
