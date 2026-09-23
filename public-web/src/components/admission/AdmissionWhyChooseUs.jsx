"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, BookOpen, Cpu, Award, Users, Bus, Library, Trophy } from 'lucide-react';

const AdmissionWhyChooseUs = ({ schoolInfo }) => {
   const resolvedName = (schoolInfo?.schoolName || schoolInfo?.name || '').trim();
   const cleanText = (txt) => (txt || '').replace(/S\.D\.M\.|SDM/gi, resolvedName || 'Our School').replace(/\s+/g, ' ').trim();

   const defaultWhyData = {
      title: resolvedName ? `Why Choose ${resolvedName}?` : "Why Choose Our School?",
      description: "Discover why our school stands as the region's premier destination for educational, intellectual, and moral growth.",
      features: [
         { title: "Safe CCTV Campus", desc: "24/7 monitored campus with strict safety registry protocols.", icon: ShieldCheck },
         { title: "Dynamic STEM Labs", desc: "Hands-on robotics, AI coding, and scientific innovation modules.", icon: Cpu },
         { title: "Elite Sports Arenas", desc: "Expansive multi-sport grounds with professional certified coaching.", icon: Trophy },
         { title: "GPS Bus Fleet", desc: "Reliable student transit fleet mapping all adjacent region routes.", icon: Bus }
      ]
   };

   const whyData = schoolInfo?.why_choose_us || defaultWhyData;
   const rawFeatures = whyData.features || defaultWhyData.features;
   const iconList = [ShieldCheck, Cpu, Trophy, Bus, BookOpen, Library, Award, Users];

   const displayTitle = cleanText(whyData.title || defaultWhyData.title);
   const displayDesc = cleanText(whyData.description || defaultWhyData.description);

   return (
      <section className="py-16 md:py-24 bg-white border-t border-slate-200">
         <div className="container mx-auto px-6 max-w-7xl">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-14 gap-6">
               <div className="space-y-3 max-w-2xl">
                  <span className="label-tag block text-xs font-black uppercase tracking-widest" style={{ color: 'var(--primary)' }}>Institutional Advantage</span>
                  <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">{displayTitle}</h2>
               </div>
               <p className="text-slate-600 text-sm md:text-base font-normal max-w-md leading-relaxed">
                  {displayDesc}
               </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
               {rawFeatures.map((feat, i) => {
                  const IconComp = iconList[i % iconList.length];
                  return (
                     <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.08 }}
                        className="bg-slate-50/70 p-7 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-[var(--primary)]/40 hover:bg-white transition-all duration-300 flex flex-col justify-between group"
                     >
                        <div className="space-y-4">
                           <div className="h-12 w-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-white transition-all duration-300 shadow-sm">
                              <IconComp size={24} />
                           </div>
                           <div className="space-y-2">
                              <h3 className="font-extrabold text-slate-900 text-lg md:text-xl leading-snug">{cleanText(feat.title)}</h3>
                              <p className="text-sm text-slate-600 leading-relaxed font-normal">{cleanText(feat.desc)}</p>
                           </div>
                        </div>
                     </motion.div>
                  );
               })}
            </div>
         </div>
      </section>
   );
};

export default AdmissionWhyChooseUs;
