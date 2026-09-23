"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
   Edit3,
   Plus,
   Loader2,
   Search,
   BookOpen,
   PieChart,
   Save,
   Trophy,
   Trash2,
   XCircle,
   Printer,
   ChevronDown,
   Sparkles,
   Award,
   CheckCircle2,
   AlertCircle,
   TrendingUp,
   GraduationCap,
   FileText,
   ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import client from "@/lib/client";
import { AddMarksRecordModal } from "@/features/academic";
import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
} from "@/components/dialogbox/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/AbilityProvider";

const DEFAULT_CLASSES = [
   "9TH", "NURSERY", "LKG", "UKG",
   "1ST", "2ND", "3RD", "4TH", "5TH",
   "6TH", "7TH", "8TH", "10TH", "11TH", "12TH"
];
const examTypes = ["UNIT TEST 1", "UNIT TEST 2", "UNIT TEST 3", "HALF YEARLY", "FINAL"];

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
         <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 border border-indigo-200/50 flex items-center justify-center shrink-0 shadow-xs text-white font-black text-xs uppercase">
            {initials}
         </div>
      );
   }

   return (
      <div className="h-10 w-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 shadow-xs">
         <img
            src={resolvedUrl}
            alt={name}
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
         />
      </div>
   );
}

export default function MarksPage() {
   return (
      <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-slate-400" /></div>}>
         <MarksPageContent />
      </Suspense>
   );
}

