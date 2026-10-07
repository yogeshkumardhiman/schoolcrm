"use client";

import client from "@/lib/client";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "@bprogress/next/app";
import {
  Search,
  Wallet,
  Clock,
  Receipt,
  Loader2,
  Users,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  Settings2,
  ChevronDown,
  FileSpreadsheet,
  Plus,
  IndianRupee,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import toast from "react-hot-toast";
import { useAuth } from "@/components/AbilityProvider";
import FeeReceiptDialog from "@/components/dialogbox/FeeReceiptDialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AppTable } from "@/components/AppTable";
import { AdmissionFeeSlipModal } from "@/features/fees";
import { Skeleton, TableRowSkeleton } from "@/components/ui/skeleton";

const MONTHS = [
  "April", "May", "June", "July", "August", "September",
  "October", "November", "December", "January", "February", "March"
];

const ALL_CLASSES = [
  "NURSERY", "LKG", "UKG", "1ST", "2ND", "3RD", "4TH", "5TH",
  "6TH", "7TH", "8TH", "9TH", "10TH", "11TH", "12TH"
];

const SECTIONS = ["A", "B", "C", "D"];

// 💳 Fast Inline Payment Dialog
function PaymentDialog({
  student,
  month,
  onPaymentSuccess
}: {
  student: any;
  month: string;
  onPaymentSuccess: (payment: any) => void;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const tuition = parseFloat(student.structure?.tuitionFee || student.monthlyDue || 0);
  const transport = student.student?.transportOpted ? 800 : 0;
  const expectedAmount = tuition + transport;

  useEffect(() => {
    if (open) setAmount(expectedAmount.toString());
  }, [open, expectedAmount]);

  const paymentMutation = useMutation({
    mutationFn: (data: any) => client.post("/fees/pay", data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['fees-summary'] });
      queryClient.invalidateQueries({ queryKey: ['fees-students'] });
      queryClient.invalidateQueries({ queryKey: ['fees-defaulters'] });
      toast.success(`Payment recorded for ${month}`);
      setOpen(false);
      onPaymentSuccess({ ...data, student: student.student });
    },
    onError: (err: any) => toast.error(err.response?.data?.error || "Payment failed")
  });

  const handlePay = () => {
    paymentMutation.mutate({
      studentId: student.studentId || student.student?.id,
      amountPaid: Number(amount),
      month: month,
      mode: 'CASH',
      remark: `Collection for ${month}`
    });
  };

  return (
    <>
      <Button
        size="sm"
        onClick={() => setOpen(true)}
        className="h-8 font-black text-[10px] uppercase px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-all cursor-pointer"
      >
        Collect Fee
      </Button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-xs" onClick={() => setOpen(false)} />
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative z-10 overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 text-white p-6">
              <h3 className="text-base font-black uppercase tracking-tight">Record Fee Collection</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                {student.student?.name} • Class {student.class}-{student.section || 'A'}
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span>Tuition Fee ({month}):</span>
                  <span className="text-slate-900 font-mono">₹{tuition.toLocaleString("en-IN")}</span>
                </div>
                {transport > 0 && (
                  <div className="flex justify-between text-xs font-bold text-amber-700">
                    <span>Transport Fee:</span>
                    <span className="font-mono">₹{transport.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 flex justify-between text-xs font-black text-slate-900">
                  <span>Net Expected Amount:</span>
                  <span className="font-mono text-indigo-600">₹{expectedAmount.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Amount Received (₹) *
                </label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-12 rounded-xl text-base font-black font-mono bg-slate-50 text-slate-900"
                  placeholder="0"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="flex-1 h-11 text-xs font-bold uppercase rounded-xl cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handlePay}
                  disabled={paymentMutation.isPending || !amount}
                  className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-md shadow-emerald-600/20"
                >
                  {paymentMutation.isPending ? "Recording..." : "Save Payment"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const getInitials = (name: string) => {
  return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'SC';
};

export default function FeesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeMode, setActiveMode] = useState<'individual' | 'defaulters'>('individual');
  const [selectedMonth, setSelectedMonth] = useState("April");
  const [selectedClass, setSelectedClass] = useState("All Classes");
  const [selectedSection, setSelectedSection] = useState("All Sections");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PAID" | "PENDING">("ALL");

  // Modals
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [currentPayment, setCurrentPayment] = useState<any>(null);
  const [selectedSlipStudent, setSelectedSlipStudent] = useState<any | null>(null);
  const [isAdmissionSlipOpen, setIsAdmissionSlipOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 1. Fetch School Info for Operating Class Limits
  const { data: schoolInfo } = useQuery({
    queryKey: ['school-info'],
    queryFn: () => client.get("/settings/school-info").catch(() => null)
  });

  const activeClassList = useMemo(() => {
    const rawMax = (schoolInfo?.maxClass || "12TH").toUpperCase();
    const matchedIdx = ALL_CLASSES.findIndex((c) => rawMax.startsWith(c) || rawMax.includes(c));
    return matchedIdx !== -1 ? ALL_CLASSES.slice(0, matchedIdx + 1) : ALL_CLASSES;
  }, [schoolInfo]);

  // 2. Fetch Summary Statistics
  const { data: summary } = useQuery({
    queryKey: ['fees-summary', selectedClass, selectedSection],
    enabled: !!user && !authLoading,
    queryFn: async () => {
      const cls = selectedClass !== "All Classes" ? selectedClass : undefined;
      const sec = selectedSection !== "All Sections" ? selectedSection : undefined;
      const params = new URLSearchParams();
      if (cls) params.append("class", cls);
      if (sec) params.append("section", sec);
      return client.get(`/fees/summary?${params.toString()}`).catch(() => ({
        totalCollection: 0,
        totalDue: 0,
        paidStudents: 0,
        pendingStudents: 0,
        totalStudents: 0
      }));
    }
  });

  // 3. Fetch Students Fee Ledger List
  const { data: rawStudentsList = [], isLoading: listLoading } = useQuery({
    queryKey: ['fees-students', selectedClass, selectedSection, searchQuery],
    enabled: !!user && !authLoading && activeMode === 'individual',
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedClass !== "All Classes") params.append("class", selectedClass);
      if (selectedSection !== "All Sections") params.append("section", selectedSection);
      if (searchQuery) params.append("search", searchQuery);
      return client.get(`/fees/students?${params.toString()}`).catch(() => []);
    }
  });

  // 4. Fetch Defaulters List
  const { data: defaulters = [], isLoading: defaultersLoading } = useQuery({
    queryKey: ['fees-defaulters', selectedMonth, selectedClass],
    enabled: !!user && !authLoading && activeMode === 'defaulters',
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("month", selectedMonth);
      if (selectedClass !== "All Classes") params.append("class", selectedClass);
      return client.get(`/fees/defaulters?${params.toString()}`).catch(() => []);
    }
  });

  const studentsList = useMemo(() => {
    if (!Array.isArray(rawStudentsList)) return [];
    if (statusFilter === "ALL") return rawStudentsList;
    return rawStudentsList.filter((s: any) => s.status === statusFilter);
  }, [rawStudentsList, statusFilter]);

  const handleShowReceipt = (payment: any) => {
    setCurrentPayment(payment);
    setIsReceiptOpen(true);
  };

  const handleOpenAdmissionSlip = (student: any) => {
    setSelectedSlipStudent({
      id: student.studentId || student.student?.id,
      name: student.student?.name,
      admissionNo: student.student?.admissionNo,
      class: student.class,
      section: student.section,
      fatherName: student.student?.fatherName,
      motherName: student.student?.motherName,
      phone: student.student?.phone,
      transportOpted: student.student?.transportOpted
    });
    setIsAdmissionSlipOpen(true);
  };

  const scholarColumns = [
    {
      header: "Scholar Identity",
      cell: (student: any) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-9 w-9 border border-slate-200">
            <AvatarImage src={student.student?.image} className="object-cover" />
            <AvatarFallback className="bg-indigo-50 text-indigo-700 font-black text-[11px]">
              {getInitials(student.student?.name || 'SC')}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-0.5">
            <p className="font-bold text-slate-900 text-xs uppercase tracking-tight truncate max-w-[170px]">
              {student.student?.name}
            </p>
            <span className="font-mono text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
              {student.student?.admissionNo || 'ADM-PENDING'}
            </span>
          </div>
        </div>
      )
    },
    {
      header: "Grade & Section",
      className: "text-center",
      cell: (s: any) => (
        <div className="flex items-center justify-center gap-1.5">
          <Badge className="bg-slate-100 hover:bg-slate-100 text-slate-800 border-slate-200 text-[10px] font-bold uppercase px-2 py-0.5">
            Class {s.class}
          </Badge>
          <Badge className="bg-indigo-50 hover:bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px] font-bold uppercase px-1.5 py-0.5">
            {s.section || 'A'}
          </Badge>
        </div>
      )
    },
    {
      header: "Roll No",
      className: "text-center",
      cell: (s: any) => (
        <span className="font-mono font-bold text-slate-400 text-xs">
          #{s.student?.rollNo || '--'}
        </span>
      )
    },
    {
      header: "Guardian",
      cell: (s: any) => (
        <div className="space-y-0.5">
          <p className="text-slate-700 text-xs font-bold uppercase truncate max-w-[140px]">
            {s.student?.fatherName || '--'}
          </p>
          <p className="text-[10px] font-mono text-slate-400">
            {s.student?.phone ? `+91 ${s.student.phone}` : 'No phone'}
          </p>
        </div>
      )
    },
    {
      header: "Monthly Fee",
      className: "text-center",
      cell: (s: any) => (
        <span className="font-mono font-bold text-slate-900 text-xs">
          ₹{Number(s.monthlyDue || 1200).toLocaleString("en-IN")}
        </span>
      )
    },
    {
      header: "Dues Status",
      className: "text-center",
      cell: (student: any) => {
        const status = student.status || 'PENDING';
        const isPaid = status === 'PAID';
        const isPartial = status === 'PARTIAL';

        return (
          <span
            className={cn(
              "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border inline-block",
              isPaid
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : isPartial
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-rose-50 text-rose-700 border-rose-200"
            )}
          >
            {isPaid ? "Paid" : isPartial ? "Partial" : "Pending"}
          </span>
        );
      }
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (student: any) => (
        <div className="flex items-center justify-end gap-2">
          <PaymentDialog
            student={student}
            month={selectedMonth}
            onPaymentSuccess={(payment) => handleShowReceipt(payment)}
          />

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenAdmissionSlip(student)}
            className="h-8 px-2.5 rounded-xl border-slate-200 text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 font-bold text-[10px] uppercase tracking-wider cursor-pointer"
            title="View Official Fee Slip"
          >
            <Receipt size={13} className="mr-1 text-amber-500" /> Slip
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="flex-1 space-y-6 p-6 sm:p-8 bg-slate-50/50 min-h-screen font-sans text-slate-900">
      {/* 🏙️ SLEEK TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm shadow-indigo-600/20">
            <Wallet size={18} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase font-heading">
              Fees & Treasury <span className="text-indigo-600">Management</span>
            </h2>
            <p className="text-xs font-medium text-slate-400">
              Track student fee collection, monthly arrears & class fee matrix
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveMode('individual')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer",
                activeMode === 'individual'
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              Scholars Ledger
            </button>
            <button
              onClick={() => setActiveMode('defaulters')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer",
                activeMode === 'defaulters'
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              Monthly Arrears
            </button>
          </div>

          <Button
            onClick={() => router.push('/fees/structure')}
            className="h-9 px-4 bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <Settings2 size={14} /> Fee Matrix Setup
          </Button>
        </div>
      </div>

      {/* 📊 4 EXECUTIVE BALANCED KPI METRIC CARDS */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 animate-in fade-in duration-300">
        {/* Total Collected */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-emerald-200 transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Verified Collection
            </span>
            <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet size={14} />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 font-mono mt-3">
            ₹{(summary?.totalCollection || 0).toLocaleString("en-IN")}
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 mt-2">
            <TrendingUp size={12} /> Treasury Cleared Credits
          </div>
        </div>

        {/* Total Arrears */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-rose-200 transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Outstanding Arrears
            </span>
            <div className="h-7 w-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Clock size={14} />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600 font-mono mt-3">
            ₹{(summary?.totalDue || 0).toLocaleString("en-IN")}
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-rose-600 mt-2">
            <AlertCircle size={12} /> {summary?.pendingStudents || 0} Scholars Due
          </div>
        </div>

        {/* Clearance Receipts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-indigo-200 transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Clearance Receipts
            </span>
            <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Receipt size={14} />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-600 font-mono mt-3">
            {summary?.paidStudents || 0}
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">
            Fully Cleared Accounts
          </p>
        </div>

        {/* Total Enrolled Scholars */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Total Enrolled Scholars
            </span>
            <div className="h-7 w-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Users size={14} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-3">
            {summary?.totalStudents || 0}
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">
            Active School Registry
          </p>
        </div>
      </div>

      {/* 🧬 UNIFIED FILTER BAR (Only Dropdowns & Status Pills, zero redundant search) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 px-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Class Filter */}
          <div className="relative">
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 px-3 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase outline-none cursor-pointer text-slate-700"
            >
              <option value="All Classes">All Classes</option>
              {activeClassList.map((cls) => (
                <option key={cls} value={cls}>
                  Class {cls}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={13} />
          </div>

          {/* Section Filter */}
          <div className="relative">
            <select
              value={selectedSection}
              onChange={(e) => {
                setSelectedSection(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 px-3 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase outline-none cursor-pointer text-slate-700"
            >
              <option value="All Sections">All Sections</option>
              {SECTIONS.map((sec) => (
                <option key={sec} value={sec}>
                  Section {sec}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={13} />
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          {(["ALL", "PAID", "PENDING"] as const).map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setCurrentPage(1);
              }}
              className={cn(
                "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                statusFilter === st
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-400 hover:text-slate-700"
              )}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* 📄 ACTIVE TAB CONTENT */}
      {activeMode === 'individual' ? (
        <AppTable
          columns={scholarColumns}
          data={studentsList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)}
          isLoading={listLoading}
          searchPlaceholder="Search scholar by name, admission ID, phone..."
          searchQuery={searchQuery}
          onSearchChange={(val) => { setSearchQuery(val); setCurrentPage(1); }}
          pagination={{
            currentPage,
            totalPages: Math.ceil(studentsList.length / itemsPerPage) || 1,
            onPageChange: (p) => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); },
            totalItems: studentsList.length
          }}
        />
      ) : (
        <Card className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-50/50">
            <div>
              <h4 className="text-base font-black uppercase tracking-tight text-slate-900">
                Monthly Arrears Hub • {selectedMonth}
              </h4>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                {defaulters.length} scholars detected with pending dues for this cycle
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="h-9 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase outline-none shadow-xs"
              >
                {MONTHS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            {defaultersLoading ? (
              <TableRowSkeleton columns={6} rows={5} />
            ) : defaulters.length > 0 ? (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/60 border-b border-slate-200 font-bold text-slate-600 uppercase tracking-wider text-[10px]">
                    <th className="p-3.5 pl-6">Scholar Name</th>
                    <th className="p-3.5">Admission ID</th>
                    <th className="p-3.5 text-center">Grade</th>
                    <th className="p-3.5">Guardian / Phone</th>
                    <th className="p-3.5 text-right">Monthly Due</th>
                    <th className="p-3.5 pr-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {defaulters.map((d: any) => (
                    <tr key={d.admissionNo || d.studentId} className="hover:bg-slate-50/70 transition-all">
                      <td className="p-3.5 pl-6 font-bold text-slate-900 uppercase">
                        {d.name}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-indigo-600">
                        {d.admissionNo}
                      </td>
                      <td className="p-3.5 text-center">
                        <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-[10px] font-bold uppercase">
                          Class {d.class}-{d.section || 'A'}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-slate-600 font-medium">
                        {d.fatherName || '--'} ({d.phone ? `+91 ${d.phone}` : 'N/A'})
                      </td>
                      <td className="p-3.5 text-right font-mono font-black text-rose-600">
                        ₹{Number(d.monthlyDue || 1200).toLocaleString("en-IN")}
                      </td>
                      <td className="p-3.5 pr-6 text-right">
                        <Button
                          size="sm"
                          onClick={() => {
                            setSearchQuery(d.admissionNo);
                            setActiveMode('individual');
                          }}
                          className="h-8 px-3.5 text-[10px] font-bold uppercase bg-slate-900 hover:bg-indigo-600 text-white rounded-xl shadow-xs"
                        >
                          Collect
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-20 text-center text-slate-400 space-y-2">
                <ShieldCheck size={40} className="mx-auto text-emerald-500 opacity-60 mb-2" />
                <h4 className="text-sm font-bold uppercase text-slate-700">No Arrears Detected</h4>
                <p className="text-xs text-slate-400">All registered scholars have cleared their fees for {selectedMonth}.</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* 🧾 OFFICIAL ADMISSION FEE SLIP MODAL */}
      <AdmissionFeeSlipModal
        isOpen={isAdmissionSlipOpen}
        onOpenChange={setIsAdmissionSlipOpen}
        studentId={selectedSlipStudent?.id}
        studentData={selectedSlipStudent}
      />

      {/* 🧾 REGULAR PAYMENT RECEIPT DIALOG */}
      {currentPayment && (
        <FeeReceiptDialog
          isOpen={isReceiptOpen}
          onClose={() => setIsReceiptOpen(false)}
          paymentData={currentPayment}
        />
      )}
    </div>
  );
}
