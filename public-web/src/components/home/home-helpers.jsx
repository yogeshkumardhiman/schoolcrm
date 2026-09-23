"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useInView } from 'framer-motion';
import {
   GraduationCap,
   Users,
   Trophy,
   School,
   ShieldCheck,
   Target,
   Award,
   Zap,
   Quote,
   Bell
} from 'lucide-react';

const iconMap = {
   GraduationCap,
   Users,
   Trophy,
   School,
   ShieldCheck,
   Target,
   Award,
   Zap,
   Quote,
   Bell
};

// --- Helper: Dynamic Icon Renderer ---
export const DynamicIcon = ({ name, className, size = 24 }) => {
   const IconComponent = iconMap[name] || Award;
   return <IconComponent className={className} size={size} />;
};

// --- 🔢 Animated Counter Component ---
export const Counter = ({ target, duration = 2 }) => {
   const [count, setCount] = useState(0);
   const ref = useRef(null);
   const isInView = useInView(ref, { once: true });

   useEffect(() => {
      if (isInView) {
         let start = 0;
         const end = parseInt((target || '0').replace(/\D/g, '')) || 0;
         if (end === 0) {
            setCount(0);
            return;
         }
         const totalMiliseconds = duration * 1000;
         const incrementTime = Math.max(totalMiliseconds / end, 20);
         const timer = setInterval(() => {
            start += Math.ceil(end / 80);
            if (start >= end) {
               setCount(end);
               clearInterval(timer);
            } else {
               setCount(start);
            }
         }, incrementTime);
         return () => clearInterval(timer);
      }
   }, [isInView, target, duration]);

   return <span ref={ref}>{count}{(target || '').includes('+') ? '+' : ''}{(target || '').includes('%') ? '%' : ''}</span>;
};
