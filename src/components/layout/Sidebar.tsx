'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  PhoneCall,
  CalendarDays,
  Calendar,
  FileText,
  Trophy,
  ChevronDown,
  LogOut,
  RefreshCw,
} from 'lucide-react';
import { CrmService } from '@/lib/crmService';
import { useAuth } from '@/context/AuthContext';

const ALL_NAV_ITEMS = [
  {
    label: 'Dashboard & Analytics',
    href: '/',
    icon: LayoutDashboard,
    roles: ['admin', 'sales_executive', 'manager', 'telecaller'],
  },
  {
    label: 'Lead Pipeline',
    href: '/leads',
    icon: Users,
    badge: '42 Leads',
    roles: ['admin', 'sales_executive', 'manager', 'telecaller'],
  },
  {
    label: 'Site Visit Logistics',
    href: '/site-visits',
    icon: CalendarDays,
    roles: ['admin', 'sales_executive', 'manager'],
  },
  {
    label: 'Calendar & Schedule',
    href: '/calendar',
    icon: Calendar,
    roles: ['admin', 'sales_executive', 'manager', 'telecaller'],
  },
  {
    label: 'Sales Leaderboard',
    href: '/leaderboard',
    icon: Trophy,
    roles: ['admin', 'sales_executive', 'manager'],
  },
  {
    label: 'Document Vault',
    href: '/documents',
    icon: FileText,
    roles: ['admin', 'sales_executive', 'manager', 'telecaller'],
  },
  {
    label: 'Telecalling Logs',
    href: '/calls',
    icon: PhoneCall,
    roles: ['admin', 'telecaller'],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, role, availableProfiles, switchRole, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [leadCount, setLeadCount] = useState<number | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    if (currentUser) {
      CrmService.getLeads(currentUser)
        .then((l) => {
          if (isMounted) setLeadCount(l.length);
        })
        .catch(() => {});
    }
    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResetDemo = () => {
    if (confirm('Reset demo data to default Red Hill Infra leads, calls, and site visits?')) {
      CrmService.resetDemoData();
      window.location.reload();
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navItems = ALL_NAV_ITEMS.filter((item) => {
    if (!role) return true;
    return item.roles.includes(role);
  });

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <aside className="w-68 lg:w-72 bg-[#F6F2EC] border-r border-[#EAE3D6] flex flex-col h-screen sticky top-0 shrink-0 select-none z-30 font-['Plus_Jakarta_Sans']">
      
      {/* Top Branding Logo */}
      <div className="px-6 pt-6 pb-4">
        <Link href="/" className="flex items-center gap-3 group">
          {/* Bronze Architectural Multi-Column Skyline */}
          <div className="flex items-end gap-1 h-9 text-[#B86B38]">
            <div className="w-2 h-4.5 bg-[#B86B38] rounded-t-[1px]" />
            <div className="w-2 h-7 bg-[#B86B38] rounded-t-[1px]" />
            <div className="w-2 h-9 bg-[#B86B38] rounded-t-[1px]" />
            <div className="w-2 h-6.5 bg-[#B86B38] rounded-t-[1px]" />
            <div className="w-2 h-4 bg-[#B86B38] rounded-t-[1px]" />
          </div>
          <div className="flex flex-col tracking-[0.22em] font-['Outfit'] select-none">
            <span className="text-[12px] font-bold text-[#1E242B] leading-tight">
              RED HILL
            </span>
            <span className="text-[10px] font-semibold text-[#1E242B] tracking-[0.28em] leading-tight">
              INFRA
            </span>
          </div>
        </Link>
      </div>

      {/* User Switcher Pill Card */}
      {currentUser && (
        <div className="px-4 pb-3" ref={userMenuRef}>
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="w-full bg-white/80 hover:bg-white border border-[#E8E1D5] rounded-2xl p-2.5 flex items-center justify-between transition shadow-xs cursor-pointer text-left"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[#EFE8DD] text-[#78350F] font-bold text-xs flex items-center justify-center font-['Outfit'] shrink-0">
                  {getInitials(currentUser.full_name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-[#1C1917] truncate font-['Outfit']">
                    {currentUser.full_name}
                  </div>
                  <div className="text-[10px] text-[#78716C] font-mono truncate">
                    {currentUser.email}
                  </div>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0 ml-1.5" />
            </button>

            {/* Dropdown Menu listing all 7 testing accounts */}
            {isUserMenuOpen && (
              <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-[#EDE6DC] py-2 z-50 animate-in fade-in duration-100">
                <p className="px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                  Switch Account (7 Test Logins)
                </p>
                <div className="max-h-60 overflow-y-auto px-1.5 py-1">
                  {availableProfiles.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        switchRole(p.role, p.id);
                        setIsUserMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition cursor-pointer ${
                        currentUser.id === p.id
                          ? 'bg-[#F7EBE1] text-[#934F23] font-bold border border-[#E8D4C2]'
                          : 'text-[#4B5563] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-left truncate">
                        <div className="w-6 h-6 rounded-full bg-[#EFE8DD] text-[#78350F] text-[10px] font-bold flex items-center justify-center shrink-0">
                          {getInitials(p.full_name)}
                        </div>
                        <div className="truncate">
                          <div className="font-semibold text-xs text-[#1C1917] truncate">{p.full_name}</div>
                          <div className="text-[10px] text-[#78716C] font-mono truncate">{p.email}</div>
                        </div>
                      </div>
                      {currentUser.id === p.id && (
                        <span className="text-[9px] font-semibold text-[#B86B38] ml-1 shrink-0">
                          Active
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                <div className="border-t border-[#F0ECE4] px-2 pt-1.5 mt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-[#DC2626] hover:bg-[#FEF2F2] rounded-xl transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation Section */}
      <nav className="flex-1 px-3.5 py-2 space-y-1 overflow-y-auto">
        <p className="px-3 pt-1 pb-1.5 text-[10px] font-bold text-[#9CA3AF] uppercase tracking-[0.16em]">
          Navigation
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition group relative ${
                isActive
                  ? 'bg-[#F6EBE2] text-[#934F23] font-semibold shadow-xs border-l-[3px] border-[#B36B39]'
                  : 'text-[#4B5563] hover:text-[#1C1917] hover:bg-white/60 font-medium'
              }`}
            >
              <Icon
                className={`w-4 h-4 transition duration-200 shrink-0 ${
                  isActive
                    ? 'text-[#B36B39]'
                    : 'text-[#9CA3AF] group-hover:text-[#B36B39]'
                }`}
              />
              <span className="truncate">{item.label}</span>
              {item.href === '/leads' ? (
                <span
                  className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-semibold tracking-tight ${
                    isActive
                      ? 'bg-[#F1DFC8] text-[#8C4A1F]'
                      : 'bg-white text-[#78716C] border border-[#E8E1D5]'
                  }`}
                >
                  {leadCount !== null ? `${leadCount} Leads` : item.badge}
                </span>
              ) : item.badge ? (
                <span
                  className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-semibold tracking-tight ${
                    isActive
                      ? 'bg-[#F1DFC8] text-[#8C4A1F]'
                      : 'bg-white text-[#78716C] border border-[#E8E1D5]'
                  }`}
                >
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Architecture Visual & Signature */}
      <div className="mt-auto px-4 pb-4 select-none">
        <div className="relative w-full h-24 rounded-xl overflow-hidden mb-2 border border-[#E8E1D5]/70">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80"
            alt="Red Hill Infra"
            className="w-full h-full object-cover sepia-[0.35] contrast-[0.95] opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#F6F2EC] via-transparent to-transparent" />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#1C1917] font-['Outfit']">
              Red Hill Infra
            </div>
            <div className="text-[10px] text-[#78716C]">
              Build. Manage. Grow.
            </div>
          </div>
          <button
            onClick={handleResetDemo}
            title="Reset test data"
            className="p-1.5 text-[#9CA3AF] hover:text-[#1C1917] hover:bg-white/60 rounded-lg transition cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
      </div>

    </aside>
  );
}