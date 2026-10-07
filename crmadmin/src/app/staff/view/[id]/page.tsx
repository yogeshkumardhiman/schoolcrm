"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@bprogress/next/app";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  User,
  Activity,
  IndianRupee,
  Calendar,
  ShieldCheck,
  Bell,
  MessageSquare,
  Clock,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  FileText,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Wallet,
  ReceiptText as Receipt,
  Loader2,
  Send,
  Edit3,
  Copy,
  Check,
  ExternalLink,
  Download,
  GraduationCap,
  BookOpen,
  Building,
  FileCheck,
  IdCard,
  UserCheck,
  KeyRound
} from "lucide-react";
import client from "@/lib/client";
import { useAuth } from "@/components/AbilityProvider";
import { RecordPaymentModal } from "@/features/fees";
import { ResetStaffPasswordDialog } from "../../components/ResetStaffPasswordDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";

export default function StaffViewPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const staffId = params.id as string;
  const { user: currentUser, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<"profile" | "academics" | "documents" | "payroll" | "leaves">("profile");
  const [copiedId, setCopiedId] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);

  // 🔍 Query: Target Staff Member Full Record
  const { data: staff, isLoading: dataLoading, error } = useQuery({
    queryKey: ["staff-detail-view", staffId],
    queryFn: async () => {
      const res: any = await client.get(`/staff/${staffId}`);
      return res;
    },
    enabled: !!staffId && !authLoading
  });

  // 💰 Query: Target Staff Salary History
  const { data: salaryHistory = [], isLoading: salaryLoading } = useQuery({
    queryKey: ["staff-salary-history-view", staffId],
    queryFn: async () => {
      try {
        return (await client.get(`/salary/payments/${staffId}`)) || [];
      } catch {
        return [];
      }
    },
    enabled: !!staffId && !authLoading
  });

  // Mutation: Process Salary Payment
  const paymentMutation = useMutation({
    mutationFn: (data: any) => client.post("/salary/pay", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-salary-history-view", staffId] });
      toast.success("Salary Disbursed Successfully");
      setShowPaymentModal(false);
    },
    onError: (err: any) => {
      const msg = err?.message || err?.error || "Payment processing failed";
      toast.error(msg);
    }
  });

  const handleProcessPayment = (data: any) => {
    if (!data.amount) return toast.error("Please specify amount");
    paymentMutation.mutate({
      staffId: Number(staffId),
      amount: Number(data.amount),
      year: Number(data.year || new Date().getFullYear()),
      month: data.month,
      remark: data.remark || "Monthly Salary Disbursed",
      paymentDate: new Date().toISOString().split("T")[0]
    });
  };

  const handleCopyLoginId = (idText: string) => {
    navigator.clipboard.writeText(idText);
    setCopiedId(true);
    toast.success("Login ID copied to clipboard!");
    setTimeout(() => setCopiedId(false), 2000);
  };

  const loading = authLoading || dataLoading;

  if (loading) {
    return (
      <div className="p-8 md:p-12 space-y-8 bg-[#F8FAFC] min-h-screen font-sans">
        <div className="h-64 w-full rounded-3xl bg-white border border-slate-200 shadow-sm animate-pulse p-8 flex items-center gap-8">
          <div className="h-32 w-32 rounded-3xl bg-slate-100 shrink-0" />
          <div className="space-y-4 flex-1">
            <div className="h-8 w-64 bg-slate-100 rounded-xl" />
            <div className="h-4 w-96 bg-slate-100 rounded-lg" />
            <div className="h-10 w-48 bg-slate-100 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !staff) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
        <div className="h-16 w-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-black text-slate-900 uppercase">Faculty Member Not Found</h2>
        <p className="text-xs text-slate-500 max-w-sm">
          The requested staff record ID #{staffId} does not exist or may have been deleted.
        </p>
        <Button onClick={() => router.push("/staff")} className="rounded-xl font-bold text-xs">
          Return to Staff Directory
        </Button>
      </div>
    );
  }

  const isAuthorized = ["ADMIN", "SUPER_ADMIN", "PRINCIPAL", "ACCOUNTANT"].includes(
    currentUser?.role?.toUpperCase() || ""
  );
  const isTeacher = staff?.role === "TEACHER";
  const documents = Array.isArray(staff?.documents) ? staff.documents : [];

  return (
    <div className="p-8 md:p-10 space-y-8 bg-[#F8FAFC] min-h-screen font-sans animate-in fade-in duration-500">
      {/* 🧭 TOP ACTION BAR */}
      <div className="flex items-center justify-between">
        <Button
          onClick={() => router.push("/staff")}
          variant="outline"
          className="h-11 px-5 rounded-2xl border-slate-200/90 hover:bg-white text-slate-600 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-xs bg-white/60"
        >
          <ArrowLeft size={16} /> Back to Directory
        </Button>

        <div className="flex items-center gap-3">
          {isAuthorized && (
            <Button
              onClick={() => setShowResetPasswordModal(true)}
              variant="outline"
              className="h-11 px-5 rounded-2xl border-amber-200 bg-amber-50/60 hover:bg-amber-100 text-amber-800 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <KeyRound size={15} className="text-amber-600" /> Reset Password & Mail
            </Button>
          )}

          <Button
            onClick={() => router.push(`/staff/edit/${staff.id}`)}
            className="h-11 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm"
          >
            <Edit3 size={15} /> Edit Profile
          </Button>

          {isAuthorized && (
            <Button
              onClick={() => setShowPaymentModal(true)}
              className="h-11 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm"
            >
              <IndianRupee size={15} /> Disburse Salary
            </Button>
          )}
        </div>
      </div>

      {/* 🏛️ EXECUTIVE PROFILE HERO BANNER */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 md:p-10 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
          {/* Avatar with Status Pulse */}
          <div className="relative shrink-0">
            <div className="h-32 w-32 rounded-3xl border-4 border-slate-50 bg-slate-100 overflow-hidden shadow-lg shadow-slate-200/50 flex items-center justify-center">
              {staff.image ? (
                <img
                  src={staff.image}
                  alt={staff.name}
                  className="h-full w-full object-cover"
                  onError={(e: any) => {
                    e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${staff.name}`;
                  }}
                />
              ) : (
                <div className="h-full w-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-3xl font-heading">
                  {staff.name?.slice(0, 2).toUpperCase() || "ST"}
                </div>
              )}
            </div>
            <div
              className="absolute -bottom-1 -right-1 h-7 w-7 rounded-xl bg-emerald-500 border-4 border-white flex items-center justify-center text-white shadow-md"
              title="Active Faculty Member"
            >
              <Check size={14} strokeWidth={3} />
            </div>
          </div>

          {/* Core Info & Metadata */}
          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <Badge className="bg-indigo-50 text-indigo-700 border border-indigo-200/60 font-black text-xs uppercase px-3 py-1 rounded-xl">
                {staff.role || "STAFF"}
              </Badge>

              {staff.dynamicRole && staff.dynamicRole.name !== staff.role && (
                <Badge className="bg-purple-50 text-purple-700 border border-purple-200/60 font-bold text-xs uppercase px-3 py-1 rounded-xl">
                  {staff.dynamicRole.name}
                </Badge>
              )}

              {/* Alphanumeric Login ID Chip with 1-Click Copy */}
              <button
                type="button"
                onClick={() => handleCopyLoginId(staff.loginId || "")}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer"
                title="Click to copy Login ID"
              >
                <IdCard size={13} className="text-slate-500" />
                <span>{staff.loginId || `STAFF-${staff.id}`}</span>
                {copiedId ? (
                  <Check size={13} className="text-emerald-600" />
                ) : (
                  <Copy size={13} className="text-slate-400" />
                )}
              </button>

              <span className="text-xs font-semibold text-slate-400">
                Department:{" "}
                <strong className="text-slate-700">
                  {isTeacher ? "Academics" : staff.role === "ACCOUNTANT" ? "Finance & Accounts" : "Administration"}
                </strong>
              </span>
            </div>

            <div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight uppercase font-heading">
                {staff.name}
              </h1>
              <p className="text-sm font-bold text-indigo-600 mt-1 uppercase tracking-wide">
                {staff.designation || (isTeacher ? "Academic Faculty" : "Staff Member")}
              </p>
            </div>

            {/* Quick Contact Chips */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-xs font-semibold text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <Mail size={15} className="text-indigo-500" />
                <span className="font-mono">{staff.email || "No Email Registered"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={15} className="text-emerald-500" />
                <span className="font-mono">{staff.phone || "No Phone Registered"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={15} className="text-amber-500" />
                <span>
                  Joined:{" "}
                  {staff.joiningDate ? new Date(staff.joiningDate).toLocaleDateString() : "Not Specified"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase size={15} className="text-purple-500" />
                <span>
                  Experience:{" "}
                  {staff.experience
                    ? String(staff.experience).toLowerCase().includes("year")
                      ? staff.experience
                      : `${staff.experience} Years`
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🧭 NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab("profile")}
          className={cn(
            "px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shrink-0 flex items-center gap-2",
            activeTab === "profile"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60"
          )}
        >
          <User size={14} /> Full Profile & Bio
        </button>

        {isTeacher && (
          <button
            onClick={() => setActiveTab("academics")}
            className={cn(
              "px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shrink-0 flex items-center gap-2",
              activeTab === "academics"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60"
            )}
          >
            <BookOpen size={14} /> Academic Scope
          </button>
        )}

        <button
          onClick={() => setActiveTab("documents")}
          className={cn(
            "px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shrink-0 flex items-center gap-2",
            activeTab === "documents"
              ? "bg-purple-600 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60"
          )}
        >
          <FileText size={14} /> Document Vault ({documents.length})
        </button>

        <button
          onClick={() => setActiveTab("payroll")}
          className={cn(
            "px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shrink-0 flex items-center gap-2",
            activeTab === "payroll"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60"
          )}
        >
          <IndianRupee size={14} /> Payroll & Salary
        </button>
      </div>

      {/* 📋 TAB 1: FULL PROFILE & PERSONAL DETAILS */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-300">
          {/* Left Column: Personal Registry */}
          <div className="lg:col-span-6 bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="h-10 w-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <User size={20} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase font-heading">
                  Personal & Identity Registry
                </h3>
                <p className="text-xs text-slate-400 font-medium">Core personal and logistical details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Date of Birth
                </span>
                <p className="text-xs font-black text-slate-900">
                  {staff.dob ? new Date(staff.dob).toLocaleDateString() : "Not Specified"}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gender</span>
                <p className="text-xs font-black text-slate-900 uppercase">{staff.gender || "Male"}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Religion Axis
                </span>
                <p className="text-xs font-black text-slate-900 uppercase">{staff.religion || "HINDU"}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Qualifications
                </span>
                <p className="text-xs font-black text-slate-900 uppercase">
                  {staff.qualification || "Not Specified"}
                </p>
              </div>

              <div className="col-span-1 sm:col-span-2 p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Residential Address
                </span>
                <p className="text-xs font-bold text-slate-800 leading-relaxed">
                  {staff.address || "No address entered."}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Bio & Professional Overview */}
          <div className="lg:col-span-6 space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="h-10 w-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <Building size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase font-heading">
                    Professional Scope & Bio
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">Faculty summary & notes</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-100">
                <p className="text-xs font-medium text-slate-600 leading-relaxed italic">
                  {staff.about ? `"${staff.about}"` : "No biography provided for this faculty member."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-1">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                    Institutional Role
                  </span>
                  <p className="text-xs font-black text-indigo-950 uppercase">{staff.role}</p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                    Experience
                  </span>
                  <p className="text-xs font-black text-emerald-950">
                    {staff.experience
                      ? String(staff.experience).toLowerCase().includes("year")
                        ? staff.experience
                        : `${staff.experience} Years`
                      : "Fresh / N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🎓 TAB 2: ACADEMIC & CLASSROOM SCOPE */}
      {activeTab === "academics" && isTeacher && (
        <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200/80 shadow-sm space-y-8 animate-in fade-in duration-300">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="h-10 w-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <BookOpen size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 uppercase font-heading">
                Academic & Teaching Assignments
              </h3>
              <p className="text-xs text-slate-500 font-medium">Classroom in-charge and subject syllabus</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-2">
              <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">
                Primary Subject
              </span>
              <h4 className="text-xl font-black text-purple-950 uppercase font-heading">
                {staff.subject || "Not Assigned"}
              </h4>
              <p className="text-[11px] text-purple-700 font-medium">Core teaching syllabus</p>
            </div>

            <div className="p-6 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2">
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                Class In-Charge
              </span>
              <h4 className="text-xl font-black text-indigo-950 uppercase font-heading">
                {staff.class ? `Class ${staff.class}` : "No Class Assigned"}
              </h4>
              <p className="text-[11px] text-indigo-700 font-medium">Assigned class mentor</p>
            </div>

            <div className="p-6 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2">
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                Section Assigned
              </span>
              <h4 className="text-xl font-black text-emerald-950 uppercase font-heading">
                {staff.section ? `Section ${staff.section}` : "Section A"}
              </h4>
              <p className="text-[11px] text-emerald-700 font-medium">Division division group</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Degree & Teacher Certifications
            </span>
            <p className="text-sm font-bold text-slate-900">
              {staff.qualification || "No formal academic degree listed."}
            </p>
          </div>
        </div>
      )}

      {/* 📁 TAB 3: DOCUMENT VAULT */}
      {activeTab === "documents" && (
        <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200/80 shadow-sm space-y-8 animate-in fade-in duration-300">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="h-10 w-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <FileCheck size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 uppercase font-heading">
                Compliance & Document Vault
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Verified identification, academic degrees, and appointment records.
              </p>
            </div>
          </div>

          {documents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {documents.map((doc: any, i: number) => {
                const isPdf = doc.url?.includes(".pdf") || doc.fileName?.endsWith(".pdf");

                return (
                  <div
                    key={i}
                    className="p-6 rounded-3xl bg-slate-50/80 border border-slate-200/80 space-y-5 flex flex-col justify-between hover:border-indigo-300 transition-all group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="h-11 w-11 rounded-2xl bg-white border border-slate-200/60 shadow-xs flex items-center justify-center text-indigo-600">
                          {isPdf ? <FileText size={22} /> : <GraduationCap size={22} />}
                        </div>
                        <Badge className="bg-indigo-50 text-indigo-700 border-none font-bold text-[9px] uppercase px-2.5 py-0.5 rounded-md">
                          {doc.type?.replace("_", " ") || "VERIFIED"}
                        </Badge>
                      </div>

                      <h4 className="font-black text-sm text-slate-900 uppercase mt-2">
                        {doc.title || "Compliance Document"}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono font-semibold truncate">
                        {doc.fileName || "document_attachment"}
                      </p>
                    </div>

                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full h-11 bg-white hover:bg-slate-900 hover:text-white text-slate-800 border border-slate-200 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs"
                    >
                      <ExternalLink size={14} /> Open Document
                    </a>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
              <FileText size={48} className="text-slate-300" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                No documents uploaded for this faculty member yet.
              </p>
              <Button
                onClick={() => router.push(`/staff/edit/${staff.id}`)}
                variant="outline"
                className="rounded-xl font-bold text-xs"
              >
                Upload Documents in Edit Mode
              </Button>
            </div>
          )}
        </div>
      )}

      {/* 💳 TAB 4: PAYROLL & SALARY (DATA TABLE) */}
      {activeTab === "payroll" && (
        <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200/80 shadow-sm space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <IndianRupee size={20} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase font-heading">
                  Payroll & Disbursal Ledger
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Verified salary disbursements, payment dates, and transaction history
                </p>
              </div>
            </div>

            {isAuthorized && (
              <Button
                onClick={() => setShowPaymentModal(true)}
                className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase shadow-sm flex items-center gap-1.5"
              >
                <IndianRupee size={14} /> Disburse Salary
              </Button>
            )}
          </div>

          <div>
            {salaryLoading ? (
              <Skeleton className="h-48 w-full rounded-2xl" />
            ) : salaryHistory.length > 0 ? (
              <div className="overflow-x-auto rounded-2xl border border-slate-200/80 shadow-2xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <th className="py-4 px-6">Salary Period</th>
                      <th className="py-4 px-6">Disbursed Date</th>
                      <th className="py-4 px-6">Net Amount</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6">Remarks / Notes</th>
                      <th className="py-4 px-6 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                    {salaryHistory.map((sal: any, i: number) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-700 font-black text-xs flex items-center justify-center uppercase shrink-0">
                              {sal.month?.slice(0, 3)}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 uppercase">
                                {sal.month} {sal.year}
                              </span>
                              <p className="text-[10px] text-slate-400 font-normal">
                                Transaction ID: #{sal.id}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-slate-600 font-mono">
                          {sal.paymentDate ? new Date(sal.paymentDate).toLocaleDateString() : "Today"}
                        </td>
                        <td className="py-4 px-6 font-black text-slate-900 font-mono text-sm">
                          ₹{Number(sal.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                            <Check size={11} strokeWidth={3} /> {sal.status || "PAID"}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-slate-500 max-w-xs truncate">
                          {sal.remark || "Monthly Salary Disbursed"}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              router.push(`/salary/slip/${sal.id}`);
                            }}
                            className="h-8 px-3 rounded-lg border-slate-200 text-slate-600 hover:text-indigo-600 font-bold text-[10px] uppercase flex items-center gap-1.5 ml-auto cursor-pointer hover:bg-indigo-50/50"
                          >
                            <Receipt size={13} /> View Slip
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-16 text-center flex flex-col items-center justify-center space-y-2">
                <Receipt size={40} className="text-slate-300" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  No salary records found for this faculty member.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 💰 RECORD PAYMENT MODAL */}
      {isAuthorized && (
        <RecordPaymentModal
          isOpen={showPaymentModal}
          onOpenChange={setShowPaymentModal}
          onSubmit={handleProcessPayment}
          isPending={paymentMutation.isPending}
        />
      )}

      {/* 🔑 RESET PASSWORD & MAIL MODAL */}
      {isAuthorized && (
        <ResetStaffPasswordDialog
          isOpen={showResetPasswordModal}
          onClose={() => setShowResetPasswordModal(false)}
          staff={staff}
        />
      )}
    </div>
  );
}
