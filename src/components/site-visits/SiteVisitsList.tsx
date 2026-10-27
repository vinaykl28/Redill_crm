'use client';

import React, { useState } from 'react';
import { SiteVisit, SiteVisitStatus, UserProfile } from '@/types/crm';
import { CrmService } from '@/lib/crmService';
import {
  Calendar,
  Clock,
  Car,
  MapPin,
  UserCheck,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Building2,
  Phone,
  Users,
  Navigation,
} from 'lucide-react';

interface SiteVisitsListProps {
  visits: SiteVisit[];
  currentUser: UserProfile;
  onVisitUpdated: () => void;
}

export function SiteVisitsList({ visits, currentUser, onVisitUpdated }: SiteVisitsListProps) {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [feedbackModalId, setFeedbackModalId] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState('');

  const filtered = visits.filter(
    (v) => filterStatus === 'all' || v.status === filterStatus
  );

  const handleStatusChange = async (visitId: string, status: SiteVisitStatus) => {
    await CrmService.updateSiteVisit(visitId, { status });
    onVisitUpdated();
  };

  const handleSaveFeedback = async (visitId: string) => {
    if (!feedbackText.trim()) return;
    await CrmService.updateSiteVisit(visitId, {
      feedback: feedbackText,
      status: 'completed',
    });
    setFeedbackModalId(null);
    setFeedbackText('');
    onVisitUpdated();
  };

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-xl text-xs">
          {['all', 'scheduled', 'completed', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3.5 py-1.5 rounded-lg capitalize font-bold transition ${
                filterStatus === st
                  ? 'gold-gradient-bg text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st} {st === 'all' ? `(${visits.length})` : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Site Visit Cards */}
      {filtered.length === 0 ? (
        <div className="luxury-card rounded-2xl p-14 text-center text-slate-500">
          <Car className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700 font-['Outfit']">No site visits found</p>
          <p className="text-xs text-slate-400 mt-1">
            Book a site visit from any lead profile or using the action button.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((visit) => {
            const isCompleted = visit.status === 'completed';
            const isScheduled = visit.status === 'scheduled';
            return (
              <div
                key={visit.id}
                className="luxury-card luxury-card-hover rounded-2xl p-6 flex flex-col justify-between space-y-4 relative overflow-hidden"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 font-['Space_Grotesk']">
                        {visit.project_name}
                      </span>
                      <h4 className="text-base font-extrabold text-slate-900 mt-1 font-['Outfit']">
                        {visit.lead_name}
                      </h4>
                      {visit.lead_phone && (
                        <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5 font-mono">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {visit.lead_phone}
                        </p>
                      )}
                    </div>
                    <span
                      className={`text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-full border tracking-wider font-mono ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : isScheduled
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}
                    >
                      {visit.status}
                    </span>
                  </div>

                  {/* Visit Timing */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/90 text-xs space-y-2">
                    <div className="flex items-center gap-2 text-slate-800">
                      <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="font-bold">
                        {new Date(visit.scheduled_date).toLocaleString([], {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span className="text-slate-500 ml-auto font-mono text-[11px]">
                        ({visit.party_size} Guests)
                      </span>
                    </div>

                    <div className="flex items-start gap-2 text-slate-600 pt-1 border-t border-slate-200/70">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <span className="leading-snug">{visit.pickup_location}</span>
                    </div>
                  </div>

                  {/* Vehicle Details */}
                  <div className="mt-3.5 space-y-2 text-xs text-slate-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Car className="w-3.5 h-3.5 text-blue-600" />
                        <span className="font-semibold text-slate-800">{visit.vehicle_type}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-mono text-amber-800 font-bold">
                        {visit.vehicle_number}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pl-5">
                      <span>Driver: <strong className="text-slate-700">{visit.driver_name}</strong></span>
                      <span className="font-mono text-slate-500">{visit.driver_phone}</span>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="text-slate-600">
                        Sales Escort: <strong className="text-slate-900">{visit.escort_name || 'Relationship Manager'}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Feedback display */}
                  {visit.feedback && (
                    <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                      <p className="font-bold flex items-center gap-1.5 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Client Visit Feedback:
                      </p>
                      <p className="mt-1 text-emerald-800 leading-relaxed font-normal">{visit.feedback}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                  {isScheduled && (
                    <>
                      <button
                        onClick={() => {
                          setFeedbackModalId(visit.id);
                          setFeedbackText(visit.feedback || '');
                        }}
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-center transition flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Complete Visit</span>
                      </button>

                      <button
                        onClick={() => handleStatusChange(visit.id, 'cancelled')}
                        className="py-2 px-3.5 rounded-xl bg-slate-50 hover:bg-rose-50 text-rose-700 border border-slate-200 transition font-semibold"
                      >
                        Cancel
                      </button>
                    </>
                  )}

                  {isCompleted && !visit.feedback && (
                    <button
                      onClick={() => {
                        setFeedbackModalId(visit.id);
                        setFeedbackText('');
                      }}
                      className="w-full py-2 rounded-xl bg-slate-50 hover:bg-amber-50 text-amber-800 font-bold border border-slate-200 text-center shadow-xs"
                    >
                      + Record Visit Feedback
                    </button>
                  )}

                  {isCompleted && visit.feedback && (
                    <span className="text-[11px] text-slate-400 italic">
                      Completed & Client Feedback Stored
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Feedback Dialog */}
      {feedbackModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4 text-xs">
            <h4 className="font-extrabold text-slate-900 text-base flex items-center gap-2 font-['Outfit']">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              Complete Site Visit & Record Feedback
            </h4>
            <p className="text-slate-500">
              Summarize the client&apos;s visit outcome, preferred unit, or token status:
            </p>
            <textarea
              rows={3}
              placeholder="e.g. Client loved unit 402 with garden view. Requested bank loan disbursement breakdown. Token advance promised on Monday..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:border-amber-500 focus:outline-none resize-none"
            ></textarea>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setFeedbackModalId(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => handleSaveFeedback(feedbackModalId)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs"
              >
                Save & Mark Completed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
