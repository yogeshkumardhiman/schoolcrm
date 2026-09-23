"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, ChevronRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const primaryLinks = [
  { name: 'Home', path: '/', id: 'home' },
  { name: 'About', path: '/about', id: 'about' },
  { name: 'Our Team', path: '/team', id: 'team' },
  { name: 'Admissions', path: '/admission', id: 'admission' },
  { name: 'Gallery', path: '/gallery', id: 'gallery' },
  { name: 'Contact', path: '/contact', id: 'contact' },
];

const moreLinks = [
  { name: 'Latest News', path: '/news' },
  { name: 'Career', path: '/career' },
  { name: 'Academic Calendar', path: '/academic-calendar' },
  { name: 'CBSE Disclosure', path: '/cbse-mandatory' },
];

const allLinks = [...primaryLinks, ...moreLinks];

export default function Navbar({ schoolDetails }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 90);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleOutside = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const primaryColor = schoolDetails?.primaryColor || schoolDetails?.theme_config?.primary || 'var(--primary)';
  const navbarColor = schoolDetails?.theme_config?.navbar || 'rgba(17, 24, 43, 0.92)';
  const resolvedSchoolName = (schoolDetails?.schoolName || schoolDetails?.name || '').trim();

  return (
    <>
      <header className="sticky top-0 w-full z-50 transition-all duration-300">
        <nav
          className="mx-auto flex max-w-[1600px] items-center justify-between border-b border-white/10 px-6 sm:px-8 backdrop-blur-2xl transition-all duration-300 shadow-[0_20px_60px_rgba(0,0,0,.45)] w-full"
          style={{ 
            height: isScrolled ? '72px' : '90px',
            backgroundColor: navbarColor
          }}
        >
          {/* Logo Brand */}
          <Link href="/" className="flex items-center gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div 
                className="flex h-11 w-11 sm:h-13 sm:w-13 items-center justify-center rounded-full overflow-hidden border border-white/20 ring-1 ring-[var(--primary,#1E3A8A)] shadow-md shrink-0 relative"
              >
                {schoolDetails?.logoImage ? (
                  <img
                    src={schoolDetails.logoImage}
                    alt="School Logo"
                    className="h-full w-full object-cover rounded-full relative z-10"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : null}
                <div 
                  className="absolute inset-0 flex items-center justify-center text-white text-xs font-black uppercase tracking-wider"
                  style={{
                    background: 'linear-gradient(135deg, var(--primary, #1E3A8A) 0%, var(--secondary, #3B82F6) 100%)'
                  }}
                >
                  {resolvedSchoolName ? resolvedSchoolName.slice(0, 3).toUpperCase() : ''}
                </div>
              </div>

              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-white leading-tight uppercase tracking-tight">
                  {resolvedSchoolName}
                </h2>
                <p className="text-[9px] sm:text-[10px] font-semibold tracking-wide text-slate-400 line-clamp-1">
                  {schoolDetails?.navbar_config?.tagline || "CBSE Affiliated Senior Secondary School (Affiliation No: 2133045)"}
                </p>
              </div>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center rounded-full bg-white/5 p-1 border border-white/5">
            {primaryLinks.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className="relative px-4 xl:px-5 py-2.5 text-xs uppercase tracking-wider font-bold"
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-pill"
                      transition={{
                        type: "spring",
                        stiffness: 350,
                        damping: 30,
                      }}
                      className="absolute inset-0 rounded-full"
                      style={{ backgroundColor: primaryColor }}
                    />
                  )}

                  <span
                    className={`relative z-10 transition-colors duration-200 ${
                      isActive ? "text-white" : "text-white/70 hover:text-white"
                    }`}
                  >
                    {item.name}
                  </span>
                </Link>
              );
            })}

            {/* More Dropdown */}
            <div ref={moreRef} className="relative">
              <button
                type="button"
                onClick={() => setMoreOpen(prev => !prev)}
                className="flex items-center gap-1 px-4 xl:px-5 py-2.5 text-xs uppercase tracking-wider font-bold text-white/70 hover:text-white transition-colors duration-200 cursor-pointer"
              >
                More
                <ChevronDown
                  size={12}
                  className={`transition-transform duration-200 ${moreOpen ? 'rotate-180' : ''}`}
                />
              </button>

              <AnimatePresence>
                {moreOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-[calc(100%+8px)] min-w-[210px] rounded-2xl border border-white/10 bg-slate-900/95 backdrop-blur-2xl shadow-2xl p-2 z-50"
                  >
                    {moreLinks.map((item) => {
                      const isActive = pathname === item.path;
                      return (
                        <Link
                          key={item.path}
                          href={item.path}
                          onClick={() => setMoreOpen(false)}
                          className="block"
                        >
                          <div
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors duration-150 ${
                              isActive
                                ? 'text-white'
                                : 'text-white/60 hover:text-white hover:bg-white/5'
                            }`}
                            style={isActive ? { backgroundColor: primaryColor } : {}}
                          >
                            <ChevronRight size={10} />
                            {item.name}
                          </div>
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {schoolDetails?.navbar_config?.showVirtualTour && schoolDetails?.navbar_config?.virtualTourUrl && (
              <a
                href={schoolDetails.navbar_config.virtualTourUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 font-bold text-[10px] uppercase tracking-wider text-white bg-white/5 hover:bg-white/10 transition cursor-pointer"
                >
                  Virtual Tour
                </motion.button>
              </a>
            )}
            <Link href="/admission">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 rounded-full px-6 py-2.5 font-black text-[10px] uppercase tracking-wider text-white shadow-lg cursor-pointer"
                style={{ backgroundColor: primaryColor }}
              >
                Apply Now
                <ChevronRight size={14} />
              </motion.button>
            </Link>
          </div>

          {/* Mobile Toggle Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20 lg:hidden cursor-pointer"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>
      </header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed left-4 right-4 top-24 z-40 rounded-3xl border border-white/10 bg-slate-950/95 p-6 backdrop-blur-3xl shadow-2xl lg:hidden overflow-y-auto max-h-[80vh]"
          >
            <div className="flex flex-col gap-1">
              {allLinks.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setMobileOpen(false)}
                    className="w-full"
                  >
                    <motion.div
                      whileHover={{ x: 6 }}
                      whileTap={{ scale: 0.98 }}
                      className={`rounded-xl px-5 py-3 text-sm font-semibold transition-colors ${
                        isActive
                          ? "bg-white text-slate-900"
                          : "text-white/80 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {item.name}
                    </motion.div>
                  </Link>
                );
              })}

              <Link href="/admission" onClick={() => setMobileOpen(false)} className="mt-2 block">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-4 font-semibold text-white shadow-lg cursor-pointer"
                  style={{ backgroundColor: primaryColor }}
                >
                  Apply Now
                  <ChevronRight size={18} />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}