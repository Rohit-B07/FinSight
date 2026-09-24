'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';
import {
  LayoutDashboard, Wallet, ShieldAlert, Target, Tags, Brain,
  LogOut, TrendingUp, ChevronRight, User, Bell
} from 'lucide-react';
import { useState } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const { signOut, session } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, group: 'Main' },
    { name: 'Budget', href: '/budget', icon: Wallet, group: 'Main' },
    { name: 'Risk', href: '/risk', icon: ShieldAlert, group: 'Main' },
    { name: 'Priorities', href: '/settings/priorities', icon: Target, group: 'Settings' },
    { name: 'Categories', href: '/settings/categories', icon: Tags, group: 'Settings' },
    { name: 'ML Models', href: '/admin/models', icon: Brain, group: 'Admin' },
  ];

  const grouped = navItems.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {});

  const userEmail = session?.user?.email || 'user@finsight.com';
  const userInitials = userEmail.split('@')[0].slice(0, 2).toUpperCase();

  return (
    <aside className={`fixed left-0 top-0 h-screen z-40 transition-all duration-300 ${collapsed ? 'w-[84px]' : 'w-[280px]'}`}>
      <div className="h-full bg-gradient-dark flex flex-col shadow-xlarge border-r border-white/5">
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-400 flex items-center justify-center shadow-glow-primary group-hover:scale-105 transition-transform">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              {!collapsed && (
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-white leading-none">FinSight</span>
                  <span className="text-[10px] font-semibold text-primary-400 tracking-widest">SUITE</span>
                </div>
              )}
            </Link>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:flex w-8 h-8 items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
              title={collapsed ? 'Expand' : 'Collapse'}
            >
              <ChevronRight className={`w-4 h-4 transition-transform ${collapsed ? '' : 'rotate-180'}`} />
            </button>
          </div>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-6 overflow-y-auto">
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group} className="space-y-1">
              {!collapsed && (
                <p className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {group}
                </p>
              )}
              {items.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-white/10 text-white shadow-inner-soft ring-1 ring-white/10'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                    title={collapsed ? item.name : ''}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-gradient-to-b from-primary-400 to-secondary-400" />
                    )}
                    <div className={`${isActive ? 'text-primary-400' : 'text-slate-400 group-hover:text-white'} transition-colors`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    {!collapsed && (
                      <span className="font-medium text-sm flex-1">{item.name}</span>
                    )}
                    {!collapsed && isActive && item.name === 'Dashboard' && (
                      <span className="badge bg-primary-500/20 text-primary-300 border-0 text-[10px]">Live</span>
                    )}
                    {!collapsed && item.name === 'Risk' && (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-danger-500" />
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-white/5 space-y-3">
          {!collapsed && (
            <div className="rounded-xl bg-white/5 border border-white/10 p-3 mx-1">
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold">
                  {userInitials || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{session?.user?.email?.split('@')[0] || 'User'}</p>
                  <p className="text-[10px] text-slate-500 truncate">{userEmail}</p>
                </div>
                <button className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors">
                  <Bell className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-success-500/15 text-success-400 border border-success-500/20 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-success-400 animate-pulse" />
                  Online
                </span>
                <span className="text-slate-500">Pro Plan</span>
              </div>
            </div>
          )}

          <button
            onClick={signOut}
            className={`flex w-full items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-danger-400 hover:bg-danger-500/10 transition-all duration-200 ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? 'Sign Out' : ''}
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span className="font-medium text-sm">Sign Out</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
