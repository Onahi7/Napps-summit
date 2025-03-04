import { Resend } from 'resend';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Send registration confirmation email
export async function sendRegistrationConfirmation(
  email: string,
  fullName: string,
  eventTitle: string,
  registrationDate: string
) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'North Central Education Summit <noreply@nces.example.com>',
      to: email,
      subject: 'Registration Confirmation - North Central Education Summit',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Registration Confirmation</h2>
          <p>Dear ${fullName},</p>
          <p>Thank you for registering for the ${eventTitle}. Your registration has been received.</p>
          <p><strong>Registration Date:</strong> ${new Date(registrationDate).toLocaleDateString()}</p>
          <p>Please complete your payment to confirm your participation.</p>
          <p>If you have any questions, please contact our support team.</p>
          <p>Best regards,<br>North Central Education Summit Team</p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending registration confirmation email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending registration confirmation email:', error);
    return { success: false, error };
  }
}

// Send payment confirmation email
export async function sendPaymentConfirmation(
  email: string,
  fullName: string,
  eventTitle: string,
  amount: number,
  currency: string,
  paymentReference: string,
  paymentDate: string
) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'North Central Education Summit <noreply@nces.example.com>',
      to: email,
      subject: 'Payment Confirmation - North Central Education Summit',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Payment Confirmation</h2>
          <p>Dear ${fullName},</p>
          <p>Thank you for your payment for the ${eventTitle}.</p>
          <p><strong>Amount:</strong> ${currency} ${amount.toFixed(2)}</p>
          <p><strong>Payment Reference:</strong> ${paymentReference}</p>
          <p><strong>Payment Date:</strong> ${new Date(paymentDate).toLocaleDateString()}</p>
          <p>Your registration is now confirmed. We look forward to seeing you at the event.</p>
          <p>Best regards,<br>North Central Education Summit Team</p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending payment confirmation email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending payment confirmation email:', error);
    return { success: false, error };
  }
}

// Send event reminder email
export async function sendEventReminder(
  email: string,
  fullName: string,
  eventTitle: string,
  eventDate: string,
  eventLocation: string
) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'North Central Education Summit <noreply@nces.example.com>',
      to: email,
      subject: 'Event Reminder - North Central Education Summit',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Event Reminder</h2>
          <p>Dear ${fullName},</p>
          <p>This is a reminder that the ${eventTitle} is approaching.</p>
          <p><strong>Date:</strong> ${new Date(eventDate).toLocaleDateString()}</p>
          <p><strong>Location:</strong> ${eventLocation}</p>
          <p>We look forward to seeing you at the event.</p>
          <p>Best regards,<br>North Central Education Summit Team</p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending event reminder email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending event reminder email:', error);
    return { success: false, error };
  }
}
