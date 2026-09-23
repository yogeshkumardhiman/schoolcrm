"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, ShieldCheck, GraduationCap, Clock, Trophy, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SITE_CONFIG } from "@/constants/config";
import { fetchSchoolInfo } from "@/services/school";

export default function Teachers() {
  const [staff, setStaff] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [schoolInfo, setSchoolInfo] = useState(null);

  useEffect(() => {
    fetchSchoolInfo().then((info) => {
      if (info) setSchoolInfo(info);
    });

    const loadStaff = async () => {
      try {
        const endpoints = [
          "http://127.0.0.1:4000/public/staff",
          "http://127.0.0.1:4000/staff",
          "http://127.0.0.1:4000/website/staff"
        ];
        let loaded = false;
        for (const url of endpoints) {
          try {
            const res = await fetch(url, { cache: "no-store" });
            if (res.ok) {
              const data = await res.json();
              if (Array.isArray(data) && data.length > 0) {
                setStaff(data);
                loaded = true;
                break;
              }
            }
          } catch {}
        }
        if (!loaded) {
          setStaff([
            { id: 1, name: "Dr. Ramesh Chandra", role: "PRINCIPAL", designation: "Principal & Director", subject: "Administration & Leadership" },
            { id: 2, name: "Mrs. Sunita Sharma", role: "VICE_PRINCIPAL", designation: "Vice Principal", subject: "Academic Governance" },
            { id: 3, name: "Mr. Rajesh Kumar", role: "TEACHER", designation: "PGT Physics Lead", subject: "Physics & Astronomy" },
            { id: 4, name: "Mrs. Anita Verma", role: "TEACHER", designation: "PGT Mathematics", subject: "Pure & Applied Mathematics" },
            { id: 5, name: "Mr. Amit Singh", role: "TEACHER", designation: "TGT Computer Science", subject: "Python & AI Robotics" },
            { id: 6, name: "Mrs. Pooja Mishra", role: "TEACHER", designation: "TGT English Literature", subject: "English & Debating" },
            { id: 7, name: "Mr. Devendra Pal", role: "TEACHER", designation: "Physical Education Director", subject: "Athletics & Multi-Sports" },
            { id: 8, name: "Mrs. Neha Gupta", role: "TEACHER", designation: "PRT Head Coordinator", subject: "Foundational Pedagogy" }
          ]);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    };
    loadStaff();
  }, []);

  const filteredStaff =
    filter === "all"
      ? staff
      : staff.filter((s) => s.role.toLowerCase() === filter.toLowerCase() || (filter === "TEACHER" && s.role.includes("TEACHER")));

  return (
    <div className="bg-[#FFFFFF] min-h-screen selection:bg-[var(--primary)] selection:text-white text-[#0F172A] overflow-x-hidden pt-24 pb-36 font-sans antialiased">
      
      {/* 🚀 Header: Faculty Architects */}
      <section className="relative pt-12 pb-20 px-6 text-center bg-gradient-to-b from-slate-50 via-slate-100/60 to-white border-b border-slate-200">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-xs font-bold text-[var(--primary)] tracking-wider">
            <Sparkles size={14} className="text-amber-500 animate-pulse" />
            <span>{SITE_CONFIG.teachers.heroTag || "ACADEMIC ARCHITECTS & MENTORS"}</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-[#0F172A] tracking-tight uppercase leading-tight">
            Distinguished <span className="bg-gradient-to-r from-[var(--primary)] via-indigo-600 to-purple-600 bg-clip-text text-transparent">Faculty & Leadership</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 font-normal max-w-2xl mx-auto leading-relaxed">
            {SITE_CONFIG.teachers.heroDesc || "Our seasoned CBSE educators cultivate critical reasoning, moral integrity, and conceptual mastery in every student."}
          </p>
        </motion.div>
      </section>

      {/* 👨‍🏫 Filterable Faculty Grid */}
      <section className="py-16">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="text-center mb-14 space-y-4">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-[#0F172A] uppercase">
              {SITE_CONFIG.teachers.sectionTitle || "Our Dedicated Educator Fraternity"}
            </h2>
            <div className="w-16 h-1 bg-[var(--primary,#1E3A8A)] mx-auto rounded-full" />

            {/* Filters */}
            <div className="flex flex-wrap justify-center gap-2 pt-4">
              {["all", "MANAGEMENT", "TEACHER"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    filter === cat
                      ? "bg-[var(--primary,#1E3A8A)] text-white shadow-md"
                      : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {cat === "all" ? "All Faculty" : cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center p-32">
              <div className="w-8 h-8 border-3 border-[var(--primary,#1E3A8A)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredStaff.map((member, i) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="rounded-3xl border border-slate-200 overflow-hidden bg-white hover:border-[var(--primary)]/50 hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
                    <CardContent className="p-0 flex flex-col flex-1">
                      <div className="h-64 w-full overflow-hidden relative bg-slate-100">
                        {member.image ? (
                          <img
                            src={member.image}
                            alt={member.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                            <GraduationCap size={48} />
                          </div>
                        )}
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-white/90 backdrop-blur-md text-[var(--primary)] border border-slate-200 font-bold text-xs px-3 py-1 uppercase tracking-wider shadow-xs">
                            {member.role}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <h3 className="text-xl font-bold text-[#0F172A] tracking-tight">{member.name}</h3>
                          <p className="text-xs font-semibold text-[var(--primary)] uppercase tracking-wider mt-1">{member.designation || member.role}</p>
                          <p className="text-sm text-slate-600 mt-2 font-medium">{member.subject || "Holistic Curriculum Lead"}</p>
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
                          <span>CBSE Faculty</span>
                          <span className="text-[var(--primary)] flex items-center gap-1">
                            <Award size={13} className="text-emerald-500" /> Certified
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 🏆 Trust Indicators */}
      <section className="py-16 border-t border-slate-200 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[
            { icon: Award, label: "CBSE Recognized", value: "A+ Academic Rating" },
            { icon: ShieldCheck, label: "Child Safeguarding", value: "100% Verified Faculty" },
            { icon: GraduationCap, label: "Expert Pedagogy", value: "Continuous Upskilling" },
            { icon: Clock, label: "Institutional Legacy", value: "18+ Years Excellence" }
          ].map((stat, i) => (
            <div key={i} className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-[var(--primary,#1E3A8A)] shrink-0">
                <stat.icon size={22} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-sm font-bold text-[#0F172A]">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
