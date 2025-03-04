import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/supabaseClient';
import crypto from 'crypto';

// This is a webhook handler for Paystack payment notifications
export async function POST(req: NextRequest) {
  try {
    // Get the signature from the headers
    const paystackSignature = req.headers.get('x-paystack-signature');
    
    if (!paystackSignature) {
      return NextResponse.json({ error: 'No signature provided' }, { status: 401 });
    }
    
    // Get the raw request body as text
    const rawBody = await req.text();
    
    // Verify the signature using your Paystack secret key
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      return NextResponse.json({ error: 'Paystack secret key not configured' }, { status: 500 });
    }
    
    const hash = crypto
      .createHmac('sha512', secret)
      .update(rawBody)
      .digest('hex');
    
    if (hash !== paystackSignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
    
    // Parse the webhook payload
    const payload = JSON.parse(rawBody);
    
    // Handle different event types
    const { event, data } = payload;
    
    if (event === 'charge.success') {
      // Extract payment reference and metadata
      const { reference, status, amount, metadata } = data;
      const { registration_id } = metadata;
      
      if (!registration_id) {
        return NextResponse.json({ error: 'Missing registration ID in metadata' }, { status: 400 });
      }
      
      // Update payment status in database
      const { error: paymentError } = await supabase
        .from('payments')
        .update({
          payment_status: status,
          payment_date: new Date().toISOString(),
        })
        .eq('payment_reference', reference);
      
      if (paymentError) {
        console.error('Error updating payment:', paymentError);
        return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 });
      }
      
      // Update registration status
      const { error: registrationError } = await supabase
        .from('registrations')
        .update({
          status: 'confirmed',
        })
        .eq('id', registration_id);
      
      if (registrationError) {
        console.error('Error updating registration:', registrationError);
        return NextResponse.json({ error: 'Failed to update registration' }, { status: 500 });
      }
      
      // Send confirmation email (implement with Resend)
      // This will be implemented in a separate function
      
      return NextResponse.json({ success: true });
    }
    
    // Return a 200 response for other events
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
