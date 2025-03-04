'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  CalendarIcon,
  TicketIcon,
  DocumentTextIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

export default function ParticipantDashboard() {
  const mockUser = {
    name: 'John Doe',
    email: 'john@example.com',
    registrationNumber: 'REG2024001',
    registrationType: 'Full Conference',
    paymentStatus: 'Paid',
    qrCode: 'valid-qr-code-data',
  };

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
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {mockUser.name}!</h1>
          <p className="mt-2 text-gray-600">Your personal dashboard for the North Central Education Summit</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Registration Info */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Registration Information</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <TicketIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Registration Number</p>
                  <p className="text-base text-gray-900">{mockUser.registrationNumber}</p>
                </div>
              </div>
              <div className="flex items-center">
                <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Registration Type</p>
                  <p className="text-base text-gray-900">{mockUser.registrationType}</p>
                </div>
              </div>
              <div className="flex items-center">
                <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Payment Status</p>
                  <p className="text-base font-medium text-green-600">{mockUser.paymentStatus}</p>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Your Event QR Code</h3>
              <div className="flex justify-center bg-white p-4 rounded-lg border border-gray-200">
                <QRCodeSVG value={mockUser.qrCode} size={200} />
              </div>
              <p className="mt-2 text-sm text-gray-500 text-center">
                Show this QR code at the event for check-in and meal validation
              </p>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Upcoming Events</h2>
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

        {/* Additional Information */}
        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Important Information</h2>
          <div className="prose prose-sm max-w-none text-gray-500">
            <ul>
              <li>Please arrive 30 minutes before your scheduled events</li>
              <li>Carry your QR code for seamless check-in and meal validation</li>
              <li>Workshop materials will be provided at the venue</li>
              <li>For any queries, contact the help desk at the main entrance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
