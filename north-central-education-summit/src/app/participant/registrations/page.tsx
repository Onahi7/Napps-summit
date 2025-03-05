'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentDuplicateIcon,
  QrCodeIcon,
} from '@heroicons/react/24/outline';
import { supabase } from '@/app/supabaseClient';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Registration {
  id: string;
  event_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  payment_status: 'pending' | 'paid' | 'failed';
  payment_reference?: string;
  amount: number;
  event: {
    title: string;
    start_date: string;
    end_date: string;
    location: string;
    type: string;
  };
}

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  async function fetchRegistrations() {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select(`
          *,
          event:events (
            title,
            start_date,
            end_date,
            location,
            type
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      toast.error('Failed to load registrations');
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelRegistration(registrationId: string) {
    try {
      const { error } = await supabase
        .from('registrations')
        .update({ status: 'cancelled' })
        .eq('id', registrationId);

      if (error) throw error;
      toast.success('Registration cancelled successfully');
      await fetchRegistrations();
    } catch (error) {
      console.error('Error cancelling registration:', error);
      toast.error('Failed to cancel registration');
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircleIcon className="h-4 w-4 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircleIcon className="h-4 w-4 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <ClockIcon className="h-4 w-4 mr-1" />
            Pending
          </Badge>
        );
    }
  }

  function getPaymentStatusBadge(status: string) {
    switch (status) {
      case 'paid':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircleIcon className="h-4 w-4 mr-1" />
            Paid
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircleIcon className="h-4 w-4 mr-1" />
            Failed
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <ClockIcon className="h-4 w-4 mr-1" />
            Pending
          </Badge>
        );
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
        <h1 className="text-2xl font-semibold text-gray-900">My Registrations</h1>
        <p className="mt-1 text-sm text-gray-600">
          View and manage your event registrations
        </p>
      </div>

      <div className="space-y-6">
        {registrations.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <DocumentDuplicateIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No registrations</h3>
                <p className="mt-1 text-sm text-gray-500">
                  You haven't registered for any events yet.
                </p>
                <div className="mt-6">
                  <Button asChild>
                    <a href="/participant/schedule">Browse Events</a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          registrations.map((registration) => (
            <Card key={registration.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{registration.event.title}</CardTitle>
                    <CardDescription>
                      {format(new Date(registration.event.start_date), 'PPP')} -{' '}
                      {format(new Date(registration.event.end_date), 'PPP')}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    {getStatusBadge(registration.status)}
                    {getPaymentStatusBadge(registration.payment_status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Location</p>
                    <p className="mt-1 text-sm text-gray-900">{registration.event.location}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Registration Date</p>
                    <p className="mt-1 text-sm text-gray-900">
                      {format(new Date(registration.created_at), 'PPP')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Amount</p>
                    <p className="mt-1 text-sm text-gray-900">
                      ₦{registration.amount.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end space-x-4">
                  {registration.status === 'approved' && (
                    <Button variant="outline" className="flex items-center">
                      <QrCodeIcon className="h-4 w-4 mr-2" />
                      View QR Code
                    </Button>
                  )}
                  {registration.status === 'pending' && (
                    <Button
                      variant="destructive"
                      onClick={() => handleCancelRegistration(registration.id)}
                    >
                      Cancel Registration
                    </Button>
                  )}
                  {registration.payment_status === 'pending' && (
                    <Button>
                      Complete Payment
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
