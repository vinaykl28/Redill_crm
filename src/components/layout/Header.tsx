'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { PlusCircle, FileSpreadsheet, PhoneForwarded } from 'lucide-react';

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
  const { role } = useAuth();

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-8 flex items-center justify-between sticky top-0 z-20">
      <div>
        {title && (
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold text-slate-900 tracking-tight font-['Outfit']">
              {title}
            </h2>
          </div>
        )}
        {subtitle && <p className="text-xs text-slate-500 font-normal">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2.5">
        {onOpenLogCall && (
          <button
            onClick={onOpenLogCall}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <PhoneForwarded className="w-3.5 h-3.5 text-amber-600" />
            <span>Log Call</span>
          </button>
        )}

        {onOpenBulkImport && (
          <button
            onClick={onOpenBulkImport}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Import</span>
          </button>
        )}

        {onOpenNewLead && (
          <button
            onClick={onOpenNewLead}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 text-white" />
            <span>Add Lead</span>
          </button>
        )}
      </div>
    </header>
  );
}
