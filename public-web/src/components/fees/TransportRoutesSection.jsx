"use client";

import React, { useState } from 'react';
import { Bus, Search } from 'lucide-react';

const TransportRoutesSection = ({ transportRoutes }) => {
   const [searchTerm, setSearchTerm] = useState("");

   if (!transportRoutes || transportRoutes.length === 0) return null;

   const filteredRoutes = transportRoutes.filter((r) =>
      (r.routeName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.pickupPoints || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.distanceSlab || '').toLowerCase().includes(searchTerm.toLowerCase())
   );

   return (
      <section className="space-y-10 pt-8 border-t border-slate-200">
         <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
               <div className="inline-flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase tracking-wider">
                  <Bus size={15} />
                  <span>Fleet & Transport Connectivity</span>
               </div>
               <h2 className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight uppercase">
                  Transport Route Slabs & Bus Fees
               </h2>
               <p className="text-sm text-slate-600 max-w-xl">
                  Our verified GPS and CCTV fleet covers pickup locations across regions with dedicated staff attendants.
               </p>
            </div>

            {/* Route Search */}
            <div className="relative w-full md:w-72">
               <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
               <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search route or area..."
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[var(--primary)] focus:bg-white"
               />
            </div>
         </div>

         <div className="grid md:grid-cols-2 gap-6">
            {filteredRoutes.map((route, idx) => (
               <div
                  key={route.id || idx}
                  className="p-6 rounded-3xl border border-slate-200 bg-white space-y-4 hover:border-[var(--primary)]/50 hover:shadow-lg transition-all flex flex-col justify-between"
               >
                  <div className="space-y-3">
                     <div className="flex items-center justify-between gap-2">
                        <h4 className="text-base font-bold text-[#0F172A] tracking-tight">{route.routeName}</h4>
                        {route.distanceSlab && (
                           <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                              {route.distanceSlab}
                           </span>
                        )}
                     </div>

                     <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <div>
                           <p className="text-xs text-slate-500 font-semibold">Monthly Transport Charges</p>
                           <p className="text-2xl font-black text-[#0F172A] font-mono">{route.monthlyFee}</p>
                        </div>
                        {route.vehicleType && (
                           <span className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs">
                              {route.vehicleType}
                           </span>
                        )}
                     </div>

                     {route.pickupPoints && (
                        <div className="text-xs text-slate-600 space-y-1">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Designated Stops & Landmarks:</p>
                           <p className="leading-relaxed">{route.pickupPoints}</p>
                        </div>
                     )}
                  </div>
               </div>
            ))}
         </div>
      </section>
   );
};

export default TransportRoutesSection;
