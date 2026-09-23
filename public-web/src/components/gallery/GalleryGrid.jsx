"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { getResolvedUrl } from '@/services/api';

const GalleryGrid = ({ filteredImages, images, onSelectImage }) => {
   if (!filteredImages || filteredImages.length === 0) {
      return (
         <div className="py-32 text-center">
            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No photo entries found in this album.</p>
         </div>
      );
   }

   return (
      <section className="container mx-auto px-6 lg:px-24">
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredImages.map((img, i) => {
               const imageUrl = getResolvedUrl(img.url || img.image_url);
               return (
                  <motion.div
                     key={img.id || i}
                     initial={{ opacity: 0, y: 20 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     viewport={{ once: true }}
                     transition={{ delay: i * 0.04 }}
                     onClick={() => {
                        const idx = images.findIndex(orig => orig.id === img.id);
                        onSelectImage(idx !== -1 ? idx : i);
                     }}
                     className="group relative aspect-[4/5] bg-slate-100 rounded-3xl overflow-hidden border border-slate-200 hover:border-[var(--primary)]/50 shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer"
                  >
                     <img src={imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" alt={img.title || "Gallery Moment"} />

                     {img.category && (
                        <div className="absolute inset-x-4 top-4 opacity-0 group-hover:opacity-100 transition-all transform -translate-y-2 group-hover:translate-y-0">
                           <div className="bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-200 w-fit shadow-xs">
                              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)]">{img.category}</span>
                           </div>
                        </div>
                     )}

                     <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />

                     <div className="absolute inset-x-4 bottom-4 p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 text-[#0F172A] opacity-0 group-hover:opacity-100 transition-all transform translate-y-3 group-hover:translate-y-0 shadow-lg">
                        <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-[var(--primary)]">CAMPUS MOMENT</p>
                        <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-tight truncate">{img.title || "Scholastic Event"}</h3>
                     </div>
                  </motion.div>
               );
            })}
         </div>
      </section>
   );
};

export default GalleryGrid;
