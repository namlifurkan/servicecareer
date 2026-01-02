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

interface ApplicationReceivedEmailProps {
  candidateName: string;
  jobTitle: string;
  companyName: string;
}

export default function ApplicationReceivedEmail({
  candidateName,
  jobTitle,
  companyName,
}: ApplicationReceivedEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>Başvurunuz Alındı</Heading>
          </Section>

          <Section style={content}>
            <Text style={greeting}>Merhaba {candidateName},</Text>

            <Text style={paragraph}>
              <strong>{jobTitle}</strong> pozisyonuna yaptığınız başvuru başarıyla alındı.
            </Text>

            <Section style={detailsBox}>
              <Text style={detailsTitle}>Başvuru Detayları</Text>
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
                <Text style={statusPending}>Beklemede</Text>
              </Section>
            </Section>

            <Text style={paragraph}>
              İşveren başvurunuzu inceleyecek ve size en kısa sürede geri dönüş yapacaktır. Başvuru durumunuzu hesabınızdan takip edebilirsiniz.
            </Text>

            <Section style={infoSection}>
              <Text style={infoTitle}>Sıradaki Adımlar:</Text>
              <Text style={infoText}>• İşveren başvurunuzu değerlendirecek</Text>
              <Text style={infoText}>• Uygun görülürseniz sizinle iletişime geçilecek</Text>
              <Text style={infoText}>• Başvuru durumunuz güncellendiğinde bilgilendirileceksiniz</Text>
            </Section>

            <Section style={buttonContainer}>
              <Button style={button} href={`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard`}>
                Başvurularımı Görüntüle
              </Button>
            </Section>

            <Text style={paragraph}>
              Bu arada diğer iş fırsatlarına da göz atabilir ve kariyer yolculuğunuza devam edebilirsiniz.
            </Text>

            <Hr style={divider} />

            <Text style={footer}>
              Başarılar dileriz,<br />
              Yeme İçme İşi Ekibi
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

const statusPending = {
  fontSize: '15px',
  fontWeight: '500',
  color: '#d97706',
  margin: '0',
};

const infoSection = {
  backgroundColor: '#eff6ff',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const infoTitle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#111827',
  margin: '0 0 12px 0',
};

const infoText = {
  fontSize: '15px',
  color: '#4b5563',
  margin: '6px 0',
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
