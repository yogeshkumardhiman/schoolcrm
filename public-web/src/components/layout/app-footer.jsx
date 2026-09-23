"use client";

import React from "react";
import {
  Phone,
  Mail,
  MapPin,
  Globe,
  Clock,
  FileText,
  CalendarDays,
  CreditCard,
  Award,
  BookOpen,
  ChevronRight,
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
  ArrowUp,
  GraduationCap,
  Bus,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { STRINGS, getSchoolName, getContactPhone, getContactEmail, getSchoolAddress, getSessionString } from "@/constants/strings";

const Footer = ({ schoolDetails }) => {
  const now = new Date();
  const baseYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  const admissionLabel = `Admissions ${baseYear}-${baseYear + 1}`;
  const resolvedSchoolName = (schoolDetails?.schoolName || schoolDetails?.name || '').trim();

  const dls = schoolDetails?.footer_config?.downloads || [];
  const getDlUrl = (idx) => dls[idx]?.fileUrl || null;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const quickLinks = [
    { name: "Home", path: "/" },
    { name: "About School", path: "/about" },
    { name: admissionLabel, path: "/admission" },
    { name: "Fee Structure & Transport", path: "/fees" },
    { name: "Academic Calendar", path: "/academic-calendar" },
    { name: "Our Team", path: "/team" },
    { name: "Campus Gallery", path: "/gallery" },
    { name: "News & Notices", path: "/news" },
    { name: "Careers & Vacancies", path: "/career" },
    { name: "Contact & Helpdesk", path: "/contact" }
  ];

  const academicLinks = [
    {
      name: "Fee Structure & Transport Slabs",
      path: "/fees",
      icon: CreditCard,
      isRoute: true
    },
    {
      name: "Online Admission Registration",
      path: "/admission#apply",
      icon: FileText,
      isRoute: true
    },
    {
      name: "CBSE Mandatory Disclosure",
      path: "/cbse-mandatory",
      icon: Award,
      isRoute: true
    },
    {
      name: "Academic Calendar 2026-27",
      path: "/academic-calendar",
      icon: CalendarDays,
      isRoute: true
    },
    {
      name: "Faculty Recruitment Portal",
      path: "/career",
      icon: BookOpen,
      isRoute: true
    }
  ];

  const socialLinks = [
    {
      url: schoolDetails?.facebookUrl || schoolDetails?.socialLinks?.facebook || schoolDetails?.footer_config?.social?.facebook,
      label: "Facebook",
      svg: (
        <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      )
    },
    {
      url: schoolDetails?.instagramUrl || schoolDetails?.socialLinks?.instagram || schoolDetails?.footer_config?.social?.instagram,
      label: "Instagram",
      svg: (
        <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      )
    },
    {
      url: schoolDetails?.youtubeUrl || schoolDetails?.socialLinks?.youtube || schoolDetails?.footer_config?.social?.youtube,
      label: "YouTube",
      svg: (
        <svg width="23" height="23" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      )
    },
    {
      url: schoolDetails?.linkedinUrl || schoolDetails?.socialLinks?.linkedin || schoolDetails?.footer_config?.social?.linkedin,
      label: "LinkedIn",
      svg: (
        <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.32a1.64 1.64 0 0 0-1.66 1.64c0 .91.74 1.65 1.66 1.65 1 0 1.66-.74 1.66-1.65a1.64 1.64 0 0 0-1.66-1.64z" />
        </svg>
      )
    },
    {
      url: schoolDetails?.twitterUrl || schoolDetails?.socialLinks?.twitter || schoolDetails?.footer_config?.social?.twitter,
      label: "Twitter / X",
      svg: (
        <svg width="21" height="21" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      )
    },
    {
      url: schoolDetails?.whatsappSocialUrl || (schoolDetails?.whatsappNumber ? `https://wa.me/${schoolDetails.whatsappNumber.replace(/[^0-9]/g, "")}` : null) || (schoolDetails?.footer_config?.social?.whatsapp ? (schoolDetails.footer_config.social.whatsapp.startsWith("http") ? schoolDetails.footer_config.social.whatsapp : `https://wa.me/${schoolDetails.footer_config.social.whatsapp.replace(/[^0-9]/g, "")}`) : null),
      label: "WhatsApp",
      svg: (
        <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.003 5.324 5.328 0 11.859 0c3.166.001 6.141 1.233 8.377 3.469 2.235 2.237 3.465 5.212 3.464 8.384-.003 6.536-5.328 11.86-11.859 11.86-2.003-.001-3.973-.508-5.729-1.472L0 24zm6.59-4.846c1.62.962 3.204 1.488 4.88 1.489 5.342 0 9.69-4.348 9.693-9.692.002-2.59-1.004-5.024-2.836-6.857C16.49 2.261 14.061 1.256 11.86 1.256 6.515 1.256 2.167 5.603 2.164 10.95c-.001 1.763.473 3.328 1.378 4.896l-.97 3.544 3.635-.954zm10.93-4.57c-.27-.136-1.602-.79-1.852-.881-.25-.091-.43-.136-.61.136-.18.27-.698.881-.857 1.066-.16.186-.318.21-.588.073-.27-.136-1.14-.42-2.17-1.34-.8-.713-1.34-1.594-1.5-1.866-.16-.27-.017-.417.118-.552.122-.121.27-.315.405-.471.135-.157.18-.27.27-.45.09-.18.045-.339-.022-.475-.068-.136-.61-1.472-.836-2.015-.22-.53-.44-.457-.61-.466-.157-.008-.338-.01-.519-.01-.18 0-.473.068-.72.339-.248.271-.946.925-.946 2.256 0 1.33.968 2.613 1.104 2.793.135.18 1.903 2.906 4.609 4.075.644.278 1.148.445 1.54.57.647.206 1.236.177 1.701.108.518-.077 1.602-.656 1.828-1.288.225-.632.225-1.175.157-1.288-.068-.113-.248-.18-.518-.316z" />
        </svg>
      )
    }
  ].filter((s) => !!s.url);

  return (
    <footer className="bg-gradient-to-b from-[#11182B] via-[#0E1526] to-[#0B1020] text-[#AAB4C5] relative overflow-hidden border-t border-white/[0.08]">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[300px] bg-[var(--primary)]/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[400px] bg-[var(--secondary)]/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-[1500px] mx-auto px-6 lg:px-12 pt-16 pb-12 relative z-10">
        
        {/* ── Pre-Footer High-Conversion Banner ── */}
        <div className="relative rounded-3xl p-8 sm:p-10 lg:p-12 mb-16 overflow-hidden border border-white/[0.12] bg-gradient-to-r from-slate-900/90 via-slate-800/80 to-slate-900/90 backdrop-blur-2xl shadow-2xl">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[var(--primary)]/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
            <div className="space-y-3 text-center lg:text-left max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.08] border border-white/15 text-xs font-bold text-slate-200 tracking-wide">
                <Sparkles size={14} className="text-amber-400 animate-pulse" />
                <span>Session 2026-27 Enrollment Live</span>
              </div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                Empower Your Child with World-Class Academic Excellence
              </h3>
              <p className="text-sm text-slate-300 font-medium leading-relaxed">
                Join {resolvedSchoolName || "our institution"} for holistic development, modern digital labs, sports mentorship, and CBSE board distinction.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 shrink-0">
              <Link
                href="/admission"
                className="h-12 px-7 rounded-2xl bg-[var(--primary)] hover:opacity-90 text-white font-bold text-sm tracking-wide flex items-center gap-2 shadow-lg shadow-[var(--primary)]/30 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <span>Apply for Admission</span>
                <ChevronRight size={16} />
              </Link>
              <Link
                href="/contact"
                className="h-12 px-7 rounded-2xl bg-white/10 hover:bg-white/15 text-white border border-white/20 font-bold text-sm flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all backdrop-blur-md"
              >
                <span>Schedule Campus Visit</span>
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </div>

        {/* ── Key Highlights Trust Badges ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-16 pb-12 border-b border-white/[0.08]">
          {[
            {
              icon: Award,
              title: "CBSE Affiliated",
              subtitle: `Affiliation #${schoolDetails?.affiliationNo || "2133045"}`
            },
            {
              icon: GraduationCap,
              title: "100% Board Results",
              subtitle: "Consecutive Academic Distinction"
            },
            {
              icon: Bus,
              title: "GPS Safe Transport",
              subtitle: "CCTV & Attendant Monitored Fleet"
            },
            {
              icon: ShieldCheck,
              title: "Secure Smart Campus",
              subtitle: "24/7 Surveillance & Infirmary"
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/15 transition-all duration-300"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[var(--primary)]/20 to-[var(--secondary)]/20 border border-white/10 flex items-center justify-center text-white shrink-0 shadow-inner">
                <item.icon size={20} className="text-[var(--secondary,#3B82F6)]" />
              </div>
              <div className="min-w-0">
                <h5 className="text-xs sm:text-sm font-bold text-white tracking-wide truncate">{item.title}</h5>
                <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Main Footer Columns Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pb-14 border-b border-white/[0.08]">
          
          {/* Col 1: Brand & Institutional Identity (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-4">
              <div 
                className="h-14 w-14 sm:h-16 sm:w-16 rounded-full shadow-lg shrink-0 flex items-center justify-center relative overflow-hidden border border-white/20 ring-1 ring-[var(--primary,#1E3A8A)]"
                style={{
                  boxShadow: '0 4px 14px -2px var(--primary, rgba(30, 58, 138, 0.3))'
                }}
              >
                {schoolDetails?.logoImage ? (
                  <img
                    src={schoolDetails.logoImage}
                    alt="School Crest"
                    className="h-full w-full object-cover rounded-full relative z-10"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : null}
                <div 
                  className="absolute inset-0 flex items-center justify-center text-white text-base font-black uppercase tracking-wider"
                  style={{
                    background: 'linear-gradient(135deg, var(--primary, #1E3A8A) 0%, var(--secondary, #3B82F6) 100%)'
                  }}
                >
                  {resolvedSchoolName ? resolvedSchoolName.slice(0, 3).toUpperCase() : ''}
                </div>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight leading-tight">
                  {resolvedSchoolName}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <p className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest">
                    CBSE Affiliated Senior Secondary
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
              {schoolDetails?.aboutDescription?.slice(0, 180) ||
                "Committed to nurturing intellectual curiosity, ethical leadership, and creative mastery in every student through holistic pedagogical practices."}
              ...
            </p>

            {/* Social Icons Strip */}
            {socialLinks.length > 0 && (
              <div className="space-y-2.5 pt-2">
                <span className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 block">
                  Connect With Us
                </span>
                <div className="flex flex-wrap gap-3">
                  {socialLinks.map((s, i) => (
                    <a
                      key={i}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/[0.12] flex items-center justify-center text-slate-200 hover:text-white hover:bg-[var(--primary)] hover:border-transparent transition-all duration-300 hover:-translate-y-1 shadow-md cursor-pointer"
                    >
                      {s.svg}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Col 2: Quick Links (2.5 Cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <h4 className="text-white text-xs font-black uppercase tracking-[3px]">Navigation</h4>
              <div className="w-8 h-0.5 mt-2 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-full" />
            </div>
            <ul className="space-y-2.5">
              {quickLinks.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.path}
                    className="text-xs sm:text-sm text-slate-400 hover:text-white flex items-center gap-1.5 group transition-colors duration-200"
                  >
                    <ChevronRight size={13} className="text-[var(--primary)] -translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Academics & Mandatory Disclosures (2.5 Cols) */}
          <div className="lg:col-span-3 space-y-4">
            <div>
              <h4 className="text-white text-xs font-black uppercase tracking-[3px]">Academics & Policy</h4>
              <div className="w-8 h-0.5 mt-2 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-full" />
            </div>

            <ul className="space-y-3">
              {academicLinks.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.path}
                    className="flex items-center justify-between text-xs sm:text-sm text-slate-400 hover:text-white group transition-colors duration-200"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-white transition-all">
                        <item.icon size={13} />
                      </span>
                      <span className="truncate">{item.name}</span>
                    </div>
                    <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0 ml-1 text-[var(--primary)]" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Campus Coordinates & Office Hours (3 Cols) */}
          <div className="lg:col-span-3 space-y-4">
            <div>
              <h4 className="text-white text-xs font-black uppercase tracking-[3px]">Campus Helpdesk</h4>
              <div className="w-8 h-0.5 mt-2 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-full" />
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0 mt-0.5 text-blue-400">
                  <MapPin size={15} />
                </div>
                <span className="text-slate-300 leading-relaxed">
                  {getSchoolAddress(schoolDetails)}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0 text-emerald-400">
                  <Phone size={15} />
                </div>
                <a
                  href={`tel:${getContactPhone(schoolDetails)}`}
                  className="text-slate-300 hover:text-white font-bold transition font-mono tracking-wide"
                >
                  {getContactPhone(schoolDetails)}
                </a>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0 text-amber-400">
                  <Mail size={15} />
                </div>
                <a
                  href={`mailto:${getContactEmail(schoolDetails)}`}
                  className="text-slate-300 hover:text-white font-medium transition truncate"
                >
                  {getContactEmail(schoolDetails)}
                </a>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0 text-purple-400">
                  <Clock size={15} />
                </div>
                <div>
                  <p className="text-slate-200 font-bold text-xs">Mon – Sat: 8:00 AM – 3:30 PM</p>
                  <p className="text-[11px] text-slate-400">Visitor & Inquiry Timings</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom Bar & Copyright ── */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p className="text-center sm:text-left font-medium">
            © {new Date().getFullYear()}{" "}
            <span className="text-slate-300 font-bold">
              {resolvedSchoolName}
            </span>
            . All Rights Reserved. CBSE Affiliation No: {schoolDetails?.affiliationNo || "2133045"}.
          </p>

          <div className="flex items-center gap-5">
            <Link href="/cbse-mandatory" className="hover:text-slate-300 transition">
              CBSE Mandate
            </Link>
            <Link href="/about" className="hover:text-slate-300 transition">
              About
            </Link>
            <Link href="/contact" className="hover:text-slate-300 transition">
              Contact
            </Link>
            <button
              type="button"
              onClick={scrollToTop}
              className="h-8 w-8 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-slate-300 hover:text-white flex items-center justify-center transition ml-2 cursor-pointer"
              title="Back to Top"
            >
              <ArrowUp size={14} />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
