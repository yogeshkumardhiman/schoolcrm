"use client";

import React from 'react';
import { Landmark } from 'lucide-react';

const BankDetailsSection = ({ bankDetails }) => {
   if (!bankDetails || !bankDetails.accountNumber) return null;

   return (
      <section className="rounded-3xl border border-slate-200 bg-slate-50 p-7 sm:p-8 space-y-4">
         <div className="flex items-center gap-2 text-xs font-black uppercase text-slate-600 tracking-wider">
            <Landmark size={15} className="text-blue-600" />
            <span>Official Bank Transfer & RTGS Coordinates</span>
         </div>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
               <p className="text-[10px] text-slate-400 uppercase font-black">Bank Name</p>
               <p className="font-bold text-[#0F172A] mt-1">{bankDetails.bankName || 'State Bank of India'}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
               <p className="text-[10px] text-slate-400 uppercase font-black">Account Name</p>
               <p className="font-bold text-[#0F172A] mt-1">{bankDetails.accountName || 'School Account'}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
               <p className="text-[10px] text-slate-400 uppercase font-black">Account Number</p>
               <p className="font-bold text-[#0F172A] font-mono mt-1">{bankDetails.accountNumber}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
               <p className="text-[10px] text-slate-400 uppercase font-black">IFSC Code / UPI Handle</p>
               <p className="font-bold text-[#0F172A] font-mono mt-1">{bankDetails.ifscCode} {bankDetails.upiId ? `• ${bankDetails.upiId}` : ''}</p>
            </div>
         </div>
      </section>
   );
};

export default BankDetailsSection;
