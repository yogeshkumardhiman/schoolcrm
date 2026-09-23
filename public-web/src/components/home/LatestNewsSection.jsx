"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const LatestNewsSection = ({ notices }) => {
   const newsList = Array.isArray(notices) ? notices.slice(0, 3) : [];
   if (!newsList || newsList.length === 0) return null;

   return (
      <section className="py-14 md:py-20 bg-white border-t border-slate-100">
         <div className="container mx-auto px-6">
            <div className="flex justify-between items-end mb-10">
               <div className="space-y-1">
                  <span className="label-tag block text-xs font-black uppercase tracking-widest" style={{ color: 'var(--primary)' }}>Updates</span>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Campus <span className="accent-italic" style={{ color: 'var(--secondary)' }}>Highlights</span></h2>
               </div>
               <Button asChild variant="outline" className="rounded-xl border-slate-300 text-slate-700 hover:bg-slate-950 hover:text-white transition font-bold">
                  <Link href="/news">All Updates</Link>
               </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
               {newsList.map((item, i) => (
                  <div key={i} className="bg-slate-50/80 p-7 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full">
                     <div className="space-y-4">
                        <span className="px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full font-black text-xs uppercase tracking-wider inline-block leading-none" style={{ color: 'var(--primary)', borderColor: 'rgba(79, 70, 229, 0.2)' }}>
                           {item.type || "Notice"}
                        </span>
                        <h3 className="font-extrabold text-slate-900 text-lg md:text-xl leading-snug line-clamp-2 capitalize">{item.title}</h3>
                        <p className="text-sm md:text-base text-slate-600 leading-relaxed font-medium line-clamp-4">{item.desc || item.content}</p>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </section>
   );
};

export default LatestNewsSection;
