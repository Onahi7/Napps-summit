import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';
import { supabase } from '@/app/supabaseClient';

// Helper function to verify Paystack webhook
function verifyPaystackWebhook(payload: string, signature: string, secret: string): boolean {
  const hash = crypto
    .createHmac('sha512', secret)
    .update(payload)
    .digest('hex');
  return hash === signature;
}

// Helper function to verify Flutterwave webhook
function verifyFlutterwaveWebhook(payload: string, signature: string, secret: string): boolean {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return hash === signature;
}

export async function POST(request: Request) {
  try {
    const headersList = headers();
    const provider = headersList.get('x-payment-provider');
    
    if (!provider) {
      return NextResponse.json(
        { error: 'Payment provider not specified' },
        { status: 400 }
      );
    }

    // Get the webhook payload
    const payload = await request.text();
    const event = JSON.parse(payload);

    // Get the active configuration for the provider
    const { data: config, error: configError } = await supabase
      .from('payment_configurations')
      .select('*')
      .eq('provider', provider.toLowerCase())
      .eq('is_active', true)
      .single();

    if (configError || !config) {
      return NextResponse.json(
        { error: 'Invalid payment provider configuration' },
        { status: 400 }
      );
    }

    // Verify webhook signature based on provider
    let isValid = false;
    const signature = headersList.get(
      provider.toLowerCase() === 'paystack'
        ? 'x-paystack-signature'
        : 'verif-hash'
    );

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    if (provider.toLowerCase() === 'paystack') {
      isValid = verifyPaystackWebhook(payload, signature, config.webhook_secret);
    } else if (provider.toLowerCase() === 'flutterwave') {
      isValid = verifyFlutterwaveWebhook(payload, signature, config.webhook_secret);
    }

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Process the webhook event based on provider
    if (provider.toLowerCase() === 'paystack') {
      await handlePaystackWebhook(event);
    } else if (provider.toLowerCase() === 'flutterwave') {
      await handleFlutterwaveWebhook(event);
    }

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handlePaystackWebhook(event: any) {
  const { data } = event;

  // Find the transaction
  const { data: transaction, error: transError } = await supabase
    .from('payment_transactions')
    .select('*')
    .eq('reference', data.reference)
    .single();

  if (transError || !transaction) {
    throw new Error('Transaction not found');
  }

  switch (event.event) {
    case 'charge.success':
      // Update transaction status
      await supabase
        .from('payment_transactions')
        .update({
          status: 'completed',
          provider_reference: data.id,
          metadata: {
            ...transaction.metadata,
            provider_data: data,
            completed_at: new Date().toISOString()
          }
        })
        .eq('id', transaction.id);

      // Update registration status
      await supabase
        .from('registrations')
        .update({
          payment_status: 'paid',
          payment_reference: data.reference,
          status: 'approved'
        })
        .eq('id', transaction.registration_id);
      break;

    case 'charge.failed':
      await supabase
        .from('payment_transactions')
        .update({
          status: 'failed',
          metadata: {
            ...transaction.metadata,
            provider_data: data,
            failed_at: new Date().toISOString(),
            failure_reason: data.gateway_response
          }
        })
        .eq('id', transaction.id);
      break;

    case 'refund.processed':
      // Find the refund
      const { data: refund } = await supabase
        .from('payment_refunds')
        .select('*')
        .eq('transaction_id', transaction.id)
        .single();

      if (refund) {
        await supabase
          .from('payment_refunds')
          .update({
            status: 'completed',
            provider_reference: data.id,
            processed_at: new Date().toISOString()
          })
          .eq('id', refund.id);
      }
      break;
  }
}

async function handleFlutterwaveWebhook(event: any) {
  const { data } = event;

  // Find the transaction
  const { data: transaction, error: transError } = await supabase
    .from('payment_transactions')
    .select('*')
    .eq('reference', data.tx_ref)
    .single();

  if (transError || !transaction) {
    throw new Error('Transaction not found');
  }

  switch (event.event) {
    case 'charge.completed':
      if (data.status === 'successful') {
        // Update transaction status
        await supabase
          .from('payment_transactions')
          .update({
            status: 'completed',
            provider_reference: data.id,
            metadata: {
              ...transaction.metadata,
              provider_data: data,
              completed_at: new Date().toISOString()
            }
          })
          .eq('id', transaction.id);

        // Update registration status
        await supabase
          .from('registrations')
          .update({
            payment_status: 'paid',
            payment_reference: data.tx_ref,
            status: 'approved'
          })
          .eq('id', transaction.registration_id);
      } else {
        await supabase
          .from('payment_transactions')
          .update({
            status: 'failed',
            metadata: {
              ...transaction.metadata,
              provider_data: data,
              failed_at: new Date().toISOString(),
              failure_reason: data.processor_response
            }
          })
          .eq('id', transaction.id);
      }
      break;

    case 'refund.completed':
      // Find the refund
      const { data: refund } = await supabase
        .from('payment_refunds')
        .select('*')
        .eq('transaction_id', transaction.id)
        .single();

      if (refund) {
        await supabase
          .from('payment_refunds')
          .update({
            status: 'completed',
            provider_reference: data.id,
            processed_at: new Date().toISOString()
          })
          .eq('id', refund.id);
      }
      break;
  }
}
