'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  PhoneCall,
  CalendarDays,
  Calendar,
  FileText,
  Trophy,
  RefreshCw,
} from 'lucide-react';
import { CrmService } from '@/lib/crmService';

const NAV_ITEMS = [
  {
    label: 'Dashboard & Analytics',
    href: '/',
    icon: LayoutDashboard,
    badge: 'Live',
  },
  {
    label: 'Lead Pipeline',
    href: '/leads',
    icon: Users,
    badge: 'Ad Clicks',
  },
  {
    label: 'Telecalling Logs',
    href: '/calls',
    icon: PhoneCall,
  },
  {
    label: 'Site Visit Logistics',
    href: '/site-visits',
    icon: CalendarDays,
    badge: 'Fleet',
  },
  {
    label: 'Calendar & Schedule',
    href: '/calendar',
    icon: Calendar,
    badge: 'Teams View',
  },
  {
    label: 'Sales Leaderboard',
    href: '/leaderboard',
    icon: Trophy,
    badge: 'Podium',
  },
  {
    label: 'Document Vault',
    href: '/documents',
    icon: FileText,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  const handleResetDemo = () => {
    if (confirm('Reset demo data to default Red Hill Infra leads, calls, and site visits?')) {
      CrmService.resetDemoData();
      window.location.reload();
    }
  };

  return (
    <aside className="w-72 bg-white/95 border-r border-slate-200 flex flex-col h-screen sticky top-0 shrink-0 select-none z-30 shadow-sm backdrop-blur-xl">
      {/* Brand Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <Link href="/" className="block">
          <img
            src="/logo.png"
            alt="Red Hill Infra"
            className="h-10 w-auto object-contain rounded-lg"
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 py-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-['Space_Grotesk']">
          Navigation
        </p>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition group relative ${
                isActive
                  ? 'bg-amber-50 text-amber-900 border-l-2 border-amber-600 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon
                className={`w-4 h-4 transition duration-200 ${
                  isActive
                    ? 'text-amber-600 scale-110'
                    : 'text-slate-400 group-hover:text-amber-600'
                }`}
              />
              <span className="truncate">{item.label}</span>
              {item.badge && (
                <span
                  className={`ml-auto text-[9px] px-1.5 py-0.5 rounded-full font-mono font-bold tracking-tight ${
                    isActive
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-slate-100 text-xs flex items-center justify-between text-slate-400">
        <span className="text-[11px] font-medium text-slate-500">Red Hill Infra</span>
        <button
          onClick={handleResetDemo}
          title="Reset test data"
          className="p-1 text-slate-400 hover:text-slate-600 rounded transition cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      </div>
    </aside>
  );
}
