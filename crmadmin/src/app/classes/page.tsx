"use client";

import React, { useState, useEffect, useMemo } from "react";
import client from "@/lib/client";
import { useRouter } from "@bprogress/next/app";
import toast from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSessionContext } from "@/contexts/SessionContext";

import { ClassesHeader } from "./components/ClassesHeader";
import { ClassesMetricCards } from "./components/ClassesMetricCards";
import { ClassesFilterBar } from "./components/ClassesFilterBar";
import { ClassesRegistryTable } from "./components/ClassesRegistryTable";
import { SectionsDirectoryTable } from "./components/SectionsDirectoryTable";
import { ViewRosterModal } from "./components/ViewRosterModal";
import { AllocateSectionModal } from "./components/AllocateSectionModal";
import { AssignTeacherModal } from "./components/AssignTeacherModal";

const ALL_CLASSES = [
  "PLAYGROUP", "NURSERY", "LKG", "UKG", "1ST", "2ND", "3RD", "4TH", "5TH",
  "6TH", "7TH", "8TH", "9TH", "10TH", "11TH", "12TH"
];

const WING_MAP: Record<string, string> = {
  PLAYGROUP: "Pre-Primary",
  NURSERY: "Pre-Primary",
  LKG: "Pre-Primary",
  UKG: "Pre-Primary",
  "1ST": "Primary Wing",
  "2ND": "Primary Wing",
  "3RD": "Primary Wing",
  "4TH": "Primary Wing",
  "5TH": "Primary Wing",
  "6TH": "Middle Wing",
  "7TH": "Middle Wing",
  "8TH": "Middle Wing",
  "9TH": "Senior Wing",
  "10TH": "Senior Wing",
  "11TH": "Senior Secondary",
  "12TH": "Senior Secondary",
};

