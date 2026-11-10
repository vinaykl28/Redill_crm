'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '@/types/crm';
import { CrmService } from '@/lib/crmService';
import { isSupabaseConfigured } from '@/lib/supabaseClient';
import { INITIAL_PROFILES } from '@/lib/mockData';

interface AuthContextType {
  currentUser: UserProfile | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  switchRole: (role: UserRole, profileId?: string) => void;
  availableProfiles: UserProfile[];
  isDemoMode: boolean;
  isLoading: boolean;
  loginWithEmail: (email: string, password?: string) => Promise<boolean>;
  loginAsRole: (role: UserRole) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [availableProfiles, setAvailableProfiles] = useState<UserProfile[]>(INITIAL_PROFILES);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isDemo = !isSupabaseConfigured();

  useEffect(() => {
    async function initAuth() {
      try {
        const profiles = await CrmService.getProfiles();
        if (profiles && profiles.length > 0) {
          setAvailableProfiles(profiles);
        }

        // Check if saved user exists in localStorage
        const savedId = typeof window !== 'undefined' ? localStorage.getItem('redhill_active_user_id') : null;
        if (savedId) {
          const profileList = profiles && profiles.length > 0 ? profiles : INITIAL_PROFILES;
          const matched = profileList.find((p) => p.id === savedId);
          if (matched) {
            setCurrentUser(matched);
            setIsLoading(false);
            return;
          }
        }

        // Check if explicit session flag exists
        const hasSession = typeof window !== 'undefined' ? localStorage.getItem('redhill_session_active') : null;
        if (hasSession === 'true') {
          const profileList = profiles && profiles.length > 0 ? profiles : INITIAL_PROFILES;
          const defaultAdmin = profileList.find((p) => p.role === 'admin') || profileList[0];
          setCurrentUser(defaultAdmin);
        } else {
          // No active session: show login screen
          setCurrentUser(null);
        }
      } catch (err) {
        console.error('Failed to initialize profiles:', err);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  const loginAsRole = (targetRole: UserRole): boolean => {
    const profileList = availableProfiles.length > 0 ? availableProfiles : INITIAL_PROFILES;
    let target: UserProfile | undefined;

    if (targetRole === 'admin') {
      target = profileList.find((p) => p.role === 'admin');
    } else if (targetRole === 'sales_executive' || targetRole === 'manager') {
      target = profileList.find((p) => p.role === 'sales_executive' || p.role === 'manager');
    } else if (targetRole === 'telecaller') {
      target = profileList.find((p) => p.role === 'telecaller');
    }

    if (target) {
      setCurrentUser(target);
      if (typeof window !== 'undefined') {
        localStorage.setItem('redhill_active_user_id', target.id);
        localStorage.setItem('redhill_session_active', 'true');
      }
      return true;
    }
    return false;
  };

  const switchRole = (role: UserRole, profileId?: string) => {
    const profileList = availableProfiles.length > 0 ? availableProfiles : INITIAL_PROFILES;
    let target: UserProfile | undefined;

    if (profileId) {
      target = profileList.find((p) => p.id === profileId);
    } else if (role === 'admin') {
      target = profileList.find((p) => p.role === 'admin');
    } else if (role === 'sales_executive' || role === 'manager') {
      target = profileList.find((p) => p.role === 'sales_executive' || p.role === 'manager');
    } else if (role === 'telecaller') {
      target = profileList.find((p) => p.role === 'telecaller');
    }

    if (target) {
      setCurrentUser(target);
      if (typeof window !== 'undefined') {
        localStorage.setItem('redhill_active_user_id', target.id);
        localStorage.setItem('redhill_session_active', 'true');
      }
    }
  };

  const loginWithEmail = async (email: string, _password?: string): Promise<boolean> => {
    const profileList = availableProfiles.length > 0 ? availableProfiles : INITIAL_PROFILES;
    const normalized = email.trim().toLowerCase();
    let target: UserProfile | undefined;

    if (
      normalized === 'admin@redhillinfra.in' ||
      normalized === 'rajesh.reddy@redhillinfra.in' ||
      normalized === 'admin' ||
      normalized === 'superadmin' ||
      normalized === 'super admin' ||
      normalized === 'rajesh'
    ) {
      target = profileList.find((p) => p.role === 'admin');
    } else if (
      normalized === 'sales1@redhillinfra.in' ||
      normalized === 'sales1' ||
      normalized === 'sales@redhillinfra.in' ||
      normalized === 'sales' ||
      normalized === 'priya.sharma@redhillinfra.in' ||
      normalized === 'priya'
    ) {
      target = profileList.find((p) => p.email === 'sales1@redhillinfra.in');
    } else if (
      normalized === 'sales2@redhillinfra.in' ||
      normalized === 'sales2' ||
      normalized === 'rahul.verma@redhillinfra.in' ||
      normalized === 'rahul'
    ) {
      target = profileList.find((p) => p.email === 'sales2@redhillinfra.in');
    } else if (
      normalized === 'sales3@redhillinfra.in' ||
      normalized === 'sales3' ||
      normalized === 'ananya.deshmukh@redhillinfra.in' ||
      normalized === 'ananya'
    ) {
      target = profileList.find((p) => p.email === 'sales3@redhillinfra.in');
    } else if (
      normalized === 'sales4@redhillinfra.in' ||
      normalized === 'sales4' ||
      normalized === 'vikram.malhotra@redhillinfra.in' ||
      normalized === 'vikram'
    ) {
      target = profileList.find((p) => p.email === 'sales4@redhillinfra.in');
    } else if (
      normalized === 'telecaller1@redhillinfra.in' ||
      normalized === 'telecaller1' ||
      normalized === 'telecaller@redhillinfra.in' ||
      normalized === 'telecaller' ||
      normalized === 'amit.kumar@redhillinfra.in' ||
      normalized === 'amit'
    ) {
      target = profileList.find((p) => p.email === 'telecaller1@redhillinfra.in');
    } else if (
      normalized === 'telecaller2@redhillinfra.in' ||
      normalized === 'telecaller2' ||
      normalized === 'sneha.patel@redhillinfra.in' ||
      normalized === 'sneha'
    ) {
      target = profileList.find((p) => p.email === 'telecaller2@redhillinfra.in');
    } else {
      target = profileList.find(
        (p) =>
          p.email.toLowerCase() === normalized ||
          p.full_name.toLowerCase() === normalized ||
          p.id === normalized
      );
    }

    if (target) {
      setCurrentUser(target);
      if (typeof window !== 'undefined') {
        localStorage.setItem('redhill_active_user_id', target.id);
        localStorage.setItem('redhill_session_active', 'true');
      }
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('redhill_active_user_id');
      localStorage.removeItem('redhill_session_active');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role: currentUser ? currentUser.role : null,
        isAuthenticated: !!currentUser,
        switchRole,
        availableProfiles,
        isDemoMode: isDemo,
        isLoading,
        loginWithEmail,
        loginAsRole,
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
