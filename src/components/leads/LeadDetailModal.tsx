'use client';

import React, { useState, useEffect } from 'react';
import { Lead, CallLog, SiteVisit, CrmDocument, UserProfile, LeadStatus } from '@/types/crm';
import { CrmService } from '@/lib/crmService';
import {
  X,
  Phone,
  Mail,
  Building2,
  Calendar,
  Clock,
  Car,
  FileText,
  User,
  Plus,
  PhoneForwarded,
  CalendarPlus,
  AlertCircle,
  Tag,
  CheckCircle,
} from 'lucide-react';

interface LeadDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  currentUser: UserProfile;
  telecallers: UserProfile[];
  onOpenLogCall: (lead: Lead) => void;
  onOpenScheduleVisit: (lead: Lead) => void;
  onEditLead: (lead: Lead) => void;
  onLeadUpdated: () => void;
}

export function LeadDetailModal({
  isOpen,
  onClose,
  lead,
  currentUser,
  telecallers,
  onOpenLogCall,
  onOpenScheduleVisit,
  onEditLead,
  onLeadUpdated,
}: LeadDetailModalProps) {
  const [calls, setCalls] = useState<CallLog[]>([]);
  const [visits, setVisits] = useState<SiteVisit[]>([]);
  const [docs, setDocs] = useState<CrmDocument[]>([]);
  const [activeTab, setActiveTab] = useState<'timeline' | 'visits' | 'documents'>('timeline');

  useEffect(() => {
    if (lead) {
      CrmService.getCalls(lead.id, currentUser).then(setCalls);
      CrmService.getSiteVisits(currentUser).then((all) =>
        setVisits(all.filter((v) => v.lead_id === lead.id))
      );
      CrmService.getDocuments(lead.id, currentUser).then(setDocs);
    }
  }, [lead, currentUser]);

  if (!isOpen || !lead) return null;

  const assignedTelecaller = telecallers.find((t) => t.id === lead.assigned_to);

  const handleQuickStatusChange = async (newStatus: LeadStatus) => {
    if (newStatus === 'not_interested') {
      onEditLead(lead); // Open edit modal to specify reason
      return;
    }
    await CrmService.updateLead(lead.id, { status: newStatus }, currentUser);
    onLeadUpdated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/80 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl gold-gradient-bg text-white font-black text-xl flex items-center justify-center shadow-md">
              {lead.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900 tracking-tight font-['Outfit']">{lead.name}</h3>
                <span
                  className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                    lead.status === 'converted'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : lead.status === 'site_visit_scheduled'
                      ? 'bg-blue-50 text-blue-800 border-blue-200'
                      : lead.status === 'interested'
                      ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                      : lead.status === 'not_interested'
                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  {lead.status.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                <span className="flex items-center gap-1 text-slate-700 font-mono">
                  <Phone className="w-3.5 h-3.5 text-amber-600" />
                  {lead.phone}
                </span>
                {lead.email && (
                  <span className="flex items-center gap-1 text-slate-500">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {lead.email}
                  </span>
                )}
                <span className="text-slate-400">
                  Added: {new Date(lead.created_at).toLocaleDateString()}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEditLead(lead)}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 border border-slate-200 shadow-xs"
            >
              Edit Lead
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Bar */}
        <div className="px-6 py-3 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between text-xs flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Stage:</span>
            {(['new', 'contacted', 'interested', 'site_visit_scheduled', 'converted'] as LeadStatus[]).map(
              (st) => (
                <button
                  key={st}
                  onClick={() => handleQuickStatusChange(st)}
                  className={`px-2.5 py-1 rounded-lg capitalize font-medium transition ${
                    lead.status === st
                      ? 'gold-gradient-bg text-white font-bold shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {st.replace(/_/g, ' ')}
                </button>
              )
            )}
            <button
              onClick={() => handleQuickStatusChange('not_interested')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                lead.status === 'not_interested'
                  ? 'bg-rose-600 text-white font-bold'
                  : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200'
              }`}
            >
              Not Interested
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenLogCall(lead);
              }}
              className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold border border-amber-200 flex items-center gap-1.5 shadow-xs"
            >
              <PhoneForwarded className="w-3.5 h-3.5 text-amber-600" />
              <span>Log Call</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenScheduleVisit(lead);
              }}
              className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 font-semibold border border-blue-200 flex items-center gap-1.5 shadow-xs"
            >
              <CalendarPlus className="w-3.5 h-3.5 text-blue-600" />
              <span>Book Site Visit</span>
            </button>
          </div>
        </div>

        {/* Lead Key Attributes */}
        <div className="px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white border-b border-slate-200 text-xs">
          <div>
            <p className="text-slate-400 font-medium">Interested Project</p>
            <p className="text-slate-900 font-bold mt-0.5 font-['Outfit']">{lead.project_interested}</p>
          </div>
          <div>
            <p className="text-slate-400 font-medium">Budget Ticket</p>
            <p className="text-amber-700 font-bold mt-0.5 font-mono">{lead.budget}</p>
          </div>
          <div>
            <p className="text-slate-400 font-medium">Lead Source</p>
            <p className="text-slate-900 font-bold mt-0.5">{lead.source}</p>
          </div>
          <div>
            <p className="text-slate-400 font-medium">Assigned Telecaller</p>
            <p className="text-emerald-700 font-bold mt-0.5">
              {assignedTelecaller?.full_name || 'Unassigned'}
            </p>
          </div>
        </div>

        {/* Non-conversion Alert Banner if applicable */}
        {lead.status === 'not_interested' && lead.non_conversion_reason && (
          <div className="mx-6 my-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-rose-800">
                Non-Conversion Reason: {lead.non_conversion_reason}
              </p>
              {lead.non_conversion_notes && (
                <p className="text-rose-700 mt-0.5">{lead.non_conversion_notes}</p>
              )}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="px-6 border-b border-slate-200 flex gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-3 border-b-2 transition ${
              activeTab === 'timeline'
                ? 'border-amber-600 text-amber-800'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Call History & Notes ({calls.length})
          </button>
          <button
            onClick={() => setActiveTab('visits')}
            className={`py-3 border-b-2 transition ${
              activeTab === 'visits'
                ? 'border-amber-600 text-amber-800'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Site Visits & Logistics ({visits.length})
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`py-3 border-b-2 transition ${
              activeTab === 'documents'
                ? 'border-amber-600 text-amber-800'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Attached Documents ({docs.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              {lead.notes && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-slate-500 font-semibold mb-1">Telecaller Intake Notes:</p>
                  <p className="text-slate-800 leading-relaxed">{lead.notes}</p>
                </div>
              )}

              <h4 className="font-bold text-slate-600 uppercase tracking-wider text-[11px] font-['Space_Grotesk']">
                Call Logs History:
              </h4>

              {calls.length === 0 ? (
                <div className="text-center py-8 text-slate-400 border border-dashed border-slate-200 rounded-xl">
                  <Phone className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                  <p className="text-slate-600">No call logs recorded for this lead yet.</p>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenLogCall(lead);
                    }}
                    className="mt-2 text-amber-700 hover:underline font-semibold"
                  >
                    + Log First Call
                  </button>
                </div>
              ) : (
                <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 pl-8">
                  {calls.map((c) => (
                    <div
                      key={c.id}
                      className="relative p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 space-y-1"
                    >
                      <div className="absolute -left-7 top-4 w-3 h-3 rounded-full bg-amber-500 border-2 border-white shadow-xs"></div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 capitalize flex items-center gap-1.5">
                          Outcome: {c.call_outcome.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {new Date(c.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{c.notes}</p>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/50 mt-1">
                        <span>Caller: <strong className="text-slate-800">{c.caller_name || 'Telecaller'}</strong></span>
                        <span className="font-mono">Duration: {c.duration_seconds}s</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'visits' && (
            <div className="space-y-3">
              {visits.length === 0 ? (
                <div className="text-center py-8 text-slate-400 border border-dashed border-slate-200 rounded-xl">
                  <Car className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                  <p className="text-slate-600">No site visit booked yet.</p>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenScheduleVisit(lead);
                    }}
                    className="mt-2 text-blue-700 hover:underline font-semibold"
                  >
                    + Book Site Visit
                  </button>
                </div>
              ) : (
                visits.map((v) => (
                  <div
                    key={v.id}
                    className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-2 text-slate-700"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm font-['Outfit']">{v.project_name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-800 border border-blue-200 font-mono">
                        {v.status}
                      </span>
                    </div>
                    <p className="text-slate-700">
                      📅 Date: <strong>{new Date(v.scheduled_date).toLocaleString()}</strong>
                    </p>
                    <p className="text-slate-700">
                      🚗 Vehicle: <strong className="text-slate-800">{v.vehicle_type}</strong> ({v.vehicle_number}) • Driver: {v.driver_name} ({v.driver_phone})
                    </p>
                    <p className="text-slate-700">
                      📍 Pickup: {v.pickup_location} • Escort: <strong className="text-slate-900">{v.escort_name}</strong>
                    </p>
                    {v.feedback && (
                      <p className="text-emerald-900 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 leading-relaxed">
                        <strong>Client Feedback:</strong> {v.feedback}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-3">
              {docs.length === 0 ? (
                <div className="text-center py-8 text-slate-400 border border-dashed border-slate-200 rounded-xl">
                  <FileText className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                  <p className="text-slate-600">No documents uploaded for this client yet.</p>
                </div>
              ) : (
                docs.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{doc.title}</p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          {doc.category.toUpperCase()} • {doc.file_size_kb} KB
                        </p>
                      </div>
                    </div>
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-amber-800 font-semibold border border-slate-200 shadow-xs"
                    >
                      View / Download
                    </a>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
