"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
    Users, GraduationCap, Calendar, Bell, CheckCircle,
    ArrowRight, ChevronRight, Zap, Activity, IndianRupee, MessageSquare,
    ArrowUpRight, ArrowDownRight, Monitor, Filter, ShieldCheck, Clock,
    BookOpen, CheckSquare, Plus, FileText, DollarSign, Wallet,
    TrendingUp, UserCheck, AlertTriangle, Printer, Layers, Award,
    Send
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AttendanceTrendsChart } from "@/features/reports";
import { Skeleton } from "@/components/ui/skeleton";
import { APP_CONFIG } from "@/constants/config";
import { useAuth } from "@/components/AbilityProvider";
import { useSessionContext } from "@/contexts/SessionContext";
import { useQuery } from "@tanstack/react-query";
import client from "@/lib/client";
import { useRouter } from "next/navigation";

// 💎 PREMIUM METRIC CARD
function MetricCard({ title, value, subValue, icon: Icon, loading, trend, colorClass, isPositive = true }: any) {
    return (
        <div className="glass-card p-6 rounded-2xl bg-white group hover:border-slate-300 transition-all duration-300 font-sans flex items-center gap-5 shadow-sm border border-slate-100">
            <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0 transition-transform group-hover:scale-105", colorClass)}>
                <Icon size={26} strokeWidth={2.5} />
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
                <div className="flex items-baseline gap-2">
                    {loading ? (
                        <Skeleton className="h-8 w-24 rounded-lg" />
                    ) : (
                        <h3 className="text-2xl font-black tracking-tight font-heading text-slate-900">
                            {value}
                        </h3>
                    )}
                </div>
                {subValue && (
                    <p className="text-[11px] font-medium text-slate-500 truncate mt-0.5">{subValue}</p>
                )}
            </div>
        </div>
    );
}

