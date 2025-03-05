'use client';

import { ParticipantNav } from '@/components/participant/ParticipantNav';
import { useAuth } from '@/context/AuthContext';

export default function ParticipantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden md:flex md:w-64 md:flex-col">
          <div className="flex flex-col flex-grow border-r border-gray-200 pt-5 bg-white overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <img
                className="h-8 w-auto"
                src="/logo.png"
                alt="Summit Logo"
              />
              <span className="ml-2 text-xl font-semibold text-gray-900">
                Summit Portal
              </span>
            </div>
            <div className="mt-8 flex-grow flex flex-col">
              <ParticipantNav />
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <div className="flex items-center">
                <div>
                  <img
                    className="inline-block h-9 w-9 rounded-full"
                    src={user?.user_metadata?.avatar_url || '/default-avatar.png'}
                    alt="Profile"
                  />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">
                    {user?.user_metadata?.full_name || user?.email}
                  </p>
                  <p className="text-xs font-medium text-gray-500">Participant</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
