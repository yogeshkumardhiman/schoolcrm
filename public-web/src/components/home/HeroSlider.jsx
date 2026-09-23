"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { fetchBanners, getResolvedUrl } from '@/services/api';
import { Button } from '@/components/ui/button';

const HeroSlider = ({ schoolInfo }) => {
   const resolvedName = (schoolInfo?.schoolName || schoolInfo?.name || '').trim();
   const defaultTag = resolvedName ? `WELCOME TO ${resolvedName.toUpperCase()}` : "WELCOME TO OUR ACADEMY";

   const [slides, setSlides] = useState([]);
   const [loading, setLoading] = useState(true);
   const [current, setCurrent] = useState(0);

   useEffect(() => {
      const loadBanners = async () => {
         try {
            const allSlides = [];

            // 1. Primary Slide: Main Hero Narrative & Intro (from schoolInfo)
            if (schoolInfo?.bannerTitle || schoolInfo?.bannerImage || schoolInfo?.aboutTitle) {
               allSlides.push({
                  image: getResolvedUrl(schoolInfo.bannerImage || schoolInfo.logoImage || ""),
                  tag: defaultTag,
                  title: schoolInfo.bannerTitle || schoolInfo.aboutTitle || "Nurturing Young Minds, Building Bright Futures",
                  body: schoolInfo.bannerSubtitle || schoolInfo.aboutDescription || "Empowering students with knowledge, character, and values to excel in a rapidly changing world.",
                  ctaLabel: schoolInfo.bannerCtaLabel || "Apply Online Now",
                  ctaLink: schoolInfo.bannerCtaLink || "/admission"
               });
            }

            // 2. Rotating Promotional Sliders (from web-banners table)
            const dbBanners = await fetchBanners();
            if (dbBanners && dbBanners.length > 0) {
               dbBanners.forEach(b => {
                  allSlides.push({
                     image: getResolvedUrl(b.image_url),
                     tag: b.title || defaultTag,
                     title: b.description || "Shaping Future Global Leaders",
                     body: b.body || "",
                     ctaLabel: b.cta_text || schoolInfo?.bannerCtaLabel || "Apply Online Now",
                     ctaLink: b.cta_link || schoolInfo?.bannerCtaLink || "/admission"
                  });
               });
            }

            // Fallback if no banner yet
            if (allSlides.length === 0 && schoolInfo) {
               allSlides.push({
                  image: getResolvedUrl(schoolInfo.bannerImage || ""),
                  tag: defaultTag,
                  title: `${resolvedName || "Our School"} — A Legacy of Excellence`,
                  body: schoolInfo.aboutDescription || "Committed to delivering transformative academic excellence and holistic character building.",
                  ctaLabel: "Apply Online Now",
                  ctaLink: "/admission"
               });
            }

            setSlides(allSlides);
         } catch (error) {
            console.error("Error loading banners:", error);
         } finally {
            setLoading(false);
         }
      };
      loadBanners();
   }, [schoolInfo, defaultTag, resolvedName]);

   useEffect(() => {
      if (slides.length <= 1) return;
      const interval = setInterval(() => {
         setCurrent((prev) => (prev + 1) % slides.length);
      }, 6000);
      return () => clearInterval(interval);
   }, [slides.length]);

   if (loading) {
      return (
         <div className="relative min-h-[550px] lg:min-h-[650px] bg-slate-950 flex items-center px-6 lg:px-16 animate-pulse overflow-hidden">
            <div className="max-w-4xl space-y-6 w-full py-20">
               <div className="h-7 w-56 bg-blue-500/20 rounded-full border border-blue-500/30" />
               <div className="space-y-3">
                  <div className="h-12 sm:h-16 w-4/5 bg-slate-800/80 rounded-2xl" />
                  <div className="h-12 sm:h-16 w-3/5 bg-slate-800/60 rounded-2xl" />
               </div>
               <div className="h-5 w-2/3 bg-slate-800/50 rounded-lg" />
               <div className="flex flex-wrap gap-4 pt-4">
                  <div className="h-12 w-44 bg-blue-600/80 rounded-full" />
                  <div className="h-12 w-44 bg-white/10 rounded-full border border-white/20" />
               </div>
            </div>
         </div>
      );
   }

   if (!slides || slides.length === 0) return null;

   return (
      <section className="relative h-[80vh] md:h-[88vh] w-full overflow-hidden bg-slate-950">
         <AnimatePresence mode="wait">
            <motion.div
               key={current}
               initial={{ opacity: 0, scale: 1.03 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0 }}
               transition={{ duration: 1.2, ease: "easeInOut" }}
               className="absolute inset-0 bg-cover bg-center"
               style={{ backgroundImage: `url("${slides[current].image}")` }}
            >
               <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-slate-950/80 z-10" />
            </motion.div>
         </AnimatePresence>

         <div className="container mx-auto px-6 md:px-16 h-full flex items-center relative z-20">
            <div className="grid md:grid-cols-12 gap-8 items-center w-full">
               <motion.div
                  key={`text-${current}`}
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7 }}
                  className="md:col-span-7 space-y-6 text-white"
               >
                  <span
                     className="label-tag inline-block px-4 py-1.5 rounded-full backdrop-blur-md text-xs font-black tracking-widest uppercase"
                     style={{ color: 'var(--accent)', backgroundColor: 'rgba(255,255,255,0.08)' }}
                  >
                     {slides[current].tag}
                  </span>
                  
                  <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.1] tracking-tight">
                     {slides[current].title.split(',')[0]}
                     {slides[current].title.includes(',') && (
                        <span className="block mt-2 accent-italic" style={{ color: 'var(--secondary)' }}>
                           {slides[current].title.split(',')[1]}
                        </span>
                     )}
                  </h1>

                  {slides[current].body && (
                     <p className="text-slate-200 text-base md:text-lg max-w-xl leading-relaxed pl-4 border-l-3" style={{ borderColor: 'var(--primary)' }}>
                        {slides[current].body}
                     </p>
                  )}

                  {/* Trust Badges */}
                  <div className="grid grid-cols-2 gap-3 max-w-lg pt-2 text-sm font-bold text-slate-200">
                     {[
                        "Interactive Smart Classes",
                        "Experienced Mentors",
                        "GPS-Monitored Transport",
                        "Elite Sports Coaching"
                     ].map((badge, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                           <CheckCircle size={16} className="text-emerald-400 shrink-0" />
                           <span>{badge}</span>
                        </div>
                     ))}
                  </div>

                  <div className="flex flex-wrap gap-4 pt-4">
                     <Button asChild className="px-8 py-6 rounded-xl font-bold uppercase tracking-wider text-sm shadow-lg transition active:scale-95 border-none text-white cursor-pointer" style={{ backgroundColor: 'var(--primary)' }}>
                        <Link href={slides[current].ctaLink || "/admission"}>
                           {slides[current].ctaLabel || "Apply Online Now"}
                        </Link>
                     </Button>
                     <Button asChild variant="outline" className="bg-white/5 border border-white/20 text-white px-8 py-6 rounded-xl font-bold uppercase tracking-wider text-sm hover:bg-white hover:text-black transition cursor-pointer">
                        <Link href="/contact">Explore Campus</Link>
                     </Button>
                  </div>
               </motion.div>
            </div>
         </div>

         {/* Navigation Dots */}
         {slides.length > 1 && (
            <div className="absolute bottom-10 right-6 md:right-16 z-30 flex gap-2">
               {slides.map((_, i) => (
                  <button
                     key={i}
                     onClick={() => setCurrent(i)}
                     className="h-2.5 rounded-full transition-all duration-300 cursor-pointer"
                     style={{
                        width: i === current ? '40px' : '10px',
                        backgroundColor: i === current ? 'var(--primary)' : 'rgba(255, 255, 255, 0.25)'
                     }}
                  />
               ))}
            </div>
         )}
      </section>
   );
};

export default HeroSlider;
