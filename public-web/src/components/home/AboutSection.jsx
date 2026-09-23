"use client";

import React from 'react';
import { Quote, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getResolvedUrl } from '@/services/api';
import { Button } from '@/components/ui/button';

const AboutSection = ({ schoolInfo }) => {
   if (!schoolInfo) {
      return (
         <div className="py-14 md:py-20 bg-white animate-pulse">
            <div className="container mx-auto px-6 grid md:grid-cols-12 gap-10 items-center">
               <div className="md:col-span-5">
                  <div className="aspect-[4/5] rounded-3xl bg-slate-200" />
               </div>
               <div className="md:col-span-7 space-y-5">
                  <div className="h-4 w-36 bg-blue-100 rounded-full" />
                  <div className="h-10 w-4/5 bg-slate-300 rounded-xl" />
                  <div className="space-y-2">
                     <div className="h-4 w-full bg-slate-100 rounded-md" />
                     <div className="h-4 w-5/6 bg-slate-100 rounded-md" />
                     <div className="h-4 w-4/6 bg-slate-100 rounded-md" />
                  </div>
                  <div className="h-28 bg-slate-100 rounded-2xl" />
               </div>
            </div>
         </div>
      );
   }

   const title = schoolInfo?.aboutTitle || `${schoolInfo?.schoolName || "Our School"} Legacy of Excellence`;
   const desc = schoolInfo?.aboutDescription || "";
   
   const principalName = schoolInfo?.principalName || schoolInfo?.about_config?.principalName;
   const principalImage = schoolInfo?.principalImage || schoolInfo?.about_config?.principalImage || schoolInfo?.bannerImage;
   const principalMessage = schoolInfo?.principalMessage || schoolInfo?.about_config?.principalMessage;

   const image = principalImage || "";

   return (
      <section className="py-14 md:py-20 bg-white overflow-hidden">
         <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-12 gap-10 items-center">
               <div className="md:col-span-5 relative group">
                  <div className="aspect-[4/5] rounded-3xl overflow-hidden border border-slate-200 shadow-lg bg-slate-50">
                     <img src={getResolvedUrl(image)} className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" alt={principalName || "Leadership Desk"} />
                  </div>
               </div>
               <div className="md:col-span-7 space-y-6">
                  <span className="label-tag block text-xs sm:text-sm font-black uppercase tracking-widest" style={{ color: 'var(--primary)' }}>Institutional Legacy</span>
                  <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                     {title.split(' ')[0]} <span className="accent-italic" style={{ color: 'var(--secondary)' }}>{title.split(' ').slice(1).join(' ')}</span>
                  </h2>
                  <p className="text-slate-600 text-base md:text-lg font-normal leading-relaxed">
                     {desc}
                  </p>
                  {principalMessage && (
                     <div className="bg-slate-50 p-7 rounded-2xl border border-slate-200 relative overflow-hidden mt-4">
                        <Quote className="text-slate-200/60 h-12 w-12 absolute -top-1 -right-1 pointer-events-none" />
                        <p className="text-slate-700 text-sm md:text-base font-medium italic relative z-10 leading-relaxed mb-3">
                           "{principalMessage}"
                        </p>
                        {principalName && (
                           <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-indigo-700 uppercase tracking-wider">
                                 — {principalName}, Principal Message
                              </span>
                           </div>
                        )}
                     </div>
                  )}
                  <div className="pt-2">
                     <Button asChild className="px-7 py-5 rounded-xl text-sm font-bold uppercase tracking-wider text-white cursor-pointer shadow-md" style={{ backgroundColor: 'var(--primary)' }}>
                        <Link href="/about">Read Full Narrative <ArrowRight size={15} className="ml-2" /></Link>
                     </Button>
                  </div>
               </div>
            </div>
         </div>
      </section>
   );
};

export default AboutSection;
