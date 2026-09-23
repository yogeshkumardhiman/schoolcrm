"use client";

import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { getResolvedUrl } from '@/services/api';

const GalleryModal = ({ selectedIdx, filteredImages, onClose, onNext, onPrev, onSelectIdx }) => {
   useEffect(() => {
      const handleKeyDown = (e) => {
         if (selectedIdx === null) return;
         if (e.key === 'ArrowRight') onNext();
         if (e.key === 'ArrowLeft') onPrev();
         if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
   }, [selectedIdx, onNext, onPrev, onClose]);

   if (selectedIdx === null || !filteredImages || !filteredImages[selectedIdx]) return null;

   const currentImg = filteredImages[selectedIdx];
   const imageUrl = getResolvedUrl(currentImg.url || currentImg.image_url);

   return (
      <AnimatePresence>
         <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-xl flex flex-col items-center justify-center select-none overflow-hidden"
         >
            {/* Background Overlay */}
            <div className="absolute inset-0 z-[101] cursor-zoom-out" onClick={onClose} />

            {/* Left/Right Navigation Areas */}
            {filteredImages.length > 1 && (
               <div className="absolute inset-x-0 top-0 bottom-32 flex z-[110] pointer-events-none">
                  <div className="w-[30%] h-full cursor-pointer pointer-events-auto flex items-center justify-start pl-8 group" onClick={onPrev}>
                     <div className="p-4 bg-white/90 text-slate-900 rounded-full shadow-2xl group-hover:scale-110 transition-all opacity-80 group-hover:opacity-100">
                        <ChevronLeft size={36} />
                     </div>
                  </div>
                  <div className="flex-1 h-full" />
                  <div className="w-[30%] h-full cursor-pointer pointer-events-auto flex items-center justify-end pr-8 group" onClick={onNext}>
                     <div className="p-4 bg-white/90 text-slate-900 rounded-full shadow-2xl group-hover:scale-110 transition-all opacity-80 group-hover:opacity-100">
                        <ChevronRight size={36} />
                     </div>
                  </div>
               </div>
            )}

            {/* Main Modal Image Container */}
            <div className="relative z-[105] max-w-5xl w-full px-6 flex flex-col items-center justify-center">
               <motion.div
                  key={selectedIdx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="relative max-w-full"
               >
                  <img
                     src={imageUrl}
                     className="max-w-full h-auto max-h-[70vh] object-contain rounded-3xl shadow-2xl border-4 border-white/20"
                     alt={currentImg.title || "Gallery Moment"}
                     onClick={(e) => e.stopPropagation()}
                  />

                  <div className="mt-4 bg-white/95 backdrop-blur-md px-8 py-4 rounded-2xl shadow-xl border border-slate-200 text-center max-w-2xl mx-auto space-y-1">
                     <div className="flex items-center justify-center gap-3">
                        <span className="bg-[var(--primary,#1E3A8A)] px-3 py-0.5 rounded-full text-white text-[10px] font-black tracking-widest">
                           {selectedIdx + 1} / {filteredImages.length}
                        </span>
                        {currentImg.category && (
                           <span className="text-slate-500 font-bold text-xs uppercase tracking-wider">{currentImg.category}</span>
                        )}
                     </div>
                     <h3 className="text-lg md:text-xl font-extrabold text-slate-900 uppercase tracking-tight">
                        {currentImg.title || "Campus Moment"}
                     </h3>
                  </div>

                  {/* Close Button */}
                  <Button
                     variant="ghost"
                     onClick={onClose}
                     className="absolute -top-4 -right-4 w-12 h-12 bg-white text-slate-900 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-xl z-[140] p-0 border border-slate-200"
                  >
                     <X size={24} />
                  </Button>
               </motion.div>
            </div>
         </motion.div>
      </AnimatePresence>
   );
};

export default GalleryModal;
