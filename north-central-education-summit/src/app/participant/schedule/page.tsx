'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/app/supabaseClient';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Event {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
  type: string;
  capacity: number;
  registered_count: number;
}

export default function SchedulePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState('day1');

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_time', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(eventId: string) {
    try {
      const { error } = await supabase
        .from('event_registrations')
        .insert([{ event_id: eventId }]);

      if (error) throw error;
      await fetchEvents(); // Refresh events to update counts
    } catch (error) {
      console.error('Error registering for event:', error);
    }
  }

  const days = [
    { id: 'day1', label: 'Day 1 - March 15' },
    { id: 'day2', label: 'Day 2 - March 16' },
    { id: 'day3', label: 'Day 3 - March 17' },
  ];

  function getEventsByDay(dayId: string) {
    // In a real app, filter based on actual dates
    return events.filter(event => {
      const eventDate = new Date(event.start_time);
      const day = eventDate.getDate();
      return (dayId === 'day1' && day === 15) ||
             (dayId === 'day2' && day === 16) ||
             (dayId === 'day3' && day === 17);
    });
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
        <h1 className="text-2xl font-semibold text-gray-900">Event Schedule</h1>
        <p className="mt-1 text-sm text-gray-600">
          View and register for summit events
        </p>
      </div>

      <Tabs defaultValue="day1" className="w-full">
        <TabsList className="mb-8">
          {days.map((day) => (
            <TabsTrigger
              key={day.id}
              value={day.id}
              onClick={() => setSelectedDay(day.id)}
            >
              {day.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {days.map((day) => (
          <TabsContent key={day.id} value={day.id}>
            <div className="grid gap-6">
              {getEventsByDay(day.id).map((event) => (
                <Card key={event.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{event.title}</CardTitle>
                        <CardDescription>{event.description}</CardDescription>
                      </div>
                      <Button
                        onClick={() => handleRegister(event.id)}
                        disabled={event.registered_count >= event.capacity}
                      >
                        {event.registered_count >= event.capacity
                          ? 'Full'
                          : 'Register'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <ClockIcon className="h-4 w-4 mr-2" />
                        {format(new Date(event.start_time), 'h:mm a')} -{' '}
                        {format(new Date(event.end_time), 'h:mm a')}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPinIcon className="h-4 w-4 mr-2" />
                        {event.location}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {event.type} • {event.registered_count}/{event.capacity} registered
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
