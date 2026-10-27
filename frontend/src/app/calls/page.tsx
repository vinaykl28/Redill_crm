'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { CallLog, Lead } from '@/types/crm';
import { CrmService } from '@/lib/crmService';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { CallsListView } from '@/components/calls/CallsListView';
import { LogCallModal } from '@/components/calls/LogCallModal';
import { PhoneCall, PhoneForwarded } from 'lucide-react';

export default function CallsPage() {
  const { currentUser, availableProfiles, isLoading } = useAuth();
  const [calls, setCalls] = useState<CallLog[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLogCallOpen, setIsLogCallOpen] = useState(false);

  const loadData = useCallback(async () => {
    if (!currentUser) return;
    const [callsData, leadsData] = await Promise.all([
      CrmService.getCalls(undefined, currentUser),
      CrmService.getLeads(currentUser),
    ]);
    setCalls(callsData);
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
          title="Telecaller Call Logs"
          subtitle="Audit trail of conversations, customer requirements, follow-ups, and outcomes"
          onOpenLogCall={() => setIsLogCallOpen(true)}
        />

        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Summary Card */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl luxury-card border border-slate-200 shadow-xs">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 font-['Outfit']">
                <PhoneCall className="w-5 h-5 text-amber-600" />
                Telecalling Outreach Matrix
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Total {calls.length} logged interactions • Digital marketing response tracking
              </p>
            </div>

            <button
              onClick={() => setIsLogCallOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl gold-gradient-bg text-white font-bold text-xs shadow-md transition"
            >
              <PhoneForwarded className="w-4 h-4 stroke-[2.5]" />
              <span>Log New Call</span>
            </button>
          </div>

          <CallsListView
            calls={calls}
            currentUser={currentUser}
            telecallers={availableProfiles}
            onOpenLogCall={() => setIsLogCallOpen(true)}
          />
        </main>
      </div>

      <LogCallModal
        isOpen={isLogCallOpen}
        onClose={() => setIsLogCallOpen(false)}
        leads={leads}
        currentUser={currentUser}
        onCallLogged={loadData}
      />
    </div>
  );
}
