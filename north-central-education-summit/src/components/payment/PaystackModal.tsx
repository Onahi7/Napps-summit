'use client';

import { useState, useEffect } from 'react';
import { usePaystackPayment } from 'react-paystack';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/app/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface PaystackModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  registrationId: string;
  eventTitle: string;
}

interface PaystackConfig {
  publicKey: string;
  email: string;
  amount: number;
  reference: string;
  onSuccess: (reference: any) => void;
  onClose: () => void;
}

export default function PaystackModal({
  isOpen,
  onClose,
  amount,
  registrationId,
  eventTitle,
}: PaystackModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<PaystackConfig | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const initializePayment = usePaystackPayment(config || {});

  useEffect(() => {
    if (isOpen) {
      initializePaymentConfig();
    }
  }, [isOpen]);

  async function initializePaymentConfig() {
    try {
      setLoading(true);
      
      // Get active Paystack configuration
      const { data: configData, error: configError } = await supabase
        .from('payment_configurations')
        .select('public_key')
        .eq('provider', 'paystack')
        .eq('is_active', true)
        .single();

      if (configError) throw configError;
      if (!configData) throw new Error('No active Paystack configuration found');

      // Create payment transaction record
      const reference = `PAY-${Math.random().toString(36).substring(2, 15)}`;
      const { data: transData, error: transError } = await supabase
        .from('payment_transactions')
        .insert({
          user_id: user?.id,
          registration_id: registrationId,
          reference,
          amount,
          provider: 'paystack',
          status: 'pending',
          metadata: {
            event_title: eventTitle
          }
        })
        .select()
        .single();

      if (transError) throw transError;
      setTransactionId(transData.id);

      // Configure Paystack
      setConfig({
        publicKey: configData.public_key,
        email: user?.email || '',
        amount: amount * 100, // Convert to kobo
        reference,
        onSuccess: handlePaymentSuccess,
        onClose: handlePaymentClose
      });

      setLoading(false);
    } catch (error) {
      console.error('Error initializing payment:', error);
      toast.error('Failed to initialize payment');
      onClose();
    }
  }

  async function handlePaymentSuccess(reference: any) {
    try {
      if (!transactionId) return;

      // Update transaction status
      const { error: updateError } = await supabase
        .from('payment_transactions')
        .update({
          status: 'completed',
          provider_reference: reference.reference,
          metadata: {
            ...reference,
            completed_at: new Date().toISOString()
          }
        })
        .eq('id', transactionId);

      if (updateError) throw updateError;

      // Update registration status
      const { error: regError } = await supabase
        .from('registrations')
        .update({
          payment_status: 'paid',
          payment_reference: reference.reference,
          status: 'approved'
        })
        .eq('id', registrationId);

      if (regError) throw regError;

      toast.success('Payment completed successfully');
      onClose();
    } catch (error) {
      console.error('Error processing payment success:', error);
      toast.error('Error updating payment status');
    }
  }

  async function handlePaymentClose() {
    try {
      if (!transactionId) return;

      // Update transaction status to abandoned
      await supabase
        .from('payment_transactions')
        .update({
          status: 'abandoned',
          metadata: {
            abandoned_at: new Date().toISOString()
          }
        })
        .eq('id', transactionId);

      onClose();
    } catch (error) {
      console.error('Error handling payment close:', error);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
        </DialogHeader>
        <div className="py-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Event</p>
              <p className="mt-1 text-sm text-gray-900">{eventTitle}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Amount</p>
              <p className="mt-1 text-sm text-gray-900">₦{amount.toLocaleString()}</p>
            </div>
          </div>
          <div className="mt-6">
            <Button
              onClick={() => initializePayment()}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Loading...' : 'Pay Now'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
