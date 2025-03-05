'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  HomeIcon,
  CalendarIcon,
  DocumentTextIcon,
  UserCircleIcon,
  TicketIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/participant/dashboard', icon: HomeIcon },
  { name: 'Schedule', href: '/participant/schedule', icon: CalendarIcon },
  { name: 'Resources', href: '/participant/resources', icon: DocumentTextIcon },
  { name: 'Profile', href: '/participant/profile', icon: UserCircleIcon },
  { name: 'My Registrations', href: '/participant/registrations', icon: TicketIcon },
  { name: 'Certificates', href: '/participant/certificates', icon: AcademicCapIcon },
];

export function ParticipantNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1 px-2">
      {navigation.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`
              group flex items-center px-2 py-2 text-sm font-medium rounded-md
              ${isActive
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-700 hover:text-indigo-700 hover:bg-indigo-50'
              }
            `}
          >
            <item.icon
              className={`
                mr-3 flex-shrink-0 h-6 w-6
                ${isActive
                  ? 'text-indigo-700'
                  : 'text-gray-400 group-hover:text-indigo-700'
                }
              `}
              aria-hidden="true"
            />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
