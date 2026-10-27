'use client';

import React, { useState } from 'react';
import { parseExcelFile, downloadSampleLeadTemplate, downloadSampleLeadCSV, ParsedExcelResult } from '@/lib/excelHelper';
import { Lead, LeadStatus, UserProfile } from '@/types/crm';
import { CrmService } from '@/lib/crmService';

function normalizeLeadStatus(raw?: any): LeadStatus {
  if (!raw) return 'new';
  const s = String(raw).toLowerCase().trim().replace(/[\s-]+/g, '_');
  if (['new', 'fresh', 'uncontacted', 'open'].includes(s)) return 'new';
  if (['contacted', 'called', 'connected', 'in_progress', 'progress'].includes(s)) return 'contacted';
  if (['interested', 'qualified', 'warm', 'hot'].includes(s)) return 'interested';
  if (['site_visit_scheduled', 'visit_scheduled', 'site_visit', 'visit'].includes(s)) return 'site_visit_scheduled';
  if (['converted', 'booked', 'closed', 'won', 'token_paid', 'token_advances_paid'].includes(s)) return 'converted';
  if (['not_interested', 'lost', 'rejected', 'dropped', 'dead'].includes(s)) return 'not_interested';
  return 'new';
}
import {
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  FileCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onImportSuccess: () => void;
}

