'use client';

import { useState } from 'react';
import {
  Users, Store, ClipboardCheck, TrendingUp, BarChart3, UserCog, Settings,
  LogOut, Menu, X, LayoutDashboard, ChevronLeft, Shield
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { logout } from '@/lib/api';
import { User } from '@/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'VIEWER'] },
  { href: '/staff', label: 'Staff', icon: Users, roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'VIEWER'] },
  { href: '/stores', label: 'Stores', icon: Store, roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'VIEWER'] },
  { href: '/inductions', label: 'Inductions', icon: ClipboardCheck, roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'VIEWER'] },
  { href: '/performance', label: 'Performance', icon: TrendingUp, roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'VIEWER'] },
  { href: '/reports', label: 'Reports', icon: BarChart3, roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'VIEWER'] },
  { href: '/users', label: 'Users', icon: UserCog, roles: ['SUPER_ADMIN', 'ADMIN'] },
  { href: '/settings', label: 'Settings', icon: Settings, roles: ['SUPER_ADMIN', 'ADMIN'] },
];

export default function Sidebar({ user }: { user: User | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className={cn('p-4 border-b border-gray-200/60', collapsed ? 'text-center' : '')}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/25">
            <Users className="w-4.5 h-4.5 text-white" />
          </div>
          {!collapsed && (
            <div className="animate-in slide-in-from-left duration-200">
              <h1 className="font-bold text-gray-900 text-sm tracking-tight">Staff Manager</h1>
              <p className="text-[11px] text-gray-400 font-medium">Retail Platform</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <p className={cn('text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 py-2', collapsed && 'text-center')}>
          {collapsed ? '•' : 'Menu'}
        </p>
        {navItems.filter(item => item.roles.includes(user?.role || 'VIEWER')).map(item => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative',
                isActive
                  ? 'bg-gradient-to-r from-indigo-50 to-indigo-50/50 text-indigo-700 shadow-sm'
                  : 'text-gray-500 hover:bg-gray-100/80 hover:text-gray-900',
                collapsed && 'justify-center'
              )}
              title={collapsed ? item.label : undefined}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-gradient-to-b from-indigo-600 to-indigo-500 rounded-r-full" />
              )}
              <item.icon className={cn(
                'w-[18px] h-[18px] flex-shrink-0 transition-transform duration-200',
                isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600',
                !isActive && 'group-hover:scale-110'
              )} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle (desktop) */}
      <div className="hidden lg:block px-3 py-2 border-t border-gray-200/60">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
        >
          <ChevronLeft className={cn('w-4 h-4 transition-transform duration-300', collapsed && 'rotate-180')} />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>

      {/* User section */}
      <div className="p-3 border-t border-gray-200/60">
        {!collapsed && user && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-xs font-bold text-white">
                {user.username?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user.username}</p>
              <Badge status={user.role} size="sm">
                {user.role?.toLowerCase().replace('_', ' ')}
              </Badge>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 w-full',
            collapsed && 'justify-center'
          )}
        >
          <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile trigger */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white rounded-xl shadow-lg border border-gray-200/60"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setMobileOpen(false)} />
          <div className="relative w-72 h-full bg-white shadow-2xl animate-in slide-in-from-left duration-300" onClick={e => e.stopPropagation()}>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className={cn(
        'hidden lg:flex flex-col bg-white border-r border-gray-200/60 transition-all duration-300 ease-in-out',
        collapsed ? 'w-[68px]' : 'w-64'
      )}>
        {sidebarContent}
      </aside>
    </>
  );
}
