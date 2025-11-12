export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: 'admin' | 'company' | 'candidate'
          email: string
          full_name: string | null
          phone: string | null
          avatar_url: string | null
          is_active: boolean
          subscription_tier: 'free' | 'basic' | 'professional' | 'enterprise'
          subscription_expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: 'admin' | 'company' | 'candidate'
          email: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          is_active?: boolean
          subscription_tier?: 'free' | 'basic' | 'professional' | 'enterprise'
          subscription_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: 'admin' | 'company' | 'candidate'
          email?: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          is_active?: boolean
          subscription_tier?: 'free' | 'basic' | 'professional' | 'enterprise'
          subscription_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      companies: {
        Row: {
          id: string
          owner_id: string
          name: string
          slug: string
          description: string | null
          website: string | null
          logo_url: string | null
          company_size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise' | null
          industry: string | null
          founded_year: number | null
          address: string | null
          city: string | null
          country: string
          phone: string | null
          email: string | null
          is_verified: boolean
          is_active: boolean
          subscription_tier: 'free' | 'basic' | 'professional' | 'enterprise'
          job_post_limit: number
          active_job_posts: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          slug: string
          description?: string | null
          website?: string | null
          logo_url?: string | null
          company_size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise' | null
          industry?: string | null
          founded_year?: number | null
          address?: string | null
          city?: string | null
          country?: string
          phone?: string | null
          email?: string | null
          is_verified?: boolean
          is_active?: boolean
          subscription_tier?: 'free' | 'basic' | 'professional' | 'enterprise'
          job_post_limit?: number
          active_job_posts?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          slug?: string
          description?: string | null
          website?: string | null
          logo_url?: string | null
          company_size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise' | null
          industry?: string | null
          founded_year?: number | null
          address?: string | null
          city?: string | null
          country?: string
          phone?: string | null
          email?: string | null
          is_verified?: boolean
          is_active?: boolean
          subscription_tier?: 'free' | 'basic' | 'professional' | 'enterprise'
          job_post_limit?: number
          active_job_posts?: number
          created_at?: string
          updated_at?: string
        }
      }
      jobs: {
        Row: {
          id: string
          company_id: string
          title: string
          slug: string
          description: string
          requirements: string | null
          benefits: string | null
          status: 'draft' | 'active' | 'paused' | 'closed' | 'expired'
          work_type: 'full_time' | 'part_time' | 'contract' | 'freelance' | 'internship'
          experience_level: 'entry' | 'junior' | 'mid' | 'senior' | 'lead' | 'executive' | null
          education_level: 'high_school' | 'associate' | 'bachelor' | 'master' | 'doctorate' | null
          salary_min: number | null
          salary_max: number | null
          salary_currency: string
          show_salary: boolean
          location_city: string
          location_district: string | null
          location_address: string | null
          is_remote: boolean
          application_deadline: string | null
          view_count: number
          application_count: number
          phone_reveal_count: number
          is_featured: boolean
          featured_until: string | null
          published_at: string | null
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          title: string
          slug: string
          description: string
          requirements?: string | null
          benefits?: string | null
          status?: 'draft' | 'active' | 'paused' | 'closed' | 'expired'
          work_type: 'full_time' | 'part_time' | 'contract' | 'freelance' | 'internship'
          experience_level?: 'entry' | 'junior' | 'mid' | 'senior' | 'lead' | 'executive' | null
          education_level?: 'high_school' | 'associate' | 'bachelor' | 'master' | 'doctorate' | null
          salary_min?: number | null
          salary_max?: number | null
          salary_currency?: string
          show_salary?: boolean
          location_city: string
          location_district?: string | null
          location_address?: string | null
          is_remote?: boolean
          application_deadline?: string | null
          view_count?: number
          application_count?: number
          phone_reveal_count?: number
          is_featured?: boolean
          featured_until?: string | null
          published_at?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          title?: string
          slug?: string
          description?: string
          requirements?: string | null
          benefits?: string | null
          status?: 'draft' | 'active' | 'paused' | 'closed' | 'expired'
          work_type?: 'full_time' | 'part_time' | 'contract' | 'freelance' | 'internship'
          experience_level?: 'entry' | 'junior' | 'mid' | 'senior' | 'lead' | 'executive' | null
          education_level?: 'high_school' | 'associate' | 'bachelor' | 'master' | 'doctorate' | null
          salary_min?: number | null
          salary_max?: number | null
          salary_currency?: string
          show_salary?: boolean
          location_city?: string
          location_district?: string | null
          location_address?: string | null
          is_remote?: boolean
          application_deadline?: string | null
          view_count?: number
          application_count?: number
          phone_reveal_count?: number
          is_featured?: boolean
          featured_until?: string | null
          published_at?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      phone_reveals: {
        Row: {
          id: string
          job_id: string
          user_id: string | null
          ip_address: string | null
          user_agent: string | null
          revealed_at: string
          revealed_date: string
        }
        Insert: {
          id?: string
          job_id: string
          user_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          revealed_at?: string
          revealed_date?: string
        }
        Update: {
          id?: string
          job_id?: string
          user_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          revealed_at?: string
          revealed_date?: string
        }
      }
    }
  }
}
