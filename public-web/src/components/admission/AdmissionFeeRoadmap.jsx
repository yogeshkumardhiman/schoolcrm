"use client";

import React from 'react';
import { CreditCard, CheckCircle2, ArrowRight, Clock, Award } from 'lucide-react';

const AdmissionFeeRoadmap = ({ feeData, schoolInfo }) => {
   const resolvedName = (schoolInfo?.schoolName || schoolInfo?.name || '').trim();
   const feeTiers = feeData?.feeTiers || schoolInfo?.fee_structure_config?.feeTiers || [
      {
         wing: "Pre-Primary Wing",
         classes: "Nursery, LKG & UKG",
         quarterlyFee: "₹5,400",
         monthlyEquiv: "₹1,800 / month",
         highlights: ["Activity & Phonics Kit", "Smart Kindergarten Lab", "Indoor Play Arena", "Term Assessments Included"]
      },
      {
         wing: "Primary Wing",
         classes: "Classes I to V",
         quarterlyFee: "₹6,600",
         monthlyEquiv: "₹2,200 / month",
         highlights: ["Experiential STEM Labs", "Junior Computer Labs", "Co-Curricular Clubs", "Library & Sports Access"]
      },
      {
         wing: "Middle & Secondary",
         classes: "Classes VI to X",
         quarterlyFee: "₹8,400",
         monthlyEquiv: "₹2,800 / month",
         highlights: ["Science Composite Labs", "Python AI Robotics", "CBSE Registration Support", "Inter-School Sports Coaching"]
      },
      {
         wing: "Senior Secondary",
         classes: "Classes XI & XII (All Streams)",
         quarterlyFee: "₹10,500",
         monthlyEquiv: "₹3,500 / month",
         highlights: ["Specialized PCB/PCM Labs", "Commerce & Computer Science", "Pre-Board Assessments", "Competitive Entrance Guidance"]
      }
   ];

   const sessionTag = feeData?.sessionTag || "SESSION 2026-27";
   const phone = feeData?.accountsPhone || schoolInfo?.contactPhone || "+91 9761839857";

   return (
      <section id="fees" className="py-24 lg:py-36 bg-[#090D1A] text-slate-100 relative scroll-mt-24 border-t border-white/[0.08]">
         <div className="container mx-auto px-6 max-w-7xl relative z-10">
            
            <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
               <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/15 text-xs font-bold text-slate-200 tracking-wider">
                  <CreditCard size={14} className="text-blue-400" />
                  <span>{resolvedName ? `${resolvedName.toUpperCase()} • ` : ''}FEE SCHEDULE • {sessionTag}</span>
               </div>
               <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase leading-tight">
                  Fee Structure & <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">Installment Roadmap</span>
               </h2>
               <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
                  Structured in 4 convenient quarterly installments covering academic tuition, smart digital infrastructure, laboratories, and physical sports amenities without hidden charges.
               </p>
            </div>

            {/* Fee Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
               {feeTiers.map((fee, fIdx) => (
                  <div
                     key={fIdx}
                     className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-7 flex flex-col justify-between hover:border-white/20 transition-all group"
                  >
                     <div className="space-y-4">
                        <div className="space-y-1">
                           <span className="text-[10px] font-black uppercase tracking-widest text-[var(--secondary,#3B82F6)]">
                              {fee.wing}
                           </span>
                           <h3 className="text-xl font-bold text-white tracking-tight">{fee.classes}</h3>
                        </div>

                        <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
                           <p className="text-2xl sm:text-3xl font-black text-white font-mono">{fee.quarterlyFee}</p>
                           <p className="text-[11px] text-slate-400 font-semibold mt-0.5">{fee.monthlyEquiv || ''} (Quarterly Installment)</p>
                        </div>

                        {Array.isArray(fee.highlights) && (
                           <ul className="space-y-2 pt-2">
                              {fee.highlights.map((h, hIdx) => (
                                 <li key={hIdx} className="flex items-center gap-2 text-xs text-slate-300">
                                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                                    <span>{h}</span>
                                 </li>
                              ))}
                           </ul>
                        )}
                     </div>

                     <div className="pt-6 mt-6 border-t border-white/[0.06]">
                        <a
                           href="#apply"
                           className="w-full py-2.5 rounded-xl bg-white/[0.06] hover:bg-[var(--primary,#1E3A8A)] hover:text-white text-slate-300 border border-white/10 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                           <span>Apply for {(fee.classes || '').split(" ")[0]}</span>
                           <ArrowRight size={13} />
                        </a>
                     </div>
                  </div>
               ))}
            </div>

            {/* Installments Schedule + Concession Badges */}
            <div className="grid lg:grid-cols-12 gap-6 items-stretch">
               
               {/* Left: 4 Quarter Roadmap */}
               <div className="lg:col-span-7 rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6 sm:p-8 space-y-5">
                  <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                     <Clock size={16} className="text-blue-400" />
                     Quarterly Installment Payment Timetable
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3.5 text-xs">
                     {[
                        { q: "Quarter 1 (Apr – Jun)", due: "Payable by 15th April", desc: "Covers session admission & Q1 tuition" },
                        { q: "Quarter 2 (Jul – Sep)", due: "Payable by 15th July", desc: "Mid-term academic & laboratory charges" },
                        { q: "Quarter 3 (Oct – Dec)", due: "Payable by 15th October", desc: "Covers cultural & sports festival activities" },
                        { q: "Quarter 4 (Jan – Mar)", due: "Payable by 15th January", desc: "Final board & annual examination charges" }
                     ].map((inst, iIdx) => (
                        <div key={iIdx} className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1">
                           <p className="font-bold text-white">{inst.q}</p>
                           <p className="text-emerald-400 font-semibold">{inst.due}</p>
                           <p className="text-[11px] text-slate-400">{inst.desc}</p>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Right: Concessions & Welfare */}
               <div className="lg:col-span-5 rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6 sm:p-8 space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                     <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <Award size={16} className="text-amber-400" />
                        Concessions & Scholarships
                     </h3>
                     <ul className="space-y-2.5 text-xs text-slate-300">
                        <li className="flex items-start gap-2">
                           <CheckCircle2 size={14} className="text-blue-400 shrink-0 mt-0.5" />
                           <span><strong>Sibling Concession:</strong> 25% Tuition Fee waiver on real younger brother/sister.</span>
                        </li>
                        <li className="flex items-start gap-2">
                           <CheckCircle2 size={14} className="text-blue-400 shrink-0 mt-0.5" />
                           <span><strong>Merit Scholarships:</strong> Up to 100% waiver for outstanding board toppers and sports achievers.</span>
                        </li>
                        <li className="flex items-start gap-2">
                           <CheckCircle2 size={14} className="text-blue-400 shrink-0 mt-0.5" />
                           <span><strong>Defence & Staff Wards:</strong> Special financial facilitation for armed forces & educator families.</span>
                        </li>
                     </ul>
                  </div>

                  <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                     <span className="text-[11px] text-slate-400">Questions regarding fees?</span>
                     <a
                        href={`tel:${phone}`}
                        className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                     >
                        <span>Call Accounts Desk</span>
                        <ArrowRight size={12} />
                     </a>
                  </div>
               </div>

            </div>

         </div>
      </section>
   );
};

export default AdmissionFeeRoadmap;
