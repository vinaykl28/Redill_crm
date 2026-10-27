'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { SiteVisit, Lead } from '@/types/crm';
import { CrmService } from '@/lib/crmService';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { SiteVisitsList } from '@/components/site-visits/SiteVisitsList';
import { ScheduleVisitModal } from '@/components/site-visits/ScheduleVisitModal';
import { CalendarDays, CalendarPlus, Car } from 'lucide-react';

export default function SiteVisitsPage() {
  const { currentUser, availableProfiles, isLoading } = useAuth();
  const [visits, setVisits] = useState<SiteVisit[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    if (!currentUser) return;
    const [visitsData, leadsData] = await Promise.all([
      CrmService.getSiteVisits(currentUser),
      CrmService.getLeads(currentUser),
    ]);
    setVisits(visitsData);
    setLeads(leadsData);
  }, [currentUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading) return null;

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-800">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Site Visit Workflow & Logistics"
          subtitle="Manage luxury cab fleet, driver dispatch, sales escorts, and visit outcomes"
          onOpenLogCall={() => {}}
        />

        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Header Card */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl luxury-card border border-slate-200 shadow-xs">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 font-['Outfit']">
                <Car className="w-5 h-5 text-blue-600" />
                Customer Site Visit Operations
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Total {visits.length} site visits • AC Innova & Honda City fleet based in HSR Layout
              </p>
            </div>

            <button
              onClick={() => setIsScheduleModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition"
            >
              <CalendarPlus className="w-4 h-4 stroke-[2.5]" />
              <span>Book Site Visit Logistics</span>
            </button>
          </div>

          <SiteVisitsList
            visits={visits}
            currentUser={currentUser}
            onVisitUpdated={loadData}
          />
        </main>
      </div>

      <ScheduleVisitModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        leads={leads}
        currentUser={currentUser}
        telecallers={availableProfiles}
        onScheduled={loadData}
      />
    </div>
  );
}
