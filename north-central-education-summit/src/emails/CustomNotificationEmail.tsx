import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface CustomNotificationEmailProps {
  name: string;
  title: string;
  message: string;
  ctaText?: string;
  ctaUrl?: string;
}

export const CustomNotificationEmail = ({
  name,
  title,
  message,
  ctaText,
  ctaUrl,
}: CustomNotificationEmailProps) => {
  const previewText = title;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logo}>
            <Img
              src={`${process.env.NEXT_PUBLIC_APP_URL}/logo.png`}
              width="150"
              height="50"
              alt="North Central Education Summit"
            />
          </Section>
          
          <Section style={content}>
            <Heading style={h1}>{title}</Heading>
            <Text style={text}>Dear {name},</Text>

            <Section style={messageBox}>
              <Text style={messageText}>
                {message}
              </Text>
            </Section>

            {ctaText && ctaUrl && (
              <Section style={buttonContainer}>
                <Link href={ctaUrl} style={button}>
                  {ctaText}
                </Link>
              </Section>
            )}

            <Text style={text}>
              If you have any questions, please don't hesitate to contact our support team.
            </Text>

            <Text style={footer}>
              Best regards,<br />
              The North Central Education Summit Team
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default CustomNotificationEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const logo = {
  margin: '0 auto',
  marginBottom: '30px',
  textAlign: 'center' as const,
};

const content = {
  padding: '0 48px',
};

const h1 = {
  color: '#1f2937',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '1.3',
  margin: '0 0 24px',
  textAlign: 'center' as const,
};

const text = {
  color: '#4b5563',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 20px',
};

const messageBox = {
  margin: '32px 0',
  padding: '24px',
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
};

const messageText = {
  ...text,
  margin: '0',
  whiteSpace: 'pre-wrap' as const,
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  padding: '12px 24px',
  display: 'inline-block',
};

const footer = {
  ...text,
  color: '#6b7280',
  fontSize: '14px',
};
