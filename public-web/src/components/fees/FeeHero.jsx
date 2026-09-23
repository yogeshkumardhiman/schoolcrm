"use client";

import React from 'react';
import { Sparkles } from 'lucide-react';

const FeeHero = ({ sessionTag, schoolName }) => {
   const resolvedName = (schoolName || '').trim() || 'Our school';

   return (
      <section className="relative pt-12 pb-20 px-6 text-center bg-gradient-to-b from-[#F1F5F9] via-slate-100/60 to-[#F8FAFC] border-b border-slate-200">
         <div className="max-w-4xl mx-auto space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-xs font-bold text-[var(--primary)] tracking-wider">
               <Sparkles size={14} className="text-amber-500 animate-pulse" />
               <span>TRANSPARENT FEE SCHEDULE • {sessionTag || "SESSION 2026-27"}</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-[#0F172A] tracking-tight uppercase leading-tight">
               Fee Structure & <span className="bg-gradient-to-r from-[var(--primary)] via-indigo-600 to-purple-600 bg-clip-text text-transparent">Transport Charges</span>
            </h1>

            <p className="text-base sm:text-xl text-slate-600 font-normal max-w-2xl mx-auto leading-relaxed">
               {resolvedName} provides quality CBSE education with affordable quarterly fee slabs, zero hidden costs, and extensive GPS fleet connectivity.
            </p>
         </div>
      </section>
   );
};

export default FeeHero;
