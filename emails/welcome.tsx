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

interface WelcomeEmailProps {
  name: string;
}

export default function WelcomeEmail({ name }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>Yeme İçme İşleri'ne Hoş Geldiniz!</Heading>
          </Section>

          <Section style={content}>
            <Text style={greeting}>Merhaba {name},</Text>

            <Text style={paragraph}>
              Yeme İçme İşleri'ne katıldığınız için teşekkür ederiz. Türkiye'nin önde gelen restoran ve kafe sektörü iş platformuna hoş geldiniz.
            </Text>

            <Text style={paragraph}>
              Platformumuzda binlerce iş fırsatı arasından size en uygun pozisyonları bulabilir, kolayca başvurabilir ve kariyer yolculuğunuzu başlatabilirsiniz.
            </Text>

            <Section style={stepsSection}>
              <Text style={stepsTitle}>Başlamak için:</Text>
              <Text style={step}>1. Profilinizi tamamlayın</Text>
              <Text style={step}>2. İş ilanlarına göz atın</Text>
              <Text style={step}>3. Size uygun pozisyonlara başvurun</Text>
            </Section>

            <Section style={buttonContainer}>
              <Button style={button} href={`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/giris`}>
                Giriş Yap
              </Button>
            </Section>

            <Text style={paragraph}>
              Herhangi bir sorunuz varsa bizimle iletişime geçmekten çekinmeyin.
            </Text>

            <Hr style={divider} />

            <Text style={footer}>
              İyi günler dileriz,<br />
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

const step = {
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
