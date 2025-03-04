'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !profile) {
      if (pathname !== '/superadmin/login') {
        router.push('/superadmin/login');
      }
      setIsLoading(false);
      return;
    }

    if (profile.role !== 'superadmin') {
      router.push('/superadmin/login');
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
  }, [user, profile, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user || !profile || profile.role !== 'superadmin') {
    return children;
  }

  const navigation = [
    { name: 'Dashboard', href: '/superadmin/dashboard', icon: 'HomeIcon' },
    { name: 'System Settings', href: '/superadmin/settings', icon: 'CogIcon' },
    { name: 'User Management', href: '/superadmin/users', icon: 'UsersIcon' },
    { name: 'Audit Logs', href: '/superadmin/audit-logs', icon: 'ClipboardListIcon' },
    { name: 'Database', href: '/superadmin/database', icon: 'DatabaseIcon' },
    { name: 'Backups', href: '/superadmin/backups', icon: 'ServerIcon' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/superadmin/dashboard" className="text-xl font-bold text-purple-600">
                  Superadmin Panel
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      pathname === item.href
                        ? 'border-purple-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-4">{profile.full_name}</span>
              <button
                onClick={() => {
                  router.push('/superadmin/login');
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Sign out
              </button>
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
