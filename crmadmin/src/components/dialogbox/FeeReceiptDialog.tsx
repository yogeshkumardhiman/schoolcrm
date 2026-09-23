"use client";

import React, { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/dialogbox/dialog";
import { Button } from "@/components/ui/button";
import { Printer, X, Download, ReceiptIndianRupee } from "lucide-react";
import { APP_CONFIG } from "@/constants/config";

interface FeeReceiptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  paymentData: any;
}

export default function FeeReceiptDialog({
  isOpen,
  onClose,
  paymentData,
}: FeeReceiptDialogProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!paymentData) return null;

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Fee Receipt - ${paymentData.student?.name || "Student"}</title>
          <style>
            @page { size: A5 landscape; margin: 10mm; }
            body { font-family: 'Inter', sans-serif; color: #1e293b; line-height: 1.5; padding: 20px; }
            .receipt-container { border: 2px solid #e2e8f0; padding: 30px; border-radius: 12px; max-width: 800px; margin: 0 auto; position: relative; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 20px; }
            .school-info h1 { margin: 0; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #0f172a; }
            .school-info p { margin: 4px 0 0; font-size: 12px; color: #64748b; font-weight: 600; }
            .receipt-label { background: #0f172a; color: white; padding: 6px 16px; border-radius: 6px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
            .student-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .info-item { border-bottom: 1px dashed #e2e8f0; padding: 8px 0; display: flex; justify-content: space-between; }
            .info-item label { font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
            .info-item span { font-size: 13px; font-weight: 700; color: #1e293b; }
            .payment-table { w-full; margin-bottom: 30px; border-collapse: collapse; width: 100%; }
            .payment-table th { text-align: left; background: #f8fafc; padding: 12px; font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; }
            .payment-table td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; font-weight: 600; }
            .total-row { display: flex; justify-content: flex-end; align-items: center; gap: 20px; padding: 20px; background: #f8fafc; border-radius: 12px; }
            .total-label { font-size: 12px; font-weight: 800; color: #64748b; text-transform: uppercase; }
            .total-amount { font-size: 24px; font-weight: 900; color: #0f172a; }
            .footer { margin-top: 40px; display: flex; justify-content: space-between; align-items: flex-end; }
            .signature-block { text-align: center; }
            .signature-line { border-top: 1px solid #0f172a; width: 150px; margin-bottom: 8px; }
            .signature-block p { font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; }
            .timestamp { font-size: 9px; color: #94a3b8; font-style: normal; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="header">
              <div class="school-info">
                <h1>${APP_CONFIG.institution.name}</h1>
                <p>${APP_CONFIG.institution.hubName} • Authorized Payment Registry</p>
              </div>
              <div class="receipt-label">Fee Receipt</div>
            </div>

            <div class="student-info">
              <div>
                <div class="info-item"><label>Scholar Name</label><span>${paymentData.student?.name}</span></div>
                <div class="info-item"><label>Admission No</label><span>${paymentData.student?.admissionNo}</span></div>
                <div class="info-item"><label>Father's Name</label><span>${paymentData.student?.fatherName || "N/A"}</span></div>
              </div>
              <div>
                <div class="info-item"><label>Grade / Section</label><span>${paymentData.student?.class}-${paymentData.student?.section}</span></div>
                <div class="info-item"><label>Receipt No</label><span>#REC-${paymentData.id}</span></div>
                <div class="info-item"><label>Date Issued</label><span>${new Date(paymentData.createdAt).toLocaleDateString()}</span></div>
              </div>
            </div>

            <table class="payment-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Fiscal Month</th>
                  <th>Mode</th>
                  <th style="text-align: right;">Amount Paid</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Monthly Academic Fee</td>
                  <td>${paymentData.month}</td>
                  <td>${paymentData.mode}</td>
                  <td style="text-align: right;">₹${paymentData.amountPaid}</td>
                </tr>
              </tbody>
            </table>

            <div class="total-row">
              <span class="total-label">Net Collected</span>
              <span class="total-amount">₹${paymentData.amountPaid}</span>
            </div>

            <div class="footer">
              <div class="timestamp">Generated by ${APP_CONFIG.institution.fullName} ERP on ${new Date().toLocaleString()}</div>
              <div class="signature-block">
                <div class="signature-line"></div>
                <p>Authorized Signatory</p>
              </div>
            </div>
          </div>
          <script>window.print(); setTimeout(() => window.close(), 500);</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-none w-2xl bg-white rounded-3xl border-none shadow-2xl p-0 overflow-hidden m-4 max-h-[90vh] flex flex-col">
        <DialogHeader className="p-6 border-b border-slate-50 flex flex-row items-center justify-between shrink-0 bg-white z-20">
          <div>
            <DialogTitle className="text-xl font-black text-slate-900 tracking-tight  uppercase">Payment Receipt</DialogTitle>
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-[3px] mt-1">Transaction Verified • {APP_CONFIG.institution.fullName}</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handlePrint}
              className="bg-slate-900 hover:bg-black text-white h-10 px-6 rounded-xl font-bold uppercase text-[10px] tracking-widest flex items-center gap-2 shadow-lg shadow-slate-200 transition-all active:scale-95"
            >
              <Printer size={16} /> Print Receipt
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50 scrollbar-thin scrollbar-thumb-slate-200">
          <div ref={printRef} className="bg-white border-2 border-slate-200 rounded-[32px] p-10 shadow-xl relative overflow-hidden">
            {/* Background Watermark */}
            <ReceiptIndianRupee className="absolute -bottom-10 -right-10 text-slate-50 h-64 w-64 -rotate-12 pointer-events-none" />

            <div className="flex justify-between items-start mb-12 relative z-10">
              <div>
                <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tighter ">{APP_CONFIG.institution.name}</h4>
                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.2em] mt-1">{APP_CONFIG.institution.hubName}</p>
                <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-widest">
                  Institutional Fiscal Registry • Session {paymentData.session || "2026-2027"}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <div className="bg-emerald-600 text-white px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl shadow-emerald-100/50">
                  PAID & VERIFIED
                </div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Receipt: #REC-{paymentData.id || "0000"}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-12 mb-12 relative z-10">
              <div className="space-y-4">
                <div className="flex flex-col gap-1 border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scholar Identity</span>
                  <span className="text-sm font-black text-slate-900 uppercase  tracking-tight">{paymentData.student?.name || "N/A"}</span>
                </div>
                <div className="flex flex-col gap-1 border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Admission Number</span>
                  <span className="text-sm font-black text-indigo-600 tracking-widest">{paymentData.student?.admissionNo || "N/A"}</span>
                </div>
                <div className="flex flex-col gap-1 border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grade & Section</span>
                  <span className="text-sm font-black text-slate-900 uppercase tracking-widest">
                    Grade {paymentData.student?.class || "N/A"} - {paymentData.student?.section || "A"}
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex flex-col gap-1 border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fiscal Month</span>
                  <span className="text-sm font-black text-slate-900 uppercase ">{paymentData.month}</span>
                </div>
                <div className="flex flex-col gap-1 border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction Date</span>
                  <span className="text-sm font-black text-slate-900 uppercase">
                    {paymentData.createdAt ? new Date(paymentData.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString()}
                  </span>
                </div>
                <div className="flex flex-col gap-1 border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Guardian Name</span>
                  <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{paymentData.student?.fatherName}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-[32px] p-8 flex justify-between items-center text-white shadow-2xl relative z-10">
              <div className="flex items-center gap-6">
                <div className="h-20 w-20 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-xl shadow-indigo-500/20">
                  <span className="text-4xl">₹</span>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Net Collected Amount</p>
                  <p className="text-2xl font-black tracking-tighter ">₹{paymentData.amountPaid || "0.00"}</p>
                </div>
              </div>
              <div className="text-right border-l border-white/10 pl-10">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Payment Method</p>
                <p className="text-xl font-black uppercase tracking-[4px] text-indigo-400 ">{paymentData.mode}</p>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center gap-2 opacity-40">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Institutional Fiscal Record • Digitally Signed</p>
            <div className="h-1 w-32 bg-slate-200 rounded-full" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
