"use client";
import client from "@/lib/client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Search,
  Loader2,
  Eye,
  CheckCircle2,
  RefreshCcw,
  Sparkles,
  ArrowUpDown,
  GraduationCap,
  Award,
  Filter
} from "lucide-react";

import toast from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/dialogbox/ConfirmDialog";

const DEFAULT_CLASSES = [
  "9TH", "NURSERY", "LKG", "UKG",
  "1ST", "2ND", "3RD", "4TH", "5TH",
  "6TH", "7TH", "8TH", "10TH", "11TH", "12TH"
];

const SECTIONS = ["All Sections", "A", "B", "C", "D"];

function StudentAvatar({ image, name }: { image?: string; name: string }) {
  const [imgError, setImgError] = useState(false);
  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'S';

  const resolvedUrl = React.useMemo(() => {
    if (!image) return '';
    if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('data:') || image.startsWith('blob:')) {
      return image;
    }
    const apiHost = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000';
    return `${apiHost}${image.startsWith('/') ? '' : '/'}${image}`;
  }, [image]);

  if (!resolvedUrl || imgError) {
    return (
      <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 border border-indigo-200/50 flex items-center justify-center shrink-0 shadow-xs text-white font-black text-sm uppercase">
        {initials}
      </div>
    );
  }

  return (
    <div className="h-11 w-11 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 shadow-xs">
      <img
        src={resolvedUrl}
        alt={name}
        className="h-full w-full object-cover"
        onError={() => setImgError(true)}
      />
    </div>
  );
}

