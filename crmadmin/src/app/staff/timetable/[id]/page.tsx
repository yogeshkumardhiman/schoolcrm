"use client";
import client from "@/lib/client";

import React, { useState, useEffect } from "react";
import { 
  Save, 
  Plus, 
  Clock, 
  BookOpen, 
  GraduationCap,
  Calendar,
  Loader2,
  ArrowLeft,
  ChevronRight,
  Monitor,
  Layout,
  ClipboardList,
  Sparkles,
  RefreshCcw
} from "lucide-react";
import { useParams } from "next/navigation";
import { useRouter } from "@bprogress/next/app";

import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

const SUBJECT_COLORS: any = {
  MATHS: "bg-blue-50 border-blue-200 text-blue-700",
  SCIENCE: "bg-emerald-50 border-emerald-200 text-emerald-700",
  ENGLISH: "bg-purple-50 border-purple-200 text-purple-700",
  HINDI: "bg-orange-50 border-orange-200 text-orange-700",
  SOCIAL: "bg-blue-50 border-blue-200 text-blue-700",
  COMPUTER: "bg-cyan-50 border-cyan-200 text-cyan-700",
  DEFAULT: "bg-white border-slate-200 text-slate-700"
};

export default function StaffTimetableEditor() {
  const router = useRouter();
  const params = useParams();
  const staffId = params.id;
  
  const [staff, setStaff] = useState<any>(null);
  const [timetable, setTimetable] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clipboardDay, setClipboardDay] = useState<any[] | null>(null);

  useEffect(() => {
    fetchData();
  }, [staffId]);
  const fetchData = async () => {
    try {
      setLoading(true);
      const [staffData, ttData] = await Promise.all([
        client.get(`/staff/${String(staffId)}`),
        client.get(`/staff/timetable/${String(staffId)}`)
      ]);
      setStaff(staffData);
      setTimetable(ttData || []);
    } catch (err) {
      toast.error("Failed to sync records");
    } finally {
      setLoading(false);
    }
  };

  const updateEntry = (day: string, period: number, field: string, value: string) => {
    setTimetable(prev => {
      const existingIdx = prev.findIndex(t => 
        t.day.toUpperCase() === day.toUpperCase() && 
        Number(t.period) === Number(period)
      );
      const newTimetable = [...prev];
      
      if (existingIdx !== -1) {
        newTimetable[existingIdx] = { ...newTimetable[existingIdx], [field]: value };
      } else {
        newTimetable.push({ 
          day, 
          period, 
          [field]: value, 
          class: field === 'class' ? value : '', 
          subject: field === 'subject' ? value : '' 
        });
      }
      return newTimetable;
    });
  };

  const applyWeekly = (period: number, template: any) => {
    const newTimetable = [...timetable];
    DAYS.forEach(day => {
      const idx = newTimetable.findIndex(t => 
        t.day.toUpperCase() === day.toUpperCase() && 
        Number(t.period) === Number(period)
      );
      const entry = { ...template, day, period };
      if (idx !== -1) newTimetable[idx] = entry;
      else newTimetable.push(entry);
    });
    setTimetable(newTimetable);
    toast.success(`Period ${period} replicated across the week`);
  };

  const copyDay = (day: string) => {
    const dayEntries = timetable.filter(t => t.day.toUpperCase() === day.toUpperCase() && t.class && t.subject);
    setClipboardDay(dayEntries.map(e => ({ ...e })));
    toast.success(`${day} schedule cached to clipboard`);
  };

  const pasteDay = (targetDay: string) => {
    if (!clipboardDay) return toast.error("Clipboard empty");
    const newTimetable = timetable.filter(t => t.day.toUpperCase() !== targetDay.toUpperCase());
    clipboardDay.forEach(entry => {
      newTimetable.push({ ...entry, day: targetDay });
    });
    setTimetable(newTimetable);
    toast.success(`Schedule deployed to ${targetDay}`);
  };

  const clearDay = (day: string) => {
    setTimetable(timetable.filter(t => t.day.toUpperCase() !== day.toUpperCase()));
    toast.success(`${day} schedule purged`);
  };

  const getEntry = (day: string, period: number) => {
    return timetable.find(t => 
      t.day.toUpperCase() === day.toUpperCase() && 
      Number(t.period) === Number(period)
    ) || { class: '', subject: '' };
  };

  const getSubjectStyle = (subject: string) => {
    const key = subject?.toUpperCase();
    if (key?.includes('MATH')) return SUBJECT_COLORS.MATHS;
    if (key?.includes('SCI')) return SUBJECT_COLORS.SCIENCE;
    if (key?.includes('ENG')) return SUBJECT_COLORS.ENGLISH;
    if (key?.includes('HIN')) return SUBJECT_COLORS.HINDI;
    if (key?.includes('SOC') || key?.includes('HIS') || key?.includes('GEO')) return SUBJECT_COLORS.SOCIAL;
    if (key?.includes('COMP') || key?.includes('IT')) return SUBJECT_COLORS.COMPUTER;
    return SUBJECT_COLORS.DEFAULT;
  };
  const handleSave = async () => {
    try {
      setSaving(true);
      const validEntries = timetable.filter(t => t.class && t.subject);
      // Use 'entries' key to match backend fix
      await client.post(`/staff/timetable/${String(staffId)}`, validEntries);
      toast.success("Institutional Schedule Archived");
      // Optional: router.back() or stay to see results
      router.back();
    } catch (err) {
      toast.error("Archive failure");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center gap-6 bg-[#F8FAFC]">
        <Loader2 className="animate-spin text-blue-600" size={50} strokeWidth={1.5} />
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[10px]">Syncing Matrix Nodes...</p>
    </div>
  );

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50/50 min-h-screen font-inter">
      
      {/* 🚀 Tactical Header */}
      <div className="flex items-center justify-between space-y-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-2">
            <button onClick={() => router.back()} className="hover:text-blue-600 transition-colors">Staff Registry</button>
            <ChevronRight size={10} />
            <span className="text-blue-600">Dynamic Timetable Protocol</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
             <div className="h-10 w-10 rounded-lgl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-100">
               <Calendar size={22} />
             </div>
             {staff?.name}
          </h2>
          <p className="text-sm text-muted-foreground font-medium">Orchestrate weekly pedagogical resource allocation for {staff?.role}.</p>
        </div>
        <div className="flex items-center space-x-3">
           <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-[#0F172A] hover:bg-blue-600 text-white h-11 px-8 font-bold uppercase text-[10px] tracking-[2px] rounded-lgl shadow-xl transition-all active:scale-95 gap-3"
           >
             {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
             Archive Protocol
           </Button>
        </div>
      </div>

      {/* 📊 Live Load Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lgxl border border-slate-200 shadow-sm flex items-center gap-4">
             <div className="h-12 w-12 rounded-lgl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Monitor size={24} />
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Weekly Load</p>
                <h4 className="text-2xl font-black text-slate-900">{timetable.filter(t => t.class && t.subject).length} <span className="text-xs font-bold text-slate-400 uppercase">Periods</span></h4>
             </div>
          </div>
          <div className="bg-white p-6 rounded-lgxl border border-slate-200 shadow-sm flex items-center gap-4">
             <div className="h-12 w-12 rounded-lgl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Clock size={24} />
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operational Days</p>
                <h4 className="text-2xl font-black text-slate-900">{new Set(timetable.filter(t => t.class && t.subject).map(t => t.day)).size} <span className="text-xs font-bold text-slate-400 uppercase">Days / Week</span></h4>
             </div>
          </div>
          <div className="bg-white p-6 rounded-lgxl border border-slate-200 shadow-sm flex items-center gap-4">
             <div className="h-12 w-12 rounded-lgl bg-purple-50 text-purple-600 flex items-center justify-center">
                <BookOpen size={24} />
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Class Nodes</p>
                <h4 className="text-2xl font-black text-slate-900">{Array.from(new Set(timetable.filter(t => t.class && t.subject).map(t => `${t.class}-${t.section}`))).length} <span className="text-xs font-bold text-slate-400 uppercase">Classes</span></h4>
             </div>
          </div>
      </div>

      {/* 📅 Matrix Architecture */}
      <div className="bg-white rounded-lgxl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[4px]">Institutional Grid v5.0</h3>
            </div>
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                   <div className="h-3 w-3 rounded-full bg-blue-50 border border-blue-200" />
                   <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Normal Load</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="h-3 w-3 rounded-full bg-blue-600" />
                   <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Substitution Active</span>
                </div>
            </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-center border-collapse table-fixed min-w-275">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="w-48 px-6 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[3px] text-left border-r border-slate-100 sticky left-0 z-20 bg-slate-50">Day Protocol</th>
                {PERIODS.map(p => (
                  <th key={p} className="px-4 py-6 border-r border-slate-100 last:border-r-0">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Period</span>
                    <span className="ml-2 text-base font-black text-slate-900">{p}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {DAYS.map(day => (
                <tr key={day} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-6 py-8 bg-white border-r border-slate-100 text-left sticky left-0 z-10 shadow-[5px_0_15px_rgba(0,0,0,0.02)]">
                    <p className="text-sm font-black text-slate-900 uppercase tracking-wider">{day}</p>
                    <div className="flex items-center gap-1.5 mt-3">
                       <button onClick={() => copyDay(day)} className="h-7 w-7 rounded-lg bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all group" title="Copy Day">
                         <ClipboardList size={12} />
                       </button>
                       <button onClick={() => pasteDay(day)} disabled={!clipboardDay} className="h-7 w-7 rounded-lg bg-slate-50 text-slate-400 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-all disabled:opacity-20" title="Paste Day">
                         <Plus size={12} />
                       </button>
                       <button onClick={() => clearDay(day)} className="h-7 w-7 rounded-lg bg-slate-50 text-slate-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all" title="Clear Day">
                         <Trash2 size={12} />
                       </button>
                    </div>
                  </td>
                  {PERIODS.map(period => {
                    const entry = getEntry(day, period);
                    const isActive = entry.class && entry.subject;
                    
                    return (
                      <td key={period} className="p-3 border-r border-slate-100 last:border-r-0 group/cell">
                        {isActive ? (
                          <div className="p-3 rounded-lgl border border-slate-200 bg-white shadow-sm transition-all duration-300 space-y-2 group/node relative hover:border-blue-500 hover:shadow-md">
                             {/* Subject Input */}
                             <div className="relative">
                               <input 
                                 type="text" 
                                 placeholder="Subject"
                                 value={entry.subject}
                                 onChange={(e) => updateEntry(day, period, 'subject', e.target.value)}
                                 className="w-full bg-slate-50/50 text-center py-2 px-2 rounded-lg font-bold text-[11px] text-slate-900 placeholder:text-slate-300 outline-none border border-slate-100 focus:bg-white focus:border-blue-500 uppercase transition-all"
                               />
                             </div>

                             {/* Metadata Row */}
                             <div className="flex gap-1.5">
                               <input 
                                 type="text" 
                                 placeholder="CL"
                                 value={entry.class}
                                 onChange={(e) => updateEntry(day, period, 'class', e.target.value)}
                                 className="w-1/2 bg-transparent text-center py-1.5 rounded-lg font-bold text-[10px] text-blue-600 placeholder:text-slate-200 outline-none border border-slate-100 focus:border-blue-300 uppercase transition-all"
                               />
                               <input 
                                 type="text" 
                                 placeholder="SEC"
                                 value={entry.section || 'A'}
                                 onChange={(e) => updateEntry(day, period, 'section', e.target.value)}
                                 className="w-1/2 bg-transparent text-center py-1.5 rounded-lg font-bold text-[10px] text-slate-400 placeholder:text-slate-200 outline-none border border-slate-100 focus:border-slate-300 uppercase transition-all"
                               />
                             </div>

                             {/* Floating Quick Actions */}
                             <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover/node:opacity-100 transition-all z-10 scale-90">
                               <button 
                                 onClick={() => applyWeekly(period, entry)}
                                 className="h-6 w-6 bg-blue-600 text-white rounded-lg flex items-center justify-center shadow-lg hover:scale-110 active:scale-95"
                                 title="Apply to weekly period"
                               >
                                 <RefreshCcw size={10} />
                               </button>
                               <button 
                                 onClick={() => updateEntry(day, period, 'class', '')}
                                 className="h-6 w-6 bg-white border border-slate-200 text-red-500 rounded-lg flex items-center justify-center shadow-lg hover:bg-red-50 hover:border-red-200 active:scale-95"
                               >
                                 <Plus size={12} className="rotate-45" />
                               </button>
                             </div>
                          </div>
                        ) : (
                          <button 
                            onClick={() => {
                              setTimetable(prev => [...prev, { day, period, class: '1', subject: 'NEW CLASS' }]);
                            }}
                            className="w-full h-20 rounded-lgl border border-dashed border-slate-200 bg-slate-50/20 hover:bg-white hover:border-blue-300 hover:shadow-sm transition-all duration-300 flex flex-col items-center justify-center gap-1 group/add opacity-40 hover:opacity-100"
                          >
                            <Plus size={14} className="text-slate-400 group-hover/add:text-blue-500 transition-all" />
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Register</span>
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend Panel */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-12">
          <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-blue-600" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Assigned Asset Node</span>
          </div>
          <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-slate-200" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Vacant Node</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 text-[9px] font-black text-slate-300 uppercase tracking-[4px] mt-4">
        <ShieldCheck size={14} /> Institutional Governance Protocol v5.2
      </div>
    </div>
  );
}

const Trash2 = ({ size, className }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
);

const ShieldCheck = ({ size, className }: any) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        <path d="m9 12 2 2 4-4" />
    </svg>
);
