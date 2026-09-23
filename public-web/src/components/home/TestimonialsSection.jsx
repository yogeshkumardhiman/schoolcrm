"use client";

import React, { useState, useEffect } from 'react';
import { Quote } from 'lucide-react';
import { fetchTestimonials } from '@/services/api';

const TestimonialsSection = () => {
   const [reviews, setReviews] = useState([]);
   const [active, setActive] = useState(0);

   useEffect(() => {
      fetchTestimonials().then(d => {
         if (Array.isArray(d)) setReviews(d);
      }).catch(err => console.error(err));
   }, []);

   if (!reviews || reviews.length === 0) return null;

   return (
      <section className="py-12 md:py-16 bg-white overflow-hidden">
         <div className="container mx-auto px-6">
            <div className="bg-slate-50 rounded-[32px] p-8 md:p-12 border border-slate-100 relative">
               <div className="max-w-3xl mx-auto text-center space-y-6">
                  <span className="label-tag block text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--primary)' }}>Perspective</span>
                  <Quote className="mx-auto text-slate-200 h-10 w-10 leading-none" />
                  <p className="text-slate-700 text-sm md:text-base leading-relaxed font-medium italic">
                     "{reviews[active].feedback || reviews[active].message}"
                  </p>
                  <div>
                     <h4 className="font-extrabold text-slate-800 text-sm">{reviews[active].parentName || reviews[active].name}</h4>
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{reviews[active].relation || "School Parent"}</p>
                  </div>
               </div>
               
               {reviews.length > 1 && (
                  <div className="flex gap-2 justify-center mt-6">
                     {reviews.map((_, i) => (
                        <button
                           key={i}
                           onClick={() => setActive(i)}
                           className="h-2 w-2 rounded-full transition-all cursor-pointer"
                           style={{ backgroundColor: active === i ? 'var(--primary)' : 'rgba(0,0,0,0.15)' }}
                        />
                     ))}
                  </div>
               )}
            </div>
         </div>
      </section>
   );
};

export default TestimonialsSection;
