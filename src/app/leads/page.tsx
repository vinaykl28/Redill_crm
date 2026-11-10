'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Lead } from '@/types/crm';
import { CrmService } from '@/lib/crmService';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { LeadsTable } from '@/components/leads/LeadsTable';
import { BulkImportModal } from '@/components/leads/BulkImportModal';
import { ManualLeadModal } from '@/components/leads/ManualLeadModal';
import { LogCallModal } from '@/components/calls/LogCallModal';
import { ScheduleVisitModal } from '@/components/site-visits/ScheduleVisitModal';
import { LeadDetailModal } from '@/components/leads/LeadDetailModal';
import { Users, FileSpreadsheet, PlusCircle, Sparkles, ChevronRight } from 'lucide-react';

export default function LeadsPage() {
  const { currentUser, role, availableProfiles, isLoading } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [isManualLeadOpen, setIsManualLeadOpen] = useState(false);
  const [isLogCallOpen, setIsLogCallOpen] = useState(false);
  const [isScheduleVisitOpen, setIsScheduleVisitOpen] = useState(false);
  const [isLeadDetailOpen, setIsLeadDetailOpen] = useState(false);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);

  const loadLeads = useCallback(async () => {
    if (!currentUser) return;
    const data = await CrmService.getLeads(currentUser);
    setLeads(data);
  }, [currentUser]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  const handleOpenLogCallForLead = (lead: Lead) => {
    setActiveLead(lead);
    setIsLogCallOpen(true);
  };

  const handleOpenScheduleVisitForLead = (lead: Lead) => {
    setActiveLead(lead);
    setIsScheduleVisitOpen(true);
  };

  const handleViewLeadDetail = (lead: Lead) => {
    setActiveLead(lead);
    setIsLeadDetailOpen(true);
  };

  const handleEditLead = (lead: Lead) => {
    setActiveLead(lead);
    setIsManualLeadOpen(true);
  };

  if (isLoading || !currentUser) return null;

  return (
    <div className="flex min-h-screen bg-[#FAF8F5] text-[#1E242B] font-['Plus_Jakarta_Sans']">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Lead Intake & Pipeline Management"
          subtitle="Manage digital ad leads, track bulk imports, and keep your pipeline organized."
          onOpenNewLead={() => {
            setActiveLead(null);
            setIsManualLeadOpen(true);
          }}
          onOpenBulkImport={() => setIsBulkImportOpen(true)}
          onOpenLogCall={() => {
            setActiveLead(null);
            setIsLogCallOpen(true);
          }}
        />

        <main className="flex-1 p-6 sm:p-8 space-y-5 overflow-y-auto">
          {/* Action Cards Bar */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Left Card: All Developer Leads Portfolio */}
            <div className="md:col-span-7 bg-white rounded-2xl border border-[#EDE7DD] p-4 sm:p-5 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#FAF0E6] border border-[#F3E2D0] flex items-center justify-center text-[#B36B39] shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#1C1917] font-['Outfit']">
                    {role === 'telecaller' ? 'My Assigned Leads' : 'All Developer Leads Portfolio'}
                  </h2>
                  <p className="text-xs text-[#78716C] mt-0.5">
                    Total {leads.length} leads in current portfolio
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
            </div>

            {/* Right Card: Bulk Import & Add Lead Manually */}
            <div className="md:col-span-5 bg-white rounded-2xl border border-[#EDE7DD] p-3 sm:p-3.5 flex items-center justify-end gap-2.5 shadow-xs">
              <button
                onClick={() => setIsBulkImportOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-white hover:bg-[#FAF8F5] border border-[#E2DBD0] text-xs font-semibold text-[#374151] transition shadow-xs cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Bulk Import (CSV / Excel)</span>
              </button>
              <button
                onClick={() => {
                  setActiveLead(null);
                  setIsManualLeadOpen(true);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#B36B39] hover:bg-[#9E5A2C] text-white text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 stroke-[2.5]" />
                <span>Add Lead Manually</span>
              </button>
            </div>
          </div>

          {/* Leads Table */}
          <LeadsTable
            leads={leads}
            currentUser={currentUser}
            telecallers={availableProfiles}
            onViewLead={handleViewLeadDetail}
            onEditLead={handleEditLead}
            onOpenLogCall={handleOpenLogCallForLead}
            onOpenScheduleVisit={handleOpenScheduleVisitForLead}
          />
        </main>
      </div>

      {/* Global Modals */}
      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        currentUser={currentUser}
        onImportSuccess={loadLeads}
      />
      <ManualLeadModal
        isOpen={isManualLeadOpen}
        onClose={() => setIsManualLeadOpen(false)}
        currentUser={currentUser}
        initialLead={activeLead}
        telecallers={availableProfiles}
        onSaved={loadLeads}
      />
      <LogCallModal
        isOpen={isLogCallOpen}
        onClose={() => setIsLogCallOpen(false)}
        leads={leads}
        selectedLead={activeLead}
        currentUser={currentUser}
        onCallLogged={loadLeads}
      />
      <ScheduleVisitModal
        isOpen={isScheduleVisitOpen}
        onClose={() => setIsScheduleVisitOpen(false)}
        leads={leads}
        selectedLead={activeLead}
        currentUser={currentUser}
        telecallers={availableProfiles}
        onScheduled={loadLeads}
      />
      <LeadDetailModal
        isOpen={isLeadDetailOpen}
        onClose={() => setIsLeadDetailOpen(false)}
        lead={activeLead}
        currentUser={currentUser}
        telecallers={availableProfiles}
        onOpenLogCall={handleOpenLogCallForLead}
        onOpenScheduleVisit={handleOpenScheduleVisitForLead}
        onEditLead={handleEditLead}
        onLeadUpdated={loadLeads}
      />
    </div>
  );
}
