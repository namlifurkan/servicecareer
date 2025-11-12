-- ServiceCareer Database Schema
-- Hizmet Sektörü İş İlanları ve CRM Platformu

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- ENUMS
-- =============================================

-- Kullanıcı Rolleri
CREATE TYPE user_role AS ENUM ('admin', 'company', 'candidate');

-- İş İlanı Durumu
CREATE TYPE job_status AS ENUM ('draft', 'active', 'paused', 'closed', 'expired');

-- Çalışma Şekli
CREATE TYPE work_type AS ENUM ('full_time', 'part_time', 'contract', 'freelance', 'internship');

-- Deneyim Seviyesi
CREATE TYPE experience_level AS ENUM ('entry', 'junior', 'mid', 'senior', 'lead', 'executive');

-- Eğitim Seviyesi
CREATE TYPE education_level AS ENUM ('high_school', 'associate', 'bachelor', 'master', 'doctorate');

-- Şirket Boyutu
CREATE TYPE company_size AS ENUM ('startup', 'small', 'medium', 'large', 'enterprise');

-- Paket Tipi
CREATE TYPE subscription_tier AS ENUM ('free', 'basic', 'professional', 'enterprise');

-- =============================================
-- CORE TABLES
-- =============================================

-- Profiller (auth.users'ı genişletir)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'candidate',
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    subscription_tier subscription_tier DEFAULT 'free',
    subscription_expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Şirketler
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    website TEXT,
    logo_url TEXT,
    company_size company_size,
    industry TEXT,
    founded_year INTEGER,
    address TEXT,
    city TEXT,
    country TEXT DEFAULT 'TR',
    phone TEXT,
    email TEXT,
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    subscription_tier subscription_tier DEFAULT 'free',
    job_post_limit INTEGER DEFAULT 3,
    active_job_posts INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- İş İlanları
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    benefits TEXT,
    status job_status DEFAULT 'draft',
    work_type work_type NOT NULL,
    experience_level experience_level,
    education_level education_level,
    salary_min INTEGER,
    salary_max INTEGER,
    salary_currency TEXT DEFAULT 'TRY',
    show_salary BOOLEAN DEFAULT false,
    location_city TEXT NOT NULL,
    location_district TEXT,
    location_address TEXT,
    is_remote BOOLEAN DEFAULT false,
    application_deadline TIMESTAMPTZ,
    view_count INTEGER DEFAULT 0,
    application_count INTEGER DEFAULT 0,
    phone_reveal_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    featured_until TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, slug)
);

-- Aday Profilleri
CREATE TABLE candidate_profiles (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT,
    bio TEXT,
    date_of_birth DATE,
    gender TEXT,
    city TEXT,
    experience_years INTEGER,
    education_level education_level,
    skills TEXT[],
    languages JSONB, -- {lang: level}
    resume_url TEXT,
    linkedin_url TEXT,
    portfolio_url TEXT,
    is_open_to_work BOOLEAN DEFAULT true,
    preferred_work_types work_type[],
    preferred_locations TEXT[],
    expected_salary_min INTEGER,
    expected_salary_max INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Başvurular
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending', -- pending, reviewed, shortlisted, rejected, accepted
    cover_letter TEXT,
    resume_url TEXT,
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    notes TEXT,
    UNIQUE(job_id, candidate_id)
);

-- Telefon Gösterim Takibi (Phone Click Tracking)
CREATE TABLE phone_reveals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    ip_address TEXT,
    user_agent TEXT,
    revealed_at TIMESTAMPTZ DEFAULT NOW(),
    revealed_date DATE DEFAULT CURRENT_DATE,
    UNIQUE(job_id, user_id, revealed_date)
);

-- Favoriler
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, job_id)
);

-- Kategoriler/Sektörler
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- İş-Kategori İlişkisi
CREATE TABLE job_categories (
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (job_id, category_id)
);

-- =============================================
-- INDEXES
-- =============================================

-- Profiller
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);

-- Şirketler
CREATE INDEX idx_companies_owner ON companies(owner_id);
CREATE INDEX idx_companies_slug ON companies(slug);
CREATE INDEX idx_companies_city ON companies(city);

