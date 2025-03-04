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

interface PaymentConfirmationEmailProps {
  name: string;
  amount: number;
  reference: string;
  date: string;
  eventTitle: string;
  receiptUrl: string;
}

export const PaymentConfirmationEmail = ({
  name,
  amount,
  reference,
  date,
  eventTitle,
  receiptUrl,
}: PaymentConfirmationEmailProps) => {
  const previewText = `Payment Confirmation - ${eventTitle}`;

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
            <Heading style={h1}>Payment Confirmed!</Heading>
            <Text style={text}>Dear {name},</Text>
            <Text style={text}>
              Thank you for your payment for the {eventTitle}. Your transaction has been
              successfully processed.
            </Text>

            <Section style={boxInfos}>
              <Section style={box}>
                <Heading style={h2}>Payment Details</Heading>
                <Text style={infoText}>
                  <strong>Amount:</strong> ₦{amount.toLocaleString()}
                </Text>
                <Text style={infoText}>
                  <strong>Reference:</strong> {reference}
                </Text>
                <Text style={infoText}>
                  <strong>Date:</strong> {date}
                </Text>
                <Text style={infoText}>
                  <strong>Event:</strong> {eventTitle}
                </Text>
              </Section>
            </Section>

            <Section style={buttonContainer}>
              <Link href={receiptUrl} style={button}>
                Download Receipt
              </Link>
            </Section>

            <Text style={text}>
              Please keep this confirmation for your records. If you have any questions
              about your payment, please contact our support team.
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

export default PaymentConfirmationEmail;

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
