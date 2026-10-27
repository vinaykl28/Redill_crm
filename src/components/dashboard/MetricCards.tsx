'use client';

import React from 'react';
import { Lead, SiteVisit, CallLog } from '@/types/crm';
import {
  Users,
  Target,
  CalendarCheck,
  TrendingUp,
} from 'lucide-react';

interface MetricCardsProps {
  leads: Lead[];
  visits: SiteVisit[];
  calls: CallLog[];
}

export function MetricCards({ leads, visits, calls }: MetricCardsProps) {
  const totalLeads = leads.length;
  const convertedLeads = leads.filter((l) => l.status === 'converted').length;
  const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

  const siteVisitsScheduled = visits.filter(
    (v) => v.status === 'scheduled' || v.status === 'completed'
  ).length;

  const contactedCount = leads.filter((l) => l.status !== 'new').length;
  const contactedRate = totalLeads > 0 ? Math.round((contactedCount / totalLeads) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* 1. Total Leads */}
      <div className="luxury-card luxury-card-hover rounded-2xl p-6 relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest font-['Space_Grotesk']">
            Total Ad Inquiries
          </span>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200 group-hover:scale-110 transition-transform shadow-xs">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4 flex items-baseline gap-2.5">
          <span className="text-3xl font-black text-slate-900 tracking-tight font-['Outfit']">
            {totalLeads}
          </span>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +18.4%
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2.5">
          <span>{contactedCount} contacted</span>
          <span className="font-semibold text-amber-700">{contactedRate}% outreach</span>
        </div>

        <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* 2. Conversion Rate */}
      <div className="luxury-card luxury-card-hover rounded-2xl p-6 relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest font-['Space_Grotesk']">
            Conversion Rate
          </span>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 group-hover:scale-110 transition-transform shadow-xs">
            <Target className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4 flex items-baseline gap-2.5">
          <span className="text-3xl font-black text-emerald-700 tracking-tight font-['Outfit']">
            {conversionRate}%
          </span>
          <span className="text-xs text-slate-500 font-medium">({convertedLeads} booked)</span>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2.5">
          <span>Token Advances Paid</span>
          <span className="font-semibold text-emerald-700">Target: 15%</span>
        </div>

        <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* 3. Site Visits */}
      <div className="luxury-card luxury-card-hover rounded-2xl p-6 relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest font-['Space_Grotesk']">
            Site Visits
          </span>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200 group-hover:scale-110 transition-transform shadow-xs">
            <CalendarCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4 flex items-baseline gap-2.5">
          <span className="text-3xl font-black text-slate-900 tracking-tight font-['Outfit']">
            {siteVisitsScheduled}
          </span>
          <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
            Active
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2.5">
          <span>Vehicle & escort assigned</span>
          <span className="font-semibold text-blue-700">Scheduled visits</span>
        </div>

        <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none"></div>
      </div>
    </div>
  );
}
