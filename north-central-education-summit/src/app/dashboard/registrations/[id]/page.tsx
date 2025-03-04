'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/app/supabaseClient';
import { Button } from '@/components/ui/button';

type Registration = {
  id: string;
  status: string;
  created_at: string;
  user_id: string;
  event_id: string;
  events: {
    id: string;
    title: string;
    start_date: string;
    end_date: string;
    location: string;
    description: string;
    price: number;
    organizer: string;
    image_url?: string;
  }[];
  payments: {
    id: string;
    amount: number;
    status: string;
    payment_reference: string;
    created_at: string;
  }[];
  profiles: {
    id: string;
    full_name: string;
    email: string;
    phone_number?: string;
    organization?: string;
  }[];
};

export default function RegistrationDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRegistrationDetails = async () => {
      if (!user || !id) return;

      try {
        const { data, error } = await supabase
          .from('registrations')
          .select(`
            id,
            status,
            created_at,
            user_id,
            event_id,
            events (
              id,
              title,
              start_date,
              end_date,
              location,
              description,
              price,
              organizer,
              image_url
            ),
            payments (
              id,
              amount,
              status,
              payment_reference,
              created_at
            ),
            profiles (
              id,
              full_name,
              email,
              phone_number,
              organization
            )
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        
        // Verify that this registration belongs to the current user
        if (data && data.user_id !== user.id) {
          router.push('/dashboard/registrations');
          return;
        }
        
        setRegistration(data);
      } catch (err: any) {
        console.error('Error fetching registration details:', err);
        setError(err.message || 'Failed to load registration details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRegistrationDetails();
  }, [user, id, router]);

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

  const handleCancelRegistration = async () => {
    if (!registration || !confirm('Are you sure you want to cancel this registration?')) {
      return;
    }

    try {
      setIsLoading(true);
      
      // Only allow cancellation if payment hasn't been made or if it's still pending
      const canCancel = !registration.payments.length || 
                        registration.payments.every(p => p.status !== 'success');
      
      if (!canCancel) {
        alert('Cannot cancel a registration with successful payment. Please contact support.');
        setIsLoading(false);
        return;
      }
      
      const { error } = await supabase
        .from('registrations')
        .update({ status: 'cancelled' })
        .eq('id', registration.id);
      
      if (error) throw error;
      
      // Refresh the page to show updated status
      window.location.reload();
    } catch (err: any) {
      console.error('Error cancelling registration:', err);
      alert(err.message || 'Failed to cancel registration');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !registration) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 my-4">
        <p className="font-medium">Error loading registration details</p>
        <p className="text-sm">{error || 'Registration not found'}</p>
        <Link href="/dashboard/registrations">
          <Button 
            className="mt-2 bg-red-100 text-red-800 hover:bg-red-200"
            variant="outline"
            size="sm"
          >
            Back to Registrations
          </Button>
        </Link>
      </div>
    );
  }

  const hasSuccessfulPayment = registration.payments.some(p => p.status === 'success');

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Registration Details</h1>
          <p className="text-gray-600">
            View details for your event registration
          </p>
        </div>
        <Link href="/dashboard/registrations">
          <Button variant="outline">Back to Registrations</Button>
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-medium text-gray-900">{registration.events[0].title}</h2>
            <p className="text-sm text-gray-500">Registration ID: {registration.id}</p>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            registration.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
            registration.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
            registration.status === 'cancelled' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
          </span>
        </div>
        
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-base font-medium text-gray-900 mb-3">Event Information</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                {registration.events[0].image_url && (
                  <div className="mb-4">
                    <img 
                      src={registration.events[0].image_url} 
                      alt={registration.events[0].title}
                      className="w-full h-48 object-cover rounded-md"
                    />
                  </div>
                )}
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Start Date:</span> {formatDate(registration.events[0].start_date)}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">End Date:</span> {formatDate(registration.events[0].end_date)}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Location:</span> {registration.events[0].location}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Organizer:</span> {registration.events[0].organizer}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Price:</span> {formatCurrency(registration.events[0].price)}
                </p>
                <div className="pt-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Description:</h4>
                  <p className="text-sm text-gray-600">{registration.events[0].description}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-base font-medium text-gray-900 mb-3">Registration Details</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Registration Date:</span> {formatDate(registration.created_at)}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Attendee:</span> {registration.profiles[0].full_name}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Email:</span> {registration.profiles[0].email}
                </p>
                {registration.profiles[0].phone_number && (
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Phone:</span> {registration.profiles[0].phone_number}
                  </p>
                )}
                {registration.profiles[0].organization && (
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Organization:</span> {registration.profiles[0].organization}
                  </p>
                )}
              </div>
              
              <h3 className="text-base font-medium text-gray-900 mt-6 mb-3">Payment Information</h3>
              {registration.payments && registration.payments.length > 0 ? (
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  {registration.payments.map((payment) => (
                    <div key={payment.id} className="border-b border-gray-200 pb-3 last:border-0 last:pb-0">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Amount:</span> {formatCurrency(payment.amount)}
                      </p>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Status:</span> 
                        <span className={`ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          payment.status === 'success' ? 'bg-green-100 text-green-800' : 
                          payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {payment.status}
                        </span>
                      </p>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Reference:</span> {payment.payment_reference}
                      </p>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Date:</span> {formatDate(payment.created_at)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <p className="text-sm text-yellow-800 mb-3">
                    No payment has been made for this registration. Please complete your payment to confirm your registration.
                  </p>
                  <Link href={`/dashboard/registrations/${registration.id}/payment`}>
                    <Button size="sm">
                      Make Payment
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 flex justify-between items-center">
          <div>
            {!hasSuccessfulPayment && registration.status !== 'cancelled' && (
              <Button 
                variant="outline" 
                className="text-red-600 border-red-300 hover:bg-red-50"
                onClick={handleCancelRegistration}
                disabled={isLoading}
              >
                Cancel Registration
              </Button>
            )}
          </div>
          
          <div className="space-x-3">
            {hasSuccessfulPayment && (
              <Link href={`/dashboard/registrations/${registration.id}/ticket`}>
                <Button>
                  View Ticket
                </Button>
              </Link>
            )}
            
            {!hasSuccessfulPayment && registration.status !== 'cancelled' && (
              <Link href={`/dashboard/registrations/${registration.id}/payment`}>
                <Button>
                  {registration.payments.length > 0 ? 'Retry Payment' : 'Make Payment'}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
