"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Quote } from 'lucide-react';
import { getResolvedUrl } from '@/services/api';

const AUTO_PLAY_INTERVAL = 5000;

const DirectorMessageSection = ({ schoolInfo }) => {
   if (!schoolInfo) {
      return (
         <section className="py-14 md:py-20 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f0c29, #1a1a3e, #0f172a)' }}>
            <div className="container mx-auto px-6">
               <div className="text-center mb-12 space-y-3 animate-pulse">
                  <div className="h-4 w-36 bg-white/10 rounded-full mx-auto" />
                  <div className="h-8 w-72 bg-white/10 rounded-lg mx-auto" />
               </div>
               <div className="max-w-5xl mx-auto rounded-[32px] bg-white/5 border border-white/10 p-8 md:p-12 grid md:grid-cols-5 gap-0 items-center animate-pulse">
                  <div className="md:col-span-2 aspect-[4/5] rounded-2xl bg-white/10 min-h-[300px]" />
                  <div className="md:col-span-3 p-10 space-y-5">
                     <div className="h-5 w-28 bg-white/10 rounded-full" />
                     <div className="h-4 w-full bg-white/10 rounded" />
                     <div className="h-4 w-4/5 bg-white/10 rounded" />
                     <div className="h-6 w-40 bg-white/10 rounded-lg mt-4" />
                  </div>
               </div>
            </div>
         </section>
      );
   }

   const rawLeaders = Array.isArray(schoolInfo?.director_message) ? schoolInfo.director_message : [];
   const leaders = rawLeaders.filter(l => l.name?.trim() && l.message?.trim());

   const [active, setActive] = useState(0);
   const [visible, setVisible] = useState(true);
   const [animDir, setAnimDir] = useState('next');
   const [paused, setPaused] = useState(false);
   const [progress, setProgress] = useState(0);
   const timerRef = useRef(null);
   const progressRef = useRef(null);
   const startTimeRef = useRef(Date.now());

   if (!leaders || leaders.length === 0) return null;

   const goTo = useCallback((idx, dir) => {
      setVisible(false);
      setAnimDir(dir);
      setTimeout(() => {
         setActive(idx);
         setProgress(0);
         startTimeRef.current = Date.now();
         setVisible(true);
      }, 320);
   }, []);

   const next = useCallback(() => {
      goTo((active + 1) % leaders.length, 'next');
   }, [active, leaders.length, goTo]);

   const prev = useCallback(() => {
      goTo((active - 1 + leaders.length) % leaders.length, 'prev');
   }, [active, leaders.length, goTo]);

   useEffect(() => {
      if (leaders.length <= 1 || paused) return;
      timerRef.current = setTimeout(() => next(), AUTO_PLAY_INTERVAL);
      return () => clearTimeout(timerRef.current);
   }, [active, paused, leaders.length, next]);

   useEffect(() => {
      if (leaders.length <= 1 || paused) return;
      startTimeRef.current = Date.now();
      setProgress(0);
      const tick = () => {
         const elapsed = Date.now() - startTimeRef.current;
         setProgress(Math.min((elapsed / AUTO_PLAY_INTERVAL) * 100, 100));
         progressRef.current = requestAnimationFrame(tick);
      };
      progressRef.current = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(progressRef.current);
   }, [active, paused, leaders.length]);

   useEffect(() => {
      const onKey = (e) => {
         if (e.key === 'ArrowRight') next();
         if (e.key === 'ArrowLeft') prev();
      };
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
   }, [next, prev]);

   const currentLeader = leaders[active] || leaders[0];
   const photoUrl = getResolvedUrl(currentLeader.photo || currentLeader.image_url || '');
   const schoolName = (schoolInfo?.schoolName || schoolInfo?.name || 'our institution').trim();

   const contentClass = `transition-all duration-300 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`;

   return (
      <section
         className="py-14 md:py-20 relative overflow-hidden"
         style={{ background: 'linear-gradient(135deg, #0f0c29, #1a1a3e, #0f172a)' }}
         onMouseEnter={() => setPaused(true)}
         onMouseLeave={() => setPaused(false)}
      >
         <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-600/15 blur-[120px] pointer-events-none" />
         <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-purple-600/15 blur-[120px] pointer-events-none" />

         <div className="container mx-auto px-6 relative z-10">
            <div className="text-center mb-12 space-y-3">
               <span className="inline-block px-4 py-1.5 rounded-full border border-white/15 text-blue-300 text-[11px] font-black uppercase tracking-[3px]" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                  Leadership Desk
               </span>
               <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                  Words from Our <span style={{ color: 'var(--secondary, #818cf8)' }}>Visionary Leaders</span>
               </h2>
               <p className="text-slate-400 text-sm max-w-lg mx-auto">
                  Guiding {schoolName} with wisdom, integrity, and a passion for transforming young minds.
               </p>
            </div>

            <div
               className="max-w-5xl mx-auto rounded-[32px] overflow-hidden border border-white/10 shadow-2xl"
               style={{ backgroundColor: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(16px)' }}
            >
               <div className={`grid md:grid-cols-5 items-stretch ${contentClass}`}>
                  {/* Photo */}
                  <div className="md:col-span-2 relative min-h-[300px] md:min-h-[400px]">
                     {photoUrl ? (
                        <img
                           src={photoUrl}
                           alt={currentLeader.name}
                           className="w-full h-full object-cover object-top absolute inset-0"
                           onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                     ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-slate-800 to-slate-900">
                           <div className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-black text-white" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                              {currentLeader.name?.charAt(0) || 'L'}
                           </div>
                        </div>
                     )}
                     <div className="absolute inset-y-0 right-0 w-20 pointer-events-none" style={{ background: 'linear-gradient(to right, transparent, rgba(15,12,41,0.9))' }} />
                     <div className="absolute top-5 left-5 z-10">
                        <span className="inline-block px-3 py-1 rounded-full text-white text-[10px] font-black uppercase tracking-widest border border-white/20" style={{ backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
                           {currentLeader.designation}
                        </span>
                     </div>
                  </div>

                  {/* Message */}
                  <div className="md:col-span-3 p-7 md:p-10 flex flex-col justify-center gap-5 text-white relative">
                     <Quote className="h-10 w-10 -mb-2" style={{ color: 'rgba(129,140,248,0.4)' }} />

                     {currentLeader.quote && (
                        <p className="text-sm font-semibold italic leading-relaxed border-l-2 pl-4" style={{ color: '#c7d2fe', borderColor: 'rgba(129,140,248,0.6)' }}>
                           {currentLeader.quote}
                        </p>
                     )}

                     <p className="text-slate-200 text-base md:text-[17px] leading-relaxed font-medium">
                        "{currentLeader.message}"
                     </p>

                     <div>
                        <h4 className="font-extrabold text-xl text-white">{currentLeader.name}</h4>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">{currentLeader.designation}</p>
                     </div>

                     {leaders.length > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-white/10">
                           {leaders.map((_, i) => (
                              <button
                                 key={i}
                                 onClick={() => goTo(i, i > active ? 'next' : 'prev')}
                                 className="transition-all duration-300 rounded-full cursor-pointer"
                                 style={{
                                    height: '8px',
                                    width: i === active ? '28px' : '8px',
                                    backgroundColor: i === active ? 'var(--primary, #6366f1)' : 'rgba(255,255,255,0.2)'
                                 }}
                              />
                           ))}
                        </div>
                     )}
                  </div>
               </div>

               {/* Progress bar */}
               {leaders.length > 1 && (
                  <div className="h-[3px] w-full" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                     <div
                        className="h-full rounded-full"
                        style={{
                           width: `${progress}%`,
                           background: 'linear-gradient(90deg, var(--primary, #6366f1), var(--secondary, #818cf8))',
                           opacity: paused ? 0.3 : 1,
                           transition: 'opacity 0.3s'
                        }}
                     />
                  </div>
               )}
            </div>

            {leaders.length > 1 && (
               <p className="text-center text-xs text-slate-500 mt-5 font-semibold tracking-wide">
                  {active + 1} / {leaders.length} &nbsp;·&nbsp; {paused ? '⏸ Paused' : '▶ Auto-playing'}
               </p>
            )}
         </div>
      </section>
   );
};

export default DirectorMessageSection;
