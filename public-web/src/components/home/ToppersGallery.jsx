"use client";

import React, { useState, useEffect } from 'react';
import { fetchToppers, getResolvedUrl } from '@/services/api';

const ToppersGallery = () => {
   const [toppers, setToppers] = useState([]);

   useEffect(() => {
      fetchToppers().then(d => {
         if (Array.isArray(d)) setToppers(d);
      }).catch(err => console.error(err));
   }, []);

   const top4List = (Array.isArray(toppers) ? toppers : [])
      .filter((t) => !t.rank || Number(t.rank) <= 4)
      .sort((a, b) => Number(a.rank || 99) - Number(b.rank || 99))
      .slice(0, 4);

   if (!top4List || top4List.length === 0) return null;

   return (
      <section className="py-14 md:py-20 bg-slate-50 border-t border-slate-200">
         <div className="container mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
               <span className="label-tag block text-xs sm:text-sm font-black uppercase tracking-widest" style={{ color: 'var(--primary)' }}>Achievements</span>
               <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">Board <span className="accent-italic" style={{ color: 'var(--secondary)' }}>Toppers Podium</span></h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
               {top4List.map((top, i) => (
                  <div key={i} className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all flex flex-col items-center text-center">
                     <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-indigo-100 shadow-inner mb-4 bg-slate-50 flex items-center justify-center">
                        <img
                           src={top.image ? getResolvedUrl(top.image) : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(top.name || "Student")}`}
                           className="w-full h-full object-cover"
                           alt={top.name}
                           onError={(e) => {
                              e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(top.name || "Student")}`;
                           }}
                        />
                     </div>
                     <span className="px-3.5 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-full font-black text-xs uppercase tracking-wider mb-2">
                        {top.percentage || top.score || "95.0%"} - Class {top.class || '10TH'}
                     </span>
                     <h4 className="font-extrabold text-slate-900 text-base sm:text-lg leading-tight mb-1">{top.name}</h4>
                     <p className="text-xs text-slate-500 font-bold uppercase tracking-wider leading-none">Rank #{top.rank || i + 1} • {top.session || "2025-26"}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>
   );
};

export default ToppersGallery;
