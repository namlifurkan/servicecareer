-- =============================================
-- EKSİK JOB SÜTUNLARINI EKLE
-- Migration: 20241221000001_add_missing_job_columns.sql
-- =============================================

-- Shift types array sütunu
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS shift_types shift_type[];

-- Required certificates array sütunu
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS required_certificates certificate_type[];

-- Working days sütunu
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS working_days working_days;

-- Indexler
CREATE INDEX IF NOT EXISTS idx_jobs_shift_types ON jobs USING GIN(shift_types);
CREATE INDEX IF NOT EXISTS idx_jobs_required_certificates ON jobs USING GIN(required_certificates);
CREATE INDEX IF NOT EXISTS idx_jobs_working_days ON jobs(working_days);

COMMENT ON COLUMN jobs.shift_types IS 'Vardiya tipleri (sabah, akşam, gece vb.)';
COMMENT ON COLUMN jobs.required_certificates IS 'Gerekli sertifikalar';
COMMENT ON COLUMN jobs.working_days IS 'Çalışma günleri';
