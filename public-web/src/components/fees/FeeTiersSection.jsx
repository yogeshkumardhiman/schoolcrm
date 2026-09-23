"use client";

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, ArrowRight } from 'lucide-react';

const FeeTiersSection = ({ feeTiers }) => {
   if (!feeTiers || feeTiers.length === 0) return null;

   return (
      <section className="space-y-12">
         <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-[4px] text-[var(--primary)] block">Class-Wise Tuition Tiers</span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight uppercase">
               Academic Wing Breakdown
            </h2>
            <p className="text-sm text-slate-500">
               Tuition fees are structured in 4 equal quarterly installments payable every 3 months.
            </p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {feeTiers.map((tier, idx) => (
               <div
                  key={tier.id || idx}
                  className="rounded-3xl border border-slate-200 bg-white p-7 flex flex-col justify-between hover:border-[var(--primary)]/50 hover:shadow-xl transition-all group"
               >
                  <div className="space-y-4">
                     <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)] bg-[var(--primary)]/10 px-2.5 py-0.5 rounded-md inline-block">
                           {tier.wing || "Academic Wing"}
                        </span>
                        <h3 className="text-xl font-bold text-[#0F172A] tracking-tight">{tier.classes}</h3>
                     </div>

                     <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <p className="text-3xl font-black text-[var(--primary)] font-mono">{tier.quarterlyFee}</p>
                        <p className="text-xs text-slate-500 font-semibold mt-1">{tier.monthlyEquiv || ''} (Quarterly Installment)</p>
                     </div>

                     {Array.isArray(tier.highlights) && tier.highlights.length > 0 && (
                        <ul className="space-y-2.5 pt-2">
                           {tier.highlights.map((h, hIdx) => (
                              <li key={hIdx} className="flex items-center gap-2 text-xs text-slate-600">
                                 <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                                 <span>{h}</span>
                              </li>
                           ))}
                        </ul>
                     )}
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-100">
                     <Link
                        href="/admission"
                        className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-[var(--primary)] hover:text-white text-slate-800 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                     >
                        <span>Enroll for {(tier.classes || '').split(" ")[0] || 'Admission'}</span>
                        <ArrowRight size={13} />
                     </Link>
                  </div>
               </div>
            ))}
         </div>
      </section>
   );
};

export default FeeTiersSection;
