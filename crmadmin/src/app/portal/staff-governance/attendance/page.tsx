"use client";
import client from "@/lib/client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Filter,
  UserPlus,
  QrCode,
  Users,
  RefreshCw,
  Sparkles,
  CheckCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const DEFAULT_STAFF_DATA: { staff: any[]; att: Record<number, string> } = {
  staff: [],
  att: {}
};

export default function StaffAttendancePage() {
  const queryClient = useQueryClient();
  const [attendance, setAttendance] = useState<Record<number, string>>({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrToken, setQrToken] = useState("");
  const [qrTimer, setQrTimer] = useState(25);
  const [lastScanNotify, setLastScanNotify] = useState<any>(null);

  // Clear local edits when date changes
  useEffect(() => {
    setAttendance({});
  }, [date]);

  const fetchQrToken = async () => {
    try {
      const res = await client.get("/attendance/staff/qr-token");
      if (res?.token) {
        setQrToken(res.token);
        setQrTimer(25);
      }
    } catch (e) {
      console.log("Failed to fetch QR token:", e);
    }
  };

  const checkLastScan = async () => {
    try {
      const scanData = await client.get("/attendance/staff/last-scan");
      if (scanData && scanData.lastScan && scanData.lastScan.timestamp) {
        setLastScanNotify((prev: any) => {
          if (!prev || prev.timestamp !== scanData.lastScan.timestamp) {
            queryClient.invalidateQueries({ queryKey: ['staff-attendance', date] });
            return scanData.lastScan;
          }
          return prev;
        });
      }
    } catch (e) {
      console.log("Failed to check last scan:", e);
    }
  };

  useEffect(() => {
    let interval: any;
    let timerInt: any;
    let pollScanInt: any;

    if (isQrModalOpen) {
      fetchQrToken();
      interval = setInterval(fetchQrToken, 25000);

      timerInt = setInterval(() => {
        setQrTimer(prev => (prev > 1 ? prev - 1 : 25));
      }, 1000);

      checkLastScan();
      pollScanInt = setInterval(checkLastScan, 2000);
    } else {
      setQrToken("");
      setLastScanNotify(null);
    }
    return () => {
      clearInterval(interval);
      clearInterval(timerInt);
      clearInterval(pollScanInt);
    };
  }, [isQrModalOpen]);

  // Query: Staff and Attendance
  const { data: staffData = DEFAULT_STAFF_DATA, isLoading: loading, refetch } = useQuery({
    queryKey: ['staff-attendance', date],
    queryFn: async () => {
      try {
        const [staffRes, attendanceRes] = await Promise.allSettled([
          client.get("/staff/minimal-list"),
          client.get(`/attendance/staff?date=${date}`)
        ]);

        let staffList: any[] = [];
        if (staffRes.status === 'fulfilled' && staffRes.value) {
          const val = staffRes.value;
          staffList = Array.isArray(val) ? val : (val?.staff || val?.data || []);
        }

        // Fallback to /staff if minimal-list is empty
        if (staffList.length === 0) {
          try {
            const fallbackStaff = await client.get("/staff");
            staffList = Array.isArray(fallbackStaff) ? fallbackStaff : (fallbackStaff?.staff || fallbackStaff?.data || []);
          } catch (e) {
            console.warn("Fallback to /staff failed", e);
          }
        }

        let attendanceList: any[] = [];
        if (attendanceRes.status === 'fulfilled' && attendanceRes.value) {
          const val = attendanceRes.value;
          attendanceList = Array.isArray(val) ? val : (val?.data || []);
        }

        const attendanceMap: Record<number, string> = {};
        attendanceList.forEach((a: any) => {
          const staffId = a?.staffId || a?.staff?.id;
          if (staffId) {
            attendanceMap[staffId] = a.status;
          }
        });

        return { staff: staffList, att: attendanceMap };
      } catch (err) {
        console.error("Failed to load staff attendance:", err);
        return { staff: [], att: {} };
      }
    },
    staleTime: 1000 * 30,
    refetchOnMount: true,
  });

  const staff = staffData.staff;

  // Effective attendance combines loaded cache with local overrides
  const effectiveAttendance: Record<number, string> = React.useMemo(() => ({
    ...(staffData.att || {}),
    ...attendance
  }), [staffData.att, attendance]);

  const setStatus = (staffId: number, status: string) => {
    setAttendance((prev: Record<number, string>) => ({
      ...prev,
      [staffId]: status
    }));
  };

  const markAll = (status: string) => {
    const updated: Record<number, string> = {};
    staff.forEach((s: any) => {
      if (s?.id) updated[s.id] = status;
    });
    setAttendance(updated);
    toast.success(`Marked all staff as ${status}`);
  };

  // Mutation: Save Attendance
  const saveMutation = useMutation({
    mutationFn: (data: any) => client.post("/attendance/staff", data),
    onSuccess: () => {
      queryClient.setQueryData(['staff-attendance', date], (prev: any) => ({
        staff: prev?.staff || staff,
        att: { ...(prev?.att || {}), ...attendance }
      }));
      queryClient.invalidateQueries({ queryKey: ['staff-attendance', date] });
      toast.success("Attendance saved successfully");
    },
    onError: () => toast.error("Failed to save attendance")
  });

  const handleSave = () => {
    const attendanceData = Object.entries(effectiveAttendance).map(([id, status]) => ({
      staffId: parseInt(id),
      date: date,
      status: status as string
    }));
    saveMutation.mutate({ attendanceData, date });
  };

  const filteredStaff = staff.filter((s: any) => {
    const name = s.name || "";
    const dept = s.department || "";
    const role = s.role || "";
    const query = searchQuery.toLowerCase();
    return name.toLowerCase().includes(query) ||
      dept.toLowerCase().includes(query) ||
      role.toLowerCase().includes(query) ||
      String(s.id).includes(query);
  });

  const stats = {
    present: Object.values(effectiveAttendance).filter((v: any) => v === 'PRESENT').length,
    absent: Object.values(effectiveAttendance).filter((v: any) => v === 'ABSENT').length,
    leave: Object.values(effectiveAttendance).filter((v: any) => v === 'LEAVE').length,
    total: staff.length
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50/50 min-h-screen">
      {/* 🌟 Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Staff Attendance Log</h2>
          <p className="text-sm text-muted-foreground">Manage and track daily institutional staff verification.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-[160px] bg-white h-9 border-slate-200"
          />
          <Button
            onClick={() => setIsQrModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white h-9 px-3.5 font-medium gap-2 shadow-xs"
          >
            <QrCode className="h-4 w-4" />
            Display QR
          </Button>
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="h-9 px-3 border-slate-200 bg-white hover:bg-slate-50"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4 text-slate-600" />
          </Button>
          <Button
            onClick={handleSave}
            disabled={saveMutation.isPending || loading || staff.length === 0}
            className="bg-slate-900 hover:bg-slate-800 text-white h-9 px-5 font-semibold shadow-xs"
          >
            {saveMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCheck className="mr-1.5 h-4 w-4" />
            )}
            Save Attendance
          </Button>
        </div>
      </div>

      {/* 📊 KPI Summary Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="shadow-xs border-slate-200 rounded-xl bg-white p-5 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3.5 w-24 rounded-md" />
                <Skeleton className="h-7 w-7 rounded-lg" />
              </div>
              <Skeleton className="h-8 w-16 rounded-lg" />
              <Skeleton className="h-3 w-32 rounded-md" />
            </Card>
          ))
        ) : (
          <>
            <Card className="shadow-xs border-slate-200 rounded-xl bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Total Staff</CardTitle>
                <Users className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
                <p className="text-xs text-muted-foreground mt-0.5">Active personnel in registry</p>
              </CardContent>
            </Card>

            <Card className="shadow-xs border-slate-200 rounded-xl bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Present Today</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">{stats.present}</div>
                <p className="text-xs text-muted-foreground mt-0.5">Staff verified present</p>
              </CardContent>
            </Card>

            <Card className="shadow-xs border-slate-200 rounded-xl bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Absent</CardTitle>
                <XCircle className="h-4 w-4 text-rose-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-rose-600">{stats.absent}</div>
                <p className="text-xs text-muted-foreground mt-0.5">Unmarked or absent</p>
              </CardContent>
            </Card>

            <Card className="shadow-xs border-slate-200 rounded-xl bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">On Leave</CardTitle>
                <Clock className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">{stats.leave}</div>
                <p className="text-xs text-muted-foreground mt-0.5">Authorized leave petitions</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* 📋 Staff Attendance Register Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Search & Bulk Operations Header */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by faculty name, ID, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-slate-50/50 h-9 border-slate-200 text-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => markAll('PRESENT')}
              disabled={loading || staff.length === 0}
              className="h-8 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200"
            >
              All Present
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => markAll('ABSENT')}
              disabled={loading || staff.length === 0}
              className="h-8 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border-rose-200"
            >
              All Absent
            </Button>
            <Link href="/staff/new">
              <Button size="sm" className="h-8 gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs">
                <UserPlus className="h-3.5 w-3.5" /> Add Staff
              </Button>
            </Link>
          </div>
        </div>

        {/* Table Content with Skeleton */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 bg-slate-50/70 rounded-xl border border-slate-100 animate-pulse gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-[240px]">
                    <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-32 rounded-md" />
                      <Skeleton className="h-3 w-20 rounded-md" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-28 rounded-md hidden md:block" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Skeleton className="h-8 w-16 rounded-lg" />
                    <Skeleton className="h-8 w-16 rounded-lg" />
                    <Skeleton className="h-8 w-16 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredStaff.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-xs">
                  <th className="text-left py-3.5 px-6">Faculty / Staff Member</th>
                  <th className="text-left py-3.5 px-6">Role & Department</th>
                  <th className="text-center py-3.5 px-6">Current Status</th>
                  <th className="text-right py-3.5 px-6">Mark Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStaff.map((s: any) => {
                  const currentStatus = effectiveAttendance[s.id];

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="py-3.5 px-6">
                        <div className="flex items-center space-x-3.5">
                          <div className="h-10 w-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                            {s.image ? (
                              <img src={s.image} alt={s.name} className="h-full w-full object-cover" />
                            ) : (
                              <span className="font-bold text-indigo-600 text-sm">
                                {s.name?.[0] || 'S'}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 leading-snug truncate">{s.name}</p>
                            <p className="text-xs text-slate-400 font-mono">ID: #{s.loginId || `EMP-${s.id}`}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-6">
                        <div>
                          <p className="text-xs font-semibold text-slate-700">{s.role || s.designation || "Faculty"}</p>
                          <p className="text-[11px] text-slate-400">{s.department || s.subject || "General"}</p>
                        </div>
                      </td>
                      <td className="py-3.5 px-6 text-center">
                        <span className={cn(
                          "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide",
                          currentStatus === 'PRESENT' ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                            currentStatus === 'ABSENT' ? "bg-rose-50 text-rose-700 border border-rose-200" :
                              currentStatus === 'LEAVE' ? "bg-amber-50 text-amber-700 border border-amber-200" :
                                "bg-slate-100 text-slate-500 border border-slate-200"
                        )}>
                          {currentStatus || "UNMARKED"}
                        </span>
                      </td>
                      <td className="py-3.5 px-6">
                        <div className="flex items-center justify-end space-x-1.5">
                          <Button
                            size="sm"
                            type="button"
                            variant={currentStatus === 'PRESENT' ? 'default' : 'outline'}
                            onClick={() => setStatus(s.id, 'PRESENT')}
                            className={cn(
                              "h-8 text-[11px] px-3 font-bold uppercase transition-all",
                              currentStatus === 'PRESENT'
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                                : "text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 border-slate-200"
                            )}
                          >
                            Present
                          </Button>
                          <Button
                            size="sm"
                            type="button"
                            variant={currentStatus === 'ABSENT' ? 'destructive' : 'outline'}
                            onClick={() => setStatus(s.id, 'ABSENT')}
                            className={cn(
                              "h-8 text-[11px] px-3 font-bold uppercase transition-all",
                              currentStatus === 'ABSENT'
                                ? "bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
                                : "text-slate-500 hover:text-rose-700 hover:bg-rose-50 border-slate-200"
                            )}
                          >
                            Absent
                          </Button>
                          <Button
                            size="sm"
                            type="button"
                            variant={currentStatus === 'LEAVE' ? 'default' : 'outline'}
                            onClick={() => setStatus(s.id, 'LEAVE')}
                            className={cn(
                              "h-8 text-[11px] px-3 font-bold uppercase transition-all",
                              currentStatus === 'LEAVE'
                                ? "bg-amber-500 hover:bg-amber-600 text-white shadow-xs"
                                : "text-slate-500 hover:text-amber-700 hover:bg-amber-50 border-slate-200"
                            )}
                          >
                            Leave
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="h-[300px] flex flex-col items-center justify-center space-y-3 p-6 text-center">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                <Users className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">No staff members found</p>
              <p className="text-xs text-slate-400 max-w-sm">
                Add staff records to begin tracking daily attendance logs.
              </p>
              <Link href="/staff/new">
                <Button size="sm" className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs gap-1.5">
                  <UserPlus className="h-3.5 w-3.5" /> Add Staff Member
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* 📱 QR Code Attendance Modal */}
      {isQrModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 z-50 flex flex-col items-center justify-center p-6 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center relative border border-slate-100 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsQrModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-full hover:bg-slate-100"
            >
              <XCircle className="h-6 w-6" />
            </button>
            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-1 text-center font-heading uppercase">
              Staff Attendance Portal
            </h3>
            <p className="text-xs text-slate-500 text-center mb-6 font-medium">
              Open your SDM School App and scan this code to log attendance.
            </p>

            <div className="h-64 w-64 border-2 border-dashed border-indigo-400 rounded-2xl flex items-center justify-center p-4 bg-slate-50">
              {qrToken ? (
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrToken)}`}
                  alt="Attendance QR Code"
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center space-y-2">
                  <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                  <p className="text-xs text-slate-400 font-medium">Generating Token...</p>
                </div>
              )}
            </div>

            <div className="mt-6 w-full">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Refreshing Token</span>
                <span className="text-xs font-black text-indigo-600">{qrTimer}s</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full transition-all duration-1000 ease-linear"
                  style={{ width: `${(qrTimer / 25) * 100}%` }}
                />
              </div>
            </div>

            {lastScanNotify && (
              <div className="w-full mt-5 bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center space-x-3 animate-in fade-in slide-in-from-bottom duration-300">
                <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold shrink-0">
                  ✓
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">Attendance Logged</p>
                  <p className="text-xs font-bold text-slate-800 truncate">
                    {lastScanNotify.name || "Staff Member"}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {lastScanNotify.type === 'CHECK_IN'
                      ? `Welcome to school! Check-in recorded.`
                      : `Shift completed! Working hours logged.`
                    }
                  </p>
                </div>
              </div>
            )}

            <p className="text-[10px] text-slate-400 mt-5 text-center leading-relaxed">
              Security Protocol Enabled • Code rotates automatically to prevent static sharing.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
