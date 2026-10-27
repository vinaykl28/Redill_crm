'use client';

import React from 'react';
import { Lead } from '@/types/crm';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Sparkles } from 'lucide-react';

interface ConversionTrendChartProps {
  leads: Lead[];
}

export function ConversionTrendChart({ leads }: ConversionTrendChartProps) {
  const weeks = [
    { label: 'Week 1', leads: 4, converted: 1, visits: 2 },
    { label: 'Week 2', leads: 6, converted: 1, visits: 3 },
    { label: 'Week 3', leads: 8, converted: 2, visits: 4 },
    { label: 'Week 4', leads: 12, converted: 3, visits: 5 },
    {
      label: 'Current',
      leads: leads.length,
      converted: leads.filter((l) => l.status === 'converted').length,
      visits: leads.filter(
        (l) => l.status === 'site_visit_scheduled' || l.status === 'converted'
      ).length,
    },
  ];

  return (
    <div className="luxury-card rounded-2xl p-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 shadow-xs">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 tracking-tight font-['Outfit']">
              Conversion Trajectory
            </h3>
            <p className="text-xs text-slate-500">
              Weekly momentum of inbound digital ad leads vs deal closures
            </p>
          </div>
        </div>
      </div>

      <div className="h-72 w-full mt-5">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={weeks}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorLeadsLuxury" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d97706" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#d97706" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorConvertedLuxury" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#059669" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xl text-xs space-y-1.5">
                      <p className="font-extrabold text-slate-900 font-['Outfit']">{label}</p>
                      {payload.map((item) => (
                        <div key={item.dataKey as string} className="flex justify-between gap-5">
                          <span style={{ color: item.color }} className="font-medium">
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
            <Area
              type="monotone"
              dataKey="leads"
              name="Ad Inquiries"
              stroke="#d97706"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorLeadsLuxury)"
            />
            <Area
              type="monotone"
              dataKey="converted"
              name="Converted Deals"
              stroke="#059669"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorConvertedLuxury)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
