"use client";

import React from 'react';

const GalleryHero = ({ schoolInfo }) => {
   const resolvedName = (schoolInfo?.schoolName || schoolInfo?.name || '').trim();

   return (
      <section className="relative pt-32 pb-16 px-6 text-center bg-gradient-to-b from-[#F1F5F9] via-slate-100/60 to-[#F8FAFC] border-b border-slate-200 mb-12">
         <div className="space-y-4 max-w-4xl mx-auto">
            <span className="text-[var(--primary)] font-black uppercase tracking-[6px] text-xs block">
               {resolvedName ? `${resolvedName.toUpperCase()} • MEMORIES` : "CAMPUS GALLERY"}
            </span>
            <h1 className="text-4xl sm:text-6xl font-black text-[#0F172A] uppercase tracking-tight leading-tight">
               Campus <span className="bg-gradient-to-r from-[var(--primary)] via-indigo-600 to-purple-600 bg-clip-text text-transparent">Gallery & Moments</span>
            </h1>
            <p className="text-base text-slate-600 max-w-xl mx-auto">
               Explore memorable scholastic ceremonies, sports championships, laboratory experiments, and annual cultural celebrations.
            </p>
         </div>
      </section>
   );
};

export default GalleryHero;
