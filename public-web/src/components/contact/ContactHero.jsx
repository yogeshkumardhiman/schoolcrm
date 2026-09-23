"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, MessageSquare } from "lucide-react";
import { STRINGS, getSchoolName } from "@/constants/strings";

const ContactHero = ({ schoolDetails }) => {
  const schoolName = getSchoolName(schoolDetails);

  return (
    <section className="relative pt-32 pb-16 lg:pt-36 lg:pb-20 px-6 text-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/60 via-slate-50 to-white border-b border-slate-200/80 overflow-hidden">
      
      {/* Background Radial Glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[250px] bg-gradient-to-r from-blue-400/10 via-indigo-500/10 to-purple-500/10 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-4xl mx-auto space-y-5 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-extrabold text-[var(--primary)] tracking-wider shadow-xs"
        >
          <Sparkles size={14} className="text-amber-500 animate-pulse" />
          <span>{STRINGS.contact.heroTag || "INSTITUTIONAL HELPDESK"}</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold text-[#0F172A] tracking-tight uppercase leading-[1.12]"
        >
          {STRINGS.contact.heroHeadingPrefix} <span className="bg-gradient-to-r from-[var(--primary)] via-indigo-600 to-purple-600 bg-clip-text text-transparent">{schoolName}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-base sm:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed"
        >
          {STRINGS.contact.heroDesc || "Have questions regarding CBSE admissions, fee structure, or campus transport? Reach out to our dedicated administrative desks."}
        </motion.p>
      </div>
    </section>
  );
};

export default ContactHero;
