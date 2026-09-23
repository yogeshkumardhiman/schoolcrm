"use client";

import React from "react";
import {
  Calendar as CalendarIcon,
  ChevronRight,
  ArrowLeft,
  Loader2,
  FileDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClassEntry } from "../hooks/useAttendanceState";

interface AttendanceHeaderProps {
  drillClass: ClassEntry | null;
  isTeacher: boolean;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  onBackToOverview: () => void;
  onSync: () => void;
  isLoading: boolean;
}

export function AttendanceHeader({
  drillClass,
  isTeacher,
  selectedDate,
  setSelectedDate,
  onBackToOverview,
  onSync,
  isLoading,
}: AttendanceHeaderProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-in fade-in duration-500" suppressHydrationWarning>
      <div>
        {/* Only Admin/Principal can return to overview when drilled in */}
        {drillClass && !isTeacher && (
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={onBackToOverview}
              className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 hover:text-slate-700 transition-colors uppercase tracking-widest cursor-pointer"
            >
              <ArrowLeft size={12} /> All Classes
            </button>
            <ChevronRight size={10} className="text-slate-300" />
            <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">
              {drillClass.class} – {drillClass.section}
            </span>
          </div>
        )}

        {/* Teacher Class Incharge Badge */}
        {drillClass && isTeacher && (
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest border border-indigo-200">
              Class Incharge
            </span>
            <ChevronRight size={10} className="text-slate-300" />
            <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">
              Grade {drillClass.class} – Section {drillClass.section}
            </span>
          </div>
        )}

        <h2 className="text-3xl font-black tracking-tighter text-slate-900 flex items-center gap-3 uppercase font-heading">
          {drillClass ? (
            `${drillClass.class} · Section ${drillClass.section}`
          ) : (
            <>
              Attendance <span className="text-indigo-600">Telemetry</span>
            </>
          )}
        </h2>

        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[4px] mt-1">
          {drillClass
            ? `Daily Class Attendance Registry • Faculty Incharge: ${drillClass.teacher || "Faculty"}`
            : "Class-wise scholarly attendance overview and institutional governance."}
        </p>
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto" suppressHydrationWarning>
        <div className="relative">
          <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 pointer-events-none" />
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="pl-12 h-11 w-44 text-xs font-bold border-slate-100 bg-slate-50/50 rounded-xl"
            suppressHydrationWarning
          />
        </div>
        <Button
          variant="outline"
          onClick={onSync}
          className="h-11 px-6 gap-2 border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm cursor-pointer"
        >
          {mounted && isLoading ? (
            <Loader2 size={14} className="animate-spin text-indigo-600" />
          ) : (
            <FileDown size={14} />
          )}
          Sync
        </Button>
      </div>
    </div>
  );
}
