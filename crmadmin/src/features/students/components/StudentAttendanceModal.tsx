"use client";

import React, { useState, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Sparkles,
  ChevronDown,
  Filter,
  BarChart3,
  CalendarDays,
  FileSpreadsheet,
  Layers
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/dialogbox/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface AttendanceRecord {
  id?: number;
  studentId?: number;
  date: string;
  status: "PRESENT" | "ABSENT" | "LEAVE" | "LATE" | "HOLIDAY" | string;
  class?: string;
  section?: string;
  session?: string;
  createdAt?: string;
}

interface StudentAttendanceModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  studentName: string;
  admissionNo: string;
  studentClass: string;
  studentSection: string;
  attendanceRecords: AttendanceRecord[];
}

export default function StudentAttendanceModal({
  isOpen,
  onOpenChange,
  studentName,
  admissionNo,
  studentClass,
  studentSection,
  attendanceRecords = [],
}: StudentAttendanceModalProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Overall Statistics
  const totalDays = attendanceRecords.length;
  const presentDays = attendanceRecords.filter((r) => r.status === "PRESENT").length;
  const absentDays = attendanceRecords.filter((r) => r.status === "ABSENT").length;
  const leaveDays = attendanceRecords.filter((r) => r.status === "LEAVE").length;
  const lateDays = attendanceRecords.filter((r) => r.status === "LATE").length;
  const holidayDays = attendanceRecords.filter((r) => r.status === "HOLIDAY").length;

  const attendancePercent =
    totalDays > 0 ? Math.round(((presentDays + lateDays) / totalDays) * 100) : 0;

  // Extract unique available months (sorted chronologically)
  const availableMonths = useMemo(() => {
    const monthMap = new Map<string, string>(); // "2026-08" -> "August 2026"
    attendanceRecords.forEach((r) => {
      if (r.date) {
        const d = new Date(r.date);
        if (!isNaN(d.getTime())) {
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          const label = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
          monthMap.set(key, label);
        }
      }
    });
    return Array.from(monthMap.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [attendanceRecords]);

  // Month-wise analytics breakdown
  const monthlyStats = useMemo(() => {
    const stats: Record<
      string,
      { label: string; total: number; present: number; absent: number; leave: number; late: number; percent: number }
    > = {};

    attendanceRecords.forEach((r) => {
      if (r.date) {
        const d = new Date(r.date);
        if (!isNaN(d.getTime())) {
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          const label = d.toLocaleDateString("en-US", { month: "short", year: "numeric" });

          if (!stats[key]) {
            stats[key] = { label, total: 0, present: 0, absent: 0, leave: 0, late: 0, percent: 0 };
          }
          stats[key].total += 1;
          if (r.status === "PRESENT") stats[key].present += 1;
          else if (r.status === "ABSENT") stats[key].absent += 1;
          else if (r.status === "LEAVE") stats[key].leave += 1;
          else if (r.status === "LATE") stats[key].late += 1;
        }
      }
    });

    // Compute percentage
    Object.keys(stats).forEach((k) => {
      const s = stats[k];
      s.percent = s.total > 0 ? Math.round(((s.present + s.late) / s.total) * 100) : 0;
    });

    return Object.entries(stats).sort((a, b) => b[0].localeCompare(a[0]));
  }, [attendanceRecords]);

  // Filtered Records for Table
  const filteredRecords = useMemo(() => {
    return attendanceRecords.filter((r) => {
      if (!r.date) return false;
      const d = new Date(r.date);
      if (isNaN(d.getTime())) return false;

      const recordMonthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const matchesMonth = selectedMonth === "ALL" || recordMonthKey === selectedMonth;
      const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;

      return matchesMonth && matchesStatus;
    });
  }, [attendanceRecords, selectedMonth, statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PRESENT":
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 size={12} className="text-emerald-600" /> Present
          </Badge>
        );
      case "ABSENT":
        return (
          <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
            <XCircle size={12} className="text-rose-600" /> Absent
          </Badge>
        );
      case "LEAVE":
        return (
          <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
            <Clock size={12} className="text-amber-600" /> Leave / Leave
          </Badge>
        );
      case "LATE":
        return (
          <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle size={12} className="text-blue-600" /> Late Entry
          </Badge>
        );
      case "HOLIDAY":
        return (
          <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
            <Sparkles size={12} className="text-purple-600" /> Holiday
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[10px] font-black uppercase tracking-wider">
            {status || "LOGGED"}
          </Badge>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col p-0 overflow-hidden rounded-3xl bg-white border border-slate-100 shadow-2xl">
        {/* HEADER */}
        <DialogHeader className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-xl font-black text-white uppercase tracking-tight font-heading">
                  {studentName} — Attendance Analytics
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs font-bold text-indigo-200 uppercase tracking-wider mt-1 flex items-center gap-2">
                <span>Scholar ID: <strong className="text-white">{admissionNo}</strong></span>
                <span>•</span>
                <span>Class: <strong className="text-white">{studentClass}-{studentSection || "A"}</strong></span>
                <span>•</span>
                <span>Total Recorded: <strong className="text-white">{totalDays} Days</strong></span>
              </DialogDescription>
            </div>

            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15">
              <div className="text-right">
                <p className="text-[9px] font-black text-indigo-200 uppercase tracking-widest">
                  Attendance Ratio
                </p>
                <h4 className="text-2xl font-black text-white tracking-tight">
                  {attendancePercent}%
                </h4>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-black text-sm">
                ✓
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* BODY (SCROLLABLE) */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8 flex-1">
          {/* 4 SUMMARY METRIC TILES */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">
                  Total Present
                </span>
                <CheckCircle2 size={16} className="text-emerald-600" />
              </div>
              <h3 className="text-2xl font-black text-emerald-900 tracking-tight mt-2">
                {presentDays} <span className="text-xs font-bold text-emerald-600">Days</span>
              </h3>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-100">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-rose-700 uppercase tracking-wider">
                  Total Absent
                </span>
                <XCircle size={16} className="text-rose-600" />
              </div>
              <h3 className="text-2xl font-black text-rose-900 tracking-tight mt-2">
                {absentDays} <span className="text-xs font-bold text-rose-600">Days</span>
              </h3>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-amber-700 uppercase tracking-wider">
                  Approved Leave
                </span>
                <Clock size={16} className="text-amber-600" />
              </div>
              <h3 className="text-2xl font-black text-amber-900 tracking-tight mt-2">
                {leaveDays} <span className="text-xs font-bold text-amber-600">Days</span>
              </h3>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-indigo-700 uppercase tracking-wider">
                  Late Entries
                </span>
                <AlertTriangle size={16} className="text-indigo-600" />
              </div>
              <h3 className="text-2xl font-black text-indigo-900 tracking-tight mt-2">
                {lateDays} <span className="text-xs font-bold text-indigo-600">Days</span>
              </h3>
            </div>
          </div>

          {/* 📅 MONTH-BY-MONTH BREAKDOWN TILES */}
          {monthlyStats.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <BarChart3 size={15} className="text-indigo-600" /> Month-Wise Attendance Matrix
                </h4>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {monthlyStats.length} Recorded Months
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {monthlyStats.map(([key, stat]) => {
                  const isSelected = selectedMonth === key;
                  return (
                    <div
                      key={key}
                      onClick={() => setSelectedMonth(isSelected ? "ALL" : key)}
                      className={cn(
                        "p-4 rounded-2xl border transition-all cursor-pointer shadow-xs",
                        isSelected
                          ? "bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-500/20"
                          : "bg-slate-50/60 hover:bg-white border-slate-200/80 hover:border-indigo-200"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black text-slate-900 uppercase">
                          {stat.label}
                        </span>
                        <Badge
                          className={cn(
                            "text-[9px] font-black",
                            stat.percent >= 75
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : "bg-rose-50 text-rose-700 border-rose-100"
                          )}
                        >
                          {stat.percent}%
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] pt-2 border-t border-slate-200/60 font-bold">
                        <div className="text-emerald-700">
                          <span className="block font-black text-xs">{stat.present}</span> Present
                        </div>
                        <div className="text-rose-600">
                          <span className="block font-black text-xs">{stat.absent}</span> Absent
                        </div>
                        <div className="text-amber-600">
                          <span className="block font-black text-xs">{stat.leave}</span> Leave
                        </div>
                      </div>

                      <div className="mt-2.5 h-1.5 w-full bg-slate-200/80 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full transition-all"
                          style={{ width: `${stat.percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 📋 DAILY LOGS TABLE WITH LIVE FILTERS */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <CalendarDays size={15} className="text-indigo-600" /> Daily Attendance Logs ({filteredRecords.length})
              </h4>

              {/* FILTERS */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* MONTH SELECTOR */}
                <div className="relative">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="h-9 pl-3 pr-8 rounded-xl bg-slate-100 border-none text-xs font-bold text-slate-700 cursor-pointer appearance-none uppercase"
                  >
                    <option value="ALL">All Recorded Months</option>
                    {availableMonths.map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={13}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                </div>

                {/* STATUS SELECTOR */}
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="h-9 pl-3 pr-8 rounded-xl bg-slate-100 border-none text-xs font-bold text-slate-700 cursor-pointer appearance-none uppercase"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="PRESENT">Present Only</option>
                    <option value="ABSENT">Absent Only</option>
                    <option value="LEAVE">Leave Only</option>
                    <option value="LATE">Late Only</option>
                  </select>
                  <ChevronDown
                    size={13}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white">
              <Table>
                <TableHeader className="bg-slate-50/70">
                  <TableRow className="border-none">
                    <TableHead className="pl-6 h-12 font-black text-slate-400 text-[10px] uppercase tracking-wider">
                      Date & Day
                    </TableHead>
                    <TableHead className="h-12 font-black text-slate-400 text-[10px] uppercase tracking-wider">
                      Class / Section
                    </TableHead>
                    <TableHead className="h-12 font-black text-slate-400 text-[10px] uppercase tracking-wider">
                      Status
                    </TableHead>
                    <TableHead className="text-right pr-6 h-12 font-black text-slate-400 text-[10px] uppercase tracking-wider">
                      Session
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.length > 0 ? (
                    filteredRecords.map((rec, index) => {
                      const dateObj = new Date(rec.date);
                      const formattedDate = !isNaN(dateObj.getTime())
                        ? dateObj.toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : rec.date;
                      const dayName = !isNaN(dateObj.getTime())
                        ? dateObj.toLocaleDateString("en-US", { weekday: "long" })
                        : "";

                      return (
                        <TableRow
                          key={rec.id || index}
                          className="hover:bg-slate-50/60 border-slate-100 transition-colors"
                        >
                          <TableCell className="pl-6 py-3.5">
                            <span className="font-black text-slate-900 text-xs block">
                              {formattedDate}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                              {dayName}
                            </span>
                          </TableCell>
                          <TableCell className="font-bold text-slate-700 text-xs">
                            Class {rec.class || studentClass}-{rec.section || studentSection || "A"}
                          </TableCell>
                          <TableCell>{getStatusBadge(rec.status)}</TableCell>
                          <TableCell className="text-right pr-6 font-mono text-[10px] font-bold text-slate-400">
                            {rec.session || "2026-2027"}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="h-32 text-center text-xs font-bold text-slate-400 uppercase tracking-wider"
                      >
                        No attendance records match the selected filter.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
