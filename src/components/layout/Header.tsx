'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  Plus,
  FileSpreadsheet,
  PhoneCall,
  Bell,
  ChevronDown,
  LogOut,
} from 'lucide-react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onOpenNewLead?: () => void;
  onOpenBulkImport?: () => void;
  onOpenLogCall?: () => void;
  onOpenSiteVisit?: () => void;
}

export function Header({
  title,
  subtitle,
  onOpenNewLead,
  onOpenBulkImport,
  onOpenLogCall,
}: HeaderProps) {
  const { currentUser, availableProfiles, switchRole, logout } = useAuth();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    router.push('/login');
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 1).toUpperCase();
  };

  return (
    <header className="h-20 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#EAE3D6]/70 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-20 font-['Plus_Jakarta_Sans']">
      
      {/* Title & Subtitle */}
      <div>
        {title && (
          <h1 className="text-xl sm:text-2xl font-bold text-[#1C1917] tracking-tight font-['Outfit'] leading-tight">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="text-xs text-[#6B7280] font-normal mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        
        {/* Log Call Button */}
        {onOpenLogCall && (
          <button
            onClick={onOpenLogCall}
            className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#FAF8F5] text-[#374151] border border-[#E5E0D8] text-xs font-medium shadow-xs transition cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5 text-[#B36B39]" />
            <span>Log Call</span>
          </button>
        )}

        {/* Bulk Import Button */}
        {onOpenBulkImport && (
          <button
            onClick={onOpenBulkImport}
            className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#FAF8F5] text-[#374151] border border-[#E5E0D8] text-xs font-medium shadow-xs transition cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Import</span>
          </button>
        )}

        {/* Add Lead Button */}
        {onOpenNewLead && (
          <button
            onClick={onOpenNewLead}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#B36B39] hover:bg-[#9E5A2C] text-white text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Lead</span>
          </button>
        )}

        {/* Notification Bell */}
        <div className="relative">
          <button
            title="Notifications"
            className="w-9 h-9 rounded-full bg-white hover:bg-[#FAF8F5] border border-[#E5E0D8] flex items-center justify-center text-[#6B7280] transition shadow-xs cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-[#DC2626] absolute top-2 right-2 border-2 border-white" />
          </button>
        </div>

        {/* User Account Switcher Dropdown */}
        {currentUser ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full bg-white hover:bg-[#FAF8F5] border border-[#E5E0D8] transition shadow-xs cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-[#EFE8DD] text-[#78350F] font-bold text-xs flex items-center justify-center font-['Outfit']">
                {getInitials(currentUser.full_name)}
              </div>
              <ChevronDown className="w-3 h-3 text-[#9CA3AF]" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#EDE6DC] py-2 z-50 animate-in fade-in duration-100">
                <div className="px-4 py-2.5 border-b border-[#F0ECE4]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                    Signed in as
                  </p>
                  <p className="text-xs font-bold text-[#1C1917] mt-0.5">
                    {currentUser.full_name}
                  </p>
                  <p className="text-[11px] text-[#78716C] font-mono truncate">
                    {currentUser.email}
                  </p>
                </div>

                <div className="px-2 py-1.5 max-h-60 overflow-y-auto">
                  <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                    Switch Account (7 Testing Logins)
                  </p>
                  {availableProfiles.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        switchRole(p.role, p.id);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition cursor-pointer ${
                        currentUser.id === p.id
                          ? 'bg-[#F7EBE1] text-[#934F23] font-bold border border-[#E8D4C2]'
                          : 'text-[#4B5563] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 text-left truncate">
                        <div className="w-6 h-6 rounded-full bg-[#EFE8DD] text-[#78350F] font-bold text-[10px] flex items-center justify-center font-['Outfit'] shrink-0">
                          {getInitials(p.full_name)}
                        </div>
                        <div className="truncate">
                          <div className="font-semibold text-xs text-[#1C1917] truncate">{p.full_name}</div>
                          <div className="text-[10px] text-[#78716C] font-mono truncate">{p.email}</div>
                        </div>
                      </div>
                      {currentUser.id === p.id && (
                        <span className="text-[9px] font-semibold text-[#B86B38] shrink-0">
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
        ) : (
          <button
            onClick={() => router.push('/login')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1C1917] text-white text-xs font-semibold hover:bg-black transition cursor-pointer"
          >
            <span>Sign In</span>
          </button>
        )}
      </div>

    </header>
  );
}