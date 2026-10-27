'use client';

import React from 'react';
import { SiteVisit, SiteVisitStatus } from '@/types/crm';
import { CrmService } from '@/lib/crmService';
import {
  X,
  Calendar,
  Clock,
  Car,
  User,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Building2,
  Navigation,
  Users,
  FileText,
} from 'lucide-react';

interface VisitDetailDrawerProps {
  visit: SiteVisit | null;
  onClose: () => void;
  onUpdated: () => void;
}

export function VisitDetailDrawer({ visit, onClose, onUpdated }: VisitDetailDrawerProps) {
  if (!visit) return null;

  const dateObj = new Date(visit.scheduled_date);
  const formattedDate = dateObj.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = dateObj.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleStatusChange = async (newStatus: SiteVisitStatus) => {
    try {
      await CrmService.updateSiteVisit(visit.id, { status: newStatus });
      onUpdated();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to update site visit status');
    }
  };

  const getStatusBadge = (status: SiteVisitStatus) => {
    switch (status) {
      case 'completed':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500',
          label: 'Completed',
        };
      case 'in_progress':
        return {
          bg: 'bg-purple-50 text-purple-800 border-purple-200',
          dot: 'bg-purple-500',
          label: 'In Progress / On Road',
        };
      case 'cancelled':
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          dot: 'bg-rose-500',
          label: 'Cancelled',
        };
      case 'scheduled':
      default:
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
          label: 'Blocked & Scheduled',
        };
    }
  };

  const statusBadge = getStatusBadge(visit.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-start justify-between bg-slate-50/80">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${statusBadge.bg}`}
              >
                <span className={`w-2 h-2 rounded-full ${statusBadge.dot}`}></span>
                {statusBadge.label}
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                SLOT ID: {visit.id.substring(0, 8)}
              </span>
            </div>
            <h3 className="text-xl font-black text-slate-900 font-['Outfit']">
              {visit.lead_name || 'Prospect Client Visit'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Site visit booked for {visit.project_name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs text-slate-700">
          {/* Time & Project Banner */}
          <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gold-gradient-bg text-white flex items-center justify-center shadow-xs">
                <Clock className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <p className="font-extrabold text-sm text-slate-900 font-['Outfit']">
                  {formattedTime} (2-Hour Block)
                </p>
                <p className="text-xs text-slate-600">{formattedDate}</p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider font-['Space_Grotesk']">
                Development
              </span>
              <span className="font-bold text-amber-900 text-xs">{visit.project_name}</span>
            </div>
          </div>

          {/* Client Details */}
          <div className="p-4 rounded-xl border border-slate-200 space-y-2 bg-slate-50/50">
            <h4 className="font-extrabold text-slate-900 uppercase tracking-widest text-[10px] font-['Space_Grotesk'] flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-amber-600" />
              Client Prospect Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-slate-400 text-[11px]">Client Name:</span>
                <p className="font-bold text-slate-900">{visit.lead_name || 'N/A'}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Contact Number:</span>
                <p className="font-mono font-semibold text-slate-900 flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-emerald-600" />
                  <a href={`tel:${visit.lead_phone}`} className="hover:underline text-emerald-700">
                    {visit.lead_phone || '+91 98450 00000'}
                  </a>
                </p>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Party Size:</span>
                <p className="font-semibold text-slate-800 flex items-center gap-1">
                  <Users className="w-3 h-3 text-slate-500" />
                  {visit.party_size || 2} Persons
                </p>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Sales Escort Assigned:</span>
                <p className="font-semibold text-slate-800">
                  {visit.escort_name || 'Dedicated RM'}
                </p>
              </div>
            </div>
          </div>

          {/* Fleet & Logistics Dispatch */}
          <div className="p-4 rounded-xl border border-slate-200 space-y-2 bg-slate-50/50">
            <h4 className="font-extrabold text-slate-900 uppercase tracking-widest text-[10px] font-['Space_Grotesk'] flex items-center gap-2">
              <Car className="w-3.5 h-3.5 text-blue-600" />
              Fleet & Chauffeur Logistics
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-slate-400 text-[11px]">Assigned Vehicle:</span>
                <p className="font-bold text-slate-900">{visit.vehicle_type || 'Innova Crysta (AC)'}</p>
                <span className="text-[10px] font-mono text-slate-500">
                  Reg: {visit.vehicle_number || 'KA-01-MJ-4589'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Driver / Chauffeur:</span>
                <p className="font-semibold text-slate-900">{visit.driver_name || 'Ramesh Gowda'}</p>
                <a
                  href={`tel:${visit.driver_phone}`}
                  className="text-[11px] font-mono text-blue-700 hover:underline flex items-center gap-1"
                >
                  <Phone className="w-3 h-3" />
                  {visit.driver_phone || '+91 98450 12345'}
                </a>
              </div>
            </div>
          </div>

          {/* Pickup Location & Notes */}
          <div className="p-4 rounded-xl border border-slate-200 space-y-2 bg-slate-50/50">
            <h4 className="font-extrabold text-slate-900 uppercase tracking-widest text-[10px] font-['Space_Grotesk'] flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              Pickup Location & Route
            </h4>
            <p className="font-medium text-slate-800 text-xs">
              {visit.pickup_location || 'Customer Residence / Office'}
            </p>
            {visit.visit_notes && (
              <div className="mt-2 pt-2 border-t border-slate-200 text-slate-600">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Instructions / Notes:
                </span>
                <p className="text-xs italic bg-white p-2.5 rounded-lg border border-slate-200">
                  &ldquo;{visit.visit_notes}&rdquo;
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/90 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            {visit.status !== 'completed' && (
              <button
                type="button"
                onClick={() => handleStatusChange('completed')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
              >
                <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Mark Completed</span>
              </button>
            )}

            {visit.status === 'scheduled' && (
              <button
                type="button"
                onClick={() => handleStatusChange('in_progress')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition"
              >
                <Navigation className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Start Trip (In Progress)</span>
              </button>
            )}

            {visit.status !== 'cancelled' && (
              <button
                type="button"
                onClick={() => handleStatusChange('cancelled')}
                className="px-3 py-2 rounded-xl bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 font-semibold text-xs transition"
              >
                Cancel Visit
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
