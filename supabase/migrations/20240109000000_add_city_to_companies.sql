-- Add city_id to companies table
-- This allows companies to specify their location

ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS city_id UUID REFERENCES cities(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_companies_city_id ON companies(city_id);

-- Add comment
COMMENT ON COLUMN companies.city_id IS 'Foreign key reference to cities table for company location';

-- Success message
SELECT
  'COMPANIES TABLOSU GÜNCELLENDİ!' as durum,
  'city_id kolonu eklendi' as mesaj;
