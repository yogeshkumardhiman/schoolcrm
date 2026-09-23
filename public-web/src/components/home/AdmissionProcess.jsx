"use client";

import React from 'react';

const AdmissionProcess = ({ schoolInfo }) => {
   const defaultTimeline = [
      { step: "Step 01", title: "Online Inquiry / Form Fill", desc: "Fill out the online application or submit an inquiry at our reception desk." },
      { step: "Step 02", title: "Campus Visit & Orientation", desc: "Walk around our facilities and interact with our admissions counselor." },
      { step: "Step 03", title: "Admissions Interaction / Test", desc: "A brief concept assessment to gauge the child's academic placement." },
      { step: "Step 04", title: "Fee Payment & Enrollment", desc: "Submit documents and finalize admission fee to activate school registration." }
   ];
   const timeline = schoolInfo?.admission_timeline || defaultTimeline;

   if (!timeline || timeline.length === 0) return null;

   return (
      <section className="py-12 md:py-16 bg-white">
         <div className="container mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
               <span className="label-tag block text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--primary)' }}>Enrollment</span>
               <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Admission <span className="accent-italic" style={{ color: 'var(--secondary)' }}>Timeline Steps</span></h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
               {timeline.map((step, i) => (
                  <div key={i} className="p-6 rounded-2xl border border-slate-100 bg-slate-50 relative group">
                     <span className="h-8 px-3 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 font-black text-xs uppercase flex items-center justify-center mb-4 w-fit" style={{ color: 'var(--primary)', borderColor: 'rgba(79, 70, 229, 0.15)' }}>
                        {step.step || `0${i+1}`}
                     </span>
                     <h4 className="font-extrabold text-slate-800 text-sm leading-tight mb-2">{step.title}</h4>
                     <p className="text-xs text-slate-500 leading-relaxed font-medium">{step.desc}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>
   );
};

export default AdmissionProcess;
