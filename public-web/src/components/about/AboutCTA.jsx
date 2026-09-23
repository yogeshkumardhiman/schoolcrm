"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";

const AboutCTA = ({ schoolData }) => {
  const schoolName = (schoolData?.schoolName || schoolData?.name || '').trim();

  return (
    <section className="rounded-3xl p-8 sm:p-12 border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
      <div className="space-y-2 text-center md:text-left">
        <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
          Ready to Join the {schoolName || "School"} Family?
        </h3>
        <p className="text-sm text-slate-300 font-medium">
          Admissions for Session 2026-27 are currently open for all classes from Pre-Primary to Grade XII.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3 shrink-0">
        <Link
          href="/admission#apply"
          className="h-11 px-6 rounded-xl bg-[var(--primary)] hover:opacity-90 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg cursor-pointer"
        >
          <span>Apply for Admission</span>
          <ArrowRight size={14} />
        </Link>
        <Link
          href="/fees"
          className="h-11 px-6 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer"
        >
          <span>View Fee Structure</span>
          <ChevronRight size={14} />
        </Link>
      </div>
    </section>
  );
};

export default AboutCTA;
