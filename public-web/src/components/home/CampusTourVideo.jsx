"use client";

import React from 'react';
import { Play } from 'lucide-react';

const CampusTourVideo = ({ schoolInfo }) => {
   const resolvedName = (schoolInfo?.schoolName || schoolInfo?.name || '').trim();
   const rawTour = schoolInfo?.campus_tour || { youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", title: resolvedName ? `Experience ${resolvedName} Virtually` : "Experience Our Campus Virtually", description: "Take a digital tour around our smart campus, state-of-the-art labs, library, and athletic arenas." };
   const displayTitle = (rawTour.title || '')
      .replace(/S\.D\.M\.|SDM/gi, resolvedName || 'Our Campus')
      .replace(/\s+/g, ' ')
      .trim();

   return (
      <section className="py-12 md:py-16 bg-slate-950 text-white relative overflow-hidden">
         <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_center,var(--primary),transparent)] blur-[120px] pointer-events-none" />
         <div className="container mx-auto px-6 max-w-4xl text-center space-y-6 relative z-10">
            <span className="label-tag inline-block bg-white/10 px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase">Campus Tour</span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">{displayTitle}</h2>
            <p className="text-slate-400 text-xs md:text-sm font-medium max-w-xl mx-auto">{rawTour.description}</p>
            
            <div className="pt-4 flex justify-center">
               <a href={rawTour.youtubeUrl} target="_blank" rel="noopener noreferrer" className="relative group flex items-center justify-center w-20 h-20 rounded-full bg-white text-slate-950 hover:scale-110 shadow-massive transition duration-300">
                  <Play size={28} className="ml-1" />
                  <span className="absolute inset-0 rounded-full border border-white/30 animate-ping pointer-events-none" />
               </a>
            </div>
         </div>
      </section>
   );
};

export default CampusTourVideo;
