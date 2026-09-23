"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, Clock, Save, Loader2, RefreshCw } from "lucide-react";

import { HalfDayOutpassModal } from "./HalfDayOutpassModal";

interface ClassRosterAttendanceTableProps {
  drillMerged: any[];
  drillLoading: boolean;
  studentsLoading: boolean;
  isSaving: boolean;
  onSubmitBulk: (records: { studentId: number; status: string; departureTime?: string; remarks?: string }[]) => void;
}

export function ClassRosterAttendanceTable({
  drillMerged,
  drillLoading,
  studentsLoading,
  isSaving,
  onSubmitBulk,
}: ClassRosterAttendanceTableProps) {
  // Local state for interactive marking without per-click API calls
  const [localStatusMap, setLocalStatusMap] = useState<Record<number, string>>({});
  const [studentDetailsMap, setStudentDetailsMap] = useState<Record<number, { departureTime?: string; remarks?: string }>>({});
  const [halfDayModalStudent, setHalfDayModalStudent] = useState<any | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Initialize or update local state from server records when loaded
  useEffect(() => {
    if (drillMerged.length > 0) {
      const initialMap: Record<number, string> = {};
      const initialDetails: Record<number, { departureTime?: string; remarks?: string }> = {};
      drillMerged.forEach((s: any) => {
        // If already marked on server, preserve it; otherwise leave as "NOT MARKED"
        initialMap[s.id] = s.status && s.status !== "NOT MARKED" ? s.status : "NOT MARKED";
        if (s.departureTime || s.remarks) {
          initialDetails[s.id] = { departureTime: s.departureTime, remarks: s.remarks };
        }
      });
      setLocalStatusMap(initialMap);
      setStudentDetailsMap(initialDetails);
      setIsDirty(false);
    }
  }, [drillMerged]);

  // Toggle single student status locally
  const setStudentStatus = (studentId: number, status: string, studentObj?: any) => {
    if (status === "HALF_DAY") {
      setHalfDayModalStudent(studentObj || drillMerged.find((s) => s.id === studentId) || { id: studentId });
      return;
    }
    setLocalStatusMap((prev) => ({
      ...prev,
      [studentId]: status,
    }));
    setIsDirty(true);
  };

  const handleConfirmHalfDay = (data: {
    studentId: number;
    departureTime: string;
    reason: string;
    pickedBy: string;
    phone: string;
  }) => {
    setLocalStatusMap((prev) => ({
      ...prev,
      [data.studentId]: "HALF_DAY",
    }));
    setStudentDetailsMap((prev) => ({
      ...prev,
      [data.studentId]: {
        departureTime: data.departureTime,
        remarks: `${data.reason} | Picked by: ${data.pickedBy} (${data.phone})`,
      },
    }));
    setIsDirty(true);
  };

  // Mark all students present locally
  const handleSelectAllPresent = () => {
    const newMap: Record<number, string> = {};
    drillMerged.forEach((s: any) => {
      newMap[s.id] = "PRESENT";
    });
    setLocalStatusMap(newMap);
    setIsDirty(true);
  };

  // Mark all students absent locally
  const handleSelectAllAbsent = () => {
    const newMap: Record<number, string> = {};
    drillMerged.forEach((s: any) => {
      newMap[s.id] = "ABSENT";
    });
    setLocalStatusMap(newMap);
    setIsDirty(true);
  };

  // Mark all students on leave locally
  const handleSelectAllLeave = () => {
    const newMap: Record<number, string> = {};
    drillMerged.forEach((s: any) => {
      newMap[s.id] = "LEAVE";
    });
    setLocalStatusMap(newMap);
    setIsDirty(true);
  };

  // Calculate live summary stats from local state
  const liveStats = useMemo(() => {
    const presentCount = Object.values(localStatusMap).filter((st) => st === "PRESENT").length;
    const absentCount = Object.values(localStatusMap).filter((st) => st === "ABSENT").length;
    const leaveCount = Object.values(localStatusMap).filter((st) => st === "LEAVE").length;
    const halfDayCount = Object.values(localStatusMap).filter((st) => st === "HALF_DAY" || st === "HALF DAY").length;
    const notMarkedCount = Object.values(localStatusMap).filter((st) => !st || st === "NOT MARKED").length;
    return {
      total: drillMerged.length,
      present: presentCount,
      absent: absentCount,
      leave: leaveCount,
      halfDay: halfDayCount,
      notMarked: notMarkedCount,
    };
  }, [localStatusMap, drillMerged]);

  // Handle single batch submit
  const handleSaveAttendance = () => {
    const records = Object.entries(localStatusMap).map(([studentId, status]) => {
      const idNum = Number(studentId);
      const details = studentDetailsMap[idNum] || {};
      const effectiveStatus = (!status || status === "NOT MARKED") ? "PRESENT" : status;
      return {
        studentId: idNum,
        status: effectiveStatus,
        departureTime: details.departureTime,
        remarks: details.remarks,
      };
    });
    onSubmitBulk(records);
    setIsDirty(false);
  };

  return (
    <div className="space-y-3">
      {/* 🚀 COMPACT QUICK BULK CONTROLS & SUBMIT BAR */}
      <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        {/* Compact Bulk Action Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Button
            type="button"
            size="sm"
            onClick={handleSelectAllPresent}
            disabled={drillLoading || studentsLoading || isSaving}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold h-8 px-3 shadow-xs flex items-center gap-1 cursor-pointer transition-all active:scale-95"
          >
            <CheckCircle2 size={13} /> All Present
          </Button>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleSelectAllAbsent}
            disabled={drillLoading || studentsLoading || isSaving}
            className="border-rose-200 text-rose-700 bg-white hover:bg-rose-50 hover:text-rose-800 rounded-lg text-[11px] font-bold h-8 px-3 shadow-xs flex items-center gap-1 cursor-pointer transition-all active:scale-95"
          >
            <XCircle size={13} /> All Absent
          </Button>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleSelectAllLeave}
            disabled={drillLoading || studentsLoading || isSaving}
            className="border-amber-200 text-amber-700 bg-white hover:bg-amber-50 hover:text-amber-800 rounded-lg text-[11px] font-bold h-8 px-3 shadow-xs flex items-center gap-1 cursor-pointer transition-all active:scale-95"
          >
            <Clock size={13} /> All Leave
          </Button>

          {/* Compact Counter Badges */}
          <div className="flex items-center gap-1.5 ml-1.5">
            {liveStats.notMarked > 0 && (
              <span className="text-[10px] font-black text-slate-600 bg-slate-200/90 px-2 py-0.5 rounded-md">
                {liveStats.notMarked} Not Marked
              </span>
            )}
            {liveStats.present > 0 && (
              <span className="text-[10px] font-black text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-md">
                {liveStats.present} Present
              </span>
            )}
            {liveStats.absent > 0 && (
              <span className="text-[10px] font-black text-rose-700 bg-rose-100/90 px-2 py-0.5 rounded-md">
                {liveStats.absent} Absent
              </span>
            )}
            {liveStats.leave > 0 && (
              <span className="text-[10px] font-black text-amber-700 bg-amber-100/90 px-2 py-0.5 rounded-md">
                {liveStats.leave} Leave
              </span>
            )}
            {liveStats.halfDay > 0 && (
              <span className="text-[10px] font-black text-purple-700 bg-purple-100/90 px-2 py-0.5 rounded-md">
                {liveStats.halfDay} Half Day
              </span>
            )}
          </div>
        </div>

        {/* Submit & Save Button */}
        <div className="flex items-center gap-2">
          {isDirty && (
            <span className="text-[10px] font-bold text-amber-600 animate-pulse hidden sm:inline">
              ● Unsaved Changes
            </span>
          )}
          <Button
            type="button"
            onClick={handleSaveAttendance}
            disabled={drillLoading || studentsLoading || isSaving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider h-8 px-4 rounded-xl shadow-xs cursor-pointer active:scale-95 transition-all flex items-center gap-1.5"
          >
            {isSaving ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Save size={13} />
            )}
            <span>Submit & Save</span>
          </Button>
        </div>
      </div>

      {/* 📋 ROSTER TABLE */}
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">
          <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-400 font-black text-[10px] uppercase tracking-[4px]">
            <th className="text-left py-4 px-6 text-black">Scholar Identity</th>
            <th className="text-center py-4 px-6 text-black">Roll No</th>
            <th className="text-center py-4 px-6 text-black">Admission No</th>
            <th className="text-center py-4 px-6 text-black">Attendance Status</th>
            <th className="text-right py-4 px-8 text-black">Mark Selection</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {!drillLoading &&
            !studentsLoading &&
            drillMerged.map((s: any, idx: number) => {
              const currentStatus = localStatusMap[s.id] || s.status || "NOT MARKED";
              const isHalfDay = currentStatus === "HALF_DAY" || currentStatus === "HALF DAY";
              const statusColor =
                currentStatus === "PRESENT"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : currentStatus === "ABSENT"
                  ? "bg-rose-50 text-rose-700 border-rose-200"
                  : currentStatus === "LEAVE"
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : isHalfDay
                  ? "bg-purple-50 text-purple-700 border-purple-200"
                  : "bg-slate-100 text-slate-500 border-slate-200";

              return (
                <tr
                  key={s.id || idx}
                  className="hover:bg-slate-50/50 border-b border-slate-100 transition-colors duration-200 group"
                >
                  {/* Scholar Identity */}
                  <td className="py-3 px-6">
                    <Link
                      href={`/students/view/${s.id}`}
                      className="flex items-center space-x-3 group/item hover:text-indigo-600"
                    >
                      <div className="h-8.5 w-8.5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-xs transition-transform group-hover/item:scale-105">
                        <img
                          src={
                            s.image ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.name}`
                          }
                          className="h-full w-full object-cover"
                          alt=""
                        />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 leading-tight group-hover/item:text-indigo-600 transition-colors text-xs">
                          {s.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">
                          #{s.admissionNo || "—"} • View Full Portfolio →
                        </p>
                      </div>
                    </Link>
                  </td>

                  {/* Roll No */}
                  <td className="py-3 px-6 text-center font-bold text-slate-700 text-xs">
                    {s.rollNo ? String(s.rollNo).padStart(2, "0") : "—"}
                  </td>

                  {/* Admission No */}
                  <td className="py-3 px-6 text-center font-bold text-slate-500 font-mono text-xs">
                    {s.admissionNo || "—"}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-6 text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <Badge
                        variant="outline"
                        onClick={() => isHalfDay && setHalfDayModalStudent(s)}
                        className={cn(
                          "font-black text-[9px] uppercase tracking-wider py-0.5 px-2.5 rounded-lg border",
                          isHalfDay ? "cursor-pointer hover:bg-purple-100" : "",
                          statusColor
                        )}
                        title={isHalfDay ? "Click to edit Half Day departure details" : undefined}
                      >
                        {isHalfDay ? "HALF DAY" : currentStatus}
                      </Badge>
                      {isHalfDay && (studentDetailsMap[s.id]?.departureTime || s.departureTime) && (
                        <span className="text-[9px] font-bold text-purple-700 font-mono tracking-tight">
                          Exit: {studentDetailsMap[s.id]?.departureTime || s.departureTime}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Local Toggle Buttons: P, A, L, HD (Compact size) */}
                  <td className="py-3 px-8 text-right">
                    <div className="inline-flex items-center gap-1 bg-slate-100/70 p-0.5 rounded-lg border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setStudentStatus(s.id, "PRESENT")}
                        className={cn(
                           "h-7 w-7 rounded-md text-xs font-black uppercase transition-all cursor-pointer flex items-center justify-center",
                          currentStatus === "PRESENT"
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "text-slate-500 hover:text-emerald-700 hover:bg-white"
                        )}
                        title="Mark Present"
                      >
                        P
                      </button>
                      <button
                        type="button"
                        onClick={() => setStudentStatus(s.id, "ABSENT")}
                        className={cn(
                          "h-7 w-7 rounded-md text-xs font-black uppercase transition-all cursor-pointer flex items-center justify-center",
                          currentStatus === "ABSENT"
                            ? "bg-rose-600 text-white shadow-xs"
                            : "text-slate-500 hover:text-rose-700 hover:bg-white"
                        )}
                        title="Mark Absent"
                      >
                        A
                      </button>
                      <button
                        type="button"
                        onClick={() => setStudentStatus(s.id, "LEAVE")}
                        className={cn(
                          "h-7 w-7 rounded-md text-xs font-black uppercase transition-all cursor-pointer flex items-center justify-center",
                          currentStatus === "LEAVE"
                            ? "bg-amber-500 text-white shadow-xs"
                            : "text-slate-500 hover:text-amber-700 hover:bg-white"
                        )}
                        title="Mark Full Day Leave"
                      >
                        L
                      </button>
                      <button
                        type="button"
                        onClick={() => setStudentStatus(s.id, "HALF_DAY", s)}
                        className={cn(
                          "h-7 px-1.5 rounded-md text-[10px] font-black uppercase transition-all cursor-pointer flex items-center justify-center",
                          isHalfDay
                            ? "bg-purple-600 text-white shadow-xs"
                            : "text-slate-500 hover:text-purple-700 hover:bg-white"
                        )}
                        title="Record Half Day Departure Time & Reason"
                      >
                        HD
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>

      {/* Bottom Floating/Fixed Save Bar when table is long */}
      {drillMerged.length > 5 && (
        <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between shadow-lg mt-3 mx-1">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold text-slate-300">
              Total: <span className="text-white font-black">{Object.keys(localStatusMap).length}</span> / {drillMerged.length}
            </span>
            <span className="text-[11px] font-bold text-emerald-400">
              {liveStats.present} Present
            </span>
            <span className="text-[11px] font-bold text-rose-400">
              {liveStats.absent} Absent
            </span>
            {liveStats.leave > 0 && (
              <span className="text-[11px] font-bold text-amber-400">
                {liveStats.leave} Leave
              </span>
            )}
            {liveStats.halfDay > 0 && (
              <span className="text-[11px] font-bold text-purple-400">
                {liveStats.halfDay} Half Day
              </span>
            )}
          </div>

          <Button
            type="button"
            onClick={handleSaveAttendance}
            disabled={drillLoading || studentsLoading || isSaving}
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs uppercase tracking-wider h-8 px-4 rounded-lg shadow-sm cursor-pointer active:scale-95 transition-all"
          >
            {isSaving ? (
              <Loader2 size={13} className="animate-spin mr-1" />
            ) : (
              <Save size={13} className="mr-1" />
            )}
            Save Register
          </Button>
        </div>
      )}

      {/* Half-Day Departure Outpass Modal */}
      <HalfDayOutpassModal
        isOpen={!!halfDayModalStudent}
        onClose={() => setHalfDayModalStudent(null)}
        student={halfDayModalStudent}
        onConfirm={handleConfirmHalfDay}
        initialData={
          halfDayModalStudent
            ? studentDetailsMap[halfDayModalStudent.id] || {
                departureTime: halfDayModalStudent.departureTime,
                remarks: halfDayModalStudent.remarks,
              }
            : undefined
        }
      />
    </div>
  );
}
