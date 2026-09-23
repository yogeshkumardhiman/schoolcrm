"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { DynamicIcon } from './home-helpers';

const AcademicsSection = ({ schoolInfo }) => {
   const defaultAcademics = [
      { id: "pre-primary", title: "Pre-Primary Wing", desc: "Play-based nursery/KG curriculum emphasizing language skills, motor coordination, and visual creativity.", icon: "Zap" },
      { id: "primary", title: "Primary Wing", desc: "Strong foundation in mathematics, reading, and environmental sciences with smart board aid.", icon: "Target" },
      { id: "middle", title: "Middle School", desc: "Transition into conceptual sciences, history, computer programming, and creative arts.", icon: "Award" },
      { id: "senior", title: "Senior Secondary", desc: "CBSE board preparation in Science, Commerce, and Humanities streams guided by top mentors.", icon: "GraduationCap" }
   ];
   const wings = schoolInfo?.academics_config || defaultAcademics;

   if (!wings || wings.length === 0) return null;

   return (
      <section className="py-14 md:py-20 bg-white">
         <div className="container mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
               <span className="label-tag block text-xs sm:text-sm font-black uppercase tracking-widest" style={{ color: 'var(--primary)' }}>Academics</span>
               <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">Wings of <span className="accent-italic" style={{ color: 'var(--secondary)' }}>Scholastic Excellence</span></h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
               {wings.map((wing, i) => (
                  <div key={i} className="p-7 rounded-3xl border border-slate-200 bg-white hover:border-[var(--primary)]/50 hover:shadow-xl transition-all flex flex-col justify-between shadow-sm">
                     <div className="space-y-4">
                        <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center" style={{ color: 'var(--primary)' }}>
                           <DynamicIcon name={wing.icon || 'GraduationCap'} size={24} />
                        </div>
                        <h4 className="font-extrabold text-slate-900 text-lg sm:text-xl leading-tight">{wing.title}</h4>
                        <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed font-normal">{wing.desc}</p>
                     </div>
                     <Link href="/admission" className="text-xs sm:text-sm font-black uppercase tracking-wider text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 mt-6" style={{ color: 'var(--primary)' }}>
                        <span>Admissions open</span> <ArrowRight size={14} />
                     </Link>
                  </div>
               ))}
            </div>
         </div>
      </section>
   );
};

export default AcademicsSection;
