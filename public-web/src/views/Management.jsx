"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, Star, Award, ShieldCheck, Clock, BookOpen, GraduationCap, ArrowRight, Users, Sparkles } from 'lucide-react';
import API from '../api/config';
import { SITE_CONFIG } from '@/constants/config';
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

const Management = () => {
  const [staff, setStaff] = useState([]);
  const [management, setManagement] = useState([]);
  const [activeLeader, setActiveLeader] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API}/staff`);
        const data = await res.json();
        setStaff(data || []);
        const mgmt = (data || []).filter(s => s.role === 'MANAGEMENT');
        setManagement(mgmt);
        if (mgmt.length > 0) setActiveLeader(mgmt[0]);
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, []);

  const filteredStaff = filter === 'all' 
    ? staff 
    : staff.filter(s => s.role.toLowerCase() === filter.toLowerCase());

  return (
    <div className="bg-white min-h-screen selection:bg-indigo-600 selection:text-white">
      
      {/* 🚀 Header: The Architects */}
      <section className="bg-gradient-to-b from-[#020617] to-[#0F172A] pt-40 pb-24 px-10 text-center">
         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-4xl mx-auto">
            <span className="text-indigo-500 font-bold uppercase tracking-[10px] text-[10px] block mb-4">{SITE_CONFIG.management.heroTag}</span>
            <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight uppercase leading-none">
               THE <span className="text-indigo-500 underline decoration-white/10 decoration-8 underline-offset-8">ARCHITECTS</span>
            </h1>
            <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
               {SITE_CONFIG.management.heroDesc}
            </p>
         </motion.div>
      </section>

      {/* 👑 Section 1: Leadership Focus (High-End Selector) */}
      {management.length > 0 && (
         <section className="py-32 bg-[#FAFBFD] border-b border-slate-100">
            <div className="container mx-auto px-10 lg:px-24">
               <div className="flex items-center gap-4 mb-16">
                  <Sparkles className="text-indigo-600" size={24} />
                  <h2 className="text-2xl font-bold uppercase tracking-widest text-[#0F172A]">{SITE_CONFIG.management.circleTitle.split(' ')[0]} <span className="text-indigo-600">{SITE_CONFIG.management.circleTitle.split(' ')[1] || ''}</span></h2>
               </div>

              <div className="grid lg:grid-cols-12 gap-16 items-start">
                 {/* Sidebar Navigator */}
                 <div className="lg:col-span-4 space-y-4">
                    {management.map((leader) => (
                       <button 
                          key={leader.id}
                          onClick={() => setActiveLeader(leader)}
                          className={`w-full p-6 rounded-lgxl flex items-center gap-4 transition-all duration-300 text-left border 
                          ${activeLeader?.id === leader.id ? 'bg-[#0F172A] border-indigo-600 shadow-xl translate-x-4' : 'bg-white border-slate-100 hover:border-indigo-200'}`}
                       >
                          <img src={leader.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(leader.name)}`} className="w-12 h-12 rounded-lgl object-cover" alt="Thumb" />
                          <div>
                             <h4 className={`text-sm font-bold uppercase tracking-tight ${activeLeader?.id === leader.id ? 'text-white' : 'text-[#0F172A]'}`}>
                                {leader.name}
                             </h4>
                             <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${activeLeader?.id === leader.id ? 'text-indigo-400' : 'text-slate-400'}`}>
                                {leader.designation}
                             </p>
                          </div>
                          {activeLeader?.id === leader.id && <ArrowRight className="ml-auto text-indigo-500" size={18} />}
                       </button>
                    ))}
                 </div>

                 {/* Wisdom Display */}
                 <div className="lg:col-span-8">
                    <AnimatePresence mode="wait">
                       {activeLeader && (
                          <motion.div 
                             key={activeLeader.id}
                             initial={{ opacity: 0, x: 20 }}
                             animate={{ opacity: 1, x: 0 }}
                             exit={{ opacity: 0, x: -20 }}
                             className="bg-white rounded-[40px] p-12 lg:p-20 shadow-xl border border-slate-50 relative overflow-hidden flex flex-col items-center text-center"
                          >
                             <Quote size={120} className="absolute top-10 right-10 text-indigo-50 opacity-50" />
                             
                             <div className="w-48 h-48 rounded-lg overflow-hidden shadow-2xl mb-10 ring-8 ring-indigo-50">
                                <img src={activeLeader.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(activeLeader.name)}`} className="w-full h-full object-cover" alt="Leader" />
                             </div>

                             <div className="space-y-6 max-w-2xl relative z-10 mb-10">
                                <div className="flex justify-center gap-1 mb-6">
                                   {[...Array(5)].map((_, i) => <Star key={i} size={16} className="text-indigo-600 fill-indigo-600" />)}
                                </div>
                                <h3 className="text-2xl md:text-3xl font-bold text-[#0F172A] leading-tight px-4">
                                   "{activeLeader.about}"
                                </h3>
                             </div>

                             <div className="w-full border-t border-slate-100 pt-10">
                                <h4 className="text-2xl font-bold text-[#0F172A] tracking-tight">— {activeLeader.name}</h4>
                                <Badge variant="secondary" className="mt-4 bg-indigo-50 text-indigo-600 border-none px-6 py-2 uppercase tracking-widest text-[9px] font-bold">
                                   {activeLeader.designation}
                                </Badge>
                             </div>
                          </motion.div>
                       )}
                    </AnimatePresence>
                 </div>
              </div>
           </div>
        </section>
      )}

      {/* 👨‍🏫 Section 2: Unified Faculty Grid */}
      <section className="py-32 bg-white">
         <div className="container mx-auto px-10 lg:px-24">
            <div className="text-center mb-16">
               <h2 className="text-3xl font-bold mb-4 tracking-tight">{SITE_CONFIG.management.facultyTitle}</h2>
               <div className="w-16 h-1.5 bg-indigo-600 mx-auto rounded-full mb-8" />
               
               {/* Filters */}
               <Tabs defaultValue="all" className="w-full flex justify-center" onValueChange={setFilter}>
                 <TabsList className="bg-slate-50 p-1 rounded-lgl">
                   <TabsTrigger value="all" className="px-8 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">All</TabsTrigger>
                   <TabsTrigger value="MANAGEMENT" className="px-8 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">Management</TabsTrigger>
                   <TabsTrigger value="TEACHER" className="px-8 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">Teachers</TabsTrigger>
                 </TabsList>
               </Tabs>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
               <AnimatePresence mode="popLayout">
                  {filteredStaff.map((member, i) => (
                    <motion.div
                       layout
                       key={member.id}
                       initial={{ opacity: 0, scale: 0.9 }}
                       animate={{ opacity: 1, scale: 1 }}
                       exit={{ opacity: 0, scale: 0.9 }}
                       transition={{ delay: i * 0.05 }}
                    >
                       <Card className="rounded-lgxl border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group cursor-default">
                          <CardContent className="p-0">
                             <div className="h-64 w-full overflow-hidden relative">
                                <img
                                   src={member.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(member.name)}`}
                                   alt={member.name}
                                   className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                                />
                                <div className="absolute top-4 right-4">
                                   <Badge className="bg-white/90 backdrop-blur-md text-[#0F172A] border-none font-bold text-[8px] uppercase tracking-widest">
                                      {member.role}
                                   </Badge>
                                </div>
                             </div>

                             <div className="p-8 text-center bg-white group-hover:bg-indigo-600 transition-colors duration-300">
                                <h3 className="font-bold text-lg mb-1 group-hover:text-white transition-colors">
                                   {member.name}
                                </h3>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest group-hover:text-indigo-100 transition-colors">
                                   {member.designation}
                                </p>
                             </div>
                          </CardContent>
                       </Card>
                    </motion.div>
                  ))}
               </AnimatePresence>
            </div>
         </div>
      </section>

      {/* 🏆 Trust Indicators */}
      <section className="py-24 bg-slate-50">
         <div className="container mx-auto px-10 grid md:grid-cols-4 gap-8">
            {[
              { icon: Award, label: SITE_CONFIG.teachers.statRecognised, value: SITE_CONFIG.teachers.statValRecognised },
              { icon: ShieldCheck, label: SITE_CONFIG.teachers.statCommitment, value: SITE_CONFIG.teachers.statValCommitment },
              { icon: GraduationCap, label: SITE_CONFIG.teachers.statFaculty, value: SITE_CONFIG.teachers.statValFaculty },
              { icon: Clock, label: SITE_CONFIG.teachers.statLegacy, value: SITE_CONFIG.teachers.statValLegacy }
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-6 p-10 bg-white rounded-lgxl shadow-sm border border-slate-50 transition-all hover:shadow-xl group">
                 <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-lgxl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <stat.icon size={26} />
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                    <p className="text-lg font-bold text-[#0F172A] tracking-tight">{stat.value}</p>
                 </div>
              </div>
            ))}
         </div>
      </section>

    </div>
  );
};

export default Management;

