'use client';

import React from 'react';
import Link from 'next/link';
import { Lead, SiteVisit, CallLog, UserProfile } from '@/types/crm';
import {
  CalendarDays,
  Users,
  Flame,
  CheckCircle,
  Clock,
  Phone,
  Building,
  MapPin,
  Calendar,
  Sparkles,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface SalesExecutiveDashboardProps {
  leads: Lead[];
  visits: SiteVisit[];
  calls: CallLog[];
  currentUser: UserProfile;
  onOpenScheduleVisit: (lead?: Lead) => void;
  onOpenLogCall: (lead?: Lead) => void;
  onOpenNewLead: () => void;
  onViewLeadDetail: (lead: Lead) => void;
}

export function SalesExecutiveDashboard({
  leads,
  visits,
  calls,
  currentUser,
  onOpenScheduleVisit,
  onOpenLogCall,
  onOpenNewLead,
  onViewLeadDetail,
}: SalesExecutiveDashboardProps) {
  // Filter site visits (sorted with newest/upcoming visible immediately)
  const upcomingVisits = [...visits]
    .filter((v) => v.status === 'scheduled' || v.status === 'in_progress')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const completedVisits = visits.filter((v) => v.status === 'completed');

  // Include all active / newly assigned leads (new, interested, site_visit_scheduled), newest first
  const highIntentLeads = [...leads]
    .filter(
      (l) =>
        l.status === 'site_visit_scheduled' ||
        l.status === 'new' ||
        l.status === 'interested'
    )
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  const convertedLeads = leads.filter((l) => l.status === 'converted');

  return (
    <div className="space-y-7">
      {/* Workspace Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#2B2623] via-[#3B342F] to-[#2B2623] text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-[#B36B39]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold font-['Outfit']">
              Welcome, {currentUser.full_name}
            </h2>
            <p className="text-xs text-[#D6CFC4] mt-1 max-w-xl">
              Focus on scheduled site visits, client negotiations, and converting qualified leads into property bookings.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onOpenScheduleVisit()}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#B36B39] hover:bg-[#9E5A2C] text-white text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Schedule Site Visit</span>
            </button>
            <button
              onClick={() => onOpenLogCall()}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10 text-xs font-semibold transition cursor-pointer backdrop-blur"
            >
              <Phone className="w-3.5 h-3.5 text-[#D6CFC4]" />
              <span>Log Meeting / Call</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Scheduled Site Visits</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-['Outfit']">
            {upcomingVisits.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {completedVisits.length} completed this cycle
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">High-Intent Leads</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-['Outfit']">
            {highIntentLeads.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Ready for site tour & pricing</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Deals Converted</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-['Outfit']">
            {convertedLeads.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Booked & token confirmed</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Logged Interactions</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-['Outfit']">
            {calls.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Follow-ups & meeting notes</p>
        </div>
      </div>

      {/* Two Column Layout: Upcoming Visits & High-Intent Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scheduled Site Visits List */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-['Outfit'] flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-indigo-600" />
                Blocked Calendar & Site Visits
              </h3>
              <p className="text-xs text-slate-500">Scheduled visits blocking your calendar & cab dispatch</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/calendar"
                className="text-xs font-semibold text-[#934F23] hover:underline cursor-pointer"
              >
                Open Calendar →
              </Link>
              <button
                onClick={() => onOpenScheduleVisit()}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
              >
                + New Visit
              </button>
            </div>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {upcomingVisits.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No upcoming site visits scheduled.
              </div>
            ) : (
              upcomingVisits.map((visit) => (
                <div
                  key={visit.id}
                  className="p-3.5 rounded-xl border border-slate-100 hover:border-indigo-200 bg-slate-50/50 hover:bg-indigo-50/20 transition flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 font-['Outfit']">
                        {visit.lead_name}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        {visit.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Building className="w-3 h-3 text-slate-400" />
                        {visit.project_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {new Date(visit.scheduled_date).toLocaleString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {visit.pickup_location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {visit.pickup_location}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {visit.lead_phone && (
                      <a
                        href={`tel:${visit.lead_phone}`}
                        className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-300 transition"
                        title="Call Client"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Newly Assigned Site Visit Leads & Closures */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-['Outfit'] flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-600" />
                Newly Assigned Leads & Site Visits
              </h3>
              <p className="text-xs text-slate-500">New leads routed to you in alphabetical round-robin</p>
            </div>
            <Link
              href="/leads"
              className="text-xs font-semibold text-[#934F23] hover:underline cursor-pointer"
            >
              View All ({leads.length}) →
            </Link>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {highIntentLeads.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No new leads currently assigned to you.
              </div>
            ) : (
              highIntentLeads.slice(0, 6).map((lead) => {
                const bookedVisit = visits.find(
                  (v) => v.lead_id === lead.id && v.status !== 'cancelled'
                );
                return (
                  <div
                    key={lead.id}
                    className="p-3.5 rounded-xl border border-slate-100 hover:border-amber-200 bg-slate-50/50 hover:bg-amber-50/20 transition flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 font-['Outfit']">
                          {lead.name}
                        </span>
                        <span className="text-[10px] font-bold text-[#934F23] bg-[#F7EBE1] border border-[#E8D4C2] px-1.5 py-0.5 rounded uppercase">
                          {lead.status === 'site_visit_scheduled' ? 'NEW SITE VISIT' : lead.status.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {lead.budget}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2.5 text-[11px] text-slate-500">
                        <span>{lead.project_interested}</span>
                        <span>•</span>
                        <span className="text-amber-700 font-medium">{lead.source}</span>
                        {bookedVisit && (
                          <>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1 text-indigo-700 font-semibold">
                              <Clock className="w-3 h-3" />
                              {new Date(bookedVisit.scheduled_date).toLocaleString('en-IN', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenScheduleVisit(lead)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200 transition cursor-pointer"
                      >
                        Visit
                      </button>
                      <button
                        onClick={() => onViewLeadDetail(lead)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 transition cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