function MarksPageContent() {
   const queryClient = useQueryClient();
   const { user, loading: authLoading } = useAuth();
   const userRole = user?.role || "";

   const searchParams = useSearchParams();
   const queryClass = searchParams.get('class');
   const querySection = searchParams.get('section');

   const [mounted, setMounted] = useState(false);
   const [selectedStudent, setSelectedStudent] = useState<any>(null);
   const [selectedClass, setSelectedClass] = useState(queryClass || "9TH");
   const [selectedSection, setSelectedSection] = useState(querySection || "A");
   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
   const [deleteModalOpen, setDeleteModalOpen] = useState(false);
   const [markToDelete, setMarkToDelete] = useState<any>(null);
   const [searchQuery, setSearchQuery] = useState("");
   const [editingMark, setEditingMark] = useState<any | null>(null);

   useEffect(() => {
      setMounted(true);
   }, []);

   const isTeacherRole = user?.role === 'TEACHER' || user?.role === 'CLASS_TEACHER';

   // Query: Teacher's Assignments
   const { data: assignmentsList = [] } = useQuery({
      queryKey: ['teacher-assignments-marks'],
      enabled: !!user && isTeacherRole,
      queryFn: () => client.get('/staff/timetable')
   });

   const normalizeClass = (c: string) => {
      if (!c) return "";
      const val = c.toString().toUpperCase().trim();
      const map: Record<string, string> = { '1': '1ST', '2': '2ND', '3': '3RD', '4': '4TH', '5': '5TH', '6': '6TH', '7': '7TH', '8': '8TH', '9': '9TH', '10': '10TH', '11': '11TH', '12': '12TH' };
      return map[val] || val;
   };

   // Map assignments for quick lookup: { "CLASS-SECTION": ["SUBJECT1", "SUBJECT2"] }
   const teacherAssignmentsMap = React.useMemo(() => {
      const map: Record<string, string[]> = {};
      assignmentsList.forEach((a: any) => {
         const normalizedClass = normalizeClass(a.class);
         const key = `${normalizedClass}-${(a.section || 'A').toUpperCase()}`;
         if (!map[key]) map[key] = [];
         const subject = a.subject || 'GENERAL';
         if (!map[key].includes(subject)) map[key].push(subject);
      });
      return map;
   }, [assignmentsList]);

   // Derived: List of classes and sections teacher actually teaches
   const teacherAssignments = React.useMemo(() => {
      if (!user || !isTeacherRole) return { classes: DEFAULT_CLASSES, mapping: {} as Record<string, Set<string>> };
      const mapping: Record<string, Set<string>> = {};

      if (user.class) {
         const nc = normalizeClass(user.class);
         if (!mapping[nc]) mapping[nc] = new Set();
         mapping[nc].add((user.section || 'A').toUpperCase());
      }

      assignmentsList.forEach((a: any) => {
         if (a.class) {
            const nc = normalizeClass(a.class);
            if (!mapping[nc]) mapping[nc] = new Set();
            mapping[nc].add((a.section || 'A').toUpperCase());
         }
      });

      const classes = Object.keys(mapping).length > 0 ? Object.keys(mapping).sort() : DEFAULT_CLASSES;
      return { classes, mapping };
   }, [user, isTeacherRole, assignmentsList]);

   // Sync role-based initial state
   useEffect(() => {
      if (!authLoading && user && isTeacherRole) {
         const firstAvailable = teacherAssignments.classes.length > 0 ? teacherAssignments.classes[0] : "9TH";
         const initialClass = queryClass || user.class || firstAvailable;
         setSelectedClass(initialClass);
         setSelectedSection(querySection || user.section || "A");
      }
   }, [user, authLoading, teacherAssignments, queryClass, querySection]);

   // Query: Students Registry
   const { data: students = [], isLoading: studentsLoading } = useQuery<any[]>({
      queryKey: ['students-marks', selectedClass, selectedSection, userRole],
      enabled: !!user && !authLoading && !!selectedClass,
      queryFn: async () => {
         const res: any = await client.get(`/academic/class-roster?class=${encodeURIComponent(selectedClass)}&section=${encodeURIComponent(selectedSection)}`);
         const list: any[] = Array.isArray(res) ? res : res?.students || res?.data || [];
         return list.sort((a: any, b: any) => (a.rollNo || '').localeCompare(b.rollNo || '') || (a.name || '').localeCompare(b.name || ''));
      }
   });

   // Auto-select first student if none selected
   useEffect(() => {
      if (students.length > 0 && !selectedStudent) {
         setSelectedStudent(students[0]);
      } else if (students.length > 0 && selectedStudent) {
         const exists = students.find(s => (s.id || s._id) === (selectedStudent.id || selectedStudent._id));
         if (!exists) setSelectedStudent(students[0]);
      }
   }, [students, selectedStudent]);

   // Permission Helpers
   const isClassTeacherForSelected = user?.role === 'TEACHER' && user.class === selectedClass && user.section === selectedSection;
   const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'PRINCIPAL', 'MANAGEMENT'].includes(user?.role?.toUpperCase());

   const canManageMark = (markSubject?: string) => {
      if (isAdmin) return true;
      if (user?.role?.toUpperCase() !== 'TEACHER') return false;
      if (isClassTeacherForSelected) return true;

      const key = `${normalizeClass(selectedClass)}-${(selectedSection || 'A').toUpperCase()}`;
      const teacherSubjects = teacherAssignmentsMap[key] || [];

      if (markSubject) {
         return teacherSubjects.some(s => s.toUpperCase() === markSubject.toUpperCase());
      } else {
         return teacherSubjects.length > 0;
      }
   };

   // Query: Student Marks
   const { data: marks = [], isLoading: marksLoading } = useQuery<any[]>({
      queryKey: ['student-marks', selectedStudent?.id || selectedStudent?._id],
      enabled: !!selectedStudent,
      queryFn: async () => {
         const studentId = selectedStudent.id || selectedStudent._id;
         const data: any = await client.get(`/academic/results/student/${studentId}`);
         return Array.isArray(data) ? data : [];
      }
   });

   // Mutations
   const resultMutation = useMutation({
      mutationFn: (payload: any) => {
         if (editingMark) {
            const markId = editingMark.id || editingMark._id;
            return client.put(`/academic/results/${markId}`, payload);
         }
         return client.post('/academic/results', payload);
      },
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['student-marks', selectedStudent?.id || selectedStudent?._id] });
         toast.success(editingMark ? "Score record updated" : "Score recorded successfully");
         setIsAddModalOpen(false);
         setEditingMark(null);
      },
      onError: () => toast.error("Failed to save score")
   });

   const deleteMutation = useMutation({
      mutationFn: (mark: any) => {
         const id = mark.id || mark._id;
         return client.delete(`/academic/results/${id}`);
      },
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['student-marks', selectedStudent?.id || selectedStudent?._id] });
         toast.success("Score record redacted");
         setDeleteModalOpen(false);
         setMarkToDelete(null);
      },
      onError: () => toast.error("Failed to delete score record")
   });

   const verifyMutation = useMutation({
      mutationFn: (id: string) => client.put(`/academic/results/${id}`, { verified: true }),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['student-marks', selectedStudent?.id || selectedStudent?._id] });
         toast.success("Result verified and published to scholar portal!");
      },
      onError: (err: any) => {
         toast.error(err.message || "Failed to verify result");
      }
   });

   const handleAddMarks = (modalFormData: any) => {
      if (!selectedStudent) return;

      const finalSubject = modalFormData.subject;
      if (!finalSubject) {
         toast.error("Subject specification required");
         return;
      }

      const payload = {
         ...modalFormData,
         subject: finalSubject.toUpperCase(),
         studentId: selectedStudent.id || selectedStudent._id,
         marks: parseInt(modalFormData.marks, 10),
         total: parseInt(modalFormData.total, 10) || 100,
         class: selectedStudent.class,
         section: selectedStudent.section
      };
      resultMutation.mutate(payload);
   };

   const confirmDeleteMark = () => {
      if (!markToDelete || !selectedStudent) return;
      deleteMutation.mutate(markToDelete);
   };

   const openEditModal = (mark: any) => {
      setEditingMark(mark);
      setIsAddModalOpen(true);
   };

   const filteredStudents = students.filter(s => {
      return (
         String(s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
         String(s.rollNo || '').includes(searchQuery) ||
         String(s.admissionNo || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
   });

   // Marks Metrics
   const totalMarksObtained = marks.reduce((sum, m) => sum + (Number(m.marks) || 0), 0);
   const maxPossibleMarks = marks.reduce((sum, m) => sum + (Number(m.total) || 100), 0);
   const overallPct = maxPossibleMarks > 0 ? Math.round((totalMarksObtained / maxPossibleMarks) * 100) : 0;

   return (
      <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50/50 min-h-screen font-sans" suppressHydrationWarning>
         {/* 🏙️ PAGE EXECUTIVE HEADER */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="space-y-1">
               <div className="flex items-center gap-2">
                  <span className="bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase flex items-center gap-1 border border-indigo-150">
                     <GraduationCap className="h-3 w-3" /> Examination Governance
                  </span>
                  {mounted && user?.role === 'TEACHER' && (
                     <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        {isClassTeacherForSelected ? `Class Incharge (${selectedClass}-${selectedSection})` : `Subject Faculty (${user?.subject || 'Curriculum'})`}
                     </span>
                  )}
               </div>
               <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase font-heading">
                  Marks & <span className="text-indigo-600">Grade Ledger</span>
               </h2>
               <p className="text-xs text-slate-500 font-semibold">
                  Record examination scorecards, verify academic grades, and generate term report cards.
               </p>
            </div>

            {selectedClass && selectedSection && (
               <Link href={`/academic/report-card/bulk/${selectedClass}/${selectedSection}`}>
                  <Button
                     variant="outline"
                     className="h-10 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold uppercase text-xs tracking-wider hover:bg-slate-50 shadow-xs transition-all px-4 cursor-pointer gap-2"
                  >
                     <Printer className="h-4 w-4 text-indigo-600" />
                     Bulk Print Report Cards
                  </Button>
               </Link>
            )}
         </div>

         {/* 🏛️ Main Workspace Grid */}
         <div className="grid grid-cols-12 gap-6 h-[calc(100vh-210px)]">
            {/* 📝 Left Panel: Scholar Registry (4 cols) */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 h-full">
               <Card className="border border-slate-200 shadow-xs flex flex-col h-full overflow-hidden rounded-xl bg-white">
                  <CardHeader className="p-4 border-b border-slate-100 bg-white space-y-3">
                     {/* Class & Section Selectors */}
                     <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                           <select
                              suppressHydrationWarning
                              value={selectedClass}
                              onChange={(e) => {
                                 setSelectedClass(e.target.value);
                                 if (user?.role === 'TEACHER' && teacherAssignments.mapping[e.target.value]) {
                                    const availableSections = Array.from(teacherAssignments.mapping[e.target.value]);
                                    if (!availableSections.includes(selectedSection)) {
                                       setSelectedSection(availableSections[0]);
                                    }
                                 }
                              }}
                              className="w-full h-9 px-3 pr-8 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 uppercase appearance-none outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                           >
                              {mounted ? (
                                 teacherAssignments.classes.map(c => <option key={c} value={c}>Grade {c}</option>)
                              ) : (
                                 <option value="9TH">Grade 9TH</option>
                              )}
                           </select>
                           <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                        </div>

                        <div className="relative w-24">
                           <select
                              suppressHydrationWarning
                              value={selectedSection}
                              onChange={(e) => setSelectedSection(e.target.value)}
                              className="w-full h-9 px-3 pr-8 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 uppercase appearance-none outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer text-center"
                           >
                              {mounted && user?.role === 'TEACHER' ? (
                                 teacherAssignments.mapping[selectedClass] ? (
                                    Array.from(teacherAssignments.mapping[selectedClass] as Set<string>).sort().map(s => <option key={s} value={s}>Sec {s}</option>)
                                 ) : (
                                    <option value="A">Sec A</option>
                                 )
                              ) : (
                                 ['A', 'B', 'C', 'D'].map(s => <option key={s} value={s}>Sec {s}</option>)
                              )}
                           </select>
                           <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                        </div>
                     </div>

                     {/* Search Input */}
                     <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                           placeholder="Search scholar by name or roll..."
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                           className="pl-9 h-9 border-slate-200 bg-slate-50/50 rounded-lg font-semibold text-xs focus:bg-white"
                        />
                     </div>
                  </CardHeader>

                  <CardContent className="p-2 overflow-y-auto flex-1 divide-y divide-slate-50">
                     {studentsLoading ? (
                        <div className="space-y-2 p-2">
                           {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
                        </div>
                     ) : filteredStudents.length > 0 ? (
                        filteredStudents.map((s, idx) => {
                           const isSelected = (selectedStudent?.id === (s.id || s._id) || selectedStudent?._id === (s.id || s._id));
                           const studentName = s.name || `${s.firstName || ''} ${s.lastName || ''}`.trim();
                           const rollDisplay = s.rollNo ? String(s.rollNo).padStart(2, '0') : String(idx + 1).padStart(2, '0');

                           return (
                              <button
                                 key={s.id || s._id}
                                 onClick={() => setSelectedStudent(s)}
                                 className={cn(
                                    "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group my-0.5",
                                    isSelected
                                       ? "bg-slate-900 text-white shadow-sm"
                                       : "hover:bg-slate-100/70 text-slate-700"
                                 )}
                              >
                                 <StudentAvatar image={s.image} name={studentName} />
                                 <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold truncate leading-tight">{studentName}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                       <span className={cn(
                                          "text-[10px] font-mono font-bold uppercase",
                                          isSelected ? "text-slate-300" : "text-slate-400"
                                       )}>
                                          Roll: {rollDisplay}
                                       </span>
                                       <span className={cn(
                                          "text-[10px] px-1.5 py-0.2 rounded font-bold uppercase",
                                          isSelected ? "bg-white/10 text-white" : "bg-slate-100 text-slate-600"
                                       )}>
                                          {s.class}-{s.section || 'A'}
                                       </span>
                                    </div>
                                 </div>
                              </button>
                           );
                        })
                     ) : (
                        <div className="h-48 flex flex-col items-center justify-center text-center p-4 text-slate-400">
                           <GraduationCap className="h-8 w-8 mb-2 text-slate-300" />
                           <p className="text-xs font-bold">No scholars found</p>
                           <p className="text-[10px] text-slate-400 mt-0.5">Try selecting another class or section</p>
                        </div>
                     )}
                  </CardContent>
               </Card>
            </div>

            {/* 📊 Right Panel: Marks Entry & Listing (8 cols) */}
            <div className="col-span-12 lg:col-span-8 h-full">
               {selectedStudent ? (
                  <Card className="shadow-xs border-slate-200 h-full flex flex-col overflow-hidden bg-white rounded-xl">
                     {/* Scholar Identity Banner */}
                     <CardHeader className="p-4 border-b border-slate-100 bg-white">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                           <div className="flex items-center gap-3.5">
                              <StudentAvatar image={selectedStudent.image} name={selectedStudent.name} />
                              <div>
                                 <div className="flex items-center gap-2">
                                    <h3 className="text-base font-black text-slate-900 leading-none uppercase font-heading">
                                       {selectedStudent.name}
                                    </h3>
                                    <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 text-[10px] font-black uppercase">
                                       Grade {selectedStudent.class}-{selectedStudent.section || 'A'}
                                    </Badge>
                                 </div>
                                 <p className="text-xs text-slate-400 font-semibold mt-1 font-mono">
                                    Scholar ID: {selectedStudent.admissionNo || 'AD-2026'} • Roll: {selectedStudent.rollNo || '--'}
                                 </p>
                              </div>
                           </div>

                           <div className="flex items-center gap-2">
                              <Link href={`/academic/report-card/${selectedStudent.id || selectedStudent._id}`}>
                                 <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-9 px-3 border-slate-200 text-xs font-bold gap-1.5"
                                 >
                                    <ExternalLink size={13} /> Report Card
                                 </Button>
                              </Link>

                              <Button
                                 size="sm"
                                 disabled={!canManageMark()}
                                 onClick={() => {
                                    setEditingMark(null);
                                    setIsAddModalOpen(true);
                                 }}
                                 className="bg-slate-900 hover:bg-slate-800 text-white h-9 px-4 font-bold text-xs uppercase gap-1.5 rounded-lg shadow-xs disabled:opacity-40"
                              >
                                 <Plus className="h-4 w-4" /> Add Score
                              </Button>
                           </div>

                           <AddMarksRecordModal
                              isOpen={isAddModalOpen}
                              onOpenChange={setIsAddModalOpen}
                              editingMark={editingMark}
                              teacherAssignmentsMap={teacherAssignmentsMap}
                              selectedClass={selectedClass}
                              selectedSection={selectedSection}
                              user={user}
                              isClassTeacherForSelected={isClassTeacherForSelected}
                              onSubmit={handleAddMarks}
                              isPending={resultMutation.isPending}
                           />
                        </div>

                        {/* KPI Performance Metrics */}
                        {marks.length > 0 && (
                           <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100">
                              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Score</p>
                                 <p className="text-lg font-black text-slate-900 mt-0.5">{totalMarksObtained} <span className="text-xs font-semibold text-slate-400">/ {maxPossibleMarks}</span></p>
                              </div>
                              <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100">
                                 <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Cumulative %</p>
                                 <p className="text-lg font-black text-indigo-700 mt-0.5">{overallPct}%</p>
                              </div>
                              <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100">
                                 <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Standing</p>
                                 <p className="text-lg font-black text-emerald-700 mt-0.5">
                                    {overallPct >= 90 ? 'A+ Distinction' : overallPct >= 75 ? 'First Division' : overallPct >= 60 ? 'Second Division' : 'Passed'}
                                 </p>
                              </div>
                           </div>
                        )}
                     </CardHeader>

                     {/* Scorecard Table View */}
                     <CardContent className="p-6 overflow-y-auto flex-1">
                        {marksLoading ? (
                           <div className="space-y-4">
                              {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
                           </div>
                        ) : marks.length === 0 ? (
                           <div className="h-64 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-2xl text-slate-400 p-6 text-center">
                              <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-400 mb-3">
                                 <PieChart size={28} />
                              </div>
                              <p className="text-sm font-bold text-slate-700">No score records logged yet</p>
                              <p className="text-xs text-slate-400 max-w-xs mt-1">
                                 Click &ldquo;Add Score&rdquo; above to record scores for Unit Tests or Final Examinations.
                              </p>
                           </div>
                        ) : (
                           <div className="space-y-6">
                              {examTypes.map(type => {
                                 const examMarks = marks.filter(m => m.examType === type);
                                 if (examMarks.length === 0) return null;

                                 return (
                                    <div key={type} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                                       <div className="bg-slate-50/80 p-3.5 border-b border-slate-200 flex items-center justify-between">
                                          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                                             <BookOpen size={14} className="text-indigo-600" /> {type}
                                          </h4>
                                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                                             {examMarks.length} Subject{examMarks.length > 1 ? 's' : ''} Logged
                                          </span>
                                       </div>
                                       <div className="overflow-x-auto">
                                          <table className="w-full text-sm">
                                             <thead>
                                                <tr className="bg-slate-50/40 border-b border-slate-100 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                                                   <th className="py-3 px-5 text-left">Subject</th>
                                                   <th className="py-3 px-5 text-center">Score</th>
                                                   <th className="py-3 px-5 text-center">Status</th>
                                                   <th className="py-3 px-5 text-right">Actions</th>
                                                </tr>
                                             </thead>
                                             <tbody className="divide-y divide-slate-100">
                                                {examMarks.map((m, i) => {
                                                   const isMarkVerified = !!m.isVerified;
                                                   const userCanVerify = isAdmin || isClassTeacherForSelected;
                                                   const scorePct = m.total > 0 ? Math.round((m.marks / m.total) * 100) : 0;

                                                   return (
                                                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                                         <td className="py-3.5 px-5 font-bold text-slate-800 text-xs">
                                                            {m.subject}
                                                         </td>
                                                         <td className="py-3.5 px-5 text-center">
                                                            <div className="inline-flex items-center gap-2">
                                                               <span className="font-extrabold text-slate-900 text-sm">{m.marks}</span>
                                                               <span className="text-slate-400 text-xs font-medium">/ {m.total}</span>
                                                               <Badge className={cn(
                                                                  "text-[9px] font-bold px-1.5 py-0.2 rounded-md",
                                                                  scorePct >= 75 ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                                                     scorePct >= 40 ? "bg-blue-50 text-blue-700 border-blue-100" :
                                                                        "bg-rose-50 text-rose-700 border-rose-100"
                                                               )}>
                                                                  {scorePct}%
                                                               </Badge>
                                                            </div>
                                                         </td>
                                                         <td className="py-3.5 px-5 text-center">
                                                            {isMarkVerified ? (
                                                               <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full">
                                                                  <CheckCircle2 size={11} className="mr-1" /> Verified
                                                               </Badge>
                                                            ) : (
                                                               <Badge className="bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full">
                                                                  Pending
                                                               </Badge>
                                                            )}
                                                         </td>
                                                         <td className="py-3.5 px-5 text-right">
                                                            <div className="flex justify-end items-center gap-1.5">
                                                               {!isMarkVerified && userCanVerify && (
                                                                  <Button
                                                                     size="sm"
                                                                     onClick={() => verifyMutation.mutate(m.id || m._id)}
                                                                     className="h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase text-[9px] rounded-md shadow-xs"
                                                                     disabled={verifyMutation.isPending}
                                                                  >
                                                                     Verify
                                                                  </Button>
                                                               )}
                                                               {canManageMark(m.subject) && (
                                                                  <>
                                                                     <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => openEditModal(m)}
                                                                        className="h-7 w-7 p-0 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md"
                                                                     >
                                                                        <Edit3 size={13} />
                                                                     </Button>
                                                                     <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => { setMarkToDelete(m); setDeleteModalOpen(true); }}
                                                                        className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md"
                                                                     >
                                                                        <Trash2 size={13} />
                                                                     </Button>
                                                                  </>
                                                               )}
                                                            </div>
                                                         </td>
                                                      </tr>
                                                   );
                                                })}
                                             </tbody>
                                          </table>
                                       </div>
                                    </div>
                                 );
                              })}
                           </div>
                        )}
                     </CardContent>
                  </Card>
               ) : (
                  <div className="h-full flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-xl bg-white text-slate-400 p-8 text-center">
                     <div className="h-16 w-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 mb-3">
                        <GraduationCap size={32} />
                     </div>
                     <p className="text-sm font-bold text-slate-700">Select a scholar from the roster</p>
                     <p className="text-xs text-slate-400 max-w-sm mt-1">
                        Choose any student from the left panel to inspect their academic examination scorecards and register new marks.
                     </p>
                  </div>
               )}
            </div>
         </div>

         {/* 🗑️ Delete Alert Dialog */}
         <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
            <AlertDialogContent className="max-w-sm rounded-2xl border-none shadow-2xl bg-white p-6">
               <AlertDialogHeader className="space-y-3">
                  <div className="h-12 w-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
                     <XCircle size={24} />
                  </div>
                  <AlertDialogTitle className="text-center font-black uppercase tracking-tight text-slate-900 font-heading">
                     Delete Score Record?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-center text-xs text-slate-400">
                     This will permanently remove this score record from institutional archives.
                  </AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter className="flex gap-2 mt-4">
                  <AlertDialogCancel className="h-10 rounded-xl text-xs font-bold uppercase border-slate-200 flex-1">
                     Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                     onClick={confirmDeleteMark}
                     className="h-10 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase border-none flex-1"
                  >
                     Delete
                  </AlertDialogAction>
               </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>
      </div>
   );
}