export function BulkImportModal({
  isOpen,
  onClose,
  currentUser,
  onImportSuccess,
}: BulkImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedExcelResult | null>(null);
  const [columnMapping, setColumnMapping] = useState<{
    name: string;
    phone: string;
    email: string;
    source: string;
    campaign: string;
    project: string;
    budget: string;
    status: string;
    notes: string;
    date: string;
  }>({
    name: '',
    phone: '',
    email: '',
    source: '',
    campaign: '',
    project: '',
    budget: '',
    status: '',
    notes: '',
    date: '',
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview'>('upload');
  const [importSummary, setImportSummary] = useState<{ count: number; errors: string[] } | null>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      try {
        const result = await parseExcelFile(selectedFile);
        setParsedData(result);

        const headers = result.headers;
        const autoMap = {
          name: headers.find((h) => /name|full_name|client|customer|prospect|lead/i.test(h)) || headers[0] || '',
          phone: headers.find((h) => /phone|mobile|contact|cell|number|tel/i.test(h)) || headers[1] || '',
          email: headers.find((h) => /email|mail/i.test(h)) || '',
          source: headers.find((h) => /source|channel|utm_source|ad_channel|platform/i.test(h)) || '',
          campaign: headers.find((h) => /campaign|utm_campaign|ad_name|ad/i.test(h)) || '',
          project: headers.find((h) => /project|property|interested|development/i.test(h)) || '',
          budget: headers.find((h) => /budget|ticket|price|range/i.test(h)) || '',
          status: headers.find((h) => /status|stage|disposition/i.test(h)) || '',
          notes: headers.find((h) => /notes|remarks|comment|requirement|feedback/i.test(h)) || '',
          date: headers.find((h) => /date|time|created|inquiry/i.test(h)) || '',
        };

        setColumnMapping(autoMap);
        setStep('mapping');
      } catch (err: any) {
        alert(err.message || 'Failed to read file');
      }
    }
  };

  const handleExecuteImport = async () => {
    if (!parsedData) return;
    setIsProcessing(true);

    try {
      const formattedLeads: Partial<Lead>[] = parsedData.rows.map((row) => ({
        name: row[columnMapping.name] || 'Inbound Lead',
        phone: row[columnMapping.phone] || '',
        email: row[columnMapping.email] || '',
        source: row[columnMapping.source] || (file?.name.endsWith('.csv') ? 'CSV Import' : 'Excel Import'),
        campaign_name: row[columnMapping.campaign] || 'Bulk_Import',
        project_interested: row[columnMapping.project] || 'Red Hill Heights (HSR)',
        budget: row[columnMapping.budget] || '1.5 Cr - 2.5 Cr',
        status: normalizeLeadStatus(row[columnMapping.status]),
        notes: row[columnMapping.notes] || 'Imported via lead sheet batch',
        created_at: row[columnMapping.date] || new Date().toISOString(),
      }));

      const res = await CrmService.bulkImportLeads(formattedLeads, currentUser);
      setImportSummary({ count: res.successCount, errors: res.errors });
      setIsProcessing(false);
      onImportSuccess();
    } catch (err: any) {
      alert(err.message || 'Import failed');
      setIsProcessing(false);
    }
  };

  const resetAll = () => {
    setFile(null);
    setParsedData(null);
    setStep('upload');
    setImportSummary(null);
    onImportSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 font-['Outfit']">
                Bulk Digital Lead Intake (SheetJS)
              </h3>
              <p className="text-xs text-slate-500">
                Import inbound lead sheets from Meta Ads, Google Ads, or Real Estate Portals
              </p>
            </div>
          </div>
          <button
            onClick={resetAll}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {importSummary ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-200 shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-extrabold text-slate-900 font-['Outfit']">Import Complete!</h4>
              <p className="text-sm text-slate-600">
                Successfully ingested{' '}
                <span className="font-extrabold text-emerald-700 font-mono">{importSummary.count} leads</span> into
                the Red Hill Infra CRM.
              </p>

              {importSummary.errors.length > 0 && (
                <div className="mt-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-left text-xs text-amber-900 max-h-32 overflow-y-auto font-mono">
                  <p className="font-bold mb-1">Warnings ({importSummary.errors.length}):</p>
                  <ul className="list-disc pl-4 space-y-1">
                    {importSummary.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={resetAll}
                className="mt-4 px-6 py-2.5 rounded-xl gold-gradient-bg text-white font-extrabold text-sm shadow-md"
              >
                Done & View Leads
              </button>
            </div>
          ) : step === 'upload' ? (
            <div className="space-y-6">
              {/* Template Download Card */}
              <div className="flex items-center justify-between p-4.5 rounded-2xl bg-amber-50/60 border border-amber-200 shadow-xs">
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-amber-900 font-['Outfit']">
                      Need a sample file to test immediately?
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Download our pre-configured CSV or Excel template with sample leads
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={downloadSampleLeadCSV}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition"
                  >
                    Sample (.csv)
                  </button>
                  <button
                    type="button"
                    onClick={downloadSampleLeadTemplate}
                    className="px-3.5 py-1.5 rounded-xl gold-gradient-bg text-white font-bold text-xs shadow-xs transition"
                  >
                    Template (.xlsx)
                  </button>
                </div>
              </div>

              {/* Upload Zone */}
              <label className="border-2 border-dashed border-slate-200 hover:border-amber-400 rounded-2xl p-9 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-amber-50/20 transition group">
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-14 h-14 rounded-2xl bg-white group-hover:bg-amber-50 text-slate-400 group-hover:text-amber-600 flex items-center justify-center mb-3 transition border border-slate-200 shadow-xs">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-extrabold text-slate-800 font-['Outfit']">
                  Click to select Excel spreadsheet or drag and drop
                </p>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  Supports .xlsx, .xls, and .csv formats
                </p>
              </label>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                <span className="flex items-center gap-2 font-medium">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  File: <strong className="text-slate-900">{file?.name}</strong>
                </span>
                <span className="text-amber-700 font-bold font-mono">
                  {parsedData?.rows.length} rows detected
                </span>
              </div>

              <div>
                <h4 className="text-xs font-black text-slate-600 uppercase tracking-widest mb-1.5 font-['Space_Grotesk']">
                  Map Excel Headers to CRM Fields
                </h4>
                <p className="text-[11px] text-slate-500 mb-4">
                  Match the column names from your ad agency or portal export:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  <div className="space-y-1">
                    <label className="text-slate-700 font-medium">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={columnMapping.name}
                      onChange={(e) => setColumnMapping({ ...columnMapping, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none"
                    >
                      <option value="">-- Select Header --</option>
                      {parsedData?.headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 font-medium">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={columnMapping.phone}
                      onChange={(e) => setColumnMapping({ ...columnMapping, phone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none"
                    >
                      <option value="">-- Select Header --</option>
                      {parsedData?.headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 font-medium">Email Address</label>
                    <select
                      value={columnMapping.email}
                      onChange={(e) => setColumnMapping({ ...columnMapping, email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none"
                    >
                      <option value="">-- None / Skip --</option>
                      {parsedData?.headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 font-medium">Ad Channel / Source</label>
                    <select
                      value={columnMapping.source}
                      onChange={(e) => setColumnMapping({ ...columnMapping, source: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none"
                    >
                      <option value="">-- Default: Meta Ads --</option>
                      {parsedData?.headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 font-medium">Interested Development</label>
                    <select
                      value={columnMapping.project}
                      onChange={(e) => setColumnMapping({ ...columnMapping, project: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none"
                    >
                      <option value="">-- Default: Red Hill Heights --</option>
                      {parsedData?.headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 font-medium">Budget Ticket</label>
                    <select
                      value={columnMapping.budget}
                      onChange={(e) => setColumnMapping({ ...columnMapping, budget: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none"
                    >
                      <option value="">-- Default: 1 Cr - 1.5 Cr --</option>
                      {parsedData?.headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Sample preview table */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
                <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2 font-['Space_Grotesk']">
                  Mapped Records Preview (First 2):
                </p>
                <div className="overflow-x-auto text-[11px]">
                  <table className="w-full text-left">
                    <thead className="text-slate-500 border-b border-slate-200 font-mono">
                      <tr>
                        <th className="pb-1.5">Client Name</th>
                        <th className="pb-1.5">Phone Number</th>
                        <th className="pb-1.5">Ad Source</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {parsedData?.rows.slice(0, 2).map((r, i) => (
                        <tr key={i}>
                          <td className="py-2 font-bold text-slate-900 font-['Outfit']">
                            {r[columnMapping.name] || 'N/A'}
                          </td>
                          <td className="py-2 font-mono">{r[columnMapping.phone] || 'N/A'}</td>
                          <td className="py-2">{r[columnMapping.source] || 'Digital Ads'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {!importSummary && (
          <div className="p-5 border-t border-slate-200 flex items-center justify-between bg-slate-50/80">
            {step === 'mapping' ? (
              <button
                type="button"
                onClick={() => setStep('upload')}
                className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 text-xs font-semibold"
              >
                Back to Upload
              </button>
            ) : (
              <div></div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={resetAll}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>

              {step === 'mapping' && (
                <button
                  type="button"
                  disabled={!columnMapping.name || !columnMapping.phone || isProcessing}
                  onClick={handleExecuteImport}
                  className="px-5 py-2.5 rounded-xl gold-gradient-bg text-white font-black text-xs shadow-md disabled:opacity-50 flex items-center gap-2"
                >
                  {isProcessing ? 'Ingesting Leads...' : 'Import Lead Batch'}
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
