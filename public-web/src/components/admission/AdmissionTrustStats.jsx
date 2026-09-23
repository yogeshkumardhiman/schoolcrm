"use client";

import React from 'react';
import { Users, Award, Sparkles } from 'lucide-react';
import { Counter } from '@/components/home/home-helpers';

const AdmissionTrustStats = ({ schoolInfo }) => {
   const studentCount = schoolInfo?.stats?.students || schoolInfo?.statistics?.find(s => s.label?.toLowerCase().includes('student') || s.label?.toLowerCase().includes('scholar'))?.number || "2000+";
   const facultyCount = schoolInfo?.stats?.faculty || schoolInfo?.statistics?.find(s => s.label?.toLowerCase().includes('faculty') || s.label?.toLowerCase().includes('teacher'))?.number || "150+";
   const satisfactionRate = schoolInfo?.stats?.satisfaction || "98%";

   const trustStats = [
      { title: studentCount, label: "Enrolled Scholars", icon: Users },
      { title: facultyCount, label: "Faculty Mentors", icon: Award },
      { title: satisfactionRate, label: "Satisfaction Rate", icon: Sparkles }
   ];

   return (
      <section className="py-12 md:py-16 bg-slate-50/70 border-b border-slate-200">
         <div className="container mx-auto px-6 max-w-7xl">
            <div className="grid md:grid-cols-3 gap-6">
               {trustStats.map((stat, i) => (
                  <div key={i} className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-lg hover:border-[var(--primary)]/30 transition-all duration-300 flex items-center gap-5 cursor-default">
                     <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm" style={{ backgroundColor: 'var(--primary)' }}>
                        <stat.icon size={26} />
                     </div>
                     <div className="space-y-0.5">
                        <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-mono leading-none">
                           <Counter target={stat.title} />
                        </h3>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 leading-none pt-1">{stat.label}</p>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </section>
   );
};

export default AdmissionTrustStats;
