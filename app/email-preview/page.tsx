'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import WelcomeEmail from '@/emails/welcome'
import ApplicationReceivedEmail from '@/emails/application-received'
import NewApplicationEmail from '@/emails/new-application'
import ApplicationStatusEmail from '@/emails/application-status'
import { sendWelcomeEmail, sendApplicationReceivedEmail, sendNewApplicationEmail, sendApplicationStatusEmail } from '@/lib/email'

type EmailType = 'welcome' | 'application-received' | 'new-application' | 'status-pending' | 'status-reviewing' | 'status-approved' | 'status-rejected'

export default function EmailPreviewPage() {
  const [activeTab, setActiveTab] = useState<EmailType>('welcome')
  const [testEmail, setTestEmail] = useState('')
  const [sending, setSending] = useState(false)

  const handleSendTestEmail = async () => {
    if (!testEmail || !testEmail.includes('@')) {
      toast.error('Lütfen geçerli bir email adresi girin')
      return
    }

    setSending(true)

    try {
      let result: { success: boolean; error?: string }

      switch (activeTab) {
        case 'welcome':
          result = await sendWelcomeEmail(testEmail, 'Ali Yılmaz')
          break
        case 'application-received':
          result = await sendApplicationReceivedEmail(
            testEmail,
            'Ali Yılmaz',
            'Garson',
            'Starbucks'
          )
          break
        case 'new-application':
          result = await sendNewApplicationEmail(
            testEmail,
            'Mehmet Demir',
            'Ali Yılmaz',
            'Garson',
            '550e8400-e29b-41d4-a716-446655440000'
          )
          break
        case 'status-pending':
          result = await sendApplicationStatusEmail(
            testEmail,
            'Ali Yılmaz',
            'Garson',
            'pending',
            'Starbucks'
          )
          break
        case 'status-reviewing':
          result = await sendApplicationStatusEmail(
            testEmail,
            'Ali Yılmaz',
            'Garson',
            'reviewing',
            'Starbucks'
          )
          break
        case 'status-approved':
          result = await sendApplicationStatusEmail(
            testEmail,
            'Ali Yılmaz',
            'Garson',
            'approved',
            'Starbucks'
          )
          break
        case 'status-rejected':
          result = await sendApplicationStatusEmail(
            testEmail,
            'Ali Yılmaz',
            'Garson',
            'rejected',
            'Starbucks'
          )
          break
        default:
          result = { success: false, error: 'Bilinmeyen email tipi' }
      }

      if (result.success) {
        toast.success('Test email gönderildi! Email kutunuzu kontrol edin.')
      } else {
        toast.error(result.error || 'Email gönderilemedi')
      }
    } catch (error) {
      console.error('Email send error:', error)
      toast.error('Email gönderilemedi')
    } finally {
      setSending(false)
    }
  }

  const tabs = [
    { id: 'welcome' as EmailType, label: 'Hoş Geldiniz' },
    { id: 'application-received' as EmailType, label: 'Başvuru Alındı' },
    { id: 'new-application' as EmailType, label: 'Yeni Başvuru (İşveren)' },
    { id: 'status-pending' as EmailType, label: 'Durum: Beklemede' },
    { id: 'status-reviewing' as EmailType, label: 'Durum: İnceleniyor' },
    { id: 'status-approved' as EmailType, label: 'Durum: Onaylandı' },
    { id: 'status-rejected' as EmailType, label: 'Durum: Reddedildi' },
  ]

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Warning Banner */}
      <div className="bg-accent-600 text-white py-3 px-4 text-center font-medium">
        ⚠️ GELİŞTİRME ORTAMI - Bu sayfa production&apos;da kaldırılmalıdır!
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">
            Email Template Preview
          </h1>
          <p className="text-secondary-600">
            Tüm email şablonlarını görüntüleyin ve test emaili gönderin
          </p>
        </div>

        {/* Test Email Form */}
        <div className="bg-white rounded-xl border border-secondary-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">
            Test Email Gönder
          </h2>
          <div className="flex gap-4">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="test@example.com"
              className="flex-1 bg-white border border-secondary-200 rounded-lg px-4 py-2.5 text-secondary-900 placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              onClick={handleSendTestEmail}
              disabled={sending || !testEmail}
              className="bg-primary-600 hover:bg-primary-700 disabled:bg-secondary-300 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
            >
              {sending ? 'Gönderiliyor...' : 'Email Gönder'}
            </button>
          </div>
          <p className="text-sm text-secondary-500 mt-2">
            Aktif sekmeye göre test emaili gönderilir
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-secondary-200 overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-secondary-200 overflow-x-auto">
            <div className="flex min-w-max">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-secondary-600 hover:text-secondary-900 hover:border-secondary-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Preview Frame */}
            <div className="bg-secondary-100 rounded-lg p-4 overflow-auto">
              <div className="max-w-2xl mx-auto bg-white shadow-lg">
                {activeTab === 'welcome' && (
                  <WelcomeEmail name="Ali Yılmaz" />
                )}
                {activeTab === 'application-received' && (
                  <ApplicationReceivedEmail
                    candidateName="Ali Yılmaz"
                    jobTitle="Garson"
                    companyName="Starbucks"
                  />
                )}
                {activeTab === 'new-application' && (
                  <NewApplicationEmail
                    employerName="Mehmet Demir"
                    candidateName="Ali Yılmaz"
                    jobTitle="Garson"
                    applicationId="550e8400-e29b-41d4-a716-446655440000"
                  />
                )}
                {activeTab === 'status-pending' && (
                  <ApplicationStatusEmail
                    candidateName="Ali Yılmaz"
                    jobTitle="Garson"
                    status="pending"
                    companyName="Starbucks"
                    message="Başvurunuz inceleniyor."
                  />
                )}
                {activeTab === 'status-reviewing' && (
                  <ApplicationStatusEmail
                    candidateName="Ali Yılmaz"
                    jobTitle="Garson"
                    status="reviewing"
                    companyName="Starbucks"
                    message="İşveren profilinizi inceliyor."
                  />
                )}
                {activeTab === 'status-approved' && (
                  <ApplicationStatusEmail
                    candidateName="Ali Yılmaz"
                    jobTitle="Garson"
                    status="approved"
                    companyName="Starbucks"
                    message="Tebrikler! İşveren sizinle görüşmek istiyor."
                    interviewDate="15 Ocak 2025, Saat 14:00"
                  />
                )}
                {activeTab === 'status-rejected' && (
                  <ApplicationStatusEmail
                    candidateName="Ali Yılmaz"
                    jobTitle="Garson"
                    status="rejected"
                    companyName="Starbucks"
                    message="Maalesef bu sefer olmadı, ancak diğer fırsatlar için başvurmaya devam edin!"
                  />
                )}
              </div>
            </div>

            {/* Template Info */}
            <div className="mt-6 bg-secondary-50 rounded-lg p-4">
              <h3 className="font-semibold text-secondary-900 mb-2">
                Şablon Bilgisi
              </h3>
              <div className="space-y-2 text-sm text-secondary-600">
                {activeTab === 'welcome' && (
                  <>
                    <p><strong>Dosya:</strong> /emails/welcome.tsx</p>
                    <p><strong>Konu:</strong> ServiceCareer&apos;a Hoş Geldiniz!</p>
                    <p><strong>Kullanım:</strong> Yeni kullanıcı kaydı sonrası</p>
                    <p><strong>Test Verisi:</strong> name=&quot;Ali Yılmaz&quot;</p>
                  </>
                )}
                {activeTab === 'application-received' && (
                  <>
                    <p><strong>Dosya:</strong> /emails/application-received.tsx</p>
                    <p><strong>Konu:</strong> Başvurunuz Alındı - Garson</p>
                    <p><strong>Kullanım:</strong> Aday başvuru yaptıktan sonra</p>
                    <p><strong>Test Verisi:</strong> candidateName=&quot;Ali Yılmaz&quot;, jobTitle=&quot;Garson&quot;, companyName=&quot;Starbucks&quot;</p>
                  </>
                )}
                {activeTab === 'new-application' && (
                  <>
                    <p><strong>Dosya:</strong> /emails/new-application.tsx</p>
                    <p><strong>Konu:</strong> Yeni Başvuru - Ali Yılmaz - Garson</p>
                    <p><strong>Kullanım:</strong> İşverene yeni başvuru bildirimi</p>
                    <p><strong>Test Verisi:</strong> employerName=&quot;Mehmet Demir&quot;, candidateName=&quot;Ali Yılmaz&quot;, jobTitle=&quot;Garson&quot;, applicationId=&quot;123&quot;</p>
                  </>
                )}
                {activeTab.startsWith('status-') && (
                  <>
                    <p><strong>Dosya:</strong> /emails/application-status.tsx</p>
                    <p><strong>Konu:</strong> Başvurunuzda Güncelleme - Garson</p>
                    <p><strong>Kullanım:</strong> Başvuru durumu değiştiğinde</p>
                    <p><strong>Test Verisi:</strong> candidateName=&quot;Ali Yılmaz&quot;, jobTitle=&quot;Garson&quot;, status=&quot;{activeTab.replace('status-', '')}&quot;, companyName=&quot;Starbucks&quot;</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Documentation Link */}
        <div className="mt-6 bg-primary-50 rounded-xl border border-primary-200 p-6">
          <h3 className="font-semibold text-primary-900 mb-2">
            📚 Email Test Dokümantasyonu
          </h3>
          <p className="text-primary-700 mb-4">
            Detaylı test senaryoları, checklist ve production stratejisi için dokümantasyona göz atın.
          </p>
          <a
            href="/docs/EMAIL_TESTING.md"
            target="_blank"
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Dokümantasyonu Aç
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

        {/* React Email Dev Server Info */}
        <div className="mt-6 bg-secondary-50 rounded-xl border border-secondary-200 p-6">
          <h3 className="font-semibold text-secondary-900 mb-2">
            🛠️ React Email Dev Server
          </h3>
          <p className="text-secondary-600 mb-4">
            Email şablonlarını düzenlerken canlı önizleme için React Email dev server&apos;ı kullanın.
          </p>
          <div className="bg-secondary-900 text-secondary-50 rounded-lg p-4 font-mono text-sm">
            <code>npx react-email dev</code>
          </div>
          <p className="text-secondary-600 mt-2 text-sm">
            Server başladıktan sonra <strong>http://localhost:3001</strong> adresinden preview arayüzüne erişebilirsiniz.
          </p>
        </div>

        {/* Production Warning */}
        <div className="mt-6 bg-accent-50 rounded-xl border border-accent-200 p-6">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-accent-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="font-semibold text-accent-900 mb-1">
                Production Uyarısı
              </h3>
              <p className="text-accent-700 text-sm">
                Bu sayfa sadece development ortamında kullanılmalıdır. Production&apos;a deploy etmeden önce bu route&apos;u kaldırın veya authentication ile koruma altına alın.
              </p>
              <p className="text-accent-700 text-sm mt-2">
                <strong>Kaldırılacak dosya:</strong> /app/email-preview/page.tsx
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
