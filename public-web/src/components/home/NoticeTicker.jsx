"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import { SITE_CONFIG } from '@/constants/config';

const NoticeTicker = ({ schoolInfo, notices }) => {
   const tickerNotice = schoolInfo?.top_info_bar?.notice || (Array.isArray(notices) && notices[0]?.title);
   if (!tickerNotice) return null;

   return (
      <div
         className="text-white overflow-hidden relative z-40 py-2.5 border-b border-white/5"
         style={{ backgroundColor: 'var(--primary)' }}
      >
         <div className="container mx-auto px-6 flex items-center gap-6">
            <div className="flex-shrink-0 flex items-center gap-2 font-black label-tag bg-white/20 px-4 py-1.5 rounded-full backdrop-blur-md text-xs uppercase tracking-wider">
               <Bell size={14} className="animate-bounce" /> Scholastic Pulse
            </div>
            <div className="flex-grow overflow-hidden whitespace-nowrap">
               <motion.div
                  animate={{ x: [0, -1000] }}
                  transition={{ repeat: Infinity, duration: 35, ease: "linear" }}
                  className="inline-block"
               >
                  <span className="mx-12 font-bold tracking-wide text-sm opacity-95 uppercase">
                     {tickerNotice}
                  </span>
               </motion.div>
            </div>
         </div>
      </div>
   );
};

export default NoticeTicker;
