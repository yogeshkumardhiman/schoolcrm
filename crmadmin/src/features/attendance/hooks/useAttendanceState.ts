import { useState, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import client from "@/lib/client";
import { APP_CONFIG } from "@/constants/config";
import { useAuth } from "@/components/AbilityProvider";
import { AttendanceRecord } from "@/features/attendance";

export interface ClassEntry {
  class: string;
  section: string;
  totalStudents?: number;
  present?: number;
  absent?: number;
  leave?: number;
  late?: number;
  percentage?: string;
  isCompleted?: boolean;
  teacher?: string;
  population?: number;
}

// ──────────────────────────────────────────────
// Class ordering — Nursery → LKG → UKG → 1st → 2nd ... 12th
// ──────────────────────────────────────────────
const CLASS_ORDER: Record<string, number> = {
  NURSERY: 0,
  "PRE-NURSERY": 0,
  PRENURSERY: 0,
  LKG: 1,
  UKG: 2,
  "1ST": 3,
  "1": 3,
  FIRST: 3,
  "2ND": 4,
  "2": 4,
  SECOND: 4,
  "3RD": 5,
  "3": 5,
  THIRD: 5,
  "4TH": 6,
  "4": 6,
  FOURTH: 6,
  "5TH": 7,
  "5": 7,
  FIFTH: 7,
  "6TH": 8,
  "6": 8,
  SIXTH: 8,
  "7TH": 9,
  "7": 9,
  SEVENTH: 9,
  "8TH": 10,
  "8": 10,
  EIGHTH: 10,
  "9TH": 11,
  "9": 11,
  NINTH: 11,
  "10TH": 12,
  "10": 12,
  TENTH: 12,
  "11TH": 13,
  "11": 13,
  ELEVENTH: 13,
  "12TH": 14,
  "12": 14,
  TWELFTH: 14,
};

function classOrder(cls: string): number {
  const key = cls.toUpperCase().replace(/\s+/g, "").replace("CLASS", "");
  return CLASS_ORDER[key] ?? 99;
}

function sortClasses(entries: any): ClassEntry[] {
  const list: ClassEntry[] = Array.isArray(entries)
    ? entries
    : Array.isArray(entries?.data)
    ? entries.data
    : [];

  return [...list].sort((a, b) => {
    const oa = classOrder(a?.class || "");
    const ob = classOrder(b?.class || "");
    if (oa !== ob) return oa - ob;
    return (a?.section || "").localeCompare(b?.section || "");
  });
}

function cleanCls(str: string): string {
  if (!str) return '';
  return str.toUpperCase().replace(/^GRADE\s+/i, '').replace(/^CLASS\s+/i, '').replace(/\s+/g, '').trim();
}

export function useAttendance() {
  const queryClient = useQueryClient();
  const { user, loading: authLoading } = useAuth();

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterClass, setFilterClass] = useState<string>("ALL");
  const [filterSection, setFilterSection] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL"); // for drill-down

  // Client-side fallback token reads
  const [clientRole, setClientRole] = useState("");
  const [clientClass, setClientClass] = useState("");
  const [clientSection, setClientSection] = useState("");

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setClientRole(localStorage.getItem(APP_CONFIG.auth.tokens.role) || '');
      setClientClass(localStorage.getItem(APP_CONFIG.auth.tokens.class) || '');
      setClientSection(localStorage.getItem('crm_user_section') || 'A');
    }
  }, []);

  const rawRole = (user?.role || clientRole || '').trim().toUpperCase();
  const isTeacher = rawRole === 'TEACHER' || rawRole === 'CLASS_TEACHER';
  const teacherClass = user?.class || user?.staffProfile?.class || clientClass || '';
  const teacherSection = user?.section || user?.staffProfile?.section || clientSection || 'A';

  // null = overview, set = drilled into a class
  const [drillClass, setDrillClass] = useState<ClassEntry | null>(null);

  // Auto-drill on mount or when user loads: Teacher lands immediately on their own class
  useEffect(() => {
    if (isTeacher && teacherClass && !drillClass) {
      setDrillClass({
        class: teacherClass.toUpperCase(),
        section: (teacherSection || 'A').toUpperCase(),
        teacher: user?.name || 'Class Teacher',
      });
    }
  }, [isTeacher, teacherClass, teacherSection, user, drillClass]);

  const isSunday = new Date(selectedDate).getDay() === 0;

  // ── 0. Fetch Academic Calendar Events & Holidays ──────────────────────────────
  const { data: calendarEvents = [] } = useQuery({
    queryKey: ["academic-calendar-events-for-attendance"],
    queryFn: async () => {
      const res: any = await client.get("/website/events").catch(() => []);
      return Array.isArray(res) ? res : (res?.data || []);
    },
    staleTime: 1000 * 60 * 5,
  });

  // Check if selectedDate falls within an active holiday or vacation in the calendar
  const holidayEvent = useMemo(() => {
    return calendarEvents.find((evt: any) => {
      const isHolidayType = ["HOLIDAY", "GOVT_HOLIDAY", "VACATION"].includes(
        (evt.type || "").toUpperCase()
      );
      if (!isHolidayType) return false;
      const start = evt.date;
      const end = evt.endDate || evt.date;
      return selectedDate >= start && selectedDate <= end;
    });
  }, [calendarEvents, selectedDate]);

  const isHoliday = Boolean(isSunday || holidayEvent);
  const holidayTitle = holidayEvent ? holidayEvent.title : (isSunday ? "Sunday Institutional Closure" : "");
  const holidayTypeLabel = holidayEvent
    ? (holidayEvent.type === "VACATION" ? "Vacation Break" : "Declared Holiday")
    : "Weekly Holiday";
  const { data: rawClasses = [], isLoading: classesLoading } = useQuery<ClassEntry[]>({
    queryKey: ["classes-sections-attendance"],
    enabled: !!user && !authLoading,
    queryFn: async () => {
      // 1. Fetch school info to determine grade scope
      const schoolData: any = await client.get("/settings/school-info").catch(() => null);
      const maxClass = schoolData?.maxClass || "12TH";

      const ALL_POSSIBLE_CLASSES = [
        "NURSERY", "LKG", "UKG", "1ST", "2ND", "3RD", "4TH", "5TH",
        "6TH", "7TH", "8TH", "9TH", "10TH", "11TH", "12TH"
      ];
      const maxIndex = ALL_POSSIBLE_CLASSES.indexOf(maxClass);
      const activeClasses = maxIndex !== -1
        ? ALL_POSSIBLE_CLASSES.slice(0, maxIndex + 1)
        : ALL_POSSIBLE_CLASSES;

      // 2. Fetch created sections, teachers and students in parallel
      const [sectionsRes, staffRes, studentRes]: [any, any, any] = await Promise.all([
        client.get('/classes/sections').catch(() => []),
        client.get('/staff').catch(() => []),
        client.get('/students?limit=1000').catch(() => [])
      ]);

      const existingSections: any[] = Array.isArray(sectionsRes) ? sectionsRes : sectionsRes?.data || [];
      const staffList: any[] = Array.isArray(staffRes) ? staffRes : staffRes?.data || [];
      const studentList: any[] = Array.isArray(studentRes) ? studentRes : studentRes?.data || [];

      // Map teacher assignments: "CLASS-SECTION" -> Teacher Name
      const teacherMap = new Map<string, string>();
      staffList.forEach((st: any) => {
        if (st.class && st.role === 'TEACHER') {
          teacherMap.set(`${cleanCls(st.class)}-${(st.section || 'A').toUpperCase()}`, st.name);
        }
      });

      // Map student counts: "CLASS-SECTION" -> Count
      const studentCountMap = new Map<string, number>();
      studentList.forEach((st: any) => {
        if (st.class) {
          const key = `${cleanCls(st.class)}-${(st.section || 'A').toUpperCase()}`;
          studentCountMap.set(key, (studentCountMap.get(key) || 0) + 1);
        }
      });

      const result: ClassEntry[] = [];
      const handledClasses = new Set<string>();

      // A. Include all explicit sections created in Class Sections
      existingSections.forEach((sec: any) => {
        const cls = sec.class.toUpperCase();
        const secCode = (sec.section || 'A').toUpperCase();
        const key = `${cleanCls(cls)}-${secCode}`;
        const teacherName = sec.classTeacher?.name || teacherMap.get(key) || "Unassigned";
        const count = sec.studentCount ?? studentCountMap.get(key) ?? 0;

        result.push({
          class: cls,
          section: secCode,
          population: count,
          totalStudents: count,
          teacher: teacherName
        });
        handledClasses.add(cls);
      });

      // B. Include default Section A for any operating grades without a custom section
      activeClasses.forEach((cls) => {
        if (!handledClasses.has(cls)) {
          const key = `${cleanCls(cls)}-A`;
          const teacherName = teacherMap.get(key) || "Unassigned";
          const count = studentCountMap.get(key) ?? 0;

          result.push({
            class: cls,
            section: "A",
            population: count,
            totalStudents: count,
            teacher: teacherName
          });
        }
      });

      return result;
    },
  });

  const allClassesRaw = useMemo(() => sortClasses(rawClasses), [rawClasses]);

  // ── 🔒 Role-based Class Filter ─────────────────────────────────────
  // TEACHER sees ONLY their assigned class/section; Admin/Principal see all
  const allClasses = useMemo(() => {
    if (!isTeacher || !teacherClass) return allClassesRaw;
    // Keep only the teacher's own class-section
    const filtered = allClassesRaw.filter(
      c => cleanCls(c.class) === cleanCls(teacherClass) &&
           (c.section || 'A').toUpperCase() === (teacherSection || 'A').toUpperCase()
    );
    if (filtered.length > 0) return filtered;
    return [{
      class: teacherClass.toUpperCase(),
      section: (teacherSection || 'A').toUpperCase(),
      population: 0,
      totalStudents: 0,
      teacher: user?.name || 'Class Teacher'
    }];
  }, [allClassesRaw, isTeacher, teacherClass, teacherSection, user]);

  // Unique class names & sections for filter dropdowns
  const uniqueClassNames = useMemo(
    () => Array.from(new Set(allClasses.map((c) => c.class))),
    [allClasses]
  );
  const uniqueSections = useMemo(() => {
    const base =
      filterClass === "ALL"
        ? allClasses
        : allClasses.filter((c) => c.class === filterClass);
    return Array.from(new Set(base.map((c) => c.section).filter(Boolean)));
  }, [allClasses, filterClass]);

  // ── 2. Attendance for drilled class ─────────────────────────────────
  const { data: drillAttendance = [], isLoading: drillLoading } = useQuery<AttendanceRecord[]>({
    queryKey: ["drillAttendance", drillClass?.class, drillClass?.section, selectedDate],
    enabled: !!drillClass && !!user,
    queryFn: async () => {
      const data: any = await client.get(`/attendance/class?class=${encodeURIComponent(drillClass!.class)}&section=${encodeURIComponent(drillClass!.section || '')}&date=${encodeURIComponent(selectedDate)}`).catch(() => []);
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.records)) return data.records;
      if (Array.isArray(data?.attendance)) return data.attendance;
      if (Array.isArray(data?.data)) return data.data;
      return [];
    },
  });

  // ── 3. Students for drilled class ───────────────────────────────────
  const { data: drillStudents = [], isLoading: studentsLoading } = useQuery<any[]>({
    queryKey: ["drillStudents", drillClass?.class, drillClass?.section],
    enabled: !!drillClass && !!user,
    queryFn: async () => {
      const data: any = await client.get(`/students?class=${encodeURIComponent(drillClass!.class)}&section=${encodeURIComponent(drillClass!.section || '')}&limit=200`).catch(() => []);
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.students)) return data.students;
      if (Array.isArray(data?.data)) return data.data;
      return [];
    },
  });

  // ── 4. Class-level attendance summary (all classes, selected date) ───
  const { data: classSummaries = [], isLoading: summariesLoading } = useQuery<
    { cls: ClassEntry; present: number; absent: number; leave: number; halfDay: number }[]
  >({
    queryKey: ["classSummaries", selectedDate, allClasses.length],
    enabled: allClasses.length > 0 && !!user,
    queryFn: async () => {
      const results = await Promise.allSettled(
        allClasses.map(async (cls) => {
          const att: any = await client.get(`/attendance/class?class=${encodeURIComponent(cls.class)}&section=${encodeURIComponent(cls.section || "")}&date=${encodeURIComponent(selectedDate)}`).catch(() => []);
          const records: AttendanceRecord[] = Array.isArray(att) ? att : att?.data || [];
          return {
            cls,
            present: records.filter((r) => r.status === "PRESENT").length,
            absent: records.filter((r) => r.status === "ABSENT").length,
            leave: records.filter((r) => r.status === "LEAVE").length,
            halfDay: records.filter((r) => r.status === "HALF_DAY" || r.status === "HALF DAY").length,
          };
        })
      );
      return results
        .filter((r) => r.status === "fulfilled")
        .map((r) => (r as PromiseFulfilledResult<any>).value);
    },
  });

  // ── 5. Merge drill students with attendance status ───────────────────
  const drillMerged = useMemo(() => {
    if (!drillStudents.length) return [];
    const attMap: Record<string, string> = {};
    drillAttendance.forEach((a: any) => {
      attMap[String(a.studentId)] = a.status;
    });
    return drillStudents
      .filter((s: any) => {
        const q = searchQuery.toLowerCase();
        const matchSearch =
          !searchQuery ||
          s.name?.toLowerCase().includes(q) ||
          String(s.admissionNo).includes(q);
        const currentSt = attMap[String(s.id)] || "NOT MARKED";
        const matchStatus =
          statusFilter === "ALL" ||
          (statusFilter === "HALF DAY" && (currentSt === "HALF_DAY" || currentSt === "HALF DAY")) ||
          currentSt === statusFilter;
        return matchSearch && matchStatus;
      })
      .map((s: any) => ({ ...s, status: attMap[String(s.id)] || "NOT MARKED" }));
  }, [drillStudents, drillAttendance, searchQuery, statusFilter]);

  // ── Grand totals (Real-time telemetry for drilled class or whole school) ───
  const grandTotal = useMemo(() => {
    if (drillClass && drillStudents.length > 0) {
      const attMap: Record<string, string> = {};
      drillAttendance.forEach((a: any) => {
        attMap[String(a.studentId)] = a.status;
      });
      const present = drillStudents.filter((s: any) => attMap[String(s.id)] === "PRESENT").length;
      const absent = drillStudents.filter((s: any) => attMap[String(s.id)] === "ABSENT").length;
      const leave = drillStudents.filter((s: any) => attMap[String(s.id)] === "LEAVE").length;
      const halfDay = drillStudents.filter((s: any) => attMap[String(s.id)] === "HALF_DAY" || attMap[String(s.id)] === "HALF DAY").length;
      return {
        students: drillStudents.length,
        present,
        absent,
        leave,
        halfDay,
      };
    }
    return classSummaries.reduce(
      (acc: any, c: any) => ({
        students: acc.students + (parseInt(String(c.cls.population), 10) || 0),
        present: acc.present + (parseInt(String(c.present), 10) || 0),
        absent: acc.absent + (parseInt(String(c.absent), 10) || 0),
        leave: acc.leave + (parseInt(String(c.leave), 10) || 0),
        halfDay: (acc.halfDay || 0) + (parseInt(String(c.halfDay), 10) || 0),
      }),
      { students: 0, present: 0, absent: 0, leave: 0, halfDay: 0 }
    );
  }, [drillClass, drillStudents, drillAttendance, classSummaries]);

  // ── Filtered overview rows ──────────────────────────────────────────
  const filteredSummaries = classSummaries.filter((s: any) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !searchQuery ||
      s.cls.class.toLowerCase().includes(q) ||
      s.cls.section.toLowerCase().includes(q) ||
      (s.cls.teacher || "").toLowerCase().includes(q);
    const matchClass = filterClass === "ALL" || s.cls.class === filterClass;
    const matchSection =
      filterSection === "ALL" || s.cls.section === filterSection;
    return matchSearch && matchClass && matchSection;
  });

  const isLoading = classesLoading || summariesLoading;

  const selectCls = (cls: ClassEntry) => {
    setDrillClass(cls);
    setSearchQuery("");
    setStatusFilter("ALL");
  };

  return {
    queryClient,
    user,
    authLoading,
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
  };
}
