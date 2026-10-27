'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { TelecallerStats } from '@/types/crm';
import { CrmService } from '@/lib/crmService';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { LeaderboardPodium } from '@/components/leaderboard/LeaderboardPodium';
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable';
import { Trophy, Award, TrendingUp, Sparkles } from 'lucide-react';

export default function LeaderboardPage() {
  const { currentUser, isLoading } = useAuth();
  const [stats, setStats] = useState<TelecallerStats[]>([]);

  useEffect(() => {
    CrmService.getTelecallerLeaderboard().then(setStats);
  }, []);

  if (isLoading) return null;

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-800">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Telecaller Performance Leaderboard"
          subtitle="Ranked telecaller conversion efficiency, outreach volume, and deal closings"
        />

        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Header Card */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl luxury-card border border-slate-200 shadow-xs">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 font-['Outfit']">
                <Trophy className="w-5 h-5 text-amber-600" />
                Telecaller Sales League
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Ranked from highest to lowest performer based on converted deals, conversion %, and site visit scheduling
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 font-semibold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Real Estate Incentive Cycle Active</span>
            </div>
          </div>

          {/* 1st, 2nd, 3rd Podium Cards */}
          <LeaderboardPodium stats={stats} />

          {/* Complete Table */}
          <LeaderboardTable stats={stats} />
        </main>
      </div>
    </div>
  );
}
