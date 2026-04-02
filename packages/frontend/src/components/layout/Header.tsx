'use client';

import { useState, useRef, useEffect } from 'react';
import { User } from '@/types';
import { Bell, User as UserIcon, LogOut, Settings, ChevronRight, Search } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { logout } from '@/lib/api';
import Link from 'next/link';

const routeLabels: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/staff': 'Staff',
  '/stores': 'Stores',
  '/attendance': 'Attendance',
  '/performance': 'Performance',
  '/reports': 'Reports',
  '/users': 'Users',
  '/settings': 'Settings',
};

function Breadcrumbs() {
  const pathname = usePathname();
  if (!pathname) return null;

  const segments = pathname.split('/').filter(Boolean);
  const crumbs: { label: string; href: string }[] = [];

  let path = '';
  for (const seg of segments) {
    path += `/${seg}`;
    const label = routeLabels[path] || decodeURIComponent(seg).replace(/[-_]/g, ' ');
    crumbs.push({ label: label.charAt(0).toUpperCase() + label.slice(1), href: path });
  }

  return (
    <div className="flex items-center gap-1.5 text-sm">
      {crumbs.map((crumb, i) => (
        <span key={crumb.href} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-gray-300" />}
          {i === crumbs.length - 1 ? (
            <span className="font-semibold text-gray-900">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="text-gray-400 hover:text-gray-600 transition font-medium">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </div>
  );
}

export default function Header({ user }: { user: User | null }) {
  const router = useRouter();
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 px-6 py-3.5 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-6">
        <div className="hidden lg:block">
          <Breadcrumbs />
        </div>
        <div className="lg:hidden ml-12">
          <Breadcrumbs />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button className="relative p-2.5 rounded-xl hover:bg-gray-100 transition group">
          <Bell className="w-[18px] h-[18px] text-gray-500 group-hover:text-gray-700 transition" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
        </button>

        {/* Profile dropdown */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-3 px-2.5 py-1.5 rounded-xl hover:bg-gray-100 transition"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-xs font-bold text-white">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-gray-900 leading-tight">{user?.username}</p>
              <p className="text-[11px] text-gray-400 capitalize font-medium">{user?.role?.toLowerCase().replace('_', ' ')}</p>
            </div>
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-200/60 py-2 animate-in fade-in slide-in-from-bottom-4 duration-200 z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">{user?.username}</p>
                <p className="text-xs text-gray-400">{user?.email || 'No email'}</p>
              </div>
              <Link
                href="/settings"
                onClick={() => setShowProfile(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                <Settings className="w-4 h-4" /> Settings
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
              >
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
