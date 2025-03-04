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

interface RegistrationConfirmationEmailProps {
  name: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  registrationId: string;
  qrCodeUrl: string;
  dashboardUrl: string;
}

export const RegistrationConfirmationEmail = ({
  name,
  eventTitle,
  eventDate,
  eventLocation,
  registrationId,
  qrCodeUrl,
  dashboardUrl,
}: RegistrationConfirmationEmailProps) => {
  const previewText = `Your registration for ${eventTitle} has been confirmed!`;

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
            <Heading style={h1}>Registration Confirmed!</Heading>
            <Text style={text}>Dear {name},</Text>
            <Text style={text}>
              Thank you for registering for the {eventTitle}. Your registration has been
              confirmed and we're excited to have you join us!
            </Text>

            <Section style={boxInfos}>
              <Section style={box}>
                <Heading style={h2}>Event Details</Heading>
                <Text style={infoText}>
                  <strong>Event:</strong> {eventTitle}
                </Text>
                <Text style={infoText}>
                  <strong>Date:</strong> {eventDate}
                </Text>
                <Text style={infoText}>
                  <strong>Location:</strong> {eventLocation}
                </Text>
                <Text style={infoText}>
                  <strong>Registration ID:</strong> {registrationId}
                </Text>
              </Section>
            </Section>

            <Section style={qrSection}>
              <Heading style={h2}>Your QR Code</Heading>
              <Text style={text}>
                Please present this QR code at the event for check-in:
              </Text>
              <Img
                src={qrCodeUrl}
                width="200"
                height="200"
                alt="Registration QR Code"
                style={qrCode}
              />
            </Section>

            <Section style={buttonContainer}>
              <Link href={dashboardUrl} style={button}>
                View Registration Details
              </Link>
            </Section>

            <Text style={text}>
              If you have any questions or need to make changes to your registration,
              please don't hesitate to contact our support team.
            </Text>

            <Text style={text}>
              We look forward to seeing you at the event!
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

export default RegistrationConfirmationEmail;

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

const h2 = {
  color: '#1f2937',
  fontSize: '20px',
  fontWeight: '600',
  lineHeight: '1.3',
  margin: '0 0 16px',
};

const text = {
  color: '#4b5563',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 20px',
};

const boxInfos = {
  margin: '0 0 32px',
};

const box = {
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  padding: '24px',
  marginBottom: '24px',
};

const infoText = {
  ...text,
  margin: '0 0 12px',
};

const qrSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const qrCode = {
  margin: '16px 0',
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
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
