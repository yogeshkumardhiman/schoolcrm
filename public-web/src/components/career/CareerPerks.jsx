"use client";

import React from "react";
import { motion } from "framer-motion";
import { Award, GraduationCap, Building2, Heart, Star, Zap, ArrowRight } from "lucide-react";

const DEFAULT_PERKS = [
  {
    icon: Award,
    title: "Competitive Compensation",
    desc: "Market-leading pay scales aligned with CBSE norms, timely monthly disbursement, and performance-driven annual increments.",
    highlight: "CBSE Salary Norms"
  },
  {
    icon: GraduationCap,
    title: "Continuous Upskilling",
    desc: "Sponsored participation in CBSE capacity building workshops, national pedagogy seminars, and technological certifications.",
    highlight: "Sponsored Seminars"
  },
  {
    icon: Building2,
    title: "Smart Infrastructure",
    desc: "Air-conditioned interactive classrooms, high-speed campus Wi-Fi, modern staff lounges, and digital administrative tools.",
    highlight: "Modern Workspaces"
  },
  {
    icon: Heart,
    title: "Comprehensive Staff Welfare",
    desc: "Medical room support, group accidental insurance, subsidized ward education fee concessions, and transport convenience.",
    highlight: "Ward Education Subsidies"
  },
  {
    icon: Star,
    title: "Vibrant Work Culture",
    desc: "Collaborative mentorship from seasoned educationists, transparent leadership desk, and meritocratic appreciation.",
    highlight: "Transparent Leadership"
  },
  {
    icon: Zap,
    title: "Generous Leave Benefits",
    desc: "Paid summer & winter vacations, earned leaves, casual leaves, festival breaks, and maternity/paternity support.",
    highlight: "Paid Summer Breaks"
  }
];

const CareerPerks = () => {
  return (
    <section className="py-20 lg:py-28 bg-white relative">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="label-tag block text-xs font-black uppercase tracking-widest" style={{ color: 'var(--primary)' }}>
            Educator Welfare & Perks
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0F172A] tracking-tight">
            Why Build Your Career With Us?
          </h2>
          <p className="text-base text-slate-600 font-medium">
            We empower our teachers with professional autonomy, digital classroom technology, and rewarding career progression.
          </p>
        </div>

        {/* Perks Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DEFAULT_PERKS.map((p, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              className="p-8 rounded-3xl bg-slate-50/70 border border-slate-200/80 shadow-xs hover:bg-white hover:border-[var(--primary)]/40 hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-13 h-13 rounded-2xl bg-white border border-slate-200/90 flex items-center justify-center text-[var(--primary)] shadow-sm group-hover:bg-[var(--primary)] group-hover:text-white transition-all duration-300">
                    <p.icon size={24} />
                  </div>
                  <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-600 uppercase tracking-wider">
                    {p.highlight}
                  </span>
                </div>

                <div className="space-y-2 pt-2">
                  <h3 className="text-xl font-extrabold text-[#0F172A] tracking-tight">{p.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-normal">{p.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default CareerPerks;