export default function ClassesPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { session: selectedSession } = useSessionContext();

  const [activeTab, setActiveTab] = useState<"classes" | "sections">("classes");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClassFilter, setSelectedClassFilter] = useState("ALL");
  const [minClass, setMinClass] = useState("NURSERY");
  const [maxClass, setMaxClass] = useState("12TH");

  // Modal States
  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);
  const [allocateData, setAllocateData] = useState({
    className: "1ST",
    sectionName: "A",
    teacherId: "",
    roomNo: "Room 101",
    capacity: 40,
  });
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);

  const [isAssignTeacherOpen, setIsAssignTeacherOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<any>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");

  const [isViewRosterOpen, setIsViewRosterOpen] = useState(false);
  const [viewRosterSection, setViewRosterSection] = useState<any>(null);

  // 1. Unified Lightweight Class Summary API
  const { data: summaryResponse, isLoading: summaryLoading, refetch: refetchSummary } = useQuery<any>({
    queryKey: ['classes-summary-data', selectedSession],
    queryFn: () => client.get(`/classes/summary${selectedSession ? `?session=${encodeURIComponent(selectedSession)}` : ''}`).catch(() => null),
    staleTime: 0,
    refetchOnMount: true,
  });

  const isTeacherModalOpen = isAllocateModalOpen || isAssignTeacherOpen;

  // 2. Lightweight Teaching Faculty List - Loaded on demand ONLY when modal is opened
  const { data: teachersList = [], refetch: refetchTeachers } = useQuery<any[]>({
    queryKey: ['classes-teachers-list'],
    queryFn: () => client.get("/classes/teachers").catch(() => []),
    staleTime: 5 * 60 * 1000,
    enabled: isTeacherModalOpen,
  });

  // 3. Sections list - Loaded on demand ONLY when switching to Sections tab
  const { data: sectionsListResponse = [], isLoading: sectionsLoading, refetch: refetchSections } = useQuery<any[]>({
    queryKey: ['classes-sections-list', selectedClassFilter, selectedSession],
    queryFn: () => client.get(`/classes/sections${selectedClassFilter !== 'ALL' ? `?class=${selectedClassFilter}` : ''}`).catch(() => []),
    staleTime: 60000,
    enabled: activeTab === 'sections',
  });

  // 4. Fetch all students for the active class in Allocate Modal (only when opened)
  const { data: classStudents = [], isLoading: classStudentsLoading } = useQuery<any[]>({
    queryKey: ['allocate-class-students', allocateData.className],
    queryFn: () => client.get(`/classes/all-class-students?class=${allocateData.className}`).catch(() => []),
    staleTime: 0,
    refetchOnMount: true,
    enabled: isAllocateModalOpen,
  });

  // 5. Fetch detailed section info for View Roster Modal (on-demand)
  const { data: detailedSectionRoster, isLoading: rosterLoading } = useQuery<any>({
    queryKey: ['section-roster-view', viewRosterSection?.id],
    queryFn: () => viewRosterSection?.id ? client.get(`/classes/roster/${viewRosterSection.id}`) : null,
    enabled: isViewRosterOpen && !!viewRosterSection?.id,
  });

  const { data: schoolInfo } = useQuery({
    queryKey: ['school-info'],
    queryFn: () => client.get("/settings/school-info").catch(() => null),
    staleTime: 5 * 60 * 1000,
  });

  const summary = summaryResponse?.summary || {};

  useEffect(() => {
    if (summary?.minClass) setMinClass(summary.minClass.toUpperCase());
    if (summary?.maxClass) setMaxClass(summary.maxClass.toUpperCase());
    else if (schoolInfo?.maxClass) setMaxClass(schoolInfo.maxClass.toUpperCase());
  }, [summary?.minClass, summary?.maxClass, schoolInfo?.maxClass]);

  const sectionsList = useMemo(() => {
    if (Array.isArray(sectionsListResponse) && sectionsListResponse.length > 0) return sectionsListResponse;
    const allSummarySections: any[] = [];
    (summaryResponse?.classes || []).forEach((c: any) => {
      (c.sections || []).forEach((sec: any) => {
        allSummarySections.push({
          ...sec,
          class: sec.class || c.class,
        });
      });
    });
    return allSummarySections;
  }, [sectionsListResponse, summaryResponse]);

  const teachers = useMemo(() => {
    return Array.isArray(teachersList) ? teachersList : [];
  }, [teachersList]);

  // Map of Assigned Teacher IDs -> Section Info
  const assignedTeachersMap = useMemo(() => {
    const map = new Map<number, { class: string; section: string; sectionId: number }>();
    if (Array.isArray(sectionsList)) {
      sectionsList.forEach((sec: any) => {
        if (sec.classTeacherId) {
          map.set(Number(sec.classTeacherId), {
            class: sec.class,
            section: sec.section,
            sectionId: sec.id,
          });
        }
      });
    }
    return map;
  }, [sectionsList]);

  // Unassigned teachers (who are NOT class teachers of any section)
  const availableUnassignedTeachers = useMemo(() => {
    return teachers.filter((t: any) => !assignedTeachersMap.has(t.id));
  }, [teachers, assignedTeachersMap]);

  // Dynamic Active Classes directly from database summary response
  const activeClassList: string[] = useMemo(() => {
    if (Array.isArray(summaryResponse?.classes) && summaryResponse.classes.length > 0) {
      return summaryResponse.classes.map((c: any) => (c.class || '').toUpperCase());
    }
    return [];
  }, [summaryResponse]);

  // Class Distribution Map
  const classStudentCounts = useMemo(() => {
    const map: Record<string, number> = {};
    (summaryResponse?.classes || []).forEach((c: any) => {
      map[c.class.toUpperCase()] = c.studentCount || 0;
    });
    return map;
  }, [summaryResponse]);

  // Total Enrolled Scholars strictly within active operating classes
  const totalEnrolled = useMemo(() => {
    if (typeof summary?.totalStudents === 'number') {
      return summary.totalStudents;
    }
    return activeClassList.reduce((acc: number, cls: string) => acc + (classStudentCounts[cls] || 0), 0);
  }, [summary, activeClassList, classStudentCounts]);

  const activeSectionsCount = useMemo(() => {
    if (!Array.isArray(sectionsList)) return 0;
    return sectionsList.filter((s: any) => activeClassList.includes((s.class || "").toUpperCase())).length;
  }, [sectionsList, activeClassList]);

  const totalFacultyCount = summary?.totalTeachers || teachers.length || 0;

  // Active Section Map per Class
  const classSectionsMap = useMemo(() => {
    const map: Record<string, any[]> = {};
    if (Array.isArray(summaryResponse?.classes)) {
      summaryResponse.classes.forEach((c: any) => {
        const cls = (c.class || "").toUpperCase();
        if (Array.isArray(c.sections)) {
          map[cls] = c.sections.map((s: any) => ({ ...s, class: s.class || c.class }));
        }
      });
    }
    if (Array.isArray(sectionsListResponse) && sectionsListResponse.length > 0) {
      sectionsListResponse.forEach((sec: any) => {
        const cls = (sec.class || "").toUpperCase();
        if (!map[cls]) map[cls] = [];
        if (!map[cls].some((s: any) => s.id === sec.id)) {
          map[cls].push(sec);
        }
      });
    }
    return map;
  }, [summaryResponse, sectionsListResponse]);

  // Existing target section for Allocate Modal
  const currentAllocateSection = useMemo(() => {
    return (classSectionsMap[allocateData.className] || []).find(
      (s: any) => s.section === allocateData.sectionName
    );
  }, [classSectionsMap, allocateData.className, allocateData.sectionName]);

  // Teachers to show in Allocate Modal
  const allocateDropdownTeachers = useMemo(() => {
    const currentTeacherId = currentAllocateSection?.classTeacherId;
    return teachers.filter((t: any) => {
      if (!assignedTeachersMap.has(t.id)) return true;
      if (currentTeacherId && t.id === currentTeacherId) return true;
      return false;
    });
  }, [teachers, assignedTeachersMap, currentAllocateSection]);

  // Teachers to show in Assign Incharge Modal
  const assignModalDropdownTeachers = useMemo(() => {
    const currentTeacherId = activeSection?.classTeacherId;
    return teachers.filter((t: any) => {
      if (!assignedTeachersMap.has(t.id)) return true;
      if (currentTeacherId && t.id === currentTeacherId) return true;
      return false;
    });
  }, [teachers, assignedTeachersMap, activeSection]);

  // Filtered Class List for Registry Table
  const filteredClasses = useMemo(() => {
    return activeClassList.filter((cls) => {
      if (selectedClassFilter !== "ALL" && cls !== selectedClassFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const wing = (WING_MAP[cls] || "").toLowerCase();
        const hasMatchingSection = (classSectionsMap[cls] || []).some(
          (sec) =>
            sec.section.toLowerCase().includes(q) ||
            (sec.classTeacher?.name || "").toLowerCase().includes(q) ||
            (sec.roomNo || "").toLowerCase().includes(q)
        );
        return cls.toLowerCase().includes(q) || wing.includes(q) || hasMatchingSection;
      }
      return true;
    });
  }, [activeClassList, selectedClassFilter, searchQuery, classSectionsMap]);

  // Filtered Sections for Sections Directory
  const filteredSections = useMemo(() => {
    if (!Array.isArray(sectionsList)) return [];
    return sectionsList.filter((sec: any) => {
      if (selectedClassFilter !== "ALL" && sec.class !== selectedClassFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          (sec.class || "").toLowerCase().includes(q) ||
          (sec.section || "").toLowerCase().includes(q) ||
          (sec.roomNo || "").toLowerCase().includes(q) ||
          (sec.classTeacher?.name || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [sectionsList, selectedClassFilter, searchQuery]);

  // ⚡ MUTATIONS
  const allocateMutation = useMutation({
    mutationFn: (data: any) => client.post("/classes/allocate-section", data),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['classes-summary-data'] });
      queryClient.invalidateQueries({ queryKey: ['classes-sections-list'] });
      queryClient.invalidateQueries({ queryKey: ['allocate-class-students'] });
      toast.success(res?.message || "Section and scholars allocated successfully!");
      setIsAllocateModalOpen(false);
      setSelectedStudentIds([]);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to allocate section");
    },
  });

  const assignTeacherMutation = useMutation({
    mutationFn: (data: { sectionId: number; teacherId: number }) =>
      client.post("/classes/assign-teacher", data),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['classes-summary-data'] });
      queryClient.invalidateQueries({ queryKey: ['classes-sections-list'] });
      toast.success(res?.message || "Class teacher assigned successfully!");
      setIsAssignTeacherOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to assign teacher");
    },
  });

  const autoAssignTeachersMutation = useMutation({
    mutationFn: () => client.post("/classes/auto-assign-teachers", {}),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['classes-summary-data'] });
      queryClient.invalidateQueries({ queryKey: ['classes-sections-list'] });
      toast.success(res?.message || "All available teachers allocated as incharge!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Auto assignment failed");
    },
  });

  const deleteSectionMutation = useMutation({
    mutationFn: (id: number) => client.delete(`/classes/sections/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes-summary-data'] });
      queryClient.invalidateQueries({ queryKey: ['classes-sections-list'] });
      toast.success("Section deleted successfully");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete section");
    },
  });

  const autoRollMutation = useMutation({
    mutationFn: (sectionId: number) => client.post("/classes/auto-roll-numbers", { sectionId }),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['classes-summary-data'] });
      queryClient.invalidateQueries({ queryKey: ['classes-sections-list'] });
      queryClient.invalidateQueries({ queryKey: ['section-roster-view'] });
      toast.success(res?.message || "Alphabetical roll numbers assigned!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to generate roll numbers");
    },
  });

  const removeStudentMutation = useMutation({
    mutationFn: (studentId: number) =>
      client.post(`/classes/remove-student/${studentId}`, {}),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['classes-summary-data'] });
      queryClient.invalidateQueries({ queryKey: ['classes-sections-list'] });
      queryClient.invalidateQueries({ queryKey: ['section-roster-view'] });
      toast.success(res?.message || "Student unassigned from section!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to remove student");
    },
  });

  // Handlers
  const handleOpenAllocateModal = (className?: string, sectionName?: string) => {
    const targetClass = className || (activeClassList[0] || "1ST");
    const existingSections = classSectionsMap[targetClass] || [];
    let nextSecName = "A";
    if (sectionName) {
      nextSecName = sectionName;
    } else if (existingSections.length > 0) {
      const letters = ["A", "B", "C", "D", "E", "F"];
      const used = existingSections.map((s) => s.section.toUpperCase());
      const available = letters.find((l) => !used.includes(l));
      nextSecName = available || "A";
    }

    const existingSec = existingSections.find((s) => s.section.toUpperCase() === nextSecName.toUpperCase());

    setAllocateData({
      className: targetClass,
      sectionName: nextSecName,
      teacherId: existingSec?.classTeacherId ? String(existingSec.classTeacherId) : "",
      roomNo: existingSec?.roomNo || `Room ${targetClass.replace(/\D/g, "") || "101"}`,
      capacity: existingSec?.capacity || 40,
    });
    setSelectedStudentIds([]);
    setIsAllocateModalOpen(true);
  };

  const handleOpenAssignTeacher = (section: any) => {
    setActiveSection(section);
    setSelectedTeacherId(section.classTeacherId ? String(section.classTeacherId) : "");
    setIsAssignTeacherOpen(true);
  };

  const handleOpenViewRoster = (section: any) => {
    setViewRosterSection(section);
    setIsViewRosterOpen(true);
  };

  const handleRefresh = () => {
    refetchSummary();
    refetchTeachers();
    refetchSections();
    toast.success("Live data refreshed!");
  };

  return (
    <div className="flex-1 space-y-6 p-6 sm:p-8 pt-8 bg-slate-50/50 min-h-screen font-sans text-slate-900 relative z-10">
      {/* 🏙️ TOP EXECUTIVE HEADER */}
      <ClassesHeader
        onAutoAssign={() => autoAssignTeachersMutation.mutate()}
        isAutoAssignPending={autoAssignTeachersMutation.isPending}
        sectionsCount={sectionsList.length}
        onOpenAllocate={() => handleOpenAllocateModal("1ST")}
      />

      {/* 📊 4 STAT METRIC CARDS */}
      <ClassesMetricCards
        isLoading={summaryLoading}
        activeClassesCount={activeClassList.length}
        minClass={minClass}
        maxClass={maxClass}
        totalEnrolled={totalEnrolled}
        totalFacultyCount={totalFacultyCount}
        availableTeachersCount={availableUnassignedTeachers.length}
        activeSectionsCount={activeSectionsCount}
      />

      {/* 🧭 VIEW TABS & FILTER BAR */}
      <ClassesFilterBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        classesCount={filteredClasses.length}
        sectionsCount={filteredSections.length}
        activeClassList={activeClassList}
        selectedClassFilter={selectedClassFilter}
        setSelectedClassFilter={setSelectedClassFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onRefresh={handleRefresh}
      />

      {/* 📑 TAB 1: MAIN CLASSES REGISTRY TABLE */}
      {activeTab === "classes" && (
        <ClassesRegistryTable
          isLoading={summaryLoading}
          filteredClasses={filteredClasses}
          classStudentCounts={classStudentCounts}
          classSectionsMap={classSectionsMap}
          wingMap={WING_MAP}
          onOpenAllocate={handleOpenAllocateModal}
          onOpenViewRoster={handleOpenViewRoster}
          onManageClass={(cls) => {
            setSelectedClassFilter(cls);
            setActiveTab("sections");
          }}
        />
      )}

      {/* 📑 TAB 2: SECTIONS & TEACHERS DIRECTORY TABLE */}
      {activeTab === "sections" && (
        <SectionsDirectoryTable
          isLoading={sectionsLoading}
          filteredSections={filteredSections}
          onOpenAllocate={handleOpenAllocateModal}
          onOpenAssignTeacher={handleOpenAssignTeacher}
          onOpenViewRoster={handleOpenViewRoster}
          onAutoRoll={(secId) => autoRollMutation.mutate(secId)}
          isAutoRollPending={autoRollMutation.isPending}
          onDeleteSection={(secId, name) => {
            if (confirm(`Are you sure you want to delete Section ${name}?`)) {
              deleteSectionMutation.mutate(secId);
            }
          }}
        />
      )}

      {/* 👁️ COMPLETE STUDENT ROSTER VIEWER MODAL */}
      <ViewRosterModal
        isOpen={isViewRosterOpen}
        onOpenChange={setIsViewRosterOpen}
        section={viewRosterSection}
        detailedRoster={detailedSectionRoster}
        isLoading={rosterLoading}
        onAutoRoll={(secId) => autoRollMutation.mutate(secId)}
        isAutoRollPending={autoRollMutation.isPending}
        onRemoveStudent={(studentId, name) => {
          if (confirm(`Remove ${name} from Section ${viewRosterSection?.section}?`)) {
            removeStudentMutation.mutate(studentId);
          }
        }}
        onOpenAllocate={handleOpenAllocateModal}
      />

      {/* 🎯 UNIFIED ALLOCATE SECTION & ASSIGN CLASS TEACHER MODAL */}
      <AllocateSectionModal
        isOpen={isAllocateModalOpen}
        onOpenChange={setIsAllocateModalOpen}
        allocateData={allocateData}
        setAllocateData={setAllocateData}
        activeClassList={activeClassList}
        availableTeachers={availableUnassignedTeachers}
        dropdownTeachers={allocateDropdownTeachers}
        assignedTeachersMap={assignedTeachersMap}
        classStudents={classStudents}
        isStudentsLoading={classStudentsLoading}
        selectedStudentIds={selectedStudentIds}
        setSelectedStudentIds={setSelectedStudentIds}
        onConfirmAllocate={(payload) => allocateMutation.mutate(payload)}
        isPending={allocateMutation.isPending}
      />

      {/* 👨‍🏫 ASSIGN / CHANGE CLASS TEACHER MODAL */}
      <AssignTeacherModal
        isOpen={isAssignTeacherOpen}
        onOpenChange={setIsAssignTeacherOpen}
        activeSection={activeSection}
        selectedTeacherId={selectedTeacherId}
        setSelectedTeacherId={setSelectedTeacherId}
        availableTeachers={availableUnassignedTeachers}
        dropdownTeachers={assignModalDropdownTeachers}
        assignedTeachersMap={assignedTeachersMap}
        onConfirmAssign={(sectionId, teacherId) =>
          assignTeacherMutation.mutate({ sectionId, teacherId })
        }
        isPending={assignTeacherMutation.isPending}
      />
    </div>
  );
}
