"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { fetchGallery, fetchSchoolInfo } from '@/services/school';

import GalleryHero from '@/components/gallery/GalleryHero';
import GalleryCategories from '@/components/gallery/GalleryCategories';
import GalleryGrid from '@/components/gallery/GalleryGrid';
import GalleryModal from '@/components/gallery/GalleryModal';

const Gallery = () => {
   const [images, setImages] = useState([]);
   const [schoolInfo, setSchoolInfo] = useState(null);
   const [loading, setLoading] = useState(true);
   const [selectedIdx, setSelectedIdx] = useState(null);
   const [selectedCategory, setSelectedCategory] = useState('ALL');

   useEffect(() => {
      fetchSchoolInfo().then(data => {
         if (data) setSchoolInfo(data);
      }).catch(err => console.error("[Gallery] Error loading school info:", err));

      fetchGallery()
         .then(d => {
            setImages(d || []);
            setLoading(false);
         })
         .catch(err => {
            console.error("[Gallery] Error loading gallery images:", err);
            setLoading(false);
         });
   }, []);

   const filteredImages = images.filter(img => selectedCategory === 'ALL' || img.category === selectedCategory);
   const categories = ['ALL', ...new Set(images.map(img => img.category).filter(Boolean))];

   const handleNext = useCallback((e) => {
      if (e) e.stopPropagation();
      if (selectedIdx === null) return;
      setSelectedIdx((prev) => (prev + 1) % filteredImages.length);
   }, [selectedIdx, filteredImages.length]);

   const handlePrev = useCallback((e) => {
      if (e) e.stopPropagation();
      if (selectedIdx === null) return;
      setSelectedIdx((prev) => (prev - 1 + filteredImages.length) % filteredImages.length);
   }, [selectedIdx, filteredImages.length]);

   if (loading) return (
      <div className="min-h-screen bg-white pt-36 px-10 lg:px-24">
         <div className="text-center mb-16 space-y-4 animate-pulse">
            <div className="h-4 bg-slate-100 rounded w-24 mx-auto" />
            <div className="h-16 bg-slate-100 rounded w-64 mx-auto" />
         </div>
         <div className="flex justify-center gap-4 mb-20">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-10 w-24 bg-slate-50 rounded-full animate-pulse" />)}
         </div>
         <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
               <div key={i} className="aspect-[4/5] bg-slate-50 rounded-[40px] animate-pulse" />
            ))}
         </div>
      </div>
   );

   return (
      <div className="bg-[#F8FAFC] min-h-screen selection:bg-[var(--primary)] selection:text-white text-[#0F172A] antialiased overflow-x-hidden pt-24 pb-36 font-sans">
         <GalleryHero schoolInfo={schoolInfo} />

         <GalleryCategories
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => { setSelectedCategory(cat); setSelectedIdx(null); }}
         />

         <GalleryGrid
            filteredImages={filteredImages}
            images={images}
            onSelectImage={(idx) => setSelectedIdx(idx)}
         />

         <GalleryModal
            selectedIdx={selectedIdx}
            filteredImages={filteredImages}
            onClose={() => setSelectedIdx(null)}
            onNext={handleNext}
            onPrev={handlePrev}
            onSelectIdx={(i) => setSelectedIdx(i)}
         />
      </div>
   );
};

export default Gallery;
