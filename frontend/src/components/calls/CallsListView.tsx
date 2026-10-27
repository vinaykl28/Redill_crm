'use client';

import React, { useState } from 'react';
import { CallLog, CallOutcome, UserProfile } from '@/types/crm';
import {
  PhoneCall,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  AlertTriangle,
  PhoneForwarded,
  Filter,
} from 'lucide-react';

interface CallsListViewProps {
  calls: CallLog[];
  currentUser: UserProfile;
  telecallers: UserProfile[];
  onOpenLogCall: () => void;
}

export function CallsListView({
  calls,
  currentUser,
  telecallers,
  onOpenLogCall,
}: CallsListViewProps) {
  const [outcomeFilter, setOutcomeFilter] = useState<string>('all');
  const [callerFilter, setCallerFilter] = useState<string>('all');

  const filtered = calls.filter((c) => {
    const matchOutcome = outcomeFilter === 'all' || c.call_outcome === outcomeFilter;
    const matchCaller = callerFilter === 'all' || c.caller_id === callerFilter;
    return matchOutcome && matchCaller;
  });

  const getOutcomeBadge = (outcome: CallOutcome) => {
    switch (outcome) {
      case 'connected':
      case 'interested':
      case 'site_visit_requested':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'follow_up_scheduled':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'busy':
      case 'not_reachable':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'disqualified':
      default:
        return 'bg-rose-50 text-rose-800 border-rose-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters and Actions */}
      <div className="luxury-card rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5">
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={outcomeFilter}
            onChange={(e) => setOutcomeFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-700 focus:outline-none capitalize shadow-xs"
          >
            <option value="all">All Outcomes ({calls.length})</option>
            <option value="connected">Connected</option>
            <option value="interested">Interested</option>
            <option value="site_visit_requested">Site Visit Requested</option>
            <option value="follow_up_scheduled">Follow-up Scheduled</option>
            <option value="busy">Busy</option>
            <option value="not_reachable">Not Reachable</option>
            <option value="disqualified">Disqualified</option>
          </select>

          {currentUser.role !== 'telecaller' && (
            <select
              value={callerFilter}
              onChange={(e) => setCallerFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-700 focus:outline-none shadow-xs"
            >
              <option value="all">All Telecallers</option>
              {telecallers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.full_name}
                </option>
              ))}
            </select>
          )}
        </div>

        <button
          onClick={onOpenLogCall}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl gold-gradient-bg text-white font-extrabold text-xs shadow-md transition"
        >
          <PhoneForwarded className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Log New Conversation</span>
        </button>
      </div>

      {/* Calls Log Table */}
      <div className="luxury-card rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider text-[10px] font-['Space_Grotesk']">
              <tr>
                <th className="py-4 px-5">Timestamp</th>
                <th className="py-4 px-5">Lead / Client</th>
                <th className="py-4 px-5">Outcome</th>
                <th className="py-4 px-5">Key Discussion Points</th>
                <th className="py-4 px-5">Duration</th>
                <th className="py-4 px-5">Telecaller</th>
                <th className="py-4 px-5">Follow-up</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-slate-500">
                    <PhoneCall className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                    <p className="text-sm font-bold text-slate-700 font-['Outfit']">No call logs recorded</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Log calls against ad click leads to build an audit history.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((call) => (
                  <tr key={call.id} className="hover:bg-amber-50/40 transition-colors">
                    <td className="py-4 px-5 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                      {new Date(call.created_at).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    <td className="py-4 px-5">
                      <div className="font-extrabold text-slate-900 text-sm font-['Outfit']">
                        {call.lead_name || 'Client Prospect'}
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border font-mono ${getOutcomeBadge(
                          call.call_outcome
                        )}`}
                      >
                        {call.call_outcome.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="py-4 px-5 text-slate-700 max-w-sm">
                      <p className="line-clamp-2 leading-relaxed font-normal">{call.notes}</p>
                    </td>

                    <td className="py-4 px-5 font-mono text-slate-500 whitespace-nowrap text-xs font-semibold">
                      {Math.floor(call.duration_seconds / 60)}m {call.duration_seconds % 60}s
                    </td>

                    <td className="py-4 px-5 text-slate-800 whitespace-nowrap font-medium">
                      {call.caller_name || 'Telecaller'}
                    </td>

                    <td className="py-4 px-5 text-blue-700 font-mono text-[11px] whitespace-nowrap font-bold">
                      {call.follow_up_date
                        ? new Date(call.follow_up_date).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
