'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  CalendarIcon,
  TicketIcon,
  DocumentTextIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/context/AuthContext';

export default function ParticipantDashboard() {
  const { user } = useAuth();
  const [stats] = useState({
    totalEvents: 12,
    attendedEvents: 5,
    resourcesAvailable: 8,
    certificatesEarned: 2,
  });

  const upcomingEvents = [
    {
      id: 1,
      name: 'Opening Ceremony',
      date: 'March 15, 2024',
      time: '9:00 AM',
      location: 'Main Hall',
    },
    {
      id: 2,
      name: 'Keynote Speech',
      date: 'March 15, 2024',
      time: '10:30 AM',
      location: 'Auditorium',
    },
    {
      id: 3,
      name: 'Workshop: Leadership',
      date: 'March 15, 2024',
      time: '2:00 PM',
      location: 'Room 101',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome back, {user?.user_metadata?.full_name || 'Participant'}
        </p>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Events</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalEvents}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TicketIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Events Attended</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.attendedEvents}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Available Resources</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.resourcesAvailable}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Certificates Earned</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.certificatesEarned}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* QR Code */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Your Event QR Code</h2>
          <div className="flex justify-center bg-white p-4 rounded-lg border border-gray-200">
            <QRCodeSVG value={user?.id || 'default-qr'} size={200} />
          </div>
          <p className="mt-2 text-sm text-gray-500 text-center">
            Show this QR code at the event for check-in and meal validation
          </p>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Upcoming Events</h2>
          <div className="flow-root">
            <ul role="list" className="-mb-8">
              {upcomingEvents.map((event, eventIdx) => (
                <li key={event.id}>
                  <div className="relative pb-8">
                    {eventIdx !== upcomingEvents.length - 1 ? (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center ring-8 ring-white">
                          <ClockIcon className="h-5 w-5 text-indigo-600" />
                        </span>
                      </div>
                      <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{event.name}</p>
                          <p className="text-sm text-gray-500">{event.location}</p>
                        </div>
                        <div className="whitespace-nowrap text-right text-sm text-gray-500">
                          <div>{event.date}</div>
                          <div>{event.time}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
