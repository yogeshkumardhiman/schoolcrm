"use client";

import React from "react";

const HomeSkeleton = () => {
  return (
    <div className="min-h-screen bg-white animate-pulse overflow-hidden">
      
      {/* 1. Notice Ticker Skeleton */}
      <div className="h-10 bg-slate-900 flex items-center px-6 gap-4">
        <div className="h-5 w-24 bg-blue-600/60 rounded-md" />
        <div className="h-4 flex-1 bg-slate-800 rounded-md" />
      </div>

      {/* 2. Hero Slider Skeleton */}
      <div className="relative min-h-[550px] lg:min-h-[650px] bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 flex items-center px-6 lg:px-16 overflow-hidden">
        <div className="max-w-4xl space-y-6 w-full py-20">
          <div className="h-7 w-56 bg-blue-500/20 rounded-full border border-blue-500/30" />
          <div className="space-y-3">
            <div className="h-12 sm:h-16 w-4/5 bg-slate-800/80 rounded-2xl" />
            <div className="h-12 sm:h-16 w-3/5 bg-slate-800/60 rounded-2xl" />
          </div>
          <div className="h-5 w-2/3 bg-slate-800/50 rounded-lg" />
          <div className="flex flex-wrap gap-4 pt-4">
            <div className="h-12 w-44 bg-blue-600/80 rounded-full" />
            <div className="h-12 w-44 bg-white/10 rounded-full border border-white/20" />
          </div>
        </div>
      </div>

      {/* 3. Stats Ribbon Skeleton */}
      <div className="py-12 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-slate-200 shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-8 w-20 bg-slate-300 rounded-lg" />
                <div className="h-3 w-28 bg-slate-200 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. About Section Skeleton */}
      <div className="py-20 max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="h-5 w-40 bg-blue-100 rounded-full" />
          <div className="h-10 w-4/5 bg-slate-200 rounded-xl" />
          <div className="space-y-2.5">
            <div className="h-4 w-full bg-slate-100 rounded-md" />
            <div className="h-4 w-5/6 bg-slate-100 rounded-md" />
            <div className="h-4 w-4/6 bg-slate-100 rounded-md" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4 pt-4">
            <div className="h-24 bg-slate-100 rounded-2xl" />
            <div className="h-24 bg-slate-100 rounded-2xl" />
          </div>
        </div>
        <div className="lg:col-span-5">
          <div className="aspect-[4/3] bg-slate-200 rounded-3xl" />
        </div>
      </div>

      {/* 5. Academics / Facilities Cards Skeleton */}
      <div className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 space-y-10">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <div className="h-4 w-32 bg-blue-100 rounded-full mx-auto" />
            <div className="h-8 w-72 bg-slate-300 rounded-xl mx-auto" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 shadow-xs">
                <div className="h-12 w-12 rounded-2xl bg-slate-200" />
                <div className="h-5 w-3/4 bg-slate-300 rounded-lg" />
                <div className="space-y-1.5">
                  <div className="h-3 w-full bg-slate-100 rounded-md" />
                  <div className="h-3 w-4/5 bg-slate-100 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default HomeSkeleton;
