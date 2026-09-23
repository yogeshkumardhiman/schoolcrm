"use client";

import React from "react";
import { GraduationCap, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ClassEntry } from "../hooks/useAttendanceState";

interface ClassOverviewTableProps {
  filteredSummaries: any[];
  isLoading: boolean;
  onSelectClass: (cls: ClassEntry) => void;
}

export function ClassOverviewTable({
  filteredSummaries,
  isLoading,
  onSelectClass,
}: ClassOverviewTableProps) {
  return (
    <table className="w-full text-sm min-w-[1000px]">
      <thead>
        <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-400 font-black text-[10px] uppercase tracking-[4px]">
          <th className="text-left py-6 px-6 text-black">Class · Section</th>
          <th className="text-left py-6 px-6 text-black">Class Teacher</th>
          <th className="text-center py-6 px-6 text-black">Students</th>
          <th className="text-center py-6 px-6 text-black">Present</th>
          <th className="text-center py-6 px-6 text-black">Absent</th>
          <th className="text-center py-6 px-6 text-black">On Leave</th>
          <th className="text-right py-6 px-6 text-black">Attendance %</th>
          <th className="py-6 px-4"></th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {!isLoading &&
          filteredSummaries.map((s: any, idx: number) => {
            const total = parseInt(String(s.cls.population), 10) || 0;
            const pct =
              s.present > 0 ? Math.round((s.present / total) * 100) : null;

            return (
              <tr
                key={idx}
                className="hover:bg-slate-50/50 border-b border-slate-100 transition-colors duration-200 group cursor-pointer"
                onClick={() => onSelectClass(s.cls)}
              >
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 text-slate-400 group-hover:text-indigo-600 transition-colors">
                      <GraduationCap size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 leading-tight uppercase">
                        Grade {s.cls.class}
                      </p>
                      <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider mt-0.5">
                        Section {s.cls.section || "—"}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  {s.cls.teacher &&
                  s.cls.teacher !== "Unassigned" &&
                  s.cls.teacher !== "--" ? (
                    <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      👨‍🏫 {s.cls.teacher}
                    </span>
                  ) : (
                    <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                      Unassigned
                    </span>
                  )}
                </td>
                <td className="py-4 px-6 text-center font-bold text-slate-900">
                  {total}
                </td>
                <td className="py-4 px-6 text-center">
                  <Badge
                    variant="outline"
                    className="bg-emerald-50 text-emerald-600 border-emerald-100 font-bold text-[10px] tracking-wider py-1 px-3 rounded-xl"
                  >
                    {s.present}
                  </Badge>
                </td>
                <td className="py-4 px-6 text-center">
                  <Badge
                    variant="outline"
                    className="bg-rose-50 text-rose-600 border-rose-100 font-bold text-[10px] tracking-wider py-1 px-3 rounded-xl"
                  >
                    {s.absent}
                  </Badge>
                </td>
                <td className="py-4 px-6 text-center">
                  <Badge
                    variant="outline"
                    className="bg-amber-50 text-amber-600 border-amber-100 font-bold text-[10px] tracking-wider py-1 px-3 rounded-xl"
                  >
                    {s.leave}
                  </Badge>
                </td>
                <td className="py-4 px-6 text-right">
                  {pct !== null ? (
                    <div className="flex items-center justify-end gap-3">
                      <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            pct >= 75
                              ? "bg-emerald-500"
                              : pct >= 50
                              ? "bg-amber-500"
                              : "bg-rose-500"
                          )}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-900 w-10 text-right">
                        {pct}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-300 uppercase">
                      Not Marked
                    </span>
                  )}
                </td>
                <td className="py-4 px-4 text-right">
                  <ChevronRight
                    size={16}
                    className="text-slate-300 group-hover:text-indigo-600 transition-colors inline-block"
                  />
                </td>
              </tr>
            );
          })}
      </tbody>
    </table>
  );
}
