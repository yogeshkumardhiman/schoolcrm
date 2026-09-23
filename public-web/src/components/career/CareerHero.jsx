"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Briefcase, Send, Users, Award, GraduationCap, CheckCircle2 } from "lucide-react";
import { Counter } from "@/components/home/home-helpers";

const CareerHero = ({ schoolInfo, hrConfig }) => {
  const resolvedName = (schoolInfo?.schoolName || schoolInfo?.name || '').trim();

  return (
    <section className="relative pt-32 pb-20 lg:pt-36 lg:pb-24 overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/50 via-slate-50 to-white border-b border-slate-200/80">
      
      {/* Background Decorative Glow Blobs */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gradient-to-r from-blue-400/10 via-indigo-500/10 to-purple-500/10 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-7 max-w-4xl mx-auto"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-slate-200 text-xs font-extrabold text-[var(--primary)] tracking-wider shadow-sm">
            <Sparkles size={14} className="text-amber-500 animate-pulse" />
            <span>{hrConfig?.sessionTag || `${resolvedName ? `${resolvedName.toUpperCase()} • ` : ''}FACULTY RECRUITMENT 2026-27`}</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[#0F172A] tracking-tight leading-[1.12]">
            {hrConfig?.headline ? (
              <span>{hrConfig.headline}</span>
            ) : (
              <>
                Inspire the Next Generation of <br />
                <span className="bg-gradient-to-r from-[var(--primary)] via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  CBSE Scholars & Leaders
                </span>
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
            {hrConfig?.subheadline || `Join ${resolvedName || 'our academy'}'s dynamic fraternity of educators, researchers, and mentors dedicated to transformative pedagogy.`}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href="#openings"
              className="h-12 px-7 rounded-full bg-[var(--primary,#1E3A8A)] hover:opacity-95 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer min-w-[200px]"
            >
              <span>Explore Open Positions</span>
              <Briefcase size={16} />
            </a>
            <a
              href="#apply-form"
              className="h-12 px-7 rounded-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-xs min-w-[200px]"
            >
              <span>Fast-Track Application</span>
              <Send size={16} />
            </a>
          </div>

          {/* Metrics Cards Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-12 border-t border-slate-200/80 max-w-4xl mx-auto text-left">
            {[
              { val: "150+", lbl: "Faculty Members", desc: "Passionate Educators", icon: Users },
              { val: "18+", lbl: "Years Legacy", desc: "CBSE Distinction", icon: Award },
              { val: "1:20", lbl: "Teacher-Student Ratio", desc: "Personal Focus", icon: GraduationCap },
              { val: "100%", lbl: "Board Pass Rate", desc: "Excellence Record", icon: CheckCircle2 }
            ].map((m, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -4 }}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-[var(--primary)]/30 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-2xl sm:text-3xl font-extrabold text-[var(--primary)] font-mono tracking-tight">
                    <Counter target={m.val} />
                  </div>
                  <m.icon size={18} className="text-slate-400" />
                </div>
                <div className="text-xs font-extrabold text-slate-900">{m.lbl}</div>
                <div className="text-[11px] text-slate-500 font-medium">{m.desc}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CareerHero;
