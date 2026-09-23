"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchGallery, getResolvedUrl } from '@/services/api';
import { Button } from '@/components/ui/button';

const GallerySection = () => {
   const [images, setImages] = useState([]);
   
   useEffect(() => {
      fetchGallery().then(d => {
         if (Array.isArray(d)) setImages(d);
      }).catch(err => console.error(err));
   }, []);

   if (!images || images.length === 0) return null;

   return (
      <section className="py-12 md:py-16 bg-white">
         <div className="container mx-auto px-6">
            <div className="flex justify-between items-end mb-10">
               <div className="space-y-1">
                  <span className="label-tag block text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--primary)' }}>Gallery</span>
                  <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Campus <span className="accent-italic" style={{ color: 'var(--secondary)' }}>Moments</span></h2>
               </div>
               <Button asChild variant="outline" className="rounded-xl border-slate-300 text-slate-600 hover:bg-slate-950 hover:text-white transition">
                  <Link href="/gallery">View All</Link>
               </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {images.slice(0, 4).map((img, i) => (
                  <div key={i} className="aspect-video rounded-2xl overflow-hidden border border-slate-100 group shadow-sm">
                     <img src={getResolvedUrl(img.url || img.image_url)} className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" alt={img.title || "Gallery"} />
                  </div>
               ))}
            </div>
         </div>
      </section>
   );
};

export default GallerySection;
