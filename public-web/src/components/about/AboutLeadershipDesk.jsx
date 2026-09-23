"use client";

import React from "react";
import { GraduationCap, User, CheckCircle2, Quote, Sparkles } from "lucide-react";
import { getResolvedUrl } from "@/services/api";

const AboutLeadershipDesk = ({ schoolData, leaders }) => {
  const schoolName = (schoolData?.schoolName || schoolData?.name || '').trim();

  // Don't render section if no real leader data from API
  if (!leaders || leaders.length === 0) return null;

  const leader = leaders[0];
  const photoUrl = getResolvedUrl(leader.photo || leader.image_url);

  return (
    <section className="space-y-8 pt-4">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 text-[var(--primary)] text-xs font-black uppercase tracking-[3px]">
          <GraduationCap size={16} className="text-blue-600" />
          <span>Institutional Mentorship & Governance</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight uppercase">
          From the Principal's Desk
        </h2>
        <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto font-medium">
          Guiding our scholars with dedicated mentorship, educational passion, and visionary leadership.
        </p>
      </div>

      {/* Wide 2-Column Card: Left Photo, Right Message (Wide & Sleek Compact Height) */}
      <div className="max-w-6xl mx-auto rounded-3xl border border-slate-200/90 bg-white shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300">
        <div className="grid lg:grid-cols-12 items-stretch">
          
          {/* Left Column: Portrait Photo & Identity Card (4 Cols) */}
          <div className="lg:col-span-4 bg-gradient-to-b from-slate-900 via-slate-850 to-slate-950 p-6 sm:p-7 text-white flex flex-col items-center justify-center text-center relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -top-16 -left-16 w-40 h-40 bg-blue-500/20 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-purple-500/20 blur-3xl rounded-full pointer-events-none" />

            <div className="relative z-10 space-y-4 w-full max-w-[240px]">
              {/* Photo Frame (Compact Sleek Dimension) */}
              <div className="w-full aspect-[4/4.8] rounded-2xl overflow-hidden border-3 border-white/15 shadow-xl bg-slate-800 relative group mx-auto">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={leader.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-400 gap-1.5">
                    <User size={52} className="opacity-50" />
                    <span className="text-[11px] uppercase font-bold tracking-wider">Faculty Portrait</span>
                  </div>
                )}
              </div>

              {/* Identity Details */}
              <div className="space-y-1.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-[10px] font-black uppercase tracking-wider text-blue-300">
                  <Sparkles size={11} className="text-amber-400" />
                  {leader.designation || "Principal & Head of School"}
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">{leader.name}</h3>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{schoolName}</p>
              </div>

              {/* Official Seal Badge */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-center gap-1.5 text-[11px] text-emerald-400 font-bold">
                <CheckCircle2 size={14} />
                <span>Verified Administrative Note</span>
              </div>
            </div>
          </div>

          {/* Right Column: Message & Vision Narrative (8 Cols) */}
          <div className="lg:col-span-8 p-6 sm:p-8 md:p-10 flex flex-col justify-between space-y-6 bg-white">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-black uppercase tracking-widest text-[var(--primary)] block">
                    WELCOME ADDRESS
                  </span>
                  <h4 className="text-lg sm:text-xl font-extrabold text-[#0F172A] tracking-tight">
                    Nurturing Tomorrow's Leaders Today
                  </h4>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[var(--primary)] flex items-center justify-center shrink-0 shadow-xs">
                  <Quote size={20} />
                </div>
              </div>

              {leader.quote && (
                <blockquote className="text-sm sm:text-base text-slate-700 italic border-l-4 border-amber-400 pl-3.5 py-1.5 bg-amber-50/50 rounded-r-xl font-medium">
                  "{leader.quote}"
                </blockquote>
              )}

              <div className="text-slate-600 text-xs sm:text-sm leading-relaxed font-normal space-y-3 whitespace-pre-line">
                {leader.message}
              </div>
            </div>

            {/* Signature & Closing */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Official Signatory</p>
                <p className="text-sm sm:text-base font-extrabold text-[#0F172A]">{leader.name}</p>
                <p className="text-xs text-slate-500 font-medium">{leader.designation || "Principal"}, {schoolName}</p>
              </div>

              <div className="text-left sm:text-right">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Academic Session</p>
                <p className="text-xs sm:text-sm font-bold text-[var(--primary)] font-mono">2026 – 2027</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AboutLeadershipDesk;
