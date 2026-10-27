'use client';

import React, { useState, useEffect } from 'react';
import { Lead, SiteVisit, UserProfile, SiteVisitStatus } from '@/types/crm';
import { CrmService } from '@/lib/crmService';
import {
  CalendarPlus,
  Car,
  Clock,
  MapPin,
  UserCheck,
  X,
  Phone,
  Building2,
} from 'lucide-react';

interface ScheduleVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  leads: Lead[];
  selectedLead?: Lead | null;
  currentUser: UserProfile;
  telecallers: UserProfile[];
  onScheduled: () => void;
}

const VEHICLES = [
  { type: 'Innova Crysta (AC)', number: 'KA-01-MJ-4589', driver: 'Ramesh Gowda', phone: '+91 98450 12345' },
  { type: 'Honda City (Executive)', number: 'KA-05-AB-7744', driver: 'Manjunath Swamy', phone: '+91 97410 88990' },
  { type: 'Ertiga (AC 7-Seater)', number: 'KA-51-EX-1290', driver: 'Suresh Kumar', phone: '+91 96200 44332' },
  { type: 'Self / Client Personal Vehicle', number: 'Client Car', driver: 'Client Driving', phone: 'N/A' },
];

export function ScheduleVisitModal({
  isOpen,
  onClose,
  leads,
  selectedLead,
  currentUser,
  telecallers,
  onScheduled,
}: ScheduleVisitModalProps) {
  const [leadId, setLeadId] = useState('');
  const [projectName, setProjectName] = useState('Red Hill Heights (HSR)');
  const [scheduledDate, setScheduledDate] = useState('');
  const [vehiclePreset, setVehiclePreset] = useState(0);
  const [vehicleType, setVehicleType] = useState(VEHICLES[0].type);
  const [vehicleNumber, setVehicleNumber] = useState(VEHICLES[0].number);
  const [driverName, setDriverName] = useState(VEHICLES[0].driver);
  const [driverPhone, setDriverPhone] = useState(VEHICLES[0].phone);
  const [escortId, setEscortId] = useState(currentUser.id);
  const [pickupLocation, setPickupLocation] = useState('HSR Layout Sector 1, BDA Complex');
  const [partySize, setPartySize] = useState(2);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedLead) {
      setLeadId(selectedLead.id);
      setProjectName(selectedLead.project_interested || 'Red Hill Heights (HSR)');
    } else if (leads.length > 0 && !leadId) {
      setLeadId(leads[0].id);
      setProjectName(leads[0].project_interested || 'Red Hill Heights (HSR)');
    }
    // Default scheduled time to tomorrow 11:00 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(11, 0, 0, 0);
    setScheduledDate(tomorrow.toISOString().slice(0, 16));
  }, [selectedLead, leads, leadId]);

  if (!isOpen) return null;

  const currentLead = leads.find((l) => l.id === leadId);

  const handleVehiclePresetChange = (idx: number) => {
    setVehiclePreset(idx);
    const chosen = VEHICLES[idx];
    setVehicleType(chosen.type);
    setVehicleNumber(chosen.number);
    setDriverName(chosen.driver);
    setDriverPhone(chosen.phone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadId) {
      alert('Please select a client');
      return;
    }
    if (!scheduledDate) {
      alert('Please select a date and time');
      return;
    }

    setIsSubmitting(true);
    try {
      const escortObj = telecallers.find((t) => t.id === escortId);
      await CrmService.scheduleSiteVisit(
        {
          lead_id: leadId,
          lead_name: currentLead?.name || 'Client',
          lead_phone: currentLead?.phone || '',
          project_name: projectName,
          scheduled_date: new Date(scheduledDate).toISOString(),
          status: 'scheduled',
          vehicle_type: vehicleType,
          vehicle_number: vehicleNumber,
          driver_name: driverName,
          driver_phone: driverPhone,
          escort_id: escortId,
          escort_name: escortObj?.full_name || currentUser.full_name,
          pickup_location: pickupLocation,
          party_size: partySize,
          visit_notes: notes,
        },
        currentUser
      );

      // Automatically update lead status to Site Visit Scheduled
      await CrmService.updateLead(leadId, { status: 'site_visit_scheduled' }, currentUser);

      setIsSubmitting(false);
      onScheduled();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to schedule site visit');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200 shadow-xs">
              <CalendarPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-['Outfit']">Book Site Visit Logistics</h3>
              <p className="text-xs text-slate-500">
                Arrange luxury transport, driver, and site relationship escort
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
          {/* Row 1: Lead & Project */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Client / Lead <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={leadId}
                onChange={(e) => {
                  setLeadId(e.target.value);
                  const matched = leads.find((l) => l.id === e.target.value);
                  if (matched) setProjectName(matched.project_interested);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:border-amber-500 focus:outline-none"
              >
                <option value="">-- Choose Client --</option>
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.phone}) • {l.budget}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Project Site</label>
              <select
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:border-amber-500 focus:outline-none"
              >
                <option value="Red Hill Heights (HSR)">Red Hill Heights (HSR)</option>
                <option value="Red Hill Meadows (Sarjapur-HSR)">Red Hill Meadows (Sarjapur-HSR)</option>
                <option value="Red Hill Serenity">Red Hill Serenity</option>
                <option value="Red Hill Commercial ORR">Red Hill Commercial ORR</option>
              </select>
            </div>
          </div>

          {/* Row 2: Date & Pickup */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Visit Date & Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Party Size (Guests)</label>
              <input
                type="number"
                min={1}
                max={8}
                value={partySize}
                onChange={(e) => setPartySize(parseInt(e.target.value) || 2)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Pickup Address */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Client Pickup Location / Landmark <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Koramangala 4th Block, Wipro Park or HSR Sector 2"
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Vehicle Assignment Section */}
          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Car className="w-4 h-4 text-blue-600" />
                Company Vehicle & Driver Assignment
              </span>
              <span className="text-[10px] text-slate-500 font-medium">Fleet available in HSR</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {VEHICLES.map((v, i) => (
                <button
                  type="button"
                  key={v.type}
                  onClick={() => handleVehiclePresetChange(i)}
                  className={`p-2 rounded-lg border text-left transition ${
                    vehiclePreset === i
                      ? 'border-blue-500 bg-blue-50 text-blue-900 font-bold shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <p className="text-xs truncate">{v.type}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{v.number}</p>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1 text-[11px] text-slate-700">
              <div>
                <span className="text-slate-400">Driver:</span> <strong className="text-slate-800">{driverName}</strong>
              </div>
              <div>
                <span className="text-slate-400">Driver Phone:</span> <span className="font-mono text-slate-600">{driverPhone}</span>
              </div>
            </div>
          </div>

          {/* Escort Assignment */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Sales Escort / Relationship Manager <span className="text-rose-500">*</span>
            </label>
            <select
              value={escortId}
              onChange={(e) => setEscortId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:border-amber-500 focus:outline-none"
            >
              {telecallers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.full_name} ({t.role} • {t.department})
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Special Instructions / Units to Showcase
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Showcase sample flat 402, clubhouse rooftop deck, and explain 10:90 payment plan..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md transition disabled:opacity-50"
            >
              {isSubmitting ? 'Booking...' : 'Confirm Site Visit Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
