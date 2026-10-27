'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Lead, SiteVisit, CallLog } from '@/types/crm';
import { CrmService } from '@/lib/crmService';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { MetricCards } from '@/components/dashboard/MetricCards';
import { ConversionFunnelChart } from '@/components/dashboard/ConversionFunnelChart';
import { NonConversionChart } from '@/components/dashboard/NonConversionChart';
import { SourcePerformanceChart } from '@/components/dashboard/SourcePerformanceChart';
import { ConversionTrendChart } from '@/components/dashboard/ConversionTrendChart';
import { LeadsTable } from '@/components/leads/LeadsTable';
import { BulkImportModal } from '@/components/leads/BulkImportModal';
import { ManualLeadModal } from '@/components/leads/ManualLeadModal';
import { LogCallModal } from '@/components/calls/LogCallModal';
import { ScheduleVisitModal } from '@/components/site-visits/ScheduleVisitModal';
import { LeadDetailModal } from '@/components/leads/LeadDetailModal';
import {
  Sparkles,
  ShieldCheck,
  Building2,
  CalendarDays,
  FileSpreadsheet,
  PlusCircle,
  PhoneCall,
  Flame,
  Layers,
} from 'lucide-react';

export default function DashboardPage() {
  const { currentUser, role, availableProfiles, isLoading } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [visits, setVisits] = useState<SiteVisit[]>([]);
  const [calls, setCalls] = useState<CallLog[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Modals state
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [isManualLeadOpen, setIsManualLeadOpen] = useState(false);
  const [isLogCallOpen, setIsLogCallOpen] = useState(false);
  const [isScheduleVisitOpen, setIsScheduleVisitOpen] = useState(false);
  const [isLeadDetailOpen, setIsLeadDetailOpen] = useState(false);

  const [activeLead, setActiveLead] = useState<Lead | null>(null);

  const loadAllData = useCallback(async () => {
    if (!currentUser) return;
    setIsDataLoading(true);
    try {
      const [leadsData, visitsData, callsData] = await Promise.all([
        CrmService.getLeads(currentUser),
        CrmService.getSiteVisits(currentUser),
        CrmService.getCalls(undefined, currentUser),
      ]);
      setLeads(leadsData);
      setVisits(visitsData);
      setCalls(callsData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsDataLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

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
    loadAllData();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center text-slate-600 text-sm">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="font-['Outfit'] font-semibold tracking-wide">
            Loading Red Hill Infra Luxury CRM...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-800">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
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

        <main className="flex-1 p-8 space-y-7 overflow-y-auto">
          {/* Metric KPI Cards */}
          <MetricCards leads={leads} visits={visits} calls={calls} />

          {/* Charts Row 1: Conversion Funnel & Non-Conversion Reasons */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ConversionFunnelChart leads={leads} />
            <NonConversionChart leads={leads} />
          </div>

          {/* Charts Row 2: Ad Channels & Conversion Trajectory */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SourcePerformanceChart leads={leads} />
            <ConversionTrendChart leads={leads} />
          </div>

          {/* Leads Table Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2 font-['Outfit']">
                  <Flame className="w-5 h-5 text-amber-600" />
                  Live Leads Pipeline
                </h3>
                <p className="text-xs text-slate-500">
                  {role === 'telecaller'
                    ? 'Your assigned leads portfolio'
                    : 'All company leads across Meta Ads, Google Ads, and Portals'}
                </p>
              </div>
            </div>

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
          </div>
        </main>
      </div>

      {/* Global CRM Modals */}
      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        currentUser={currentUser}
        onImportSuccess={loadAllData}
      />

      <ManualLeadModal
        isOpen={isManualLeadOpen}
        onClose={() => setIsManualLeadOpen(false)}
        currentUser={currentUser}
        initialLead={activeLead}
        telecallers={availableProfiles}
        onSaved={loadAllData}
      />

      <LogCallModal
        isOpen={isLogCallOpen}
        onClose={() => setIsLogCallOpen(false)}
        leads={leads}
        selectedLead={activeLead}
        currentUser={currentUser}
        onCallLogged={loadAllData}
      />

      <ScheduleVisitModal
        isOpen={isScheduleVisitOpen}
        onClose={() => setIsScheduleVisitOpen(false)}
        leads={leads}
        selectedLead={activeLead}
        currentUser={currentUser}
        telecallers={availableProfiles}
        onScheduled={loadAllData}
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
        onLeadUpdated={loadAllData}
      />
    </div>
  );
}
