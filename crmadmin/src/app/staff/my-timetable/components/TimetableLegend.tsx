"use client";

import React from "react";

export function TimetableLegend() {
  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
      <div className="flex flex-wrap items-center gap-4">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
          Subject Categories:
        </span>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
          <span className="font-bold text-slate-700 text-[11px]">Mathematics</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span className="font-bold text-slate-700 text-[11px]">Science & EVS</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          <span className="font-bold text-slate-700 text-[11px]">Languages</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
          <span className="font-bold text-slate-700 text-[11px]">Computer / AI Lab</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
          <span className="font-bold text-slate-700 text-[11px]">Art & Sports</span>
        </div>
      </div>

      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
        CBSE / State Curriculum Standard • Session 2026-2027
      </p>
    </div>
  );
}
