"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Megaphone, Users, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogFooter,
} from "@/components/dialogbox/dialog";
import client from "@/lib/client";
import { useAuth } from "@/components/AbilityProvider";

// Pretty labels for target audience options
const TARGET_LABELS: Record<string, { label: string; desc: string; color: string }> = {
   ALL:          { label: "School Wide",        desc: "All teachers, staff & parents",    color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
   TEACHER:      { label: "All Teachers",        desc: "Every teacher in the institution", color: "bg-blue-50 text-blue-700 border-blue-200" },
   CLASS_TEACHER:{ label: "Class Teachers",      desc: "Only class teachers",              color: "bg-cyan-50 text-cyan-700 border-cyan-200" },
   PRINCIPAL:    { label: "Principal",           desc: "Principal's office only",          color: "bg-purple-50 text-purple-700 border-purple-200" },
   ACCOUNTANT:   { label: "Accounts Dept.",      desc: "Finance & accounts staff",         color: "bg-amber-50 text-amber-700 border-amber-200" },
   STAFF:        { label: "All Staff",           desc: "All school staff members",         color: "bg-slate-50 text-slate-700 border-slate-200" },
   PARENTS:      { label: "Parents / Guardians", desc: "Parents via mobile app",           color: "bg-green-50 text-green-700 border-green-200" },
};

interface CreateNotificationModalProps {
   isOpen: boolean;
   onOpenChange: (open: boolean) => void;
   editingId: string | null;
   initialData: {
      title: string;
      target: string;
      message: string;
      priority: boolean;
   } | null;
   onSubmit: (data: any) => void;
   isPending: boolean;
}

export default function CreateNotificationModal({
   isOpen,
   onOpenChange,
   editingId,
   initialData,
   onSubmit,
   isPending,
}: CreateNotificationModalProps) {
   const { user } = useAuth();
   const [formData, setFormData] = useState({
      title: '',
      targetRole: 'ALL',
      message: '',
      priority: false
   });
   const [targetOptions, setTargetOptions] = useState<string[]>(['ALL']);
   const [loadingOptions, setLoadingOptions] = useState(false);

   // Fetch role-based target options from backend
   useEffect(() => {
      if (!isOpen) return;
      setLoadingOptions(true);
      client.get('/website/notices')
         .then((res: any) => {
            if (res?.options) setTargetOptions(res.options);
         })
         .catch(() => {
            // Fallback defaults by role
            const role = user?.role?.toUpperCase();
            if (['SUPER_ADMIN', 'ADMIN'].includes(role)) {
               setTargetOptions(['ALL', 'TEACHER', 'PRINCIPAL', 'ACCOUNTANT', 'STAFF', 'PARENTS']);
            } else if (role === 'PRINCIPAL') {
               setTargetOptions(['ALL', 'TEACHER', 'STAFF', 'PARENTS']);
            } else if (role === 'ACCOUNTANT') {
               setTargetOptions(['TEACHER', 'PRINCIPAL', 'STAFF']);
            } else if (['TEACHER', 'CLASS_TEACHER'].includes(role)) {
               setTargetOptions(['PARENTS']);
            } else {
               setTargetOptions(['ALL']);
            }
         })
         .finally(() => setLoadingOptions(false));
   }, [isOpen, user?.role]);

   // Sync formData when initialData changes or modal opens
   useEffect(() => {
      if (isOpen) {
         if (initialData) {
            setFormData({
               title: initialData.title || '',
               targetRole: initialData.target || 'ALL',
               message: initialData.message || '',
               priority: initialData.priority || false,
            });
         } else {
            setFormData({
               title: '',
               targetRole: targetOptions[0] || 'ALL',
               message: '',
               priority: false
            });
         }
      }
   }, [isOpen, initialData]);

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit({
         title: formData.title,
         content: formData.message,
         message: formData.message,
         targetRole: formData.targetRole === 'ALL' ? null : formData.targetRole,
         target: formData.targetRole,
         priority: formData.priority,
         date: new Date().toISOString().split('T')[0],
      });
   };

   const selectedInfo = TARGET_LABELS[formData.targetRole] || TARGET_LABELS['ALL'];

   return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
         <DialogContent className="sm:max-w-lg p-0 overflow-hidden rounded-lgxl border-none shadow-2xl bg-white">
            <DialogHeader className="bg-slate-900 text-white p-8">
               <DialogTitle className="text-lg font-black uppercase tracking-[3px]  flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                     <Megaphone size={16} />
                  </div>
                  {editingId ? 'Modify Broadcast' : 'New Broadcast'}
               </DialogTitle>
               <p className="text-indigo-300 text-[10px] font-black uppercase tracking-[3px] mt-2">
                  {user?.role?.toUpperCase()} → Composing institutional notice
               </p>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">

               {/* Notice Subject */}
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notice Subject</label>
                  <Input
                     className="h-12 text-xs font-bold border-slate-100 bg-slate-50 focus:ring-2 focus:ring-indigo-100 rounded-lgl"
                     placeholder="E.G. SCHOOL CLOSURE / EXAM SCHEDULE..."
                     value={formData.title}
                     onChange={e => setFormData({ ...formData, title: e.target.value })}
                     required
                  />
               </div>

               {/* Target Audience — Role Based */}
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <Users size={12} /> Target Audience
                  </label>
                  {loadingOptions ? (
                     <div className="h-12 bg-slate-50 rounded-lgl animate-pulse" />
                  ) : (
                     <div className="grid grid-cols-2 gap-2">
                        {targetOptions.map(opt => {
                           const info = TARGET_LABELS[opt] || { label: opt, desc: '', color: 'bg-slate-50 text-slate-700 border-slate-200' };
                           const isSelected = formData.targetRole === opt;
                           return (
                              <button
                                 key={opt}
                                 type="button"
                                 onClick={() => setFormData({ ...formData, targetRole: opt })}
                                 className={`flex flex-col items-start p-3 rounded-xl border-2 transition-all text-left ${
                                    isSelected
                                       ? `${info.color} border-opacity-100 shadow-sm scale-[1.02]`
                                       : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-200'
                                 }`}
                              >
                                 <span className="text-[10px] font-black uppercase tracking-wider">{info.label}</span>
                                 <span className="text-[9px] font-medium mt-0.5 opacity-70">{info.desc}</span>
                              </button>
                           );
                        })}
                     </div>
                  )}
                  {/* Selected summary */}
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider border ${selectedInfo.color}`}>
                     <Users size={10} />
                     Sending to: {selectedInfo.label}
                  </div>
               </div>

               {/* Message Body */}
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Message Content</label>
                  <textarea
                     className="w-full h-28 bg-slate-50 border border-slate-100 p-4 rounded-lgl font-medium text-xs outline-none focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
                     placeholder="Write your notice details here..."
                     value={formData.message}
                     onChange={e => setFormData({ ...formData, message: e.target.value })}
                     required
                  />
               </div>

               {/* Priority Toggle */}
               <div className="flex items-center gap-3 p-3 bg-rose-50 rounded-xl border border-rose-100">
                  <input
                     type="checkbox"
                     id="urgent-notif"
                     className="h-4 w-4 rounded border-rose-300 text-rose-600 focus:ring-rose-500"
                     checked={formData.priority}
                     onChange={e => setFormData({ ...formData, priority: e.target.checked })}
                  />
                  <label htmlFor="urgent-notif" className="text-[10px] font-black text-rose-600 uppercase tracking-widest cursor-pointer">
                     🚨 Mark as High Priority (Critical Alert)
                  </label>
               </div>

               <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 font-black uppercase text-[11px] tracking-[3px] rounded-lgl shadow-lg shadow-indigo-100 transition-all active:scale-[0.98]"
               >
                  {isPending ? <Loader2 className="animate-spin mr-2" size={16} /> : <Megaphone size={16} className="mr-2" />}
                  {editingId ? 'Save Changes' : 'Send Notice'}
               </Button>
            </form>
         </DialogContent>
      </Dialog>
   );
}
