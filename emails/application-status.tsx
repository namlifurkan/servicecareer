import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Heading,
  Hr,
} from '@react-email/components';

interface ApplicationStatusEmailProps {
  candidateName: string;
  jobTitle: string;
  status: 'pending' | 'reviewing' | 'approved' | 'rejected';
  companyName: string;
  message?: string;
  interviewDate?: string;
}

const statusLabels: Record<string, string> = {
  pending: 'Beklemede',
  reviewing: 'İnceleniyor',
  approved: 'Uygun',
  rejected: 'Uygun Değil',
};

const statusColors: Record<string, string> = {
  pending: '#d97706',
  reviewing: '#2563eb',
  approved: '#16a34a',
  rejected: '#dc2626',
};

const statusBackgrounds: Record<string, string> = {
  pending: '#fef3c7',
  reviewing: '#eff6ff',
  approved: '#dcfce7',
  rejected: '#fee2e2',
};

export default function ApplicationStatusEmail({
  candidateName,
  jobTitle,
  status,
  companyName,
  message,
  interviewDate,
}: ApplicationStatusEmailProps) {
  const statusLabel = statusLabels[status] || 'Bilinmiyor';
  const statusColor = statusColors[status] || '#4b5563';
  const statusBg = statusBackgrounds[status] || '#f9fafb';

  const getStatusMessage = () => {
    if (message) return message;

    switch (status) {
      case 'reviewing':
        return 'Başvurunuz şu anda işveren tarafından detaylı olarak inceleniyor. Size en kısa sürede geri dönüş yapılacaktır.';
      case 'approved':
        return 'Tebrikler! Başvurunuz uygun görüldü. İşveren sizinle iletişime geçecektir. Lütfen iletişim bilgilerinizi güncel tutun.';
      case 'rejected':
        return 'Üzgünüz, bu pozisyon için başvurunuz değerlendirme sonucu uygun görülmedi. Diğer iş fırsatlarına göz atabilir ve kariyer yolculuğunuza devam edebilirsiniz.';
      default:
        return 'Başvurunuz işleme alınmıştır.';
    }
  };

  const getNextSteps = () => {
    switch (status) {
      case 'reviewing':
        return [
          'İşveren başvurunuzu değerlendiriyor',
          'İletişim bilgilerinizi güncel tutun',
          'E-postalarınızı kontrol edin',
        ];
      case 'approved':
        return [
          'İşveren sizinle iletişime geçecek',
          'Telefonunuzu açık tutun',
          'Mülakat için hazırlıklı olun',
        ];
      case 'rejected':
        return [
          'Profilinizi güncelleyin',
          'Yeni iş ilanlarına göz atın',
          'Farklı pozisyonlara başvurun',
        ];
      default:
        return [];
    }
  };

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>Başvuru Durumu Güncellendi</Heading>
          </Section>

          <Section style={content}>
            <Text style={greeting}>Merhaba {candidateName},</Text>

            <Text style={paragraph}>
              <strong>{jobTitle}</strong> pozisyonuna yaptığınız başvurunun durumu güncellendi.
            </Text>

            <Section style={Object.assign({}, statusBox, { backgroundColor: statusBg })}>
              <Text style={Object.assign({}, statusLabel, { color: statusColor })}>
                {statusLabel}
              </Text>
            </Section>

            <Section style={detailsBox}>
              <Text style={detailsTitle}>Başvuru Bilgileri</Text>
              <Section style={detailRow}>
                <Text style={detailLabel}>Pozisyon:</Text>
                <Text style={detailValue}>{jobTitle}</Text>
              </Section>
              <Section style={detailRow}>
                <Text style={detailLabel}>Şirket:</Text>
                <Text style={detailValue}>{companyName}</Text>
              </Section>
              <Section style={detailRow}>
                <Text style={detailLabel}>Durum:</Text>
                <Text style={{ ...detailValue, color: statusColor }}>{statusLabel}</Text>
              </Section>
            </Section>

            {interviewDate && (
              <Section style={interviewSection}>
                <Text style={interviewTitle}>📅 Mülakat Tarihi</Text>
                <Text style={interviewDateStyle}>{interviewDate}</Text>
              </Section>
            )}

            <Text style={paragraph}>{getStatusMessage()}</Text>

            {getNextSteps().length > 0 && (
              <Section style={stepsSection}>
                <Text style={stepsTitle}>Sıradaki Adımlar:</Text>
                {getNextSteps().map((step, index) => (
                  <Text key={index} style={stepText}>
                    {index + 1}. {step}
                  </Text>
                ))}
              </Section>
            )}

            <Section style={buttonContainer}>
              <Button style={button} href={`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard`}>
                {status === 'rejected' ? 'İş İlanlarına Gözat' : 'Başvurularımı Görüntüle'}
              </Button>
            </Section>

            {status === 'rejected' && (
              <Text style={encouragementText}>
                Unutmayın, her başvuru yeni bir deneyim ve öğrenme fırsatıdır. Size uygun pozisyonu bulacağınıza inanıyoruz.
              </Text>
            )}

            {status === 'approved' && (
              <Text style={encouragementText}>
                Bu fırsatı değerlendirmek için hazır olun. Size başarılar dileriz!
              </Text>
            )}

            <Hr style={divider} />

            <Text style={footer}>
              {status === 'approved' ? 'Başarılar dileriz,' : 'İyi günler dileriz,'}<br />
              Yeme İçme İşleri Ekibi
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f9fafb',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '600px',
};

const header = {
  backgroundColor: '#2563eb',
  borderRadius: '12px 12px 0 0',
  padding: '32px 24px',
  textAlign: 'center' as const,
};

const h1 = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: '700',
  margin: '0',
  lineHeight: '1.4',
};

const content = {
  backgroundColor: '#ffffff',
  borderRadius: '0 0 12px 12px',
  padding: '32px 24px',
  border: '1px solid #e5e7eb',
  borderTop: 'none',
};

const greeting = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#111827',
  margin: '0 0 16px 0',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#4b5563',
  margin: '0 0 16px 0',
};

const statusBox = {
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const statusLabel = {
  fontSize: '24px',
  fontWeight: '700' as const,
  margin: '0',
};

const detailsBox = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
  padding: '20px',
  margin: '24px 0',
};

const detailsTitle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#111827',
  margin: '0 0 16px 0',
};

const detailRow = {
  marginBottom: '12px',
};

const detailLabel = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0 0 4px 0',
};

const detailValue = {
  fontSize: '15px',
  fontWeight: '500',
  color: '#111827',
  margin: '0',
};

const interviewSection = {
  backgroundColor: '#dcfce7',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
  textAlign: 'center' as const,
  border: '1px solid #16a34a',
};

const interviewTitle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#15803d',
  margin: '0 0 8px 0',
};

const interviewDateStyle = {
  fontSize: '18px',
  fontWeight: '700' as const,
  color: '#15803d',
  margin: '0',
};

const stepsSection = {
  backgroundColor: '#eff6ff',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const stepsTitle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#111827',
  margin: '0 0 12px 0',
};

const stepText = {
  fontSize: '15px',
  color: '#4b5563',
  margin: '8px 0',
  paddingLeft: '8px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
};

const encouragementText = {
  fontSize: '15px',
  lineHeight: '1.6',
  color: '#4b5563',
  fontStyle: 'italic',
  textAlign: 'center' as const,
  margin: '20px 0',
  padding: '16px',
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
};

const divider = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
};

const footer = {
  fontSize: '14px',
  color: '#4b5563',
  lineHeight: '1.6',
  margin: '0',
};
