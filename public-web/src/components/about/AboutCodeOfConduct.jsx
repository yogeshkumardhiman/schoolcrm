"use client";

import React from "react";
import { Scale, CheckCircle2 } from "lucide-react";

const AboutCodeOfConduct = ({ rules }) => {
  if (!rules || rules.length === 0) return null;

  return (
    <section className="space-y-10 pt-6">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs sm:text-sm font-black uppercase tracking-[4px] text-[var(--primary)] block flex items-center justify-center gap-2">
          <Scale size={18} />
          <span>Campus Discipline & Safety Protocols</span>
        </span>
        <h2 className="text-3xl sm:text-5xl font-black text-[#0F172A] tracking-tight uppercase">
          School Code of Conduct & Rules
        </h2>
        <p className="text-base text-slate-600 max-w-xl mx-auto font-medium">
          Preserving an environment of mutual respect, safety, academic focus, and exemplary discipline.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rules.map((rule, rIdx) => (
          <div
            key={rule.id || rIdx}
            className="p-7 sm:p-8 rounded-3xl border border-slate-200 bg-white space-y-4 hover:border-[var(--primary)]/50 hover:shadow-xl transition-all flex flex-col justify-between"
          >
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-[var(--primary)] bg-[var(--primary)]/10 border border-[var(--primary)]/20 px-3 py-1 rounded-md">
                  {rule.category || "Rule"}
                </span>
                <span className="text-sm font-mono text-slate-400 font-bold">0{rIdx + 1}</span>
              </div>
              <h3 className="font-bold text-[#0F172A] text-lg sm:text-xl tracking-tight leading-snug">{rule.title}</h3>
              <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed font-normal">
                {rule.ruleDesc || rule.desc}
              </p>
            </div>
            <div className="pt-3 flex items-center gap-2 text-xs sm:text-sm text-slate-600 font-semibold border-t border-slate-100">
              <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
              <span>Mandatory for all enrolled scholars</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AboutCodeOfConduct;
