"use client";

import React from "react";
import { School, Wand2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ClassesHeaderProps {
  onAutoAssign: () => void;
  isAutoAssignPending: boolean;
  sectionsCount: number;
  onOpenAllocate: () => void;
}

export function ClassesHeader({
  onAutoAssign,
  isAutoAssignPending,
  sectionsCount,
  onOpenAllocate,
}: ClassesHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs print:hidden">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm shadow-indigo-600/20">
          <School size={18} />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase font-heading">
            Academic <span className="text-indigo-600">Classes & Sections Control</span>
          </h2>
          <p className="text-xs font-medium text-slate-400">
            Divide students into sections, assign class teachers, and auto-generate alphabetical roll numbers.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {/* Auto Assign All Teachers */}
        <Button
          onClick={onAutoAssign}
          disabled={isAutoAssignPending || sectionsCount === 0}
          variant="outline"
          className="h-10 px-3.5 border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer flex items-center gap-1.5"
          title="Automatically assign available teachers to all sections without teachers"
        >
          <Wand2 size={14} /> Auto-Assign Teachers
        </Button>

        {/* Quick Divide & Allocate */}
        <Button
          onClick={onOpenAllocate}
          className="h-10 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
        >
          <Plus size={15} /> + Allocate Section
        </Button>
      </div>
    </div>
  );
}
