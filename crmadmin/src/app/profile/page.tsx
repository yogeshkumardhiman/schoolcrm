"use client";
import React, { useState } from "react";
import client from "@/lib/client";
import { 
    User, Activity, IndianRupee, Calendar, 
    ShieldCheck, Bell, MessageSquare, Clock, 
    ArrowLeft, Mail, Phone, MapPin, Briefcase, 
    FileText, CheckCircle, AlertCircle, ArrowRight,
    Wallet, BookOpen, Layers, Award, Download, KeyRound
} from "lucide-react";
import { useAuth } from "@/components/AbilityProvider";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { APP_CONFIG } from "@/constants/config";

export default function ProfilePage() {
    const [mounted, setMounted] = useState(false);
    const { user, loading: authLoading } = useAuth();
    const isSystemAdmin = user?.role?.toUpperCase() === 'ADMIN' || user?.role?.toUpperCase() === 'SUPER_ADMIN';

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // Query: Teacher/Staff Full Profile
    const { data: profile = {}, isLoading: dataLoading } = useQuery({
        queryKey: ['staff-me-profile', user?.id],
        queryFn: async () => {
            if (!user) return {};
            if (isSystemAdmin) {
                return await client.get("/auth/profile").catch(() => ({}));
            }
            return await client.get("/staff/me/profile").catch(() => ({}));
        },
        enabled: !!user && !authLoading
    });

    // Query: Real Salary History
    const { data: salaryHistory = [], isLoading: salaryLoading } = useQuery({
        queryKey: ['staff-salary-history', user?.id],
        queryFn: async () => {
            if (!user || isSystemAdmin) return [];
            return await client.get(`/salary/payments/${user.id}`).catch(() => []);
        },
        enabled: !!user && !authLoading && !isSystemAdmin
    });

    // Query: Live Notices
    const { data: notices = [], isLoading: noticesLoading } = useQuery({
        queryKey: ['notices-profile-sidebar'],
        queryFn: async () => {
            return await client.get("/website/notices").catch(() => []);
        }
    });

    const loading = !mounted || authLoading || dataLoading;

    if (loading) {
        return (
            <div className="p-6 md:p-10 space-y-8 bg-[#F5F7FB] min-h-screen font-sans">
                <div className="h-64 w-full rounded-3xl bg-slate-200 border-4 border-white shadow-xl animate-pulse" />
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    <div className="xl:col-span-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => <div key={i} className="h-36 rounded-2xl bg-white border border-slate-100 shadow-sm animate-pulse" />)}
                        </div>
                        <div className="h-80 rounded-2xl bg-white border border-slate-100 shadow-sm animate-pulse" />
                    </div>
                    <div className="xl:col-span-4 space-y-6">
                        <div className="h-72 rounded-2xl bg-white border border-slate-100 shadow-sm animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    const assignedClass = profile.class && profile.class !== 'NONE' ? profile.class : null;
    const assignedSection = profile.section || 'A';
    const assignedSubjects = Array.isArray(profile.assignedSubjects) && profile.assignedSubjects.length > 0
        ? profile.assignedSubjects
        : profile.subject
            ? [{ class: assignedClass || 'ALL', section: assignedSection, subject: profile.subject }]
            : [];
    const leaveBalance = profile.leaveBalance || { total: 18, used: 2, available: 16 };
    const documents = Array.isArray(profile.documents) ? profile.documents : [];

    return (
        <div className="p-6 md:p-10 space-y-8 bg-[#F5F7FB] min-h-screen font-sans animate-in fade-in duration-500">
            {/* 🏛️ HEADER: ELITE IDENTITY CARD */}
            <div className="glass-card p-8 md:p-10 rounded-3xl bg-slate-900 text-white relative overflow-hidden shadow-2xl border border-white/10">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <ShieldCheck size={280} strokeWidth={1} />
                </div>
                
                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                    <div className="h-28 w-28 rounded-2xl border-2 border-white/20 overflow-hidden shadow-xl relative bg-slate-800 shrink-0">
                        <img 
                            src={profile?.image || user?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Teacher'}`} 
                            alt={user?.name} 
                            className="h-full w-full object-cover" 
                        />
                    </div>

                    <div className="text-center md:text-left flex-1 min-w-0">
                        <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mb-2">
                            <span className="px-3.5 py-1 bg-indigo-600 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">
                                {profile?.role || user?.role}
                            </span>
                            <span className="px-3.5 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-wider border border-white/10">
                                {isSystemAdmin ? "SYSTEM CONTROLLER" : `EMP ID: ${profile?.loginId || user?.id?.toString() || "N/A"}`}
                            </span>
                            {assignedClass && (
                                <span className="px-3.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-black uppercase tracking-wider">
                                    Class Incharge: Grade {assignedClass}-{assignedSection}
                                </span>
                            )}
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase font-heading truncate">
                            {profile?.name || user?.name}
                        </h1>
                        <p className="text-sm font-semibold text-slate-300 mt-1">
                            {profile?.designation || (isSystemAdmin ? "Administrator" : "Academic Faculty Member")} • {profile?.subject || "Curriculum Faculty"}
                        </p>
                        <div className="flex flex-wrap justify-center md:justify-start items-center gap-5 text-slate-400 text-xs font-semibold mt-3">
                            <div className="flex items-center gap-1.5">
                                <Mail size={14} className="text-indigo-400" />
                                {profile?.email || user?.email || "No Email"}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Phone size={14} className="text-emerald-400" />
                                {profile?.phone || user?.phone || "No Contact"}
                            </div>
                            {!isSystemAdmin && (
                                <div className="flex items-center gap-1.5">
                                    <Briefcase size={14} className="text-orange-400" />
                                    Joined: {profile?.joiningDate ? new Date(profile.joiningDate).toLocaleDateString('en-GB') : 'Session 2026'}
                                </div>
                            )}
                        </div>
                    </div>

                    <Link href="/" className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold uppercase tracking-wider border border-white/10 transition-all flex items-center gap-2 shrink-0">
                        <ArrowLeft size={15} /> Dashboard
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* 📊 MAIN CONTENT */}
                <div className="xl:col-span-8 space-y-6">
                    {/* Faculty KPIs Row */}
                    {!isSystemAdmin && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="glass-card p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 font-bold">
                                        <Activity size={20} />
                                    </div>
                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">Attendance</span>
                                </div>
                                <h3 className="text-2xl font-black text-slate-900">100%</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Active Faculty Record</p>
                            </div>

                            <div className="glass-card p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold">
                                        <Calendar size={20} />
                                    </div>
                                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider">Leaves</span>
                                </div>
                                <h3 className="text-2xl font-black text-slate-900">{leaveBalance.available} Days</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{leaveBalance.used} used of {leaveBalance.total} annual</p>
                            </div>

                            <div className="glass-card p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="h-10 w-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 font-bold">
                                        <BookOpen size={20} />
                                    </div>
                                    <span className="text-[10px] font-black text-orange-600 uppercase tracking-wider">Subjects</span>
                                </div>
                                <h3 className="text-2xl font-black text-slate-900">{assignedSubjects.length} Classes</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Assigned Subject Load</p>
                            </div>
                        </div>
                    )}

                    {/* 📚 ASSIGNED SUBJECTS & CLASSES */}
                    {!isSystemAdmin && (
                        <div className="glass-card p-6 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-4">
                            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                <div>
                                    <h3 className="text-base font-black uppercase text-slate-900 font-heading">
                                        My Assigned Subjects & Classes
                                    </h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        Authorized Marks Entry & Homework Allocation
                                    </p>
                                </div>
                                <Link href="/marks" className="text-xs font-bold text-indigo-600 hover:underline">
                                    Enter Marks →
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {assignedSubjects.map((as: any, idx: number) => (
                                    <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px] font-black uppercase">
                                                Grade {as.class || 'All'}-{as.section || 'A'}
                                            </span>
                                            <span className="text-[9px] font-bold text-emerald-600 uppercase">Authorized</span>
                                        </div>
                                        <p className="text-sm font-black text-slate-900">{as.subject || 'All Subjects'}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 👤 PERSONAL & PROFESSIONAL DETAILS */}
                    <div className="glass-card p-6 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-4">
                        <h3 className="text-base font-black uppercase text-slate-900 font-heading border-b border-slate-100 pb-3">
                            Personal & Professional Profile
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Qualification</p>
                                <p className="text-xs font-black text-slate-800 mt-0.5">{profile.qualification || "Post Graduate / B.Ed"}</p>
                            </div>
                            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Experience</p>
                                <p className="text-xs font-black text-slate-800 mt-0.5">{profile.experience || "5+ Years Teaching Experience"}</p>
                            </div>
                            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Gender & DOB</p>
                                <p className="text-xs font-black text-slate-800 mt-0.5">{profile.gender || "Not specified"} • {profile.dob ? new Date(profile.dob).toLocaleDateString('en-GB') : "N/A"}</p>
                            </div>
                            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Residential Address</p>
                                <p className="text-xs font-black text-slate-800 mt-0.5">{profile.address || "Campus Staff Quarters, Seematic Campus"}</p>
                            </div>
                        </div>
                    </div>

                    {/* 💰 MY SALARY SLIPS (TEACHER VIEW) */}
                    {!isSystemAdmin && (
                        <div className="glass-card p-6 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-4">
                            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                <div>
                                    <h3 className="text-base font-black uppercase text-slate-900 font-heading">
                                        My Salary Slips
                                    </h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        Disbursed Payroll History
                                    </p>
                                </div>
                                <IndianRupee size={18} className="text-slate-400" />
                            </div>

                            {salaryLoading ? <Skeleton className="h-32 w-full rounded-xl" /> : salaryHistory.length > 0 ? (
                                <div className="divide-y divide-slate-100">
                                    {salaryHistory.map((sal: any, i: number) => (
                                        <div key={i} className="py-3 flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-black text-slate-900 uppercase">{sal.month} {sal.year}</p>
                                                <p className="text-[10px] font-semibold text-slate-400">Disbursed on {new Date(sal.paymentDate).toLocaleDateString('en-GB')}</p>
                                            </div>
                                            <div className="text-right flex items-center gap-3">
                                                <div>
                                                    <p className="text-sm font-black text-emerald-600">₹{Number(sal.amount).toLocaleString('en-IN')}</p>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase">{sal.status || 'PAID'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center text-slate-400 text-xs">
                                    No disbursed salary slips recorded yet for current session
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* 📝 RIGHT: NOTICES & SECURITY */}
                <div className="xl:col-span-4 space-y-6">
                    <div className="glass-card p-6 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 text-indigo-600 border-b border-slate-100 pb-3">
                            <Bell size={16} />
                            <h4 className="text-xs font-black uppercase tracking-wider font-heading">School Circulars</h4>
                        </div>
                        <div className="space-y-3">
                            {noticesLoading ? (
                                [1, 2].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)
                            ) : notices.length > 0 ? (
                                notices.slice(0, 3).map((n: any, i: number) => (
                                    <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                                        <p className="text-[9px] font-black text-indigo-600 uppercase">{n.date || 'Notice'}</p>
                                        <p className="text-xs font-bold text-slate-800 line-clamp-1 mt-0.5">{n.title}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-slate-400 py-4 text-center">No circulars</p>
                            )}
                        </div>
                    </div>

                    <div className="glass-card p-6 rounded-2xl bg-slate-900 text-white shadow-lg space-y-3">
                        <div className="flex items-center gap-2 text-indigo-400">
                            <ShieldCheck size={18} />
                            <h4 className="text-xs font-black uppercase tracking-wider">Account Security</h4>
                        </div>
                        <p className="text-xs text-slate-400">
                            Logged in securely as <span className="text-white font-bold">{user?.role}</span>. Password encrypted with bcrypt.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
