'use client';

import React from 'react';
import { TelecallerStats } from '@/types/crm';
import { Trophy, Phone, Target, Calendar, Clock, Award, Sparkles } from 'lucide-react';

interface LeaderboardTableProps {
  stats: TelecallerStats[];
}

export function LeaderboardTable({ stats }: LeaderboardTableProps) {
  return (
    <div className="luxury-card rounded-2xl overflow-hidden shadow-xs">
      <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200 shadow-xs">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 tracking-tight font-['Outfit']">
              Complete Sales & Outreach Matrix
            </h3>
            <p className="text-xs text-slate-500">
              Ranked by deal conversions, site visits executed, and closing %
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider text-[10px] font-['Space_Grotesk']">
            <tr>
              <th className="py-4 px-5">Rank</th>
              <th className="py-4 px-5">Telecaller / Relationship Manager</th>
              <th className="py-4 px-5 text-center">Calls Made</th>
              <th className="py-4 px-5 text-center">Connected Rate</th>
              <th className="py-4 px-5 text-center">Site Visits Booked</th>
              <th className="py-4 px-5 text-center">Leads Converted</th>
              <th className="py-4 px-5 text-center">Conversion Rate</th>
              <th className="py-4 px-5 text-right">Avg Call Duration</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {stats.map((row) => {
              const connectedRate =
                row.calls_count > 0 ? Math.round((row.connected_count / row.calls_count) * 100) : 0;
              return (
                <tr key={row.id} className="hover:bg-amber-50/40 transition-colors">
                  <td className="py-4 px-5 font-black">
                    {row.rank === 1 ? (
                      <span className="w-7 h-7 rounded-full gold-gradient-bg text-white inline-flex items-center justify-center text-xs shadow-xs font-black">
                        1
                      </span>
                    ) : row.rank === 2 ? (
                      <span className="w-7 h-7 rounded-full bg-slate-200 text-slate-800 inline-flex items-center justify-center text-xs font-bold shadow-xs">
                        2
                      </span>
                    ) : row.rank === 3 ? (
                      <span className="w-7 h-7 rounded-full bg-amber-700 text-white inline-flex items-center justify-center text-xs font-bold shadow-xs">
                        3
                      </span>
                    ) : (
                      <span className="text-slate-400 font-mono pl-2 font-bold">#{row.rank}</span>
                    )}
                  </td>

                  <td className="py-4 px-5">
                    <div className="font-extrabold text-slate-900 text-sm font-['Outfit']">
                      {row.name}
                    </div>
                    <div className="text-slate-500 text-[11px] font-mono mt-0.5">{row.email}</div>
                  </td>

                  <td className="py-4 px-5 text-center font-bold text-slate-900 font-mono text-sm">
                    {row.calls_count}
                  </td>

                  <td className="py-4 px-5 text-center">
                    <span className="font-mono text-slate-800 font-bold">
                      {connectedRate}%
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      ({row.connected_count} calls)
                    </span>
                  </td>

                  <td className="py-4 px-5 text-center">
                    <span className="font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 font-mono">
                      {row.site_visits_booked} visits
                    </span>
                  </td>

                  <td className="py-4 px-5 text-center">
                    <span className="font-extrabold text-emerald-700 text-sm bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200 font-mono">
                      {row.converted_count}
                    </span>
                  </td>

                  <td className="py-4 px-5 text-center">
                    <div className="flex items-center justify-center gap-2.5">
                      <div className="w-20 bg-slate-100 border border-slate-200 rounded-full h-2.5 overflow-hidden p-0.5">
                        <div
                          className="bg-emerald-500 h-full rounded-full"
                          style={{ width: `${Math.min(100, row.conversion_rate * 2)}%` }}
                        ></div>
                      </div>
                      <span className="font-black text-emerald-700 text-xs font-mono">
                        {row.conversion_rate}%
                      </span>
                    </div>
                  </td>

                  <td className="py-4 px-5 text-right font-mono text-slate-500 text-xs">
                    {Math.floor(row.avg_duration_sec / 60)}m {row.avg_duration_sec % 60}s
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
