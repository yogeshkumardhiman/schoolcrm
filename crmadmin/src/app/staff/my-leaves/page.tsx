"use client";

import React, { useState, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  Send,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  Inbox,
  Sparkles,
  ArrowRight,
  Trash2,
  RefreshCw,
  FileText,
  AlertCircle,
  Stethoscope,
  GraduationCap,
  HeartHandshake,
  ShieldCheck,
  ChevronRight,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/AbilityProvider";
import client from "@/lib/client";

const LEAVE_TYPES = [
  { id: "CASUAL", label: "Casual Leave (CL)", icon: Sparkles, color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
  { id: "MEDICAL", label: "Medical / Sick Leave (ML)", icon: Stethoscope, color: "text-rose-600 bg-rose-50 border-rose-200" },
  { id: "MATERNITY", label: "Maternity / Paternity", icon: HeartHandshake, color: "text-purple-600 bg-purple-50 border-purple-200" },
  { id: "STUDY", label: "Professional / Duty Leave", icon: GraduationCap, color: "text-amber-600 bg-amber-50 border-amber-200" },
  { id: "SPECIAL", label: "Special Cover Leave", icon: ShieldCheck, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
];

const QUICK_REASONS = [
  "Personal / Family Commitment",
  "Medical Appointment / Illness",
  "Urgent Domestic Task",
  "Official Educational Workshop",
  "Out of Station",
];

export default function MyLeavesPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Form states
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [type, setType] = useState("CASUAL");
  const [reason, setReason] = useState("");

  // Query: My Leave Petitions
  const {
    data: rawRequests = [],
    isLoading: loading,
    isRefetching,
    refetch,
  } = useQuery<any[]>({
    queryKey: ["my-leave-requests"],
    queryFn: async () => {
      try {
        const data = await client.get("/staff/my-leaves");
        return Array.isArray(data) ? data : data?.data || [];
      } catch (err) {
        console.error("Failed to load leave history", err);
        return [];
      }
    },
    staleTime: 1000 * 20,
    refetchOnMount: true,
  });

  const requests: any[] = Array.isArray(rawRequests) ? rawRequests : [];

  // Mutation: Submit Leave Petition
  const submitMutation = useMutation({
    mutationFn: (payload: { startDate: string; endDate: string; type: string; reason: string }) =>
      client.post("/staff/leave", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-leave-requests"] });
      queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
      toast.success("Leave petition filed successfully!");
      setStartDate("");
      setEndDate("");
      setType("CASUAL");
      setReason("");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to submit petition");
    },
  });

  // Mutation: Cancel Leave Petition
  const cancelMutation = useMutation({
    mutationFn: (id: number | string) => client.delete(`/staff/leave/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-leave-requests"] });
      queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
      toast.success("Leave petition cancelled");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to cancel petition");
    },
  });

  // Quick Preset Helper
  const setQuickDate = (daysFromToday: number, durationDays: number = 1) => {
    const start = new Date();
    start.setDate(start.getDate() + daysFromToday);
    const startStr = start.toISOString().split("T")[0];

    const end = new Date(start);
    end.setDate(end.getDate() + (durationDays - 1));
    const endStr = end.toISOString().split("T")[0];

    setStartDate(startStr);
    setEndDate(endStr);
  };

  // Duration calculation
  const calculatedDuration = useMemo(() => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return null;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  }, [startDate, endDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason.trim()) {
      toast.error("Please fill in start date, end date, and reason");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error("End Date cannot be before Start Date");
      return;
    }

    submitMutation.mutate({
      startDate,
      endDate,
      type,
      reason: reason.trim(),
    });
  };

  const stats = useMemo(() => {
    return {
      total: requests.length,
      approved: requests.filter((r) => r.status === "APPROVED").length,
      pending: requests.filter((r) => r.status === "PENDING").length,
      rejected: requests.filter((r) => r.status === "REJECTED" || r.status === "DISMISSED").length,
    };
  }, [requests]);

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-8 pt-8 bg-slate-50/50 min-h-screen font-sans text-slate-900" suppressHydrationWarning>
      {/* 🏙️ PAGE EXECUTIVE HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
            <FileText size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md text-[10px] font-black tracking-widest uppercase border border-indigo-150">
                Staff Governance
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {user?.name || "Faculty Member"}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5 leading-tight uppercase font-heading">
              Faculty <span className="text-indigo-600">Leave Portal</span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start lg:self-auto">
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            disabled={isRefetching}
            className="h-9 px-3.5 gap-2 border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 shadow-2xs cursor-pointer"
          >
            <RefreshCw className={cn("h-3.5 w-3.5 text-slate-500", isRefetching && "animate-spin text-indigo-600")} />
            Sync Ledger
          </Button>
        </div>
      </div>

      {/* 📊 TELEMETRY KPI & LEAVE STATUS CARDS */}
      <div className="grid gap-3.5 grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="shadow-xs border-slate-200/80 rounded-2xl bg-white p-4 space-y-2">
              <Skeleton className="h-3 w-20 rounded" />
              <Skeleton className="h-7 w-14 rounded-lg" />
              <Skeleton className="h-2.5 w-24 rounded" />
            </Card>
          ))
        ) : (
          <>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Applications</p>
                <div className="text-2xl font-black text-slate-900 tracking-tight">{stats.total}</div>
                <p className="text-[9.5px] font-bold text-slate-500">All Submitted Petitions</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold shadow-2xs">
                <FileText size={18} />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-emerald-150 shadow-xs flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">Approved Absences</p>
                <div className="text-2xl font-black text-emerald-700 tracking-tight">{stats.approved}</div>
                <p className="text-[9.5px] font-bold text-emerald-600/80">Authorized By Management</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 font-bold shadow-2xs">
                <CheckCircle2 size={18} />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-amber-150 shadow-xs flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-wider">Pending Review</p>
                <div className="text-2xl font-black text-amber-700 tracking-tight">{stats.pending}</div>
                <p className="text-[9.5px] font-bold text-amber-600/80">Awaiting Principal Audit</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 font-bold shadow-2xs">
                <Clock size={18} />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-rose-150 shadow-xs flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-[10px] font-black text-rose-600 uppercase tracking-wider">Dismissed / Denied</p>
                <div className="text-2xl font-black text-rose-700 tracking-tight">{stats.rejected}</div>
                <p className="text-[9.5px] font-bold text-rose-600/80">Declined Petitions</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 font-bold shadow-2xs">
                <XCircle size={18} />
              </div>
            </div>
          </>
        )}
      </div>

      {/* 🚀 TWO-COLUMN WORKSPACE: APPLICATION FORM + HISTORY LEDGER */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* 📝 LEFT COLUMN: FILE LEAVE PETITION (5 cols) */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden sticky top-6">
            <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black uppercase text-slate-900 tracking-wider font-heading flex items-center gap-2">
                  <Send size={14} className="text-indigo-600" /> File Leave Petition
                </h3>
                <p className="text-[10.5px] font-semibold text-slate-500 mt-0.5">
                  Submit absence request for academic council review.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
              {/* Quick Date Presets */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Quick Date Presets</label>
                  {calculatedDuration && (
                    <span className="text-[10px] font-black px-2 py-0.2 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {calculatedDuration} {calculatedDuration === 1 ? "Day" : "Days"} Total
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setQuickDate(0, 1)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-[10.5px] font-bold transition-all cursor-pointer"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDate(1, 1)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-[10.5px] font-bold transition-all cursor-pointer"
                  >
                    Tomorrow
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDate(1, 2)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-[10.5px] font-bold transition-all cursor-pointer"
                  >
                    Next 2 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDate(0, 6)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-[10.5px] font-bold transition-all cursor-pointer"
                  >
                    Full Week
                  </button>
                </div>
              </div>

              {/* DATE PICKERS */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-600">Start Date</label>
                  <Input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-10 bg-slate-50 border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-600">End Date</label>
                  <Input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-10 bg-slate-50 border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  />
                </div>
              </div>

              {/* LEAVE TYPE SELECTION */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-600">Leave Category</label>
                <div className="grid grid-cols-1 gap-1.5">
                  {LEAVE_TYPES.map((lt) => {
                    const Icon = lt.icon;
                    const isSelected = type === lt.id;
                    return (
                      <div
                        key={lt.id}
                        onClick={() => setType(lt.id)}
                        className={cn(
                          "p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer",
                          isSelected
                            ? "bg-indigo-50/80 border-indigo-300 shadow-2xs"
                            : "bg-slate-50/50 border-slate-200/80 hover:bg-slate-50"
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center font-bold", lt.color)}>
                            <Icon size={14} />
                          </div>
                          <span className={cn("text-xs font-bold", isSelected ? "text-indigo-950" : "text-slate-700")}>
                            {lt.label}
                          </span>
                        </div>
                        <div className={cn(
                          "h-4 w-4 rounded-full border flex items-center justify-center",
                          isSelected ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300"
                        )}>
                          {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* REASON FOR ABSENCE */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-600">Reason for Absence</label>
                  <span className="text-[9px] font-semibold text-slate-400">Required</span>
                </div>

                {/* Quick Reason Suggestions */}
                <div className="flex flex-wrap gap-1 pb-1">
                  {QUICK_REASONS.map((r, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setReason(r)}
                      className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 text-[9.5px] font-semibold transition-all cursor-pointer"
                    >
                      + {r}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={3}
                  required
                  placeholder="State the purpose of your absence clearly for administration and proxy allocation..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                />
              </div>

              {/* SUBMIT BUTTON */}
              <Button
                type="submit"
                disabled={submitMutation.isPending}
                className="w-full h-10 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider gap-2 rounded-xl transition-all shadow-xs cursor-pointer active:scale-98"
              >
                {submitMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-400" /> Dispatching Petition...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" /> Dispatch Leave Petition
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* 🗓️ RIGHT COLUMN: PETITION HISTORY LEDGER (7 cols) */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black uppercase text-slate-900 tracking-wider font-heading flex items-center gap-2">
                  <Clock size={14} className="text-indigo-600" /> Petition Ledger & Audit Trail
                </h3>
                <p className="text-[10.5px] font-semibold text-slate-500 mt-0.5">
                  Live status of submitted leave applications with administrative review.
                </p>
              </div>
              <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-black uppercase">
                {requests.length} Total
              </span>
            </div>

            <div className="p-0">
              {loading ? (
                <div className="p-5 space-y-3">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100 animate-pulse space-y-2">
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-36 rounded" />
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </div>
                      <Skeleton className="h-3 w-48 rounded" />
                    </div>
                  ))}
                </div>
              ) : requests.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {requests.map((r, index) => {
                    const reqId = r.id || index;
                    const isCanceling = cancelMutation.isPending && (cancelMutation.variables as any) === reqId;

                    return (
                      <div
                        key={reqId}
                        className="p-4 sm:p-5 hover:bg-slate-50/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-800 text-[10px] font-black uppercase tracking-wider">
                              {r.type || "CASUAL LEAVE"}
                            </span>
                            <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                              <CalendarIcon size={12} className="text-slate-400" />
                              {r.startDate} <ArrowRight size={11} className="text-slate-300" /> {r.endDate}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-600 leading-relaxed">
                            {r.reason || "No description provided."}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                            <span>Logged at {r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-IN") : "Recent"}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                          <Badge
                            className={cn(
                              "font-black text-[9.5px] uppercase tracking-wider px-3 py-1 rounded-full shadow-2xs",
                              r.status === "APPROVED"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : r.status === "REJECTED" || r.status === "DISMISSED"
                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200 animate-pulse"
                            )}
                          >
                            {r.status === "PENDING" ? "⏳ Awaiting Audit" : r.status === "APPROVED" ? "✓ Authorized" : "✕ Declined"}
                          </Badge>

                          {r.status === "PENDING" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => cancelMutation.mutate(reqId)}
                              disabled={isCanceling}
                              className="h-8 px-2.5 text-xs text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer"
                              title="Cancel leave petition"
                            >
                              {isCanceling ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-[380px] flex flex-col items-center justify-center space-y-3 p-6 text-center">
                  <div className="h-16 w-16 bg-indigo-50 border border-indigo-100 rounded-3xl flex items-center justify-center text-indigo-500 shadow-2xs">
                    <Inbox className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800 uppercase tracking-wider font-heading">
                      Absence Ledger Blank
                    </p>
                    <p className="text-xs font-semibold text-slate-400 mt-1 max-w-xs">
                      No active or past leave petitions found. Fill out the application on the left to submit a request.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
