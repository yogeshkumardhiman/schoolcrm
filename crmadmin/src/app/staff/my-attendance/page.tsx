"use client";
import client from "@/lib/client";

import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Percent,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function MyAttendancePage() {
  // Date selection states
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth()); // 0-indexed
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const { data: rawList = [], isLoading: loading, refetch } = useQuery<any[]>({
    queryKey: ['my-attendance', selectedMonth, selectedYear],
    queryFn: async () => {
      try {
        const res = await client.get("/attendance/my");
        return Array.isArray(res) ? res : (res?.data || []);
      } catch (err) {
        console.warn("Falling back to /attendance/staff/my", err);
        try {
          const fallback = await client.get("/attendance/staff/my");
          return Array.isArray(fallback) ? fallback : (fallback?.data || []);
        } catch (e) {
          console.error("Failed to load my attendance", e);
          return [];
        }
      }
    },
    staleTime: 1000 * 30,
    refetchOnMount: true,
  });

  const attendanceList: any[] = Array.isArray(rawList) ? rawList : [];

  // Filter attendance for selected month and year
  const getFilteredAttendance = () => {
    return attendanceList.filter((record: any) => {
      if (!record?.date) return false;
      const [y, m] = record.date.split("-").map(Number);
      return y === selectedYear && m === (selectedMonth + 1);
    });
  };

  const filteredRecords = getFilteredAttendance();

  // Create dictionary for fast date lookup: 'YYYY-MM-DD' -> status
  const attendanceMap = filteredRecords.reduce((acc: any, record: any) => {
    if (record?.date) {
      acc[record.date] = record.status;
    }
    return acc;
  }, {});

  // Generate Calendar Days
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon, etc.
  };

  const totalDaysInMonth = getDaysInMonth(selectedMonth, selectedYear);
  const firstDayIndex = getFirstDayOfMonth(selectedMonth, selectedYear);

  // Stats calculation
  const totalMarked = filteredRecords.length;
  const presentCount = filteredRecords.filter(r => r.status === 'PRESENT').length;
  const absentCount = filteredRecords.filter(r => r.status === 'ABSENT').length;
  const leaveCount = filteredRecords.filter(r => r.status === 'LEAVE').length;
  const attendanceRatio = totalMarked > 0 ? Math.round((presentCount / totalMarked) * 100) : 100;

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(prev => prev - 1);
    } else {
      setSelectedMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(prev => prev + 1);
    } else {
      setSelectedMonth(prev => prev + 1);
    }
  };

  const attendanceCards = [
    {
      title: "Duties Checked",
      value: totalMarked,
      description: "Days Logged",
      icon: CalendarIcon,
      valueClass: "text-slate-900",
      iconClass: "text-indigo-500",
      cardClass: "bg-white border-slate-200",
      dark: false,
    },
    {
      title: "Present",
      value: presentCount,
      description: "Duties Completed",
      icon: CheckCircle2,
      valueClass: "text-emerald-600",
      iconClass: "text-emerald-500",
      cardClass: "bg-white border-slate-200",
      dark: false,
    },
    {
      title: "Absent",
      value: absentCount,
      description: "Absences Noted",
      icon: XCircle,
      valueClass: "text-rose-600",
      iconClass: "text-rose-500",
      cardClass: "bg-white border-slate-200",
      dark: false,
    },
    {
      title: "Approved Leave",
      value: leaveCount,
      description: "Excused absences",
      icon: Clock,
      valueClass: "text-amber-600",
      iconClass: "text-amber-500",
      cardClass: "bg-white border-slate-200",
      dark: false,
    },
    {
      title: "Attendance Rate",
      value: `${attendanceRatio}%`,
      description: "Ratio Performance",
      icon: Percent,
      valueClass: "text-white",
      iconClass: "text-white/80",
      cardClass:
        attendanceRatio >= 90
          ? "bg-gradient-to-br from-emerald-500 to-teal-600 border-none text-white shadow-md shadow-emerald-500/20"
          : attendanceRatio >= 75
            ? "bg-gradient-to-br from-amber-500 to-orange-600 border-none text-white shadow-md shadow-amber-500/20"
            : "bg-gradient-to-br from-rose-500 to-red-600 border-none text-white shadow-md shadow-rose-500/20",
      dark: true,
    },
  ];

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 bg-slate-50/50 min-h-screen font-sans">
      {/* 🌟 PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase flex items-center gap-1 border border-emerald-100">
              <Sparkles className="h-3 w-3" /> Attendance Audit
            </span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-1 leading-none uppercase font-heading">
            My Attendance Ledger
          </h2>
          <p className="text-sm text-slate-400 font-medium mt-1">
            Real-time chronicle of your physical and authorized presence records.
          </p>
        </div>

        {/* MONTH SWITCHER */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1.5 shadow-xs gap-2">
            <button
              onClick={handlePrevMonth}
              className="h-8 w-8 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-50 active:scale-95 transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider w-[120px] text-center font-heading">
              {MONTHS[selectedMonth]} {selectedYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="h-8 w-8 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-50 active:scale-95 transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
          <Button onClick={() => refetch()} variant="outline" size="icon" className="h-11 w-11 rounded-2xl border-slate-200 bg-white">
            <RefreshCw className="h-4 w-4 text-slate-600" />
          </Button>
        </div>
      </div>

      {/* 📊 KPI SUMMARY GRID */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        {loading ? (
          Array.from({ length: 5 }).map((_, idx) => (
            <Card key={idx} className="shadow-xs border-slate-200 rounded-xl bg-white p-5 space-y-2">
              <Skeleton className="h-3 w-20 rounded" />
              <Skeleton className="h-8 w-16 rounded-lg" />
              <Skeleton className="h-2.5 w-24 rounded" />
            </Card>
          ))
        ) : (
          attendanceCards.map((item, index) => {
            const Icon = item.icon;

            return (
              <Card
                key={index}
                className={cn(
                  "shadow-xs relative overflow-hidden rounded-xl border",
                  item.cardClass
                )}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-wider",
                      item.dark ? "text-white/80" : "text-slate-400"
                    )}
                  >
                    {item.title}
                  </CardTitle>

                  <Icon className={cn("h-4 w-4", item.iconClass)} />
                </CardHeader>

                <CardContent>
                  <div className={cn("text-3xl font-black tracking-tight", item.valueClass)}>
                    {item.value}
                  </div>

                  <p
                    className={cn(
                      "text-[9px] font-bold uppercase mt-1",
                      item.dark ? "text-white/80" : "text-slate-400"
                    )}
                  >
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* 🚀 MAIN CONTENT GRID */}
      <div className="grid gap-8 lg:grid-cols-5">
        {/* 🗓️ LEFT SIDE: CALENDAR GRID (3 cols) */}
        <div className="lg:col-span-3">
          <Card className="shadow-xs border-slate-200 bg-white">
            <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-black tracking-tight uppercase text-slate-900 font-heading">
                  {MONTHS[selectedMonth]} Matrix
                </CardTitle>
                <CardDescription>
                  Chronological grid representing all logs and dates in {MONTHS[selectedMonth]}.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {loading ? (
                <div className="space-y-4 p-2">
                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <Skeleton key={i} className="h-6 rounded-md" />
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 28 }).map((_, i) => (
                      <Skeleton key={i} className="aspect-square rounded-xl" />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Calendar Headers */}
                  <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {DAYS_OF_WEEK.map(day => (
                      <div key={day} className="py-2">{day}</div>
                    ))}
                  </div>

                  {/* Calendar Days */}
                  <div className="grid grid-cols-7 gap-2">
                    {/* Padding cells */}
                    {Array.from({ length: firstDayIndex }).map((_, idx) => (
                      <div
                        key={`pad-${idx}`}
                        className="aspect-square bg-slate-50/20 border border-dashed border-slate-100 rounded-xl"
                      />
                    ))}

                    {/* Active days */}
                    {Array.from({ length: totalDaysInMonth }).map((_, idx) => {
                      const dayNumber = idx + 1;
                      const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(dayNumber).padStart(2, "0")}`;
                      const status = attendanceMap[dateStr];
                      const isToday = now.getDate() === dayNumber && now.getMonth() === selectedMonth && now.getFullYear() === selectedYear;

                      return (
                        <div
                          key={dayNumber}
                          className={cn(
                            "aspect-square rounded-xl border flex flex-col items-center justify-between p-2 transition-all duration-300 relative group overflow-hidden",
                            status === "PRESENT" ? "bg-emerald-50/80 border-emerald-200 text-emerald-700 shadow-xs" :
                              status === "ABSENT" ? "bg-rose-50/80 border-rose-200 text-rose-700 shadow-xs" :
                                status === "LEAVE" ? "bg-amber-50/80 border-amber-200 text-amber-700 shadow-xs" :
                                  "bg-slate-50/40 border-slate-100 text-slate-400 hover:border-slate-200",
                            isToday && "ring-2 ring-indigo-500 ring-offset-2"
                          )}
                        >
                          {/* Day Number */}
                          <span className="text-[10px] font-black tracking-tight self-start leading-none">
                            {dayNumber}
                          </span>

                          {/* Status Indicator Icon / Text */}
                          {status === "PRESENT" && <CheckCircle2 size={16} className="text-emerald-500 mb-1" />}
                          {status === "ABSENT" && <XCircle size={16} className="text-rose-500 mb-1" />}
                          {status === "LEAVE" && <Clock size={16} className="text-amber-500 mb-1" />}
                          {!status && <span className="text-[8px] font-bold text-slate-300 tracking-wider mb-1 uppercase opacity-0 group-hover:opacity-100 transition-opacity">Blank</span>}

                          {/* Background Glow */}
                          <div className={cn(
                            "absolute inset-x-0 bottom-0 h-1",
                            status === "PRESENT" ? "bg-emerald-500" :
                              status === "ABSENT" ? "bg-rose-500" :
                                status === "LEAVE" ? "bg-amber-500" :
                                  "bg-transparent"
                          )} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 📈 RIGHT SIDE: ANALYTICS & INSIGHTS (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-xs border-slate-200 bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-black tracking-tight uppercase text-slate-900 flex items-center gap-2 font-heading">
                <TrendingUp className="h-5 w-5 text-indigo-500" /> Compliance Insights
              </CardTitle>
              <CardDescription>
                Automated statistical feedback for current month attendance behavior.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Dynamic Feedback block */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-xs",
                    attendanceRatio >= 90 ? "bg-emerald-500" :
                      attendanceRatio >= 75 ? "bg-amber-500" :
                        "bg-rose-500"
                  )}>
                    <Percent size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide leading-none font-heading">Status Evaluation</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                      {attendanceRatio >= 90 ? "EXECUTION LEVEL: EXCELLENT" :
                        attendanceRatio >= 75 ? "EXECUTION LEVEL: STABLE" :
                          "EXECUTION LEVEL: CRITICAL"}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  {attendanceRatio >= 90
                    ? "Congratulations! Your attendance ratio matches the high standards expected by the institutional regulatory bodies. Keep maintaining this exceptional presence standard."
                    : attendanceRatio >= 75
                      ? "Your attendance ratio is within acceptable standard parameters, but caution is recommended. Try to complete your pending cover duties to secure baseline metrics."
                      : "Attention: Your attendance ratio is currently below institutional threshold parameters. Please get in touch with the management to resolve your absence registry gaps."
                  }
                </p>
              </div>

              {/* Attendance Protocol Rules */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 font-heading">
                  Institutional Protocols
                </h4>

                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <p className="text-[11px] text-slate-500 font-semibold leading-normal">
                    <strong>Standard Cover Policy:</strong> All leaves must be submitted via the Leave Petition portal 24 hours prior to the absence window for proper substitute distribution.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <p className="text-[11px] text-slate-500 font-semibold leading-normal">
                    <strong>Self-Attendance Mark:</strong> Faculty members can log their own baseline attendance check, subject to executive audit verification.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
