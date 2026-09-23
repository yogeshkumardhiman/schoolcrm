import React from "react";
import { cn } from "@/lib/utils";

// 1. Base Shimmer Skeleton Primitive
export function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "animate-pulse rounded-xl bg-slate-200/80 dark:bg-slate-800/80",
        className
      )}
      {...props}
    />
  );
}

// 2. Page Header Shimmer
export function PageHeaderSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs animate-pulse">
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-2xl shrink-0" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48 rounded-lg" />
          <Skeleton className="h-3.5 w-72 rounded-md" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-28 rounded-xl" />
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>
    </div>
  );
}

// 3. Stat Metric Cards Shimmer Grid (e.g. 4 top cards)
export function StatCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between"
        >
          <div className="space-y-2 flex-1">
            <Skeleton className="h-2.5 w-20 rounded" />
            <Skeleton className="h-7 w-28 rounded-lg" />
            <Skeleton className="h-2.5 w-24 rounded" />
          </div>
          <Skeleton className="h-10 w-10 rounded-xl shrink-0 ml-3" />
        </div>
      ))}
    </div>
  );
}

// 4. Standalone Table Shimmer (with Header & Filter Bar)
export function FullTableSkeleton({ columns = 5, rows = 6 }: { columns?: number; rows?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs animate-pulse space-y-4 p-5">
      {/* Search & Filter Bar Shimmer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-64 rounded-xl" />
        </div>
      </div>

      {/* Table Rows Shimmer */}
      <div className="space-y-3 pt-2">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="p-3.5 bg-slate-50/70 rounded-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-2.5 w-16 rounded" />
              </div>
            </div>
            {Array.from({ length: Math.max(1, columns - 2) }).map((_, c) => (
              <Skeleton key={c} className="h-6 w-24 rounded-lg hidden md:block" />
            ))}
            <Skeleton className="h-8 w-28 rounded-xl shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

// 5. Grid Card Shimmer (for Grid views like Teachers / Students cards)
export function GridCardsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-3.5">
            <Skeleton className="h-12 w-12 rounded-2xl shrink-0" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-3 w-20 rounded" />
            </div>
          </div>
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <Skeleton className="h-3 w-full rounded" />
            <Skeleton className="h-3 w-3/4 rounded" />
          </div>
          <div className="flex justify-between items-center pt-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

// 6. Form / Modal Fields Shimmer
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <Skeleton className="h-3 w-24 rounded" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      ))}
      <div className="flex justify-end gap-3 pt-4">
        <Skeleton className="h-10 w-24 rounded-xl" />
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
    </div>
  );
}

// 7. Aliases for full backwards compatibility across the CRM
export const CardSkeleton = StatCardsSkeleton;
export const TableRowSkeleton = FullTableSkeleton;

