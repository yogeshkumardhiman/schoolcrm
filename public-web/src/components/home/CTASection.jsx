"use client";

import React from 'react';
import Link from 'next/link';
import { getResolvedUrl } from '@/services/api';
import { Button } from '@/components/ui/button';

const CTASection = ({ schoolInfo }) => {
   const resolvedName = (schoolInfo?.schoolName || schoolInfo?.name || '').trim();
   const cleanText = (txt) => (txt || '').replace(/S\.D\.M\.|SDM/gi, resolvedName || 'our school').replace(/\s+/g, ' ').trim();
   const rawCta = schoolInfo?.cta_config || { title: "Ready for Excellence?", subtitle: "Secure your child's educational future with our academy.", bgImage: "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=1600" };

   return (
      <section className="py-12 md:py-16 bg-white">
         <div className="container mx-auto px-6">
            <div className="relative rounded-[32px] overflow-hidden bg-slate-950 p-8 md:p-16 text-center text-white">
               {rawCta.bgImage && (
                  <img src={getResolvedUrl(rawCta.bgImage)} className="absolute inset-0 w-full h-full object-cover opacity-15" alt="" />
               )}
               <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent pointer-events-none" />
               
               <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
                  <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">{cleanText(rawCta.title)}</h2>
                  <p className="text-slate-300 text-xs md:text-sm font-medium leading-relaxed">{cleanText(rawCta.subtitle)}</p>
                  
                  <div className="flex flex-wrap gap-4 justify-center pt-2">
                     <Button asChild className="px-8 py-5.5 rounded-xl font-bold uppercase tracking-wider text-xs shadow-lg transition active:scale-95 text-white cursor-pointer" style={{ backgroundColor: 'var(--primary)' }}>
                        <Link href="/admission">Enroll Today</Link>
                     </Button>
                     <Button asChild variant="outline" className="bg-white/5 border border-white/20 text-white px-8 py-5.5 rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-white hover:text-black transition cursor-pointer">
                        <Link href="/contact">Contact Admissions</Link>
                     </Button>
                  </div>
               </div>
            </div>
         </div>
      </section>
   );
};

export default CTASection;
