"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

const WhySection = ({ schoolInfo }) => {
   if (!schoolInfo) {
      return (
         <div className="py-14 md:py-20 bg-slate-50 border-y border-slate-200 animate-pulse">
            <div className="container mx-auto px-6 space-y-10">
               <div className="text-center max-w-xl mx-auto space-y-3">
                  <div className="h-4 w-32 bg-blue-100 rounded-full mx-auto" />
                  <div className="h-8 w-72 bg-slate-300 rounded-xl mx-auto" />
               </div>
               <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                     <div key={i} className="bg-white p-7 rounded-3xl border border-slate-200 space-y-4">
                        <div className="h-12 w-12 rounded-2xl bg-slate-200" />
                        <div className="h-5 w-3/4 bg-slate-300 rounded-lg" />
                        <div className="h-3 w-full bg-slate-100 rounded-md" />
                     </div>
                  ))}
               </div>
            </div>
         </div>
      );
   }

   const resolvedName = (schoolInfo?.schoolName || schoolInfo?.name || '').trim();
   const defaultTitle = resolvedName ? `Why Parents Choose ${resolvedName}?` : "Why Choose Our Institution?";
   
   const features = schoolInfo?.why_choose_us?.features || 
      (Array.isArray(schoolInfo?.whyChooseUs) && schoolInfo.whyChooseUs.length > 0 ? schoolInfo.whyChooseUs : null) ||
      (Array.isArray(schoolInfo?.about_config?.whyChooseUs) && schoolInfo.about_config.whyChooseUs.length > 0 ? schoolInfo.about_config.whyChooseUs : []);

   if (!features || features.length === 0) return null;

   const displayTitle = (schoolInfo?.why_choose_us?.title || defaultTitle)
      .replace(/S\.D\.M\.|SDM/gi, resolvedName || 'Our School')
      .replace(/\s+/g, ' ')
      .trim();

   const description = schoolInfo?.why_choose_us?.description || 
      "Discover why our institution stands as the region's premier benchmark, nurturing hearts and minds.";

   return (
      <section className="py-14 md:py-20 bg-slate-50 border-y border-slate-200">
         <div className="container mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
               <span className="label-tag block text-xs sm:text-sm font-black uppercase tracking-widest" style={{ color: 'var(--primary)' }}>Why Choose Us</span>
               <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">{displayTitle}</h2>
               <p className="text-slate-600 text-sm md:text-base font-normal">{description}</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
               {features.map((feat, i) => (
                  <motion.div
                     key={i}
                     initial={{ opacity: 0, y: 10 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     viewport={{ once: true }}
                     transition={{ delay: i * 0.1 }}
                     className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300"
                  >
                     <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-indigo-600 mb-5" style={{ color: 'var(--primary)' }}>
                        <ShieldCheck size={24} />
                     </div>
                     <h4 className="font-bold text-slate-900 text-base sm:text-lg mb-2">{feat.title}</h4>
                     <p className="text-sm text-slate-600 leading-relaxed font-normal">{feat.desc}</p>
                  </motion.div>
               ))}
            </div>
         </div>
      </section>
   );
};

export default WhySection;
