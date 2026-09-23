"use client";

import React from 'react';

const GalleryCategories = ({ categories, selectedCategory, onSelectCategory }) => {
   if (!categories || categories.length <= 1) return null;

   return (
      <section className="container mx-auto px-6 lg:px-24 mb-12 relative z-10 text-center">
         <div className="flex flex-wrap items-center justify-center gap-3">
            {categories.map(cat => (
               <button
                  key={cat}
                  onClick={() => onSelectCategory(cat)}
                  className={`px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-300 border cursor-pointer ${
                     selectedCategory === cat 
                     ? 'bg-[var(--primary,#1E3A8A)] text-white border-transparent shadow-lg scale-105' 
                     : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:text-slate-900 shadow-xs'
                  }`}
               >
                  {cat}
               </button>
            ))}
         </div>
      </section>
   );
};

export default GalleryCategories;
