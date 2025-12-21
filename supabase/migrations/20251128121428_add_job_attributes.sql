-- Migration: Add niche-specific job attributes
-- Description: Adds common attribute columns and JSONB for category-specific attributes
-- Date: 2025-11-28

-- Add new columns to jobs table
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS certifications TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS vehicle_required BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS vehicle_types TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS shift_types TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS category_attributes JSONB DEFAULT '{}'::jsonb;

-- Add GIN indexes for array and JSONB columns for efficient filtering
CREATE INDEX IF NOT EXISTS idx_jobs_certifications ON jobs USING GIN(certifications);
CREATE INDEX IF NOT EXISTS idx_jobs_languages ON jobs USING GIN(languages);
CREATE INDEX IF NOT EXISTS idx_jobs_vehicle_types ON jobs USING GIN(vehicle_types);
CREATE INDEX IF NOT EXISTS idx_jobs_shift_types ON jobs USING GIN(shift_types);
CREATE INDEX IF NOT EXISTS idx_jobs_category_attributes ON jobs USING GIN(category_attributes);

-- Add comments for documentation
COMMENT ON COLUMN jobs.certifications IS 'Common certifications/licenses (multi-select): Hijyen Belgesi, HACCP, etc.';
COMMENT ON COLUMN jobs.vehicle_required IS 'Whether vehicle is required for the job';
COMMENT ON COLUMN jobs.vehicle_types IS 'Required vehicle types: araba, motor, bisiklet, elektrikli_scooter, yaya';
COMMENT ON COLUMN jobs.languages IS 'Required languages: Türkçe, İngilizce, Almanca, Arapça, Rusça, Fransızca';
COMMENT ON COLUMN jobs.shift_types IS 'Shift/schedule types: sabah, öğlen, akşam, gece, vardiya, hafta_sonu, esnek';
COMMENT ON COLUMN jobs.category_attributes IS 'Category-specific attributes stored as JSONB. Keys: cuisine_types, kitchen_positions, equipment_skills, coffee_skills, bar_skills, service_experience, delivery_areas, cleaning_areas, management_experience, pos_systems, pastry_specialization, event_types';
