"use client";

import React from 'react';
import { Calendar } from 'lucide-react';

const UpcomingEventsSection = ({ notices }) => {
   const events = Array.isArray(notices)
      ? notices.filter(n => n.type === 'EVENT' || n.type === 'Event').slice(0, 3)
      : [];

   if (!events || events.length === 0) return null;

   return (
      <section className="py-14 md:py-20 bg-slate-50 border-t border-slate-100">
         <div className="container mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
               <span className="label-tag block text-xs font-black uppercase tracking-widest" style={{ color: 'var(--primary)' }}>Schedule</span>
               <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Upcoming <span className="accent-italic" style={{ color: 'var(--secondary)' }}>Events Calendar</span></h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
               {events.map((event, i) => (
                  <div key={i} className="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center gap-5">
                     <div className="h-14 w-14 rounded-2xl bg-indigo-50/60 flex flex-col items-center justify-center text-indigo-700 font-black tracking-tight shrink-0 border border-indigo-100/50" style={{ color: 'var(--primary)' }}>
                        <Calendar size={22} />
                     </div>
                     <div>
                        <h3 className="font-extrabold text-slate-900 text-base md:text-lg mb-1 leading-snug capitalize">{event.title}</h3>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{event.date || (event.createdAt ? new Date(event.createdAt).toLocaleDateString() : 'Upcoming')}</p>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </section>
   );
};

export default UpcomingEventsSection;
