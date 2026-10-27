'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '@/types/crm';
import { CrmService } from '@/lib/crmService';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

interface AuthContextType {
  currentUser: UserProfile;
  role: UserRole;
  switchRole: (role: UserRole, profileId?: string) => void;
  availableProfiles: UserProfile[];
  isDemoMode: boolean;
  isLoading: boolean;
  loginWithEmail: (email: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [availableProfiles, setAvailableProfiles] = useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile>({
    id: 'a0000000-0000-0000-0000-000000000001',
    full_name: 'Rajesh Reddy',
    email: 'rajesh.reddy@redhillinfra.in',
    role: 'admin',
    phone: '+91 99001 11222',
    department: 'Executive Leadership (Chairman)',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  });
  const [isLoading, setIsLoading] = useState(true);
  const isDemo = !isSupabaseConfigured();

  useEffect(() => {
    async function initAuth() {
      try {
        const profiles = await CrmService.getProfiles();
        setAvailableProfiles(profiles);

        // Check if saved user exists in localStorage
        const savedId = typeof window !== 'undefined' ? localStorage.getItem('redhill_active_user_id') : null;
        if (savedId) {
          const matched = profiles.find((p) => p.id === savedId);
          if (matched) {
            setCurrentUser(matched);
            setIsLoading(false);
            return;
          }
        }

        // Default to Admin (Rajesh Reddy - Chairman)
        if (profiles.length > 0) {
          const adminUser = profiles.find((p) => p.role === 'admin') || profiles[0];
          setCurrentUser(adminUser);
        }
      } catch (err) {
        console.error('Failed to initialize profiles:', err);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  const switchRole = (role: UserRole, profileId?: string) => {
    let target: UserProfile | undefined;
    if (profileId) {
      target = availableProfiles.find((p) => p.id === profileId);
    } else {
      target = availableProfiles.find((p) => p.role === role);
    }

    if (target) {
      setCurrentUser(target);
      if (typeof window !== 'undefined') {
        localStorage.setItem('redhill_active_user_id', target.id);
      }
    }
  };

  const loginWithEmail = async (email: string): Promise<boolean> => {
    const matched = availableProfiles.find((p) => p.email.toLowerCase() === email.toLowerCase());
    if (matched) {
      setCurrentUser(matched);
      if (typeof window !== 'undefined') {
        localStorage.setItem('redhill_active_user_id', matched.id);
      }
      return true;
    }
    return false;
  };

  const logout = () => {
    // In demo, default back to Chairman
    const adminUser = availableProfiles.find((p) => p.role === 'admin');
    if (adminUser) {
      setCurrentUser(adminUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('redhill_active_user_id', adminUser.id);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role: currentUser.role,
        switchRole,
        availableProfiles,
        isDemoMode: isDemo,
        isLoading,
        loginWithEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
