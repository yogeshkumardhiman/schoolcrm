"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, Users, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { ClassEntry } from "../hooks/useAttendanceState";

interface AttendanceKpiCardsProps {
  isTeacher: boolean;
  drillClass: ClassEntry | null;
  allClassesCount: number;
  grandTotal: {
    students: number;
    present: number;
    absent: number;
    leave: number;
    halfDay?: number;
  };
  isLoading: boolean;
}

export function AttendanceKpiCards({
  isTeacher,
  drillClass,
  allClassesCount,
  grandTotal,
  isLoading,
}: AttendanceKpiCardsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cards = [
    {
      label: (mounted && isTeacher) ? "My Class" : "Total Classes",
      value:
        (mounted && isTeacher && drillClass)
          ? `Grade ${drillClass.class}-${drillClass.section}`
          : allClassesCount,
      icon: BookOpen,
      colorClass: "bg-indigo-600 shadow-indigo-100",
    },
    {
      label: "Total Scholars",
      value: grandTotal.students,
      icon: Users,
      colorClass: "bg-slate-900 shadow-slate-200",
    },
    {
      label: "Present Today",
      value: grandTotal.present,
      icon: CheckCircle2,
      colorClass: "bg-emerald-500 shadow-emerald-100",
    },
    {
      label: "Absent Today",
      value: grandTotal.absent,
      icon: XCircle,
      colorClass: "bg-red-500 shadow-red-100",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-4 animate-in fade-in duration-500">
      {cards.map(({ label, value, icon: Icon, colorClass }) => (
        <div
          key={label}
          className="bg-white border border-slate-200 rounded-lgxl p-6 flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.02)]"
        >
          <div>
            <p 
              suppressHydrationWarning 
              className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1"
            >
              {label}
            </p>
            <h3 
              suppressHydrationWarning
              className="text-2xl font-black text-slate-900 tracking-tight font-heading"
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin text-slate-300 mt-1" />
              ) : (
                value
              )}
            </h3>
          </div>
          <div
            className={`h-12 w-12 rounded-xl flex items-center justify-center text-white ${colorClass}`}
          >
            <Icon size={22} />
          </div>
        </div>
      ))}
    </div>
  );
}
