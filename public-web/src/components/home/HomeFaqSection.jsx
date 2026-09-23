"use client";

import React, { useState } from 'react';

const HomeFaqSection = ({ schoolInfo }) => {
   const [activeIndex, setActiveIndex] = useState(null);
   const resolvedName = (schoolInfo?.schoolName || schoolInfo?.name || '').trim();
   const cleanText = (txt) => (txt || '').replace(/S\.D\.M\.|SDM/gi, resolvedName || 'our school').replace(/\s+/g, ' ').trim();
   
   const defaultFaqs = [
      { q: "What curriculum does the school follow?", a: "We follow the CBSE (Central Board of Secondary Education) curriculum from Nursery up to Senior Secondary Class 12." },
      { q: "Is school transport safe?", a: "Yes, our school operates a GPS-tracked and supervisor-attended bus fleet covering all major routes safely." }
   ];
   const faqs = schoolInfo?.faqs_config || defaultFaqs;

   if (!faqs || faqs.length === 0) return null;

   return (
      <section className="py-12 md:py-16 bg-slate-50 border-t border-slate-100">
         <div className="container mx-auto px-6 max-w-4xl">
            <div className="text-center mb-10 space-y-2">
               <span className="label-tag block text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--primary)' }}>Support</span>
               <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Frequently Asked <span className="accent-italic" style={{ color: 'var(--secondary)' }}>Questions</span></h2>
            </div>

            <div className="space-y-4">
               {faqs.map((faq, idx) => {
                  const isOpen = activeIndex === idx;
                  return (
                     <div key={idx} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-300 hover:border-slate-200 hover:shadow-md">
                        <button
                           onClick={() => setActiveIndex(isOpen ? null : idx)}
                           className="w-full flex items-center justify-between px-6 py-5 text-left font-bold text-slate-800 text-base md:text-lg select-none cursor-pointer"
                        >
                           <span>{cleanText(faq.q)}</span>
                           <span className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 transition-all duration-300" style={isOpen ? { backgroundColor: 'var(--primary)', color: '#fff', transform: 'rotate(180deg)', borderColor: 'var(--primary)' } : undefined}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                           </span>
                        </button>
                        {isOpen && (
                           <div className="px-6 pb-5 text-slate-500 font-medium text-sm md:text-base leading-relaxed border-t border-slate-50 mt-1 pt-4">
                              {cleanText(faq.a)}
                           </div>
                        )}
                     </div>
                  );
               })}
            </div>
         </div>
      </section>
   );
};

export default HomeFaqSection;
