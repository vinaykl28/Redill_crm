'use client';

import React from 'react';
import { Lead } from '@/types/crm';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Megaphone, Sparkles } from 'lucide-react';

interface SourcePerformanceChartProps {
  leads: Lead[];
}

export function SourcePerformanceChart({ leads }: SourcePerformanceChartProps) {
  const sourceMap: Record<string, { leads: number; converted: number; visits: number }> = {};

  leads.forEach((l) => {
    const src = l.source || 'Other';
    if (!sourceMap[src]) {
      sourceMap[src] = { leads: 0, converted: 0, visits: 0 };
    }
    sourceMap[src].leads += 1;
    if (l.status === 'converted') {
      sourceMap[src].converted += 1;
    }
    if (l.status === 'site_visit_scheduled' || l.status === 'converted') {
      sourceMap[src].visits += 1;
    }
  });

  const chartData = Object.keys(sourceMap).map((source) => ({
    source,
    TotalLeads: sourceMap[source].leads,
    SiteVisits: sourceMap[source].visits,
    Converted: sourceMap[source].converted,
  }));

  chartData.sort((a, b) => b.TotalLeads - a.TotalLeads);

  return (
    <div className="luxury-card rounded-2xl p-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200 shadow-xs">
            <Megaphone className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 tracking-tight font-['Outfit']">
              Ad Channel Efficacy
            </h3>
            <p className="text-xs text-slate-500">
              Meta Ads vs Google vs Portals lead intake and conversions
            </p>
          </div>
        </div>
      </div>

      <div className="h-72 w-full mt-5">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="source"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              interval={0}
              angle={-15}
              textAnchor="end"
            />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xl text-xs space-y-1.5">
                      <p className="font-extrabold text-slate-900 mb-1 font-['Outfit']">{label}</p>
                      {payload.map((item) => (
                        <div key={item.dataKey as string} className="flex items-center justify-between gap-5">
                          <span style={{ color: item.color }} className="capitalize font-medium">
                            {item.name}:
                          </span>
                          <span className="font-mono font-bold text-slate-900">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ fontSize: '11px', paddingBottom: '14px' }}
            />
            <Bar
              dataKey="TotalLeads"
              name="Ad Clicks"
              fill="#d97706"
              radius={[6, 6, 0, 0]}
              barSize={16}
            />
            <Bar
              dataKey="SiteVisits"
              name="Site Visits"
              fill="#2563eb"
              radius={[6, 6, 0, 0]}
              barSize={16}
            />
            <Bar
              dataKey="Converted"
              name="Converted"
              fill="#059669"
              radius={[6, 6, 0, 0]}
              barSize={16}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
