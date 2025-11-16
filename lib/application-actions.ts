'use server'

import { createClient } from '@/lib/supabase/server'
import { sendApplicationReceivedEmail, sendNewApplicationEmail } from '@/lib/email'

export interface ApplicationSubmissionResult {
  success: boolean
  error?: string
  applicationId?: string
}

export async function submitApplication(
  jobId: string,
  cvUrl: string,
  coverLetter: string | null,
  contactPreference: string,
  guestData?: {
    fullName: string
    email: string
    phone: string
  }
): Promise<ApplicationSubmissionResult> {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    // Create application
    const applicationData: any = {
      job_id: jobId,
      cv_url: cvUrl,
      cover_letter: coverLetter,
      contact_preference: contactPreference,
      status: 'pending'
    }

    // Add user-specific or guest-specific data
    if (user) {
      applicationData.candidate_id = user.id
    } else if (guestData) {
      applicationData.guest_name = guestData.fullName
      applicationData.guest_email = guestData.email
      applicationData.guest_phone = guestData.phone
    }

    const { data: applicationInserted, error: insertError } = await supabase
      .from('applications')
      .insert(applicationData)
      .select()
      .single()

    if (insertError) {
      console.error('[Application] Insert error:', insertError)
      return {
        success: false,
        error: insertError.message
      }
    }

    // Get job details for emails
    const { data: jobData } = await supabase
      .from('jobs')
      .select('title, company_id')
      .eq('id', jobId)
      .single()

    if (jobData) {
      // Get candidate details
      let candidateEmail = ''
      let candidateName = ''

      if (user) {
        // For logged-in users, get profile data
        const { data: profile } = await supabase
          .from('profiles')
          .select('email, full_name')
          .eq('id', user.id)
          .single()

        candidateEmail = profile?.email || user.email || ''
        candidateName = profile?.full_name || 'Kullanıcı'
      } else if (guestData) {
        // For guest users, use form data
        candidateEmail = guestData.email
        candidateName = guestData.fullName
      }

      const jobTitle = jobData.title

      // Get company details
      let companyName = 'Şirket'
      let employerEmail = ''
      let employerName = ''

      if (jobData.company_id) {
        const { data: companyData } = await supabase
          .from('companies')
          .select('name, owner_id')
          .eq('id', jobData.company_id)
          .single()

        companyName = companyData?.name || 'Şirket'

        // Get employer profile
        if (companyData?.owner_id) {
          const { data: ownerProfile } = await supabase
            .from('profiles')
            .select('email, full_name')
            .eq('id', companyData.owner_id)
            .single()

          employerEmail = ownerProfile?.email || ''
          employerName = ownerProfile?.full_name || companyName
        }
      }

      // Send confirmation email to candidate
      if (candidateEmail) {
        const candidateEmailResult = await sendApplicationReceivedEmail(
          candidateEmail,
          candidateName,
          jobTitle,
          companyName
        )
        if (!candidateEmailResult.success) {
          console.error('[Application] Failed to send candidate email:', candidateEmailResult.error)
        }
      }

      // Send notification email to employer
      if (employerEmail && applicationInserted) {
        const employerEmailResult = await sendNewApplicationEmail(
          employerEmail,
          employerName,
          candidateName,
          jobTitle,
          applicationInserted.id
        )
        if (!employerEmailResult.success) {
          console.error('[Application] Failed to send employer email:', employerEmailResult.error)
        }
      }
    }

    return {
      success: true,
      applicationId: applicationInserted.id
    }
  } catch (error: any) {
    console.error('[Application] Submission error:', error)
    return {
      success: false,
      error: error.message || 'Başvuru sırasında bir hata oluştu'
    }
  }
}
