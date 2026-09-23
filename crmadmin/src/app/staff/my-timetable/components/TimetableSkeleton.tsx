"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function TimetablePageSkeleton() {
  return (
    <div className="flex-1 space-y-6 p-4 sm:p-8 pt-8 bg-slate-50/50 min-h-screen font-sans animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-56 rounded-lg" />
            <Skeleton className="h-3 w-80 rounded" />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-24 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-24 rounded-xl" />
        </div>
      </div>

      {/* Table Container Skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Table Banner Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-6 w-36 rounded-md" />
            <Skeleton className="h-4 w-64 rounded" />
          </div>
          <Skeleton className="h-4 w-48 rounded" />
        </div>

        {/* Shimmer Matrix Table */}
        <div className="p-4 overflow-x-auto">
          <div className="min-w-[980px] space-y-2.5">
            {/* Header Row */}
            <div className="grid grid-cols-10 gap-2 bg-slate-900 p-3 rounded-xl">
              <Skeleton className="h-4 w-12 bg-slate-800 rounded" />
              {Array.from({ length: 9 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full bg-slate-800 rounded" />
              ))}
            </div>

            {/* 6 Day Rows */}
            {Array.from({ length: 6 }).map((_, r) => (
              <div key={r} className="grid grid-cols-10 gap-2 items-center">
                <Skeleton className="h-16 w-full rounded-xl bg-slate-100" />
                {Array.from({ length: 9 }).map((_, c) => (
                  <Skeleton key={c} className="h-16 w-full rounded-xl bg-slate-100" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
