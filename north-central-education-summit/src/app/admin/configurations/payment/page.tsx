'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/app/supabaseClient';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';

const paymentConfigSchema = z.object({
  provider: z.string(),
  is_active: z.boolean(),
  test_mode: z.boolean(),
  public_key: z.string().min(1, 'Public key is required'),
  secret_key: z.string().min(1, 'Secret key is required'),
  webhook_secret: z.string().optional(),
});

type PaymentConfig = z.infer<typeof paymentConfigSchema>;

export default function PaymentConfigPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const form = useForm<PaymentConfig>({
    resolver: zodResolver(paymentConfigSchema),
    defaultValues: {
      provider: 'paystack',
      is_active: false,
      test_mode: true,
      public_key: '',
      secret_key: '',
      webhook_secret: '',
    },
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  async function fetchConfig() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('payment_configurations')
        .select('*')
        .eq('provider', 'paystack')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        form.reset(data);
      }
    } catch (error) {
      console.error('Error fetching payment config:', error);
      toast.error('Failed to load payment configuration');
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(values: PaymentConfig) {
    try {
      setSaving(true);

      // If activating this provider, deactivate others first
      if (values.is_active) {
        const { error: updateError } = await supabase
          .from('payment_configurations')
          .update({ is_active: false })
          .neq('provider', values.provider);

        if (updateError) throw updateError;
      }

      // Update or insert the configuration
      const { error } = await supabase
        .from('payment_configurations')
        .upsert({
          provider: values.provider,
          is_active: values.is_active,
          test_mode: values.test_mode,
          public_key: values.public_key,
          secret_key: values.secret_key,
          webhook_secret: values.webhook_secret,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      toast.success('Payment configuration saved successfully');
    } catch (error) {
      console.error('Error saving payment config:', error);
      toast.error('Failed to save payment configuration');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Payment Configuration</h1>
        <p className="mt-1 text-sm text-gray-600">
          Configure payment provider settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Paystack Configuration</CardTitle>
          <CardDescription>
            Configure your Paystack integration settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active</FormLabel>
                        <FormDescription>
                          Enable Paystack payments
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="test_mode"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Test Mode</FormLabel>
                        <FormDescription>
                          Use test environment
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="public_key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Public Key</FormLabel>
                      <FormControl>
                        <Input {...field} type="text" />
                      </FormControl>
                      <FormDescription>
                        Your Paystack public key
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="secret_key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Secret Key</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" />
                      </FormControl>
                      <FormDescription>
                        Your Paystack secret key
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="webhook_secret"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Webhook Secret</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" />
                      </FormControl>
                      <FormDescription>
                        Optional: Your Paystack webhook secret for verifying webhook events
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Configuration'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
