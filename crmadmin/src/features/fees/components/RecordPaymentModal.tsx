"use client";

import React, { useState, useEffect } from "react";
import { IndianRupee, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
} from "@/components/dialogbox/dialog";

interface RecordPaymentModalProps {
   isOpen: boolean;
   onOpenChange: (open: boolean) => void;
   onSubmit: (data: any) => void;
   isPending: boolean;
}

export default function RecordPaymentModal({
   isOpen,
   onOpenChange,
   onSubmit,
   isPending,
}: RecordPaymentModalProps) {
   const [paymentData, setPaymentData] = useState({
      amount: '',
      month: new Date().toLocaleString('default', { month: 'long' }),
      year: new Date().getFullYear().toString(),
      remark: 'Monthly Salary Disbursed'
   });

   // Reset state when modal opens
   useEffect(() => {
      if (isOpen) {
         setPaymentData({
            amount: '',
            month: new Date().toLocaleString('default', { month: 'long' }),
            year: new Date().getFullYear().toString(),
            remark: 'Monthly Salary Disbursed'
         });
      }
   }, [isOpen]);

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(paymentData);
   };

   return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
         <DialogTrigger className="h-11 px-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-[2px] transition-all flex items-center gap-2 shadow-md shadow-emerald-600/10 cursor-pointer">
            <IndianRupee size={15} /> Disburse Salary
         </DialogTrigger>
         <DialogContent className="sm:max-w-md p-0 overflow-hidden border border-slate-100 rounded-[24px] shadow-2xl bg-white">
            <DialogHeader className="bg-slate-900 text-white p-6">
               <DialogTitle className="text-xs font-black uppercase tracking-[3px]  font-heading">Payroll Disbursement Engine</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payable Amount (₹)</label>
                  <Input
                     type="number"
                     className="h-12 text-xs font-bold border-slate-200 focus:ring-slate-900 rounded-xl"
                     placeholder="Enter amount..."
                     value={paymentData.amount}
                     onChange={e => setPaymentData({ ...paymentData, amount: e.target.value })}
                     required
                  />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Month</label>
                     <select
                        className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                        value={paymentData.month}
                        onChange={e => setPaymentData({ ...paymentData, month: e.target.value })}
                     >
                        {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
                           <option key={m} value={m}>{m}</option>
                        ))}
                     </select>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Year</label>
                     <Input
                        className="h-12 text-xs font-bold border-slate-200 rounded-xl"
                        value={paymentData.year}
                        onChange={e => setPaymentData({ ...paymentData, year: e.target.value })}
                        required
                     />
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Notes / Remarks</label>
                  <Input
                     className="h-12 text-xs font-bold border-slate-200 rounded-xl"
                     placeholder="Bonus, deductions, etc."
                     value={paymentData.remark}
                     onChange={e => setPaymentData({ ...paymentData, remark: e.target.value })}
                  />
               </div>
               <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-slate-900 hover:bg-black text-white h-12 font-black uppercase text-[11px] tracking-[3px] rounded-xl shadow-lg transition-all"
               >
                  {isPending ? <Loader2 className="animate-spin mr-2" size={16} /> : <Send size={16} className="mr-2" />}
                  Commit Disbursement
               </Button>
            </form>
         </DialogContent>
      </Dialog>
   );
}
