'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: DashboardIcon,
  },
  {
    label: 'Patients',
    href: '/patients',
    icon: PatientsIcon,
  },
  {
    label: 'Sessions',
    href: '/sessions',
    icon: SessionsIcon,
  },
];

interface SidebarProps {
  providerName: string;
  providerRole: string;
}

export function Sidebar({ providerName, providerRole }: SidebarProps) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-fayth-700">fayth.life</h1>
        <p className="text-xs text-gray-400 mt-0.5">Provider Dashboard</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Main navigation">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-fayth-50 text-fayth-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <item.icon active={active} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-fayth-100 text-fayth-700 flex items-center justify-center text-sm font-semibold">
            {providerName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {providerName}
            </p>
            <p className="text-xs text-gray-500 capitalize">{providerRole}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function DashboardIcon({ active }: { active: boolean }) {
  return (
    <svg
      className={`w-5 h-5 ${active ? 'text-fayth-600' : 'text-gray-400'}`}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
      />
    </svg>
  );
}

function PatientsIcon({ active }: { active: boolean }) {
  return (
    <svg
      className={`w-5 h-5 ${active ? 'text-fayth-600' : 'text-gray-400'}`}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
      />
    </svg>
  );
}

function SessionsIcon({ active }: { active: boolean }) {
  return (
    <svg
      className={`w-5 h-5 ${active ? 'text-fayth-600' : 'text-gray-400'}`}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
      />
    </svg>
  );
}
