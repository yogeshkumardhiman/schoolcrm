"use client";

import React from "react";
import { GraduationCap } from "lucide-react";

const AboutPillars = ({ pillars }) => {
  if (!pillars || pillars.length === 0) return null;

  return (
    <section className="space-y-10 pt-6">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-black uppercase tracking-[4px] text-amber-500 block">Why Parents Trust Us</span>
        <h2 className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight uppercase">
          Pillars of Institutional Distinction
        </h2>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {pillars.map((pillar, pIdx) => (
          <div
            key={pillar.id || pIdx}
            className="p-6 rounded-3xl border border-slate-200 bg-white space-y-3 hover:border-[var(--primary)]/50 hover:shadow-lg transition-all"
          >
            <div className="w-11 h-11 rounded-2xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)]">
              <GraduationCap size={22} />
            </div>
            <h4 className="text-base font-bold text-[#0F172A] tracking-tight">{pillar.title}</h4>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">{pillar.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AboutPillars;
