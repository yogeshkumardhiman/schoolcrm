"use client";

import React from "react";
import { AlertTriangle, Clock, MapPin, Sparkles, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SubstitutionDuty {
  id: number;
  period: string | number;
  class: string;
  section: string;
  date: string;
  absentTeacher?: {
    name: string;
    subject?: string;
  };
}

interface TeacherSubstitutionAlertProps {
  substitutions: SubstitutionDuty[];
}

export function TeacherSubstitutionAlert({
  substitutions,
}: TeacherSubstitutionAlertProps) {
  if (!substitutions || substitutions.length === 0) return null;

  return (
    <div className="bg-linear-to-r from-amber-500 via-orange-500 to-rose-500 p-0.5 rounded-2xl shadow-lg shadow-amber-500/10 animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="bg-white p-5 rounded-[15px] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold ring-1 ring-amber-200">
              <AlertTriangle size={18} className="animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                Today's Substitution & Proxy Duty Assigned
                <Badge className="bg-rose-500 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5">
                  Action Required
                </Badge>
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                Institutional Administrative Proxy Schedule for Today
              </p>
            </div>
          </div>

          <Badge
            variant="outline"
            className="border-amber-200 bg-amber-50 text-amber-700 font-bold text-[10px] uppercase tracking-wider py-1 px-3 rounded-lg"
          >
            {substitutions.length} {substitutions.length === 1 ? "Duty" : "Duties"} Today
          </Badge>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {substitutions.map((sub, idx) => (
            <div
              key={sub.id || idx}
              className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl hover:bg-amber-50/40 hover:border-amber-200 transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <Badge className="bg-indigo-600 text-white font-black text-[10px] uppercase px-2.5 py-0.5">
                  Period {sub.period}
                </Badge>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Clock size={11} className="text-slate-400" /> Today
                </span>
              </div>

              <p className="text-xs font-black text-slate-900 uppercase">
                Grade {sub.class} · Section {sub.section || "A"}
              </p>

              <div className="mt-2 pt-2 border-t border-slate-200/50 flex items-center justify-between text-[10px] font-bold">
                <span className="text-slate-500">In place of:</span>
                <span className="text-rose-600 font-black">
                  {sub.absentTeacher?.name || "Absent Faculty"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
