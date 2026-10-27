'use client';

import React, { useState } from 'react';
import { CrmDocument, DocumentCategory, Lead, UserProfile } from '@/types/crm';
import { CrmService } from '@/lib/crmService';
import {
  FileUp,
  X,
  FileText,
  Upload,
  CheckCircle2,
  Building2,
  User,
} from 'lucide-react';

interface UploadDocModalProps {
  isOpen: boolean;
  onClose: () => void;
  leads: Lead[];
  currentUser: UserProfile;
  onUploaded: () => void;
}

export function UploadDocModal({
  isOpen,
  onClose,
  leads,
  currentUser,
  onUploaded,
}: UploadDocModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('brochure');
  const [isCompanyDoc, setIsCompanyDoc] = useState(true);
  const [leadId, setLeadId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      if (!title) {
        setTitle(selected.name);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      alert('Please enter document title');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedLead = leads.find((l) => l.id === leadId);
      const ext = file?.name.split('.').pop()?.toLowerCase();
      let fileType: any = 'pdf';
      if (ext === 'xlsx' || ext === 'xls') fileType = 'excel';
      else if (ext === 'jpg' || ext === 'jpeg' || ext === 'png') fileType = 'image';
      else if (ext === 'docx' || ext === 'doc') fileType = 'docx';

      await CrmService.uploadDocument(
        {
          title,
          description,
          category,
          is_company_document: isCompanyDoc,
          lead_id: isCompanyDoc ? undefined : leadId || undefined,
          lead_name: isCompanyDoc ? undefined : selectedLead?.name,
          file_type: fileType,
          file_size_kb: file ? Math.round(file.size / 1024) : 1850,
          file_url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1200&auto=format&fit=crop&q=80',
        },
        currentUser
      );

      setIsSubmitting(false);
      onUploaded();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Upload failed');
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
              <FileUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-['Outfit']">Upload Real Estate Document</h3>
              <p className="text-xs text-slate-500">
                Brochures, Booking Applications, Cost Sheets, or KYC
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

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* File Picker */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Select File</label>
            <label className="border border-dashed border-slate-200 hover:border-amber-400 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-amber-50/20 text-center transition">
              <input type="file" onChange={handleFileSelect} className="hidden" />
              <Upload className="w-6 h-6 text-amber-600 mb-1" />
              <p className="font-semibold text-slate-800">
                {file ? file.name : 'Choose PDF, Excel, Word, or Image'}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {file ? `${Math.round(file.size / 1024)} KB` : 'Maximum file size: 25 MB'}
              </p>
            </label>
          </div>

          {/* Title */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Document Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Red Hill Heights - 3BHK Cost Sheet & Price Matrix"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:border-amber-500 focus:outline-none capitalize"
              >
                <option value="brochure">Project Brochure</option>
                <option value="booking_form">Booking Application Form</option>
                <option value="cost_sheet">Cost Sheet / Pricing</option>
                <option value="floor_plan">Floor Plan & Master Layout</option>
                <option value="kyc">Client KYC / Identity</option>
                <option value="receipt">Payment Receipt / Token</option>
                <option value="other">Other Official Document</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Scope</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsCompanyDoc(true)}
                  className={`flex-1 p-2 rounded-lg border text-center transition ${
                    isCompanyDoc
                      ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-600'
                  }`}
                >
                  General Company
                </button>
                <button
                  type="button"
                  onClick={() => setIsCompanyDoc(false)}
                  className={`flex-1 p-2 rounded-lg border text-center transition ${
                    !isCompanyDoc
                      ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-600'
                  }`}
                >
                  Link to Lead
                </button>
              </div>
            </div>
          </div>

          {/* Link to Lead if not company doc */}
          {!isCompanyDoc && (
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Attach to Lead / Customer
              </label>
              <select
                value={leadId}
                onChange={(e) => setLeadId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:border-amber-500 focus:outline-none"
              >
                <option value="">-- Choose Lead --</option>
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.phone}) • {l.project_interested}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Description / Notes</label>
            <textarea
              rows={2}
              placeholder="e.g. Official RERA certified brochure with specifications approved for HSR Layout project..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:border-amber-500 focus:outline-none resize-none"
            ></textarea>
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
              {isSubmitting ? 'Uploading...' : 'Upload Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