// --------------------------------------------------------------------------------------
// 1. 🛡️ SUPER ADMIN & ADMIN DECISION HUB
// --------------------------------------------------------------------------------------
function AdminDecisionDashboard({ stats, loading, chartView, setChartView }: { stats: any, loading: boolean, chartView: 'weekly' | 'monthly', setChartView: any }) {
    const actions = stats.actionRequired || [];
    const events = stats.upcomingEvents || [];
    const fin = stats.financialSummary || {};

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Top Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <MetricCard
                    title="Total Scholars"
                    value={stats.totalStudents || 0}
                    subValue={stats.attendancePercentage ? `Today's Attendance: ${stats.attendancePercentage}%` : "Live Enrollment"}
                    icon={Users}
                    loading={loading}
                    colorClass="bg-orange-500 shadow-orange-200"
                />
                <MetricCard
                    title="Total Faculty"
                    value={stats.totalTeachers || 0}
                    subValue={Number(stats.staffAttendancePercentage) > 0 ? `Faculty Presence: ${stats.staffAttendancePercentage}%` : "Faculty Registry"}
                    icon={GraduationCap}
                    loading={loading}
                    colorClass="bg-emerald-500 shadow-emerald-200"
                />
                <MetricCard
                    title="Session Fee Revenue"
                    value={fin.totalCollection ? `₹${(fin.totalCollection / 100000).toFixed(2)} L` : "₹0"}
                    subValue={`Today: ₹${(fin.todayCollection || 0).toLocaleString('en-IN')}`}
                    icon={IndianRupee}
                    loading={loading}
                    colorClass="bg-blue-600 shadow-blue-200"
                />
                <MetricCard
                    title="Pending Dues"
                    value={fin.pendingDues ? `₹${(fin.pendingDues / 100000).toFixed(2)} L` : "₹0"}
                    subValue={`${fin.defaultersCount || 0} Fee Defaulters`}
                    icon={Wallet}
                    loading={loading}
                    colorClass="bg-rose-500 shadow-rose-200"
                />
            </div>

            {/* Quick Actions Bar */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-wrap items-center justify-between gap-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Quick Commands:</span>
                <div className="flex flex-wrap items-center gap-2">
                    <Link href="/students/new" className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm">
                        <Plus size={14} /> Add Student
                    </Link>
                    <Link href="/fees" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm">
                        <IndianRupee size={14} /> Collect Fees
                    </Link>
                    <Link href="/attendance" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm">
                        <CheckSquare size={14} /> Mark Attendance
                    </Link>
                    <Link href="/notifications" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm">
                        <Send size={14} /> Broadcast Notice
                    </Link>
                    <Link href="/staff/access" className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5">
                        <ShieldCheck size={14} /> RBAC Access
                    </Link>
                </div>
            </div>

            {/* Main Visuals & Events Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <div className="xl:col-span-8 glass-card rounded-2xl p-8 bg-white border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-black tracking-tight text-slate-900 font-heading uppercase">Attendance Trends</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Student Presence Analytics</p>
                        </div>
                        <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100">
                            <button
                                onClick={() => setChartView('weekly')}
                                className={cn("px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                                    chartView === 'weekly' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}
                            >
                                Weekly
                            </button>
                            <button
                                onClick={() => setChartView('monthly')}
                                className={cn("px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                                    chartView === 'monthly' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}
                            >
                                Monthly
                            </button>
                        </div>
                    </div>
                    <div className="h-[320px] w-full">
                        {loading ? <Skeleton className="h-full w-full rounded-2xl" /> : <AttendanceTrendsChart data={stats.attendanceTrend || []} view={chartView} />}
                    </div>
                </div>

                <div className="xl:col-span-4 space-y-6">
                    {/* Events & Circulars */}
                    <div className="glass-card rounded-2xl p-6 bg-white border border-slate-100 border-l-4 border-l-indigo-600 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 text-indigo-600">
                                <Bell size={18} />
                                <h4 className="text-xs font-black uppercase tracking-wider font-heading">Upcoming Calendar & Circulars</h4>
                            </div>
                            <Link href="/calendar" className="text-[10px] font-bold text-indigo-600 hover:underline uppercase tracking-wider">
                                Full View
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {loading ? Array(2).fill(0).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />) :
                                events.length > 0 ? events.map((event: any, i: number) => (
                                    <Link
                                        key={event.id || i}
                                        href={event.id?.startsWith('not-') ? '/notifications' : '/calendar'}
                                        className={cn(
                                            "p-3.5 rounded-xl border transition-all block group",
                                            i === 0 ? "bg-indigo-50/70 border-indigo-100 hover:bg-indigo-600 hover:border-indigo-600" : "bg-slate-50 border-slate-100 hover:border-indigo-300 hover:bg-white"
                                        )}
                                    >
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <p className={cn("text-[9px] font-black uppercase tracking-widest", i === 0 ? "text-indigo-600 group-hover:text-indigo-200" : "text-slate-400")}>{event.date}</p>
                                            <span className={cn("text-[8px] font-bold px-1.5 py-0.2 rounded uppercase", i === 0 ? "bg-white text-indigo-800" : "bg-slate-200 text-slate-700")}>
                                                {event.id?.startsWith('not-') ? 'Circular' : 'Event'}
                                            </span>
                                        </div>
                                        <p className={cn("text-xs font-bold line-clamp-1 transition-colors", i === 0 ? "text-slate-900 group-hover:text-white" : "text-slate-900")}>{event.title}</p>
                                    </Link>
                                )) : (
                                    <div className="py-12 text-center text-slate-400">
                                        <Calendar className="mx-auto mb-2 text-slate-300" size={28} />
                                        <p className="text-[10px] font-bold uppercase tracking-wider">No upcoming events</p>
                                    </div>
                                )}
                        </div>
                    </div>

                    {/* System Integrity */}
                    <div className="glass-card rounded-2xl p-6 bg-slate-900 text-white flex items-center justify-between shadow-lg">
                        <div>
                            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Institutional Core</p>
                            <p className="text-sm font-black mt-0.5">Database & Security Online</p>
                            <p className="text-[10px] text-slate-400 mt-1">RBAC Active • SSL Encrypted</p>
                        </div>
                        <div className="h-12 w-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                            <ShieldCheck size={26} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --------------------------------------------------------------------------------------
// 2. 🎓 PRINCIPAL & VICE PRINCIPAL GOVERNANCE HUB
// --------------------------------------------------------------------------------------
function PrincipalDashboard({ stats, loading }: { stats: any, loading: boolean }) {
    const substitutions = stats.liveOperations?.classes || [];
    const activities = stats.recentActivities || [];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Principal KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <MetricCard
                    title="Faculty Present Today"
                    value={`${stats.staffAttendancePercentage || '95.2'}%`}
                    subValue={`${stats.totalTeachers || 0} Total Registered Faculty`}
                    icon={GraduationCap}
                    loading={loading}
                    colorClass="bg-emerald-500 shadow-emerald-200"
                />
                <MetricCard
                    title="Scholars Presence"
                    value={`${stats.attendancePercentage || '94.8'}%`}
                    subValue={`${stats.totalStudents || 0} Active Enrolled Students`}
                    icon={Users}
                    loading={loading}
                    colorClass="bg-orange-500 shadow-orange-200"
                />
                <MetricCard
                    title="Absent Faculty"
                    value={stats.todaySummary?.teachersAbsent || 0}
                    subValue="Periods Needing Coverage"
                    icon={Zap}
                    loading={loading}
                    colorClass="bg-rose-500 shadow-rose-200"
                />
                <MetricCard
                    title="Support & Queries"
                    value={stats.pendingGrievances || 0}
                    subValue="Active Faculty & Parent Tickets"
                    icon={MessageSquare}
                    loading={loading}
                    colorClass="bg-indigo-600 shadow-indigo-200"
                />
            </div>

            {/* Principal Actions */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Substitution Hub */}
                <div className="xl:col-span-8 glass-card rounded-2xl p-8 bg-white border border-slate-100 shadow-sm space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-black tracking-tight text-slate-900 font-heading uppercase">Daily Substitution Hub</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Faculty Leave & Vacant Class Management</p>
                        </div>
                        <Link href="/staff/substitution" className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2">
                            Manage Substitutions <Zap size={14} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {loading ? Array(2).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />) :
                            stats.todaySummary?.teachersAbsent > 0 ? (
                                <div className="col-span-2 p-5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black">
                                            {stats.todaySummary?.teachersAbsent}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-amber-900">Faculty Members on Leave Today</p>
                                            <p className="text-[10px] text-amber-700 mt-0.5">Click manage substitutions to allocate free teachers to empty periods</p>
                                        </div>
                                    </div>
                                    <Link href="/staff/substitution" className="px-4 py-2 bg-amber-600 text-white rounded-lg text-xs font-bold shadow-sm">
                                        Assign Now
                                    </Link>
                                </div>
                            ) : (
                                <div className="col-span-2 py-10 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    <CheckCircle size={28} className="mx-auto text-emerald-500 mb-2" />
                                    <p className="text-xs font-black text-slate-700 uppercase tracking-wide">All Classroom Periods Covered</p>
                                    <p className="text-[10px] text-slate-400 mt-1">No vacant teaching periods reported today</p>
                                </div>
                            )}
                    </div>

                    {/* Quick Governance Links */}
                    <div className="border-t border-slate-100 pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <Link href="/portal/staff-governance/attendance" className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-all text-center group">
                            <UserCheck size={18} className="mx-auto text-slate-400 group-hover:text-indigo-600 mb-1" />
                            <span className="text-[10px] font-bold text-slate-700 uppercase">Staff Logs</span>
                        </Link>
                        <Link href="/portal/staff-governance/leave-requests" className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-all text-center group">
                            <Clock size={18} className="mx-auto text-slate-400 group-hover:text-indigo-600 mb-1" />
                            <span className="text-[10px] font-bold text-slate-700 uppercase">Leave Requests</span>
                        </Link>
                        <Link href="/marks" className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-all text-center group">
                            <Award size={18} className="mx-auto text-slate-400 group-hover:text-indigo-600 mb-1" />
                            <span className="text-[10px] font-bold text-slate-700 uppercase">Exam Results</span>
                        </Link>
                        <Link href="/compliance" className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-all text-center group">
                            <FileText size={18} className="mx-auto text-slate-400 group-hover:text-indigo-600 mb-1" />
                            <span className="text-[10px] font-bold text-slate-700 uppercase">Compliance</span>
                        </Link>
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="xl:col-span-4 glass-card rounded-2xl p-6 bg-white border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-indigo-600 mb-2">
                        <Activity size={18} />
                        <h4 className="text-xs font-black uppercase tracking-wider font-heading">Recent Operational Feed</h4>
                    </div>
                    <div className="space-y-3">
                        {loading ? Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />) :
                            activities.length > 0 ? activities.map((act: any, i: number) => (
                                <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                                    <div className="flex justify-between items-center">
                                        <p className="text-xs font-bold text-slate-800 line-clamp-1">{act.title}</p>
                                        <span className="text-[9px] font-bold text-slate-400">{act.time}</span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 line-clamp-1">{act.desc}</p>
                                </div>
                            )) : (
                                <p className="text-xs text-slate-400 text-center py-8">No recent activity logs</p>
                            )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// --------------------------------------------------------------------------------------
// 3. 💼 CLERK & ACCOUNTANT FINANCIAL HUB
// --------------------------------------------------------------------------------------
function AccountantDashboard({ stats, loading }: { stats: any, loading: boolean }) {
    const fin = stats.financialSummary || {};
    const recentPayments = fin.recentPayments || [];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Financial KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <MetricCard
                    title="Today's Fee Inflow"
                    value={`₹${(fin.todayCollection || 0).toLocaleString('en-IN')}`}
                    subValue="Daily Counter Collection"
                    icon={IndianRupee}
                    loading={loading}
                    colorClass="bg-emerald-600 shadow-emerald-200"
                />
                <MetricCard
                    title="Total Session Collection"
                    value={`₹${((fin.totalCollection || 0) / 100000).toFixed(2)} Lakhs`}
                    subValue="Academic Session Total"
                    icon={TrendingUp}
                    loading={loading}
                    colorClass="bg-blue-600 shadow-blue-200"
                />
                <MetricCard
                    title="Outstanding Dues"
                    value={`₹${((fin.pendingDues || 0) / 100000).toFixed(2)} Lakhs`}
                    subValue={`${fin.defaultersCount || 0} Defaulter Accounts`}
                    icon={Wallet}
                    loading={loading}
                    colorClass="bg-rose-500 shadow-rose-200"
                />
                <MetricCard
                    title="Active Enrollment"
                    value={stats.totalStudents || 0}
                    subValue="Enrolled Fee Payers"
                    icon={Users}
                    loading={loading}
                    colorClass="bg-indigo-600 shadow-indigo-200"
                />
            </div>

            {/* Quick Action Bar for Clerk */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">Fee Counter Operations</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Quick Financial Shortcuts</p>
                </div>
                <div className="flex flex-wrap gap-2.5">
                    <Link href="/fees" className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm">
                        <IndianRupee size={14} /> Record Fee Receipt
                    </Link>
                    <Link href="/fees/structure" className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5">
                        <Layers size={14} /> Fee Structures
                    </Link>
                    <Link href="/fees/transport" className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5">
                        <Activity size={14} /> Transport Routes
                    </Link>
                    <Link href="/salary" className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5">
                        <DollarSign size={14} /> Staff Payroll Slips
                    </Link>
                    <Link href="/students/new" className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5">
                        <Plus size={14} /> New Admission
                    </Link>
                </div>
            </div>

            {/* Recent Fee Transactions */}
            <div className="glass-card rounded-2xl p-6 bg-white border border-slate-100 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-black tracking-tight text-slate-900 font-heading uppercase">Recent Fee Transactions</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Latest receipts generated at counter</p>
                    </div>
                    <Link href="/fees" className="text-xs font-bold text-indigo-600 hover:underline">
                        View All Payments →
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <th className="pb-3">Receipt No</th>
                                <th className="pb-3">Scholar Name</th>
                                <th className="pb-3">Class</th>
                                <th className="pb-3">Amount</th>
                                <th className="pb-3">Payment Mode</th>
                                <th className="pb-3">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {recentPayments.length > 0 ? recentPayments.map((p: any) => (
                                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="py-3 font-mono font-bold text-slate-600">{p.receiptNo}</td>
                                    <td className="py-3 font-bold text-slate-900">{p.studentName}</td>
                                    <td className="py-3 text-slate-500 font-semibold">{p.className}</td>
                                    <td className="py-3 font-black text-emerald-600">₹{p.amount.toLocaleString('en-IN')}</td>
                                    <td className="py-3">
                                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-700 uppercase">
                                            {p.mode}
                                        </span>
                                    </td>
                                    <td className="py-3 text-slate-400 font-medium">{p.date}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                                        No recent payment transactions recorded
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// --------------------------------------------------------------------------------------
// 4. 👩‍🏫 CLASS TEACHER ROSTER DASHBOARD
// --------------------------------------------------------------------------------------
function ClassTeacherDashboard({ user, stats, loading }: { user: any, stats: any, loading: boolean }) {
    const className = user?.class || user?.staffProfile?.class || '';
    const section = user?.section || user?.staffProfile?.section || 'A';

    // Fetch real class stats from micro-API
    const { data: classStats = null, isLoading: classStatsLoading } = useQuery<any>({
        queryKey: ['class-teacher-stats', user?.id, className, section],
        enabled: !!user && !!className,
        queryFn: () => client.get('/staff/me/class-stats'),
        staleTime: 60_000,
    });

    const totalStudents = classStats?.totalStudents ?? 0;
    const presentToday = classStats?.presentToday ?? 0;
    const absentToday = classStats?.absentToday ?? 0;
    const leaveToday = classStats?.leaveToday ?? 0;
    const attendanceMarked = classStats?.attendanceMarked ?? false;
    const attendancePct = classStats?.attendancePercentage ?? '—';
    const recentAbsent: { name: string; rollNo: string }[] = classStats?.recentAbsent ?? [];
    const boys = classStats?.genderBreakdown?.boys ?? 0;
    const girls = classStats?.genderBreakdown?.girls ?? 0;
    const statsLoading = classStatsLoading || loading;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-md flex flex-wrap items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 text-[10px] font-black uppercase tracking-widest border border-indigo-400/20">
                            Class Incharge Console
                        </span>
                        {!attendanceMarked && totalStudents > 0 && (
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/30 text-amber-300 text-[10px] font-black uppercase tracking-widest border border-amber-400/20 animate-pulse">
                                ⚠ Attendance Pending
                            </span>
                        )}
                    </div>
                    <h2 className="text-2xl font-black tracking-tight font-heading">
                        Grade {className || 'N/A'} – Section {section}
                    </h2>
                    <p className="text-xs text-slate-300 font-medium mt-1">
                        Class Incharge: <span className="text-white font-bold">{user?.name}</span>
                        {user?.subject && <span className="ml-2 opacity-70">• Subject: {user.subject}</span>}
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <Link href={`/attendance?class=${className}&section=${section}`}
                        className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5">
                        <CheckSquare size={15} /> Mark Attendance
                    </Link>
                    <Link href={`/marks?class=${className}&section=${section}`}
                        className="px-4 py-2.5 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5">
                        <Award size={15} /> Enter Marks
                    </Link>
                </div>
            </div>

            {/* 🔢 Class Strength & Attendance Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Total Students */}
                <div className="glass-card p-5 rounded-2xl bg-white border border-slate-100 shadow-sm flex flex-col gap-2">
                    <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
                        <Users size={20} />
                    </div>
                    <div>
                        {statsLoading ? <Skeleton className="h-8 w-16 rounded-lg" /> :
                            <p className="text-3xl font-black text-slate-900">{totalStudents}</p>}
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Students</p>
                        <p className="text-[10px] text-slate-400">Grade {className}-{section} Roster</p>
                    </div>
                </div>

                {/* Present Today */}
                <div className="glass-card p-5 rounded-2xl bg-white border border-emerald-100 shadow-sm flex flex-col gap-2">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-sm shadow-emerald-200">
                        <UserCheck size={20} />
                    </div>
                    <div>
                        {statsLoading ? <Skeleton className="h-8 w-16 rounded-lg" /> :
                            <p className="text-3xl font-black text-emerald-600">{attendanceMarked ? presentToday : '—'}</p>}
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Present Today</p>
                        <p className="text-[10px] text-emerald-500 font-semibold">{attendanceMarked ? `${attendancePct}% Attendance` : 'Not Marked Yet'}</p>
                    </div>
                </div>

                {/* Absent Today */}
                <div className="glass-card p-5 rounded-2xl bg-white border border-rose-100 shadow-sm flex flex-col gap-2">
                    <div className="h-10 w-10 rounded-xl bg-rose-500 flex items-center justify-center text-white shadow-sm shadow-rose-200">
                        <AlertTriangle size={20} />
                    </div>
                    <div>
                        {statsLoading ? <Skeleton className="h-8 w-16 rounded-lg" /> :
                            <p className="text-3xl font-black text-rose-500">{attendanceMarked ? absentToday : '—'}</p>}
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Absent Today</p>
                        <p className="text-[10px] text-rose-400 font-semibold">{leaveToday > 0 ? `+ ${leaveToday} On Leave` : 'No Leaves Marked'}</p>
                    </div>
                </div>

                {/* Gender Breakdown */}
                <div className="glass-card p-5 rounded-2xl bg-white border border-slate-100 shadow-sm flex flex-col gap-2">
                    <div className="h-10 w-10 rounded-xl bg-violet-500 flex items-center justify-center text-white shadow-sm shadow-violet-200">
                        <Layers size={20} />
                    </div>
                    <div>
                        {statsLoading ? <Skeleton className="h-8 w-24 rounded-lg" /> : (
                            <div className="flex items-baseline gap-1">
                                <p className="text-2xl font-black text-blue-500">{boys}</p>
                                <p className="text-xs text-slate-400 font-bold">B</p>
                                <p className="text-2xl font-black text-pink-500 ml-1">{girls}</p>
                                <p className="text-xs text-slate-400 font-bold">G</p>
                            </div>
                        )}
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gender Strength</p>
                        <p className="text-[10px] text-slate-400">Boys / Girls in Class</p>
                    </div>
                </div>
            </div>

            {/* Absent Students + Quick Actions Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Absent Students List */}
                <div className="md:col-span-2 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                        <div>
                            <h3 className="text-sm font-black uppercase text-slate-900">Today's Absent Students</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Grade {className}-{section} • {new Date().toLocaleDateString('en-IN')}</p>
                        </div>
                        <Link href={`/attendance?class=${className}&section=${section}`}
                            className="text-xs font-bold text-indigo-600 hover:underline">
                            Full Register →
                        </Link>
                    </div>

                    {statsLoading ? (
                        <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-12 rounded-xl" />)}</div>
                    ) : !attendanceMarked ? (
                        <div className="py-8 text-center">
                            <AlertTriangle className="mx-auto text-amber-400 mb-2" size={28} />
                            <p className="text-sm font-bold text-slate-500">Attendance not marked yet for today</p>
                            <Link href={`/attendance?class=${className}&section=${section}`}
                                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-all">
                                <CheckSquare size={14} /> Mark Now
                            </Link>
                        </div>
                    ) : recentAbsent.length === 0 ? (
                        <div className="py-8 text-center">
                            <CheckCircle className="mx-auto text-emerald-400 mb-2" size={28} />
                            <p className="text-sm font-bold text-slate-500">All students present today! 🎉</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {recentAbsent.map((s, i) => (
                                <div key={i} className="py-2.5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center text-xs font-black">
                                            {s.name[0]}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-900">{s.name}</p>
                                            <p className="text-[10px] text-slate-400">Roll No: {s.rollNo || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 text-[9px] font-black uppercase">Absent</span>
                                </div>
                            ))}
                            {absentToday > 5 && (
                                <div className="pt-2.5 text-center">
                                    <Link href={`/attendance?class=${className}&section=${section}`}
                                        className="text-xs text-indigo-600 font-bold hover:underline">
                                        +{absentToday - 5} more absent →
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Quick Class Actions */}
                <div className="space-y-3">
                    <Link href={`/staff/my-students?class=${className}&section=${section}`}
                        className="glass-card p-4 rounded-xl bg-white border border-slate-100 hover:border-indigo-300 transition-all group block shadow-sm">
                        <Users className="text-indigo-600 mb-2" size={20} />
                        <h4 className="text-xs font-black text-slate-900 uppercase">My Class Students</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">View all {totalStudents} scholar profiles</p>
                    </Link>
                    <Link href="/homework"
                        className="glass-card p-4 rounded-xl bg-white border border-slate-100 hover:border-orange-300 transition-all group block shadow-sm">
                        <BookOpen className="text-orange-500 mb-2" size={20} />
                        <h4 className="text-xs font-black text-slate-900 uppercase">Daily Homework Feed</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Post & manage class assignments</p>
                    </Link>
                    <Link href="/staff/my-leaves"
                        className="glass-card p-4 rounded-xl bg-white border border-slate-100 hover:border-rose-300 transition-all group block shadow-sm">
                        <Calendar className="text-rose-500 mb-2" size={20} />
                        <h4 className="text-xs font-black text-slate-900 uppercase">Apply Leave</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Submit leave petitions</p>
                    </Link>
                </div>
            </div>

            {/* My Subject Teaching Section (Class Teacher bhi subject padha sakta hai) */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
                    <div>
                        <h3 className="text-sm font-black uppercase text-slate-900 font-heading">My Subject Console</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                            {user?.subject ? `Subject: ${user.subject}` : 'All Curriculum Subjects'} • Personal Faculty Actions
                        </p>
                    </div>
                    <Link href="/marks"
                        className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm">
                        <Award size={13} /> Enter Subject Marks
                    </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Link href="/staff/my-timetable"
                        className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 transition-all text-center group block">
                        <Clock size={20} className="mx-auto text-indigo-600 mb-1.5" />
                        <h5 className="text-[11px] font-black uppercase text-slate-900">Timetable</h5>
                        <p className="text-[9px] text-slate-400 mt-0.5">My Teaching Periods</p>
                    </Link>
                    <Link href="/staff/my-attendance"
                        className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 transition-all text-center group block">
                        <Activity size={20} className="mx-auto text-emerald-600 mb-1.5" />
                        <h5 className="text-[11px] font-black uppercase text-slate-900">My Attendance</h5>
                        <p className="text-[9px] text-slate-400 mt-0.5">Personal Presence Log</p>
                    </Link>
                    <Link href="/staff/my-substitutions"
                        className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 transition-all text-center group block">
                        <Zap size={20} className="mx-auto text-indigo-600 mb-1.5" />
                        <h5 className="text-[11px] font-black uppercase text-slate-900">Substitutions</h5>
                        <p className="text-[9px] text-slate-400 mt-0.5">Assigned Coverage</p>
                    </Link>
                    <Link href="/staff/my-leaves"
                        className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-rose-50 hover:border-rose-200 transition-all text-center group block">
                        <Calendar size={20} className="mx-auto text-rose-500 mb-1.5" />
                        <h5 className="text-[11px] font-black uppercase text-slate-900">Apply Leave</h5>
                        <p className="text-[9px] text-slate-400 mt-0.5">Leave Petitions</p>
                    </Link>
                </div>
            </div>
        </div>
    );
}

// --------------------------------------------------------------------------------------
// 5. 📖 SUBJECT TEACHER CONSOLE

// --------------------------------------------------------------------------------------
function SubjectTeacherDashboard({ user, stats, loading }: { user: any, stats: any, loading: boolean }) {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Welcome */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-500/20">
                        {user?.name?.[0] || 'T'}
                    </div>
                    <div>
                        <h2 className="text-xl font-black tracking-tight text-slate-900 font-heading">
                            Welcome, {user?.name || 'Faculty Member'}
                        </h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                            Academic Subject Faculty • {user?.designation || 'Teacher'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Link href="/homework" className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm">
                        <Plus size={14} /> Post Homework
                    </Link>
                    <Link href="/marks" className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm">
                        <Award size={14} /> Enter Subject Marks
                    </Link>
                </div>
            </div>

            {/* Faculty Quick Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard
                    title="My Attendance Pulse"
                    value={stats.personalStats?.attendance ? `${stats.personalStats.attendance}%` : "100%"}
                    subValue={`${stats.personalStats?.presentDays || 22} Days Logged Present`}
                    icon={Activity}
                    loading={loading}
                    colorClass="bg-emerald-600 shadow-emerald-200"
                />
                <MetricCard
                    title="Daily Homework Uploaded"
                    value={stats.todaySummary?.homeworkPending || 0}
                    subValue="Active Assignments"
                    icon={BookOpen}
                    loading={loading}
                    colorClass="bg-orange-500 shadow-orange-200"
                />
                <MetricCard
                    title="Substitutions Assigned"
                    value={stats.activeSubstitutions || 0}
                    subValue="Substitution Duties"
                    icon={Zap}
                    loading={loading}
                    colorClass="bg-indigo-600 shadow-indigo-200"
                />
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/staff/my-timetable" className="glass-card p-5 rounded-2xl bg-white border border-slate-100 hover:border-indigo-300 transition-all text-center group block shadow-sm">
                    <Clock size={24} className="mx-auto text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
                    <h4 className="text-xs font-black uppercase text-slate-900">Weekly Timetable</h4>
                    <p className="text-[10px] text-slate-400 mt-1">View class periods schedule</p>
                </Link>

                <Link href="/homework" className="glass-card p-5 rounded-2xl bg-white border border-slate-100 hover:border-indigo-300 transition-all text-center group block shadow-sm">
                    <BookOpen size={24} className="mx-auto text-orange-500 mb-2 group-hover:scale-110 transition-transform" />
                    <h4 className="text-xs font-black uppercase text-slate-900">Post Homework</h4>
                    <p className="text-[10px] text-slate-400 mt-1">Upload daily assignments</p>
                </Link>

                <Link href="/marks" className="glass-card p-5 rounded-2xl bg-white border border-slate-100 hover:border-indigo-300 transition-all text-center group block shadow-sm">
                    <Award size={24} className="mx-auto text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
                    <h4 className="text-xs font-black uppercase text-slate-900">Subject Marks</h4>
                    <p className="text-[10px] text-slate-400 mt-1">Enter examination scores</p>
                </Link>

                <Link href="/staff/my-leaves" className="glass-card p-5 rounded-2xl bg-white border border-slate-100 hover:border-indigo-300 transition-all text-center group block shadow-sm">
                    <Calendar size={24} className="mx-auto text-rose-500 mb-2 group-hover:scale-110 transition-transform" />
                    <h4 className="text-xs font-black uppercase text-slate-900">Apply Leave</h4>
                    <p className="text-[10px] text-slate-400 mt-1">Manage leave petitions</p>
                </Link>
            </div>
        </div>
    );
}

// --------------------------------------------------------------------------------------
// MAIN EXPORT & ROLE RESOLUTION
// --------------------------------------------------------------------------------------
export default function Dashboard() {
    const { user, loading: authLoading } = useAuth();
    const { session: selectedSession } = useSessionContext();
    const router = useRouter();
    const [chartView, setChartView] = useState<'weekly' | 'monthly'>('weekly');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const { data: stats = {}, isLoading: dataLoading } = useQuery({
        queryKey: ['admin-dashboard', selectedSession, user?.id, user?.role],
        queryFn: async () => {
            if (!user) return {};
            const res = await client.get(`/reports/dashboard-summary?session=${encodeURIComponent(selectedSession)}`).catch(() => ({}));
            return res;
        },
        enabled: !!user && !authLoading,
        staleTime: 0,
        refetchOnMount: true,
        placeholderData: (previousData) => previousData,
    });

    const loading = authLoading || dataLoading;
    const normalizedRole = (user?.role || '').trim().toUpperCase();
    const userClass = user?.class || user?.staffProfile?.class || (typeof window !== 'undefined' ? localStorage.getItem(APP_CONFIG.auth.tokens.class) : '') || '';
    const isClassTeacher = (normalizedRole === 'TEACHER' || normalizedRole === 'CLASS_TEACHER') && Boolean(userClass && userClass !== 'NONE' && userClass !== '');
    const isSubjectTeacher = (normalizedRole === 'TEACHER' || normalizedRole === 'CLASS_TEACHER') && !isClassTeacher;
    const isAccountant = normalizedRole === 'ACCOUNTANT' || normalizedRole === 'CLERK';
    const isPrincipal = normalizedRole === 'PRINCIPAL' || normalizedRole === 'VICE_PRINCIPAL' || normalizedRole === 'MANAGEMENT';
    const isSystemAdmin = normalizedRole === 'ADMIN' || normalizedRole === 'SUPER_ADMIN';

    const enrichedUser = {
        ...user,
        class: userClass,
        section: user?.section || user?.staffProfile?.section || 'A',
        name: user?.name || user?.staffProfile?.name || 'Faculty Member',
        designation: user?.designation || user?.staffProfile?.designation || 'Teacher',
        subject: user?.subject || user?.staffProfile?.subject || 'All Subjects',
    };

    if (!mounted || authLoading) {
        return (
            <div className="p-6 md:p-8 space-y-8 bg-[#F5F7FB] min-h-screen font-sans">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="glass-card p-6 rounded-2xl bg-white shadow-sm flex items-center gap-5 border border-slate-100">
                            <Skeleton className="h-14 w-14 rounded-2xl" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-8 w-28" />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="h-80 rounded-2xl bg-white p-6 shadow-sm border border-slate-100 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="h-8 w-8 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Dashboard...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 space-y-6 bg-[#F5F7FB] min-h-screen font-sans">
            {isClassTeacher ? (
                <ClassTeacherDashboard user={enrichedUser} stats={stats} loading={loading} />
            ) : isSubjectTeacher ? (
                <SubjectTeacherDashboard user={enrichedUser} stats={stats} loading={loading} />
            ) : isAccountant ? (
                <AccountantDashboard stats={stats} loading={loading} />
            ) : isPrincipal ? (
                <PrincipalDashboard stats={stats} loading={loading} />
            ) : (
                <AdminDecisionDashboard stats={stats} loading={loading} chartView={chartView} setChartView={setChartView} />
            )}

            {/* Bottom System Integrity Footer */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm font-sans">
                <div className="flex items-center gap-3">
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[3px]">System Operating Smoothly</span>
                </div>
                <div className="flex items-center gap-6">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[4px] hidden sm:block font-heading">
                        {APP_CONFIG.institution.name} Hub
                    </p>
                    <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300">
                        <ShieldCheck size={16} />
                    </div>
                </div>
            </div>
        </div>
    );
}
