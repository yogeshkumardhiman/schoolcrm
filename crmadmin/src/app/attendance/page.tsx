"use client";

import React from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  Users as UsersIcon,
  Loader2,
  GraduationCap,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import client from "@/lib/client";
import {
  useAttendance,
  AttendanceHeader,
  AttendanceKpiCards,
  AttendanceFilters,
  ClassOverviewTable,
  ClassRosterAttendanceTable,
} from "@/features/attendance";

export default function AttendancePage() {
  const {
    queryClient,
    user,
    selectedDate,
    setSelectedDate,
    searchQuery,
    setSearchQuery,
    filterClass,
    setFilterClass,
    filterSection,
    setFilterSection,
    statusFilter,
    setStatusFilter,
    drillClass,
    setDrillClass,
    isSunday,
    isHoliday,
    holidayEvent,
    holidayTitle,
    holidayTypeLabel,
    allClasses,
    uniqueClassNames,
    uniqueSections,
    drillLoading,
    studentsLoading,
    drillMerged,
    grandTotal,
    filteredSummaries,
    isLoading,
    selectCls,
  } = useAttendance();

  const rawRole = (user?.role || "").trim().toUpperCase();
  const isAdmin = ["ADMIN", "SUPER_ADMIN", "PRINCIPAL", "MANAGEMENT"].includes(rawRole);
  const userClass = user?.class || user?.staffProfile?.class || "";
  const isActualClassTeacher = Boolean(userClass && userClass !== "NONE");
  const isSubjectTeacher = (rawRole === "TEACHER" || rawRole === "CLASS_TEACHER") && !isActualClassTeacher;

  const isTeacher =
    user?.role?.toUpperCase() === "TEACHER" ||
    user?.role?.toUpperCase() === "CLASS_TEACHER";

  // Single bulk save mutation for all marked students
  const saveAttendanceBulkMutation = useMutation({
    mutationFn: async (records: { studentId: number; status: string }[]) => {
      const payload = {
        class: drillClass?.class || "9TH",
        section: drillClass?.section || "A",
        date: selectedDate,
        records: records.map((r) => ({
          studentId: Number(r.studentId),
          status: r.status,
        })),
      };
      return client.post("/attendance/bulk-mark", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drillAttendance"] });
      queryClient.invalidateQueries({ queryKey: ["classSummaries"] });
      toast.success("Daily attendance register saved successfully! ✓");
    },
    onError: () => {
      toast.error("Failed to save attendance register. Please try again.");
    },
  });

  if (isSubjectTeacher) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 min-h-[75vh]" suppressHydrationWarning>
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs text-center space-y-4">
          <div className="h-14 w-14 mx-auto rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold shadow-2xs">
            <GraduationCap size={28} />
          </div>
          <h3 className="text-lg font-black text-slate-900 uppercase font-heading">
            Subject Faculty Portal
          </h3>
          <p className="text-xs font-semibold text-slate-500 leading-relaxed">
            Daily Student Attendance is maintained exclusively by designated <strong className="text-indigo-600">Class Incharges</strong>. As a Subject Lecturer, you can review your teaching schedule, homework assignments, and staff attendance.
          </p>
          <div className="pt-3 flex flex-col gap-2">
            <Link href="/staff/my-timetable">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider rounded-xl h-10 cursor-pointer shadow-xs">
                View Weekly Timetable
              </Button>
            </Link>
            <Link href="/staff/my-attendance">
              <Button variant="outline" className="w-full text-xs font-black uppercase tracking-wider rounded-xl h-10 border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer">
                My Biometric Attendance
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 bg-slate-50/50 min-h-screen font-sans" suppressHydrationWarning>
      {/* 🏙️ HEADER & DATE SELECTION */}
      <AttendanceHeader
        drillClass={drillClass}
        isTeacher={isTeacher}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        onBackToOverview={() => {
          setDrillClass(null);
          setSearchQuery("");
          setStatusFilter("ALL");
        }}
        onSync={() =>
          queryClient.invalidateQueries({ queryKey: ["classSummaries"] })
        }
        isLoading={isLoading}
      />

      {/* 🏖️ IF HOLIDAY: Show Clean Dedicated Holiday View (Hide all tables & buttons) */}
      {isHoliday ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 text-center max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
          <div className="h-24 w-24 bg-amber-50 border-2 border-amber-200 rounded-3xl flex items-center justify-center text-amber-500 mx-auto shadow-sm">
            <CalendarIcon size={44} strokeWidth={1.75} />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100/90 text-amber-900 font-black text-xs uppercase tracking-widest border border-amber-200">
              <span>{holidayTypeLabel || "Declared Holiday"}</span>
            </div>

            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight font-heading">
              {holidayTitle || "Institutional Holiday"}
            </h2>

            <p className="text-slate-500 font-medium text-sm max-w-md mx-auto leading-relaxed">
              School academic sessions are closed for this date as per the academic calendar. Student attendance marking is not required.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Badge className="bg-slate-900 text-white px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm">
              {holidayEvent?.endDate && holidayEvent.endDate !== holidayEvent.date
                ? `Holiday Period: ${holidayEvent.date} to ${holidayEvent.endDate}`
                : `Date: ${selectedDate}`}
            </Badge>

            <Link href="/calendar">
              <Button variant="outline" className="rounded-xl border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider h-9">
                View Academic Calendar
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* 📊 TELEMETRY KPI CARDS */}
          <AttendanceKpiCards
            isTeacher={isTeacher}
            drillClass={drillClass}
            allClassesCount={allClasses.length}
            grandTotal={grandTotal}
            isLoading={isLoading}
          />

          {/* 🔍 FILTERS & STATUS TABS */}
          <AttendanceFilters
            drillClass={drillClass}
            isTeacher={isTeacher}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterClass={filterClass}
            setFilterClass={setFilterClass}
            filterSection={filterSection}
            setFilterSection={setFilterSection}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            uniqueClassNames={uniqueClassNames}
            uniqueSections={uniqueSections}
            totalScholarsCount={drillMerged.length}
          />

          {/* 📋 MAIN ATTENDANCE TABLE (MODULAR ROSTER / OVERVIEW) */}
          <div className="bg-white rounded-lgxl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden relative animate-in fade-in duration-700">
            {/* Table Banner Bar */}
            <div className="p-6 border-b border-slate-50 flex flex-wrap items-center justify-between gap-4 bg-white">
              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[4px] flex items-center gap-2">
                  <GraduationCap size={16} className="text-indigo-600" />
                  {drillClass
                    ? `Registry: ${drillClass.class}–${drillClass.section} • ${selectedDate}`
                    : `Class Overview • ${selectedDate}`}
                </h3>
                {drillClass && (
                  <p className="text-xs font-bold text-slate-600 mt-0.5">
                    Class Incharge:{" "}
                    <span className="text-slate-900 font-black">
                      {drillClass.teacher || "Faculty"}
                    </span>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                {drillClass && (
                  <Link
                    href={`/staff/my-students?class=${drillClass.class}&section=${drillClass.section || "A"}`}
                    className="bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 h-9 px-3.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
                  >
                    <UsersIcon size={14} /> Full Roster
                  </Link>
                )}

                <Badge
                  variant="outline"
                  className="bg-indigo-50 text-indigo-600 border-indigo-100 font-bold text-[10px] uppercase tracking-wider py-1 px-3.5 rounded-xl"
                >
                  {drillClass
                    ? `${drillMerged.length} scholars`
                    : `${filteredSummaries.length} classes`}
                </Badge>
              </div>
            </div>

            <div className="overflow-x-auto min-h-[400px]">
              {/* Overview Table (For Admin) */}
              {!drillClass && (
                <ClassOverviewTable
                  filteredSummaries={filteredSummaries}
                  isLoading={isLoading}
                  onSelectClass={selectCls}
                />
              )}

              {/* Student Roster Table (For Class Teacher & Drilled Class) */}
              {drillClass && (
                <ClassRosterAttendanceTable
                  drillMerged={drillMerged}
                  drillLoading={drillLoading}
                  studentsLoading={studentsLoading}
                  isSaving={saveAttendanceBulkMutation.isPending}
                  onSubmitBulk={(records) => saveAttendanceBulkMutation.mutate(records)}
                />
              )}

              {/* Loading State */}
              {(isLoading || drillLoading || studentsLoading) && (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                  <Loader2
                    size={32}
                    className="animate-spin text-indigo-600 mb-4"
                  />
                  <p className="text-[10px] font-black uppercase tracking-widest">
                    Syncing Telemetry...
                  </p>
                </div>
              )}

              {/* Empty States */}
              {!isLoading && !drillClass && filteredSummaries.length === 0 && (
                <div className="h-64 flex flex-col items-center justify-center text-slate-300">
                  <GraduationCap size={48} strokeWidth={1} />
                  <p className="text-[10px] font-bold uppercase tracking-widest mt-4">
                    No Classes Found
                  </p>
                </div>
              )}

              {!drillLoading &&
                !studentsLoading &&
                drillClass &&
                drillMerged.length === 0 && (
                  <div className="h-64 flex flex-col items-center justify-center text-slate-300">
                    <UsersIcon size={48} strokeWidth={1} />
                    <p className="text-[10px] font-bold uppercase tracking-widest mt-4">
                      No Students Found
                    </p>
                  </div>
                )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
