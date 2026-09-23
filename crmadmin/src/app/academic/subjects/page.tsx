"use client";

import client from "@/lib/client";
import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  ChevronDown,
  Sparkles,
  Layers,
  GraduationCap,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/dialogbox/dialog";
import { ConfirmDialog } from "@/components/dialogbox/ConfirmDialog";
import { useAuth } from "@/components/AbilityProvider";

const ALL_CLASSES = [
  "NURSERY", "LKG", "UKG", "1ST", "2ND", "3RD", "4TH", "5TH",
  "6TH", "7TH", "8TH", "9TH", "10TH", "11TH", "12TH"
];

export default function SubjectsPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const userRole = (user?.role || "").toUpperCase();
  const isTeacher = userRole === "TEACHER" || userRole === "CLASS_TEACHER";
  const teacherClass = (user?.class || user?.staffProfile?.class || "").toUpperCase().trim();
  const hasAssignedClass = Boolean(teacherClass && teacherClass !== "NONE" && teacherClass !== "");

  // Filter States
  const [selectedClass, setSelectedClass] = useState<string>(() => {
    if (isTeacher && hasAssignedClass) return teacherClass;
    return "NURSERY";
  });
  const [subjectTypeFilter, setSubjectTypeFilter] = useState<string>("ALL");

  // Subject Modal States
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<any | null>(null);
  const [subjectFormData, setSubjectFormData] = useState({
    name: "",
    code: "",
    class: "NURSERY",
    type: "CORE",
    theoryMarks: 50,
    practicalMarks: 50,
    passingMarks: 33,
    assignedTeacherName: "",
  });

  // Delete Subject Confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<any | null>(null);

  // 1. Fetch School Branding & Info
  const { data: schoolInfo } = useQuery({
    queryKey: ["school-info"],
    queryFn: () => client.get("/settings/school-info").catch(() => null),
  });

  const activeClassList = useMemo(() => {
    const rawMin = (schoolInfo?.minClass || "NURSERY").toUpperCase();
    const rawMax = (schoolInfo?.maxClass || "12TH").toUpperCase();
    const minIdx = ALL_CLASSES.findIndex((c) => rawMin.startsWith(c) || rawMin === c);
    const maxIdx = ALL_CLASSES.findIndex((c) => rawMax.startsWith(c) || rawMax === c);
    const start = minIdx !== -1 ? minIdx : 0;
    const end = maxIdx !== -1 ? maxIdx : ALL_CLASSES.length - 1;
    return ALL_CLASSES.slice(start, end + 1);
  }, [schoolInfo]);

  // 2. Fetch Subjects strictly for Active Class
  const { data: rawSubjects = [], isLoading: subjectsLoading } = useQuery({
    queryKey: ["academic-subjects", selectedClass],
    queryFn: () => client.get(`/academic/subjects?class=${selectedClass}`).catch(() => []),
  });

  // 3. Fetch Teaching Faculty on-demand when Subject Modal is opened
  const { data: facultyList = [] } = useQuery<any[]>({
    queryKey: ["academic-faculty-list"],
    queryFn: () => client.get("/classes/teachers").catch(() => []),
    staleTime: 5 * 60 * 1000,
    enabled: isSubjectModalOpen,
  });

  // Filter strictly by class in case backend returns broader list
  const subjects = useMemo(() => {
    if (!Array.isArray(rawSubjects)) return [];
    return rawSubjects.filter(
      (s: any) => (s.class || "").trim().toUpperCase() === selectedClass.trim().toUpperCase()
    );
  }, [rawSubjects, selectedClass]);

  // ⚡ MUTATIONS FOR SUBJECTS
  const saveSubjectMutation = useMutation({
    mutationFn: (data: any) => {
      const payload = {
        ...data,
        class: selectedClass.trim().toUpperCase(),
      };
      if (editingSubject?.id) {
        return client.put(`/academic/subjects/${editingSubject.id}`, payload);
      }
      return client.post("/academic/subjects", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academic-subjects"] });
      toast.success(editingSubject ? "Subject updated successfully!" : "New subject added!");
      setIsSubjectModalOpen(false);
      setEditingSubject(null);
    },
    onError: () => toast.error("Failed to save subject"),
  });

  const deleteSubjectMutation = useMutation({
    mutationFn: (id: number) => client.delete(`/academic/subjects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academic-subjects"] });
      toast.success("Subject deleted successfully");
      setDeleteConfirmOpen(false);
      setSubjectToDelete(null);
    },
    onError: () => toast.error("Failed to delete subject"),
  });

  // Filtered Subjects List
  const filteredSubjects = useMemo(() => {
    if (!Array.isArray(subjects)) return [];
    if (subjectTypeFilter === "ALL") return subjects;
    return subjects.filter((s: any) => s.type === subjectTypeFilter);
  }, [subjects, subjectTypeFilter]);

  const handleOpenNewSubjectModal = () => {
    setEditingSubject(null);
    const isPrePrimary = selectedClass.includes("NUR") || selectedClass.includes("KG");
    setSubjectFormData({
      name: "",
      code: "",
      class: selectedClass,
      type: "CORE",
      theoryMarks: isPrePrimary ? 50 : 80,
      practicalMarks: isPrePrimary ? 50 : 20,
      passingMarks: 33,
      assignedTeacherName: "",
    });
    setIsSubjectModalOpen(true);
  };

  const handleOpenEditSubjectModal = (subj: any) => {
    setEditingSubject(subj);
    setSubjectFormData({
      name: subj.name,
      code: subj.code || "",
      class: subj.class || selectedClass,
      type: subj.type || "CORE",
      theoryMarks: subj.theoryMarks ?? 80,
      practicalMarks: subj.practicalMarks ?? 20,
      passingMarks: subj.passingMarks ?? 33,
      assignedTeacherName: subj.assignedTeacherName || "",
    });
    setIsSubjectModalOpen(true);
  };

  const handleSaveSubject = () => {
    if (!subjectFormData.name.trim()) return toast.error("Please enter Subject Name");
    saveSubjectMutation.mutate(subjectFormData);
  };

  if (!mounted) {
    return (
      <div className="flex-1 space-y-6 p-6 sm:p-8 pt-8 bg-slate-50/50 min-h-screen font-sans">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-4 w-96 rounded-lg" />
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6 sm:p-8 pt-8 bg-slate-50/50 min-h-screen font-sans text-slate-900 relative z-10">
      
      {/* 🏙️ TOP EXECUTIVE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm shadow-indigo-600/20">
            <BookOpen size={18} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase font-heading">
              Subjects & <span className="text-indigo-600">Curriculum</span>
            </h2>
            <p className="text-xs font-medium text-slate-400">
              Manage Class Curriculum, Subject Weightage & Faculty Assignments
            </p>
          </div>
        </div>

        {isTeacher && hasAssignedClass && (
          <div className="flex items-center gap-2">
            <Badge className="bg-indigo-600 text-white font-black text-xs uppercase tracking-wider px-3.5 py-1.5 rounded-xl border-none shadow-xs">
              Assigned Grade {teacherClass}
            </Badge>
          </div>
        )}
      </div>

      {/* 📚 SUBJECTS MANAGEMENT */}
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Class Filter Bar & Add Subject Action */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 px-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                Selected Grade
              </label>
              {isTeacher && hasAssignedClass ? (
                <div className="h-10 px-3.5 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase text-indigo-400">Class:</span>
                  <span className="text-xs font-black uppercase text-indigo-700">{teacherClass}</span>
                </div>
              ) : (
                <div className="relative">
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="appearance-none h-10 px-3 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase outline-none cursor-pointer text-slate-800"
                  >
                    {activeClassList.map((cls) => (
                      <option key={cls} value={cls}>
                        Class {cls}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                </div>
              )}
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                Subject Category
              </label>
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                {(["ALL", "CORE", "ELECTIVE", "ACTIVITY"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setSubjectTypeFilter(st)}
                    className={cn(
                      "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                      subjectTypeFilter === st
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-400 hover:text-slate-700"
                    )}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {!isTeacher && (
            <div className="flex items-center gap-2 pt-2 sm:pt-0">
              <Button
                onClick={handleOpenNewSubjectModal}
                className="h-10 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Plus size={15} /> + Add Custom Subject
              </Button>
            </div>
          )}
        </div>

        {/* Subjects Table strictly for Selected Grade */}
        {subjectsLoading ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <Skeleton key={n} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        ) : filteredSubjects.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <BookOpen size={24} />
            </div>
            <h3 className="font-black text-base text-slate-800 uppercase tracking-tight">No Subjects Defined</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium">
              No subjects registered for Class {selectedClass}. {!isTeacher && "Click '+ Add Custom Subject' to create one."}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-5">#</th>
                    <th className="py-3.5 px-5">Subject Code</th>
                    <th className="py-3.5 px-5">Subject Name</th>
                    <th className="py-3.5 px-5 text-center">Category</th>
                    <th className="py-3.5 px-5 text-center">Theory Marks</th>
                    <th className="py-3.5 px-5 text-center">Practical Marks</th>
                    <th className="py-3.5 px-5 text-center">Total Max</th>
                    <th className="py-3.5 px-5 text-center">Passing Marks</th>
                    <th className="py-3.5 px-5">Assigned Faculty</th>
                    {!isTeacher && <th className="py-3.5 px-5 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                  {filteredSubjects.map((subj: any, idx: number) => {
                    const theory = subj.theoryMarks ?? 50;
                    const practical = subj.practicalMarks ?? 50;
                    const total = theory + practical;
                    const pass = subj.passingMarks ?? 33;
                    return (
                      <tr key={subj.id || idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-5 font-mono text-[11px] text-slate-400">
                          {String(idx + 1).padStart(2, "0")}
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                            {subj.code || `SUB-${subj.id}`}
                          </span>
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="font-black text-slate-900 uppercase text-xs">
                            {subj.name}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-center">
                          <Badge
                            className={cn(
                              "text-[9px] font-black uppercase px-2 py-0.5 border shadow-none",
                              subj.type === "CORE"
                                ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                                : subj.type === "ELECTIVE"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            )}
                          >
                            {subj.type || "CORE"}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-5 text-center font-mono font-bold text-slate-800">
                          {theory}
                        </td>
                        <td className="py-3.5 px-5 text-center font-mono font-bold text-slate-800">
                          {practical}
                        </td>
                        <td className="py-3.5 px-5 text-center font-mono font-black text-indigo-600">
                          {total}
                        </td>
                        <td className="py-3.5 px-5 text-center font-mono font-bold text-emerald-600">
                          {pass}
                        </td>
                        <td className="py-3.5 px-5">
                          {subj.assignedTeacherName ? (
                            <span className="font-bold text-slate-800 text-xs">
                              👨‍🏫 {subj.assignedTeacherName}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">--</span>
                          )}
                        </td>
                        {!isTeacher && (
                          <td className="py-3.5 px-5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenEditSubjectModal(subj)}
                                className="h-8 w-8 p-0 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer"
                                title="Edit Subject"
                              >
                                <Edit2 size={13} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSubjectToDelete(subj);
                                  setDeleteConfirmOpen(true);
                                }}
                                className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                                title="Delete Subject"
                              >
                                <Trash2 size={13} />
                              </Button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table Footer with Summary Stats */}
            <div className="p-4 px-5 bg-slate-50/75 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
              <span className="font-bold uppercase tracking-wider text-[11px]">
                Total Curriculum: <span className="text-slate-900 font-black">{filteredSubjects.length} Subjects</span> in Class {selectedClass}
              </span>
              <span className="font-mono font-bold text-indigo-600">
                Total Max Weightage:{" "}
                {filteredSubjects.reduce(
                  (acc: number, s: any) => acc + (s.theoryMarks ?? 50) + (s.practicalMarks ?? 50),
                  0
                )}{" "}
                Marks
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 💡 CREATE / EDIT SUBJECT MODAL */}
      <Dialog open={isSubjectModalOpen} onOpenChange={setIsSubjectModalOpen}>
        <DialogContent className="max-w-md p-6 bg-white rounded-3xl border border-slate-200 shadow-2xl">
          <DialogHeader className="border-b border-slate-100 pb-4">
            <DialogTitle className="text-lg font-black uppercase text-slate-900 flex items-center gap-2">
              <BookOpen className="text-indigo-600" size={20} />
              {editingSubject ? "Edit Subject" : `Add Subject for Class ${selectedClass}`}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Subject Name <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="e.g. Mathematics, Science, English"
                value={subjectFormData.name}
                onChange={(e) => setSubjectFormData({ ...subjectFormData, name: e.target.value })}
                className="h-11 rounded-xl text-xs font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Subject Code
                </label>
                <Input
                  placeholder="e.g. MTH-101"
                  value={subjectFormData.code}
                  onChange={(e) => setSubjectFormData({ ...subjectFormData, code: e.target.value })}
                  className="h-11 rounded-xl text-xs font-bold font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Subject Category
                </label>
                <select
                  value={subjectFormData.type}
                  onChange={(e) => setSubjectFormData({ ...subjectFormData, type: e.target.value })}
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs font-bold uppercase outline-none"
                >
                  <option value="CORE">Core Academic</option>
                  <option value="ELECTIVE">Elective</option>
                  <option value="ACTIVITY">Activity / Co-Curricular</option>
                  <option value="VOCATIONAL">Vocational / Skill</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Theory Max
                </label>
                <Input
                  type="number"
                  value={subjectFormData.theoryMarks}
                  onChange={(e) => setSubjectFormData({ ...subjectFormData, theoryMarks: Number(e.target.value) })}
                  className="h-11 rounded-xl text-xs font-bold font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Practical Max
                </label>
                <Input
                  type="number"
                  value={subjectFormData.practicalMarks}
                  onChange={(e) => setSubjectFormData({ ...subjectFormData, practicalMarks: Number(e.target.value) })}
                  className="h-11 rounded-xl text-xs font-bold font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Passing Marks
                </label>
                <Input
                  type="number"
                  value={subjectFormData.passingMarks}
                  onChange={(e) => setSubjectFormData({ ...subjectFormData, passingMarks: Number(e.target.value) })}
                  className="h-11 rounded-xl text-xs font-bold font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Assigned Subject Faculty
              </label>
              <select
                value={subjectFormData.assignedTeacherName}
                onChange={(e) => setSubjectFormData({ ...subjectFormData, assignedTeacherName: e.target.value })}
                className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs font-bold uppercase outline-none"
              >
                <option value="">-- Select Faculty Incharge --</option>
                {facultyList.map((f: any) => (
                  <option key={f.id || f.name} value={f.name}>
                    {f.name} ({f.employeeId || f.role || "Teacher"})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter className="border-t border-slate-100 pt-4 flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsSubjectModalOpen(false)}
              className="h-11 rounded-xl text-xs font-bold uppercase cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveSubject}
              disabled={saveSubjectMutation.isPending}
              className="h-11 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              {saveSubjectMutation.isPending ? "Saving..." : editingSubject ? "Update Subject" : "Save Subject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ⚠️ DELETE SUBJECT CONFIRMATION */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete Subject Curriculum"
        description={`Are you sure you want to delete ${subjectToDelete?.name}? This action cannot be undone.`}
        confirmText="Delete Subject"
        type="danger"
        onConfirm={() => {
          if (subjectToDelete?.id) {
            deleteSubjectMutation.mutate(subjectToDelete.id);
          }
        }}
      />
    </div>
  );
}
