"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface TimetableBannerProps {
  selectedClass: string;
  selectedSection: string;
  schoolStartTime: string;
  schoolEndTime: string;
}

export function TimetableBanner({
  selectedClass,
  selectedSection,
  schoolStartTime,
  schoolEndTime,
}: TimetableBannerProps) {
  return (
    <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2.5">
        <Badge className="bg-indigo-600 text-white font-black text-xs uppercase px-3 py-1 shadow-xs">
          Class {selectedClass} – Section {selectedSection}
        </Badge>
        <span className="text-xs font-bold text-slate-700 tracking-wide uppercase">
          RANI PUBLIC SCHOOL • Academic Session 2026–2027
        </span>
      </div>

      <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
        <span className="flex items-center gap-1.5 text-indigo-600 font-bold">
          <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
          Click any period box to edit/add custom subject
        </span>
        <span>•</span>
        <span className="font-mono text-slate-700 font-bold flex items-center gap-1">
          <Clock size={12} className="text-slate-400" />
          {schoolStartTime} – {schoolEndTime}
        </span>
      </div>
    </div>
  );
}
