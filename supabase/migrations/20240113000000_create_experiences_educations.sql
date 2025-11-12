-- Create experiences and educations tables for candidate profiles

-- =============================================
-- EXPERIENCES TABLE
-- =============================================

CREATE TABLE experiences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    position TEXT NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT false,
    location TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- EDUCATIONS TABLE
-- =============================================

CREATE TABLE educations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    school_name TEXT NOT NULL,
    department TEXT,
    degree TEXT NOT NULL CHECK (degree IN ('high_school', 'associate', 'bachelor', 'master', 'doctorate')),
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT false,
    gpa DECIMAL(3,2), -- 0.00 - 4.00
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_experiences_candidate ON experiences(candidate_id);
CREATE INDEX idx_experiences_order ON experiences(candidate_id, display_order);

CREATE INDEX idx_educations_candidate ON educations(candidate_id);
CREATE INDEX idx_educations_order ON educations(candidate_id, display_order);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Experiences RLS
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kullanıcılar kendi deneyimlerini yönetebilir"
    ON experiences FOR ALL
    USING (auth.uid() = candidate_id);

CREATE POLICY "Deneyimler herkese görünür"
    ON experiences FOR SELECT
    USING (true);

-- Educations RLS
ALTER TABLE educations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kullanıcılar kendi eğitimlerini yönetebilir"
    ON educations FOR ALL
    USING (auth.uid() = candidate_id);

CREATE POLICY "Eğitimler herkese görünür"
    ON educations FOR SELECT
    USING (true);

-- =============================================
-- TRIGGERS
-- =============================================

CREATE TRIGGER update_experiences_updated_at BEFORE UPDATE ON experiences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_educations_updated_at BEFORE UPDATE ON educations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
