"use client";

import React from "react";
import { Trophy } from "lucide-react";

export function MarksHeader() {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-black tracking-tighter text-slate-900 flex items-center gap-3 uppercase font-heading">
          <Trophy className="text-amber-500" /> Academic <span className="text-indigo-600">Results</span>
        </h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[4px] mt-1">
          Manage and track scholar performance nodes.
        </p>
      </div>
    </div>
  );
}
