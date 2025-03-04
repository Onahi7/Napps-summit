import { createTransport } from 'nodemailer';
import { render } from '@react-email/render';
import { format } from 'date-fns';

// Email templates
import WelcomeEmail from '@/emails/WelcomeEmail';
import RegistrationConfirmationEmail from '@/emails/RegistrationConfirmationEmail';
import PaymentConfirmationEmail from '@/emails/PaymentConfirmationEmail';
import EventReminderEmail from '@/emails/EventReminderEmail';
import MealValidationEmail from '@/emails/MealValidationEmail';
import CustomNotificationEmail from '@/emails/CustomNotificationEmail';

const transporter = createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EmailData {
  to: string;
  subject: string;
  html: string;
  attachments?: any[];
}

export const sendEmail = async (data: EmailData) => {
  try {
    await transporter.sendMail({
      from: `"North Central Education Summit" <${process.env.SMTP_FROM}>`,
      ...data,
    });
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};

export const sendWelcomeEmail = async (user: any) => {
  const html = render(
    WelcomeEmail({
      name: user.full_name,
      loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
    })
  );

  return sendEmail({
    to: user.email,
    subject: 'Welcome to North Central Education Summit',
    html,
  });
};

export const sendRegistrationConfirmation = async (registration: any) => {
  const html = render(
    RegistrationConfirmationEmail({
      name: registration.profiles.full_name,
      eventTitle: registration.events.title,
      eventDate: format(new Date(registration.events.start_date), 'MMMM do, yyyy'),
      eventLocation: registration.events.location,
      registrationId: registration.id,
      qrCodeUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/qr/${registration.id}`,
      dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    })
  );

  return sendEmail({
    to: registration.profiles.email,
    subject: 'Registration Confirmation - North Central Education Summit',
    html,
  });
};

export const sendPaymentConfirmation = async (payment: any) => {
  const html = render(
    PaymentConfirmationEmail({
      name: payment.profiles.full_name,
      amount: payment.amount,
      reference: payment.payment_reference,
      date: format(new Date(payment.payment_date), 'MMMM do, yyyy HH:mm'),
      eventTitle: payment.events.title,
      receiptUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/receipts/${payment.id}`,
    })
  );

  return sendEmail({
    to: payment.profiles.email,
    subject: 'Payment Confirmation - North Central Education Summit',
    html,
  });
};

export const sendEventReminder = async (registration: any, daysUntilEvent: number) => {
  const html = render(
    EventReminderEmail({
      name: registration.profiles.full_name,
      eventTitle: registration.events.title,
      eventDate: format(new Date(registration.events.start_date), 'MMMM do, yyyy'),
      eventTime: format(new Date(registration.events.start_date), 'HH:mm'),
      eventLocation: registration.events.location,
      daysUntilEvent,
      mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(registration.events.location)}`,
      qrCodeUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/qr/${registration.id}`,
    })
  );

  return sendEmail({
    to: registration.profiles.email,
    subject: `Event Reminder: ${registration.events.title} - ${daysUntilEvent} days to go!`,
    html,
  });
};

export const sendMealValidation = async (validation: any) => {
  const html = render(
    MealValidationEmail({
      name: validation.profiles.full_name,
      mealType: validation.meal_sessions.type,
      validationTime: format(new Date(validation.validation_time), 'HH:mm'),
      location: validation.location,
      validator: validation.validator.full_name,
    })
  );

  return sendEmail({
    to: validation.profiles.email,
    subject: `Meal Validation Confirmation - ${validation.meal_sessions.type}`,
    html,
  });
};

export const sendCustomNotification = async (user: any, notification: any) => {
  const html = render(
    CustomNotificationEmail({
      name: user.full_name,
      title: notification.title,
      message: notification.message,
      ctaText: notification.ctaText,
      ctaUrl: notification.ctaUrl,
    })
  );

  return sendEmail({
    to: user.email,
    subject: notification.title,
    html,
  });
};

export const sendBulkEmails = async (users: any[], template: string, data: any) => {
  const promises = users.map(user => {
    switch (template) {
      case 'welcome':
        return sendWelcomeEmail(user);
      case 'event-reminder':
        return sendEventReminder(user, data.daysUntilEvent);
      case 'custom':
        return sendCustomNotification(user, data);
      default:
        throw new Error('Invalid email template');
    }
  });

  return Promise.allSettled(promises);
};
