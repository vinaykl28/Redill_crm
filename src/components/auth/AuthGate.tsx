'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { LoginView } from '@/components/auth/LoginView';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center text-slate-600 text-sm">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="font-['Outfit'] font-semibold tracking-wide">
            Loading Red Hill Infra Luxury CRM...
          </span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginView />;
  }

  return <>{children}</>;
}

