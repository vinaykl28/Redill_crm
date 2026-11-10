'use client';

import React, { useState } from 'react';
import { Lead, SiteVisit, CallLog, UserProfile } from '@/types/crm';
import {
  PhoneCall,
  PhoneForwarded,
  CalendarDays,
  Flame,
  CheckCircle2,
  Clock,
  Phone,
  Building,
  User,
  Sparkles,
  ChevronRight,
  Filter,
} from 'lucide-react';

interface TelecallerDashboardProps {
  leads: Lead[];
  visits: SiteVisit[];
  calls: CallLog[];
  currentUser: UserProfile;
  onOpenLogCall: (lead?: Lead) => void;
  onOpenScheduleVisit: (lead?: Lead) => void;
  onViewLeadDetail: (lead: Lead) => void;
}

export function TelecallerDashboard({
  leads,
  visits,
  calls,
  currentUser,
  onOpenLogCall,
  onOpenScheduleVisit,
  onViewLeadDetail,
}: TelecallerDashboardProps) {
  const [filterTab, setFilterTab] = useState<'all' | 'new' | 'followup' | 'interested'>('all');

  // Filter leads based on calling queue status
  const newLeads = leads.filter((l) => l.status === 'new');
  const contactedLeads = leads.filter((l) => l.status === 'contacted');
  const interestedLeads = leads.filter((l) => l.status === 'interested');
  const bookedVisits = visits.filter(
    (v) => v.status === 'scheduled' || v.status === 'completed'
  );

  const displayLeads = leads.filter((l) => {
    if (filterTab === 'new') return l.status === 'new';
    if (filterTab === 'followup') return l.status === 'contacted';
    if (filterTab === 'interested') return l.status === 'interested';
    return true;
  });

  return (
    <div className="space-y-7">
      {/* Workspace Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#2B2623] via-[#3B342F] to-[#2B2623] text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-[#B36B39]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold font-['Outfit']">
              Hello, {currentUser.full_name}
            </h2>
            <p className="text-xs text-[#D6CFC4] mt-1 max-w-xl">
              Qualify inbound Meta & Google ad leads, log call dispositions, and coordinate scheduled site visits.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onOpenLogCall()}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#B36B39] hover:bg-[#9E5A2C] text-white text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              <PhoneForwarded className="w-3.5 h-3.5" />
              <span>Log Call Disposition</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">New Leads to Call</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <PhoneCall className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-['Outfit']">
            {newLeads.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Pending first contact</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Calls Logged</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-['Outfit']">
            {calls.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Total interactions logged</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Visits Booked</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-['Outfit']">
            {bookedVisits.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Scheduled with sales fleet</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Interested Clients</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-['Outfit']">
            {interestedLeads.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">In active consideration</p>
        </div>
      </div>

      {/* Main Calling Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-['Outfit'] flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-emerald-600" />
              Priority Calling Queue
            </h3>
            <p className="text-xs text-slate-500">Your assigned ad leads ready for calls</p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                filterTab === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All ({leads.length})
            </button>
            <button
              onClick={() => setFilterTab('new')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                filterTab === 'new'
                  ? 'bg-white text-amber-700 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              New ({newLeads.length})
            </button>
            <button
              onClick={() => setFilterTab('followup')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                filterTab === 'followup'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Follow-ups ({contactedLeads.length})
            </button>
            <button
              onClick={() => setFilterTab('interested')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                filterTab === 'interested'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Interested ({interestedLeads.length})
            </button>
          </div>
        </div>

        {/* Lead Rows */}
        <div className="divide-y divide-slate-100">
          {displayLeads.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400">
              No leads in this filter queue.
            </div>
          ) : (
            displayLeads.map((lead) => (
              <div
                key={lead.id}
                className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/60 px-2 rounded-xl transition"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs shrink-0 font-['Outfit']">
                    {lead.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 font-['Outfit']">
                        {lead.name}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          lead.status === 'new'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : lead.status === 'interested'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {lead.status.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{lead.budget}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                      <span className="font-mono text-slate-700 font-medium">{lead.phone}</span>
                      <span>•</span>
                      <span>{lead.project_interested}</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-medium">{lead.source}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  <a
                    href={`tel:${lead.phone}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Dial</span>
                  </a>
                  <button
                    onClick={() => onOpenLogCall(lead)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-2xs transition cursor-pointer"
                  >
                    <span>Log Outcome</span>
                  </button>
                  <button
                    onClick={() => onOpenScheduleVisit(lead)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold transition cursor-pointer"
                  >
                    <span>Book Visit</span>
                  </button>
                  <button
                    onClick={() => onViewLeadDetail(lead)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 transition cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

