    -- Add Row Level Security policies for applications table
    -- Allow users to create applications and view their own applications

    -- Enable RLS if not already enabled
    ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can insert their own applications" ON applications;
    DROP POLICY IF EXISTS "Users can view their own applications" ON applications;
    DROP POLICY IF EXISTS "Companies can view applications for their jobs" ON applications;
    DROP POLICY IF EXISTS "Public can insert guest applications" ON applications;
    DROP POLICY IF EXISTS "Admins can view all applications" ON applications;

    -- Policy 1: Authenticated users can insert applications
    CREATE POLICY "Users can insert their own applications"
    ON applications FOR INSERT
    TO authenticated
    WITH CHECK (
      auth.uid() = candidate_id OR candidate_id IS NULL
    );

    -- Policy 2: Public/anonymous users can insert guest applications
    CREATE POLICY "Public can insert guest applications"
    ON applications FOR INSERT
    TO anon
    WITH CHECK (
      candidate_id IS NULL AND
      guest_name IS NOT NULL AND
      guest_email IS NOT NULL
    );

    -- Policy 3: Users can view their own applications
    CREATE POLICY "Users can view their own applications"
    ON applications FOR SELECT
    TO authenticated
    USING (auth.uid() = candidate_id);

    -- Policy 4: Companies can view applications for their jobs
    CREATE POLICY "Companies can view applications for their jobs"
    ON applications FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM jobs
        INNER JOIN companies ON jobs.company_id = companies.id
        WHERE jobs.id = applications.job_id
        AND companies.owner_id = auth.uid()
      )
    );

    -- Policy 5: Admins can view all applications
    CREATE POLICY "Admins can view all applications"
    ON applications FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
      )
    );

    -- Policy 6: Companies can update application status
    CREATE POLICY "Companies can update application status"
    ON applications FOR UPDATE
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM jobs
        INNER JOIN companies ON jobs.company_id = companies.id
        WHERE jobs.id = applications.job_id
        AND companies.owner_id = auth.uid()
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM jobs
        INNER JOIN companies ON jobs.company_id = companies.id
        WHERE jobs.id = applications.job_id
        AND companies.owner_id = auth.uid()
      )
    );

    -- Success message
    SELECT
      'APPLICATIONS RLS POLİTİKALARI OLUŞTURULDU!' as durum,
      'Kullanıcılar ve misafirler başvuru yapabilir' as mesaj;
