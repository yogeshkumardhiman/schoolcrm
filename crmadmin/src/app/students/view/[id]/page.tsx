"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@bprogress/next/app";
import Link from "next/link";
import client from "@/lib/client";
import {
  ArrowLeft,
  MapPin,
  Phone,
  ShieldCheck,
  Users as UsersIcon,
  CreditCard,
  Edit3,
  Bus,
  CheckCircle2,
  AlertCircle,
  Trophy,
  Calendar,
  ClipboardList,
  FileText,
  Mail,
  History,
  Star,
  Plus,
  ChevronDown,
  Loader2,
  User,
  Home,
  Info,
  GraduationCap,
  Wallet,
  Clock,
  Activity,
  Eye,
  Download,
  ExternalLink,
  FileCheck,
  Copy,
  Check,
  Building,
  Sparkles,
  HeartPulse,
  Receipt
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { useAuth } from "@/components/AbilityProvider";
import { APP_CONFIG } from "@/constants/config";
import { AllocateMarksModal } from "@/features/academic";
import { SendStudentMessageModal, StudentAttendanceModal } from "@/features/students";
import { LogTimelineActivityModal } from "@/features/reports";
import { AssignStudentTransportModal } from "@/features/transport";
import { AdmissionFeeSlipModal } from "@/features/fees";
import { DocumentViewerModal } from "@/components/ui/DocumentViewerModal";

export default function ViewStudentPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const userRole = user?.role || "";
  const isTeacher = userRole === "TEACHER" || userRole === "CLASS_TEACHER";

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copiedPin, setCopiedPin] = useState(false);

  // Modals visibility states
  const [isMarksModalOpen, setIsMarksModalOpen] = useState(false);
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [isTransportOpen, setIsTransportOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isAdmissionSlipOpen, setIsAdmissionSlipOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<{
    title: string;
    url: string;
    isPdf?: boolean;
  } | null>(null);

  useEffect(() => {
    if (id) {
      fetchDashboardData();
    }
  }, [id]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await client.get(`/students/${id as string}`);
      setData(res);
    } catch (err) {
      toast.error("Failed to load student telemetry profile.");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "SC"
    );
  };

  const parseAddress = (rawAddress: any) => {
    if (!rawAddress) return null;
    if (typeof rawAddress === "object") return rawAddress;
    try {
      const parsed = JSON.parse(rawAddress);
      if (typeof parsed === "object" && parsed !== null) return parsed;
    } catch (e) {
      // plain text string
    }
    return { addressLine1: String(rawAddress) };
  };

  const calculateAge = (dobString?: string) => {
    if (!dobString) return null;
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return null;
    const diffMs = Date.now() - dob.getTime();
    const ageDt = new Date(diffMs);
    return Math.abs(ageDt.getUTCFullYear() - 1970);
  };

  const formatAadhaar = (val?: string) => {
    if (!val) return "Not Provided";
    const cleaned = val.replace(/\D/g, "");
    if (cleaned.length === 12) {
      return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 8)} ${cleaned.slice(8)}`;
    }
    return val;
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-slate-50/40 p-6 md:p-10 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-44 rounded-xl" />
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-4 space-y-6">
            <Skeleton className="h-[480px] w-full rounded-2xl" />
            <Skeleton className="h-44 w-full rounded-2xl" />
          </div>
          <div className="xl:col-span-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Skeleton className="h-32 w-full rounded-2xl" />
              <Skeleton className="h-32 w-full rounded-2xl" />
              <Skeleton className="h-32 w-full rounded-2xl" />
            </div>
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-80 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  const student = data?.student || (data?.id ? data : null);
  if (!student) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-10 text-center">
        <div className="h-16 w-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
          Scholar Record Not Found
        </h2>
        <p className="text-xs font-semibold text-slate-500 mt-1 max-w-sm">
          The requested student does not exist in the institutional registry or was purged.
        </p>
        <Button
          onClick={() => router.push("/students")}
          className="mt-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider h-11 px-6"
        >
          <ArrowLeft size={16} className="mr-2" /> Return to Directory
        </Button>
      </div>
    );
  }

  const structuredAddress = parseAddress(student.address);
  const studentAge = calculateAge(student.dob);

  const finance = {
    summary: {
      dueAmount: 0,
      finalAmount: 0,
      discountValue: 0,
      ...(data?.finance?.summary || {})
    },
    payments: Array.isArray(data?.finance?.payments) ? data.finance.payments : [],
    history: Array.isArray(data?.finance?.history)
      ? data.finance.history
      : Array.isArray(data?.finance?.payments)
      ? data.finance.payments
      : []
  };

  const academic = Array.isArray(data?.academic) ? data.academic : [];
  const homework = Array.isArray(data?.homework) ? data.homework : [];
  const attendance = Array.isArray(data?.attendance) ? data.attendance : [];

  const rawDocuments = Array.isArray(student.documents)
    ? student.documents
    : Array.isArray(data?.documents)
    ? data.documents
    : [];

  const timelineEvents = [
    // 1. Fee Payments
    ...(finance?.payments || []).map((p: any) => ({
      type: "FINANCE",
      title: "Fee Payment Verified",
      description: `Payment of ₹${p.amount || p.amountPaid} credited for ${p.month || "Academic Session"}`,
      date: p.date || p.paymentDate || p.createdAt,
      icon: CreditCard,
      color: "bg-emerald-50 text-emerald-600 border-emerald-100"
    })),
    // 2. Exam Results
    ...academic.map((r: any) => ({
      type: "ACADEMIC",
      title: `Exam Score Released: ${r.subject}`,
      description: `Scored ${r.marks}/${r.total} marks in ${r.examType}`,
      date: r.createdAt || r.date,
      icon: Trophy,
      color: "bg-amber-50 text-amber-600 border-amber-100"
    })),
    // 3. Homework Assignments
    ...homework.map((hw: any) => ({
      type: "HOMEWORK",
      title: "Homework Assigned",
      description: `Subject: ${hw.homework?.subject || "General"} - Title: ${hw.homework?.title || ""}`,
      date: hw.createdAt,
      icon: ClipboardList,
      color: "bg-indigo-50 text-indigo-600 border-indigo-100"
    })),
    // 4. Attendance
    ...attendance.slice(0, 10).map((att: any) => ({
      type: "ATTENDANCE",
      title: "Attendance Recorded",
      description: `Marked ${att.status} for session date ${att.date}`,
      date: att.createdAt || att.date,
      icon: Calendar,
      color:
        att.status === "PRESENT"
          ? "bg-teal-50 text-teal-600 border-teal-100"
          : "bg-rose-50 text-rose-600 border-rose-100"
    }))
  ].sort(
    (a: any, b: any) =>
      new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
  );

  const attendanceTotal = attendance.length;
  const attendancePresent = attendance.filter(
    (a: any) => a.status === "PRESENT"
  ).length;
  const attendancePercent =
    attendanceTotal > 0
      ? Math.round((attendancePresent / attendanceTotal) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-slate-50/40 pb-20 animate-in fade-in duration-500">
      {/* 🏙️ TOP NAVIGATION BAR */}
      <div className="bg-white/90 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 w-full transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="hover:bg-slate-100 rounded-xl h-10 w-10 transition-all active:scale-95 border border-slate-200/60"
            >
              <ArrowLeft size={18} className="text-slate-700" />
            </Button>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight uppercase">
                  {student.name}
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase">
                  Active
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Scholar ID: <span className="text-slate-800 font-black">{student.admissionNo}</span>
                </span>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span className="text-[11px] font-black text-indigo-600 uppercase tracking-wider">
                  Grade {student.class}-{student.section || "A"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isTeacher ? (
              user?.class && user.class.toUpperCase() === student?.class?.toUpperCase() && (user?.section || "A").toUpperCase() === (student?.section || "A").toUpperCase() ? (
                <Badge className="hidden sm:inline-flex bg-emerald-700 text-white font-black text-[9px] uppercase tracking-[2px] px-3.5 py-1.5 rounded-lg border-none shadow-sm">
                  Class Incharge · Grade {student.class}-{student.section || "A"}
                </Badge>
              ) : (
                <Badge className="hidden sm:inline-flex bg-indigo-700 text-white font-black text-[9px] uppercase tracking-[2px] px-3.5 py-1.5 rounded-lg border-none shadow-sm">
                  Subject Faculty{user?.subject ? ` · ${user.subject}` : ""}
                </Badge>
              )
            ) : (
              <Badge className="hidden sm:inline-flex bg-slate-950 text-white font-black text-[9px] uppercase tracking-[2px] px-3.5 py-1.5 rounded-lg border-none">
                {userRole || "ADMIN"}
              </Badge>
            )}
            {!isTeacher && (
              <Button
                onClick={() => router.push(`/students/edit/${id}`)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white h-10 px-5 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-indigo-100 active:scale-95 flex items-center gap-2"
              >
                <Edit3 size={14} /> Edit Profile
              </Button>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-10 grid grid-cols-1 xl:grid-cols-12 gap-8 w-full">
        {/* 🏛️ LEFT COLUMN: SCHOLAR IDENTITY & SYSTEM PROFILE (4 cols) */}
        <div className="xl:col-span-4 space-y-6">
          {/* SCHOLAR ID CARD */}
          <Card className="border-none shadow-xl shadow-slate-200/60 overflow-hidden rounded-3xl bg-white ring-1 ring-slate-100">
            <div className="h-36 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 relative">
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
              <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/15 text-white text-[10px] font-black uppercase tracking-widest">
                <Sparkles size={11} className="text-amber-300" /> Scholar Dossier
              </div>
            </div>
            <CardContent className="relative pt-0 px-6 sm:px-8 pb-8">
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <div className="w-28 h-36 sm:w-32 sm:h-40 rounded-2xl border-4 border-white bg-white shadow-2xl overflow-hidden ring-1 ring-slate-200/80 group relative">
                  {student.image ? (
                    <img
                      src={student.image}
                      alt={student.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center text-indigo-600 font-black text-3xl">
                      {getInitials(student.name)}
                    </div>
                  )}
                  <div className="absolute bottom-1.5 right-1.5 bg-slate-950/80 backdrop-blur-xs text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md shadow-xs">
                    35×45mm
                  </div>
                </div>
              </div>

              <div className="mt-24 text-center border-b border-slate-100 pb-6">
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                  {student.name}
                </h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                  Roll No: <span className="text-slate-700 font-black">{student.rollNo || "N/A"}</span>
                </p>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 uppercase tracking-wider text-[10px] font-black px-3 py-1 rounded-lg">
                    Class {student.class}
                  </Badge>
                  <Badge variant="outline" className="uppercase tracking-wider text-[10px] font-black border-slate-200 px-3 py-1 rounded-lg text-slate-600">
                    Section {student.section || "A"}
                  </Badge>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 uppercase tracking-wider text-[10px] font-black px-3 py-1 rounded-lg">
                    {student.session || "2026-2027"}
                  </Badge>
                </div>
              </div>

              {/* DIRECT CONTACT & COMMUNICATION */}
              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-50/80 border border-slate-100 hover:bg-slate-50 transition-colors">
                  <div className="h-9 w-9 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center shrink-0 text-indigo-600 shadow-xs">
                    <Phone size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      Primary Contact Number
                    </p>
                    <p className="text-xs font-black text-slate-900 tracking-tight mt-0.5">
                      {student.phone ? `+91 ${student.phone}` : "Not Registered"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-50/80 border border-slate-100 hover:bg-slate-50 transition-colors">
                  <div className="h-9 w-9 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center shrink-0 text-indigo-600 shadow-xs">
                    <Mail size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      Parent / Official Email
                    </p>
                    <p className="text-xs font-black text-slate-900 truncate mt-0.5">
                      {student.email || "No email registered"}
                    </p>
                  </div>
                </div>
              </div>

              {/* QUICK ACTION BUTTONS */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button
                  onClick={() => setIsTimelineOpen(true)}
                  variant="outline"
                  className="h-11 border-slate-200 rounded-xl font-black text-[10px] uppercase tracking-wider hover:bg-slate-50"
                >
                  <History size={14} className="mr-1.5" /> Timeline
                </Button>
                <Button
                  onClick={() => setIsMessageOpen(true)}
                  className="h-11 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black text-[10px] uppercase tracking-wider"
                >
                  <Mail size={14} className="mr-1.5" /> Message
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* FAMILY & GUARDIAN PROFILE */}
          <Card className="border-none shadow-md shadow-slate-100 rounded-3xl bg-white overflow-hidden ring-1 ring-slate-100">
            <CardHeader className="bg-slate-50/60 py-4 px-6 border-b border-slate-100">
              <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                <UsersIcon size={15} className="text-indigo-600" /> Guardian & Family Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Father's Name
                </span>
                <span className="text-xs font-black text-slate-900 uppercase">
                  {student.fatherName || "Not Recorded"}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Mother's Name
                </span>
                <span className="text-xs font-black text-slate-900 uppercase">
                  {student.motherName || "Not Recorded"}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Emergency Phone
                </span>
                <span className="text-xs font-black text-slate-900">
                  {student.phone ? `+91 ${student.phone}` : "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Guardian Status
                </span>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[9px] font-black uppercase tracking-wider">
                  Primary Verified
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* RESIDENTIAL & ADDRESS MATRIX */}
          <Card className="border-none shadow-md shadow-slate-100 rounded-3xl bg-white overflow-hidden ring-1 ring-slate-100">
            <CardHeader className="bg-slate-50/60 py-4 px-6 border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                <Home size={15} className="text-indigo-600" /> Residential Address
              </CardTitle>
              {structuredAddress?.pincode && (
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${structuredAddress?.addressLine1 || ""} ${structuredAddress?.city || ""} ${structuredAddress?.state || ""} ${structuredAddress?.pincode || ""}`
                    );
                    setCopiedPin(true);
                    setTimeout(() => setCopiedPin(false), 2000);
                  }}
                  className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                >
                  {copiedPin ? <Check size={12} /> : <Copy size={12} />} {copiedPin ? "Copied" : "Copy"}
                </button>
              )}
            </CardHeader>
            <CardContent className="p-6 space-y-3.5">
              {structuredAddress ? (
                <>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      House / Village / Street
                    </p>
                    <p className="text-xs font-bold text-slate-800">
                      {structuredAddress.addressLine1 || student.address || "Not specified"}
                    </p>
                  </div>
                  {structuredAddress.addressLine2 && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        Post Office / Landmark
                      </p>
                      <p className="text-xs font-bold text-slate-800">
                        {structuredAddress.addressLine2}
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-50">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        City / Tehsil
                      </p>
                      <p className="text-xs font-black text-slate-800 uppercase">
                        {structuredAddress.city || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        District
                      </p>
                      <p className="text-xs font-black text-slate-800 uppercase">
                        {structuredAddress.district || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-50">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        State
                      </p>
                      <p className="text-xs font-black text-slate-800 uppercase">
                        {structuredAddress.state || "Uttar Pradesh"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        PIN Code
                      </p>
                      <Badge variant="outline" className="font-mono text-xs font-black text-indigo-700 bg-indigo-50/50 border-indigo-200">
                        {structuredAddress.pincode || "N/A"}
                      </Badge>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-xs font-bold text-slate-500">
                  {student.address || "No residential address provided."}
                </p>
              )}
            </CardContent>
          </Card>

          {/* LOGISTICS & TRANSPORT MATRIX */}
          <Card className="border-none shadow-md shadow-slate-100 rounded-3xl bg-white overflow-hidden ring-1 ring-slate-100">
            <CardHeader className="bg-slate-50/60 py-4 px-6 border-b border-slate-100">
              <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                <Bus size={15} className="text-indigo-600" /> Operational & Transport
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Transport Status
                </span>
                <div className="flex items-center gap-2">
                  <Badge
                    className={cn(
                      "font-black text-[9px] uppercase tracking-wider",
                      student.transportOpted || student.usesTransport
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                        : "bg-slate-50 text-slate-400 border-slate-100"
                    )}
                  >
                    {student.transportOpted || student.usesTransport
                      ? "Enrolled (Active)"
                      : "Self Commute"}
                  </Badge>
                  <Button
                    onClick={() => setIsTransportOpen(true)}
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-slate-400 hover:text-indigo-600 rounded-lg"
                  >
                    <Edit3 size={12} />
                  </Button>
                </div>
              </div>

              <div className="flex justify-between items-center py-1.5 border-t border-slate-50">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Admission Date
                </span>
                <span className="text-xs font-black text-slate-800">
                  {student.createdAt
                    ? new Date(student.createdAt).toLocaleDateString("en-GB")
                    : "Recent"}
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-t border-slate-50">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Institutional Status
                </span>
                <Badge className="bg-indigo-600 text-white font-black text-[8px] uppercase tracking-[2px]">
                  Verified Scholar
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 🚀 RIGHT COLUMN: 360-DEGREE REGISTRIES, VAULT & PERFORMANCE (8 cols) */}
        <div className="xl:col-span-8 space-y-8">
          {/* 📊 TOP 3 KPI CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Card
              onClick={() => setIsAttendanceModalOpen(true)}
              className="border-none shadow-md shadow-slate-100 rounded-3xl bg-white ring-1 ring-slate-100 p-6 hover:ring-2 hover:ring-emerald-500/30 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="h-11 w-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Activity size={20} />
                </div>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 font-black text-[9px] uppercase tracking-wider group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  Attendance Details →
                </Badge>
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                {attendancePercent}%
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                {attendancePresent} of {attendanceTotal} Sessions Present
              </p>
              <div className="mt-3.5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                  style={{ width: `${attendancePercent}%` }}
                />
              </div>
              <p className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-wider mt-2.5 flex items-center gap-1">
                Click to view month-wise logs →
              </p>
            </Card>

            <Card className="border-none shadow-md shadow-slate-100 rounded-3xl bg-white ring-1 ring-slate-100 p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="h-11 w-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <GraduationCap size={20} />
                </div>
                <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 font-black text-[9px] uppercase tracking-wider">
                  Academics
                </Badge>
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                {academic.length > 0 ? `${academic.length} Exams` : "In Evaluation"}
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                Session {student.session || "2026-2027"}
              </p>
              <Button
                onClick={() => setIsMarksModalOpen(true)}
                variant="ghost"
                className="mt-2 text-[10px] font-black text-indigo-600 hover:text-indigo-800 p-0 h-auto cursor-pointer"
              >
                + Allocate Marks
              </Button>
            </Card>

            <Card className="border-none shadow-md shadow-slate-100 rounded-3xl bg-white ring-1 ring-slate-100 p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="h-11 w-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Wallet size={20} />
                </div>
                <Badge
                  className={cn(
                    "font-black text-[9px] uppercase tracking-wider",
                    (finance.summary?.dueAmount || 0) > 0
                      ? "bg-rose-50 text-rose-700 border-rose-100"
                      : "bg-emerald-50 text-emerald-700 border-emerald-100"
                  )}
                >
                  {(finance.summary?.dueAmount || 0) > 0 ? "Pending Dues" : "Paid Clear"}
                </Badge>
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                ₹{finance.summary?.dueAmount || 0}
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                Fee Liability Balance
              </p>
            </Card>
          </div>

          {/* 🗂️ SECTION 1: VERIFIED DOCUMENT VAULT (HIGH PRIORITY) */}
          <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl bg-white overflow-hidden ring-1 ring-slate-100">
            <CardHeader className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 sm:p-8 flex flex-row items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="h-12 w-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
                  <FileCheck size={22} className="text-indigo-300" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-tight">
                    Verified Document Vault
                  </h3>
                  <p className="text-[11px] font-bold text-indigo-200 uppercase tracking-wider mt-0.5">
                    Official Certificates, ID Proofs & Kyc Assets ({rawDocuments.length})
                  </p>
                </div>
              </div>
              {rawDocuments.length > 0 && (
                <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider px-3 py-1">
                  Compliant
                </Badge>
              )}
            </CardHeader>

            <CardContent className="p-6 sm:p-8">
              {rawDocuments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {rawDocuments.map((doc: any, index: number) => {
                    const docTitle =
                      doc.name || doc.title || doc.type || `Document #${index + 1}`;
                    const docUrl = doc.url || doc.fileKey || "";
                    const isPdf =
                      doc.isPdf ||
                      (docUrl && docUrl.toLowerCase().includes(".pdf")) ||
                      doc.mimeType === "application/pdf";

                    return (
                      <div
                        key={doc.id || index}
                        className="group relative bg-slate-50/80 hover:bg-white border border-slate-200/80 hover:border-indigo-200 rounded-2xl p-4 sm:p-5 transition-all duration-300 shadow-xs hover:shadow-md flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 group-hover:scale-105 transition-transform">
                                {isPdf ? <FileText size={20} /> : <FileCheck size={20} />}
                              </div>
                              <div>
                                <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight line-clamp-1">
                                  {docTitle}
                                </h4>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  {doc.type || (isPdf ? "PDF Document" : "Image Document")}
                                </span>
                              </div>
                            </div>
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[9px] font-black uppercase tracking-wider shrink-0">
                              {doc.status || "VERIFIED"}
                            </Badge>
                          </div>

                          {/* THUMBNAIL PREVIEW (IF IMAGE) */}
                          {!isPdf && docUrl && (
                            <div
                              onClick={() =>
                                setSelectedDoc({ title: docTitle, url: docUrl, isPdf: false })
                              }
                              className="w-full h-32 rounded-xl bg-slate-200/60 overflow-hidden relative cursor-pointer group-hover:ring-2 group-hover:ring-indigo-500/30 transition-all mb-3"
                            >
                              <img
                                src={docUrl}
                                alt={docTitle}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5 backdrop-blur-[2px]">
                                <Eye size={16} /> Click to Inspect
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                          <span className="text-[10px] font-mono font-bold text-slate-400">
                            {doc.fileSize
                              ? `${Math.round(doc.fileSize / 1024)} KB`
                              : isPdf
                              ? "PDF Document"
                              : "Verified Proof"}
                          </span>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setSelectedDoc({ title: docTitle, url: docUrl, isPdf })
                              }
                              className="h-8 px-3 rounded-lg border-slate-200 text-xs font-black uppercase tracking-wider text-slate-700 hover:text-indigo-600 hover:border-indigo-200 cursor-pointer"
                            >
                              <Eye size={13} className="mr-1.5" /> View
                            </Button>
                            {docUrl && (
                              <a
                                href={docUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="h-8 w-8 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 flex items-center justify-center transition-colors"
                              >
                                <ExternalLink size={13} />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 px-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200">
                  <FileText className="h-10 w-10 text-slate-300 mx-auto mb-2.5" />
                  <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    No Documents Uploaded
                  </h4>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                    Birth Certificate, Aadhaar Card, or Transfer Certificate have not been filed yet.
                  </p>
                  <Button
                    onClick={() => router.push(`/students/edit/${id}`)}
                    className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider h-9 px-4"
                  >
                    + Upload Documents in Step 3
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 📑 SECTION 2: IDENTITY & DEMOGRAPHIC ATTRIBUTES */}
          <Card className="border-none shadow-md shadow-slate-100 rounded-3xl bg-white overflow-hidden ring-1 ring-slate-100">
            <CardHeader className="bg-slate-50/60 py-4 px-6 sm:px-8 border-b border-slate-100">
              <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <User size={15} className="text-indigo-600" /> Identity & Demographic Dossier
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 sm:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    First Name
                  </p>
                  <p className="text-xs font-black text-slate-900 uppercase">
                    {student.firstName || student.name?.split(" ")[0] || "N/A"}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Last Name
                  </p>
                  <p className="text-xs font-black text-slate-900 uppercase">
                    {student.lastName || student.name?.split(" ").slice(1).join(" ") || "N/A"}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Gender
                  </p>
                  <Badge variant="outline" className="text-[10px] font-black uppercase text-slate-700 border-slate-200">
                    {student.gender || "MALE"}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Date of Birth
                  </p>
                  <p className="text-xs font-black text-slate-900">
                    {student.dob ? new Date(student.dob).toLocaleDateString("en-GB") : "Not Specified"}{" "}
                    {studentAge !== null && (
                      <span className="text-slate-400 font-bold">({studentAge} yrs)</span>
                    )}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Blood Group
                  </p>
                  <Badge className="bg-rose-50 text-rose-700 border-rose-100 font-black text-[10px]">
                    {student.bloodGroup || "O+"}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Religion
                  </p>
                  <p className="text-xs font-black text-slate-900 uppercase">
                    {student.religion || "HINDU"}
                  </p>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Aadhaar Card Identification
                  </p>
                  <Badge variant="outline" className="font-mono text-xs font-black text-slate-800 bg-slate-50 border-slate-200 px-3 py-1">
                    {formatAadhaar(student.aadharNo)}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Fee Plan Category
                  </p>
                  <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 text-[10px] font-black uppercase">
                    {student.feesStatus || "STANDARD"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 📊 SECTION 3: SCHOLASTIC REGISTRY & EXAM BREAKDOWN */}
          <Card className="border-none shadow-md shadow-slate-100 rounded-3xl bg-white overflow-hidden ring-1 ring-slate-100">
            <CardHeader className="bg-slate-50/60 py-4 px-6 sm:px-8 border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <GraduationCap size={15} className="text-indigo-600" /> Examination Performance Matrix
              </CardTitle>
              <Button
                size="sm"
                onClick={() => setIsMarksModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider h-8 px-3.5 shadow-xs"
              >
                + Record Marks
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="min-w-[650px]">
                  <TableHeader className="bg-slate-50/40">
                    <TableRow className="border-none">
                      <TableHead className="font-black text-slate-400 text-[10px] uppercase tracking-wider pl-6 sm:pl-8 h-14">
                        Subject
                      </TableHead>
                      <TableHead className="text-center font-black text-slate-400 text-[10px] uppercase tracking-wider h-14">
                        Unit Test 1
                      </TableHead>
                      <TableHead className="text-center font-black text-slate-400 text-[10px] uppercase tracking-wider h-14">
                        Unit Test 2
                      </TableHead>
                      <TableHead className="text-center font-black text-slate-400 text-[10px] uppercase tracking-wider h-14">
                        Half Yearly
                      </TableHead>
                      <TableHead className="text-center font-black text-slate-400 text-[10px] uppercase tracking-wider pr-6 sm:pr-8 h-14">
                        Final Exam
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from(new Set(academic.map((m: any) => m.subject))).length > 0 ? (
                      Array.from(new Set(academic.map((m: any) => m.subject))).map(
                        (sub: any, i) => (
                          <TableRow
                            key={i}
                            className="hover:bg-slate-50/60 transition-colors border-slate-100"
                          >
                            <TableCell className="font-bold text-slate-900 pl-6 sm:pl-8 uppercase text-xs">
                              {sub}
                            </TableCell>
                            {["UNIT TEST 1", "UNIT TEST 2", "HALF YEARLY", "FINAL"].map(
                              (e) => {
                                const m = academic.find(
                                  (x: any) => x.subject === sub && x.examType === e
                                );
                                return (
                                  <TableCell key={e} className="text-center font-black">
                                    {m ? (
                                      <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 px-3 py-1 text-[10px] font-black shadow-xs">
                                        {m.marks} / {m.total}
                                      </Badge>
                                    ) : (
                                      <span className="text-slate-300 font-mono text-xs">--</span>
                                    )}
                                  </TableCell>
                                );
                              }
                            )}
                          </TableRow>
                        )
                      )
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-44 text-center">
                          <div className="flex flex-col items-center justify-center text-slate-400">
                            <ClipboardList className="h-8 w-8 mb-2 opacity-30 text-indigo-600" />
                            <p className="text-[10px] font-black uppercase tracking-wider">
                              No Exam Records Available
                            </p>
                            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                              Allocate subject marks for Unit Tests or Terminal exams.
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* 📚 SECTION 4: HOMEWORK SUBMISSIONS & COMPLETION STATUS */}
          <Card className="border-none shadow-md shadow-slate-100 rounded-3xl bg-white overflow-hidden ring-1 ring-slate-100">
            <CardHeader className="bg-slate-50/60 py-4 px-6 sm:px-8 border-b border-slate-100 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardList size={15} className="text-orange-500" />
                <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-700">
                  Homework Submissions & Completion Status
                </CardTitle>
              </div>
              <Badge className="bg-orange-50 text-orange-700 border-orange-100 text-[10px] font-black uppercase tracking-wider">
                {homework.length} Assignments
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="min-w-[650px]">
                  <TableHeader className="bg-slate-50/40">
                    <TableRow className="border-none">
                      <TableHead className="font-black text-slate-400 text-[10px] uppercase tracking-wider pl-6 sm:pl-8 h-12">
                        Subject & Title
                      </TableHead>
                      <TableHead className="text-center font-black text-slate-400 text-[10px] uppercase tracking-wider h-12">
                        Assigned Date
                      </TableHead>
                      <TableHead className="text-center font-black text-slate-400 text-[10px] uppercase tracking-wider h-12">
                        Submission Due
                      </TableHead>
                      <TableHead className="text-center font-black text-slate-400 text-[10px] uppercase tracking-wider pr-6 sm:pr-8 h-12">
                        Completion Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {homework.length > 0 ? (
                      homework.map((hw: any, i: number) => {
                        const isCompleted = hw.status === "COMPLETED" || hw.status === "SUBMITTED";
                        const isPending = !isCompleted;
                        return (
                          <TableRow key={hw.id || i} className="hover:bg-slate-50/60 transition-colors border-slate-100">
                            <TableCell className="pl-6 sm:pl-8 py-3.5">
                              <div>
                                <p className="font-bold text-slate-900 text-xs uppercase">{hw.title || hw.subject || "Assignment"}</p>
                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider">{hw.subject}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center text-xs font-medium text-slate-500">
                              {hw.date || (hw.createdAt ? new Date(hw.createdAt).toLocaleDateString("en-GB") : "--")}
                            </TableCell>
                            <TableCell className="text-center text-xs font-bold text-slate-700">
                              {hw.dueDate || "--"}
                            </TableCell>
                            <TableCell className="text-center pr-6 sm:pr-8">
                              <Badge
                                className={cn(
                                  "font-black text-[9px] uppercase tracking-wider px-2.5 py-1",
                                  hw.status === "COMPLETED"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : hw.status === "SUBMITTED"
                                    ? "bg-blue-50 text-blue-700 border-blue-200"
                                    : "bg-amber-50 text-amber-700 border-amber-200"
                                )}
                              >
                                {hw.status === "COMPLETED" ? "✓ Completed" : hw.status === "SUBMITTED" ? "Submitted" : "⚠ Pending"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="h-32 text-center">
                          <div className="flex flex-col items-center justify-center text-slate-400">
                            <ClipboardList className="h-7 w-7 mb-1.5 opacity-30 text-orange-500" />
                            <p className="text-[10px] font-black uppercase tracking-wider">No Homework Assignments Found</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">No active homework posted for Grade {student.class}.</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* 💰 SECTION 5: FINANCIAL STATUS & FEE LEDGER */}
          <Card className="border-none shadow-md shadow-slate-100 rounded-3xl bg-white overflow-hidden ring-1 ring-slate-100">
            <CardHeader className="bg-slate-50/60 py-4 px-6 sm:px-8 border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Wallet size={15} className="text-indigo-600" /> Financial Status & Fee Ledger
              </CardTitle>
              <Button
                type="button"
                onClick={() => setIsAdmissionSlipOpen(true)}
                className="h-8 px-3.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <Receipt size={13} className="text-amber-400" /> Print Admission Slip (रसीद)
              </Button>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 bg-rose-50/60 rounded-2xl border border-rose-100">
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-wider mb-1">
                    Pending Dues
                  </p>
                  <h4 className="text-2xl font-black text-rose-700 tracking-tight">
                    ₹{finance.summary?.dueAmount || 0}
                  </h4>
                </div>
                <div className="p-5 bg-emerald-50/60 rounded-2xl border border-emerald-100">
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-wider mb-1">
                    Paid Amount
                  </p>
                  <h4 className="text-2xl font-black text-emerald-700 tracking-tight">
                    ₹{(finance.summary?.finalAmount || 0) - (finance.summary?.dueAmount || 0)}
                  </h4>
                </div>
                <div className="p-5 bg-indigo-50/60 rounded-2xl border border-indigo-100">
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-wider mb-1">
                    Concession / Discount
                  </p>
                  <h4 className="text-2xl font-black text-indigo-700 tracking-tight">
                    ₹{finance.summary?.discountValue || 0}
                  </h4>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-100">
                <Table>
                  <TableHeader className="bg-slate-50/60">
                    <TableRow className="border-none">
                      <TableHead className="pl-6 h-12 font-black text-slate-400 text-[10px] uppercase tracking-wider">
                        Date
                      </TableHead>
                      <TableHead className="h-12 font-black text-slate-400 text-[10px] uppercase tracking-wider">
                        Receipt #
                      </TableHead>
                      <TableHead className="h-12 font-black text-slate-400 text-[10px] uppercase tracking-wider">
                        Amount Paid
                      </TableHead>
                      <TableHead className="text-right pr-6 h-12 font-black text-slate-400 text-[10px] uppercase tracking-wider">
                        Transaction
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(finance.history || []).length > 0 ? (
                      (finance.history || []).map((p: any, i: number) => (
                        <TableRow
                          key={p.id || i}
                          className="hover:bg-slate-50/50 border-slate-100 transition-colors"
                        >
                          <TableCell className="pl-6 font-bold text-slate-700 text-xs">
                            {p.paymentDate || p.date || p.createdAt
                              ? new Date(p.paymentDate || p.date || p.createdAt).toLocaleDateString(
                                  "en-GB"
                                )
                              : "Recent"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-mono text-[10px] font-black border-slate-200">
                              {p.receiptNo || `RC-00${i + 1}`}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-black text-slate-900 text-xs">
                            ₹{p.amountPaid || p.amount || 0}
                          </TableCell>
                          <TableCell className="text-right pr-6 font-mono text-[10px] font-bold text-slate-400 uppercase">
                            TXN_{p.id || i + 1}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="h-28 text-center font-bold text-xs text-slate-400 uppercase tracking-wider"
                        >
                          No Fee Transactions Logged
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* 🔍 DOCUMENT FULL PREVIEW MODAL */}
      {selectedDoc && (
        <DocumentViewerModal
          title={selectedDoc.title}
          url={selectedDoc.url}
          isPdf={selectedDoc.isPdf}
          onClose={() => setSelectedDoc(null)}
        />
      )}

      {/* MARKS ALLOCATION MODAL */}
      <AllocateMarksModal
        isOpen={isMarksModalOpen}
        onOpenChange={setIsMarksModalOpen}
        studentId={id as string}
        studentSession={student.session || "2026-2027"}
        onSuccess={fetchDashboardData}
      />

      {/* SEND MESSAGE MODAL */}
      <SendStudentMessageModal
        isOpen={isMessageOpen}
        onOpenChange={setIsMessageOpen}
        studentName={student.name}
        studentClass={student.class || ""}
        studentSection={student.section || ""}
      />

      {/* LOG TIMELINE ACTIVITY MODAL */}
      <LogTimelineActivityModal
        isOpen={isTimelineOpen}
        onOpenChange={setIsTimelineOpen}
        studentName={student.name}
        timelineEvents={timelineEvents}
      />

      {/* ASSIGN TRANSPORT MODAL */}
      <AssignStudentTransportModal
        isOpen={isTransportOpen}
        onOpenChange={setIsTransportOpen}
        student={student}
        onSuccess={fetchDashboardData}
      />

      {/* STUDENT ATTENDANCE ANALYTICS MODAL */}
      <StudentAttendanceModal
        isOpen={isAttendanceModalOpen}
        onOpenChange={setIsAttendanceModalOpen}
        studentName={student.name}
        admissionNo={student.admissionNo}
        studentClass={student.class}
        studentSection={student.section || "A"}
        attendanceRecords={attendance}
      />

      {/* 🧾 OFFICIAL ADMISSION FEE SLIP MODAL */}
      <AdmissionFeeSlipModal
        isOpen={isAdmissionSlipOpen}
        onOpenChange={setIsAdmissionSlipOpen}
        studentId={id as string}
        studentData={student}
      />
    </div>
  );
}
