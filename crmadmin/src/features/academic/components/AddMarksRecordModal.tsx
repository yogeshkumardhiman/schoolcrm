"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Save, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import client from "@/lib/client";
import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
} from "@/components/dialogbox/dialog";

interface AddMarksRecordModalProps {
   isOpen: boolean;
   onOpenChange: (open: boolean) => void;
   editingMark: any | null;
   teacherAssignmentsMap: Record<string, string[]>;
   selectedClass: string;
   selectedSection: string;
   user: any;
   isClassTeacherForSelected: boolean;
   onSubmit: (data: { subject: string; examType: string; marks: string; total: string }) => void;
   isPending: boolean;
}

const examTypes = ["UNIT TEST 1", "UNIT TEST 2", "UNIT TEST 3", "HALF YEARLY", "FINAL"];

export default function AddMarksRecordModal({
   isOpen,
   onOpenChange,
   editingMark,
   teacherAssignmentsMap,
   selectedClass,
   selectedSection,
   user,
   isClassTeacherForSelected,
   onSubmit,
   isPending,
}: AddMarksRecordModalProps) {
   const [formData, setFormData] = useState({
      subject: "",
      examType: "UNIT TEST 1",
      marks: "",
      total: "100",
   });

   // Fetch Curriculum Subjects for the selected class
   const { data: rawSubjects = [] } = useQuery<any[]>({
      queryKey: ['curriculum-subjects', selectedClass],
      enabled: isOpen && !!selectedClass && selectedClass !== 'All Classes',
      queryFn: async () => {
         try {
            const res = await client.get(`/academic/subjects?class=${encodeURIComponent(selectedClass)}`);
            return Array.isArray(res) ? res : [];
         } catch {
            return [];
         }
      },
   });

   const availableSubjects = React.useMemo(() => {
      const curriculumNames = rawSubjects
         .map((s: any) => s.name?.trim().toUpperCase())
         .filter(Boolean);
      const key = `${selectedClass}-${selectedSection || "A"}`;
      const assigned = Array.from(
         new Set((teacherAssignmentsMap[key] || []).map((s: string) => s.trim().toUpperCase()).filter(Boolean))
      );

      const isTeacherRole = user?.role === "TEACHER" || user?.role === "CLASS_TEACHER";
      if (isTeacherRole && !isClassTeacherForSelected) {
         if (assigned.length > 0) return assigned;
         const userSubject = user?.subject?.trim().toUpperCase();
         return userSubject ? [userSubject] : ["MATHEMATICS"];
      }

      const fallbackDefaults = [
         "MATHEMATICS",
         "ENGLISH",
         "HINDI",
         "SCIENCE",
         "SOCIAL SCIENCE",
         "COMPUTER",
         "GENERAL KNOWLEDGE",
      ];
      const combined = Array.from(new Set([...assigned, ...curriculumNames, ...fallbackDefaults]));
      return combined;
   }, [rawSubjects, teacherAssignmentsMap, selectedClass, selectedSection, user, isClassTeacherForSelected]);

   // Initialize or reset form state when modal opens or editingMark changes
   useEffect(() => {
      if (isOpen) {
         if (editingMark) {
            setFormData({
               subject: editingMark.subject || "",
               examType: editingMark.examType || "UNIT TEST 1",
               marks: String(editingMark.marks || ""),
               total: String(editingMark.total || "100"),
            });
         } else {
            const defaultSubject = availableSubjects.length > 0 ? availableSubjects[0] : "MATHEMATICS";
            setFormData({
               subject: defaultSubject,
               examType: "UNIT TEST 1",
               marks: "",
               total: "100",
            });
         }
      }
   }, [isOpen, editingMark, availableSubjects]);

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const obtainedVal = parseFloat(formData.marks);
      const totalVal = parseFloat(formData.total);

      if (isNaN(obtainedVal) || isNaN(totalVal)) {
         toast.error("Please enter valid scores.");
         return;
      }
      if (obtainedVal < 0) {
         toast.error("Obtained marks cannot be negative.");
         return;
      }
      if (totalVal <= 0) {
         toast.error("Total marks must be greater than zero.");
         return;
      }
      if (obtainedVal > totalVal) {
         toast.error("Obtained marks cannot exceed total marks.");
         return;
      }
      onSubmit(formData);
   };

   return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
         <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl border border-slate-100 shadow-2xl bg-white">
            <DialogHeader className="bg-slate-900 text-white p-6">
               <DialogTitle className="text-sm font-black uppercase tracking-wider font-heading">
                  {editingMark ? "Update Examination Score" : "Record Scholar Score"}
               </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
               <div className="space-y-4">
                  {/* Subject Selector / Pre-filled Input */}
                  <div className="space-y-1.5">
                     <div className="flex items-center justify-between">
                        <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                           Academic Subject
                        </Label>
                        {user?.role === "TEACHER" && !isClassTeacherForSelected && (
                           <span className="text-[9px] font-bold text-indigo-600 uppercase">Assigned Faculty Subject</span>
                        )}
                        {isClassTeacherForSelected && (
                           <span className="text-[9px] font-bold text-emerald-600 uppercase">Class Incharge (All Subjects)</span>
                        )}
                     </div>

                     {availableSubjects.length === 1 && !isClassTeacherForSelected && user?.role === "TEACHER" ? (
                        <div className="h-10 px-3.5 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between shadow-2xs">
                           <span className="text-xs font-black text-indigo-950 uppercase">{formData.subject}</span>
                           <span className="text-[9px] font-black uppercase tracking-wider bg-indigo-600 text-white px-2 py-0.5 rounded-md">
                              Your Subject
                           </span>
                        </div>
                     ) : (
                        <select
                           className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold uppercase outline-none focus:ring-2 focus:ring-indigo-500"
                           value={formData.subject}
                           onChange={(e) => setFormData({ ...formData, subject: e.target.value.toUpperCase() })}
                           required
                        >
                           {availableSubjects.map((s, idx) => (
                              <option key={`${s}-${idx}`} value={s}>
                                 {s}
                              </option>
                           ))}
                        </select>
                     )}
                  </div>

                  {/* Exam Type Selector */}
                  <div className="space-y-1.5">
                     <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Examination Term / Type
                     </Label>
                     <select
                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold uppercase outline-none focus:ring-2 focus:ring-indigo-500"
                        value={formData.examType}
                        onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
                     >
                        {examTypes.map((type) => (
                           <option key={type} value={type}>
                              {type}
                           </option>
                        ))}
                     </select>
                  </div>

                  {/* Marks Obtained and Total */}
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                        <Label className="text-[10px] font-black text-slate-700 uppercase tracking-wider flex items-center justify-between">
                           <span>Marks Obtained</span>
                           <span className="text-[9px] font-bold text-indigo-600">(Kitne Aaye)</span>
                        </Label>
                        <Input
                           required
                           type="number"
                           min={0}
                           placeholder="e.g. 85"
                           className="h-10 font-black text-center border-slate-200 bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500"
                           value={formData.marks}
                           onChange={(e) => setFormData({ ...formData, marks: e.target.value })}
                        />
                     </div>
                     <div className="space-y-1.5">
                        <Label className="text-[10px] font-black text-slate-700 uppercase tracking-wider flex items-center justify-between">
                           <span>Maximum Marks</span>
                           <span className="text-[9px] font-bold text-slate-400">(Kitne Me Se)</span>
                        </Label>
                        <Input
                           required
                           type="number"
                           min={1}
                           placeholder="100"
                           className="h-10 font-black text-center border-slate-200 bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500"
                           value={formData.total}
                           onChange={(e) => setFormData({ ...formData, total: e.target.value })}
                        />
                     </div>
                  </div>
               </div>

               <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white h-11 font-bold uppercase text-xs tracking-wider rounded-xl shadow-xs transition-all mt-2 gap-2"
               >
                  {isPending ? (
                     <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Recording Score...
                     </>
                  ) : (
                     <>
                        <Save className="h-4 w-4" /> Save Score Record
                     </>
                  )}
               </Button>
            </form>
         </DialogContent>
      </Dialog>
   );
}
