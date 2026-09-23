"use client";

import React from "react";
import { Calendar, Printer, ChevronDown, Settings2, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const SECTIONS = ["A", "B", "C", "D", "E"];

interface TimetableHeaderProps {
  selectedClass: string;
  setSelectedClass: (cls: string) => void;
  selectedSection: string;
  setSelectedSection: (sec: string) => void;
  activeClassList: string[];
  viewMode?: "PERSONAL" | "CLASS_MATRIX";
  isTeacher?: boolean;
  isAdmin?: boolean;
  isClassTeacher?: boolean;
  isSubjectTeacher?: boolean;
  userName?: string;
  userClass?: string;
  userSection?: string;
  onOpenTimingModal: () => void;
  onOpenAssignModal: () => void;
  onAutoFill: () => void;
  onPrint: () => void;
}

export function TimetableHeader({
  selectedClass,
  setSelectedClass,
  selectedSection,
  setSelectedSection,
  activeClassList,
  viewMode = "PERSONAL",
  isTeacher = false,
  isAdmin = false,
  isClassTeacher = false,
  isSubjectTeacher = false,
  userName = "Faculty",
  userClass = "",
  userSection = "A",
  onOpenTimingModal,
  onOpenAssignModal,
  onAutoFill,
  onPrint,
}: TimetableHeaderProps) {
  return (
    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs print:hidden">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
          <Calendar size={16} />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight uppercase font-heading">
            {isSubjectTeacher ? (
              <>Faculty <span className="text-indigo-600">Weekly Schedule</span></>
            ) : isClassTeacher ? (
              <>Class <span className="text-indigo-600">Timetable & Schedule</span></>
            ) : (
              <>Class <span className="text-indigo-600">Timetable Studio</span></>
            )}
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {isSubjectTeacher
              ? `Personal Teaching Periods & Daily Proxy Duty (${userName})`
              : isClassTeacher
              ? `Class Incharge Timetable (Grade ${userClass}-${userSection}) & Faculty Slots`
              : "Institutional Weekly Period Matrix & Teacher Allocations (Mon – Sat)"}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Only Admins and Class Teachers see class selection / matrix controls */}
        {viewMode === "CLASS_MATRIX" && !isSubjectTeacher && (
          <>
            {isClassTeacher ? (
              /* Class Teacher: Fixed Incharge Class Badge */
              <div className="h-9 px-3.5 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-black text-indigo-950 uppercase flex items-center gap-2 shadow-2xs">
                <span className="text-indigo-600 text-[10px] font-bold">Incharge Class:</span>
                <span className="bg-indigo-600 text-white px-2 py-0.5 rounded-md text-[10px] tracking-wider">
                  Class {userClass} – {userSection}
                </span>
              </div>
            ) : (
              /* Admin: Global Class & Section Dropdowns */
              <>
                <div className="relative">
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="appearance-none h-9 px-3 pr-7 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase outline-none cursor-pointer text-slate-800"
                  >
                    {activeClassList.map((cls) => (
                      <option key={cls} value={cls}>
                        Class {cls}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={12} />
                </div>

                <div className="relative">
                  <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="appearance-none h-9 px-3 pr-7 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase outline-none cursor-pointer text-slate-800"
                  >
                    {SECTIONS.map((sec) => (
                      <option key={sec} value={sec}>
                        Sec {sec}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={12} />
                </div>
              </>
            )}

            {/* Auto-fill Schedule (Admins only) */}
            {isAdmin && (
              <Button
                onClick={onAutoFill}
                variant="outline"
                size="sm"
                className="h-9 px-3 border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles size={13} /> Auto-Fill
              </Button>
            )}

            {/* Quick Assign Period Modal Trigger */}
            {(isAdmin || isClassTeacher) && (
              <Button
                onClick={onOpenAssignModal}
                size="sm"
                className="h-9 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer flex items-center gap-1.5"
              >
                <Plus size={13} /> Assign
              </Button>
            )}
          </>
        )}

        {/* Timing Setup Modal Trigger (Admins only) */}
        {isAdmin && (
          <Button
            onClick={onOpenTimingModal}
            variant="outline"
            size="sm"
            className="h-9 px-3 rounded-xl border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer"
          >
            <Settings2 size={13} className="text-slate-500" /> Timing Setup
          </Button>
        )}

        {/* Print Schedule */}
        <Button
          onClick={onPrint}
          size="sm"
          className="h-9 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
        >
          <Printer size={13} /> Print
        </Button>
      </div>
    </div>
  );
}
