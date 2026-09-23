"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Mail, FileText, Users, ClipboardCheck, ArrowRight } from 'lucide-react';

const AdmissionJourneyTimeline = ({ schoolInfo }) => {
   const defaultSteps = [
      { step: "Step 01", title: "Online Inquiry / Form Fill", desc: "Fill out the online application or submit an inquiry at our reception desk.", icon: Mail },
      { step: "Step 02", title: "Campus Visit & Orientation", desc: "Walk around our facilities and interact with our admissions counselor.", icon: FileText },
      { step: "Step 03", title: "Admissions Interaction / Test", desc: "A brief concept assessment to gauge the child's academic placement.", icon: Users },
      { step: "Step 04", title: "Fee Payment & Enrollment", desc: "Submit documents and finalize admission fee to activate school registration.", icon: ClipboardCheck }
   ];

   const timeline = schoolInfo?.admission_timeline || defaultSteps;
   const iconList = [Mail, FileText, Users, ClipboardCheck];

   return (
      <section className="py-16 md:py-24 bg-slate-50/60 border-t border-slate-200 relative overflow-hidden">
         <div className="container mx-auto px-6 max-w-7xl relative z-10">
            <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
               <span className="label-tag block text-xs font-black uppercase tracking-widest" style={{ color: 'var(--primary)' }}>Registration Roadmap</span>
               <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  Admission <span className="accent-italic" style={{ color: 'var(--secondary)' }}>Timeline Steps</span>
               </h2>
               <p className="text-slate-600 text-sm md:text-base font-medium">
                  Follow our streamlined 4-step enrolment process to secure your child's academic seat.
               </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
               {timeline.map((step, i) => {
                  const IconComp = iconList[i % iconList.length];
                  return (
                     <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-[var(--primary)]/40 transition-all duration-300 flex flex-col justify-between h-full group"
                     >
                        <div className="space-y-5">
                           <div className="flex items-center justify-between">
                              <span className="h-8 px-3 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-black text-xs uppercase tracking-wider flex items-center justify-center" style={{ color: 'var(--primary)', borderColor: 'rgba(79, 70, 229, 0.15)' }}>
                                 {step.step || `Step 0${i + 1}`}
                              </span>
                              <div className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-[var(--primary)] group-hover:text-white transition-all duration-300">
                                 <IconComp size={20} />
                              </div>
                           </div>

                           <div className="space-y-2 pt-1">
                              <h3 className="font-extrabold text-slate-900 text-lg md:text-xl leading-snug">{step.title}</h3>
                              <p className="text-sm text-slate-600 leading-relaxed font-normal">{step.desc}</p>
                           </div>
                        </div>

                        <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400 group-hover:text-[var(--primary)] transition-colors">
                           <span>Phase {i + 1} of {timeline.length}</span>
                           <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                     </motion.div>
                  );
               })}
            </div>
         </div>
      </section>
   );
};

export default AdmissionJourneyTimeline;
