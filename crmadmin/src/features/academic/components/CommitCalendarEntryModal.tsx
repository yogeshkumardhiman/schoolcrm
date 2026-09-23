"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
} from "@/components/dialogbox/dialog";

interface CommitCalendarEntryModalProps {
   isOpen: boolean;
   onOpenChange: (open: boolean) => void;
   editingEvent: any | null;
   selectedDateStr: string;
   onSubmit: (formData: any) => void;
   isPending: boolean;
}

export default function CommitCalendarEntryModal({
   isOpen,
   onOpenChange,
   editingEvent,
   selectedDateStr,
   onSubmit,
   isPending,
}: CommitCalendarEntryModalProps) {
   const [formData, setFormData] = useState({
      title: "",
      date: "",
      endDate: "",
      time: "ALL DAY",
      location: "Main Campus",
      participants: "All Classes",
      color: "#4F46E5",
      icon: "calendar",
      description: "",
      type: "EVENT" as "EVENT" | "HOLIDAY" | "GOVT_HOLIDAY",
   });

   // Initialize or reset form state when modal opens or editingEvent changes
   useEffect(() => {
      if (isOpen) {
         if (editingEvent) {
            setFormData({
               title: editingEvent.title || "",
               date: editingEvent.date || selectedDateStr,
               endDate: editingEvent.endDate || editingEvent.date || selectedDateStr,
               time: editingEvent.time || "ALL DAY",
               location: editingEvent.location || "Main Campus",
               participants: editingEvent.participants || "All Classes",
               color: editingEvent.color || "#4F46E5",
               icon: editingEvent.icon || "calendar",
               description: editingEvent.description || "",
               type: editingEvent.type || "EVENT",
            });
         } else {
            setFormData({
               title: "",
               date: selectedDateStr,
               endDate: selectedDateStr,
               time: "ALL DAY",
               location: "Main Campus",
               participants: "All Classes",
               color: "#4F46E5",
               icon: "calendar",
               description: "",
               type: "EVENT",
            });
         }
      }
   }, [isOpen, editingEvent, selectedDateStr]);

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
   };

   return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
         <DialogContent className="sm:max-w-lg p-0 overflow-hidden rounded-2xl border border-slate-100 shadow-2xl bg-white flex flex-col max-h-[90vh]">
            <DialogHeader className="bg-slate-900 text-white p-6">
               <DialogTitle className="text-sm font-black uppercase tracking-[3px]  leading-none">
                  {editingEvent ? "Modify Calendar Entry" : "Commit Calendar Entry"}
               </DialogTitle>
               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[2px] mt-1.5">
                  Academic Schedule Configuration Panel
               </p>
            </DialogHeader>

            <form
               onSubmit={handleSubmit}
               className="p-6 space-y-5 overflow-y-auto no-scrollbar flex-1"
            >
               <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-0.5">
                     Entry Classification
                  </label>
                  <select
                     className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase outline-none focus:ring-2 focus:ring-slate-950 transition-all cursor-pointer"
                     value={formData.type}
                     onChange={(e) =>
                        setFormData({
                           ...formData,
                           type: e.target.value as "EVENT" | "HOLIDAY" | "GOVT_HOLIDAY",
                        })
                     }
                  >
                     <option value="EVENT">Academic Event</option>
                     <option value="HOLIDAY">Institutional Break / Holiday</option>
                     <option value="GOVT_HOLIDAY">Government Closure / Holiday</option>
                  </select>
               </div>

               <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-0.5">
                     Entry Subject / Title
                  </label>
                  <Input
                     className="h-11 text-xs font-bold border-slate-200 focus:ring-slate-950 rounded-xl"
                     placeholder="E.G. SPORTS CARNIVAL..."
                     value={formData.title}
                     onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                     required
                  />
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                     <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-0.5">
                        Start Date
                     </label>
                     <input
                        type="date"
                        className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-slate-950 transition-all cursor-pointer"
                        value={formData.date}
                        onChange={(e) =>
                           setFormData({
                              ...formData,
                              date: e.target.value,
                              endDate: formData.endDate < e.target.value ? e.target.value : formData.endDate,
                           })
                        }
                        required
                     />
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-0.5">
                        End Date
                     </label>
                     <input
                        type="date"
                        min={formData.date}
                        className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-slate-950 transition-all cursor-pointer"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        required
                     />
                  </div>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                     <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-0.5">
                        Time Interval
                     </label>
                     <Input
                        className="h-11 text-xs font-bold border-slate-200 focus:ring-slate-950 rounded-xl"
                        placeholder="E.G. 09:00 AM..."
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                     />
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-0.5">
                        Target Cohort
                     </label>
                     <Input
                        className="h-11 text-xs font-bold border-slate-200 focus:ring-slate-950 rounded-xl"
                        placeholder="E.G. ALL CLASSES..."
                        value={formData.participants}
                        onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
                     />
                  </div>
               </div>

               <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-0.5">
                     Hosting Location
                  </label>
                  <Input
                     className="h-11 text-xs font-bold border-slate-200 focus:ring-slate-950 rounded-xl"
                     placeholder="E.G. AUDITORIUM..."
                     value={formData.location}
                     onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
               </div>

               <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-0.5">
                     Detail Description
                  </label>
                  <textarea
                     className="w-full h-24 bg-slate-50 border border-slate-200 p-3 rounded-xl font-semibold text-xs outline-none focus:ring-2 focus:ring-slate-950 transition-all resize-none font-sans"
                     placeholder="Enter detailed notice information or event itinerary..."
                     value={formData.description}
                     onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
               </div>

               {/* Submit Buttons */}
               <div className="flex gap-3 pt-3 border-t border-slate-100">
                  <Button
                     type="button"
                     onClick={() => onOpenChange(false)}
                     variant="outline"
                     className="flex-1 h-12 text-[10px] font-black uppercase tracking-[2px] rounded-xl border-slate-200 text-slate-500"
                  >
                     Cancel
                  </Button>
                  <Button
                     type="submit"
                     disabled={isPending}
                     className="flex-1 bg-slate-900 hover:bg-slate-800 text-white h-12 font-black uppercase text-[10px] tracking-[2px] rounded-xl shadow-lg transition-all"
                  >
                     {isPending ? (
                        <Loader2 className="animate-spin mr-2" size={14} />
                     ) : (
                        <Sparkles size={14} className="mr-2" />
                     )}
                     {editingEvent ? "Save Changes" : "Commit Matrix Entry"}
                  </Button>
               </div>
            </form>
         </DialogContent>
      </Dialog>
   );
}
