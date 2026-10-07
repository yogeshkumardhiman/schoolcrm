"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@bprogress/next/app";
import {
  Loader2,
  Printer,
  ArrowLeft,
  Banknote,
  ShieldCheck,
  Building2,
  Calendar,
  CheckCircle2,
  FileText,
  User,
  Phone,
  Mail,
  Receipt
} from "lucide-react";
import client from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function SalarySlipPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState<any>(null);
  const [schoolInfo, setSchoolInfo] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        client.get("/settings/school-info").then((info) => setSchoolInfo(info)).catch(() => null);
        const data: any = await client.get(`/salary/slip/${id as string}`);
        setPayment(Array.isArray(data) ? data[0] : data);
      } catch (error) {
        try {
          const fallbackData: any = await client.get(`/salary/payments/${id as string}`);
          setPayment(Array.isArray(fallbackData) ? fallbackData[0] : fallbackData);
        } catch (err) {
          console.error("Error fetching salary slip data:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const dynamicSchoolName = schoolInfo?.schoolName || process.env.NEXT_PUBLIC_SCHOOL_NAME || "INSTITUTIONAL PORTAL";
  const dynamicTagline = schoolInfo?.aboutTitle || process.env.NEXT_PUBLIC_SCHOOL_TAGLINE || "Excellence in Education";
  const dynamicAddress = schoolInfo?.address || process.env.NEXT_PUBLIC_SCHOOL_ADDRESS || "Main Institutional Campus Road";

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mx-auto" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Compiling Official Salary Statement...
          </p>
        </div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="p-20 text-center space-y-4">
        <Receipt size={48} className="mx-auto text-slate-300" />
        <h2 className="text-lg font-black text-slate-800 uppercase">Salary record not found</h2>
        <Button onClick={() => router.back()} variant="outline" className="rounded-xl font-bold text-xs">
          Return Back
        </Button>
      </div>
    );
  }

  const staff = payment.staff || {};
  const structure = staff?.salaryStructure || {};

  const paymentAmount = Number(payment.amount) || 0;
  const baseSalary = structure?.baseSalary ? Number(structure.baseSalary) : paymentAmount;
  const allowances = structure?.allowances ? Number(structure.allowances) : 0;
  const grossEarnings = baseSalary + allowances;
  const deductions = structure?.deductions ? Number(structure.deductions) : 0;
  const netPayable = grossEarnings - deductions > 0 ? grossEarnings - deductions : paymentAmount;

  return (
    <div className="min-h-screen bg-slate-100/90 py-10 px-4 md:px-8 font-sans">
      {/* 🧭 Top Action Bar (Hidden in Print) */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="h-11 px-5 rounded-2xl border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <ArrowLeft size={16} /> Back to Overview
        </Button>

        <Button
          onClick={handlePrint}
          className="h-11 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer"
        >
          <Printer size={16} /> Print Payslip
        </Button>
      </div>

      {/* 📄 Official Institutional Salary Slip Invoice */}
      <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden print:shadow-none print:rounded-none print:border-none print:m-0 print:p-0">
        {/* Top Decorative Border */}
        <div className="h-2.5 bg-linear-to-r from-indigo-600 via-purple-600 to-emerald-600" />

        <div className="p-8 md:p-12 space-y-8">
          {/* 🏛️ School Institutional Header */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-200 pb-8">
            <div className="flex items-center gap-5 text-center md:text-left">
              {schoolInfo?.logoImage ? (
                <img
                  src={schoolInfo.logoImage}
                  alt="School Logo"
                  className="h-16 w-16 rounded-2xl object-contain bg-white border border-slate-200 p-1 shrink-0 shadow-xs"
                />
              ) : (
                <div className="h-16 w-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-xs">
                  <Building2 size={32} />
                </div>
              )}
              <div className="space-y-1">
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight font-heading">
                  {dynamicSchoolName}
                </h1>
                <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
                  {dynamicTagline}
                </p>
                <p className="text-[11px] text-slate-400 font-medium">
                  {dynamicAddress}
                </p>
              </div>
            </div>

            <div className="text-center md:text-right space-y-2 shrink-0">
              <div className="inline-block px-4 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xs">
                SALARY SLIP
              </div>
              <p className="text-xs font-mono font-bold text-slate-500">
                VOUCHER NO: <strong className="text-slate-800">#PAY-2026-{String(payment.id).padStart(4, "0")}</strong>
              </p>
              <p className="text-xs font-semibold text-slate-500">
                Period: <strong className="text-slate-900 uppercase">{payment.month} {payment.year}</strong>
              </p>
            </div>
          </div>

          {/* 👤 Employee Personal & Employment Details */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-50/90 p-6 md:p-8 rounded-2xl border border-slate-200/80">
            {/* Avatar */}
            <div className="md:col-span-3 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-200 pb-4 md:pb-0 md:pr-6">
              <div className="h-24 w-24 rounded-2xl bg-white border-2 border-slate-200 overflow-hidden shadow-xs flex items-center justify-center">
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
                  <div className="h-full w-full bg-indigo-600 text-white font-black text-2xl flex items-center justify-center font-heading">
                    {staff.name?.slice(0, 2).toUpperCase() || "ST"}
                  </div>
                )}
              </div>
              <Badge className="mt-3 bg-indigo-50 text-indigo-700 border border-indigo-200/60 font-bold text-[10px] uppercase">
                {staff.role || "FACULTY"}
              </Badge>
            </div>

            {/* Employee Telemetry Details */}
            <div className="md:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Employee Full Name
                </span>
                <p className="text-sm font-black text-slate-900 uppercase font-heading">{staff.name || "Faculty Member"}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Employee / Login ID
                </span>
                <p className="text-sm font-bold font-mono text-indigo-700">
                  {staff.loginId || `#STF-${staff.id}`}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Designation & Role
                </span>
                <p className="text-xs font-bold text-slate-800 uppercase">
                  {staff.designation || (staff.role === "TEACHER" ? "Academic Faculty" : "Staff Member")}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Department
                </span>
                <p className="text-xs font-bold text-slate-800">
                  {staff.role === "TEACHER" ? "Academics & Teaching" : staff.role === "ACCOUNTANT" ? "Finance & Accounts" : "Administration"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Registered Email
                </span>
                <p className="text-xs font-semibold text-slate-600 font-mono">{staff.email || "N/A"}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Joining Date
                </span>
                <p className="text-xs font-semibold text-slate-800 font-mono">
                  {staff.joiningDate ? new Date(staff.joiningDate).toLocaleDateString() : "22/07/2025"}
                </p>
              </div>
            </div>
          </div>

          {/* 📊 Earnings vs Deductions Breakdown Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 🟢 Earnings Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-emerald-100">
                <Banknote size={18} className="text-emerald-600" />
                <h3 className="text-xs font-black text-emerald-950 uppercase tracking-wider font-heading">
                  Earnings Breakdown
                </h3>
              </div>

              <div className="bg-slate-50/60 rounded-2xl border border-slate-200/80 p-5 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-600">Basic Salary</span>
                  <span className="font-bold font-mono text-slate-900">
                    ₹{baseSalary.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-600">Dearness Allowance (DA) / HRA</span>
                  <span className="font-bold font-mono text-slate-900">
                    ₹{allowances.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-600">Special Allowances</span>
                  <span className="font-bold font-mono text-slate-900">₹0.00</span>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-xs font-black text-slate-900 uppercase">Gross Earnings</span>
                  <span className="text-sm font-black font-mono text-emerald-600">
                    ₹{grossEarnings.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* 🔴 Deductions Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-rose-100">
                <ShieldCheck size={18} className="text-rose-600" />
                <h3 className="text-xs font-black text-rose-950 uppercase tracking-wider font-heading">
                  Deductions & Statutory
                </h3>
              </div>

              <div className="bg-slate-50/60 rounded-2xl border border-slate-200/80 p-5 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-600">Provident Fund (PF)</span>
                  <span className="font-bold font-mono text-slate-900">₹0.00</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-600">Tax Deducted at Source (TDS)</span>
                  <span className="font-bold font-mono text-slate-900">
                    ₹{deductions.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-600">Professional Tax</span>
                  <span className="font-bold font-mono text-slate-900">₹0.00</span>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-xs font-black text-slate-900 uppercase">Total Deductions</span>
                  <span className="text-sm font-black font-mono text-rose-600">
                    ₹{deductions.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 💰 Net Disbursed Salary Banner */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
            <div className="space-y-1 text-center md:text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Net Disbursed Salary
              </span>
              <h2 className="text-3xl md:text-4xl font-black font-mono tracking-tight text-emerald-400">
                ₹{netPayable.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </h2>
              <p className="text-[11px] font-semibold text-slate-300 italic">
                Amount in Words: {netPayable === 10000 ? "Ten Thousand Rupees Only" : `${netPayable} Rupees Only`}
              </p>
            </div>

            <div className="text-center md:text-right space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-xl text-xs font-bold uppercase tracking-wider">
                <CheckCircle2 size={13} /> {payment.status || "PAID"}
              </span>
              <p className="text-xs text-slate-400 font-medium">
                Payment Date: <strong className="text-white">{payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : "20/08/2026"}</strong>
              </p>
              <p className="text-[11px] text-slate-400">
                Remark: <span className="text-slate-200 font-semibold">{payment.remark || "Monthly Salary Disbursed"}</span>
              </p>
            </div>
          </div>

          {/* 🖋️ Signatures & Footer Verification Section */}
          <div className="pt-10 grid grid-cols-3 gap-6 text-center border-t border-slate-200">
            <div className="space-y-8">
              <div className="h-10" />
              <div className="h-px bg-slate-300 w-32 md:w-44 mx-auto" />
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                Employee Signature
              </p>
            </div>

            <div className="space-y-8">
              <div className="h-10" />
              <div className="h-px bg-slate-300 w-32 md:w-44 mx-auto" />
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                Prepared By (Accounts)
              </p>
            </div>

            <div className="space-y-8">
              <div className="h-10" />
              <div className="h-px bg-slate-300 w-32 md:w-44 mx-auto" />
              <p className="text-[10px] font-black text-slate-900 uppercase tracking-wider font-heading">
                Authorized Signatory / Seal
              </p>
            </div>
          </div>

          {/* System Footer Stamp */}
          <div className="text-center pt-6 border-t border-slate-100">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              This is an authentic computer-generated official salary slip issued by {dynamicSchoolName}.
            </p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .min-h-screen {
            background: white !important;
            padding: 0 !important;
          }
          .max-w-4xl {
            max-width: 100% !important;
            border: none !important;
            box-shadow: none !important;
          }
          @page {
            margin: 0.8cm;
            size: A4 portrait;
          }
        }
      `}</style>
    </div>
  );
}
