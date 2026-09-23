'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { LayoutDashboard, Wallet, ShieldAlert, Target, Tags, Brain, LogOut } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Budget', href: '/budget', icon: Wallet },
    { name: 'Risk', href: '/risk', icon: ShieldAlert },
    { name: 'Priorities', href: '/settings/priorities', icon: Target },
    { name: 'Categories', href: '/settings/categories', icon: Tags },
    { name: 'ML Models', href: '/admin/models', icon: Brain },
  ];

  return (
    <div className="w-[250px] bg-slate-900 text-white h-screen fixed left-0 top-0 flex flex-col border-r border-slate-800">
      <div className="p-6">
        <h1 className="text-2xl font-bold tracking-tight text-white">FinSight</h1>
      </div>
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 mt-auto">
        <button
          onClick={signOut}
          className="flex w-full items-center space-x-3 px-4 py-3 text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
