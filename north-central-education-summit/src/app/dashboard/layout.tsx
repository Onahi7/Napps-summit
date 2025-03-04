'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: 'HomeIcon' },
    { name: 'Profile', href: '/dashboard/profile', icon: 'UserIcon' },
    { name: 'My Registrations', href: '/dashboard/registrations', icon: 'TicketIcon' },
    { name: 'Resources', href: '/dashboard/resources', icon: 'DocumentIcon' },
    { name: 'Schedule', href: '/dashboard/schedule', icon: 'CalendarIcon' },
    // Added test routes
    { name: 'Admin Dashboard', href: '/admin/dashboard', icon: 'CogIcon' },
    { name: 'Validator Dashboard', href: '/validator/dashboard', icon: 'CheckIcon' },
    { name: 'Superadmin Dashboard', href: '/superadmin/dashboard', icon: 'ShieldIcon' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/dashboard" className="text-xl font-bold text-indigo-600">
                  Test Dashboard
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      pathname === item.href
                        ? 'border-indigo-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
