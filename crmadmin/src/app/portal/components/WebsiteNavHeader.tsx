"use client";

import React from "react";
import Link from "next/link";
import { Globe, ChevronRight } from "lucide-react";

interface WebsiteNavHeaderProps {
  title?: string;
  description?: string;
  actionButton?: React.ReactNode;
}

export function WebsiteNavHeader({
  title = "Website Settings Console",
  description = "Configure official school website parameters, section sorting, theme presets, and CBSE details in real time.",
  actionButton
}: WebsiteNavHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-1">
          <span>Website CMS</span>
          <ChevronRight size={12} />
          <span className="text-blue-600">{title}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3 font-heading">
          <div className="h-10 w-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
            <Globe size={22} className="animate-pulse" />
          </div>
          <span>{title}</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">{description}</p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {actionButton}
      </div>
    </div>
  );
}
