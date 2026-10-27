'use client';

import React, { useState, useEffect } from 'react';
import { Lead, LeadStatus, NonConversionReason, UserProfile } from '@/types/crm';
import { CrmService } from '@/lib/crmService';
import { X, UserPlus, AlertCircle, Building2 } from 'lucide-react';

interface ManualLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  initialLead?: Lead | null;
  onSaved: () => void;
  telecallers: UserProfile[];
}

const SOURCES = [
  'Meta Ads',
  'Google Ads',
  'MagicBricks',
  '99acres',
  'Housing.com',
  'WhatsApp Ads',
  'Website',
  'Referral',
  'Walk-in',
];

const PROJECTS = [
  'Red Hill Heights (HSR)',
  'Red Hill Meadows (Sarjapur-HSR)',
  'Red Hill Serenity',
  'Red Hill Commercial ORR',
];

const BUDGETS = [
  '50L - 75L',
  '75L - 1 Cr',
  '1 Cr - 1.5 Cr',
  '1.5 Cr - 2.5 Cr',
  '2.5 Cr+',
];

const NON_CONVERSION_REASONS: NonConversionReason[] = [
  'Budget mismatch',
  'Location mismatch (wants outside HSR)',
  'Delayed plan (6+ months)',
  'Bought competitor property',
  'Loan eligibility rejected',
  'Non-responsive / Invalid number',
  'Looking for rental / commercial only',
  'Other',
];

export function ManualLeadModal({
  isOpen,
  onClose,
  currentUser,
  initialLead,
  onSaved,
  telecallers,
}: ManualLeadModalProps) {
  const [formData, setFormData] = useState<{
    name: string;
    phone: string;
    email: string;
    source: string;
    campaign_name: string;
    project_interested: string;
    budget: string;
    status: LeadStatus;
    non_conversion_reason: NonConversionReason | '';
    non_conversion_notes: string;
    notes: string;
    assigned_to: string;
  }>({
    name: '',
    phone: '',
    email: '',
    source: 'Meta Ads',
    campaign_name: 'Meta_HSR_Luxury_Apts_Q1',
    project_interested: 'Red Hill Heights (HSR)',
    budget: '1 Cr - 1.5 Cr',
    status: 'new',
    non_conversion_reason: '',
    non_conversion_notes: '',
    notes: '',
    assigned_to: currentUser.role === 'telecaller' ? currentUser.id : telecallers[0]?.id || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialLead) {
      setFormData({
        name: initialLead.name,
        phone: initialLead.phone,
        email: initialLead.email || '',
        source: initialLead.source,
        campaign_name: initialLead.campaign_name || '',
        project_interested: initialLead.project_interested,
        budget: initialLead.budget,
        status: initialLead.status,
        non_conversion_reason: initialLead.non_conversion_reason || '',
        non_conversion_notes: initialLead.non_conversion_notes || '',
        notes: initialLead.notes || '',
        assigned_to: initialLead.assigned_to || '',
      });
    } else {
      setFormData({
        name: '',
        phone: '',
        email: '',
        source: 'Meta Ads',
        campaign_name: 'Meta_HSR_Luxury_Apts_Q1',
        project_interested: 'Red Hill Heights (HSR)',
        budget: '1 Cr - 1.5 Cr',
        status: 'new',
        non_conversion_reason: '',
        non_conversion_notes: '',
        notes: '',
        assigned_to: currentUser.role === 'telecaller' ? currentUser.id : telecallers[0]?.id || '',
      });
    }
  }, [initialLead, isOpen, currentUser, telecallers]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert('Please fill in client name and phone number.');
      return;
    }

    if (formData.status === 'not_interested' && !formData.non_conversion_reason) {
      alert('Please select a reason for non-conversion.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (initialLead) {
        await CrmService.updateLead(
          initialLead.id,
          {
            ...formData,
            non_conversion_reason: formData.status === 'not_interested' ? (formData.non_conversion_reason as NonConversionReason) : null,
          },
          currentUser
        );
      } else {
        await CrmService.createLead(
          {
            ...formData,
            non_conversion_reason: formData.status === 'not_interested' ? (formData.non_conversion_reason as NonConversionReason) : null,
          },
          currentUser
        );
      }
      setIsSubmitting(false);
      onSaved();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to save lead');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gold-gradient-bg text-white flex items-center justify-center font-bold shadow-xs">
              <UserPlus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-['Outfit']">
                {initialLead ? 'Edit Lead Profile' : 'Add New Ad / Walk-in Lead'}
              </h3>
              <p className="text-xs text-slate-500">
                Red Hill Infra Sales & Telecaller Pipeline
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Row 1: Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Client Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Vikramaditya Hegde"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="e.g. +91 98860 12045"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Row 2: Email & Source */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Email Address</label>
              <input
                type="email"
                placeholder="e.g. vikram@techlead.io"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Lead Source</label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:border-amber-500 focus:outline-none"
              >
                {SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Project & Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Interested Project</label>
              <select
                value={formData.project_interested}
                onChange={(e) => setFormData({ ...formData, project_interested: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:border-amber-500 focus:outline-none"
              >
                {PROJECTS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Client Budget</label>
              <select
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:border-amber-500 focus:outline-none"
              >
                {BUDGETS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 4: Status & Telecaller Assignee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Current Lead Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as LeadStatus })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:border-amber-500 focus:outline-none capitalize"
              >
                <option value="new">New (Fresh Ad Lead)</option>
                <option value="contacted">Contacted</option>
                <option value="interested">Interested</option>
                <option value="site_visit_scheduled">Site Visit Scheduled</option>
                <option value="converted">Converted (Token Paid)</option>
                <option value="not_interested">Not Interested (Dropped)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Assigned Telecaller</label>
              <select
                disabled={currentUser.role === 'telecaller'}
                value={formData.assigned_to}
                onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:border-amber-500 focus:outline-none disabled:opacity-60"
              >
                {telecallers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.full_name} ({t.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Conditional Non-Conversion Section */}
          {formData.status === 'not_interested' && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-3">
              <div className="flex items-center gap-2 text-rose-700 font-semibold text-xs">
                <AlertCircle className="w-4 h-4" />
                <span>Non-Conversion Reason (Required for Dashboard Analytics)</span>
              </div>
              <div>
                <select
                  required
                  value={formData.non_conversion_reason}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      non_conversion_reason: e.target.value as NonConversionReason,
                    })
                  }
                  className="w-full bg-white border border-rose-300 rounded-lg p-2 text-slate-800 text-xs"
                >
                  <option value="">-- Select Non-Conversion Reason --</option>
                  {NON_CONVERSION_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Additional non-conversion notes / feedback from client"
                  value={formData.non_conversion_notes}
                  onChange={(e) => setFormData({ ...formData, non_conversion_notes: e.target.value })}
                  className="w-full bg-white border border-rose-200 rounded-lg p-2 text-slate-800 text-xs"
                />
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Telecaller Notes / Requirements</label>
            <textarea
              rows={3}
              placeholder="e.g. Inquired about floor 4, requires loan assistance from HDFC or SBI..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:border-amber-500 focus:outline-none resize-none"
            ></textarea>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg gold-gradient-bg text-white font-bold shadow-md hover:opacity-95 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : initialLead ? 'Save Changes' : 'Create Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
