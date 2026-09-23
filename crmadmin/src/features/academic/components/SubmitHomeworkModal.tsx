"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Plus, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
} from "@/components/dialogbox/dialog";

interface SubmitHomeworkModalProps {
   isOpen: boolean;
   onOpenChange: (open: boolean) => void;
   teacherClasses: string[];
   teacherAssignmentsMap: Record<string, string[]>;
   onSubmit: (data: any) => Promise<void> | void;
   isPending: boolean;
   user?: any;
   isTeacher?: boolean;
   isAdmin?: boolean;
}

export default function SubmitHomeworkModal({
   isOpen,
   onOpenChange,
   teacherClasses,
   teacherAssignmentsMap,
   onSubmit,
   isPending,
   user,
   isTeacher,
   isAdmin,
}: SubmitHomeworkModalProps) {
   const [mounted, setMounted] = useState(false);
   const [formData, setFormData] = useState({
      title: "",
      subject: "",
      class: "",
      section: "A",
      dueDate: "",
      content: "",
      priority: "MEDIUM",
      isUrgent: false
   });

   useEffect(() => {
      setMounted(true);
   }, []);

   // Initialize or reset form state when modal opens
   useEffect(() => {
      if (isOpen) {
         const defaultClass = user?.class || user?.staffProfile?.class || (teacherClasses.length === 1 ? teacherClasses[0] : "");
         const defaultSubject = user?.subject || user?.staffProfile?.subject || "";
         setFormData({
            title: "",
            subject: defaultSubject.toUpperCase(),
            class: defaultClass.toUpperCase(),
            section: user?.section || user?.staffProfile?.section || "A",
            dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // Default 2 days later
            content: "",
            priority: "MEDIUM",
            isUrgent: false
         });
      }
   }, [isOpen, user, teacherClasses]);

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit({
         ...formData,
         date: new Date().toISOString().split('T')[0]
      });
   };

   return (
      <Dialog open={isOpen} modal={true} onOpenChange={onOpenChange}>
         <DialogContent className="sm:max-w-lg p-0 overflow-hidden rounded-[24px] border border-slate-100 shadow-2xl bg-white">
            <DialogHeader className="bg-slate-900 text-white p-8">
               <DialogTitle className="text-xs font-black uppercase tracking-[4px]">Assign New Homework</DialogTitle>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Initialize academic task node for student curriculum.</p>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] ml-1">Academic Subject</label>
                     <Input
                        required
                        placeholder="E.G. MATHEMATICS"
                        value={formData.subject}
                        onChange={e => setFormData({ ...formData, subject: e.target.value.toUpperCase() })}
                        disabled={isTeacher && !!(user?.subject || user?.staffProfile?.subject)}
                        className="h-12 text-xs font-bold border-slate-150 bg-slate-50/50 focus:ring-indigo-600 rounded-xl uppercase"
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] ml-1">Deadline Date</label>
                     <Input required type="date" value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} className="h-12 text-xs font-bold border-slate-150 bg-slate-50/50 focus:ring-indigo-600 rounded-xl uppercase" />
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] ml-1">Task Nomenclature (Title)</label>
                  <Input required placeholder="E.G. CHAPTER 04: CALCULUS FUNDAMENTALS" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="h-12 text-xs font-bold border-slate-150 bg-slate-50/50 focus:ring-brand-indigo rounded-xl" />
               </div>

               <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] ml-1">Class Level</label>
                     <select required value={formData.class} onChange={e => setFormData({ ...formData, class: e.target.value })} className="w-full h-12 px-4 bg-slate-50/50 border border-slate-150 rounded-xl text-xs font-bold uppercase outline-none focus:ring-2 focus:ring-brand-indigo">
                        <option value="">Select</option>
                        {teacherClasses.map(c => <option key={c} value={c}>{c}</option>)}
                     </select>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] ml-1">Section</label>
                     <select
                        value={formData.section}
                        onChange={e => {
                           const sec = e.target.value;
                           const subjects = teacherAssignmentsMap[`${formData.class}-${sec}`] || [];
                           setFormData({
                              ...formData,
                              section: sec,
                              subject: subjects.length === 1 ? subjects[0] : formData.subject
                           });
                        }}
                        className="w-full h-12 px-4 bg-slate-50/50 border border-slate-150 rounded-xl text-xs font-bold uppercase outline-none focus:ring-2 focus:ring-brand-indigo"
                     >
                        <option value="A">Sec A</option>
                        <option value="B">Sec B</option>
                        <option value="C">Sec C</option>
                     </select>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] ml-1">Priority</label>
                     <select value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value, isUrgent: e.target.value === 'HIGH' })} className="w-full h-12 px-4 bg-slate-50/50 border border-slate-150 rounded-xl text-xs font-bold uppercase outline-none focus:ring-2 focus:ring-brand-indigo">
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High (Urgent)</option>
                     </select>
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] ml-1">Academic Guidelines</label>
                  <textarea placeholder="Describe the task expectations..." value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} className="w-full h-32 bg-slate-50/50 border border-slate-150 p-4 rounded-xl font-medium text-xs outline-none focus:ring-2 focus:ring-brand-indigo transition-all resize-none" />
               </div>

               <Button type="submit" disabled={isPending} className="w-full bg-linear-to-r from-brand-indigo to-violet-600 hover:from-brand-indigo/90 hover:to-violet-600/90 h-14 font-black uppercase text-[11px] tracking-[3px] rounded-xl shadow-xl shadow-indigo-100 mt-4 text-white">
                  {isPending ? <Loader2 className="animate-spin mr-3" /> : <Send size={18} className="mr-3" />} Authorize & Submit
               </Button>
            </form>
         </DialogContent>
      </Dialog>
   );
}
