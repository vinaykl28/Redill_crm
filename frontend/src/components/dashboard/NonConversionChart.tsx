'use client';

import React from 'react';
import { Lead } from '@/types/crm';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { AlertCircle, TrendingDown } from 'lucide-react';

interface NonConversionChartProps {
  leads: Lead[];
}

const LUXURY_COLORS = [
  '#e11d48', // Rose
  '#d97706', // Amber
  '#0284c7', // Sky
  '#9333ea', // Purple
  '#db2777', // Pink
  '#2563eb', // Blue
  '#059669', // Emerald
  '#64748b', // Slate
];

export function NonConversionChart({ leads }: NonConversionChartProps) {
  const lostLeads = leads.filter((l) => l.status === 'not_interested');

  const reasonCounts: Record<string, number> = {};
  lostLeads.forEach((l) => {
    const reason = l.non_conversion_reason || 'Other / Not specified';
    reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
  });

  const chartData = Object.keys(reasonCounts).map((reason) => ({
    name: reason,
    value: reasonCounts[reason],
  }));

  const totalLost = lostLeads.length;

  return (
    <div className="luxury-card rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-200 shadow-xs">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 tracking-tight font-['Outfit']">
                Reasons for Non-Conversion
              </h3>
              <p className="text-xs text-slate-500">
                Actionable feedback captured by telecallers
              </p>
            </div>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 font-bold">
            {totalLost} Dropped Leads
          </span>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400">
          <AlertCircle className="w-8 h-8 text-slate-400 mb-2" />
          <p className="text-xs font-semibold text-slate-600">No Dropped Leads Recorded</p>
          <p className="text-[11px] text-slate-400 mt-1">
            When telecallers mark leads as &quot;Not Interested&quot;, reason breakdown will chart here.
          </p>
        </div>
      ) : (
        <div className="h-64 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={88}
                paddingAngle={4}
                dataKey="value"
              >
                {chartData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={LUXURY_COLORS[index % LUXURY_COLORS.length]}
                    stroke="#ffffff"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0];
                    const val = data.value as number;
                    const pct = totalLost > 0 ? Math.round((val / totalLost) * 100) : 0;
                    return (
                      <div className="bg-white border border-slate-200 px-3.5 py-2.5 rounded-xl shadow-xl text-xs">
                        <p className="font-bold text-slate-900 font-['Outfit']">{data.name}</p>
                        <p className="text-rose-600 font-bold mt-0.5">
                          {val} leads ({pct}%)
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="bottom"
                align="center"
                iconType="circle"
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                formatter={(value) => <span className="text-slate-600 font-medium">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="mt-4 pt-3.5 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
        <span>
          Leading Factor: <strong className="text-rose-700 font-semibold">{chartData[0]?.name || 'N/A'}</strong>
        </span>
        <span className="text-slate-400 font-medium">Telecaller Audit</span>
      </div>
    </div>
  );
}
