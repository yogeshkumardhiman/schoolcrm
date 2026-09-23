"use client";

import React from 'react';
import { getResolvedUrl } from '@/services/api';

const FacilitiesSection = ({ schoolInfo }) => {
   const defaultFacilities = [
      { title: "Computer Lab", desc: "High-speed modern PCs running latest education suites.", image: "https://images.unsplash.com/photo-1562774053-701939374585?w=600" },
      { title: "Science Labs", desc: "Dedicated workspaces for practical chemistry and physics experimentation.", image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600" },
      { title: "Sports Arenas", desc: "Spacious fields for football, basketball, and fitness activities.", image: "https://images.unsplash.com/photo-1526676037777-05a232554f77?w=600" },
      { title: "Robotics Lab", desc: "Practical workspace for coding, drone assembly, and robotic logic.", image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600" }
   ];
   const facilities = schoolInfo?.facilities_config || defaultFacilities;

   if (!facilities || facilities.length === 0) return null;

   return (
      <section className="py-14 md:py-20 bg-slate-50 border-t border-slate-200">
         <div className="container mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
               <span className="label-tag block text-xs sm:text-sm font-black uppercase tracking-widest" style={{ color: 'var(--primary)' }}>Infrastructure</span>
               <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">Premium <span className="accent-italic" style={{ color: 'var(--secondary)' }}>Campus Facilities</span></h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
               {facilities.slice(0, 4).map((fac, i) => (
                  <div key={i} className="group rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                     <div className="aspect-video w-full overflow-hidden">
                        <img src={getResolvedUrl(fac.image)} className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300" alt={fac.title} />
                     </div>
                     <div className="p-6 flex-1 flex flex-col justify-between">
                        <div className="space-y-2">
                           <h4 className="font-bold text-slate-900 text-base sm:text-lg leading-tight">{fac.title}</h4>
                           <p className="text-sm text-slate-600 leading-relaxed font-normal">{fac.desc}</p>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </section>
   );
};

export default FacilitiesSection;
