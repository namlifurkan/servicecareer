-- View count artırma fonksiyonu (RLS'yi bypass eder)
CREATE OR REPLACE FUNCTION increment_view_count(job_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE jobs
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = job_id_param;
END;
$$;

-- Fonksiyona public erişim izni
GRANT EXECUTE ON FUNCTION increment_view_count(UUID) TO anon;
GRANT EXECUTE ON FUNCTION increment_view_count(UUID) TO authenticated;
