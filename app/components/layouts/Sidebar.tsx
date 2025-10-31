'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  CalendarCheck,
  Bed,
  Users,
  UserCog,
  ClipboardList,
  Sparkles,
  CreditCard,
  FileText,
  Bell,
  Settings,
  Hotel,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

const menuItems = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
  },
  {
    label: 'Reservations',
    icon: CalendarCheck,
    href: '/dashboard/reservations',
  },
  {
    label: 'Rooms',
    icon: Bed,
    href: '/dashboard/rooms',
  },
  {
    label: 'Guests',
    icon: Users,
    href: '/dashboard/guests',
  },
  {
    label: 'Staff',
    icon: UserCog,
    href: '/dashboard/staff',
  },
  {
    label: 'Tasks',
    icon: ClipboardList,
    href: '/dashboard/tasks',
  },
  {
    label: 'Spa',
    icon: Sparkles,
    href: '/dashboard/spa',
  },
  {
    label: 'Payments',
    icon: CreditCard,
    href: '/dashboard/payments',
  },
  {
    label: 'Reports',
    icon: FileText,
    href: '/dashboard/reports',
  },
  {
    label: 'Notifications',
    icon: Bell,
    href: '/dashboard/notifications',
  },
  {
    label: 'Settings',
    icon: Settings,
    href: '/dashboard/settings',
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed top-0 left-0 z-50 h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <Hotel className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Hotel Admin
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Management
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-3">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={clsx(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
              <p className="text-xs font-medium text-blue-900 dark:text-blue-400">
                Need help?
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                Contact support
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
