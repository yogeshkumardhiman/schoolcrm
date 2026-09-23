"use client";

import React from 'react';
import { Clock, Award, CheckCircle2, ArrowRight } from 'lucide-react';

const ScheduleAndConcessions = ({ accountsPhone }) => {
   return (
      <section className="grid lg:grid-cols-12 gap-6 pt-8 border-t border-slate-200">
         {/* Left: 4 Quarter Installments Timetable (7 Cols) */}
         <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-7 sm:p-8 space-y-5 shadow-xs">
            <h3 className="text-base font-black text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
               <Clock size={16} className="text-blue-600" />
               Quarterly Installment Schedule & Deadlines
            </h3>
            <div className="grid sm:grid-cols-2 gap-3.5 text-xs">
               {[
                  { q: "Quarter 1 (Apr – Jun)", due: "Payable by 15th April", desc: "Session admission, identity & Q1 tuition" },
                  { q: "Quarter 2 (Jul – Sep)", due: "Payable by 15th July", desc: "Mid-term academic & laboratory charges" },
                  { q: "Quarter 3 (Oct – Dec)", due: "Payable by 15th October", desc: "Covers cultural, sports & library resources" },
                  { q: "Quarter 4 (Jan – Mar)", due: "Payable by 15th January", desc: "Final examination & annual assessments" }
               ].map((inst, iIdx) => (
                  <div key={iIdx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                     <p className="font-bold text-[#0F172A]">{inst.q}</p>
                     <p className="text-emerald-600 font-semibold">{inst.due}</p>
                     <p className="text-[11px] text-slate-500">{inst.desc}</p>
                  </div>
               ))}
            </div>
         </div>

         {/* Right: Concessions & Scholarships (5 Cols) */}
         <div className="lg:col-span-5 rounded-3xl border border-slate-200 bg-white p-7 sm:p-8 space-y-4 flex flex-col justify-between shadow-xs">
            <div className="space-y-4">
               <h3 className="text-base font-black text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
                  <Award size={16} className="text-amber-500" />
                  Concessions & Scholarships
               </h3>
               <ul className="space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-start gap-2">
                     <CheckCircle2 size={14} className="text-blue-600 shrink-0 mt-0.5" />
                     <span><strong>Sibling Concession:</strong> Waiver on real younger sibling tuition fee.</span>
                  </li>
                  <li className="flex items-start gap-2">
                     <CheckCircle2 size={14} className="text-blue-600 shrink-0 mt-0.5" />
                     <span><strong>Merit Scholarships:</strong> Waiver for academic board & sports toppers.</span>
                  </li>
                  <li className="flex items-start gap-2">
                     <CheckCircle2 size={14} className="text-blue-600 shrink-0 mt-0.5" />
                     <span><strong>Armed Forces & Staff:</strong> Special financial assistance for defense families.</span>
                  </li>
               </ul>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
               <span className="text-xs text-slate-500">Fee inquiries?</span>
               <a
                  href={`tel:${accountsPhone || "+917351996239"}`}
                  className="text-xs font-bold text-[var(--primary)] hover:underline flex items-center gap-1"
               >
                  <span>Call Accounts Desk</span>
                  <ArrowRight size={12} />
               </a>
            </div>
         </div>
      </section>
   );
};

export default ScheduleAndConcessions;
