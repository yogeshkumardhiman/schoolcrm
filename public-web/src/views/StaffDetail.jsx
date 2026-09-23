"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
   ArrowLeft, Mail, GraduationCap,
   BookOpen, Award,
   Quote, Users, ShieldCheck, Crown, School,
   CheckCircle2, Sparkles, Briefcase, Calculator, Wrench
} from 'lucide-react';
import { fetchSchoolInfo } from '@/services/school';
import { getResolvedUrl } from '@/services/api';

const StaffDetail = () => {
   const params = useParams();
   const rawId = decodeURIComponent(params?.id || '');
   const [member, setMember] = useState(null);
   const [schoolInfo, setSchoolInfo] = useState(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      if (!rawId) return;

      const loadMemberData = async () => {
         setLoading(true);
         try {
            const [infoRes, staffRes] = await Promise.allSettled([
               fetchSchoolInfo(),
               fetch("http://127.0.0.1:4000/public/staff", { cache: "no-store" }).then(r => r.ok ? r.json() : [])
            ]);

            const info = infoRes.status === 'fulfilled' ? infoRes.value : null;
            const staffList = staffRes.status === 'fulfilled' && Array.isArray(staffRes.value) ? staffRes.value : [];
            if (info) setSchoolInfo(info);

            const schoolName = (info?.schoolName || info?.name || 'Our Institution').trim();
            let found = null;

            // 1. Search in Management (director_message)
            const directors = Array.isArray(info?.director_message) ? info.director_message : [];
            const matchedDirector = directors.find((d, idx) => 
               String(d.id) === String(rawId) || 
               rawId === `mgmt-${d.id}` || 
               rawId === `mgmt-${idx}` ||
               (d.name && d.name.toLowerCase().replace(/\s+/g, '-') === rawId.toLowerCase())
            );

            if (matchedDirector) {
               const isPrincipal = (matchedDirector.designation || '').toLowerCase().includes('principal');
               found = {
                  id: matchedDirector.id || rawId,
                  name: matchedDirector.name,
                  role: isPrincipal ? 'PRINCIPAL' : 'MANAGEMENT',
                  designation: matchedDirector.designation || 'Institutional Leadership',
                  quote: matchedDirector.quote || '',
                  bio: matchedDirector.message || `Visionary leader serving ${schoolName} with dedication, ethical governance, and progressive institutional direction.`,
                  image: getResolvedUrl(matchedDirector.photo || matchedDirector.image || ''),
                  qualification: matchedDirector.qualification || 'Educational Leadership & Governance',
                  subject: matchedDirector.subject || 'Strategic Institutional Vision & Ethics',
                  experience: matchedDirector.experience || 'Senior Executive Standing',
                  email: matchedDirector.email || '',
                  isLeadership: true
               };
            }

            // 2. Search for Principal Desk
            if (!found && (rawId === 'principal-head' || rawId === 'principal' || rawId === 'principal-desk')) {
               const pName = (info?.principalName || info?.about_config?.principalName || 'Dr. Arvind Sharma').trim();
               const pImg = info?.principalImage || info?.about_config?.principalImage || '';
               const pMsg = info?.principalMessage || info?.about_config?.principalMessage || '';

               found = {
                  id: 'principal-head',
                  name: pName,
                  role: 'PRINCIPAL',
                  designation: 'School Principal & Head of Institution',
                  quote: 'Education is not merely about academic achievement; it is about nurturing responsible, confident, compassionate, and lifelong learners.',
                  bio: pMsg || `Dedicated to creating an inspiring environment at ${schoolName} where every student feels valued, encouraged, and guided to achieve their highest intellectual and moral potential.`,
                  image: getResolvedUrl(pImg),
                  qualification: 'Ph.D. / M.Ed., Academic Administration',
                  subject: 'Institutional Leadership & CBSE Curriculum Governance',
                  experience: '20+ Years Educational Leadership',
                  email: '',
                  isLeadership: true
               };
            }

            // 3. Search in /public/staff
            if (!found && staffList.length > 0) {
               const matchedStaff = staffList.find(s => 
                  String(s.id) === String(rawId) ||
                  (s.name && s.name.toLowerCase().replace(/\s+/g, '-') === rawId.toLowerCase())
               );

               if (matchedStaff) {
                  const rawRole = (matchedStaff.role || '').toUpperCase();
                  const desig = (matchedStaff.designation || '').toUpperCase();
                  const subj = (matchedStaff.subject || '').toUpperCase();
                  
                  let assignedRole = 'TEACHER';
                  if (rawRole === 'MANAGEMENT' || desig.includes('CHAIRMAN') || desig.includes('DIRECTOR') || desig.includes('FOUNDER')) {
                     assignedRole = 'MANAGEMENT';
                  } else if (rawRole === 'PRINCIPAL' || desig.includes('PRINCIPAL')) {
                     assignedRole = 'PRINCIPAL';
                  } else if (
                     rawRole === 'ACCOUNTANT' ||
                     rawRole === 'CLERK' ||
                     desig.includes('ACCOUNT') ||
                     desig.includes('FEE') ||
                     desig.includes('REGISTRAR') ||
                     desig.includes('FINANCE') ||
                     desig.includes('CASHIER') ||
                     subj.includes('ACCOUNT')
                  ) {
                     assignedRole = 'ACCOUNTANT';
                  } else if (
                     rawRole === 'FACILITIES' ||
                     rawRole === 'MAINTENANCE' ||
                     desig.includes('FACILIT') ||
                     desig.includes('MAINTENANCE') ||
                     desig.includes('OPERATIONS') ||
                     desig.includes('TRANSPORT') ||
                     desig.includes('SECURITY') ||
                     desig.includes('ESTATE')
                  ) {
                     assignedRole = 'FACILITIES';
                  } else if (rawRole === 'STAFF' || rawRole === 'ADMIN' || desig.includes('STAFF') || desig.includes('ADMIN')) {
                     assignedRole = 'FACILITIES';
                  }

                  found = {
                     id: matchedStaff.id,
                     name: matchedStaff.name,
                     role: assignedRole,
                     designation: matchedStaff.designation || (assignedRole === 'TEACHER' ? 'Faculty Educator' : assignedRole === 'ACCOUNTANT' ? 'Accountant & Registrar' : 'Facilities Staff'),
                     qualification: matchedStaff.qualification || 'Certified Professional',
                     subject: matchedStaff.subject || (assignedRole === 'TEACHER' ? 'General Academics' : assignedRole === 'ACCOUNTANT' ? 'Accounts & Finance' : 'Campus Operations'),
                     experience: matchedStaff.experience || 'Experienced Professional',
                     bio: matchedStaff.bio || matchedStaff.description || `Dedicated educator and mentor at ${schoolName}, passionately preparing students for academic distinction and character development.`,
                     image: getResolvedUrl(matchedStaff.image || matchedStaff.photo || matchedStaff.avatar || ''),
                     email: matchedStaff.email || ''
                  };
               }
            }

            setMember(found);
         } catch (err) {
            console.error('Error in StaffDetail load:', err);
         } finally {
            setLoading(false);
         }
      };

      loadMemberData();
   }, [rawId]);

   if (loading) {
      return (
         <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 space-y-4">
            <div className="w-12 h-12 border-4 border-[var(--primary,#1E3A8A)] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading Profile...</p>
         </div>
      );
   }

   if (!member) {
      return (
         <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-slate-200 flex items-center justify-center text-slate-400">
               <Users size={36} />
            </div>
            <div className="space-y-2 max-w-md">
               <h2 className="text-2xl font-black text-slate-900">Educator Profile Not Found</h2>
               <p className="text-sm text-slate-500">
                  The educator profile you are looking for is either unavailable or has been updated in the institutional registry.
               </p>
            </div>
            <Link href="/team">
               <button className="bg-[var(--primary,#1E3A8A)] hover:bg-opacity-90 text-white rounded-2xl px-8 py-3.5 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg">
                  <ArrowLeft size={16} /> Back to Our Team
               </button>
            </Link>
         </div>
      );
   }

   const roleBadgeColors = {
      MANAGEMENT: "bg-purple-100 text-purple-800 border-purple-200",
      PRINCIPAL: "bg-blue-100 text-blue-800 border-blue-200",
      TEACHER: "bg-emerald-100 text-emerald-800 border-emerald-200",
      ACCOUNTANT: "bg-amber-100 text-amber-800 border-amber-200",
      FACILITIES: "bg-slate-200 text-slate-800 border-slate-300"
   };

   const roleDisplayLabel = {
      MANAGEMENT: "MANAGEMENT",
      PRINCIPAL: "PRINCIPAL",
      TEACHER: "TEACHER",
      ACCOUNTANT: "ACCOUNTANT",
      FACILITIES: "FACILITIES & MAINTENANCE"
   }[member.role] || member.role;

   return (
      <div className="relative min-h-screen bg-[#F8FAFC] selection:bg-[var(--primary,#1E3A8A)] selection:text-white pt-24 pb-36 font-sans">
         
         {/* Background Subtle Gradient Blobs */}
         <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-slate-200/60 to-transparent pointer-events-none" />
         <div className="absolute top-20 right-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
         <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

         <div className="relative z-10 max-w-6xl mx-auto px-6">

            {/* Back Navigation Bar */}
            <div className="flex items-center justify-between mb-8">
               <Link
                  href="/team"
                  className="group inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:text-[var(--primary,#1E3A8A)] hover:border-[var(--primary,#1E3A8A)] shadow-xs transition-all font-bold text-xs uppercase tracking-wider"
               >
                  <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                  <span>Back to Our Team</span>
               </Link>

               <span className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden sm:inline-block">
                  Verified Institutional Profile
               </span>
            </div>

            {/* Profile Architecture Grid */}
            <div className="bg-white rounded-[36px] border border-slate-200/90 shadow-xl overflow-hidden">
               <div className="grid lg:grid-cols-12 items-stretch">

                  {/* Left Column: Portrait & Quick Snapshot (5 Cols) */}
                  <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 via-slate-850 to-slate-950 text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
                     <div className="absolute -top-16 -left-16 w-56 h-56 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
                     <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

                     <div className="space-y-6 relative z-10">
                        {/* Portrait Frame */}
                        <div className="aspect-[4/4.8] w-full rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl bg-slate-800 relative group mx-auto">
                           {member.image ? (
                              <img
                                 src={member.image}
                                 alt={member.name}
                                 className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                                 onError={(e) => {
                                    e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(member.name || "Teacher")}`;
                                 }}
                              />
                           ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-white/50 space-y-2">
                                 <div className="w-24 h-24 rounded-2xl bg-white/10 flex items-center justify-center text-4xl font-black text-white">
                                    {member.name?.charAt(0) || "E"}
                                 </div>
                                 <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                                    {roleDisplayLabel}
                                 </span>
                              </div>
                           )}
                           
                           {/* Role Tag */}
                           <div className="absolute top-4 left-4">
                              <span className="px-3.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest border border-white/20">
                                 {roleDisplayLabel}
                              </span>
                           </div>
                        </div>

                        {/* Name & Identity */}
                        <div className="text-center sm:text-left space-y-1.5">
                           <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                              {member.name}
                           </h1>
                           <p className="text-sm font-bold text-blue-300 uppercase tracking-wider">
                              {member.designation}
                           </p>
                        </div>
                     </div>

                     {/* Verification Badges (Privacy-Safe: No personal phone numbers) */}
                     <div className="pt-8 mt-8 border-t border-white/10 space-y-3 relative z-10">
                        <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                           <ShieldCheck size={16} />
                           <span>Certified Member of {(schoolInfo?.schoolName || "Institution").trim()}</span>
                        </div>
                        {member.email && (
                           <div className="flex items-center gap-2 text-xs text-slate-300">
                              <Mail size={14} className="text-blue-400 shrink-0" />
                              <span className="truncate">{member.email}</span>
                           </div>
                        )}
                     </div>
                  </div>

                  {/* Right Column: Detailed Narrative & Credentials (7 Cols) */}
                  <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between space-y-8">
                     
                     <div className="space-y-6">
                        {/* Quote Card (if available) */}
                        {member.quote && (
                           <div className="p-6 rounded-3xl bg-amber-50/80 border border-amber-200/90 relative">
                              <Quote size={28} className="text-amber-500 mb-2 opacity-80" />
                              <p className="text-sm sm:text-base text-slate-800 italic font-medium leading-relaxed">
                                 "{member.quote}"
                              </p>
                           </div>
                        )}

                        {/* Credentials Matrix (4 Quadrants) */}
                        <div className="grid sm:grid-cols-2 gap-4">
                           {member.qualification && (
                              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                                    <GraduationCap size={15} className="text-blue-600" />
                                    Academic Qualification
                                 </span>
                                 <p className="text-sm font-extrabold text-slate-900">{member.qualification}</p>
                              </div>
                           )}

                           {member.subject && (
                              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                                    <BookOpen size={15} className="text-purple-600" />
                                    Domain & Specialty
                                 </span>
                                 <p className="text-sm font-extrabold text-slate-900">{member.subject}</p>
                              </div>
                           )}

                           {member.experience && (
                              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                                    <Award size={15} className="text-emerald-600" />
                                    Professional Standing
                                 </span>
                                 <p className="text-sm font-extrabold text-slate-900">{member.experience}</p>
                              </div>
                           )}

                           <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                                 <CheckCircle2 size={15} className="text-indigo-600" />
                                 Designation
                              </span>
                              <p className="text-sm font-extrabold text-slate-900">{member.designation}</p>
                           </div>
                        </div>

                        {/* Narrative & Bio Section */}
                        {member.bio && (
                           <div className="space-y-2 pt-2">
                              <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                                 <Sparkles size={14} className="text-amber-500" />
                                 Professional Standing & Responsibilities
                              </h3>
                              <p className="text-sm sm:text-base text-slate-600 leading-relaxed whitespace-pre-line font-normal">
                                 {member.bio}
                              </p>
                           </div>
                        )}
                     </div>

                     {/* Footer CTA Box */}
                     <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                        <div className="space-y-0.5">
                           <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900">Need Assistance?</h4>
                           <p className="text-xs text-slate-500">Contact our school administration for queries and appointments.</p>
                        </div>
                        <Link href="/contact">
                           <button className="px-6 py-3 rounded-xl bg-[var(--primary,#1E3A8A)] hover:bg-opacity-90 text-white font-bold text-xs uppercase tracking-wider cursor-pointer shadow-md transition-all">
                              Contact School Office
                           </button>
                        </Link>
                     </div>

                  </div>
               </div>
            </div>

         </div>
      </div>
   );
};

export default StaffDetail;
