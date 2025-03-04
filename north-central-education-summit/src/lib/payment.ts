'use client';

import { supabase } from '@/app/supabaseClient';

// Initialize payment with Paystack
export async function initializePayment(
  email: string,
  amount: number,
  registrationId: string,
  eventTitle: string,
  callbackUrl: string
) {
  try {
    // Generate a unique reference
    const reference = `NCES-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
    
    // Create payment record in database
    const { data: paymentData, error: paymentError } = await supabase
      .from('payments')
      .insert({
        registration_id: registrationId,
        amount,
        payment_reference: reference,
        payment_status: 'pending',
      })
      .select()
      .single();
    
    if (paymentError) {
      console.error('Error creating payment record:', paymentError);
      return { success: false, error: 'Failed to create payment record' };
    }
    
    // Return the payment information for client-side processing
    return {
      success: true,
      paymentData: {
        reference,
        email,
        amount: amount * 100, // Paystack amount is in kobo (100 kobo = 1 Naira)
        metadata: {
          registration_id: registrationId,
          event_title: eventTitle,
        },
        callback_url: callbackUrl,
      },
    };
  } catch (error) {
    console.error('Error initializing payment:', error);
    return { success: false, error: 'Failed to initialize payment' };
  }
}

// Verify payment status
export async function verifyPayment(reference: string) {
  try {
    // This would typically be a server-side function
    // For client-side, we'll check our database for the payment status
    const { data: payment, error } = await supabase
      .from('payments')
      .select('*, registrations(*)')
      .eq('payment_reference', reference)
      .single();
    
    if (error || !payment) {
      console.error('Error fetching payment:', error);
      return { success: false, error: 'Payment not found' };
    }
    
    return { success: true, payment };
  } catch (error) {
    console.error('Error verifying payment:', error);
    return { success: false, error: 'Failed to verify payment' };
  }
}

// Generate receipt for payment
export async function generateReceipt(paymentId: string) {
  try {
    // Fetch payment details with related information
    const { data: payment, error } = await supabase
      .from('payments')
      .select(`
        *,
        registrations(
          *,
          profiles(full_name, email, organization),
          events(title, start_date, location)
        )
      `)
      .eq('id', paymentId)
      .single();
    
    if (error || !payment) {
      console.error('Error fetching payment for receipt:', error);
      return { success: false, error: 'Payment not found' };
    }
    
    // Format receipt data
    const receiptData = {
      receiptNumber: `NCES-RCPT-${payment.id.substring(0, 8)}`,
      paymentReference: payment.payment_reference,
      paymentDate: new Date(payment.payment_date || payment.updated_at).toLocaleDateString(),
      amount: `${payment.currency} ${payment.amount.toFixed(2)}`,
      paymentStatus: payment.payment_status,
      participant: {
        name: payment.registrations.profiles.full_name,
        email: payment.registrations.profiles.email,
        organization: payment.registrations.profiles.organization,
      },
      event: {
        title: payment.registrations.events.title,
        date: new Date(payment.registrations.events.start_date).toLocaleDateString(),
        location: payment.registrations.events.location,
      },
    };
    
    return { success: true, receiptData };
  } catch (error) {
    console.error('Error generating receipt:', error);
    return { success: false, error: 'Failed to generate receipt' };
  }
}
