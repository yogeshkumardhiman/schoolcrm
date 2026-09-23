"use client";

import React from 'react';
import Link from 'next/link';
import { Info, ArrowRight, Phone } from 'lucide-react';

const FeeDisabledNotice = ({ sessionTag, accountsPhone }) => {
   return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center space-y-6">
         <div className="w-20 h-20 rounded-3xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[var(--primary)] mx-auto shadow-sm">
            <Info size={36} />
         </div>
         <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">Fee Schedule Available Upon Campus Inquiry</h2>
            <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
               Our fee structure for Session {sessionTag || "2026-27"} is customized based on stream selection, optional lab electives, and transport distance. Please contact our Accounts Desk for a full schedule.
            </p>
         </div>
         <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
               href="/admission"
               className="h-12 px-7 rounded-2xl bg-[var(--primary)] hover:opacity-90 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg"
            >
               <span>Submit Admission Inquiry</span>
               <ArrowRight size={14} />
            </Link>
            {accountsPhone && (
               <a
                  href={`tel:${accountsPhone}`}
                  className="h-12 px-7 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold text-xs uppercase tracking-wider flex items-center gap-2"
               >
                  <Phone size={14} />
                  <span>Call Accounts Office</span>
               </a>
            )}
         </div>
      </div>
   );
};

export default FeeDisabledNotice;