-- İş İlanları
CREATE INDEX idx_jobs_company ON jobs(company_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_city ON jobs(location_city);
CREATE INDEX idx_jobs_published ON jobs(published_at DESC) WHERE status = 'active';
CREATE INDEX idx_jobs_featured ON jobs(is_featured, featured_until) WHERE status = 'active';
CREATE INDEX idx_jobs_slug ON jobs(slug);
CREATE INDEX idx_jobs_work_type ON jobs(work_type);
CREATE INDEX idx_jobs_experience ON jobs(experience_level);

-- Başvurular
CREATE INDEX idx_applications_job ON applications(job_id);
CREATE INDEX idx_applications_candidate ON applications(candidate_id);
CREATE INDEX idx_applications_status ON applications(status);

-- Telefon Takibi
CREATE INDEX idx_phone_reveals_job ON phone_reveals(job_id);
CREATE INDEX idx_phone_reveals_user ON phone_reveals(user_id);

-- Favoriler
CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_job ON favorites(job_id);

-- Kategoriler
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent ON categories(parent_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Profiller RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiller herkese görünür"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Kullanıcılar kendi profillerini güncelleyebilir"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Şirketler RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Şirketler herkese görünür"
    ON companies FOR SELECT
    USING (is_active = true);

CREATE POLICY "Şirket sahipleri kendi şirketlerini yönetebilir"
    ON companies FOR ALL
    USING (auth.uid() = owner_id);

CREATE POLICY "Adminler tüm şirketleri yönetebilir"
    ON companies FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- İş İlanları RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Aktif iş ilanları herkese görünür"
    ON jobs FOR SELECT
    USING (status = 'active' OR company_id IN (
        SELECT id FROM companies WHERE owner_id = auth.uid()
    ));

CREATE POLICY "Şirketler kendi ilanlarını yönetebilir"
    ON jobs FOR ALL
    USING (
        company_id IN (
            SELECT id FROM companies WHERE owner_id = auth.uid()
        )
    );

-- Başvurular RLS
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Adaylar kendi başvurularını görebilir"
    ON applications FOR SELECT
    USING (candidate_id = auth.uid());

CREATE POLICY "Şirketler kendi ilanlarına yapılan başvuruları görebilir"
    ON applications FOR SELECT
    USING (
        job_id IN (
            SELECT id FROM jobs WHERE company_id IN (
                SELECT id FROM companies WHERE owner_id = auth.uid()
            )
        )
    );

CREATE POLICY "Adaylar başvuru yapabilir"
    ON applications FOR INSERT
    WITH CHECK (candidate_id = auth.uid());

-- Telefon Takibi RLS
ALTER TABLE phone_reveals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Telefon takibi eklenebilir"
    ON phone_reveals FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Şirketler kendi ilanlarının takibini görebilir"
    ON phone_reveals FOR SELECT
    USING (
        job_id IN (
            SELECT id FROM jobs WHERE company_id IN (
                SELECT id FROM companies WHERE owner_id = auth.uid()
            )
        )
    );

-- Favoriler RLS
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kullanıcılar kendi favorilerini yönetebilir"
    ON favorites FOR ALL
    USING (auth.uid() = user_id);

-- Kategoriler RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kategoriler herkese görünür"
    ON categories FOR SELECT
    USING (is_active = true);

-- =============================================
-- TRIGGERS
-- =============================================

-- Updated_at otomasyonu
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- İlan sayacı güncellemesi
CREATE OR REPLACE FUNCTION update_company_job_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
        UPDATE companies
        SET active_job_posts = active_job_posts + 1
        WHERE id = NEW.company_id;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status != 'active' AND NEW.status = 'active' THEN
            UPDATE companies
            SET active_job_posts = active_job_posts + 1
            WHERE id = NEW.company_id;
        ELSIF OLD.status = 'active' AND NEW.status != 'active' THEN
            UPDATE companies
            SET active_job_posts = active_job_posts - 1
            WHERE id = NEW.company_id;
        END IF;
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'active' THEN
        UPDATE companies
        SET active_job_posts = active_job_posts - 1
        WHERE id = OLD.company_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_company_job_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_company_job_count();

-- Telefon gösterim sayacı
CREATE OR REPLACE FUNCTION update_phone_reveal_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE jobs
    SET phone_reveal_count = phone_reveal_count + 1
    WHERE id = NEW.job_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_phone_reveal_count_trigger
    AFTER INSERT ON phone_reveals
    FOR EACH ROW EXECUTE FUNCTION update_phone_reveal_count();

-- Başvuru sayacı
CREATE OR REPLACE FUNCTION update_application_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE jobs
        SET application_count = application_count + 1
        WHERE id = NEW.job_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE jobs
        SET application_count = application_count - 1
        WHERE id = OLD.job_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_application_count_trigger
    AFTER INSERT OR DELETE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_application_count();
