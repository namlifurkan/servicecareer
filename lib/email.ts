import { Resend } from 'resend';
import WelcomeEmail from '@/emails/welcome';
import ApplicationReceivedEmail from '@/emails/application-received';
import NewApplicationEmail from '@/emails/new-application';
import ApplicationStatusEmail from '@/emails/application-status';

// Lazy initialize Resend client to avoid build-time errors
let resend: Resend | null = null;

function getResendClient(): Resend {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

// Email sender configuration
// NOTE: This email needs domain verification in Resend dashboard
// For development, Resend provides a test domain: onboarding@resend.dev
const FROM_EMAIL = 'Yeme İçme İşleri <noreply@yemeicmeisleri.com>';

/**
 * Email service response type
 */
export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send welcome email to newly registered users
 *
 * @param to - Recipient email address
 * @param name - User's full name
 * @returns Promise with success/error status
 *
 * @example
 * const result = await sendWelcomeEmail('user@example.com', 'Ahmet Yılmaz');
 */
export async function sendWelcomeEmail(
  to: string,
  name: string
): Promise<EmailResponse> {
  try {
    console.log(`[Email Service] Sending welcome email to: ${to}`);

    const { data, error } = await getResendClient().emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: 'Yeme İçme İşleri\'ne Hoş Geldiniz!',
      react: WelcomeEmail({ name }),
    });

    if (error) {
      console.error('[Email Service] Welcome email failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log(`[Email Service] Welcome email sent successfully. ID: ${data?.id}`);
    return {
      success: true,
      messageId: data?.id,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[Email Service] Welcome email exception:', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Send application received confirmation to candidate
 *
 * @param to - Candidate's email address
 * @param candidateName - Candidate's full name
 * @param jobTitle - Title of the job applied for
 * @param companyName - Company name
 * @returns Promise with success/error status
 *
 * @example
 * await sendApplicationReceivedEmail(
 *   'candidate@example.com',
 *   'Ayşe Demir',
 *   'Garson',
 *   'Starbucks'
 * );
 */
export async function sendApplicationReceivedEmail(
  to: string,
  candidateName: string,
  jobTitle: string,
  companyName: string
): Promise<EmailResponse> {
  try {
    console.log(`[Email Service] Sending application confirmation to: ${to}`);
    console.log(`[Email Service] Job: ${jobTitle} at ${companyName}`);

    const { data, error } = await getResendClient().emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `Başvurunuz Alındı - ${jobTitle}`,
      react: ApplicationReceivedEmail({
        candidateName,
        jobTitle,
        companyName,
      }),
    });

    if (error) {
      console.error('[Email Service] Application confirmation failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log(`[Email Service] Application confirmation sent. ID: ${data?.id}`);
    return {
      success: true,
      messageId: data?.id,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[Email Service] Application confirmation exception:', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Send new application notification to employer
 *
 * @param to - Employer's email address
 * @param employerName - Employer's full name or company name
 * @param candidateName - Applicant's full name
 * @param jobTitle - Job title
 * @param applicationId - Unique application identifier
 * @returns Promise with success/error status
 *
 * @example
 * await sendNewApplicationEmail(
 *   'employer@company.com',
 *   'Mehmet Bey',
 *   'Ayşe Demir',
 *   'Garson',
 *   '550e8400-e29b-41d4-a716-446655440000'
 * );
 */
export async function sendNewApplicationEmail(
  to: string,
  employerName: string,
  candidateName: string,
  jobTitle: string,
  applicationId: string
): Promise<EmailResponse> {
  try {
    console.log(`[Email Service] Sending new application notification to: ${to}`);
    console.log(`[Email Service] Candidate: ${candidateName} for ${jobTitle}`);

    const { data, error } = await getResendClient().emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `Yeni Başvuru: ${candidateName} - ${jobTitle}`,
      react: NewApplicationEmail({
        employerName,
        candidateName,
        jobTitle,
        applicationId,
      }),
    });

    if (error) {
      console.error('[Email Service] New application notification failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log(`[Email Service] New application notification sent. ID: ${data?.id}`);
    return {
      success: true,
      messageId: data?.id,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[Email Service] New application notification exception:', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Send application status update to candidate
 *
 * @param to - Candidate's email address
 * @param candidateName - Candidate's full name
 * @param jobTitle - Job title
 * @param status - Application status (pending, reviewing, approved, rejected)
 * @param companyName - Company name
 * @returns Promise with success/error status
 *
 * @example
 * await sendApplicationStatusEmail(
 *   'candidate@example.com',
 *   'Ayşe Demir',
 *   'Garson',
 *   'approved',
 *   'Starbucks'
 * );
 */
export async function sendApplicationStatusEmail(
  to: string,
  candidateName: string,
  jobTitle: string,
  status: 'pending' | 'reviewing' | 'approved' | 'rejected',
  companyName: string
): Promise<EmailResponse> {
  try {
    console.log(`[Email Service] Sending status update to: ${to}`);
    console.log(`[Email Service] Status: ${status} for ${jobTitle}`);

    const { data, error } = await getResendClient().emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `Başvuru Durumu Güncellendi - ${jobTitle}`,
      react: ApplicationStatusEmail({
        candidateName,
        jobTitle,
        status,
        companyName,
      }),
    });

    if (error) {
      console.error('[Email Service] Status update failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log(`[Email Service] Status update sent. ID: ${data?.id}`);
    return {
      success: true,
      messageId: data?.id,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[Email Service] Status update exception:', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Validate email configuration
 *
 * @returns Object with configuration status
 *
 * @example
 * const config = validateEmailConfig();
 * if (!config.isValid) {
 *   console.error('Email not configured:', config.message);
 * }
 */
export function validateEmailConfig(): {
  isValid: boolean;
  message: string;
} {
  if (!process.env.RESEND_API_KEY) {
    return {
      isValid: false,
      message: 'RESEND_API_KEY is not configured in environment variables',
    };
  }

  if (process.env.RESEND_API_KEY === 're_YOUR_API_KEY_HERE') {
    return {
      isValid: false,
      message: 'RESEND_API_KEY is set to placeholder value. Please update with real API key.',
    };
  }

  return {
    isValid: true,
    message: 'Email service is properly configured',
  };
}
