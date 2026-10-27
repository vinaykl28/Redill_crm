'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { CrmDocument, Lead } from '@/types/crm';
import { CrmService } from '@/lib/crmService';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { DocumentLibrary } from '@/components/documents/DocumentLibrary';
import { UploadDocModal } from '@/components/documents/UploadDocModal';
import { FileText, FileUp, Sparkles } from 'lucide-react';

export default function DocumentsPage() {
  const { currentUser, isLoading } = useAuth();
  const [documents, setDocuments] = useState<CrmDocument[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const loadData = useCallback(async () => {
    if (!currentUser) return;
    const [docsData, leadsData] = await Promise.all([
      CrmService.getDocuments(undefined, currentUser),
      CrmService.getLeads(currentUser),
    ]);
    setDocuments(docsData);
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
          title="Document Management & Collateral"
          subtitle="Brochures, Booking Application Forms, Cost Sheets, and Customer KYC files"
        />

        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Header Card */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl luxury-card border border-slate-200 shadow-xs">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 font-['Outfit']">
                <FileText className="w-5 h-5 text-amber-600" />
                Red Hill Infra Digital Collateral Repository
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Centralized cloud repository for marketing brochures, RERA certificates, and client booking documents
              </p>
            </div>

            <button
              onClick={() => setIsUploadOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl gold-gradient-bg text-white font-bold text-xs shadow-md transition"
            >
              <FileUp className="w-4 h-4 stroke-[2.5]" />
              <span>Upload Document</span>
            </button>
          </div>

          <DocumentLibrary
            documents={documents}
            currentUser={currentUser}
            onOpenUpload={() => setIsUploadOpen(true)}
            onDocumentsUpdated={loadData}
          />
        </main>
      </div>

      <UploadDocModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        leads={leads}
        currentUser={currentUser}
        onUploaded={loadData}
      />
    </div>
  );
}
