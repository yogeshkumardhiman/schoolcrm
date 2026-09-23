"use client";

import React from "react";
import { Utensils, Edit2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface PeriodItem {
  id: number | string;
  label: string;
  time: string;
  isBreak: boolean;
}

interface TimetableMatrixTableProps {
  days: string[];
  periodsList: PeriodItem[];
  getEntry: (day: string, periodNumber: number) => {
    subject: string;
    teacher: string;
    staffId: number | null;
    category: string;
    isAssigned: boolean;
  };
  getSubjectBadgeColor: (category?: string) => string;
  onOpenEditSlot: (day: string, periodNumber: number, periodTime: string, entry: any) => void;
}

export function TimetableMatrixTable({
  days,
  periodsList,
  getEntry,
  getSubjectBadgeColor,
  onOpenEditSlot,
}: TimetableMatrixTableProps) {
  return (
    <div className="w-full overflow-hidden p-3 sm:p-4">
      <table className="w-full text-center border-collapse text-xs table-fixed">
        <thead>
          <tr className="bg-slate-900 text-white font-bold text-[10px] uppercase tracking-wider">
            <th className="py-2.5 px-2 text-left w-20 border-r border-slate-800">
              Day
            </th>
            {periodsList.map((p) => (
              <th
                key={p.id}
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
          {days.map((day) => (
            <tr key={day} className="hover:bg-slate-50/50 transition-colors">
              {/* Day Column */}
              <td className="p-3 pl-4 bg-slate-50/80 font-black text-slate-900 uppercase tracking-wider text-left border-r border-slate-100">
                {day.slice(0, 3)}
              </td>

              {periodsList.map((period) => {
                if (period.isBreak) {
                  return (
                    <td
                      key={period.id}
                      className="bg-amber-500/10 border-r border-slate-200 p-1 text-center align-middle"
                    >
                      <div className="flex flex-col items-center justify-center gap-1 text-amber-900 bg-amber-100/90 border border-amber-300/80 rounded-xl py-2 px-1 shadow-2xs h-full min-h-16">
                        <div className="h-6 w-6 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-2xs">
                          <Utensils size={12} />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-wider text-amber-950">
                          Break
                        </span>
                      </div>
                    </td>
                  );
                }

                const entry = getEntry(day, Number(period.id));
                return (
                  <td
                    key={period.id}
                    onClick={() => onOpenEditSlot(day, Number(period.id), period.time, entry)}
                    className="p-1 border-r border-slate-100 last:border-r-0 align-top cursor-pointer group"
                  >
                    {entry.isAssigned ? (
                      <div className={cn(
                        "p-2 rounded-xl border transition-all text-left space-y-0.5 h-full min-h-16 flex flex-col justify-between relative shadow-2xs group-hover:scale-[1.02]",
                        getSubjectBadgeColor(entry.category)
                      )}>
                        <div className="flex justify-between items-start gap-1">
                          <p className="font-black text-slate-900 text-[10.5px] leading-tight line-clamp-2">
                            {entry.subject}
                          </p>
                          <Edit2 size={10} className="text-slate-400 group-hover:text-indigo-600 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-[9px] font-semibold opacity-90 truncate pt-0.5 text-slate-600">
                          👨‍🏫 {entry.teacher}
                        </p>
                      </div>
                    ) : (
                      <div className="p-2 rounded-xl border border-dashed border-slate-200 hover:border-indigo-300 bg-slate-50/40 hover:bg-indigo-50/40 transition-all text-center h-full min-h-16 flex flex-col items-center justify-center gap-0.5 group/slot">
                        <span className="text-[10px] font-bold text-slate-400 group-hover/slot:text-indigo-600 transition-colors flex items-center gap-1">
                          <Plus size={10} /> Assign
                        </span>
                        <span className="text-[8.5px] text-slate-300 font-medium">Free Period</span>
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
