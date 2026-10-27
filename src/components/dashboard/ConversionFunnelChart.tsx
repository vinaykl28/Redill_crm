'use client';

import React from 'react';
import { Lead } from '@/types/crm';
import { Layers, ArrowDown, ChevronRight, Sparkles } from 'lucide-react';

interface ConversionFunnelChartProps {
  leads: Lead[];
}

export function ConversionFunnelChart({ leads }: ConversionFunnelChartProps) {
  const total = leads.length;

  const newCount = leads.length;
  const contactedCount = leads.filter((l) => l.status !== 'new').length;
  const interestedCount = leads.filter(
    (l) => l.status === 'interested' || l.status === 'site_visit_scheduled' || l.status === 'converted'
  ).length;
  const visitCount = leads.filter(
    (l) => l.status === 'site_visit_scheduled' || l.status === 'converted'
  ).length;
  const convertedCount = leads.filter((l) => l.status === 'converted').length;

  const funnelSteps = [
    {
      num: '01',
      stage: 'Digital Ad Clicks (New Leads)',
      desc: 'Meta, Google, & Real Estate Portals',
      count: newCount,
      pct: total > 0 ? 100 : 0,
      gradient: 'from-amber-400 via-amber-500 to-amber-600',
      tagColor: 'text-amber-800 bg-amber-50 border-amber-200',
    },
    {
      num: '02',
      stage: 'Telecaller Outreach (Contacted)',
      desc: 'Connected call & requirement qualified',
      count: contactedCount,
      pct: total > 0 ? Math.round((contactedCount / total) * 100) : 0,
      gradient: 'from-blue-400 via-blue-500 to-blue-600',
      tagColor: 'text-blue-800 bg-blue-50 border-blue-200',
    },
    {
      num: '03',
      stage: 'Shortlisted & Interested',
      desc: 'Floor plans, brochures, and price sheets sent',
      count: interestedCount,
      pct: total > 0 ? Math.round((interestedCount / total) * 100) : 0,
      gradient: 'from-indigo-400 via-indigo-500 to-indigo-600',
      tagColor: 'text-indigo-800 bg-indigo-50 border-indigo-200',
    },
    {
      num: '04',
      stage: 'Site Visit Scheduled',
      desc: 'Luxury vehicle & relationship manager allocated',
      count: visitCount,
      pct: total > 0 ? Math.round((visitCount / total) * 100) : 0,
      gradient: 'from-purple-400 via-purple-500 to-purple-600',
      tagColor: 'text-purple-800 bg-purple-50 border-purple-200',
    },
    {
      num: '05',
      stage: 'Deal Converted (Token Advance)',
      desc: 'Unit allotment confirmed & booking advance paid',
      count: convertedCount,
      pct: total > 0 ? Math.round((convertedCount / total) * 100) : 0,
      gradient: 'from-emerald-400 via-emerald-500 to-emerald-600',
      tagColor: 'text-emerald-800 bg-emerald-50 border-emerald-200',
    },
  ];

  return (
    <div className="luxury-card rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200 shadow-xs">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 tracking-tight font-['Outfit']">
                Lead Conversion Funnel
              </h3>
              <p className="text-xs text-slate-500">
                Pipeline progression from ad impression to closed booking
              </p>
            </div>
          </div>

          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            {total > 0 ? Math.round((convertedCount / total) * 100) : 0}% Closing Rate
          </span>
        </div>

        <div className="space-y-4 mt-6">
          {funnelSteps.map((step) => (
            <div key={step.stage} className="space-y-1.5 group">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold text-slate-400 group-hover:text-amber-700 transition">
                    {step.num}
                  </span>
                  <span className="font-semibold text-slate-800">{step.stage}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-900 font-extrabold font-['Outfit'] text-sm">
                    {step.count}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${step.tagColor}`}
                  >
                    {step.pct}%
                  </span>
                </div>
              </div>

              {/* Progress track */}
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/80">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${step.gradient} transition-all duration-700 shadow-xs`}
                  style={{ width: `${Math.max(4, step.pct)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-3.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span>Lifecycle: <strong className="text-slate-700">HSR Luxury Residential</strong></span>
        <span className="text-amber-700 font-semibold">Automatic RLS Aggregation</span>
      </div>
    </div>
  );
}
