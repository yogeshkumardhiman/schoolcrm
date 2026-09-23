"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Clock, GraduationCap, MapPin, ChevronUp, ChevronDown, CheckCircle2, Send, ArrowRight } from "lucide-react";

const DEPARTMENTS = ["All Roles", "Senior Secondary", "Secondary", "Primary", "Pre-Primary", "Sports & Fitness", "Administration"];

const CareerVacancies = ({ jobs, onApplyClick }) => {
  const [selectedDept, setSelectedDept] = useState("All Roles");
  const [expandedJob, setExpandedJob] = useState(1);

  const activeJobs = (jobs || []).filter((j) => j.isActive !== false);
  const filteredJobs = activeJobs.filter((j) => {
    if (selectedDept === "All Roles") return true;
    return (j.department || '').toLowerCase().includes(selectedDept.toLowerCase());
  });

  return (
    <section id="openings" className="py-20 lg:py-28 bg-slate-50/70 border-y border-slate-200/80 relative scroll-mt-20">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div className="space-y-2">
            <span className="label-tag block text-xs font-black uppercase tracking-widest" style={{ color: 'var(--primary)' }}>
              Open Positions
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0F172A] tracking-tight">
              Current Vacancies
            </h2>
            <p className="text-sm md:text-base text-slate-600 font-medium">
              Showing {filteredJobs.length} active teaching & administrative roles
            </p>
          </div>

          {/* Department Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {DEPARTMENTS.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedDept === dept
                    ? "bg-[var(--primary,#1E3A8A)] text-white shadow-md scale-105"
                    : "bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-100 shadow-xs"
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {/* Vacancy Accordion Cards */}
        <div className="space-y-4 max-w-4xl mx-auto">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => {
              const isOpen = expandedJob === job.id;
              return (
                <motion.div
                  key={job.id}
                  layout
                  className="rounded-3xl border border-slate-200/90 bg-white overflow-hidden shadow-xs hover:shadow-md hover:border-[var(--primary)]/40 transition-all"
                >
                  <button
                    onClick={() => setExpandedJob(isOpen ? null : job.id)}
                    className="w-full p-6 sm:p-7 flex items-center justify-between text-left gap-4 cursor-pointer group"
                  >
                    <div className="flex items-center gap-4 sm:gap-5 min-w-0">
                      <div className="w-13 h-13 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-[var(--primary)] shrink-0 group-hover:bg-[var(--primary)] group-hover:text-white transition-all duration-300">
                        <Briefcase size={22} />
                      </div>
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h3 className="text-base sm:text-xl font-extrabold text-[#0F172A] truncate">{job.title}</h3>
                          <span className="text-[10px] font-black px-3 py-1 rounded-full bg-indigo-50 text-[var(--primary)] border border-indigo-100 uppercase tracking-wider">
                            {job.department}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-600 font-medium">
                          <span className="flex items-center gap-1.5"><Clock size={14} className="text-slate-400" /> {job.type}</span>
                          <span className="flex items-center gap-1.5"><GraduationCap size={14} className="text-slate-400" /> Exp: {job.experience}</span>
                          <span className="flex items-center gap-1.5 text-slate-500"><MapPin size={14} className="text-slate-400" /> {job.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0 group-hover:bg-[var(--primary)] group-hover:text-white transition-all">
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="px-6 sm:px-8 pb-7 pt-2 border-t border-slate-100 space-y-5"
                      >
                        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal pt-2">
                          {job.description}
                        </p>

                        {Array.isArray(job.requirements) && (
                          <div className="space-y-2.5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">Key Qualifications & Skillsets Required:</h4>
                            <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                              {job.requirements.map((req, rIdx) => (
                                <li key={rIdx} className="flex items-start gap-2.5">
                                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                                  <span className="font-medium">{req}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
                          <div className="text-xs text-slate-600 font-medium">
                            <strong className="text-slate-900">Minimum Qualification:</strong> {job.qualification}
                          </div>
                          <button
                            onClick={() => onApplyClick(job.title)}
                            className="h-11 px-6 rounded-xl bg-[var(--primary,#1E3A8A)] hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-95"
                          >
                            <span>Apply For Position</span>
                            <ArrowRight size={14} />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          ) : (
            <div className="py-20 text-center bg-white rounded-3xl border border-slate-200">
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No active vacancies found in selected department.</p>
            </div>
          )}
        </div>

      </div>
    </section>
  );
};

export default CareerVacancies;
