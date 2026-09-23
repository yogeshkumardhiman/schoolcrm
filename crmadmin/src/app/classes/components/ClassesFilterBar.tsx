"use client";

import React from "react";
import { Table as TableIcon, Layers, Search, RefreshCw, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ClassesFilterBarProps {
  activeTab: "classes" | "sections";
  setActiveTab: (tab: "classes" | "sections") => void;
  classesCount: number;
  sectionsCount: number;
  activeClassList: string[];
  selectedClassFilter: string;
  setSelectedClassFilter: (val: string) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  onRefresh: () => void;
}

export function ClassesFilterBar({
  activeTab,
  setActiveTab,
  classesCount,
  sectionsCount,
  activeClassList,
  selectedClassFilter,
  setSelectedClassFilter,
  searchQuery,
  setSearchQuery,
  onRefresh,
}: ClassesFilterBarProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 px-5 rounded-2xl border border-slate-200/80 shadow-xs">
      {/* Tab Switcher */}
      <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab("classes")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer",
            activeTab === "classes"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-500 hover:text-slate-900"
          )}
        >
          <TableIcon size={14} /> Classes Registry Table ({classesCount})
        </button>

        <button
          onClick={() => setActiveTab("sections")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer",
            activeTab === "sections"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-500 hover:text-slate-900"
          )}
        >
          <Layers size={14} /> Sections & Teachers Directory ({sectionsCount})
        </button>
      </div>

      {/* Filter by Grade & Search */}
      <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
        <div className="relative">
          <select
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            className="appearance-none h-10 px-3 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase outline-none cursor-pointer text-slate-800"
          >
            <option value="ALL">All Grades</option>
            {activeClassList.map((cls) => (
              <option key={cls} value={cls}>
                Class {cls}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={13} />
        </div>

        <div className="relative flex-1 sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <Input
            placeholder="Search Class, Teacher, Room..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 pl-9 bg-slate-50 border-slate-200 text-xs rounded-xl"
          />
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={onRefresh}
          className="h-10 px-3 rounded-xl text-xs font-bold text-slate-600 cursor-pointer"
        >
          <RefreshCw size={13} className="mr-1" /> Refresh
        </Button>
      </div>
    </div>
  );
}
