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

interface NewApplicationEmailProps {
  employerName: string;
  candidateName: string;
  jobTitle: string;
  applicationId: string;
}

export default function NewApplicationEmail({
  employerName,
  candidateName,
  jobTitle,
  applicationId,
}: NewApplicationEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>Yeni Başvuru Aldınız</Heading>
          </Section>

          <Section style={content}>
            <Text style={greeting}>Merhaba {employerName},</Text>

            <Section style={alertBox}>
              <Text style={alertText}>
                <strong>{jobTitle}</strong> pozisyonunuza yeni bir başvuru yapıldı.
              </Text>
            </Section>

            <Text style={paragraph}>
              <strong>{candidateName}</strong> adlı aday ilanınıza başvurdu. Adayın profilini inceleyebilir ve başvuruyu değerlendirebilirsiniz.
            </Text>

            <Section style={detailsBox}>
              <Text style={detailsTitle}>Başvuru Detayları</Text>
              <Section style={detailRow}>
                <Text style={detailLabel}>Aday:</Text>
                <Text style={detailValue}>{candidateName}</Text>
              </Section>
              <Section style={detailRow}>
                <Text style={detailLabel}>Pozisyon:</Text>
                <Text style={detailValue}>{jobTitle}</Text>
              </Section>
              <Section style={detailRow}>
                <Text style={detailLabel}>Başvuru No:</Text>
                <Text style={detailValue}>#{applicationId.slice(0, 8)}</Text>
              </Section>
            </Section>

            <Section style={actionSection}>
              <Text style={actionTitle}>Değerlendirme Seçenekleri:</Text>
              <Text style={actionText}>• Adayın profilini ve CV'sini inceleyin</Text>
              <Text style={actionText}>• Başvuru durumunu güncelleyin</Text>
              <Text style={actionText}>• Uygun görürseniz adayla iletişime geçin</Text>
            </Section>

            <Section style={buttonContainer}>
              <Button
                style={primaryButton}
                href={`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/isveren/dashboard/applications/${applicationId}`}
              >
                Başvuruyu İncele
              </Button>
            </Section>

            <Section style={buttonContainer}>
              <Button
                style={secondaryButton}
                href={`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/isveren/dashboard`}
              >
                Tüm Başvuruları Görüntüle
              </Button>
            </Section>

            <Text style={paragraph}>
              Hızlı geri dönüş, adaylar için olumlu bir deneyim yaratır ve şirket imajınızı güçlendirir.
            </Text>

            <Hr style={divider} />

            <Text style={footer}>
              İyi çalışmalar,<br />
              ServiceCareer Ekibi
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

const alertBox = {
  backgroundColor: '#fef3c7',
  borderLeft: '4px solid #f59e0b',
  borderRadius: '8px',
  padding: '16px 20px',
  margin: '20px 0',
};

const alertText = {
  fontSize: '16px',
  color: '#92400e',
  margin: '0',
  lineHeight: '1.5',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#4b5563',
  margin: '0 0 16px 0',
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

const actionSection = {
  backgroundColor: '#eff6ff',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const actionTitle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#111827',
  margin: '0 0 12px 0',
};

const actionText = {
  fontSize: '15px',
  color: '#4b5563',
  margin: '6px 0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '16px 0',
};

const primaryButton = {
  backgroundColor: '#2563eb',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
  width: '100%',
  maxWidth: '300px',
};

const secondaryButton = {
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
  color: '#4b5563',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
  width: '100%',
  maxWidth: '300px',
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
