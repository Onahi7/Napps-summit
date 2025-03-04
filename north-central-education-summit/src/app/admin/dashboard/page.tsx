'use client';

import { useState } from 'react';
import {
  ChartPieIcon,
  UsersIcon,
  CurrencyDollarIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function AdminDashboard() {
  const [dateRange, setDateRange] = useState('week');

  const stats = [
    { name: 'Total Registrations', value: '2,500', icon: UsersIcon, change: '+12%', changeType: 'positive' },
    { name: 'Total Revenue', value: '₦12.5M', icon: CurrencyDollarIcon, change: '+8%', changeType: 'positive' },
    { name: 'Events', value: '15', icon: CalendarIcon, change: '+2', changeType: 'positive' },
    { name: 'Meal Validations', value: '1,850', icon: ChartPieIcon, change: '+15%', changeType: 'positive' },
  ];

  const registrationData = {
    labels: ['Completed', 'Pending', 'Cancelled'],
    datasets: [
      {
        data: [65, 25, 10],
        backgroundColor: ['#4F46E5', '#FCD34D', '#EF4444'],
        borderWidth: 0,
      },
    ],
  };

  const paymentData = {
    labels: ['Paid', 'Pending', 'Failed'],
    datasets: [
      {
        data: [75, 20, 5],
        backgroundColor: ['#10B981', '#FCD34D', '#EF4444'],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Overview of event registrations and statistics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="mt-2 text-3xl font-semibold text-gray-900">{stat.value}</p>
                </div>
                <div className="bg-indigo-50 rounded-full p-3">
                  <stat.icon className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className={`text-sm ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-gray-600"> vs last {dateRange}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Registration Status</h2>
            <div className="h-64">
              <Doughnut data={registrationData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Status</h2>
            <div className="h-64">
              <Doughnut data={paymentData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <div className="mt-6 flow-root">
              <ul role="list" className="-my-5 divide-y divide-gray-200">
                <li className="py-5">
                  <div className="relative focus-within:ring-2 focus-within:ring-indigo-500">
                    <h3 className="text-sm font-semibold text-gray-800">
                      New registration completed
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                      John Doe completed registration for Main Conference
                    </p>
                  </div>
                </li>
                <li className="py-5">
                  <div className="relative focus-within:ring-2 focus-within:ring-indigo-500">
                    <h3 className="text-sm font-semibold text-gray-800">
                      Payment received
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                      Payment of ₦50,000 received for Workshop Series
                    </p>
                  </div>
                </li>
                <li className="py-5">
                  <div className="relative focus-within:ring-2 focus-within:ring-indigo-500">
                    <h3 className="text-sm font-semibold text-gray-800">
                      New event created
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                      Leadership Seminar added to upcoming events
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
