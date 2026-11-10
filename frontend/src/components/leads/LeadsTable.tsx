'use client';

import React, { useState, useMemo } from 'react';
import { Lead, LeadStatus, UserProfile } from '@/types/crm';
import { exportLeadsToExcel, exportLeadsToCSV } from '@/lib/excelHelper';
import {
  Search,
  Download,
  FileSpreadsheet,
  Phone,
  Calendar,
  Eye,
  AlertTriangle,
} from 'lucide-react';

interface LeadsTableProps {
  leads: Lead[];
  currentUser: UserProfile;
  telecallers: UserProfile[];
  onViewLead: (lead: Lead) => void;
  onEditLead: (lead: Lead) => void;
  onOpenLogCall: (lead: Lead) => void;
  onOpenScheduleVisit: (lead: Lead) => void;
}

export function LeadsTable({
  leads,
  currentUser,
  telecallers,
  onViewLead,
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
          label: 'CONVERTED',
          pill: 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]',
          dot: 'bg-[#059669]',
        };
      case 'site_visit_scheduled':
        return {
          label: 'SITE VISIT',
          pill: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]',
          dot: 'bg-[#1D4ED8]',
        };
      case 'interested':
        return {
          label: 'INTERESTED',
          pill: 'bg-[#F5F3FF] text-[#7C3AED] border-[#DDD6FE]',
          dot: 'bg-[#7C3AED]',
        };
      case 'contacted':
        return {
          label: 'CONTACTED',
          pill: 'bg-[#FEF7EC] text-[#D97706] border-[#FDE68A]',
          dot: 'bg-[#D97706]',
        };
      case 'not_interested':
        return {
          label: 'NOT INTERESTED',
          pill: 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]',
          dot: 'bg-[#DC2626]',
        };
      case 'new':
      default:
        return {
          label: 'NEW',
          pill: 'bg-[#F0F5FA] text-[#2563EB] border-[#DBEAFE]',
          dot: 'bg-[#2563EB]',
        };
    }
  };

  const getInitial = (name?: string) => {
    if (!name) return 'U';
    return name.trim().charAt(0).toUpperCase();
  };

  return (
    <div className="space-y-4 font-['Plus_Jakarta_Sans']">
      
      {/* Search & Filter Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search leads by client name, mobile, email, requirements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-[#EAE3D6] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#1C1917] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#B36B39] shadow-xs transition"
          />
        </div>

        {/* Filters and Exports */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-[#EAE3D6] rounded-xl px-3 py-2 text-xs text-[#374151] focus:outline-none shadow-xs cursor-pointer hover:border-[#D6CEC1]"
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
            className="bg-white border border-[#EAE3D6] rounded-xl px-3 py-2 text-xs text-[#374151] focus:outline-none shadow-xs cursor-pointer hover:border-[#D6CEC1]"
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
            className="bg-white border border-[#EAE3D6] rounded-xl px-3 py-2 text-xs text-[#374151] focus:outline-none shadow-xs cursor-pointer hover:border-[#D6CEC1]"
          >
            <option value="all">All Ad Channels</option>
            {uniqueSources.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <button
            onClick={() => exportLeadsToCSV(filteredLeads)}
            title="Download leads as CSV"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-[#FAF8F5] text-xs font-medium text-[#4B5563] border border-[#EAE3D6] transition shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#B36B39]" />
            <span>Download CSV ({filteredLeads.length})</span>
          </button>

          <button
            onClick={() => exportLeadsToExcel(filteredLeads)}
            title="Download leads as Excel (.xlsx)"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-[#FAF8F5] text-xs font-medium text-[#4B5563] border border-[#EAE3D6] transition shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* Leads Table Card */}
      <div className="bg-white rounded-2xl border border-[#EDE6DC] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] border-b border-[#EFEBE3] text-[#6B7280] font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-5">CLIENT PROSPECT</th>
                <th className="py-3.5 px-5">STATUS &amp; STAGE</th>
                <th className="py-3.5 px-5">FLAGSHIP PROJECT &amp; BUDGET</th>
                <th className="py-3.5 px-5">AD CHANNEL / CAMPAIGN</th>
                <th className="py-3.5 px-5">ASSIGNED TELECALLER</th>
                <th className="py-3.5 px-5 text-right">QUICK ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F2EB] text-[#1E242B]">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-[#78716C]">
                    <p className="text-sm font-bold text-[#1C1917] font-['Outfit']">
                      No matching leads found
                    </p>
                    <p className="text-xs text-[#9CA3AF] mt-1">
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
                      className="hover:bg-[#FAF8F5] transition duration-150 group cursor-pointer"
                      onClick={() => onViewLead(lead)}
                    >
                      {/* Client info */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#EAE6DF] text-[#44403C] font-semibold text-xs flex items-center justify-center shrink-0 font-['Outfit']">
                            {getInitial(lead.name)}
                          </div>
                          <div>
                            <div className="font-bold text-xs sm:text-sm text-[#1C1917] font-['Outfit']">
                              {lead.name}
                            </div>
                            <div className="text-[#6B7280] text-[11px] font-mono mt-0.5 flex items-center gap-1.5">
                              <Phone className="w-3 h-3 text-[#9CA3AF]" />
                              <span>{lead.phone}</span>
                            </div>
                            {lead.email && (
                              <div className="text-[#9CA3AF] text-[10px] truncate max-w-[170px]">
                                {lead.email}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${badge.pill}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                          <span>{badge.label}</span>
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
                      <td className="py-4 px-5">
                        <div className="font-bold text-xs sm:text-sm text-[#1C1917] truncate max-w-[200px] font-['Outfit']">
                          {lead.project_interested}
                        </div>
                        <div className="text-[#B36B39] text-xs font-semibold mt-0.5">
                          {lead.budget}
                        </div>
                      </td>

                      {/* Channel & Campaign */}
                      <td className="py-4 px-5">
                        <div className="font-semibold text-xs text-[#1C1917]">{lead.source}</div>
                        {lead.campaign_name && (
                          <div className="text-[10px] text-[#78716C] font-mono truncate max-w-[160px] mt-0.5">
                            {lead.campaign_name}
                          </div>
                        )}
                      </td>

                      {/* Telecaller & Sales Assignee */}
                      <td className="py-4 px-5">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-[#F5ECE1] text-[#78350F] text-[9px] font-bold flex items-center justify-center shrink-0 font-['Outfit']">
                              {getInitial(assigned?.full_name)}
                            </div>
                            <span className="font-medium text-xs text-[#1C1917] truncate max-w-[130px]">
                              {assigned?.full_name || 'Telecaller'}
                            </span>
                          </div>
                          {lead.assigned_sales_id && (
                            <div className="flex items-center gap-1 text-[10px] text-[#934F23] font-semibold bg-[#F7EBE1] px-2 py-0.5 rounded-md border border-[#E8D4C2] w-fit">
                              <span>
                                {currentUser.role === 'telecaller'
                                  ? 'Site Visit Assigned (Confidential)'
                                  : `Sales: ${telecallers.find((t) => t.id === lead.assigned_sales_id)?.full_name || 'Sales Exec'}`}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Quick Actions (NO DELETE BUTTON) */}
                      <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            title="Log Call"
                            onClick={() => onOpenLogCall(lead)}
                            className="p-2 rounded-xl bg-white hover:bg-[#FAF8F5] text-[#6B7280] hover:text-[#B36B39] border border-[#E5E0D8] transition shadow-xs cursor-pointer"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </button>

                          <button
                            title="Book Site Visit"
                            onClick={() => onOpenScheduleVisit(lead)}
                            className="p-2 rounded-xl bg-white hover:bg-[#FAF8F5] text-[#6B7280] hover:text-[#2563EB] border border-[#E5E0D8] transition shadow-xs cursor-pointer"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                          </button>

                          <button
                            title="View Full Profile"
                            onClick={() => onViewLead(lead)}
                            className="p-2 rounded-xl bg-white hover:bg-[#FAF8F5] text-[#6B7280] hover:text-[#1C1917] border border-[#E5E0D8] transition shadow-xs cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
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