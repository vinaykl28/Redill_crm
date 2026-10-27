'use client';

import React from 'react';
import { TelecallerStats } from '@/types/crm';
import { Trophy, Medal, Award, PhoneCall, Target, CalendarCheck, Sparkles } from 'lucide-react';

interface LeaderboardPodiumProps {
  stats: TelecallerStats[];
}

export function LeaderboardPodium({ stats }: LeaderboardPodiumProps) {
  const topThree = stats.slice(0, 3);
  if (topThree.length === 0) return null;

  const first = topThree[0];
  const second = topThree[1];
  const third = topThree[2];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6 items-end">
      {/* 2nd Place - Silver */}
      {second && (
        <div className="luxury-card rounded-2xl p-6 border border-slate-200 shadow-md flex flex-col justify-between order-2 md:order-1 relative overflow-hidden h-[340px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 font-['Space_Grotesk']">
              Rank #2 • Silver
            </span>
            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold border border-slate-200">
              <Medal className="w-4 h-4" />
            </div>
          </div>

          <div className="text-center my-2">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-200 to-slate-400 mx-auto flex items-center justify-center text-xl font-black text-slate-800 border-2 border-slate-300 shadow-md">
              {second.name.charAt(0)}
            </div>
            <h4 className="font-extrabold text-slate-900 text-base mt-2.5 font-['Outfit']">
              {second.name}
            </h4>
            <p className="text-xs text-slate-500">{second.email}</p>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center text-xs">
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-mono">Calls</p>
              <p className="font-extrabold text-slate-900 mt-0.5">{second.calls_count}</p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-mono">Visits</p>
              <p className="font-extrabold text-blue-700 mt-0.5">{second.site_visits_booked}</p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-mono">Closed</p>
              <p className="font-extrabold text-emerald-700 mt-0.5">{second.converted_count}</p>
            </div>
          </div>

          <div className="mt-3 text-center">
            <span className="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-3.5 py-1 rounded-full">
              {second.conversion_rate}% Conversion
            </span>
          </div>
        </div>
      )}

      {/* 1st Place - Gold Champion */}
      {first && (
        <div className="luxury-card rounded-2xl p-7 border-2 border-amber-400 shadow-xl shadow-amber-500/10 flex flex-col justify-between order-1 md:order-2 relative overflow-hidden bg-gradient-to-b from-amber-50/70 via-white to-amber-50/30 h-[370px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-800 flex items-center gap-1.5 font-['Space_Grotesk']">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Rank #1 • Gold Champion
            </span>
            <div className="w-10 h-10 rounded-full gold-gradient-bg text-white flex items-center justify-center font-bold shadow-md ring-2 ring-amber-300">
              <Trophy className="w-5 h-5" />
            </div>
          </div>

          <div className="text-center my-3">
            <div className="w-20 h-20 rounded-full gold-gradient-bg mx-auto flex items-center justify-center text-2xl font-black text-white border-4 border-amber-200 shadow-lg ring-4 ring-amber-400/20">
              {first.name.charAt(0)}
            </div>
            <h4 className="font-black text-slate-900 text-lg mt-3 font-['Outfit'] tracking-tight">
              {first.name}
            </h4>
            <p className="text-xs text-amber-800 font-semibold">{first.email}</p>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-amber-100 text-center text-xs">
            <div>
              <p className="text-slate-500 text-[10px] uppercase font-mono">Calls Made</p>
              <p className="font-black text-slate-900 text-base mt-0.5">{first.calls_count}</p>
            </div>
            <div>
              <p className="text-slate-500 text-[10px] uppercase font-mono">Site Visits</p>
              <p className="font-black text-blue-700 text-base mt-0.5">{first.site_visits_booked}</p>
            </div>
            <div>
              <p className="text-slate-500 text-[10px] uppercase font-mono">Converted</p>
              <p className="font-black text-emerald-700 text-base mt-0.5">{first.converted_count}</p>
            </div>
          </div>

          <div className="mt-4 text-center">
            <span className="text-xs font-black gold-gradient-bg text-white px-5 py-1.5 rounded-full shadow-md">
              {first.conversion_rate}% Conversion Rate (Leader)
            </span>
          </div>

          <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
        </div>
      )}

      {/* 3rd Place - Bronze */}
      {third && (
        <div className="luxury-card rounded-2xl p-6 border border-amber-200 shadow-md flex flex-col justify-between order-3 relative overflow-hidden h-[330px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-800 font-['Space_Grotesk']">
              Rank #3 • Bronze
            </span>
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold border border-amber-200">
              <Award className="w-4 h-4" />
            </div>
          </div>

          <div className="text-center my-2">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 mx-auto flex items-center justify-center text-xl font-black text-white border-2 border-amber-400 shadow-md">
              {third.name.charAt(0)}
            </div>
            <h4 className="font-extrabold text-slate-900 text-base mt-2.5 font-['Outfit']">
              {third.name}
            </h4>
            <p className="text-xs text-slate-500">{third.email}</p>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center text-xs">
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-mono">Calls</p>
              <p className="font-extrabold text-slate-900 mt-0.5">{third.calls_count}</p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-mono">Visits</p>
              <p className="font-extrabold text-blue-700 mt-0.5">{third.site_visits_booked}</p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-mono">Closed</p>
              <p className="font-extrabold text-emerald-700 mt-0.5">{third.converted_count}</p>
            </div>
          </div>

          <div className="mt-3 text-center">
            <span className="text-xs font-bold text-amber-900 bg-amber-50 border border-amber-200 px-3.5 py-1 rounded-full">
              {third.conversion_rate}% Conversion
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
