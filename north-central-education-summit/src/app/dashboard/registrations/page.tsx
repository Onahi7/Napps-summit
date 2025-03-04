'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/app/supabaseClient';
import { Button } from '@/components/ui/button';

interface SupabaseRegistration {
  id: string;
  status: string;
  created_at: string;
  events: {
    id: string;
    title: string;
    start_date: string;
    end_date: string;
    location: string;
    description: string;
  }[];
  payments: {
    id: string;
    amount: number;
    status: string;
    payment_reference: string;
    created_at: string;
  }[];
}

type Registration = {
  id: string;
  status: string;
  created_at: string;
  events: {
    id: string;
    title: string;
    start_date: string;
    end_date: string;
    location: string;
    description: string;
  };
  payments: {
    id: string;
    amount: number;
    status: string;
    payment_reference: string;
    created_at: string;
  }[];
};

export default function RegistrationsPage() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRegistrations = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('registrations')
          .select(`
            id,
            status,
            created_at,
            events (
              id,
              title,
              start_date,
              end_date,
              location,
              description
            ),
            payments (
              id,
              amount,
              status,
              payment_reference,
              created_at
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        // Transform the Supabase response to match our Registration type
        const transformedData = (data || []).map((reg: SupabaseRegistration) => ({
          ...reg,
          events: reg.events[0] || {
            id: '',
            title: 'Unknown Event',
            start_date: '',
            end_date: '',
            location: '',
            description: ''
          }
        }));
        
        setRegistrations(transformedData);
      } catch (err: any) {
        console.error('Error fetching registrations:', err);
        setError(err.message || 'Failed to load registrations');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRegistrations();
  }, [user]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 my-4">
        <p className="font-medium">Error loading registrations</p>
        <p className="text-sm">{error}</p>
        <Button 
          onClick={() => window.location.reload()} 
          className="mt-2 bg-red-100 text-red-800 hover:bg-red-200"
          variant="outline"
          size="sm"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Your Registrations</h1>
        <p className="text-gray-600">
          View and manage your event registrations
        </p>
      </div>

      {registrations.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <h2 className="text-xl font-medium text-gray-900 mb-2">No Registrations Found</h2>
          <p className="text-gray-500 mb-6">You haven't registered for any events yet.</p>
          <Link href="/events">
            <Button>Browse Available Events</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {registrations.map((registration) => (
            <div key={registration.id} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">{registration.events.title}</h2>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    registration.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                    registration.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {registration.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Registered on {formatDate(registration.created_at)}
                </p>
              </div>
              
              <div className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Event Details</h3>
                    <div className="mt-2 space-y-2">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">Date:</span> {formatDate(registration.events.start_date)}
                      </p>
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">Location:</span> {registration.events.location}
                      </p>
                      <p className="text-sm text-gray-900 line-clamp-2">
                        <span className="font-medium">Description:</span> {registration.events.description}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Payment Information</h3>
                    <div className="mt-2 space-y-2">
                      {registration.payments && registration.payments.length > 0 ? (
                        <>
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">Amount:</span> {formatCurrency(registration.payments[0].amount)}
                          </p>
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">Status:</span> 
                            <span className={`ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              registration.payments[0].status === 'success' ? 'bg-green-100 text-green-800' : 
                              registration.payments[0].status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'
                            }`}>
                              {registration.payments[0].status}
                            </span>
                          </p>
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">Reference:</span> {registration.payments[0].payment_reference}
                          </p>
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">Date:</span> {formatDate(registration.payments[0].created_at)}
                          </p>
                        </>
                      ) : (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                          <p className="text-sm text-yellow-800">
                            No payment information found. Please complete your payment to confirm your registration.
                          </p>
                          <Link href={`/dashboard/registrations/${registration.id}/payment`}>
                            <Button size="sm" className="mt-2">
                              Make Payment
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-3 bg-gray-50 text-right">
                <Link href={`/dashboard/registrations/${registration.id}`}>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </Link>
                {registration.payments && registration.payments.length > 0 && 
                 registration.payments[0].status === 'success' && (
                  <Link href={`/dashboard/registrations/${registration.id}/ticket`} className="ml-3">
                    <Button size="sm">
                      View Ticket
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
