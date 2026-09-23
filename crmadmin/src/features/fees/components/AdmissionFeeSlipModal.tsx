"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Printer,
  Receipt,
  FileText,
  School,
  Building2,
  Calendar,
  CreditCard,
  Layers,
  ChevronDown,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/dialogbox/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import client from "@/lib/client";
import toast from "react-hot-toast";
import { APP_CONFIG } from "@/constants/config";

interface AdmissionFeeSlipModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  studentId?: string | number;
  studentData?: any;
  isClassStructureOnly?: boolean;
}

export default function AdmissionFeeSlipModal({
  isOpen,
  onOpenChange,
  studentId,
  studentData,
  isClassStructureOnly = false,
}: AdmissionFeeSlipModalProps) {
  const [slipData, setSlipData] = useState<any>(null);
  const [schoolSettings, setSchoolSettings] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [paymentMode, setPaymentMode] = useState<string>("CASH");
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const printRef = useRef<HTMLDivElement>(null);

  const isClassPreview = isClassStructureOnly || Boolean(studentData?.isClassStructureOnly);

  useEffect(() => {
    if (!isOpen) return;

    const fetchSlip = async () => {
      setLoading(true);
      try {
        // 1. Fetch dynamic school info from database
        let currentSchoolInfo: any = null;
        try {
          currentSchoolInfo = await client.get("/settings/school-info");
          setSchoolSettings(currentSchoolInfo);
        } catch (e) {
          console.warn("Could not fetch school info, using config defaults", e);
        }

        const schoolName =
          currentSchoolInfo?.schoolName ||
          process.env.NEXT_PUBLIC_SCHOOL_NAME ||
          APP_CONFIG.institution.fullName;
        const tagline =
          currentSchoolInfo?.aboutTitle ||
          process.env.NEXT_PUBLIC_SCHOOL_TAGLINE ||
          APP_CONFIG.institution.motto;
        const affiliationNo =
          process.env.NEXT_PUBLIC_SCHOOL_AFFILIATION ||
          "Recognized Educational Institution";
        const address =
          currentSchoolInfo?.address ||
          process.env.NEXT_PUBLIC_SCHOOL_ADDRESS ||
          APP_CONFIG.institution.address;
        const phone =
          currentSchoolInfo?.contactPhone ||
          process.env.NEXT_PUBLIC_SCHOOL_PHONE ||
          APP_CONFIG.institution.contactPhone;
        const email =
          currentSchoolInfo?.contactEmail ||
          process.env.NEXT_PUBLIC_SCHOOL_EMAIL ||
          APP_CONFIG.institution.contactEmail;

        // 2. Class-Only Structure Mode (For /fees/structure page)
        if (isClassPreview) {
          const targetClass = studentData?.class || "NSY";
          let struct: any = null;
          try {
            struct = await client.get(`/fees/structure/class/${targetClass}`);
          } catch (e) {
            console.warn("Could not fetch structure for class", e);
          }

          const comps = (struct?.components || []).map((c: any) => ({
            name: c.name || "Fee Component",
            amount: Number(c.amount || 0),
            frequency: c.frequency || "ONE_TIME",
            category: c.category || (c.frequency === "MONTHLY" ? "RECURRING" : "ADMISSION"),
          }));

          const admissionComps = comps.filter((c: any) => c.frequency === "ONE_TIME" || c.category === "ADMISSION");
          const monthlyComps = comps.filter((c: any) => c.frequency === "MONTHLY");

          const totalAdmission = admissionComps.reduce((sum: number, c: any) => sum + c.amount, 0);
          const totalMonthly = monthlyComps.reduce((sum: number, c: any) => sum + c.amount, 0);
          const annualEstimate = totalAdmission + totalMonthly * 12;

          setSlipData({
            school: {
              name: schoolName,
              tagline,
              affiliationNo,
              address,
              phone,
              email,
            },
            classInfo: {
              class: targetClass,
              session: studentData?.session || "2026-2027",
            },
            feeBreakdown: {
              components: comps,
              totalAdmission,
              totalMonthly,
              annualEstimate,
            },
            isClassPreview: true,
          });
          return;
        }

        // 3. Real Student Slip Mode (When enrolled or from Student Profile)
        if (studentId) {
          const res: any = await client.get(`/fees/admission-slip/${studentId}`);
          setSlipData(res);
        } else if (studentData && !studentData.isClassStructureOnly) {
          const studentClass = studentData.class || "NSY";
          let struct: any = null;
          try {
            struct = await client.get(`/fees/structure/class/${studentClass}`);
          } catch (e) {
            console.warn("Could not fetch structure for class", e);
          }

          const comps = (struct?.components || []).map((c: any) => ({
            name: c.name || "Fee Component",
            amount: Number(c.amount || 0),
            frequency: c.frequency || "ONE_TIME",
            category: "ADMISSION",
          }));

          const gross = comps.reduce((sum: number, c: any) => sum + c.amount, 0);

          setSlipData({
            school: {
              name: schoolName,
              tagline,
              affiliationNo,
              address,
              phone,
              email,
            },
            scholar: {
              id: studentData.id,
              name: studentData.name,
              admissionNo: studentData.admissionNo || "ADM-PENDING",
              rollNo: studentData.rollNo || "N/A",
              class: studentData.class,
              section: studentData.section || "A",
              session: studentData.session || "2026-2027",
              fatherName: studentData.fatherName || "N/A",
              motherName: studentData.motherName || "N/A",
              phone: studentData.phone || "N/A",
              address: studentData.address || "N/A",
              admissionDate: studentData.createdAt || new Date(),
            },
            feeBreakdown: {
              components: comps,
              grossTotal: gross,
              discount: 0,
              netPayable: gross,
              paidAmount: gross,
              dueBalance: 0,
            },
            receiptNo: `REC-ADM-${studentData.admissionNo || "001"}`,
            generatedAt: new Date(),
          });
        }
      } catch (err: any) {
        console.error("Error loading fee slip data:", err);
        toast.error("Failed to load fee information");
      } finally {
        setLoading(false);
      }
    };

    fetchSlip();
  }, [isOpen, studentId, studentData, isClassPreview]);

  const handlePrint = () => {
    window.print();
  };

  // Convert numbers to Indian Currency Words
  const numberToWords = (num: number): string => {
    if (!num || isNaN(num) || num === 0) return "Zero Rupees Only";
    const a = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const b = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    const convertLessThanOneThousand = (n: number): string => {
      let str = "";
      if (n >= 100) {
        str += a[Math.floor(n / 100)] + " Hundred ";
        n %= 100;
      }
      if (n >= 20) {
        str += b[Math.floor(n / 10)] + " ";
        n %= 10;
      }
      if (n > 0) {
        str += a[n] + " ";
      }
      return str.trim();
    };

    let result = "";
    const crore = Math.floor(num / 10000000);
    num %= 10000000;
    const lakh = Math.floor(num / 100000);
    num %= 100000;
    const thousand = Math.floor(num / 1000);
    num %= 1000;

    if (crore > 0) result += convertLessThanOneThousand(crore) + " Crore ";
    if (lakh > 0) result += convertLessThanOneThousand(lakh) + " Lakh ";
    if (thousand > 0) result += convertLessThanOneThousand(thousand) + " Thousand ";
    if (num > 0) result += convertLessThanOneThousand(num);

    return `Rupees ${result.trim()} Only`;
  };

  const grossTotal = Number(slipData?.feeBreakdown?.grossTotal || 0);
  const netPayable = Math.max(0, grossTotal - discountAmount);
  const paidAmount = netPayable;

  // Resolve dynamic school metadata
  const dynamicSchoolName =
    slipData?.school?.name ||
    schoolSettings?.schoolName ||
    process.env.NEXT_PUBLIC_SCHOOL_NAME ||
    APP_CONFIG.institution.fullName;

  const rawTagline =
    slipData?.school?.tagline ||
    schoolSettings?.aboutTitle ||
    process.env.NEXT_PUBLIC_SCHOOL_TAGLINE ||
    "Excellence in Education";

  const dynamicTagline =
    rawTagline.toLowerCase().startsWith("about")
      ? `${dynamicSchoolName} • Excellence in Education`
      : rawTagline;

  const dynamicAffiliation =
    slipData?.school?.affiliationNo ||
    process.env.NEXT_PUBLIC_SCHOOL_AFFILIATION ||
    "Recognized Educational Institution";

  const dynamicAddress =
    slipData?.school?.address ||
    schoolSettings?.address ||
    process.env.NEXT_PUBLIC_SCHOOL_ADDRESS ||
    APP_CONFIG.institution.address;

  const dynamicPhone =
    slipData?.school?.phone ||
    schoolSettings?.contactPhone ||
    process.env.NEXT_PUBLIC_SCHOOL_PHONE ||
    APP_CONFIG.institution.contactPhone;

  const rawEmail =
    slipData?.school?.email ||
    schoolSettings?.contactEmail ||
    process.env.NEXT_PUBLIC_SCHOOL_EMAIL ||
    "";

  const dynamicEmail =
    !rawEmail || (rawEmail.includes("sdmpublicschool") && !dynamicSchoolName.toLowerCase().includes("sdm"))
      ? `info@${dynamicSchoolName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`
      : rawEmail;

  // -------------------------------------------------------------
  // 📋 RENDER 1: CLASS FEE STRUCTURE & PROSPECTUS (NO FAKE STUDENT)
  // -------------------------------------------------------------
  const renderClassStructureProspectus = () => {
    if (!slipData) return null;
    const { classInfo, feeBreakdown } = slipData;

    return (
      <div className="bg-white p-6 sm:p-10 rounded-2xl border-2 border-slate-900 text-slate-900 font-sans text-xs relative overflow-hidden print:border-slate-800 print:p-6 print:rounded-none">
        {/* DYNAMIC WATERMARK */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none select-none px-6">
          <span className="text-7xl sm:text-8xl font-black rotate-[-30deg] uppercase tracking-wider text-center">
            {dynamicSchoolName}
          </span>
        </div>

        {/* HEADER */}
        <div className="border-b-2 border-slate-900 pb-4 text-center relative print:border-slate-800">
          <div className="inline-block absolute top-0 right-0 bg-indigo-900 text-white px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest print:bg-slate-800">
            OFFICIAL PROSPECTUS
          </div>

          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight font-heading text-slate-900">
            {dynamicSchoolName}
          </h2>
          <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mt-1">
            {dynamicTagline} • {dynamicAffiliation}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {dynamicAddress} | Ph: {dynamicPhone} | Email: {dynamicEmail}
          </p>

          <div className="mt-3 inline-block bg-slate-900 text-white px-6 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
            CLASS FEE STRUCTURE & SCHEDULE (कक्षा अनुसार शुल्क विवरण)
          </div>
        </div>

        {/* CLASS & SESSION METADATA */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-4 border-b border-slate-300 text-xs bg-slate-50 -mx-6 sm:-mx-10 px-6 sm:px-10 print:bg-transparent">
          <div>
            <span className="text-[9px] font-bold text-slate-500 uppercase block">GRADE / CLASS:</span>
            <strong className="text-base font-black text-indigo-700 uppercase font-heading">
              CLASS {classInfo.class}
            </strong>
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-500 uppercase block">ACADEMIC SESSION:</span>
            <strong className="text-sm font-black text-slate-900">{classInfo.session}</strong>
          </div>
          <div className="sm:text-right">
            <span className="text-[9px] font-bold text-slate-500 uppercase block">DOCUMENT TYPE:</span>
            <strong className="text-xs font-bold text-slate-700">Official Fee Schedule</strong>
          </div>
        </div>

        {/* FEE HEADS BREAKDOWN TABLE */}
        <div className="py-4">
          <table className="w-full text-left border-collapse border border-slate-300 text-xs">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 font-black text-slate-700 uppercase tracking-wider text-[11px]">
                <th className="p-3 border-r border-slate-300 w-12 text-center">#</th>
                <th className="p-3 border-r border-slate-300">Fee Head / Component Particulars</th>
                <th className="p-3 border-r border-slate-300 text-center w-36">Category</th>
                <th className="p-3 border-r border-slate-300 text-center w-36">Billing Frequency</th>
                <th className="p-3 text-right w-36">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {feeBreakdown.components && feeBreakdown.components.length > 0 ? (
                feeBreakdown.components.map((comp: any, index: number) => (
                  <tr key={index} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="p-3 border-r border-slate-300 text-center font-bold text-slate-500">
                      {index + 1}
                    </td>
                    <td className="p-3 border-r border-slate-300 font-bold text-slate-900 text-xs">
                      {comp.name}
                    </td>
                    <td className="p-3 border-r border-slate-300 text-center font-bold text-[10px] uppercase text-slate-600">
                      {comp.category || "GENERAL"}
                    </td>
                    <td className="p-3 border-r border-slate-300 text-center font-bold text-[10px] uppercase text-indigo-700">
                      {comp.frequency === "ONE_TIME" ? "One-Time (Admission)" : comp.frequency || "Monthly"}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900 text-xs">
                      ₹ {Number(comp.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 font-bold">
                    No individual fee components configured yet for this class.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PACKAGE TOTALS SUMMARY */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
            <p className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">
              Total One-Time Admission Package:
            </p>
            <h4 className="text-xl font-black text-emerald-800 font-mono">
              ₹ {feeBreakdown.totalAdmission.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </h4>
            <p className="text-[9px] text-emerald-600 font-medium">
              Payable once at the time of student enrollment.
            </p>
          </div>

          <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-1">
            <p className="text-[10px] font-black text-indigo-700 uppercase tracking-wider">
              Total Monthly Tuition Fee:
            </p>
            <h4 className="text-xl font-black text-indigo-800 font-mono">
              ₹ {feeBreakdown.totalMonthly.toLocaleString("en-IN", { minimumFractionDigits: 2 })} / Month
            </h4>
            <p className="text-[9px] text-indigo-600 font-medium">
              Payable monthly/quarterly by the 10th of every billing cycle.
            </p>
          </div>
        </div>

        {/* POLICY NOTES */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 mt-3 space-y-1 text-[10px] text-slate-600 print:bg-transparent">
          <p className="font-bold uppercase text-slate-800 text-[10px]">Payment Guidelines & Terms:</p>
          <ul className="list-disc list-inside space-y-0.5 text-[9px]">
            <li>Fee once deposited is strictly non-refundable and non-transferable under any circumstances.</li>
            <li>Accepted payment modes: UPI / QR Code, Net Banking / NEFT, Bank Cheque, and Official Cash Counter.</li>
            <li>Receipts are generated immediately upon successful transaction verification.</li>
          </ul>
        </div>

        {/* SIGNATURES & STAMPS */}
        <div className="grid grid-cols-2 gap-10 pt-10 mt-6 border-t border-slate-300 text-center text-[10px]">
          <div>
            <div className="h-10 border-b border-dashed border-slate-400 mb-1" />
            <p className="font-bold text-slate-600 uppercase">Accounts Officer / Bursar</p>
          </div>
          <div>
            <div className="h-10 border-b border-dashed border-slate-400 mb-1 flex items-end justify-center">
              <span className="text-[8px] font-black text-indigo-700 uppercase tracking-widest">[ OFFICIAL SEAL ]</span>
            </div>
            <p className="font-black text-slate-900 uppercase">Principal Signature & Stamp</p>
          </div>
        </div>
      </div>
    );
  };

  // -------------------------------------------------------------
  // 🧾 RENDER 2: REAL STUDENT ADMISSION FEE RECEIPT (DUAL TEAR-OFF)
  // -------------------------------------------------------------
  const renderStudentAdmissionReceipt = (copyTitle: string) => {
    if (!slipData || !slipData.scholar) return null;
    const { scholar, feeBreakdown } = slipData;
    const formattedDate = new Date(scholar.admissionDate).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const cleanPrefix = (
      schoolSettings?.domainPrefix ||
      dynamicSchoolName.replace(/[^a-zA-Z]/g, "").substring(0, 3) ||
      "ADM"
    ).toUpperCase();

    const activeReceiptNo = (slipData.receiptNo || `REC-ADM-${scholar.admissionNo || "001"}`).replace(/SDM/gi, cleanPrefix);
    const activeAdmissionNo = (scholar.admissionNo || "ADM-001").replace(/SDM/gi, cleanPrefix);

    return (
      <div className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-slate-900 text-slate-900 font-sans text-xs relative overflow-hidden print:border-slate-800 print:p-4 print:rounded-none">
        {/* DYNAMIC WATERMARK */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none select-none px-6">
          <span className="text-7xl sm:text-8xl font-black rotate-[-30deg] uppercase tracking-wider text-center">
            {dynamicSchoolName}
          </span>
        </div>

        {/* DYNAMIC HEADER */}
        <div className="border-b-2 border-slate-900 pb-3 text-center relative print:border-slate-800">
          <div className="inline-block absolute top-0 right-0 bg-slate-900 text-white px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest print:bg-slate-800">
            {copyTitle}
          </div>

          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight font-heading text-slate-900">
            {dynamicSchoolName}
          </h2>
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-0.5">
            {dynamicTagline} • {dynamicAffiliation}
          </p>
          <p className="text-[9px] text-slate-500 mt-0.5">
            {dynamicAddress} | Ph: {dynamicPhone} | Email: {dynamicEmail}
          </p>
          <div className="mt-2 inline-block bg-slate-100 border border-slate-300 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-slate-800">
            STUDENT ADMISSION FEE RECEIPT (प्रवेश शुल्क रसीद)
          </div>
        </div>

        {/* REAL SCHOLAR DOSSIER GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-3 border-b border-slate-300 text-[11px] bg-slate-50/60 -mx-6 sm:-mx-8 px-6 sm:px-8 print:bg-transparent">
          <div>
            <span className="text-[9px] font-bold text-slate-500 uppercase block">Receipt No:</span>
            <strong className="font-mono font-black text-slate-900">{activeReceiptNo}</strong>
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-500 uppercase block">Admission Date:</span>
            <strong className="font-black text-slate-900">{formattedDate}</strong>
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-500 uppercase block">Scholar Admission No:</span>
            <strong className="font-mono font-black text-indigo-700">{activeAdmissionNo}</strong>
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-500 uppercase block">Academic Session:</span>
            <strong className="font-black text-slate-900">{scholar.session}</strong>
          </div>

          <div className="sm:col-span-2">
            <span className="text-[9px] font-bold text-slate-500 uppercase block">Student Name:</span>
            <strong className="font-black text-slate-900 uppercase text-xs">{scholar.name}</strong>
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-500 uppercase block">Admitted Grade:</span>
            <strong className="font-black text-slate-900 uppercase">
              Class {scholar.class}-{scholar.section}
            </strong>
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-500 uppercase block">Roll No:</span>
            <strong className="font-black text-slate-900">{scholar.rollNo || "N/A"}</strong>
          </div>

          <div>
            <span className="text-[9px] font-bold text-slate-500 uppercase block">Father's Name:</span>
            <strong className="font-black text-slate-800 uppercase">{scholar.fatherName}</strong>
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-500 uppercase block">Mother's Name:</span>
            <strong className="font-black text-slate-800 uppercase">{scholar.motherName}</strong>
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-500 uppercase block">Primary Phone:</span>
            <strong className="font-mono font-bold text-slate-800">+91 {scholar.phone}</strong>
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-500 uppercase block">Payment Mode:</span>
            <Badge className="bg-emerald-100 text-emerald-800 border-none font-black text-[9px] uppercase px-2 py-0.5">
              {paymentMode}
            </Badge>
          </div>
        </div>

        {/* ITEMIZED TABLE */}
        <div className="py-3">
          <table className="w-full text-left border-collapse border border-slate-300 text-[11px]">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 font-black text-slate-700 uppercase tracking-wider text-[10px]">
                <th className="p-2 border-r border-slate-300 w-10 text-center">#</th>
                <th className="p-2 border-r border-slate-300">Fee Particulars / Component</th>
                <th className="p-2 border-r border-slate-300 text-center w-28">Period / Category</th>
                <th className="p-2 text-right w-28">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {feeBreakdown.components && feeBreakdown.components.length > 0 ? (
                feeBreakdown.components.map((comp: any, index: number) => (
                  <tr key={index} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="p-2 border-r border-slate-300 text-center font-bold text-slate-500">
                      {index + 1}
                    </td>
                    <td className="p-2 border-r border-slate-300 font-bold text-slate-900">
                      {comp.name}
                    </td>
                    <td className="p-2 border-r border-slate-300 text-center text-[10px] font-bold text-slate-600 uppercase">
                      {comp.frequency === "ONE_TIME" ? "On Admission" : comp.frequency || "Monthly"}
                    </td>
                    <td className="p-2 text-right font-mono font-bold text-slate-900">
                      ₹ {Number(comp.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-slate-400 font-bold">
                    Standard Admission & Tuition Package Configured.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-900 bg-slate-50 font-black text-slate-900">
                <td colSpan={3} className="p-2 text-right uppercase border-r border-slate-300 text-[10px]">
                  Gross Admission Package Fee:
                </td>
                <td className="p-2 text-right font-mono text-xs">
                  ₹ {grossTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </td>
              </tr>
              {discountAmount > 0 && (
                <tr className="bg-emerald-50/50 font-black text-emerald-800 text-[10px]">
                  <td colSpan={3} className="p-1.5 text-right uppercase border-r border-slate-300">
                    Concession / Special Scholarship:
                  </td>
                  <td className="p-1.5 text-right font-mono">
                    - ₹ {discountAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              )}
              <tr className="bg-slate-900 text-white font-black print:bg-slate-800">
                <td colSpan={3} className="p-2.5 text-right uppercase tracking-wider text-xs border-r border-slate-700">
                  Total Amount Received at Admission:
                </td>
                <td className="p-2.5 text-right font-mono text-sm">
                  ₹ {paidAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* AMOUNT IN WORDS & REMARKS */}
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 mt-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[10px] print:bg-transparent">
          <div>
            <span className="font-bold text-slate-500 uppercase block text-[9px]">Amount in Words:</span>
            <strong className="font-black text-slate-900">{numberToWords(paidAmount)}</strong>
          </div>
          <div className="text-right">
            <span className="font-bold text-slate-500 uppercase block text-[9px]">Balance Due:</span>
            <strong className="font-mono font-black text-emerald-700">₹ 0.00 (NIL / FULLY PAID)</strong>
          </div>
        </div>

        {/* SIGNATURES & STAMPS */}
        <div className="grid grid-cols-3 gap-6 pt-10 mt-4 border-t border-slate-300 text-center text-[10px]">
          <div>
            <div className="h-8 border-b border-dashed border-slate-400 mb-1" />
            <p className="font-bold text-slate-600 uppercase">Parent / Guardian Signature</p>
          </div>
          <div>
            <div className="h-8 border-b border-dashed border-slate-400 mb-1" />
            <p className="font-bold text-slate-600 uppercase">Cashier / Accounts Officer</p>
          </div>
          <div>
            <div className="h-8 border-b border-dashed border-slate-400 mb-1 flex items-end justify-center">
              <span className="text-[8px] font-black text-indigo-700 uppercase tracking-widest">[ OFFICIAL SEAL ]</span>
            </div>
            <p className="font-black text-slate-900 uppercase">Principal Signature & Stamp</p>
          </div>
        </div>

        {/* DYNAMIC FOOTER NOTE */}
        <div className="mt-3 pt-2 border-t border-slate-200 text-center text-[8px] text-slate-400 uppercase tracking-wider">
          * This is an officially generated computer fee receipt of {dynamicSchoolName}. Fee once deposited is non-refundable.
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] flex flex-col p-0 overflow-hidden rounded-3xl bg-slate-100 border border-slate-200 shadow-2xl">
        {/* MODAL CONTROLS HEADER */}
        <DialogHeader className="bg-slate-950 text-white p-5 px-6 sm:px-8 flex flex-row items-center justify-between shrink-0">
          <div>
            <DialogTitle className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
              <Receipt size={20} className="text-amber-400" />
              {isClassPreview ? "Class Fee Structure & Schedule" : "Student Admission Fee Receipt"}
            </DialogTitle>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              {isClassPreview
                ? "Official Institutional Fee Prospectus (कक्षा अनुसार शुल्क विवरण)"
                : "Official Printable Parent & School Copy (प्रवेश शुल्क रसीद)"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl h-10 px-5 shadow-lg shadow-emerald-600/30 flex items-center gap-2 cursor-pointer"
            >
              <Printer size={15} /> Print {isClassPreview ? "Fee Schedule" : "Receipt"}
            </Button>
          </div>
        </DialogHeader>

        {/* CUSTOMIZATION BAR FOR STUDENT RECEIPT */}
        {!isClassPreview && (
          <div className="bg-white border-b border-slate-200 p-4 px-6 sm:px-8 flex flex-wrap items-center justify-between gap-4 text-xs font-bold shrink-0">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 uppercase text-[10px] font-black">Payment Mode:</span>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="h-8 px-3 rounded-lg bg-slate-100 border-none text-xs font-bold text-slate-800 uppercase outline-none"
                >
                  <option value="CASH">Cash Payment</option>
                  <option value="UPI / QR">Online / UPI</option>
                  <option value="BANK CHEQUE">Bank Cheque</option>
                  <option value="NET BANKING">Net Banking / NEFT</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-500 uppercase text-[10px] font-black">Special Concession (₹):</span>
                <input
                  type="number"
                  value={discountAmount || ""}
                  placeholder="0"
                  onChange={(e) => setDiscountAmount(Number(e.target.value) || 0)}
                  className="h-8 w-24 px-3 rounded-lg bg-slate-100 border-none text-xs font-bold text-slate-800 font-mono outline-none"
                />
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Net Admission Fee: </span>
              <span className="text-sm font-black text-indigo-700 font-mono">
                ₹ {netPayable.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        )}

        {/* PRINTABLE BODY (SCROLLABLE) */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8 flex-1 bg-slate-200/50" ref={printRef}>
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 font-bold uppercase text-xs">
              <div className="h-8 w-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin mb-3" />
              Compiling Fee Information...
            </div>
          ) : slipData ? (
            isClassPreview ? (
              renderClassStructureProspectus()
            ) : (
              <div className="space-y-8 print:space-y-4">
                {/* TOP COPY: PARENT COPY */}
                {renderStudentAdmissionReceipt("PARENT'S COPY")}

                {/* DOTTED TEAR-OFF DIVIDER */}
                <div className="relative py-2 text-center select-none print:py-1">
                  <div className="border-b-2 border-dashed border-slate-400" />
                  <span className="absolute left-1/2 -translate-x-1/2 -top-2 bg-slate-200 px-3 text-[9px] font-black text-slate-600 uppercase tracking-widest rounded-full print:bg-white">
                    ✂ Cut along dotted line for School Archive Copy ✂
                  </span>
                </div>

                {/* BOTTOM COPY: SCHOOL COPY */}
                {renderStudentAdmissionReceipt("SCHOOL COPY (ACCOUNTS)")}
              </div>
            )
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400 font-bold text-xs uppercase">
              No fee data found.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
