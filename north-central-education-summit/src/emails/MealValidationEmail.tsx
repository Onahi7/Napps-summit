import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface MealValidationEmailProps {
  name: string;
  mealType: string;
  validationTime: string;
  location: string;
  validator: string;
}

export const MealValidationEmail = ({
  name,
  mealType,
  validationTime,
  location,
  validator,
}: MealValidationEmailProps) => {
  const previewText = `Meal Validation Confirmation - ${mealType}`;

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
            <Heading style={h1}>Meal Validation Confirmed</Heading>
            <Text style={text}>Dear {name},</Text>
            <Text style={text}>
              This email confirms that your meal has been successfully validated.
            </Text>

            <Section style={boxInfos}>
              <Section style={box}>
                <Heading style={h2}>Validation Details</Heading>
                <Text style={infoText}>
                  <strong>Meal Type:</strong> {mealType}
                </Text>
                <Text style={infoText}>
                  <strong>Time:</strong> {validationTime}
                </Text>
                <Text style={infoText}>
                  <strong>Location:</strong> {location}
                </Text>
                <Text style={infoText}>
                  <strong>Validated By:</strong> {validator}
                </Text>
              </Section>
            </Section>

            <Section style={mealTips}>
              <Heading style={h2}>Meal Service Tips</Heading>
              <Text style={tipItem}>
                🕒 Please arrive within your designated meal time slot
              </Text>
              <Text style={tipItem}>
                🎫 Always have your QR code ready for quick validation
              </Text>
              <Text style={tipItem}>
                🍽️ Follow the queue guidelines for smooth service
              </Text>
              <Text style={tipItem}>
                ♻️ Help us reduce waste by only taking what you can eat
              </Text>
            </Section>

            <Text style={text}>
              If you have any questions or concerns about the meal service,
              please contact our support team or speak with any of our validators.
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

export default MealValidationEmail;

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

const mealTips = {
  margin: '32px 0',
  padding: '24px',
  backgroundColor: '#ecfdf5',
  borderRadius: '8px',
  border: '1px solid #6ee7b7',
};

const tipItem = {
  ...text,
  color: '#065f46',
  margin: '0 0 12px',
  paddingLeft: '8px',
};

const footer = {
  ...text,
  color: '#6b7280',
  fontSize: '14px',
};
