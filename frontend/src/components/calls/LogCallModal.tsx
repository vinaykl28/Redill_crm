'use client';

import React, { useState, useEffect } from 'react';
import { Lead, CallLog, CallOutcome, UserProfile, LeadStatus } from '@/types/crm';
import { CrmService } from '@/lib/crmService';
import {
  PhoneCall,
  Clock,
  Calendar,
  X,
  PhoneForwarded,
  CheckCircle2,
  FileText,
} from 'lucide-react';

interface LogCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  leads: Lead[];
  selectedLead?: Lead | null;
  currentUser: UserProfile;
  onCallLogged: () => void;
}

const OUTCOMES: { value: CallOutcome; label: string; desc: string }[] = [
  { value: 'connected', label: 'Connected', desc: 'Customer answered and spoke' },
  { value: 'interested', label: 'Interested', desc: 'Positive feedback, exploring units' },
  { value: 'site_visit_requested', label: 'Site Visit Requested', desc: 'Agreed for site visit' },
  { value: 'follow_up_scheduled', label: 'Follow-up Scheduled', desc: 'Busy, asked to call back' },
  { value: 'busy', label: 'Line Busy', desc: 'Call declined or line engaged' },
  { value: 'not_reachable', label: 'Not Reachable', desc: 'Switched off or no answer' },
  { value: 'disqualified', label: 'Disqualified', desc: 'Wrong number, no budget, junk' },
];

export function LogCallModal({
  isOpen,
  onClose,
  leads,
  selectedLead,
  currentUser,
  onCallLogged,
}: LogCallModalProps) {
  const [leadId, setLeadId] = useState('');
  const [outcome, setOutcome] = useState<CallOutcome>('connected');
  const [durationSec, setDurationSec] = useState(180);
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [updateLeadStatus, setUpdateLeadStatus] = useState<LeadStatus | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedLead) {
      setLeadId(selectedLead.id);
    } else if (leads.length > 0 && !leadId) {
      setLeadId(leads[0].id);
    }
  }, [selectedLead, leads, leadId]);

  if (!isOpen) return null;

  const currentLead = leads.find((l) => l.id === leadId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadId) {
      alert('Please select a lead');
      return;
    }
    if (!notes.trim()) {
      alert('Please provide brief call notes');
      return;
    }

    setIsSubmitting(true);
    try {
      await CrmService.logCall(
        {
          lead_id: leadId,
          lead_name: currentLead?.name || 'Lead',
          caller_id: currentUser.id,
          caller_name: currentUser.full_name,
          call_outcome: outcome,
          notes,
          duration_seconds: durationSec,
          follow_up_date: followUpDate ? new Date(followUpDate).toISOString() : undefined,
        },
        currentUser
      );

      // If user chose to update lead status from call outcome
      if (updateLeadStatus) {
        await CrmService.updateLead(leadId, { status: updateLeadStatus }, currentUser);
      } else if (outcome === 'site_visit_requested') {
        await CrmService.updateLead(leadId, { status: 'site_visit_scheduled' }, currentUser);
      } else if (outcome === 'interested' && currentLead?.status === 'new') {
        await CrmService.updateLead(leadId, { status: 'interested' }, currentUser);
      } else if (currentLead?.status === 'new') {
        await CrmService.updateLead(leadId, { status: 'contacted' }, currentUser);
      }

      setIsSubmitting(false);
      onCallLogged();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to log call');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200 shadow-xs">
              <PhoneForwarded className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-['Outfit']">Log Call Outcome</h3>
              <p className="text-xs text-slate-500">
                Record telecaller conversation notes and follow-up
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Lead Picker */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Select Lead / Client <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={leadId}
              onChange={(e) => setLeadId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:border-amber-500 focus:outline-none"
            >
              <option value="">-- Choose Lead --</option>
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.phone}) • {l.project_interested} • [{l.status}]
                </option>
              ))}
            </select>
          </div>

          {/* Outcome Grid */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1.5">
              Call Outcome <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {OUTCOMES.map((o) => (
                <button
                  type="button"
                  key={o.value}
                  onClick={() => setOutcome(o.value)}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    outcome === o.value
                      ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold shadow-xs'
                      : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <p className="font-semibold text-xs">{o.label}</p>
                  <p className="text-[10px] text-slate-500 line-clamp-1">{o.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Duration Presets */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Call Duration: <strong className="text-amber-700">{durationSec}s</strong> ({Math.floor(durationSec / 60)}m {durationSec % 60}s)
            </label>
            <div className="flex gap-2">
              {[30, 60, 180, 300, 600].map((sec) => (
                <button
                  type="button"
                  key={sec}
                  onClick={() => setDurationSec(sec)}
                  className={`px-3 py-1 rounded-lg border text-xs font-semibold ${
                    durationSec === sec
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {sec < 60 ? `${sec}s` : `${sec / 60}m`}
                </button>
              ))}
            </div>
          </div>

          {/* Discussion Notes */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Call Notes & Key Discussion <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="e.g. Client inquired about 3BHK high-rise unit. Budget is 1.8 Cr. Requested layout diagram and callback on Friday..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:border-amber-500 focus:outline-none resize-none"
            ></textarea>
          </div>

          {/* Follow-up Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Next Follow-up Reminder (Optional)
              </label>
              <input
                type="datetime-local"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Update Lead Status (Optional)
              </label>
              <select
                value={updateLeadStatus}
                onChange={(e) => setUpdateLeadStatus(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:border-amber-500 focus:outline-none capitalize"
              >
                <option value="">-- Keep Current Status --</option>
                <option value="contacted">Contacted</option>
                <option value="interested">Interested</option>
                <option value="site_visit_scheduled">Site Visit Scheduled</option>
                <option value="converted">Converted</option>
                <option value="not_interested">Not Interested</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg gold-gradient-bg text-white font-bold shadow-md hover:opacity-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving Call...' : 'Save Call Log'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
