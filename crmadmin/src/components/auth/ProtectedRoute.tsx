"use client";

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';
import { useAuth } from '@/components/AbilityProvider';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  /** Permission code or array of codes required to view this page */
  permission?: string | string[];
  /** Specific roles allowed to view this page (e.g. ['SUPER_ADMIN', 'ADMIN']) */
  roles?: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({
  permission,
  roles,
  children,
  fallback,
}: ProtectedRouteProps) {
  const { user, permissions, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 space-y-4">
        <div className="h-10 w-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest font-heading">
          Verifying Security Clearance...
        </p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const userRole = String(user?.role || '').toUpperCase();
  const isSuperAdmin = userRole === 'SUPER_ADMIN';

  // Super Admin has full clearance across all routes
  let isAuthorized = isSuperAdmin;

  // Check role match if roles are specified
  if (!isAuthorized && roles && roles.length > 0) {
    const normalizedRoles = roles.map((r) => r.toUpperCase());
    isAuthorized = normalizedRoles.includes(userRole);
  }

  // Check permissions match if permission is specified
  if (!isAuthorized && permission) {
    const requiredCodes = Array.isArray(permission) ? permission : [permission];
    isAuthorized = requiredCodes.some((code) => permissions.has(code));
  }

  // If no specific permission or role was demanded, authorized by default once authenticated
  if (!permission && (!roles || roles.length === 0)) {
    isAuthorized = true;
  }

  if (isAuthorized) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 p-8 text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shadow-inner">
          <ShieldAlert size={32} />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-[10px] font-black uppercase tracking-widest">
            <Lock size={12} /> Restricted Resource
          </div>
          <h2 className="text-xl font-black text-slate-900 font-heading">
            Access Clearance Required
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Your account ({userRole || 'User'}) does not possess the required institutional permissions to access this governance module.
          </p>
        </div>

        <div className="pt-2">
          <Link href="/">
            <Button
              variant="outline"
              className="w-full h-11 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
            >
              <ArrowLeft size={16} /> Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
