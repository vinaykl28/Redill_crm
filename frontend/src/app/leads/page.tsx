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
import { Users, FileSpreadsheet, PlusCircle, Sparkles } from 'lucide-react';

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

  const handleDeleteLead = async (leadId: string) => {
    await CrmService.deleteLead(leadId, currentUser);
    loadLeads();
  };

  if (isLoading) return null;

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-800">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Lead Intake & Pipeline Management"
          subtitle="Manage digital ad leads, Excel bulk imports, lifecycle progression, and non-conversion reasons"
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

        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Quick Header Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl luxury-card border border-slate-200 shadow-xs">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 font-['Outfit']">
                <Users className="w-5 h-5 text-amber-600" />
                {role === 'telecaller' ? 'My Assigned Leads' : 'All Developer Leads Portfolio'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Total {leads.length} leads in current portfolio
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsBulkImportOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-emerald-700 transition shadow-xs"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Bulk Import (CSV / Excel)</span>
              </button>
              <button
                onClick={() => {
                  setActiveLead(null);
                  setIsManualLeadOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl gold-gradient-bg text-white font-bold text-xs shadow-md transition"
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
            onDeleteLead={handleDeleteLead}
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
