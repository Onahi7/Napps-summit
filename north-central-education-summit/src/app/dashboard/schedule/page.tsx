'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/app/supabaseClient';
import { Button } from '@/components/ui/button';

type ScheduleItem = {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
  speaker: string;
  event_id: string;
  day: number;
  events: {
    title: string;
    start_date: string;
    end_date: string;
  };
};

export default function SchedulePage() {
  const { user } = useAuth();
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [events, setEvents] = useState<{ id: string; title: string }[]>([]);
  const [days, setDays] = useState<number[]>([]);

  useEffect(() => {
    const fetchSchedule = async () => {
      if (!user) return;

      try {
        // First get the events the user is registered for
        const { data: registrations, error: regError } = await supabase
          .from('registrations')
          .select('event_id')
          .eq('user_id', user.id);

        if (regError) throw regError;

        // Get all events for filtering purposes
        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select('id, title');

        if (eventsError) throw eventsError;
        setEvents(eventsData || []);

        // If the user has no registrations, get all schedule items
        let query = supabase
          .from('schedules')
          .select(`
            id,
            title,
            description,
            start_time,
            end_time,
            location,
            speaker,
            event_id,
            day,
            events (
              title,
              start_date,
              end_date
            )
          `)
          .order('day', { ascending: true })
          .order('start_time', { ascending: true });

        // If there are registrations, filter by those events
        if (registrations && registrations.length > 0) {
          const eventIds = registrations.map(reg => reg.event_id);
          query = query.in('event_id', eventIds);
        }

        const { data, error } = await query;

        if (error) throw error;
        setScheduleItems(data || []);

        // Extract unique days for filtering
        if (data && data.length > 0) {
          const uniqueDays = Array.from(new Set(data.map(item => item.day))).sort();
          setDays(uniqueDays);
          setSelectedDay(uniqueDays[0]);
        }
      } catch (err: any) {
        console.error('Error fetching schedule:', err);
        setError(err.message || 'Failed to load schedule');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedule();
  }, [user]);

  const formatTime = (timeString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    };
    return new Date(timeString).toLocaleTimeString('en-US', options);
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Filter schedule items based on selected day and event
  const filteredSchedule = scheduleItems.filter(item => {
    const matchesDay = selectedDay === null || item.day === selectedDay;
    const matchesEvent = selectedEvent === null || selectedEvent === 'all' || item.event_id === selectedEvent;
    return matchesDay && matchesEvent;
  });

  // Group schedule items by time slot for better display
  const groupedSchedule: { [key: string]: ScheduleItem[] } = {};
  filteredSchedule.forEach(item => {
    const timeKey = `${formatTime(item.start_time)} - ${formatTime(item.end_time)}`;
    if (!groupedSchedule[timeKey]) {
      groupedSchedule[timeKey] = [];
    }
    groupedSchedule[timeKey].push(item);
  });

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
        <p className="font-medium">Error loading schedule</p>
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
        <h1 className="text-2xl font-bold text-gray-900">Event Schedule</h1>
        <p className="text-gray-600">
          View the schedule for your registered events
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="day" className="block text-sm font-medium text-gray-700 mb-1">
              Day
            </label>
            <div className="flex flex-wrap gap-2">
              {days.map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                    selectedDay === day
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Day {day}
                </button>
              ))}
            </div>
          </div>
          <div className="md:w-1/3">
            <label htmlFor="event" className="block text-sm font-medium text-gray-700 mb-1">
              Event
            </label>
            <select
              id="event"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
              value={selectedEvent || 'all'}
              onChange={(e) => setSelectedEvent(e.target.value === 'all' ? null : e.target.value)}
            >
              <option value="all">All Events</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {scheduleItems.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No schedule available</h3>
          <p className="mt-1 text-sm text-gray-500">
            The schedule for your events will appear here once it's available.
          </p>
        </div>
      ) : filteredSchedule.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <h3 className="text-sm font-medium text-gray-900">No schedule items match your filters</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try selecting a different day or event.
          </p>
          <Button 
            onClick={() => {
              setSelectedDay(days[0]);
              setSelectedEvent(null);
            }} 
            className="mt-4"
            variant="outline"
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-indigo-50 border-b border-indigo-100">
            <h2 className="text-lg font-medium text-indigo-800">
              {selectedDay !== null ? `Day ${selectedDay} Schedule` : 'Full Schedule'}
            </h2>
            {selectedDay !== null && scheduleItems.length > 0 && (
              <p className="text-sm text-indigo-600">
                {formatDate(scheduleItems.find(item => item.day === selectedDay)?.events.start_date || '')}
              </p>
            )}
          </div>
          
          <div className="divide-y divide-gray-200">
            {Object.keys(groupedSchedule).map((timeSlot) => (
              <div key={timeSlot} className="p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">{timeSlot}</h3>
                <div className="grid gap-6 md:grid-cols-2">
                  {groupedSchedule[timeSlot].map((item) => (
                    <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-base font-medium text-gray-900">{item.title}</h4>
                          <p className="text-sm text-indigo-600 mt-1">{item.events.title}</p>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          Day {item.day}
                        </span>
                      </div>
                      
                      {item.speaker && (
                        <p className="text-sm text-gray-700 mt-2">
                          <span className="font-medium">Speaker:</span> {item.speaker}
                        </p>
                      )}
                      
                      {item.location && (
                        <p className="text-sm text-gray-700 mt-1">
                          <span className="font-medium">Location:</span> {item.location}
                        </p>
                      )}
                      
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-3">{item.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
