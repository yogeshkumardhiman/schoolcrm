"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchNotices, fetchSchoolInfo } from '@/services/api';
import { 
  Bell, 
  Calendar, 
  ArrowRight, 
  X, 
  Search, 
  Sparkles, 
  BookOpen, 
  FileText,
  Share2,
  Check
} from 'lucide-react';

const News = () => {
   const [newsItems, setNewsItems] = useState([]);
   const [schoolInfo, setSchoolInfo] = useState(null);
   const [loading, setLoading] = useState(true);
   const [selectedNotice, setSelectedNotice] = useState(null);
   const [searchQuery, setSearchQuery] = useState('');
   const [selectedCategory, setSelectedCategory] = useState('ALL');
   const [copied, setCopied] = useState(false);

   useEffect(() => {
      const loadData = async () => {
         try {
            const [noticesData, schoolData] = await Promise.allSettled([
               fetchNotices(),
               fetchSchoolInfo()
            ]);

            if (schoolData.status === 'fulfilled' && schoolData.value) {
               setSchoolInfo(schoolData.value);
            }

            if (noticesData.status === 'fulfilled' && noticesData.value) {
               const raw = noticesData.value;
               const results = raw?.notices || (Array.isArray(raw) ? raw : []);
               
               if (results.length > 0) {
                  const mappedNews = results.map((n, idx) => ({
                     id: n.id || idx + 1,
                     title: n.title || "School Circular",
                     date: n.createdAt ? new Date(n.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : (n.date || "Recent"),
                     type: n.tag || n.type || "Notice",
                     desc: n.content?.length > 130 ? n.content.substring(0, 130) + '...' : (n.content || "Click to view full notice details."),
                     content: n.content || "Detailed circular information is available from the school administrative desk.",
                     session: n.session || "2026-2027"
                  }));
                  setNewsItems(mappedNews);
               } else {
                  setNewsItems([
                     { id: 1, title: "Admissions Open 2026-27", date: "New", type: "Admission", desc: "Enrollment for the upcoming academic session has begun. Secure your child's future today.", content: "We are excited to announce that admissions for the academic year 2026-27 are now officially open. Parents can apply online or visit the campus admission desk." },
                     { id: 2, title: "Annual Sports & Cultural Meet", date: "Upcoming", type: "Event", desc: "Join our exciting annual sports and cultural extravaganza celebrating student athletic excellence.", content: "Get ready for a week filled with sportsmanship, athletic track events, yoga presentations, and inter-house football tournaments." },
                     { id: 3, title: "Parent-Teacher Conference (PTM)", date: "Circular", type: "Notice", desc: "Quarterly progress review meeting scheduled for all classes from Pre-Primary to Class 12.", content: "Dear Parents, the Parent-Teacher Meeting will be held this Saturday between 9:00 AM and 1:00 PM to review term assessments and learning milestones." }
                  ]);
               }
            }
         } catch (error) {
            console.error("Error loading news:", error);
         } finally {
            setLoading(false);
         }
      };
      loadData();
   }, []);

   const categories = ['ALL', 'Notice', 'Event', 'Admission', 'Circular'];

   const filteredNews = newsItems.filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
         item.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory === 'ALL' || item.type.toLowerCase() === selectedCategory.toLowerCase();
      return matchesSearch && matchesCat;
   });

   const handleShare = (notice) => {
      if (navigator.clipboard) {
         navigator.clipboard.writeText(`${window.location.origin}/news`);
         setCopied(true);
         setTimeout(() => setCopied(false), 2000);
      }
   };

   return (
      <div className="bg-slate-50 min-h-screen pt-32 pb-24 font-body">
         {/* Page Header */}
         <div className="container mx-auto px-6 lg:px-12 mb-12">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="text-center max-w-3xl mx-auto space-y-4"
            >
               <span className="font-black uppercase tracking-[6px] text-xs block text-blue-600">Official Notice Board</span>
               <h1 className="text-4xl md:text-6xl font-black text-slate-900 uppercase tracking-tight">Latest News & Updates</h1>
               <div className="w-20 h-1 mx-auto rounded-full mt-2" style={{ backgroundColor: 'var(--primary, #2563eb)' }} />
               <p className="text-slate-600 font-medium text-base md:text-lg leading-relaxed mt-4">
                  Stay up-to-date with official academic circulars, campus events, and announcements at {schoolInfo?.name || "Rani Public School"}.
               </p>
            </motion.div>

            {/* Search & Filter Bar */}
            <div className="max-w-4xl mx-auto mt-10 flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
               <div className="relative flex-1 w-full">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                     type="text"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     placeholder="Search circulars, events, notices..."
                     className="w-full pl-11 pr-4 py-2.5 bg-transparent text-sm text-slate-800 font-medium outline-hidden"
                  />
               </div>

               <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                  {categories.map((cat) => (
                     <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                           selectedCategory === cat
                              ? "bg-slate-900 text-white shadow-xs"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {cat}
                     </button>
                  ))}
               </div>
            </div>
         </div>

         {/* News Grid */}
         <div className="container mx-auto px-6 lg:px-12">
            {loading ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[1, 2, 3].map(i => (
                     <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm animate-pulse h-64 flex flex-col justify-between">
                        <div className="space-y-4">
                           <div className="h-4 bg-slate-100 rounded w-1/4"></div>
                           <div className="h-6 bg-slate-100 rounded w-3/4"></div>
                           <div className="h-4 bg-slate-50 rounded w-full"></div>
                        </div>
                        <div className="h-8 bg-slate-100 rounded w-1/3"></div>
                     </div>
                  ))}
               </div>
            ) : filteredNews.length === 0 ? (
               <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 max-w-xl mx-auto p-8 space-y-3">
                  <Bell size={36} className="mx-auto text-slate-300" />
                  <h3 className="text-lg font-bold text-slate-800">No Notices Found</h3>
                  <p className="text-xs text-slate-500">Try adjusting your search query or category filter.</p>
               </div>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredNews.map((item, i) => (
                     <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => setSelectedNotice(item)}
                        className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-blue-300 hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between h-full cursor-pointer relative"
                     >
                        <div className="space-y-4">
                           <div className="flex items-center justify-between gap-3">
                              <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200/60 rounded-full text-[10px] font-black uppercase tracking-wider">
                                 {item.type}
                              </span>
                              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-lg">
                                 {item.date}
                              </span>
                           </div>

                           <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase leading-snug">
                              {item.title}
                           </h3>

                           <p className="text-sm text-slate-600 font-normal leading-relaxed">
                              {item.desc}
                           </p>
                        </div>
                        
                        <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                           <span className="text-xs font-black uppercase tracking-wider text-blue-600 group-hover:text-blue-700 flex items-center gap-1.5">
                              Read Full Story
                              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                           </span>
                           <span className="text-[10px] font-bold text-slate-400">Click to expand</span>
                        </div>
                     </motion.div>
                  ))}
               </div>
            )}
         </div>

         {/* 📖 Notice Detail Reader Modal */}
         <AnimatePresence>
            {selectedNotice && (
               <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs">
                  <motion.div
                     initial={{ opacity: 0, scale: 0.95, y: 20 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95, y: 20 }}
                     transition={{ duration: 0.2 }}
                     className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden"
                  >
                     {/* Modal Top Bar */}
                     <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                           <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-wider">
                              {selectedNotice.type}
                           </span>
                           <span className="text-xs font-bold text-slate-500">
                              Published: {selectedNotice.date}
                           </span>
                        </div>

                        <button
                           onClick={() => setSelectedNotice(null)}
                           className="h-9 w-9 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer"
                           aria-label="Close"
                        >
                           <X size={18} />
                        </button>
                     </div>

                     {/* Modal Body */}
                     <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
                        <div className="space-y-2">
                           <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase leading-tight tracking-tight">
                              {selectedNotice.title}
                           </h2>
                           <div className="w-12 h-1 bg-blue-600 rounded-full" />
                        </div>

                        <div className="prose prose-slate max-w-none text-slate-700 text-base leading-relaxed whitespace-pre-line bg-slate-50/60 p-6 rounded-2xl border border-slate-100">
                           {selectedNotice.content}
                        </div>

                        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-3">
                           <Bell size={18} className="text-amber-600 shrink-0 mt-0.5" />
                           <div className="text-xs text-amber-900 leading-relaxed font-medium">
                              This circular is an official communication issued by <strong>{schoolInfo?.name || "Rani Public School"}</strong> Administration. For queries, contact the administrative office.
                           </div>
                        </div>
                     </div>

                     {/* Modal Footer */}
                     <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
                        <button
                           onClick={() => handleShare(selectedNotice)}
                           className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition cursor-pointer"
                        >
                           {copied ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
                           {copied ? "Link Copied" : "Share Circular"}
                        </button>

                        <button
                           onClick={() => setSelectedNotice(null)}
                           className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-md"
                        >
                           Done Reading
                        </button>
                     </div>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>
      </div>
   );
};

export default News;
