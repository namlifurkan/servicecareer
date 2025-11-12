-- Create districts table
-- This table stores all districts (ilçeler) for each city with parent_id reference

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
    ADD COLUMN IF NOT EXISTS district_id UUID REFERENCES districts(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_jobs_district_id ON jobs(district_id);

-- Add comment
COMMENT ON TABLE districts IS 'Turkish districts (ilçeler) for each city with hierarchical parent_id reference';
COMMENT ON COLUMN jobs.district_id IS 'Optional district specification (city_id is still required)';
