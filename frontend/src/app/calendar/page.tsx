'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { SiteVisit, Lead } from '@/types/crm';
import { CrmService } from '@/lib/crmService';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { TeamsCalendarView } from '@/components/calendar/TeamsCalendarView';
import {
  Calendar,
  Clock,
  Car,
  UserCheck,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export default function CalendarPage() {
  const { currentUser, availableProfiles, isLoading } = useAuth();
  const [visits, setVisits] = useState<SiteVisit[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const loadCalendarData = useCallback(async () => {
    if (!currentUser) return;
    setIsDataLoading(true);
    try {
      const [visitsData, leadsData] = await Promise.all([
        CrmService.getSiteVisits(currentUser),
        CrmService.getLeads(currentUser),
      ]);
      setVisits(visitsData);
      setLeads(leadsData);
    } catch (err) {
      console.error('Failed to load calendar data:', err);
    } finally {
      setIsDataLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadCalendarData();
  }, [loadCalendarData]);

  if (isLoading || !currentUser) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center text-slate-600 text-sm">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="font-['Outfit'] font-semibold tracking-wide">
            Loading Operations Calendar...
          </span>
        </div>
      </div>
    );
  }

  // Summary Metrics
  const scheduledCount = visits.filter(
    (v) => v.status === 'scheduled' || v.status === 'in_progress'
  ).length;
  const completedCount = visits.filter((v) => v.status === 'completed').length;
  const uniqueVehicles = new Set(visits.map((v) => v.vehicle_type).filter(Boolean)).size;

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-800">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 p-6 space-y-5 overflow-y-auto">
          {/* Calendar Header Card */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl luxury-card border border-slate-200 shadow-xs">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 font-['Outfit']">
                <Calendar className="w-5 h-5 text-amber-600" />
                Operations & Site Visit Calendar
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Teams schedule view • Time slots are automatically blocked when a client site visit is booked
              </p>
            </div>

            {/* Quick KPI Pills */}
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-bold">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>{scheduledCount} Blocked Slots</span>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 font-bold">
                <Car className="w-3.5 h-3.5 text-blue-600" />
                <span>{uniqueVehicles || 3} Fleet Vehicles</span>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{completedCount} Completed</span>
              </div>
            </div>
          </div>

          {/* Teams Style Calendar Schedule */}
          <TeamsCalendarView
            visits={visits}
            leads={leads}
            currentUser={currentUser}
            telecallers={availableProfiles}
            onVisitsUpdated={loadCalendarData}
          />
        </main>
      </div>
    </div>
  );
}
