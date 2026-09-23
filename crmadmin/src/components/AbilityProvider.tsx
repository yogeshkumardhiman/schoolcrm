"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import client from '@/lib/client';
import { APP_CONFIG } from '@/constants/config';

// ─── Types ───────────────────────────────────────────────────────────
interface AuthContextType {
  user: any | null;
  loading: boolean;
  permissions: Set<string>;
  syncProfile: () => Promise<void>;
}

// ─── Context ─────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType>(null!);

// ─── Hooks ───────────────────────────────────────────────────────────

/** Core auth hook — returns user, loading state, permissions set, and syncProfile */
export function useAuth() {
  return useContext(AuthContext);
}

/** Check if the current user has a specific permission code (e.g. 'student:delete') */
export function usePermission(code: string): boolean {
  const { user, permissions } = useAuth();
  if (!user) return false;
  if (user.role === 'SUPER_ADMIN') return true;
  return permissions.has(code);
}

/** Check if the current user has ANY of the given permission codes */
export function useAnyPermission(...codes: string[]): boolean {
  const { user, permissions } = useAuth();
  if (!user) return false;
  if (user.role === 'SUPER_ADMIN') return true;
  return codes.some((c) => permissions.has(c));
}

/** Check if the current user has ALL of the given permission codes */
export function useAllPermissions(...codes: string[]): boolean {
  const { user, permissions } = useAuth();
  if (!user) return false;
  if (user.role === 'SUPER_ADMIN') return true;
  return codes.every((c) => permissions.has(c));
}

// ─── Gate Component ──────────────────────────────────────────────────

interface GateProps {
  /** Single permission code or array (OR logic — any match grants access) */
  permission: string | string[];
  children: React.ReactNode;
  /** Optional fallback to render when permission is denied */
  fallback?: React.ReactNode;
}

/** Conditionally render children based on the user's API-provided permissions */
export function Gate({ permission, children, fallback = null }: GateProps) {
  const { user, permissions } = useAuth();
  if (!user) return <>{fallback}</>;
  if (user.role === 'SUPER_ADMIN') return <>{children}</>;

  const codes = Array.isArray(permission) ? permission : [permission];
  const allowed = codes.some((c) => permissions.has(c));
  return allowed ? <>{children}</> : <>{fallback}</>;
}

// ─── Provider ────────────────────────────────────────────────────────

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(APP_CONFIG.auth.tokens.data);
      if (stored) {
        try { return JSON.parse(stored); } catch {}
      }
    }
    return null;
  });

  const [permissions, setPermissions] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(APP_CONFIG.auth.tokens.permissions);
      if (stored) {
        try { return new Set(JSON.parse(stored)); } catch {}
      }
    }
    return new Set();
  });

  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const isAuthPage = pathname === '/login';

  const token = typeof window !== 'undefined'
    ? localStorage.getItem(APP_CONFIG.auth.tokens.auth) || localStorage.getItem('sdm_auth_token')
    : null;

  // 🚀 TanStack Query for Profile Caching (5 mins staleTime)
  const { data: profileData, isLoading: queryLoading, refetch } = useQuery({
    queryKey: ['auth', 'profile'],
    queryFn: async () => {
      const res = await client.get('/auth/profile');
      return res?.data ? res.data : res;
    },
    enabled: typeof window !== 'undefined' && !isAuthPage && !!token,
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error: any) => {
      if (error?.message?.includes("401") || error?.message?.includes("Unauthorized")) {
        return false;
      }
      return failureCount < 2;
    },
  });

  const syncProfile = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['auth', 'profile'] });
    await refetch();
  }, [queryClient, refetch]);

  useEffect(() => {
    if (profileData) {
      if (profileData.role) localStorage.setItem(APP_CONFIG.auth.tokens.role, profileData.role);
      localStorage.setItem(APP_CONFIG.auth.tokens.data, JSON.stringify(profileData));
      localStorage.setItem(APP_CONFIG.auth.tokens.permissions, JSON.stringify(profileData.permissions || []));

      setUser(profileData);
      setPermissions(new Set(profileData.permissions || []));
    }
  }, [profileData]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const currentToken = localStorage.getItem(APP_CONFIG.auth.tokens.auth) || localStorage.getItem('sdm_auth_token');

    if (!currentToken && !isAuthPage) {
      router.replace('/login');
    } else if (currentToken && isAuthPage) {
      router.replace('/');
    }

    const handlePopState = () => {
      const t = localStorage.getItem(APP_CONFIG.auth.tokens.auth);
      if (t && window.location.pathname === '/login') {
        router.replace('/');
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === APP_CONFIG.auth.tokens.auth || e.key === APP_CONFIG.auth.tokens.data) {
        syncProfile();
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('crm_auth_update', syncProfile);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('crm_auth_update', syncProfile);
    };
  }, [syncProfile, router, isAuthPage]);

  return (
    <AuthContext.Provider value={{ user, loading: queryLoading, permissions, syncProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

// ─── Backward Compatibility Aliases ──────────────────────────────────
// These keep existing imports working during migration.

/** @deprecated Use AuthProvider instead */
export const AbilityProvider = AuthProvider;

/** @deprecated Use usePermission or Gate instead */
export function useAbility() {
  const { permissions } = useAuth();
  return permissions;
}
