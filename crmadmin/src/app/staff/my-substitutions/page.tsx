"use client";
import client from "@/lib/client";

import React, { useState, useEffect } from "react";
import { 
  RefreshCcw, 
  Clock, 
  CheckCircle2, 
  Calendar,
  Zap,
  ArrowLeft,
  Loader2,
  Users
} from "lucide-react";
import { useRouter } from "@bprogress/next/app";

import toast from "react-hot-toast";
import { useAuth } from "@/components/AbilityProvider";

export default function MySubstitutions() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [substitutions, setSubstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayLabel, setTodayLabel] = useState("");
  const userRole = (user?.role || "").toUpperCase();

  useEffect(() => {
    setMounted(true);
    setTodayLabel(
      new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Kolkata",
      }).format(new Date())
    );
  }, []);

  useEffect(() => {
    if (!mounted || authLoading) return;
    if (userRole === "SUPER_ADMIN" || userRole === "ADMIN") {
      router.replace("/staff/substitution");
      return;
    }
    if (userRole === "TEACHER") {
      fetchMySubstitutions();
    }
  }, [mounted, authLoading, userRole, router]);

  const fetchMySubstitutions = async () => {
    try {
      setLoading(true);
      const data = await client.get("/staff/my-substitutions");
      setSubstitutions(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to sync assignments");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="animate-spin text-slate-900 mb-4" size={36} />
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[4px]">Verifying access...</p>
      </div>
    );
  }

  if (userRole !== "TEACHER") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-6">
        <div className="w-full max-w-xl rounded-[32px] border border-slate-200 bg-white p-10 text-center space-y-4 shadow-sm">
          <p className="text-xl font-black text-slate-900 uppercase tracking-tight">Access Restricted</p>
          <p className="text-sm font-medium text-slate-500">
            This page is for individual teacher duty rosters. Administrators can manage all school substitutions from the Substitution Hub.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => router.replace("/staff/substitution")}
              className="h-11 px-6 rounded-xl bg-blue-600 text-white text-[11px] font-black uppercase tracking-[2px] cursor-pointer shadow-md hover:bg-blue-700 transition"
            >
              Go to Substitution Hub
            </button>
            <button
              onClick={() => router.replace("/")}
              className="h-11 px-6 rounded-xl bg-slate-100 text-slate-700 text-[11px] font-black uppercase tracking-[2px] cursor-pointer hover:bg-slate-200 transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-14 space-y-12 bg-[#FBFBFC] min-h-screen">
      
      {/* 🚀 Tactical Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
        <div className="space-y-4">
            <button onClick={() => router.back()} className="group flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all font-black text-[10px] uppercase tracking-widest">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back To Dashboard
            </button>
            <div className="flex items-center gap-6">
                <div className="h-16 w-16 bg-[#0F172A] text-white rounded-lg flex items-center justify-center shadow-massive">
                    <Zap size={32} strokeWidth={1.5} />
                </div>
                <div>
                   <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase ">Substitution Log</h2>
                   <div className="flex items-center gap-4 mt-2">
                       <Calendar className="text-blue-500" size={14} />
                       <p className="text-[11px] font-black text-slate-400 uppercase tracking-[4px] ">
                         Active Assignments Today • {todayLabel || "--/--/----"}
                       </p>
                   </div>
                </div>
            </div>
        </div>
      </div>

      {/* 📋 Data Table - Matching Standard Aesthetic */}
      <div className="bg-white rounded-[40px] border border-slate-200 overflow-hidden shadow-sm hover:shadow-massive transition-all duration-700">
          <div className="p-8 border-b border-slate-50 bg-slate-50/50">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[6px] ">Pedagogical Coverage Registry</h3>
          </div>

          <div className="overflow-x-auto min-h-[400px]">
              {loading ? (
                  <div className="py-32 flex flex-col items-center justify-center space-y-4 animate-pulse">
                      <Loader2 size={32} className="text-blue-500 animate-spin" />
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-[8px]">Syncing Assignment Stream</p>
                  </div>
              ) : substitutions.length > 0 ? (
                  <table className="w-full text-left">
                      <thead className="bg-[#F8FAFC] border-b border-slate-100">
                          <tr>
                              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Original Instructor</th>
                              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Period</th>
                              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Cohort</th>
                              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                          {substitutions.map((s, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/50 transition-all group">
                                  <td className="px-10 py-8">
                                      <div className="flex items-center gap-4">
                                          <div className="h-10 w-10 rounded-lgl bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-400">
                                              {s.absentTeacher?.name[0]}
                                          </div>
                                          <div>
                                              <p className="text-[13px] font-black text-slate-900 uppercase tracking-tight">{s.absentTeacher?.name}</p>
                                              <p className="text-[9px] font-bold text-red-400 uppercase tracking-widest mt-1 ">Absent/Leave Status</p>
                                          </div>
                                      </div>
                                  </td>
                                  <td className="px-10 py-8 text-center">
                                      <span className="inline-flex items-center justify-center h-12 w-12 rounded-lgxl bg-slate-900 text-white font-black text-sm shadow-xl">
                                          {s.period}
                                      </span>
                                  </td>
                                  <td className="px-10 py-8">
                                      <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-lgxl border border-blue-100 w-fit">
                                          <Users className="text-blue-600" size={16} />
                                          <span className="text-[11px] font-black text-blue-800 uppercase tracking-widest">Class {s.class}-{s.section}</span>
                                      </div>
                                  </td>
                                  <td className="px-10 py-8 text-right">
                                      <div className="flex items-center justify-end gap-3 text-emerald-500">
                                          <span className="text-[10px] font-black uppercase tracking-widest ">Live Coverage</span>
                                          <div className="h-4 w-4 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                      </div>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              ) : (
                  <div className="py-32 flex flex-col items-center justify-center space-y-6">
                      <div className="h-24 w-24 bg-slate-50 rounded-[40px] flex items-center justify-center text-slate-200">
                          <Zap size={48} strokeWidth={1} />
                      </div>
                      <div className="text-center space-y-2">
                          <p className="text-lg font-black text-slate-900 tracking-tighter uppercase ">Institutional Harmony</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[8px]  opacity-50">No Substitution Assignments Active For Today</p>
                      </div>
                  </div>
              )}
          </div>
      </div>

      {/* 🏛️ Quick Protocol Information */}
      <div className="bg-slate-900 p-8 rounded-[40px] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="flex items-center gap-6">
              <div className="h-12 w-12 bg-white/5 rounded-lgxl flex items-center justify-center text-blue-400">
                  <Clock size={24} />
              </div>
              <p className="text-[11px] font-black uppercase tracking-[4px] leading-relaxed max-w-lg">
                  Ensure timely presence in substituted classes to maintain pedagogical continuity. Synchronize with the Class Registry upon session completion.
              </p>
          </div>
          <button 
            onClick={fetchMySubstitutions}
            className="h-12 px-8 bg-blue-600 rounded-lgxl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-3 shadow-massive active:scale-95"
          >
              <RefreshCcw size={16} /> Sync Registry
          </button>
      </div>
    </div>
  );
}
