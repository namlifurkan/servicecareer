import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CandidateProfileFormEnhanced } from '@/components/candidate/candidate-profile-form-enhanced'
import { ExperiencesSectionEnhanced } from '@/components/candidate/experiences-section-enhanced'
import { EducationsSection } from '@/components/candidate/educations-section'
import { CertificatesSection } from '@/components/candidate/certificates-section'
import { LanguagesSection } from '@/components/candidate/languages-section'

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

  // Get experiences with service industry fields
  const { data: experiences } = await supabase
    .from('experiences')
    .select('*')
    .eq('candidate_id', user.id)
    .order('is_current', { ascending: false })
    .order('start_date', { ascending: false })

  // Get educations
  const { data: educations } = await supabase
    .from('educations')
    .select('*')
    .eq('candidate_id', user.id)
    .order('display_order', { ascending: true })

  // Get certificates
  const { data: certificates } = await supabase
    .from('candidate_certificates')
    .select('*')
    .eq('candidate_id', user.id)
    .order('created_at', { ascending: false })

  // Get languages
  const { data: languages } = await supabase
    .from('candidate_languages')
    .select('*')
    .eq('candidate_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold text-secondary-900 mb-2">
            Profilimi Düzenle
          </h1>
          <p className="text-secondary-600">
            Hizmet sektörüne özel profilini oluştur ve işverenlerin dikkatini çek
          </p>
        </div>

        {/* Profile Completion Guide */}
        <ProfileCompletionGuide
          profile={profile}
          candidateProfile={candidateProfile}
          experiences={experiences || []}
          certificates={certificates || []}
          languages={languages || []}
        />

        <div className="space-y-6">
          {/* Basic Profile Info */}
          <CandidateProfileFormEnhanced
            profile={profile}
            candidateProfile={candidateProfile}
          />

          {/* Experiences */}
          <ExperiencesSectionEnhanced
            candidateId={user.id}
            experiences={experiences || []}
          />

          {/* Certificates */}
          <CertificatesSection
            candidateId={user.id}
            certificates={certificates || []}
          />

          {/* Languages */}
          <LanguagesSection
            candidateId={user.id}
            languages={languages || []}
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

// Profile Completion Guide Component
function ProfileCompletionGuide({
  profile,
  candidateProfile,
  experiences,
  certificates,
  languages,
}: {
  profile: any
  candidateProfile: any
  experiences: any[]
  certificates: any[]
  languages: any[]
}) {
  const checkItems = [
    {
      label: 'Profil fotoğrafı',
      completed: !!profile?.avatar_url,
      weight: 10,
    },
    {
      label: 'Hakkımda yazısı',
      completed: !!candidateProfile?.bio,
      weight: 10,
    },
    {
      label: 'Profesyonel unvan',
      completed: !!candidateProfile?.title,
      weight: 5,
    },
    {
      label: 'Tercih edilen pozisyonlar',
      completed: candidateProfile?.position_types?.length > 0,
      weight: 15,
    },
    {
      label: 'Deneyim seviyesi',
      completed: !!candidateProfile?.service_experience,
      weight: 10,
    },
    {
      label: 'En az 1 deneyim',
      completed: experiences.length > 0,
      weight: 20,
    },
    {
      label: 'En az 1 sertifika',
      completed: certificates.length > 0,
      weight: 15,
    },
    {
      label: 'Dil bilgisi',
      completed: languages.length > 0,
      weight: 10,
    },
    {
      label: 'Şehir bilgisi',
      completed: !!candidateProfile?.city,
      weight: 5,
    },
  ]

  const completedWeight = checkItems
    .filter(item => item.completed)
    .reduce((sum, item) => sum + item.weight, 0)

  const incompleteItems = checkItems.filter(item => !item.completed)

  if (completedWeight >= 100) {
    return null // Hide when profile is complete
  }

  return (
    <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl border border-primary-200 p-6 mb-6">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-primary-900">
              Profil Tamamlama: %{completedWeight}
            </h3>
            <span className="text-sm text-primary-700">
              {incompleteItems.length} adım kaldı
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-2 bg-white rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-primary-500 transition-all duration-500"
              style={{ width: `${completedWeight}%` }}
            />
          </div>

          {/* Incomplete Items */}
          <div className="flex flex-wrap gap-2">
            {incompleteItems.slice(0, 4).map((item, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 bg-white text-primary-700 text-sm rounded-full border border-primary-200"
              >
                {item.label}
              </span>
            ))}
            {incompleteItems.length > 4 && (
              <span className="inline-flex items-center px-3 py-1 bg-white text-primary-600 text-sm rounded-full border border-primary-200">
                +{incompleteItems.length - 4} daha
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