function MyStudentsSkeleton() {
  return (
    <div className="p-8 space-y-6 min-h-screen bg-[#F8FAFC]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded-lg" />
          <Skeleton className="h-4 w-64 rounded-md" />
        </div>
        <Skeleton className="h-10 w-44 rounded-xl" />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs p-6 space-y-4">
        <div className="flex justify-between pb-4 border-b border-slate-100">
          <Skeleton className="h-9 w-64 rounded-lg" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-32 rounded-lg" />
            <Skeleton className="h-9 w-28 rounded-lg" />
          </div>
        </div>
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="flex items-center justify-between p-3.5 bg-slate-50/70 rounded-xl border border-slate-100 gap-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-11 w-11 rounded-xl shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-36 rounded" />
                  <Skeleton className="h-3 w-20 rounded" />
                </div>
              </div>
              <Skeleton className="h-8 w-16 rounded-lg" />
              <Skeleton className="h-4 w-28 rounded hidden md:block" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-8 w-20 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MyStudentsPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("9TH");
  const [selectedSection, setSelectedSection] = useState("All Sections");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempRollNo, setTempRollNo] = useState("");
  const [reassignConfirmOpen, setReassignConfirmOpen] = useState(false);

  const viewStudentDetails = (id: string) => {
    router.push(`/students/view/${id}`);
  };

  // Query: Fetch Teacher's Students with Class/Section Filters
  const { data: responseData, isLoading: loading, refetch } = useQuery<any>({
    queryKey: ['my-students', selectedClass, selectedSection],
    queryFn: async () => {
      try {
        const queryParams = new URLSearchParams();
        if (selectedClass && selectedClass !== 'All Classes') queryParams.append('class', selectedClass);
        if (selectedSection && selectedSection !== 'All Sections') queryParams.append('section', selectedSection);

        const res = await client.get(`/staff/my-students?${queryParams.toString()}`);
        return res;
      } catch (err) {
        console.error("Failed to load students for staff", err);
        return { students: [], availableClasses: [] };
      }
    },
    staleTime: 1000 * 30,
    refetchOnMount: true,
  });

  const students: any[] = Array.isArray(responseData)
    ? responseData
    : (responseData?.students || responseData?.data || []);

  const assignedClass = responseData?.assignedClass;
  const assignedSection = responseData?.assignedSection;
  const isClassTeacher = responseData?.isClassTeacher;
  const backendClasses: string[] = responseData?.availableClasses || [];

  // Merge backend classes with default list
  const classList = React.useMemo(() => {
    const combined = Array.from(new Set([...backendClasses, ...DEFAULT_CLASSES])).filter(Boolean);
    return combined;
  }, [backendClasses]);

  // If teacher is assigned to a specific class, auto-sync selectedClass
  useEffect(() => {
    if (isClassTeacher && assignedClass && selectedClass !== assignedClass) {
      setSelectedClass(assignedClass);
    }
  }, [isClassTeacher, assignedClass]);

  // Mutation: Update Roll Number
  const rollMutation = useMutation({
    mutationFn: ({ studentId, rollNo }: { studentId: string, rollNo: string }) =>
      client.put(`/students/${studentId}`, { rollNo: rollNo }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-students'] });
      toast.success("Roll Number synchronized");
      setEditingId(null);
    },
    onError: () => {
      toast.error("Failed to update roll number");
    }
  });

  // Mutation: Auto Reorder Roll Numbers Alphabetically (A-Z)
  const reorderMutation = useMutation({
    mutationFn: () => client.post("/students/sync-roll-numbers", {
      class: selectedClass !== 'All Classes' ? selectedClass : assignedClass,
      section: selectedSection !== 'All Sections' ? selectedSection : assignedSection,
    }),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['my-students'] });
      toast.success(res?.message || "Alphabetical Roll Numbers Synchronized (01, 02, 03...)");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Reordering failure");
    }
  });

  const handleReorder = () => {
    setReassignConfirmOpen(true);
  };

  const handleStartEdit = (student: any) => {
    setEditingId(student.id.toString());
    setTempRollNo(student.rollNo || "");
  };

  const handleSaveRoll = (studentId: string) => {
    rollMutation.mutate({ studentId, rollNo: tempRollNo });
  };

  const filteredStudents = students.filter(s => {
    const name = s.name || `${s.firstName || ''} ${s.lastName || ''}`.trim();
    const admNo = s.admissionNo || '';
    const roll = s.rollNo || '';
    const query = searchQuery.toLowerCase();
    return name.toLowerCase().includes(query) ||
      admNo.toLowerCase().includes(query) ||
      roll.toLowerCase().includes(query);
  });

  if (loading) return <MyStudentsSkeleton />;

  return (
    <div className="p-8 space-y-6 min-h-screen bg-[#F8FAFC] font-sans">
      {/* 🌟 Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase flex items-center gap-1 border border-indigo-100">
              <Sparkles className="h-3 w-3" /> Class Registry
            </span>
            {isClassTeacher && assignedClass && (
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5">
                <Award className="h-3 w-3 mr-1" /> Class Teacher: Grade {assignedClass}-{assignedSection || 'A'}
              </Badge>
            )}
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-1 leading-none uppercase font-heading">
            {isClassTeacher && assignedClass ? `Grade ${assignedClass}-${assignedSection || 'A'} Student Roster` : `Grade ${selectedClass} Student Roster`}
          </h2>
          <p className="text-sm text-slate-400 font-medium mt-1">
            {isClassTeacher && assignedClass
              ? `Manage student roll numbers, attendance readiness, and portfolios for your assigned class.`
              : `Manage student roll numbers and scholar portfolios for Grade ${selectedClass}.`}
          </p>
        </div>

        <Button
          onClick={handleReorder}
          disabled={reorderMutation.isPending || students.length === 0}
          className="h-10 px-5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs flex items-center gap-2"
        >
          <RefreshCcw size={14} className={reorderMutation.isPending ? "animate-spin" : ""} />
          Sync Alpha Roll (A-Z)
        </Button>
      </div>

      {/* 📋 Main Registry Table Card */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        {/* Filters Header */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by student name, admission no, or roll..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-slate-50/50 h-9 border-slate-200 text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Class Filter */}
            {!isClassTeacher && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Class:</span>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-800 font-bold rounded-lg px-3 py-1.5 text-xs h-9 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                >
                  {classList.map((cls) => (
                    <option key={cls} value={cls}>Grade {cls}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Section Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Section:</span>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-800 font-bold rounded-lg px-3 py-1.5 text-xs h-9 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
              >
                {SECTIONS.map((sec) => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          {filteredStudents.length > 0 ? (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-3.5">
                    <div className="flex items-center gap-1.5">Scholar Profile <ArrowUpDown size={12} /></div>
                  </th>
                  <th className="px-6 py-3.5 text-center">Class / Section</th>
                  <th className="px-6 py-3.5 text-center">Institutional Roll</th>
                  <th className="px-6 py-3.5">Academic Progress</th>
                  <th className="px-6 py-3.5">Financial Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => {
                  const studentName = student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim() || "Scholar";

                  return (
                    <tr key={student.id} className="group hover:bg-slate-50/50 transition-colors">
                      {/* Profile Column */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <StudentAvatar image={student.image} name={studentName} />
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 leading-snug truncate block">{studentName}</span>
                            <span className="text-[11px] font-mono text-slate-400 font-semibold">{student.admissionNo || 'AD-2026'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Class / Section */}
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {student.class || 'N/A'}-{student.section || 'A'}
                        </span>
                      </td>

                      {/* Roll No Column (Editable) */}
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          {editingId === student.id.toString() ? (
                            <div className="flex items-center gap-2">
                              <input
                                autoFocus
                                type="text"
                                value={tempRollNo}
                                onChange={(e) => setTempRollNo(e.target.value)}
                                onBlur={() => handleSaveRoll(student.id.toString())}
                                onKeyDown={(e) => e.key === 'Enter' && handleSaveRoll(student.id.toString())}
                                className="w-14 h-8 px-2 bg-white border-2 border-indigo-600 rounded-lg text-xs font-black text-center outline-none shadow-md"
                              />
                            </div>
                          ) : (
                            <div
                              onClick={() => handleStartEdit(student)}
                              title="Click to edit roll number"
                              className={cn(
                                "w-14 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-all border font-mono text-xs font-black",
                                student.rollNo
                                  ? "bg-slate-100 text-slate-800 border-slate-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 shadow-2xs"
                                  : "bg-slate-50 text-slate-400 border-dashed border-slate-300 hover:bg-slate-100"
                              )}
                            >
                              {student.rollNo ? String(student.rollNo).padStart(2, '0') : "--"}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Homework Status */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 max-w-[140px]">
                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            <span>Homework</span>
                            <span className={student.pendingHomework > 0 ? "text-amber-600" : "text-emerald-600"}>
                              {student.pendingHomework > 0 ? `${student.pendingHomework} Due` : 'Clear'}
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                student.pendingHomework > 0 ? "bg-amber-400" : "bg-emerald-500"
                              )}
                              style={{ width: student.pendingHomework > 0 ? '50%' : '100%' }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Fee Status */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                          <div className="flex flex-col">
                            <span className="text-[10px] font-extrabold uppercase tracking-wide text-emerald-700">
                              PAID
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">No Dues</span>
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => viewStudentDetails(student.id.toString())}
                          className="h-8 px-3 bg-white hover:bg-indigo-50 hover:text-indigo-600 border-slate-200 font-semibold text-xs gap-1.5"
                        >
                          <Eye size={13} /> Profile
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="h-[300px] flex flex-col items-center justify-center space-y-3 p-6 text-center">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                <GraduationCap className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">No scholars enrolled in Grade {selectedClass}</p>
              <p className="text-xs text-slate-400 max-w-sm">
                There are currently no students registered for Grade {selectedClass} ({selectedSection}).
              </p>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={reassignConfirmOpen}
        onClose={() => setReassignConfirmOpen(false)}
        onConfirm={() => {
          reorderMutation.mutate();
          setReassignConfirmOpen(false);
        }}
        title="Reassign Alphabetical Roll Numbers?"
        description={`This will reassign clean sequential roll numbers (01, 02, 03...) alphabetically (A-Z) for Grade ${selectedClass} (${selectedSection}). Proceed?`}
        confirmText="Sync Roll Numbers"
        type="info"
      />
    </div>
  );
}
