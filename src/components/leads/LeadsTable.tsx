'use client';

import React, { useState, useMemo } from 'react';
import { Lead, LeadStatus, UserProfile } from '@/types/crm';
import { exportLeadsToExcel, exportLeadsToCSV } from '@/lib/excelHelper';
import {
  Search,
  Download,
  FileSpreadsheet,
  PhoneForwarded,
  CalendarPlus,
  Eye,
  Trash2,
  AlertTriangle,
  Building2,
  CheckCircle2,
  Phone,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

interface LeadsTableProps {
  leads: Lead[];
  currentUser: UserProfile;
  telecallers: UserProfile[];
  onViewLead: (lead: Lead) => void;
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (leadId: string) => void;
  onOpenLogCall: (lead: Lead) => void;
  onOpenScheduleVisit: (lead: Lead) => void;
}

export function LeadsTable({
  leads,
  currentUser,
  telecallers,
  onViewLead,
  onEditLead,
  onDeleteLead,
  onOpenLogCall,
  onOpenScheduleVisit,
}: LeadsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone.includes(searchTerm) ||
        (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (lead.notes && lead.notes.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      const matchesProject = projectFilter === 'all' || lead.project_interested === projectFilter;
      const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;

      return matchesSearch && matchesStatus && matchesProject && matchesSource;
    });
  }, [leads, searchTerm, statusFilter, projectFilter, sourceFilter]);

  const uniqueSources = Array.from(new Set(leads.map((l) => l.source))).filter(Boolean);
  const uniqueProjects = Array.from(new Set(leads.map((l) => l.project_interested))).filter(Boolean);

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'converted':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500',
        };
      case 'site_visit_scheduled':
        return {
          bg: 'bg-blue-50 text-blue-800 border-blue-200',
          dot: 'bg-blue-500',
        };
      case 'interested':
        return {
          bg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
          dot: 'bg-indigo-500',
        };
      case 'contacted':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
        };
      case 'not_interested':
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          dot: 'bg-rose-500',
        };
      case 'new':
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-500',
        };
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="luxury-card rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search leads by client name, mobile, email, requirements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50/70 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 shadow-xs"
          />
        </div>

        {/* Filter dropdowns */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none shadow-xs"
          >
            <option value="all">All Statuses ({leads.length})</option>
            <option value="new">New Inquiries</option>
            <option value="contacted">Contacted</option>
            <option value="interested">Interested</option>
            <option value="site_visit_scheduled">Site Visit Scheduled</option>
            <option value="converted">Converted Deals</option>
            <option value="not_interested">Not Interested</option>
          </select>

          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none shadow-xs"
          >
            <option value="all">All Developments</option>
            {uniqueProjects.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none shadow-xs"
          >
            <option value="all">All Ad Channels</option>
            {uniqueSources.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportLeadsToCSV(filteredLeads)}
              title="Download leads as CSV"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 border border-slate-200 transition shadow-xs hover:border-amber-400 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-600" />
              <span>Download CSV ({filteredLeads.length})</span>
            </button>

            <button
              onClick={() => exportLeadsToExcel(filteredLeads)}
              title="Download leads as Excel (.xlsx)"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 border border-slate-200 transition shadow-xs hover:border-emerald-400 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="luxury-card rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider text-[10px] font-['Space_Grotesk']">
              <tr>
                <th className="py-4 px-5">Client Prospect</th>
                <th className="py-4 px-5">Status & Stage</th>
                <th className="py-4 px-5">Flagship Project & Budget</th>
                <th className="py-4 px-5">Ad Channel / Campaign</th>
                <th className="py-4 px-5">Assigned Telecaller</th>
                <th className="py-4 px-5 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-slate-500">
                    <p className="text-sm font-bold text-slate-700 font-['Outfit']">
                      No matching leads found
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Try adjusting the search criteria or import leads via Excel.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const assigned = telecallers.find((t) => t.id === lead.assigned_to);
                  const badge = getStatusBadge(lead.status);
                  return (
                    <tr
                      key={lead.id}
                      className="hover:bg-amber-50/40 transition-colors group cursor-pointer"
                      onClick={() => onViewLead(lead)}
                    >
                      {/* Client info */}
                      <td className="py-3.5 px-5">
                        <div className="font-extrabold text-slate-900 text-sm group-hover:text-amber-700 transition font-['Outfit']">
                          {lead.name}
                        </div>
                        <div className="text-slate-500 text-[11px] font-mono mt-0.5 flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{lead.phone}</span>
                        </div>
                        {lead.email && (
                          <div className="text-slate-400 text-[10px] truncate max-w-[170px]">
                            {lead.email}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${badge.bg}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                          <span>{lead.status.replace(/_/g, ' ')}</span>
                        </span>

                        {lead.status === 'not_interested' && lead.non_conversion_reason && (
                          <div className="text-[10px] text-rose-700 mt-1 flex items-center gap-1 font-medium">
                            <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0" />
                            <span className="truncate max-w-[160px]">
                              {lead.non_conversion_reason}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Project & Budget */}
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-slate-800 truncate max-w-[180px] font-['Outfit']">
                          {lead.project_interested}
                        </div>
                        <div className="text-amber-700 text-xs font-semibold mt-0.5 font-mono">
                          {lead.budget}
                        </div>
                      </td>

                      {/* Channel */}
                      <td className="py-3.5 px-5">
                        <div className="font-semibold text-slate-800">{lead.source}</div>
                        {lead.campaign_name && (
                          <div className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]">
                            {lead.campaign_name}
                          </div>
                        )}
                      </td>

                      {/* Telecaller Assignee */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-[10px] font-bold text-amber-800">
                            {assigned?.full_name?.charAt(0) || 'T'}
                          </div>
                          <span className="font-medium text-slate-800 truncate max-w-[120px]">
                            {assigned?.full_name || 'Unassigned'}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            title="Log Call"
                            onClick={() => onOpenLogCall(lead)}
                            className="p-2 rounded-xl bg-slate-50 hover:bg-amber-50 text-slate-600 hover:text-amber-700 border border-slate-200 transition shadow-xs"
                          >
                            <PhoneForwarded className="w-3.5 h-3.5" />
                          </button>

                          <button
                            title="Book Site Visit"
                            onClick={() => onOpenScheduleVisit(lead)}
                            className="p-2 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-700 border border-slate-200 transition shadow-xs"
                          >
                            <CalendarPlus className="w-3.5 h-3.5" />
                          </button>

                          <button
                            title="View Full Profile"
                            onClick={() => onViewLead(lead)}
                            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition shadow-xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {currentUser.role === 'admin' && (
                            <button
                              title="Delete Lead"
                              onClick={() => {
                                if (confirm(`Delete lead "${lead.name}"?`)) {
                                  onDeleteLead(lead.id);
                                }
                              }}
                              className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 transition shadow-xs"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
