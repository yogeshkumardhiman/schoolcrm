"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, ShieldCheck, Building2, Library, Microscope, Users, BookOpen, ExternalLink, Calendar, GraduationCap, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import BASE_URL from '../api/config';
import { SITE_CONFIG } from '@/constants/config';
import Link from 'next/link';

const MandatoryDisclosure = () => {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingPdf, setViewingPdf] = useState(null);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/compliance`);
        setDocs(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, []);

  const facilities = [
    { title: SITE_CONFIG.mandatoryDisclosure.infrastructureList[0].title, desc: SITE_CONFIG.mandatoryDisclosure.infrastructureList[0].desc, icon: Building2 },
    { title: SITE_CONFIG.mandatoryDisclosure.infrastructureList[1].title, desc: SITE_CONFIG.mandatoryDisclosure.infrastructureList[1].desc, icon: Microscope },
    { title: SITE_CONFIG.mandatoryDisclosure.infrastructureList[2].title, desc: SITE_CONFIG.mandatoryDisclosure.infrastructureList[2].desc, icon: Users },
    { title: SITE_CONFIG.mandatoryDisclosure.infrastructureList[3].title, desc: SITE_CONFIG.mandatoryDisclosure.infrastructureList[3].desc, icon: Library },
  ];

  if (viewingPdf) {
    return (
      <div className="fixed inset-0 z-[1000] bg-[#0F172A] flex flex-col animate-in fade-in duration-500">
        {/* 🏛️ Viewer Header (Professional & Bold) */}
        <div className="h-24 bg-white/5 border-b border-white/10 px-8 lg:px-12 flex items-center justify-between backdrop-blur-2xl">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setViewingPdf(null)}
              className="group flex items-center justify-center w-12 h-12 rounded-lgxl bg-white/5 text-slate-400 hover:bg-indigo-600 hover:text-white transition-all shadow-xl"
            >
              <X size={24} className="group-hover:-rotate-90 transition-transform" />
            </button>
            <div className="h-10 w-px bg-white/10 mx-2" />
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 flex items-center justify-center rounded-lgl">
                <FileText size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black text-white uppercase tracking-tight leading-none">{viewingPdf.title}</h2>
                <p className="text-slate-500 text-[9px] font-bold uppercase tracking-[4px] mt-2 italic">Institutional Documentary Registry</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="hidden lg:block text-right mr-6">
                <p className="text-slate-500 text-[8px] font-black uppercase tracking-[5px]">Official Compliance</p>
                <p className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest mt-1 italic">{SITE_CONFIG.mandatoryDisclosure.archiveLabel}</p>
             </div>
             <Link 
               to={viewingPdf.url} 
               download
               target="_blank"
               rel="noopener noreferrer"
               className="flex items-center gap-3 px-6 py-3 rounded-lgl bg-white/5 text-slate-300 font-black uppercase tracking-widest text-[10px] hover:bg-white/10 hover:text-white transition-all border border-white/10"
             >
               <Download size={14} /> {SITE_CONFIG.mandatoryDisclosure.downloadPdf}
             </Link>
          </div>
        </div>

        {/* 📄 Immersive PDF Display Area */}
        <div className="flex-1 relative bg-slate-950 flex flex-col items-center justify-center">
            {/* Loading Skeleton underneath */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-0">
               <Loader2 className="animate-spin text-indigo-500/10" size={64} />
               <p className="text-white/5 font-black uppercase tracking-[15px] text-xs">Authenticating Resource...</p>
            </div>
            
            {/* Real PDF Frame */}
            <iframe 
              src={`${viewingPdf.url}#toolbar=0&navpanes=0&scrollbar=0`} 
              className="relative z-10 w-full h-full border-none shadow-2xl"
              title="Official Document Viewer"
            />
        </div>

        {/* 🔐 Secure Status Bar */}
        <div className="h-12 bg-white/5 border-t border-white/10 px-12 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <ShieldCheck size={14} className="text-indigo-500" />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[6px]">Secure Digital Protocol Active</span>
           </div>
           <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">{SITE_CONFIG.mandatoryDisclosure.confidentialTag}</p>
        </div>
      </div>
    );
  }



  return (
    <div className="pt-24 min-h-screen bg-[#0F172A] selection:bg-fuchsia-500 selection:text-white">
      {/* 🌌 Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[150px] rounded-full opacity-50" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-fuchsia-600/5 blur-[120px] rounded-full opacity-50" />
      </div>

      <div className="container mx-auto px-6 lg:px-24 relative z-10 py-20">
        
        {/* 🏛️ Premium Hero Section */}
        <div className="text-center mb-24">
            <motion.div
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8 }}
            >
               <span className="bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20 px-6 py-2 rounded-full font-bold uppercase tracking-[4px] text-xs mb-8 inline-block">{SITE_CONFIG.mandatoryDisclosure.heroTag}</span>
               <h1 className="text-5xl lg:text-7xl font-black text-white leading-[1.05] mb-8 tracking-tighter">
                  Mandatory <br/> 
                  <span className="bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                     {SITE_CONFIG.mandatoryDisclosure.heroTitle.split(' ')[1] || "Disclosure"}
                  </span>
               </h1>
               <div className="h-1.5 w-32 bg-gradient-to-r from-indigo-600 to-fuchsia-600 mx-auto rounded-full mb-8" />
               <p className="text-slate-400 max-w-3xl mx-auto text-lg lg:text-xl font-medium leading-relaxed">
                  {SITE_CONFIG.mandatoryDisclosure.heroDesc}
               </p>
            </motion.div>
        </div>

        {/* 📑 Document Registry Grid */}
        <div className="mb-32">
          <div className="flex items-center gap-4 mb-12">
            <div className="h-8 w-2 bg-fuchsia-600 rounded-full" />
            <h2 className="text-3xl font-bold text-white tracking-tight">{SITE_CONFIG.mandatoryDisclosure.docsTitle}</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-lg h-48 animate-pulse" />
              ))
            ) : docs.length > 0 ? (
              docs.map((doc, i) => (
                <motion.div 
                  key={doc.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -8, backgroundColor: 'rgba(255,255,255,0.08)' }}
                  className="bg-white/5 border border-white/10 p-8 rounded-lg backdrop-blur-xl transition-all group"
                >
                  <div className="w-14 h-14 bg-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center rounded-lgxl mb-6 group-hover:bg-fuchsia-500 group-hover:text-white transition-colors duration-500">
                    <FileText size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-6 leading-tight group-hover:text-fuchsia-400 transition-colors">
                    {doc.title}
                  </h3>
                  <div className="flex items-center gap-4 mt-auto pt-6 border-t border-white/5">
                    <button 
                      onClick={() => setViewingPdf(doc)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lgl bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all"
                    >
                      <ExternalLink size={14} /> View
                    </button>
                    <Link 
                      to={doc.url} 
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lgl bg-white/5 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all"
                    >
                      <Download size={14} /> Save
                    </Link>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-white/10 rounded-[40px]">
                <p className="text-slate-500 font-bold uppercase tracking-widest">{SITE_CONFIG.mandatoryDisclosure.noDocs}</p>
              </div>
            )}
          </div>
        </div>

        {/* 🏫 Results & Facilities Composite */}
        <div className="grid lg:grid-cols-2 gap-10">
          {/* Result Block */}
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="bg-gradient-to-br from-indigo-600/20 to-indigo-900/40 border border-indigo-500/20 p-12 rounded-[48px] backdrop-blur-sm flex flex-col justify-between"
          >
            <div>
              <div className="w-16 h-16 bg-indigo-500/20 text-indigo-400 flex items-center justify-center rounded-lgxl mb-10">
                <GraduationCap size={32} />
              </div>
              <h2 className="text-4xl font-black text-white mb-6 uppercase tracking-tight">
                 {SITE_CONFIG.mandatoryDisclosure.resultTitle.split(' ').slice(0, 2).join(' ')} <br/> {SITE_CONFIG.mandatoryDisclosure.resultTitle.split(' ').slice(2).join(' ')}
              </h2>
              <p className="text-indigo-100/70 text-lg font-medium leading-relaxed">
                {SITE_CONFIG.mandatoryDisclosure.resultDesc}
              </p>
            </div>
            <div className="mt-12 flex gap-10">
              <div>
                <span className="text-3xl font-black text-white block">100%</span>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{SITE_CONFIG.mandatoryDisclosure.passRatio}</span>
              </div>
              <div>
                <span className="text-3xl font-black text-white block">18+</span>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{SITE_CONFIG.mandatoryDisclosure.yearsLegacy}</span>
              </div>
            </div>
          </motion.div>

          {/* Infrastructure Block */}
          <div className="grid grid-cols-2 gap-6">
            {facilities.map((f, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="bg-white/5 border border-white/10 p-6 rounded-lgxl backdrop-blur-sm"
              >
                <div className="w-10 h-10 bg-slate-800 text-slate-300 flex items-center justify-center rounded-lgl mb-4">
                  <f.icon size={20} />
                </div>
                <h4 className="text-sm font-black text-white mb-2 uppercase tracking-tight">{f.title}</h4>
                <p className="text-slate-500 text-[11px] leading-relaxed font-semibold">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
      
      
      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default MandatoryDisclosure;
