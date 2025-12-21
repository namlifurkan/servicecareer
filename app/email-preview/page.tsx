import EmailPreviewClient from '@/components/email-preview-client'

// Prevent static generation - this page requires runtime env vars
export const dynamic = 'force-dynamic'

export default function EmailPreviewPage() {
  return <EmailPreviewClient />
}
