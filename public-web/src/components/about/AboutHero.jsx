"use client";

import React from "react";
import { Sparkles } from "lucide-react";

const AboutHero = ({ schoolData }) => {
  const schoolName = (schoolData?.schoolName || schoolData?.name || '').trim();
  const rawTitle = schoolData?.aboutTitle || "A Legacy of Academic Distinction & Holistic Character Building";
  const cleanText = (txt) => (txt || '').replace(/S\.D\.M\.|SDM/gi, schoolName || 'Our School').replace(/\s+/g, ' ').trim();
  const displayTitle = cleanText(rawTitle);

  return (
    <section className="relative pt-28 pb-12 lg:pt-32 lg:pb-16 px-6 text-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/60 via-slate-50 to-white border-b border-slate-200/80 overflow-hidden">
      
      {/* Radial Background Glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[250px] bg-gradient-to-r from-blue-400/10 via-indigo-500/10 to-purple-500/10 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-4xl mx-auto space-y-4 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-bold text-[var(--primary)] tracking-wider shadow-xs">
          <Sparkles size={14} className="text-amber-500 animate-pulse" />
          <span>CBSE AFFILIATED INSTITUTION • ESTABLISHED LEGACY</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-[#0F172A] tracking-tight uppercase leading-tight">
          About <span className="bg-gradient-to-r from-[var(--primary)] via-indigo-600 to-purple-600 bg-clip-text text-transparent">{schoolName || "Our School"}</span>
        </h1>

        <p className="text-base sm:text-xl text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
          {displayTitle}
        </p>
      </div>
    </section>
  );
};

export default AboutHero;
