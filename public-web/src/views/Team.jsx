"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users,
  GraduationCap,
  Sparkles,
  Search,
  BookOpen,
  Award,
  Crown,
  Briefcase,
  ArrowRight,
  School,
  Calculator,
  Wrench,
  Info
} from "lucide-react";
import { fetchSchoolInfo } from "@/services/school";
import { getResolvedUrl } from "@/services/api";

export default function Team() {
  const [schoolInfo, setSchoolInfo] = useState(null);
  const [rawStaff, setRawStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadAllTeamData = async () => {
      setLoading(true);
      try {
        const [infoRes, staffRes] = await Promise.allSettled([
          fetchSchoolInfo(),
          fetch("http://127.0.0.1:4000/public/staff", { cache: "no-store" }).then(res => res.ok ? res.json() : [])
        ]);

        if (infoRes.status === "fulfilled" && infoRes.value) {
          setSchoolInfo(infoRes.value);
        }
        if (staffRes.status === "fulfilled" && Array.isArray(staffRes.value)) {
          setRawStaff(staffRes.value);
        }
      } catch (err) {
        console.error("Error loading team data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAllTeamData();
  }, []);

  // Unified Aggregated Team Members
  const allMembers = useMemo(() => {
    const list = [];
    const schoolName = (schoolInfo?.schoolName || schoolInfo?.name || "Our Institution").trim();

    // 1. Management Members (from director_message)
    const rawDirectors = Array.isArray(schoolInfo?.director_message) ? schoolInfo.director_message : [];
    rawDirectors.forEach((d, idx) => {
      if (d.name && d.name.trim()) {
        const isPrincipalRole = (d.designation || "").toLowerCase().includes("principal");
        list.push({
          id: d.id || `mgmt-${idx}`,
          name: d.name.trim(),
          role: isPrincipalRole ? "PRINCIPAL" : "MANAGEMENT",
          designation: d.designation || "Institutional Leader",
          quote: d.quote || "",
          bio: d.message || "",
          image: getResolvedUrl(d.photo || d.image || ""),
          qualification: d.qualification || "Educational Leadership & Governance",
          subject: d.subject || "Institutional Vision & Strategy",
          experience: d.experience || "Senior Leadership",
          email: d.email || schoolInfo?.email || schoolInfo?.contactEmail || "",
          phone: d.phone || schoolInfo?.phone || schoolInfo?.contactPhone || "",
          isLeadership: true
        });
      }
    });

    // 2. Principal (from schoolInfo principal fields if not already in list)
    const pName = (schoolInfo?.principalName || schoolInfo?.about_config?.principalName || "").trim();
    const pImage = schoolInfo?.principalImage || schoolInfo?.about_config?.principalImage || "";
    const pMsg = schoolInfo?.principalMessage || schoolInfo?.about_config?.principalMessage || "";
    const alreadyHasPrincipal = list.some(m => m.role === "PRINCIPAL" || m.name.toLowerCase() === pName.toLowerCase());

    if (pName && !alreadyHasPrincipal) {
      list.push({
        id: "principal-head",
        name: pName,
        role: "PRINCIPAL",
        designation: "School Principal & Head of Institution",
        quote: "Education is not merely about academic achievement; it is about nurturing responsible, confident, compassionate, and lifelong learners.",
        bio: pMsg || "Dedicated to creating an environment where every student feels valued, encouraged, and inspired to discover their potential.",
        image: getResolvedUrl(pImage),
        qualification: "Ph.D. / M.Ed., Academic Administration",
        subject: "Institutional Leadership & CBSE Curriculum Governance",
        experience: "20+ Years Educational Leadership",
        email: schoolInfo?.email || schoolInfo?.contactEmail || "",
        phone: schoolInfo?.phone || schoolInfo?.contactPhone || "",
        isLeadership: true
      });
    }

    // 3. Staff & Teachers from DB (/public/staff)
    if (Array.isArray(rawStaff)) {
      rawStaff.forEach((s) => {
        const rawRole = (s.role || "").toUpperCase();
        const desig = (s.designation || "").toUpperCase();
        const subj = (s.subject || "").toUpperCase();

        let assignedRole = "TEACHER";

        // Management Detection
        if (rawRole === "MANAGEMENT" || desig.includes("CHAIRMAN") || desig.includes("DIRECTOR") || desig.includes("FOUNDER") || desig.includes("TRUSTEE")) {
          assignedRole = "MANAGEMENT";
        }
        // Principal Detection
        else if (rawRole === "PRINCIPAL" || desig.includes("PRINCIPAL")) {
          assignedRole = "PRINCIPAL";
        }
        // Accountant Detection (Accounts, Fee, Registrar, Finance, Clerk)
        else if (
          rawRole === "ACCOUNTANT" ||
          rawRole === "CLERK" ||
          desig.includes("ACCOUNT") ||
          desig.includes("FEE") ||
          desig.includes("REGISTRAR") ||
          desig.includes("FINANCE") ||
          desig.includes("CASHIER") ||
          desig.includes("CLERK") ||
          subj.includes("ACCOUNT")
        ) {
          assignedRole = "ACCOUNTANT";
        }
        // Facilities & Maintenance Detection
        else if (
          rawRole === "FACILITIES" ||
          rawRole === "MAINTENANCE" ||
          desig.includes("FACILIT") ||
          desig.includes("MAINTENANCE") ||
          desig.includes("OPERATIONS") ||
          desig.includes("TRANSPORT") ||
          desig.includes("SECURITY") ||
          desig.includes("ESTATE") ||
          desig.includes("CARETAKER") ||
          desig.includes("ELECTRIC") ||
          desig.includes("SUPERVISOR")
        ) {
          assignedRole = "FACILITIES";
        }
        // General Staff
        else if (rawRole === "STAFF" || rawRole === "ADMIN" || desig.includes("STAFF") || desig.includes("ADMIN") || desig.includes("OFFICER")) {
          assignedRole = "FACILITIES";
        }

        const duplicate = list.some(m => m.name.toLowerCase() === (s.name || "").trim().toLowerCase());
        if (!duplicate && s.name && s.name.trim()) {
          list.push({
            id: s.id,
            name: s.name.trim(),
            role: assignedRole,
            designation: s.designation || (assignedRole === "TEACHER" ? "Faculty Educator" : assignedRole === "ACCOUNTANT" ? "Accountant" : "Facilities & Maintenance"),
            qualification: s.qualification || "Certified Professional",
            subject: s.subject || (assignedRole === "TEACHER" ? "General Academics" : assignedRole === "ACCOUNTANT" ? "Accounts & Finance" : "Campus Operations"),
            experience: s.experience || "Dedicated Professional",
            bio: s.bio || s.description || `Committed professional at ${schoolName}, delivering excellence in administrative and educational support.`,
            image: getResolvedUrl(s.image || s.photo || s.avatar || ""),
            email: s.email || "",
            phone: s.phone || ""
          });
        }
      });
    }

    return list;
  }, [schoolInfo, rawStaff]);

  // Counts for Tabs
  const tabCounts = useMemo(() => {
    return {
      all: allMembers.length,
      management: allMembers.filter(m => m.role === "MANAGEMENT").length,
      principal: allMembers.filter(m => m.role === "PRINCIPAL").length,
      teachers: allMembers.filter(m => m.role === "TEACHER").length,
      accountant: allMembers.filter(m => m.role === "ACCOUNTANT").length,
      facilities: allMembers.filter(m => m.role === "FACILITIES").length
    };
  }, [allMembers]);

  // Filter Categories (Requested: Management, Principal, Teachers, Accountant, Facilities & Maintenance)
  const categories = [
    { id: "all", label: "All Members", count: tabCounts.all, icon: Users },
    { id: "management", label: "Management", count: tabCounts.management, icon: Crown },
    { id: "principal", label: "Principal", count: tabCounts.principal, icon: School },
    { id: "teachers", label: "Teachers", count: tabCounts.teachers, icon: GraduationCap },
    { id: "accountant", label: "Accountant", count: tabCounts.accountant, icon: Calculator },
    { id: "facilities", label: "Facilities & Maintenance", count: tabCounts.facilities, icon: Wrench }
  ];

  // Filtered Members by Tab & Search Query
  const filteredMembers = useMemo(() => {
    return allMembers.filter((m) => {
      const roleUpper = (m.role || "").toUpperCase();
      let matchesTab = true;

      if (activeTab === "management") {
        matchesTab = roleUpper === "MANAGEMENT";
      } else if (activeTab === "principal") {
        matchesTab = roleUpper === "PRINCIPAL";
      } else if (activeTab === "teachers" || activeTab === "teacher") {
        matchesTab = roleUpper === "TEACHER";
      } else if (activeTab === "accountant") {
        matchesTab = roleUpper === "ACCOUNTANT";
      } else if (activeTab === "facilities") {
        matchesTab = roleUpper === "FACILITIES";
      }

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        m.name.toLowerCase().includes(query) ||
        m.designation.toLowerCase().includes(query) ||
        (m.subject && m.subject.toLowerCase().includes(query)) ||
        (m.qualification && m.qualification.toLowerCase().includes(query));

      return matchesTab && matchesSearch;
    });
  }, [allMembers, activeTab, searchQuery]);

  return (
    <div className="bg-[#F8FAFC] min-h-screen selection:bg-[var(--primary)] selection:text-white text-[#0F172A] antialiased overflow-x-hidden pt-20 pb-36 font-sans">
      
      {/* ── 1. HERO HEADER ── */}
      <section className="relative pt-12 pb-16 px-6 text-center bg-gradient-to-b from-[#EEF2F6] via-slate-100/70 to-[#F8FAFC] border-b border-slate-200">
        <div className="max-w-4xl mx-auto space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--primary,#1E3A8A)]/10 border border-[var(--primary,#1E3A8A)]/20 text-xs font-black text-[var(--primary,#1E3A8A)] uppercase tracking-widest">
            <Sparkles size={14} className="text-amber-500 animate-pulse" />
            <span>Institutional Leadership & Faculty</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-[#0F172A] tracking-tight uppercase leading-tight">
            Meet Our <span className="bg-gradient-to-r from-[var(--primary,#1E3A8A)] via-indigo-600 to-purple-600 bg-clip-text text-transparent">Dedicated Team</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 font-normal max-w-2xl mx-auto leading-relaxed">
            Our visionary leadership, certified CBSE educators, accounts team, and facilities specialists working together for student distinction.
          </p>

          {/* Search Bar */}
          <div className="pt-4 max-w-lg mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by name, subject, or designation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-20 py-3.5 rounded-2xl bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary,#1E3A8A)] focus:border-transparent shadow-xs transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs font-bold px-2.5 py-1 bg-slate-100 rounded-lg cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. STICKY FILTER TABS WITH LIVE BADGES ── */}
      <section className="py-6 border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeTab === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? "bg-[var(--primary,#1E3A8A)] text-white shadow-lg shadow-[var(--primary,#1E3A8A)]/25 scale-105"
                      : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 border border-slate-200"
                  }`}
                >
                  <Icon size={16} />
                  <span>{cat.label}</span>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-black ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 3. TEAM MEMBERS GRID ── */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="flex items-center justify-between mb-8">
            <p className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">
              Showing <span className="text-[var(--primary,#1E3A8A)] font-black text-base">{filteredMembers.length}</span> Members in {categories.find(c => c.id === activeTab)?.label}
            </p>
            <p className="text-xs text-slate-400 font-medium hidden sm:flex items-center gap-1">
              <Info size={14} /> Click any member card to view complete profile page
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div key={n} className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4 animate-pulse">
                  <div className="h-56 bg-slate-200 rounded-2xl w-full" />
                  <div className="h-5 bg-slate-200 rounded-md w-3/4" />
                  <div className="h-4 bg-slate-100 rounded-md w-1/2" />
                  <div className="h-10 bg-slate-100 rounded-xl w-full" />
                </div>
              ))}
            </div>
          ) : filteredMembers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
              {filteredMembers.map((member, i) => {
                const roleBadgeColors = {
                  MANAGEMENT: "bg-purple-50 text-purple-700 border-purple-200",
                  PRINCIPAL: "bg-blue-50 text-blue-700 border-blue-200",
                  TEACHER: "bg-emerald-50 text-emerald-700 border-emerald-200",
                  ACCOUNTANT: "bg-amber-50 text-amber-700 border-amber-200",
                  FACILITIES: "bg-slate-100 text-slate-800 border-slate-300"
                };

                const roleDisplayLabel = {
                  MANAGEMENT: "MANAGEMENT",
                  PRINCIPAL: "PRINCIPAL",
                  TEACHER: "TEACHER",
                  ACCOUNTANT: "ACCOUNTANT",
                  FACILITIES: "FACILITIES"
                }[member.role] || member.role;

                return (
                  <motion.div
                    key={member.id || i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: (i % 8) * 0.04 }}
                    className="group bg-white rounded-3xl border border-slate-200/90 hover:border-[var(--primary,#1E3A8A)] shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between transform hover:-translate-y-1.5"
                  >
                    <Link href={`/team/${encodeURIComponent(member.id)}`} className="flex flex-col h-full justify-between cursor-pointer">
                      <div>
                        {/* Portrait Box */}
                        <div className="h-64 w-full overflow-hidden relative bg-slate-900 border-b border-slate-100 flex items-center justify-center">
                          {member.image ? (
                            <img
                              src={member.image}
                              alt={member.name}
                              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => {
                                e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(member.name || "Teacher")}`;
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-800 to-slate-950 text-white">
                              <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center text-3xl font-black mb-2 text-white">
                                {member.name?.charAt(0) || "M"}
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                {roleDisplayLabel}
                              </span>
                            </div>
                          )}

                          {/* Top Role Badge */}
                          <div className="absolute top-3.5 right-3.5 z-10">
                            <span className={`px-3 py-1 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-wider border shadow-xs ${roleBadgeColors[member.role] || "bg-white text-slate-900"}`}>
                              {roleDisplayLabel}
                            </span>
                          </div>

                          {/* View Profile Hover Overlay */}
                          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                            <span className="px-4 py-2 bg-white text-slate-900 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                              <span>View Full Profile</span>
                              <ArrowRight size={14} className="text-blue-600" />
                            </span>
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="p-6 space-y-3">
                          <div>
                            <h3 className="font-extrabold text-[#0F172A] text-lg sm:text-xl tracking-tight group-hover:text-[var(--primary,#1E3A8A)] transition-colors line-clamp-1">
                              {member.name}
                            </h3>
                            <p className="text-xs font-bold text-[var(--primary,#1E3A8A)] uppercase tracking-wider mt-0.5 line-clamp-1">
                              {member.designation}
                            </p>
                          </div>

                          {/* Quote or Subject */}
                          {member.quote ? (
                            <p className="text-xs text-slate-600 italic line-clamp-2 border-l-2 border-amber-400 pl-2.5 py-0.5">
                              "{member.quote}"
                            </p>
                          ) : (
                            <div className="space-y-1 pt-1 text-xs text-slate-600">
                              {member.subject && (
                                <div className="flex items-center gap-1.5 line-clamp-1">
                                  <BookOpen size={13} className="text-slate-400 shrink-0" />
                                  <span className="font-medium">{member.subject}</span>
                                </div>
                              )}
                              {member.qualification && (
                                <div className="flex items-center gap-1.5 line-clamp-1">
                                  <GraduationCap size={13} className="text-slate-400 shrink-0" />
                                  <span className="text-slate-500">{member.qualification}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="px-6 pb-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold bg-slate-50/50">
                        <span className="flex items-center gap-1 text-[11px] text-slate-500">
                          <Award size={13} className="text-amber-500" />
                          <span>{member.experience || "CBSE Faculty"}</span>
                        </span>
                        <span className="text-[var(--primary,#1E3A8A)] font-bold flex items-center gap-1 text-xs group-hover:translate-x-1 transition-transform">
                          <span>Profile</span>
                          <ArrowRight size={13} />
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="p-16 rounded-3xl bg-white border border-slate-200 text-center max-w-xl mx-auto space-y-4 shadow-xs">
              <Users size={48} className="text-slate-300 mx-auto" />
              <h3 className="text-xl font-bold text-[#0F172A]">No Members Found</h3>
              <p className="text-sm text-slate-500">
                No staff member matched your current filter. Try resetting search or selecting a different tab.
              </p>
              <button
                onClick={() => { setActiveTab("all"); setSearchQuery(""); }}
                className="px-6 py-2.5 rounded-xl bg-[var(--primary,#1E3A8A)] text-white text-xs font-bold uppercase tracking-wider cursor-pointer shadow-md hover:bg-opacity-90"
              >
                Reset Filters
              </button>
            </div>
          )}

        </div>
      </section>

    </div>
  );
}
