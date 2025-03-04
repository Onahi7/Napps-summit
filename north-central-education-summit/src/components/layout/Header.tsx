'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

type UserRole = 'superadmin' | 'admin' | 'validation_team' | 'participant';

interface Profile {
  id: string;
  role?: UserRole;
  email: string;
  full_name?: string;
}

export default function Header() {
  const { user, profile, signOut } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Events', href: '/events' },
    { name: 'Contact', href: '/contact' },
  ];

  const userNavigation = user
    ? [
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Profile', href: '/dashboard/profile' },
        { name: 'My Registrations', href: '/dashboard/registrations' },
      ]
    : [
        { name: 'Sign In', href: '/auth/login' },
        { name: 'Register', href: '/auth/register' },
      ];

  // Add superadmin link if user is superadmin
  if (profile?.role === 'superadmin') {
    userNavigation.unshift({ name: 'Super Admin', href: '/dashboard/superadmin' });
  }

  // Add admin link if user is admin or superadmin
  if (profile?.role === 'admin' || profile?.role === 'superadmin') {
    userNavigation.unshift({ name: 'Admin Dashboard', href: '/dashboard/admin' });
  }

  // Add validation link if user is validation team, admin, or superadmin
  if (profile?.role === 'validation_team' || profile?.role === 'admin' || profile?.role === 'superadmin') {
    userNavigation.unshift({ name: 'Validator Dashboard', href: '/dashboard/validator' });
  }

  return (
    <header className="bg-white shadow-sm">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-indigo-600">NCES</span>
            </Link>
            <div className="hidden ml-10 space-x-8 md:flex">
              {navigation.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-base font-medium ${
                    pathname === link.href
                      ? 'text-indigo-600'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0 space-x-4">
            {userNavigation.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-base font-medium ${
                  pathname === link.href
                    ? 'text-indigo-600'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {link.name}
              </Link>
            ))}
            {user && (
              <Button
                variant="outline"
                onClick={() => signOut()}
                className="ml-4"
              >
                Sign Out
              </Button>
            )}
          </div>
          <div className="flex md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              aria-expanded="false"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="block h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navigation.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    pathname === link.href
                      ? 'text-white bg-indigo-600'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="px-2 space-y-1">
                {userNavigation.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      pathname === link.href
                        ? 'text-white bg-indigo-600'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
                {user && (
                  <button
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  >
                    Sign Out
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
