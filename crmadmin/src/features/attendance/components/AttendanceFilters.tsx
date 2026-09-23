"use client";

import React from "react";
import { Search, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ClassEntry } from "../hooks/useAttendanceState";

interface AttendanceFiltersProps {
  drillClass: ClassEntry | null;
  isTeacher: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterClass: string;
  setFilterClass: (cls: string) => void;
  filterSection: string;
  setFilterSection: (sec: string) => void;
  statusFilter: string;
  setStatusFilter: (st: string) => void;
  uniqueClassNames: string[];
  uniqueSections: string[];
  totalScholarsCount: number;
}

export function AttendanceFilters({
  drillClass,
  isTeacher,
  searchQuery,
  setSearchQuery,
  filterClass,
  setFilterClass,
  filterSection,
  setFilterSection,
  statusFilter,
  setStatusFilter,
  uniqueClassNames,
  uniqueSections,
  totalScholarsCount,
}: AttendanceFiltersProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px] max-w-xs">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 pointer-events-none" />
        <Input
          placeholder={
            drillClass ? "Search scholar name, roll..." : "Search class / teacher..."
          }
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-11 border-slate-100 bg-slate-50/50 rounded-xl font-bold text-xs focus:bg-white transition-all shadow-none"
        />
      </div>

      {/* Class/Section Dropdowns — Only shown for Admin overview (never for Teachers) */}
      {!drillClass && !isTeacher && (
        <>
          <div className="relative">
            <select
              value={filterClass}
              onChange={(e) => {
                setFilterClass(e.target.value);
                setFilterSection("ALL");
              }}
              className="h-11 px-4 pr-10 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest appearance-none outline-none focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer shadow-sm"
            >
              <option value="ALL">All Classes</option>
              {uniqueClassNames.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
          </div>

          {uniqueSections.length > 0 && (
            <div className="relative">
              <select
                value={filterSection}
                onChange={(e) => setFilterSection(e.target.value)}
                className="h-11 px-4 pr-10 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest appearance-none outline-none focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer shadow-sm"
              >
                <option value="ALL">All Sections</option>
                {uniqueSections.map((sec) => (
                  <option key={sec} value={sec}>
                    Section {sec}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
            </div>
          )}
        </>
      )}

      {/* Drill-down Status Pills for Class Roster */}
      {drillClass && (
        <div className="flex items-center gap-1.5 bg-slate-200/50 p-1 rounded-2xl border border-slate-200 shadow-inner h-11">
          {["ALL", "PRESENT", "ABSENT", "LEAVE", "HALF DAY", "NOT MARKED"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer",
                statusFilter === s
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              {s === "ALL" ? `All (${totalScholarsCount})` : s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
