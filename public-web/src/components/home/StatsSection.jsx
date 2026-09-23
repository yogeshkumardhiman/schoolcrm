"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { DynamicIcon, Counter } from './home-helpers';

const StatsSection = ({ schoolInfo }) => {
   if (!schoolInfo) {
      return (
         <div className="py-12 bg-slate-50 border-b border-slate-200/80 animate-pulse">
            <div className="container mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-6">
               {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
                     <div className="h-14 w-14 rounded-2xl bg-slate-200 shrink-0" />
                     <div className="space-y-2 flex-1">
                        <div className="h-8 w-20 bg-slate-300 rounded-lg" />
                        <div className="h-3 w-28 bg-slate-200 rounded-md" />
                     </div>
                  </div>
               ))}
            </div>
         </div>
      );
   }

   const stats = schoolInfo?.statistics;
   if (!Array.isArray(stats) || stats.length === 0) return null;

   return (
      <section className="py-12 md:py-16 bg-slate-50 relative z-30 border-b border-slate-100">
         <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
               {stats.slice(0, 4).map((s, i) => (
                  <motion.div
                     key={i}
                     initial={{ opacity: 0, y: 15 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     viewport={{ once: true }}
                     transition={{ delay: i * 0.1 }}
                     className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5"
                  >
                     <div className="h-14 w-14 rounded-2xl flex items-center justify-center text-white shrink-0" style={{ backgroundColor: 'var(--primary)' }}>
                        <DynamicIcon name={s.icon || 'School'} size={26} />
                     </div>
                     <div>
                        <h4 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-none mb-1 font-mono">
                           <Counter target={s.number} />
                        </h4>
                        <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 leading-none">{s.label}</p>
                     </div>
                  </motion.div>
               ))}
            </div>
         </div>
      </section>
   );
};

export default StatsSection;
