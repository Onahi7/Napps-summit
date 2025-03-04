'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { supabase } from '@/app/supabaseClient';
import { emailService } from '@/lib/emailService';
import { exportData } from '@/lib/exportUtils';

interface BulkActionsProps {
  selectedIds: string[];
  type: 'registrations' | 'payments' | 'users' | 'meals';
  onSuccess?: () => void;
}

export function BulkActions({ selectedIds, type, onSuccess }: BulkActionsProps) {
  const [loading, setLoading] = useState(false);

  const handleBulkAction = async (action: string) => {
    if (selectedIds.length === 0) {
      toast.error('Please select items to perform bulk action');
      return;
    }

    setLoading(true);
    try {
      switch (action) {
        case 'approve_registrations':
          await handleBulkApproveRegistrations();
          break;
        case 'verify_payments':
          await handleBulkVerifyPayments();
          break;
        case 'send_reminders':
          await handleBulkSendReminders();
          break;
        case 'export_data':
          await handleBulkExport();
          break;
        case 'delete':
          await handleBulkDelete();
          break;
      }
      
      onSuccess?.();
      toast.success('Bulk action completed successfully');
    } catch (error: any) {
      console.error('Bulk action failed:', error);
      toast.error(error.message || 'Failed to perform bulk action');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkApproveRegistrations = async () => {
    const { error } = await supabase
      .from('registrations')
      .update({ 
        status: 'confirmed',
        updated_at: new Date().toISOString(),
      })
      .in('id', selectedIds);

    if (error) throw error;

    // Send confirmation emails
    const { data: registrations } = await supabase
      .from('registrations')
      .select(`
        *,
        profiles (
          full_name,
          email
        ),
        events (
          title,
          start_date,
          location
        )
      `)
      .in('id', selectedIds);

    await Promise.all(
      registrations?.map(reg => 
        emailService.sendRegistrationConfirmation({
          name: reg.profiles.full_name,
          email: reg.profiles.email,
          eventTitle: reg.events.title,
          eventDate: reg.events.start_date,
          location: reg.events.location,
          registrationId: reg.registration_id,
        })
      ) || []
    );
  };

  const handleBulkVerifyPayments = async () => {
    const { error } = await supabase
      .from('payments')
      .update({ 
        status: 'success',
        verified_at: new Date().toISOString(),
      })
      .in('id', selectedIds);

    if (error) throw error;

    // Send confirmation emails
    const { data: payments } = await supabase
      .from('payments')
      .select(`
        *,
        profiles (
          full_name,
          email
        )
      `)
      .in('id', selectedIds);

    await Promise.all(
      payments?.map(payment => 
        emailService.sendPaymentConfirmation({
          name: payment.profiles.full_name,
          email: payment.profiles.email,
          amount: payment.amount,
          transactionId: payment.transaction_id,
          paymentDate: payment.created_at,
        })
      ) || []
    );
  };

  const handleBulkSendReminders = async () => {
    const { data, error } = await supabase
      .from(type)
      .select(`
        *,
        profiles (
          full_name,
          email
        ),
        events (
          title,
          start_date,
          location
        )
      `)
      .in('id', selectedIds);

    if (error) throw error;

    await Promise.all(
      data?.map(item => 
        emailService.sendEventReminder({
          name: item.profiles.full_name,
          email: item.profiles.email,
          eventTitle: item.events.title,
          eventDate: item.events.start_date,
          location: item.events.location,
          registrationId: item.registration_id,
        })
      ) || []
    );
  };

  const handleBulkExport = async () => {
    const { data, error } = await supabase
      .from(type)
      .select('*')
      .in('id', selectedIds);

    if (error) throw error;

    await exportData(data, {
      fileName: `${type}-export-${new Date().toISOString().split('T')[0]}`,
      format: 'xlsx',
    });
  };

  const handleBulkDelete = async () => {
    const { error } = await supabase
      .from(type)
      .delete()
      .in('id', selectedIds);

    if (error) throw error;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={loading || selectedIds.length === 0}>
          Bulk Actions ({selectedIds.length})
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Choose Action</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {type === 'registrations' && (
          <DropdownMenuItem onClick={() => handleBulkAction('approve_registrations')}>
            Approve Registrations
          </DropdownMenuItem>
        )}
        
        {type === 'payments' && (
          <DropdownMenuItem onClick={() => handleBulkAction('verify_payments')}>
            Verify Payments
          </DropdownMenuItem>
        )}
        
        {['registrations', 'meals'].includes(type) && (
          <DropdownMenuItem onClick={() => handleBulkAction('send_reminders')}>
            Send Reminders
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem onClick={() => handleBulkAction('export_data')}>
          Export Selected
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => handleBulkAction('delete')}
          className="text-red-600"
        >
          Delete Selected
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
