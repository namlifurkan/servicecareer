'use server'

import { sendWelcomeEmail, sendApplicationReceivedEmail, sendNewApplicationEmail, sendApplicationStatusEmail } from '@/lib/email'

type EmailType = 'welcome' | 'application-received' | 'new-application' | 'status-pending' | 'status-reviewing' | 'status-approved' | 'status-rejected'

export async function sendTestEmail(
  email: string,
  emailType: EmailType
): Promise<{ success: boolean; error?: string }> {
  switch (emailType) {
    case 'welcome':
      return sendWelcomeEmail(email, 'Ali Yılmaz')
    case 'application-received':
      return sendApplicationReceivedEmail(
        email,
        'Ali Yılmaz',
        'Garson',
        'Starbucks'
      )
    case 'new-application':
      return sendNewApplicationEmail(
        email,
        'Mehmet Demir',
        'Ali Yılmaz',
        'Garson',
        '550e8400-e29b-41d4-a716-446655440000'
      )
    case 'status-pending':
      return sendApplicationStatusEmail(
        email,
        'Ali Yılmaz',
        'Garson',
        'pending',
        'Starbucks'
      )
    case 'status-reviewing':
      return sendApplicationStatusEmail(
        email,
        'Ali Yılmaz',
        'Garson',
        'reviewing',
        'Starbucks'
      )
    case 'status-approved':
      return sendApplicationStatusEmail(
        email,
        'Ali Yılmaz',
        'Garson',
        'approved',
        'Starbucks'
      )
    case 'status-rejected':
      return sendApplicationStatusEmail(
        email,
        'Ali Yılmaz',
        'Garson',
        'rejected',
        'Starbucks'
      )
    default:
      return { success: false, error: 'Bilinmeyen email tipi' }
  }
}
