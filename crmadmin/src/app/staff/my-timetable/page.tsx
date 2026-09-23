"use client";

import React, { useState, useEffect, useMemo } from "react";
import client from "@/lib/client";
import toast from "react-hot-toast";
import { useAuth } from "@/components/AbilityProvider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { TimetablePageSkeleton } from "./components/TimetableSkeleton";
import { TimetableHeader } from "./components/TimetableHeader";
import { TimetableBanner } from "./components/TimetableBanner";
import { TimetableMatrixTable } from "./components/TimetableMatrixTable";
import { TimetableLegend } from "./components/TimetableLegend";
import { EditSlotModal } from "./components/EditSlotModal";
import { TimingSetupModal } from "./components/TimingSetupModal";
import { TeacherSubstitutionAlert } from "./components/TeacherSubstitutionAlert";
import { TeacherPersonalScheduleTable } from "./components/TeacherPersonalScheduleTable";
import { User, School as SchoolIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

const DEFAULT_PERIODS = [
  { id: 1, label: "P-1", time: "08:30 - 09:15", isBreak: false },
  { id: 2, label: "P-2", time: "09:15 - 10:00", isBreak: false },
  { id: 3, label: "P-3", time: "10:00 - 10:40", isBreak: false },
  { id: 4, label: "P-4", time: "10:40 - 11:20", isBreak: false },
  { id: "RECESS", label: "RECESS", time: "11:20 - 11:50", isBreak: true },
  { id: 5, label: "P-5", time: "11:50 - 12:30", isBreak: false },
  { id: 6, label: "P-6", time: "12:30 - 01:10", isBreak: false },
  { id: 7, label: "P-7", time: "01:10 - 01:45", isBreak: false },
  { id: 8, label: "P-8", time: "01:45 - 02:15", isBreak: false },
];

const PRESET_TIMINGS = {
  REGULAR: [
    { id: 1, label: "P-1", time: "08:30 - 09:15", isBreak: false },
    { id: 2, label: "P-2", time: "09:15 - 10:00", isBreak: false },
    { id: 3, label: "P-3", time: "10:00 - 10:40", isBreak: false },
    { id: 4, label: "P-4", time: "10:40 - 11:20", isBreak: false },
    { id: "RECESS", label: "RECESS", time: "11:20 - 11:50", isBreak: true },
    { id: 5, label: "P-5", time: "11:50 - 12:30", isBreak: false },
    { id: 6, label: "P-6", time: "12:30 - 01:10", isBreak: false },
    { id: 7, label: "P-7", time: "01:10 - 01:45", isBreak: false },
    { id: 8, label: "P-8", time: "01:45 - 02:15", isBreak: false },
  ],
  SUMMER: [
    { id: 1, label: "P-1", time: "07:30 - 08:15", isBreak: false },
    { id: 2, label: "P-2", time: "08:15 - 09:00", isBreak: false },
    { id: 3, label: "P-3", time: "09:00 - 09:40", isBreak: false },
    { id: 4, label: "P-4", time: "09:40 - 10:20", isBreak: false },
    { id: "RECESS", label: "RECESS", time: "10:20 - 10:50", isBreak: true },
    { id: 5, label: "P-5", time: "10:50 - 11:30", isBreak: false },
    { id: 6, label: "P-6", time: "11:30 - 12:10", isBreak: false },
    { id: 7, label: "P-7", time: "12:10 - 12:45", isBreak: false },
    { id: 8, label: "P-8", time: "12:45 - 01:15", isBreak: false },
  ],
  WINTER: [
    { id: 1, label: "P-1", time: "09:00 - 09:45", isBreak: false },
    { id: 2, label: "P-2", time: "09:45 - 10:30", isBreak: false },
    { id: 3, label: "P-3", time: "10:30 - 11:10", isBreak: false },
    { id: 4, label: "P-4", time: "11:10 - 11:50", isBreak: false },
    { id: "RECESS", label: "RECESS", time: "11:50 - 12:20", isBreak: true },
    { id: 5, label: "P-5", time: "12:20 - 01:00", isBreak: false },
    { id: 6, label: "P-6", time: "01:00 - 01:40", isBreak: false },
    { id: 7, label: "P-7", time: "01:40 - 02:20", isBreak: false },
    { id: 8, label: "P-8", time: "02:20 - 03:00", isBreak: false },
  ],
};

const ALL_CLASSES = [
  "NURSERY", "LKG", "UKG", "1ST", "2ND", "3RD", "4TH", "5TH",
  "6TH", "7TH", "8TH", "9TH", "10TH", "11TH", "12TH"
];

function getSubjectBadgeColor(category?: string) {
  switch (category) {
    case "maths":
      return "bg-blue-50/90 border-blue-200/90 text-blue-900 hover:border-blue-400";
    case "science":
      return "bg-emerald-50/90 border-emerald-200/90 text-emerald-900 hover:border-emerald-400";
    case "language":
      return "bg-amber-50/90 border-amber-200/90 text-amber-900 hover:border-amber-400";
    case "tech":
      return "bg-purple-50/90 border-purple-200/90 text-purple-900 hover:border-purple-400";
    case "activity":
      return "bg-rose-50/90 border-rose-200/90 text-rose-900 hover:border-rose-400";
    default:
      return "bg-indigo-50/70 border-indigo-200/80 text-indigo-950 hover:border-indigo-400";
  }
}

export default function TimetablePage() {
  const queryClient = useQueryClient();
  const { user, loading: authLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  const isTeacher =
    user?.role?.toUpperCase() === "TEACHER" ||
    user?.role?.toUpperCase() === "CLASS_TEACHER";

  // Fetch live staff profile from database
  const { data: staffProfile } = useQuery({
    queryKey: ["staff-profile-me", user?.id],
    enabled: !!user && isTeacher,
    queryFn: () => client.get("/staff/me/profile").catch(() => null),
  });

  const effectiveClass = staffProfile?.class || user?.class || user?.staffProfile?.class || "";
  const effectiveSection = staffProfile?.section || user?.section || user?.staffProfile?.section || "A";

  const rawRole = (user?.role || "").trim().toUpperCase();
  const isAdmin = ["ADMIN", "SUPER_ADMIN", "PRINCIPAL", "MANAGEMENT", "CLERK"].includes(rawRole);
  const isClassTeacher = (rawRole === "TEACHER" || rawRole === "CLASS_TEACHER") && Boolean(effectiveClass && effectiveClass !== "NONE");
  const isSubjectTeacher = (rawRole === "TEACHER" || rawRole === "CLASS_TEACHER") && !isClassTeacher;

  // Mode: Teachers default to their PERSONAL schedule, Admins default to CLASS_MATRIX
  const [viewMode, setViewMode] = useState<"PERSONAL" | "CLASS_MATRIX">(
    isTeacher ? "PERSONAL" : "CLASS_MATRIX"
  );

  const [selectedClass, setSelectedClass] = useState("1ST");
  const [selectedSection, setSelectedSection] = useState("A");

  // Dynamic Custom Periods & Timings
  const [periodsList, setPeriodsList] = useState(DEFAULT_PERIODS);
  const [isTimingModalOpen, setIsTimingModalOpen] = useState(false);
  const [tempPeriods, setTempPeriods] = useState(DEFAULT_PERIODS);

  // Edit Period Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCustomSubjectMode, setIsCustomSubjectMode] = useState(false);
  const [saveToCurriculum, setSaveToCurriculum] = useState(true);

  const [activeSlot, setActiveSlot] = useState<{
    day: string;
    period: number;
    time: string;
    selectedSubject: string;
    customSubjectName: string;
    staffId: string;
    customTeacherName: string;
  }>({
    day: "MONDAY",
    period: 1,
    time: "08:30 - 09:15",
    selectedSubject: "",
    customSubjectName: "",
    staffId: "",
    customTeacherName: "",
  });

  useEffect(() => {
    setMounted(true);
    if (effectiveClass) {
      const clean = effectiveClass.toUpperCase().replace(/^(GRADE|CLASS)\s*/i, '').trim();
      setSelectedClass(clean || "1ST");
    }
    if (effectiveSection) {
      setSelectedSection(effectiveSection);
    }
    if (isSubjectTeacher || (isTeacher && !isAdmin)) {
      setViewMode("PERSONAL");
    }
  }, [effectiveClass, effectiveSection, isTeacher, isSubjectTeacher, isAdmin]);

  // Load custom periods from localStorage on mount
  useEffect(() => {
    if (!mounted) return;
    try {
      const saved = localStorage.getItem("school_period_timings");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPeriodsList(parsed);
          setTempPeriods(parsed);
        }
      }
    } catch {
      // fallback
    }
  }, [mounted]);

  // 1. Fetch School Info
  const { data: schoolInfo } = useQuery({
    queryKey: ["school-info"],
    queryFn: () => client.get("/settings/school-info").catch(() => null),
  });

  const activeClassList = useMemo(() => {
    const rawMax = (schoolInfo?.maxClass || "12TH").toUpperCase();
    const matchedIdx = ALL_CLASSES.findIndex((c) => rawMax.startsWith(c) || rawMax.includes(c));
    return matchedIdx !== -1 ? ALL_CLASSES.slice(0, matchedIdx + 1) : ALL_CLASSES;
  }, [schoolInfo]);

  // 2. Fetch Teaching Faculty from database (/classes/teachers)
  const { data: teachers = [] } = useQuery<any[]>({
    queryKey: ["staff-timetable-teachers"],
    queryFn: () => client.get("/classes/teachers").catch(() => []),
    staleTime: 5 * 60 * 1000,
  });

  // 3. Fetch Class Timetable from Server (for Class Matrix mode)
  const { data: serverTimetable = [] } = useQuery<any[]>({
    queryKey: ["timetable-matrix", selectedClass, selectedSection],
    queryFn: () => client.get(`/staff/timetable?class=${selectedClass}&section=${selectedSection}`).catch(() => []),
  });

  // 4. Fetch Personal Timetable for this Teacher
  const { data: myPersonalTimetable = [] } = useQuery<any[]>({
    queryKey: ["my-personal-timetable", user?.id],
    enabled: !!user,
    queryFn: () => client.get("/staff/me/timetable").catch(() => []),
  });

  // 5. Fetch Today's Proxy & Substitutions for this Teacher
  const { data: mySubstitutions = [] } = useQuery<any[]>({
    queryKey: ["my-substitutions", user?.id],
    enabled: !!user,
    queryFn: () => client.get("/staff/my-substitutions").catch(() => []),
  });

  // 6. Fetch Subjects for this class from database
  const { data: classSubjects = [] } = useQuery<any[]>({
    queryKey: ["subjects-for-timetable", selectedClass],
    queryFn: () => client.get(`/academic/subjects?class=${selectedClass}`).catch(() => []),
  });

  const availableSubjectNames = useMemo(() => {
    if (Array.isArray(classSubjects) && classSubjects.length > 0) {
      return classSubjects.map((s: any) => s.name);
    }
    return [];
  }, [classSubjects]);

  // ⚡ MUTATIONS
  const assignPeriodMutation = useMutation({
    mutationFn: async (data: any) => {
      if (data.isCustomSubject && data.saveToCurriculum && data.subject) {
        try {
          await client.post("/academic/subjects", {
            name: data.subject,
            class: selectedClass,
            type: "CORE",
            theoryMarks: 80,
            practicalMarks: 20,
            passingMarks: 33,
          });
          queryClient.invalidateQueries({ queryKey: ["subjects-for-timetable"] });
          queryClient.invalidateQueries({ queryKey: ["academic-subjects"] });
        } catch {
          // ignore duplicate
        }
      }

      return client.post("/staff/timetable", {
        class: data.class,
        section: data.section,
        day: data.day,
        period: data.period,
        subject: data.subject,
        staffId: data.staffId ? Number(data.staffId) : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timetable-matrix"] });
      queryClient.invalidateQueries({ queryKey: ["my-personal-timetable"] });
      toast.success("Period allocated successfully!");
      setIsEditModalOpen(false);
    },
    onError: () => toast.error("Failed to allocate period"),
  });

  const autoFillSchedule = async () => {
    const defaultSubjects = ["ENGLISH", "MATHEMATICS", "HINDI", "SCIENCE", "SOCIAL SCIENCE", "COMPUTER", "ART & CRAFT", "G.K."];
    const daysToFill = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

    try {
      const promises: Promise<any>[] = [];
      daysToFill.forEach((day, dIdx) => {
        [1, 2, 3, 4, 5, 6, 7, 8].forEach((pNum, pIdx) => {
          const sub = defaultSubjects[(dIdx + pIdx) % defaultSubjects.length];
          const t = teachers[(dIdx + pIdx) % (teachers.length || 1)];
          promises.push(
            client.post("/staff/timetable", {
              class: selectedClass,
              section: selectedSection,
              day,
              period: pNum,
              subject: sub,
              staffId: t?.id,
            })
          );
        });
      });

      await Promise.all(promises);
      queryClient.invalidateQueries({ queryKey: ["timetable-matrix"] });
      queryClient.invalidateQueries({ queryKey: ["my-personal-timetable"] });
      toast.success(`Standard schedule loaded for Class ${selectedClass}-${selectedSection}!`);
    } catch {
      toast.error("Failed to auto-populate schedule");
    }
  };

  const handleOpenEditSlot = (day: string, periodNumber: number, periodTime: string, currentEntry: any) => {
    const defaultSubject = currentEntry?.subject || availableSubjectNames[0] || "";
    const currentStaffId = currentEntry?.staffId ? String(currentEntry.staffId) : (teachers[0]?.id ? String(teachers[0].id) : "");

    setIsCustomSubjectMode(!currentEntry?.isAssigned && availableSubjectNames.length === 0);
    setActiveSlot({
      day,
      period: periodNumber,
      time: periodTime,
      selectedSubject: defaultSubject,
      customSubjectName: currentEntry?.subject || "",
      staffId: currentStaffId,
      customTeacherName: currentEntry?.teacher || "",
    });
    setIsEditModalOpen(true);
  };

  const handleSaveSlot = () => {
    const finalSubject = isCustomSubjectMode
      ? activeSlot.customSubjectName.trim()
      : activeSlot.selectedSubject.trim();

    if (!finalSubject) {
      return toast.error("Please enter or select a Subject Name");
    }

    assignPeriodMutation.mutate({
      class: selectedClass,
      section: selectedSection,
      day: activeSlot.day,
      period: activeSlot.period,
      subject: finalSubject,
      staffId: activeSlot.staffId ? Number(activeSlot.staffId) : undefined,
      isCustomSubject: isCustomSubjectMode,
      saveToCurriculum,
    });
  };

  const handleSavePeriodTimings = () => {
    setPeriodsList(tempPeriods);
    try {
      localStorage.setItem("school_period_timings", JSON.stringify(tempPeriods));
    } catch {
      // ignore
    }
    toast.success("School period timings synchronized!");
    setIsTimingModalOpen(false);
  };

  const handleApplyPresetTiming = (presetKey: keyof typeof PRESET_TIMINGS) => {
    const preset = PRESET_TIMINGS[presetKey];
    setTempPeriods(preset);
  };

  const getEntry = (day: string, periodNumber: number) => {
    if (Array.isArray(serverTimetable)) {
      const serverEntry = serverTimetable.find(
        (t) => t.day?.toUpperCase() === day.toUpperCase() && Number(t.period) === Number(periodNumber)
      );
      if (serverEntry && serverEntry.subject) {
        const subLower = (serverEntry.subject || "").toLowerCase();
        let cat = "default";
        if (subLower.includes("math")) cat = "maths";
        else if (subLower.includes("sci") || subLower.includes("bio") || subLower.includes("chem") || subLower.includes("phys")) cat = "science";
        else if (subLower.includes("eng") || subLower.includes("hin") || subLower.includes("sans") || subLower.includes("lang")) cat = "language";
        else if (subLower.includes("comp") || subLower.includes("it") || subLower.includes("ai") || subLower.includes("tech")) cat = "tech";
        else if (subLower.includes("sport") || subLower.includes("pe") || subLower.includes("game") || subLower.includes("art") || subLower.includes("music") || subLower.includes("draw")) cat = "activity";

        return {
          subject: serverEntry.subject,
          teacher: serverEntry.staff?.name || "Assigned Faculty",
          staffId: serverEntry.staffId,
          category: cat,
          isAssigned: true,
        };
      }
    }

    return {
      subject: "",
      teacher: "",
      staffId: null,
      category: "unassigned",
      isAssigned: false,
    };
  };

  if (!mounted || authLoading) {
    return <TimetablePageSkeleton />;
  }

  const schoolStartTime = periodsList[0]?.time?.split("-")[0]?.trim() || "08:30 AM";
  const schoolEndTime = periodsList[periodsList.length - 1]?.time?.split("-")[1]?.trim() || "02:15 PM";

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-8 pt-8 bg-slate-50/50 min-h-screen font-sans text-slate-900 relative z-10" suppressHydrationWarning>
      {/* 🚨 SUBSTITUTION / PROXY DUTY ALERT BANNER */}
      <TeacherSubstitutionAlert substitutions={mySubstitutions} />

      {/* 🏙️ TOP EXECUTIVE HEADER */}
      <TimetableHeader
        selectedClass={selectedClass}
        setSelectedClass={setSelectedClass}
        selectedSection={selectedSection}
        setSelectedSection={setSelectedSection}
        activeClassList={activeClassList}
        viewMode={viewMode}
        isTeacher={isTeacher}
        isAdmin={isAdmin}
        isClassTeacher={isClassTeacher}
        isSubjectTeacher={isSubjectTeacher}
        userName={user?.name || "Faculty"}
        userClass={effectiveClass}
        userSection={effectiveSection}
        onOpenTimingModal={() => {
          setTempPeriods(periodsList);
          setIsTimingModalOpen(true);
        }}
        onOpenAssignModal={() => handleOpenEditSlot("MONDAY", 1, periodsList[0]?.time || "08:30 - 09:15", null)}
        onAutoFill={autoFillSchedule}
        onPrint={() => window.print()}
      />

      {/* 🔄 VIEW MODE TOGGLE (Only shown for Admin or Class Incharge, hidden for pure Subject Teachers) */}
      {!isSubjectTeacher && (
        <div className="flex items-center gap-2 bg-slate-200/60 p-1 rounded-2xl w-fit border border-slate-200 shadow-inner">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setViewMode("PERSONAL")}
            className={cn(
              "rounded-xl text-xs font-black uppercase tracking-wider h-9 px-4 transition-all cursor-pointer",
              viewMode === "PERSONAL"
                ? "bg-white text-slate-950 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <User size={14} className="mr-1.5" /> My Teaching Schedule
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setViewMode("CLASS_MATRIX")}
            className={cn(
              "rounded-xl text-xs font-black uppercase tracking-wider h-9 px-4 transition-all cursor-pointer",
              viewMode === "CLASS_MATRIX"
                ? "bg-white text-slate-950 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <SchoolIcon size={14} className="mr-1.5" />{" "}
            {isClassTeacher ? `Class ${effectiveClass}-${effectiveSection} Matrix` : "Class Timetable Matrix"}
          </Button>
        </div>
      )}

      {/* 🗓️ MAIN TIMETABLE MATRIX TABLE (Dynamic based on View Mode) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {viewMode === "PERSONAL" ? (
          <>
            <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 bg-indigo-600 text-white rounded-lg font-black text-xs uppercase shadow-xs">
                  {user?.name || "My Schedule"}
                </span>
                <span className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                  Weekly Teaching Periods & Proxy Allocations
                </span>
              </div>
              <span className="text-xs font-bold text-slate-500 font-mono">
                {schoolStartTime} – {schoolEndTime}
              </span>
            </div>

            <TeacherPersonalScheduleTable
              days={DAYS}
              periodsList={periodsList}
              myTimetable={myPersonalTimetable}
              mySubstitutions={mySubstitutions}
              getSubjectBadgeColor={getSubjectBadgeColor}
            />
          </>
        ) : (
          <>
            <TimetableBanner
              selectedClass={selectedClass}
              selectedSection={selectedSection}
              schoolStartTime={schoolStartTime}
              schoolEndTime={schoolEndTime}
            />

            <TimetableMatrixTable
              days={DAYS}
              periodsList={periodsList}
              getEntry={getEntry}
              getSubjectBadgeColor={getSubjectBadgeColor}
              onOpenEditSlot={handleOpenEditSlot}
            />
          </>
        )}
      </div>

      {/* 📋 Color Coded Subject Legend */}
      <TimetableLegend />

      {/* 💡 EDIT / ASSIGN PERIOD SLOT MODAL */}
      <EditSlotModal
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        activeSlot={activeSlot}
        setActiveSlot={setActiveSlot}
        selectedClass={selectedClass}
        selectedSection={selectedSection}
        days={DAYS}
        availableSubjectNames={availableSubjectNames}
        teachers={teachers}
        isCustomSubjectMode={isCustomSubjectMode}
        setIsCustomSubjectMode={setIsCustomSubjectMode}
        saveToCurriculum={saveToCurriculum}
        setSaveToCurriculum={setSaveToCurriculum}
        onSaveSlot={handleSaveSlot}
        isPending={assignPeriodMutation.isPending}
      />

      {/* ⚙️ CONFIGURE PERIOD TIMINGS MODAL */}
      <TimingSetupModal
        isOpen={isTimingModalOpen}
        onOpenChange={setIsTimingModalOpen}
        tempPeriods={tempPeriods}
        setTempPeriods={setTempPeriods}
        onApplyPreset={handleApplyPresetTiming}
        onSaveTimings={handleSavePeriodTimings}
      />
    </div>
  );
}
