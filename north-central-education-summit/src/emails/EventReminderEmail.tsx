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

interface EventReminderEmailProps {
  name: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  daysUntilEvent: number;
  mapUrl: string;
  qrCodeUrl: string;
}

export const EventReminderEmail = ({
  name,
  eventTitle,
  eventDate,
  eventTime,
  eventLocation,
  daysUntilEvent,
  mapUrl,
  qrCodeUrl,
}: EventReminderEmailProps) => {
  const previewText = `Reminder: ${eventTitle} is in ${daysUntilEvent} days!`;

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
            <Heading style={h1}>Event Reminder</Heading>
            <Text style={text}>Dear {name},</Text>
            <Text style={text}>
              This is a friendly reminder that {eventTitle} is coming up in {daysUntilEvent} days!
              We're looking forward to seeing you there.
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
                  <strong>Time:</strong> {eventTime}
                </Text>
                <Text style={infoText}>
                  <strong>Location:</strong> {eventLocation}
                </Text>
              </Section>
            </Section>

            <Section style={qrSection}>
              <Heading style={h2}>Your QR Code</Heading>
              <Text style={text}>
                Please have this QR code ready for quick check-in:
              </Text>
              <Img
                src={qrCodeUrl}
                width="200"
                height="200"
                alt="Check-in QR Code"
                style={qrCode}
              />
            </Section>

            <Section style={buttonContainer}>
              <Link href={mapUrl} style={button}>
                View Location on Map
              </Link>
            </Section>

            <Section style={reminderBox}>
              <Text style={reminderText}>
                🎯 <strong>Don't forget:</strong>
              </Text>
              <Text style={reminderItem}>✓ Bring a valid ID for verification</Text>
              <Text style={reminderItem}>✓ Arrive 30 minutes early for registration</Text>
              <Text style={reminderItem}>✓ Have your QR code ready for check-in</Text>
              <Text style={reminderItem}>✓ Bring any required materials or documents</Text>
            </Section>

            <Text style={text}>
              If you have any questions or need to make changes to your registration,
              please contact our support team.
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

export default EventReminderEmail;

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
  margin: '32px 0',
};

const box = {
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  padding: '24px',
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

const reminderBox = {
  margin: '32px 0',
  padding: '24px',
  backgroundColor: '#fff7ed',
  borderRadius: '8px',
  border: '1px solid #fed7aa',
};

const reminderText = {
  ...text,
  color: '#9a3412',
  margin: '0 0 16px',
};

const reminderItem = {
  ...text,
  color: '#9a3412',
  margin: '0 0 8px',
  paddingLeft: '8px',
};

const footer = {
  ...text,
  color: '#6b7280',
  fontSize: '14px',
};
