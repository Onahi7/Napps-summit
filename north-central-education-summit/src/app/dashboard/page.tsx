'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/app/supabaseClient';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [registrationData, setRegistrationData] = useState<any>(null);
  const [mealValidations, setMealValidations] = useState<any[]>([]);
  const [activeMealSession, setActiveMealSession] = useState<any>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        // Fetch user's registrations
        const { data: registrationsData, error: registrationsError } = await supabase
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
              location
            ),
            payments (
              id,
              amount,
              status,
              payment_reference
            )
          `)
          .eq('user_id', user.id);

        if (registrationsError) throw registrationsError;
        setRegistrations(registrationsData || []);

        // Fetch upcoming events (next 3)
        const today = new Date().toISOString();
        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select('*')
          .gt('start_date', today)
          .order('start_date', { ascending: true })
          .limit(3);

        if (eventsError) throw eventsError;
        setUpcomingEvents(eventsData || []);

        // Fetch registration data
        const { data, error } = await supabase
          .from('registrations')
          .select(`
            *,
            events (
              title,
              start_date,
              end_date
            )
          `)
          .eq('user_id', user?.id)
          .single();

        if (!error && data) {
          setRegistrationData(data);
        }

        // Fetch meal validations
        const todayDate = new Date().toISOString().split('T')[0];
        const { data: mealValidationsData, error: mealValidationsError } = await supabase
          .from('meal_validations')
          .select(`
            *,
            meal_sessions (
              type,
              date
            )
          `)
          .eq('registration_id', data?.id)
          .eq('meal_sessions.date', todayDate);

        if (!mealValidationsError && mealValidationsData) {
          setMealValidations(mealValidationsData);
        }

        // Check active meal session
        const now = new Date();
        const { data: activeMealSessionData, error: activeMealSessionError } = await supabase
          .from('meal_sessions')
          .select('*')
          .eq('date', now.toISOString().split('T')[0])
          .lte('start_time', now.toISOString())
          .gte('end_time', now.toISOString())
          .single();

        if (!activeMealSessionError && activeMealSessionData) {
          setActiveMealSession(activeMealSessionData);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
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

  const getMealStatus = (type: 'breakfast' | 'dinner') => {
    const validation = mealValidations.find(v => v.meal_sessions.type === type);
    if (validation) {
      return 'Validated';
    }
    if (activeMealSession?.type === type) {
      return 'Available Now';
    }
    return 'Not Yet Available';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome, {profile?.full_name || user?.email}</h1>
        <p className="text-gray-600">
          Manage your North Central Education Summit registrations, view resources, and more.
        </p>
      </div>

      {/* Registration Status */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Your Registrations</h2>
          
          {registrations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">You haven't registered for any events yet.</p>
              <Link href="/events">
                <Button>Browse Events</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registration Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {registrations.map((registration) => (
                    <tr key={registration.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {registration.events?.title || 'Unknown Event'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {registration.events?.start_date ? formatDate(registration.events.start_date) : 'TBD'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          registration.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                          registration.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {registration.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {registration.payments && registration.payments.length > 0 ? (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            registration.payments[0].status === 'success' ? 'bg-green-100 text-green-800' : 
                            registration.payments[0].status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {registration.payments[0].status}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Not Paid
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Link href={`/dashboard/registrations/${registration.id}`}>
                          <Button variant="outline" size="sm">View Details</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Upcoming Events</h2>
          
          {upcomingEvents.length === 0 ? (
            <p className="text-gray-500">No upcoming events at the moment.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="border rounded-lg overflow-hidden flex flex-col">
                  <div className="p-4 flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">{event.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">{formatDate(event.start_date)}</p>
                    <p className="text-sm text-gray-500 mb-4">{event.location}</p>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">{event.description}</p>
                  </div>
                  <div className="px-4 py-3 bg-gray-50 text-right">
                    <Link href={`/events/${event.id}`}>
                      <Button variant="outline" size="sm">View Details</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Meal Validation */}
      {registrationData && (
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Today's Meals</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Breakfast</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    getMealStatus('breakfast') === 'Validated'
                      ? 'bg-green-100 text-green-800'
                      : getMealStatus('breakfast') === 'Available Now'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {getMealStatus('breakfast')}
                  </span>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Dinner</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    getMealStatus('dinner') === 'Validated'
                      ? 'bg-green-100 text-green-800'
                      : getMealStatus('dinner') === 'Available Now'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {getMealStatus('dinner')}
                  </span>
                </div>
              </div>

              {activeMealSession && (
                <p className="text-sm text-gray-600">
                  {activeMealSession.type === 'breakfast' ? 'Breakfast' : 'Dinner'} is currently being served. 
                  Please visit the meal station for validation.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Links</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/dashboard/profile">
              <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <h3 className="font-medium text-gray-900 mb-1">Update Profile</h3>
                <p className="text-sm text-gray-500">Manage your personal information</p>
              </div>
            </Link>
            <Link href="/dashboard/resources">
              <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <h3 className="font-medium text-gray-900 mb-1">Resources</h3>
                <p className="text-sm text-gray-500">Access summit materials and documents</p>
              </div>
            </Link>
            <Link href="/dashboard/schedule">
              <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <h3 className="font-medium text-gray-900 mb-1">Schedule</h3>
                <p className="text-sm text-gray-500">View the summit schedule</p>
              </div>
            </Link>
            <Link href="/events">
              <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <h3 className="font-medium text-gray-900 mb-1">Browse Events</h3>
                <p className="text-sm text-gray-500">Discover and register for events</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
