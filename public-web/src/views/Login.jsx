"use client";

import React, { useState, useEffect } from 'react';
import { fetchSchoolInfo, getResolvedUrl, login } from '@/services/api';
import { Lock, GraduationCap, ShieldCheck, ChevronRight, Key, Mail, Phone, Loader2 } from 'lucide-react';
import { SITE_CONFIG } from '@/constants/config';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Login = () => {
   const router = useRouter();
   const [role, setRole] = useState('teacher'); // teacher, admin
   const [formData, setFormData] = useState({ id: '', password: '' });
   const [isLoggingIn, setIsLoggingIn] = useState(false);
   const [errorMsg, setErrorMsg] = useState('');
   const [schoolDetails, setSchoolDetails] = useState(null);

   useEffect(() => {
      fetchSchoolInfo().then(data => {
         if (data) {
            setSchoolDetails(data);
         }
      }).catch(err => console.error(err));
   }, []);

   const handleLogin = async (e) => {
      e.preventDefault();
      setIsLoggingIn(true);
      setErrorMsg('');
      try {
         const data = await login({ loginId: formData.id, password: formData.password, clientType: "CRM" });
         if (data.token) {
            // Redirect to CRM
            router.push('/');
         }
      } catch (err) {
         setErrorMsg(err.message || 'Login failed. Please check your credentials.');
         setIsLoggingIn(false);
      }
   };

   const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
   };

   const roleStyles = {
      teacher: 'border-purple-600 bg-purple-50 text-purple-600',
      admin: 'border-red-600 bg-red-50 text-red-600',
   };

   return (
      <div className="bg-slate-50 min-h-screen">
         <section className="pt-28 pb-20 container mx-auto px-6 flex items-center justify-center min-h-[85vh]">
            <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-10 bg-white p-6 rounded-[50px] shadow-2xl border border-slate-100 overflow-hidden relative group transition-all duration-700">
               {/* Branding Column */}
               <div className={`hidden lg:flex flex-col justify-between p-16 rounded-[40px] text-white overflow-hidden relative transition-colors duration-700 ${role === 'teacher' ? 'bg-purple-900' : 'bg-slate-900'}`}>
                  <div className="absolute top-0 right-0 w-full h-full bg-black/10 opacity-50 skew-x-12 -mr-32" />
                  <div className="relative z-10">
                     <div className="flex items-center gap-4 mb-10">
                        <div className="bg-white/20 p-2 rounded-lgxl backdrop-blur-md flex items-center justify-center overflow-hidden w-16 h-16 shrink-0">
                           {schoolDetails?.logoImage ? (
                              <img 
                                 src={getResolvedUrl(schoolDetails.logoImage)} 
                                 alt="School Logo" 
                                 className="w-full h-full object-contain rounded-full" 
                              />
                           ) : (
                              <GraduationCap size={44} className="text-white" />
                           )}
                        </div>
                        <h2 className="text-3xl font-black tracking-tight">{SITE_CONFIG.login.portalName}</h2>
                     </div>
                     <h3 className="text-5xl font-black leading-none mb-6">Manage Your <br /> Scholarly Journey</h3>
                     <p className="text-white/70 font-bold text-lg leading-relaxed max-w-sm">
                        {SITE_CONFIG.login.journeyDesc}
                     </p>
                  </div>

                  <div className="relative z-10 flex gap-10 items-center">
                     <div className="flex -space-x-4">
                        {[1, 2, 3].map(i => (
                           <div key={i} className={`w-12 h-12 rounded-full border-4 border-white/20 transition-colors ${role === 'teacher' ? 'bg-purple-300' : 'bg-slate-300'}`} />
                        ))}
                     </div>
                     <p className="text-white/60 font-black text-xs uppercase tracking-widest leading-none">
                        {SITE_CONFIG.login.trustedBy}
                     </p>
                  </div>
               </div>

               {/* Login Form Column */}
               <div className="p-8 lg:p-12">
                  <div className="mb-12">
                     <h2 className="text-4xl font-black text-slate-900 mb-2">{SITE_CONFIG.login.welcomeTitle}</h2>
                     <p className="text-slate-500 font-bold">{SITE_CONFIG.login.welcomeSub}</p>
                  </div>

                  {/* Role Choice */}
                  <div className="grid grid-cols-2 gap-3 mb-10">
                     {[
                        { id: 'teacher', title: 'Teacher', icon: GraduationCap },
                        { id: 'admin', title: 'Admin', icon: ShieldCheck }
                     ].map((item) => {
                        const RoleIcon = item.icon;
                        return (
                           <button
                              key={item.id}
                              onClick={() => setRole(item.id)}
                              className={`flex flex-col items-center gap-3 py-4 rounded-lgxl border-2 transition-all font-black text-xs uppercase tracking-widest ${role === item.id ? roleStyles[item.id] : 'border-slate-100 text-slate-400 bg-slate-50 hover:bg-slate-100 hover:border-slate-200'}`}
                           >
                              <RoleIcon size={24} />
                              {item.title}
                           </button>
                        );
                     })}
                  </div>

                  {errorMsg && (
                     <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lgxl text-sm font-bold border border-red-100">
                        {errorMsg}
                     </div>
                  )}

                  <form onSubmit={handleLogin} className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-2 px-2">{SITE_CONFIG.login.labelId}</label>
                        <div className="relative">
                           <Key className="absolute left-4 top-4 text-slate-400 shrink-0" size={20} />
                           <input
                              type="text"
                              name="id"
                              value={formData.id}
                              onChange={handleChange}
                              placeholder={SITE_CONFIG.login.placeholderEmployeeId}
                              className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-lgxl font-bold focus:ring-4 focus:ring-indigo-100 focus:bg-white focus:outline-none transition-all placeholder:text-slate-300"
                              required
                           />
                        </div>
                     </div>

                     <div className="space-y-2">
                        <div className="flex justify-between items-center px-4">
                           <label className="text-xs font-black text-slate-500 uppercase tracking-widest">{SITE_CONFIG.login.labelPassword}</label>
                           <Link href="#" className="text-xs font-black text-indigo-700 uppercase tracking-widest hover:underline">{SITE_CONFIG.login.labelForgot}</Link>
                        </div>
                        <div className="relative">
                           <Lock className="absolute left-4 top-4 text-slate-400 shrink-0" size={20} />
                           <input
                              type="password"
                              name="password"
                              value={formData.password}
                              onChange={handleChange}
                              placeholder="••••••••"
                              className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-lgxl font-bold focus:ring-4 focus:ring-indigo-100 focus:bg-white focus:outline-none transition-all placeholder:text-slate-300"
                              required
                           />
                        </div>
                     </div>

                     <button
                        type="submit"
                        disabled={isLoggingIn}
                        className={`w-full text-white font-black py-5 rounded-lgxl text-lg flex items-center justify-center gap-3 shadow-2xl transition-all active:scale-[0.98] ${isLoggingIn ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1'} ${role === 'teacher' ? 'bg-purple-900 shadow-purple-900/40' : 'bg-slate-900 shadow-slate-900/40'}`}
                     >
                        {isLoggingIn ? <><Loader2 className="animate-spin" /> {SITE_CONFIG.login.btnProcessing}</> : `${SITE_CONFIG.login.btnText}${role.toUpperCase()}`}
                        {!isLoggingIn && <ChevronRight size={20} />}
                     </button>
                  </form>

                  <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col items-center">
                     <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">{SITE_CONFIG.login.troubleTag}</p>
                     <div className="flex gap-4">
                        <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lgl text-xs font-black text-slate-600 hover:bg-slate-100">
                           <Mail size={14} /> {SITE_CONFIG.login.btnContactAdmin}
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lgl text-xs font-black text-slate-600 hover:bg-slate-100">
                           <Phone size={14} /> {SITE_CONFIG.login.btnHelpdesk}
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         </section>
      </div>
   );
};

export default Login;
