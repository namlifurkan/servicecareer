import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CandidateProfileForm } from '@/components/candidate/candidate-profile-form'
import { ExperiencesSection } from '@/components/candidate/experiences-section'
import { EducationsSection } from '@/components/candidate/educations-section'

export default async function CandidateProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/giris')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'candidate') {
    redirect('/')
  }

  // Get or create candidate profile
  let { data: candidateProfile } = await supabase
    .from('candidate_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // If no profile exists, create one
  if (!candidateProfile) {
    const { data: newProfile } = await supabase
      .from('candidate_profiles')
      .insert({ id: user.id })
      .select()
      .single()
    candidateProfile = newProfile
  }

  // Get experiences
  const { data: experiences } = await supabase
    .from('experiences')
    .select('*')
    .eq('candidate_id', user.id)
    .order('display_order', { ascending: true })

  // Get educations
  const { data: educations } = await supabase
    .from('educations')
    .select('*')
    .eq('candidate_id', user.id)
    .order('display_order', { ascending: true })

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold text-secondary-900 mb-2">
            Profilimi Düzenle
          </h1>
          <p className="text-secondary-600">
            Kişisel bilgilerini, deneyimlerini ve eğitim bilgilerini güncelle
          </p>
        </div>

        <div className="space-y-6">
          {/* Basic Profile Info */}
          <CandidateProfileForm
            profile={profile}
            candidateProfile={candidateProfile}
          />

          {/* Experiences */}
          <ExperiencesSection
            candidateId={user.id}
            experiences={experiences || []}
          />

          {/* Educations */}
          <EducationsSection
            candidateId={user.id}
            educations={educations || []}
          />
        </div>
      </div>
    </div>
  )
}
