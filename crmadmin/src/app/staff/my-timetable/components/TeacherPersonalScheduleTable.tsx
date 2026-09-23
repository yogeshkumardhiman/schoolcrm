"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, BookOpen, UserCheck, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TeacherPersonalScheduleTableProps {
  days: string[];
  periodsList: any[];
  myTimetable: any[];
  mySubstitutions: any[];
  getSubjectBadgeColor: (cat?: string) => string;
}

export function TeacherPersonalScheduleTable({
  days,
  periodsList,
  myTimetable,
  mySubstitutions,
  getSubjectBadgeColor,
}: TeacherPersonalScheduleTableProps) {
  const currentDayName = new Date().toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();

  // Find assigned period for this teacher
  const getTeacherSlot = (day: string, periodNumber: number) => {
    // 1. Check if today has a substitution duty for this period
    if (day.toUpperCase() === currentDayName) {
      const subDuty = mySubstitutions.find((s) => Number(s.period) === Number(periodNumber));
      if (subDuty) {
        return {
          isSubstitution: true,
          class: subDuty.class,
          section: subDuty.section || "A",
          subject: `Substitution Proxy`,
          subDetail: `In place of: ${subDuty.absentTeacher?.name || "Faculty"}`,
        };
      }
    }

    // 2. Check regular timetable period
    const entry = myTimetable.find(
      (t) => t.day?.toUpperCase() === day.toUpperCase() && Number(t.period) === Number(periodNumber)
    );

    if (entry && entry.subject) {
      return {
        isSubstitution: false,
        class: entry.class,
        section: entry.section || "A",
        subject: entry.subject,
        subDetail: null,
      };
    }

    return null;
  };

  return (
    <div className="w-full overflow-hidden p-3 sm:p-4">
      <table className="w-full border-collapse table-fixed text-center">
        <thead>
          <tr className="bg-slate-900 text-white font-bold text-[10px] uppercase tracking-wider">
            <th className="py-2.5 px-2 text-left w-20 border-r border-slate-800">
              Day
            </th>
            {periodsList.map((p, idx) => (
              <th
                key={p.id || idx}
                className={cn(
                  "py-2 px-1 border-r border-slate-800 last:border-r-0 text-center select-none",
                  p.isBreak ? "bg-amber-600 text-white w-14" : "w-[10.5%]"
                )}
              >
                <div className="flex flex-col items-center justify-center">
                  <span className="font-black text-[11px] leading-none">
                    {p.isBreak ? "BREAK" : p.label}
                  </span>
                  <span className="text-[8px] font-medium text-slate-300 font-mono tracking-tight mt-0.5 whitespace-nowrap">
                    {p.time}
                  </span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {days.map((day) => {
            const isToday = day.toUpperCase() === currentDayName;

            return (
              <tr
                key={day}
                className={cn(
                  "hover:bg-slate-50/50 transition-colors border-b border-slate-100",
                  isToday && "bg-indigo-50/20"
                )}
              >
                {/* Day Header */}
                <td className="py-2.5 px-2 border-r border-slate-200/70 bg-slate-50/70 font-black text-[11px] tracking-wider uppercase text-slate-900 text-left">
                  <div className="flex flex-col items-start gap-1">
                    <span>{day.slice(0, 3)}</span>
                    {isToday && (
                      <span className="px-1.5 py-0.2 rounded bg-indigo-600 text-white text-[7.5px] font-black uppercase">
                        Today
                      </span>
                    )}
                  </div>
                </td>

                {/* Period Slots */}
                {periodsList.map((p, pIdx) => {
                  if (p.isBreak) {
                    return (
                      <td
                        key={pIdx}
                        className="py-2 px-1 border-r border-slate-200/70 bg-amber-50/30 text-center"
                      >
                        <span className="text-[8.5px] font-black text-amber-700 uppercase tracking-wider block">
                          Break
                        </span>
                      </td>
                    );
                  }

                  const slot = getTeacherSlot(day, Number(p.id));

                  if (!slot) {
                    return (
                      <td
                        key={pIdx}
                        className="py-2 px-1 border-r border-slate-200/70 text-center text-slate-300"
                      >
                        <span className="text-[9px] font-medium uppercase tracking-wider text-slate-300">
                          — Free —
                        </span>
                      </td>
                    );
                  }

                  if (slot.isSubstitution) {
                    return (
                      <td
                        key={pIdx}
                        className="p-1 border-r border-slate-200/70 bg-amber-50/40"
                      >
                        <div className="p-1.5 rounded-lg bg-amber-100/90 border border-amber-300 shadow-2xs space-y-0.5 text-left">
                          <div className="flex items-center justify-between gap-0.5">
                            <span className="bg-amber-600 text-white text-[7.5px] font-black uppercase px-1 py-0.2 rounded">
                              Proxy
                            </span>
                            <span className="font-black text-[9px] text-amber-950 truncate">
                              {slot.class}-{slot.section}
                            </span>
                          </div>
                          <p className="text-[9.5px] font-black text-slate-900 leading-tight truncate">
                            {slot.subject}
                          </p>
                          <p className="text-[7.5px] font-bold text-amber-800 truncate">
                            {slot.subDetail}
                          </p>
                        </div>
                      </td>
                    );
                  }

                  const getClassBadgeStyle = (cls: string) => {
                    const c = (cls || "").toUpperCase();
                    if (c.includes("1ST") || c.includes("2ND") || c.includes("3RD")) {
                      return { badge: "bg-indigo-600 text-white", card: "bg-indigo-50/80 border-indigo-150" };
                    }
                    if (c.includes("9TH") || c.includes("10TH")) {
                      return { badge: "bg-purple-600 text-white", card: "bg-purple-50/80 border-purple-150" };
                    }
                    if (c.includes("11TH") || c.includes("12TH")) {
                      return { badge: "bg-emerald-600 text-white", card: "bg-emerald-50/80 border-emerald-150" };
                    }
                    return { badge: "bg-blue-600 text-white", card: "bg-blue-50/80 border-blue-150" };
                  };

                  const classStyle = getClassBadgeStyle(slot.class);

                  return (
                    <td
                      key={pIdx}
                      className="p-1 border-r border-slate-200/70"
                    >
                      <div className={cn("p-1.5 rounded-lg border shadow-2xs space-y-0.5 text-left transition-all hover:scale-[1.02]", classStyle.card)}>
                        <div className="flex items-center justify-between">
                          <span className={cn("text-[8px] font-black uppercase px-1.5 py-0.2 rounded shadow-2xs", classStyle.badge)}>
                            {slot.class}-{slot.section}
                          </span>
                        </div>
                        <p className="text-[10px] font-black text-slate-900 leading-tight truncate">
                          {slot.subject}
                        </p>
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
