'use client';

import React, { useState } from 'react';
import { CrmDocument, UserProfile } from '@/types/crm';
import { CrmService } from '@/lib/crmService';
import {
  FileText,
  Download,
  Trash2,
  Building2,
  User,
  FileSpreadsheet,
  FileImage,
  Plus,
  Sparkles,
} from 'lucide-react';

interface DocumentLibraryProps {
  documents: CrmDocument[];
  currentUser: UserProfile;
  onOpenUpload: () => void;
  onDocumentsUpdated: () => void;
}

export function DocumentLibrary({
  documents,
  currentUser,
  onOpenUpload,
  onDocumentsUpdated,
}: DocumentLibraryProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'company' | 'leads'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filtered = documents.filter((doc) => {
    const matchesTab =
      activeTab === 'all'
        ? true
        : activeTab === 'company'
        ? doc.is_company_document
        : !doc.is_company_document;

    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    return matchesTab && matchesCategory;
  });

  const handleDelete = async (docId: string, title: string) => {
    if (confirm(`Delete document "${title}"?`)) {
      await CrmService.deleteDocument(docId);
      onDocumentsUpdated();
    }
  };

  const getDocIcon = (type: string) => {
    switch (type) {
      case 'excel':
        return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
      case 'image':
        return <FileImage className="w-5 h-5 text-purple-600" />;
      case 'pdf':
      default:
        return <FileText className="w-5 h-5 text-amber-600" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <div className="luxury-card rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-lg transition ${
              activeTab === 'all'
                ? 'gold-gradient-bg text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Vault ({documents.length})
          </button>
          <button
            onClick={() => setActiveTab('company')}
            className={`px-3.5 py-1.5 rounded-lg transition ${
              activeTab === 'company'
                ? 'gold-gradient-bg text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Company Brochures & Forms
          </button>
          <button
            onClick={() => setActiveTab('leads')}
            className={`px-3.5 py-1.5 rounded-lg transition ${
              activeTab === 'leads'
                ? 'gold-gradient-bg text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Customer KYC & Tokens
          </button>
        </div>

        {/* Category Picker & Upload */}
        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-700 focus:outline-none capitalize shadow-xs"
          >
            <option value="all">All Categories</option>
            <option value="brochure">Brochures</option>
            <option value="booking_form">Booking Forms</option>
            <option value="cost_sheet">Cost Sheets</option>
            <option value="floor_plan">Floor Plans</option>
            <option value="kyc">KYC / Identity</option>
          </select>

          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl gold-gradient-bg text-white font-extrabold text-xs shadow-md transition"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Documents Grid */}
      {filtered.length === 0 ? (
        <div className="luxury-card rounded-2xl p-14 text-center text-slate-500">
          <FileText className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700 font-['Outfit']">No documents found</p>
          <p className="text-xs text-slate-400 mt-1">
            Upload project brochures, RERA certificates, or client booking forms.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((doc) => (
            <div
              key={doc.id}
              className="luxury-card luxury-card-hover rounded-2xl p-6 flex flex-col justify-between space-y-4 group"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                    {getDocIcon(doc.file_type)}
                  </div>
                  <span
                    className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border tracking-wider font-mono ${
                      doc.is_company_document
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-blue-50 text-blue-800 border-blue-200'
                    }`}
                  >
                    {doc.is_company_document ? 'Company Vault' : 'Client Linked'}
                  </span>
                </div>

                <div className="mt-4">
                  <h4 className="font-extrabold text-slate-900 text-base font-['Outfit'] group-hover:text-amber-700 transition line-clamp-1">
                    {doc.title}
                  </h4>
                  {doc.description && (
                    <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                      {doc.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-500">
                  <div className="flex items-center justify-between">
                    <span>Category:</span>
                    <strong className="text-slate-800 uppercase font-mono text-[10px]">
                      {doc.category.replace(/_/g, ' ')}
                    </strong>
                  </div>

                  {doc.lead_name && (
                    <div className="flex items-center justify-between text-blue-700">
                      <span>Attached to Client:</span>
                      <strong className="truncate max-w-[150px] font-semibold">{doc.lead_name}</strong>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-slate-400">
                    <span>Uploaded by:</span>
                    <span>{doc.uploaded_by_name || 'Admin'}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                <span className="text-[11px] font-mono text-slate-400">{doc.file_size_kb} KB</span>

                <div className="flex items-center gap-2">
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-amber-800 font-bold border border-slate-200 hover:border-amber-400 transition shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-600" />
                    <span>Download</span>
                  </a>

                  {currentUser.role === 'admin' && (
                    <button
                      onClick={() => handleDelete(doc.id, doc.title)}
                      className="p-2 rounded-xl bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-700 border border-slate-200 transition shadow-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
