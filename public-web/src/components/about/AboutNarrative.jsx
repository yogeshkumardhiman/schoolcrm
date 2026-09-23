"use client";

import React from "react";
import { Award, Target, Sparkles, Trophy, Users, Bus, ArrowUpRight } from "lucide-react";
import { Counter } from "@/components/home/home-helpers";

const AboutNarrative = ({ schoolData }) => {
  const schoolName = (schoolData?.schoolName || schoolData?.name || '').trim();
  const aboutDesc = schoolData?.aboutDescription || "Established with the vision to deliver transformative CBSE education, our institution empowers young scholars through an optimal blend of traditional values and 21st-century modern pedagogical excellence.";
  const mission = schoolData?.mission || schoolData?.about_config?.mission || "To provide quality education that nurtures intellectual curiosity, strong character, creativity, and essential life skills, empowering every student to learn, grow, and contribute positively to society.";
  const vision = schoolData?.vision || schoolData?.about_config?.vision || "To become a leading institution that inspires lifelong learning, builds confident and responsible individuals, and prepares students to excel in a rapidly changing world while upholding strong values and integrity.";

  return (
    <div className="space-y-16">
      
      {/* ── 1. INSTITUTIONAL HERITAGE & METRICS ── */}
      <section className="grid lg:grid-cols-12 gap-10 items-center">
        
        {/* Left Column: Narrative Headline & History */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-[var(--primary)] text-xs font-black uppercase tracking-[2px] shadow-xs">
            <Award size={15} className="text-amber-500" />
            <span>Our Heritage & Educational Ethos</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0F172A] tracking-tight leading-[1.15]">
            Shaping Tomorrow's Visionaries with <span className="bg-gradient-to-r from-[var(--primary)] via-indigo-600 to-purple-600 bg-clip-text text-transparent">Ethical Roots & Innovation</span>
          </h2>

          <p className="text-base text-slate-600 leading-relaxed font-normal">
            {aboutDesc}
          </p>

          {/* 3 Metric Stat Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
            
            {/* Stat 1 */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/60 via-white to-amber-50/30 border border-amber-200/80 shadow-xs hover:shadow-md hover:scale-[1.02] transition-all group">
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Trophy size={18} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-100/60 px-2 py-0.5 rounded-md">CBSE</span>
              </div>
              <p className="text-3xl font-black text-slate-900 font-mono">
                <Counter target="100%" />
              </p>
              <p className="text-xs text-slate-500 uppercase font-bold mt-1">Board Distinction</p>
            </div>

            {/* Stat 2 */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/60 via-white to-blue-50/30 border border-blue-200/80 shadow-xs hover:shadow-md hover:scale-[1.02] transition-all group">
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-[var(--primary)] flex items-center justify-center">
                  <Users size={18} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-100/60 px-2 py-0.5 rounded-md">Mentorship</span>
              </div>
              <p className="text-3xl font-black text-slate-900 font-mono">15 : 1</p>
              <p className="text-xs text-slate-500 uppercase font-bold mt-1">Faculty Ratio</p>
            </div>

            {/* Stat 3 */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/60 via-white to-emerald-50/30 border border-emerald-200/80 shadow-xs hover:shadow-md hover:scale-[1.02] transition-all col-span-2 sm:col-span-1 group">
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Bus size={18} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-100/60 px-2 py-0.5 rounded-md">Safety</span>
              </div>
              <p className="text-3xl font-black text-slate-900 font-mono">
                <Counter target="25+" />
              </p>
              <p className="text-xs text-slate-500 uppercase font-bold mt-1">GPS Bus Routes</p>
            </div>

          </div>
        </div>

        {/* Right Column: Decorative Campus Badge & Overview */}
        <div className="lg:col-span-5 relative">
          <div className="rounded-3xl p-8 sm:p-10 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-2xl relative overflow-hidden space-y-6">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/15 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/15 blur-3xl rounded-full pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-blue-300">
                <Sparkles size={13} className="text-amber-400" />
                <span>EXCELLENCE IN EDUCATION</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug text-white">
                Empowering Minds, Inspiring Character
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed font-normal">
                At {schoolName || "our institution"}, education transcends textbooks. We cultivate creative intellect, sportsmanship, and ethical empathy to build tomorrow's global torchbearers.
              </p>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 font-semibold">
                <span>Holistic Pedagogy</span>
                <span className="text-blue-300 font-bold">CBSE Curriculum</span>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* ── 2. VIBRANT MISSION & VISION DUAL CARDS ── */}
      <section className="grid md:grid-cols-2 gap-8 pt-4">
        
        {/* Mission Card: Deep Royal Blue & Indigo Gradient */}
        <div className="rounded-3xl p-8 sm:p-10 bg-gradient-to-br from-[#1E3A8A] via-[#1E40AF] to-[#312E81] text-white shadow-xl hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 relative overflow-hidden group flex flex-col justify-between">
          {/* Ambient Glows */}
          <div className="absolute -top-16 -right-16 w-52 h-52 bg-cyan-400/20 blur-3xl rounded-full pointer-events-none group-hover:scale-125 transition-transform duration-500" />
          <div className="absolute -bottom-16 -left-16 w-52 h-52 bg-blue-600/30 blur-3xl rounded-full pointer-events-none" />

          <div className="relative z-10 space-y-5">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/15 border border-white/25 text-xs font-black uppercase tracking-widest text-cyan-200 shadow-inner">
                <Target size={16} className="text-cyan-300 animate-pulse" />
                <span>CORE PURPOSE</span>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-cyan-300 shadow-xs">
                <ArrowUpRight size={20} />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
                Our Mission
              </h3>
              <div className="w-16 h-1 rounded-full bg-gradient-to-r from-cyan-400 to-blue-300" />
            </div>

            <p className="text-sm sm:text-base text-blue-100 leading-relaxed font-normal">
              {mission}
            </p>
          </div>

          <div className="relative z-10 pt-6 mt-6 border-t border-white/15 flex items-center justify-between text-xs text-cyan-200/80 font-bold uppercase tracking-wider">
            <span>Student-Centric Growth</span>
            <span className="text-white">Active Milestone</span>
          </div>
        </div>

        {/* Vision Card: Radiant Violet, Purple & Fuchsia Gradient */}
        <div className="rounded-3xl p-8 sm:p-10 bg-gradient-to-br from-[#581C87] via-[#6B21A8] to-[#4C1D95] text-white shadow-xl hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 relative overflow-hidden group flex flex-col justify-between">
          {/* Ambient Glows */}
          <div className="absolute -top-16 -right-16 w-52 h-52 bg-fuchsia-400/20 blur-3xl rounded-full pointer-events-none group-hover:scale-125 transition-transform duration-500" />
          <div className="absolute -bottom-16 -left-16 w-52 h-52 bg-purple-600/30 blur-3xl rounded-full pointer-events-none" />

          <div className="relative z-10 space-y-5">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/15 border border-white/25 text-xs font-black uppercase tracking-widest text-pink-200 shadow-inner">
                <Sparkles size={16} className="text-amber-300 animate-pulse" />
                <span>FUTURE HORIZON</span>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-pink-300 shadow-xs">
                <ArrowUpRight size={20} />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
                Our Vision
              </h3>
              <div className="w-16 h-1 rounded-full bg-gradient-to-r from-pink-400 to-amber-300" />
            </div>

            <p className="text-sm sm:text-base text-purple-100 leading-relaxed font-normal">
              {vision}
            </p>
          </div>

          <div className="relative z-10 pt-6 mt-6 border-t border-white/15 flex items-center justify-between text-xs text-pink-200/80 font-bold uppercase tracking-wider">
            <span>Global Excellence</span>
            <span className="text-white">Institutional Goal</span>
          </div>
        </div>

      </section>

    </div>
  );
};

export default AboutNarrative;
