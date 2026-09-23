"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Users, Award, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
   Form,
   FormControl,
   FormField,
   FormItem,
   FormLabel,
   FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import {
   Card,
   CardContent,
   CardDescription,
   CardHeader,
   CardTitle,
   CardFooter,
} from "@/components/ui/card";
import { submitInquiry } from '@/services/api';

const formSchema = z.object({
   studentName: z.string().min(2, { message: "Student name is required." }),
   parentName: z.string().min(2, { message: "Guardian name is required." }),
   class: z.string().min(1, { message: "Select grade level." }),
   mobile: z.string().length(10, { message: "Enter valid 10-digit mobile number." }),
});

const AdmissionHero = ({ sessionTag, heroDesc, schoolInfo }) => {
   const [submitted, setSubmitted] = useState(false);
   const [loading, setLoading] = useState(false);
   const resolvedName = (schoolInfo?.schoolName || schoolInfo?.name || '').trim();

   const form = useForm({
      resolver: zodResolver(formSchema),
      defaultValues: {
         studentName: "",
         parentName: "",
         class: "",
         mobile: "",
      },
   });

   const onSubmit = async (values) => {
      setLoading(true);
      try {
         const result = await submitInquiry(values);
         if (result) {
            setSubmitted(true);
            setTimeout(() => setSubmitted(false), 8000);
         }
      } catch (e) {
         console.error(e);
      } finally {
         setLoading(false);
      }
   };

   return (
      <section className="relative pt-32 pb-16 lg:pt-36 lg:pb-24 bg-gradient-to-b from-slate-100/80 via-slate-50 to-white border-b border-slate-200/80 overflow-hidden">
         <div className="container mx-auto px-6 max-w-7xl relative z-10">
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">

               {/* LEFT SIDE HERO TEXT */}
               <motion.div
                  initial={{ opacity: 0, x: -25 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className="lg:col-span-7 space-y-6"
               >
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-full text-[var(--primary)] font-bold uppercase tracking-wider text-xs shadow-xs">
                     <Sparkles size={14} className="text-amber-500 animate-pulse" />
                     <span>{resolvedName ? `${resolvedName.toUpperCase()} • ` : ''}SESSION {sessionTag || "2026-27"} ADMISSIONS OPEN</span>
                  </div>

                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0F172A] leading-[1.15] tracking-tight">
                     Empowering Minds, <br />
                     <span className="bg-gradient-to-r from-[var(--primary)] via-indigo-600 to-purple-600 bg-clip-text text-transparent">Shaping Future Leaders.</span>
                  </h1>

                  <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl font-medium border-l-4 pl-5 border-[var(--primary)]">
                     {heroDesc || `Welcome to ${resolvedName || 'our academy'}. We provide quality CBSE education combining modern digital learning labs, experienced faculty mentors, and sports excellence.`}
                  </p>

                  <div className="grid sm:grid-cols-2 gap-4 pt-2 max-w-lg">
                     <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-[var(--primary)] shrink-0">
                           <Users size={20} />
                        </div>
                        <div>
                           <p className="text-xs font-extrabold text-slate-900">Active Alumni Network</p>
                           <p className="text-[11px] text-slate-500 font-medium">Pan-India & Global Reach</p>
                        </div>
                     </div>

                     <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                           <Award size={20} />
                        </div>
                        <div>
                           <p className="text-xs font-extrabold text-slate-900">CBSE Curriculum</p>
                           <p className="text-[11px] text-slate-500 font-medium">Top Academic Standards</p>
                        </div>
                     </div>
                  </div>
               </motion.div>

               {/* RIGHT SIDE FORM CARD */}
               <motion.div
                  id="apply"
                  initial={{ opacity: 0, x: 25 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.15 }}
                  className="lg:col-span-5 scroll-mt-28"
               >
                  <Card className="border border-slate-200 shadow-2xl rounded-3xl overflow-hidden bg-white relative">
                     <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[var(--primary)] via-indigo-600 to-purple-600" />
                     <CardHeader className="p-7 sm:p-8 text-center border-b border-slate-100 bg-slate-50/50">
                        <CardTitle className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Admission Inquiry Portal</CardTitle>
                        <CardDescription className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider mt-1">Direct Registration Desk</CardDescription>
                     </CardHeader>

                     <CardContent className="p-7 sm:p-8">
                        {submitted ? (
                           <div className="py-12 text-center space-y-6 animate-in zoom-in duration-500">
                              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner"><CheckCircle2 size={40} /></div>
                              <div className="space-y-2">
                                 <h4 className="text-xl font-bold text-slate-900">Inquiry Submitted Successfully!</h4>
                                 <p className="text-sm text-slate-600 font-medium">Thank you for reaching out. Our admissions counselor will contact you shortly.</p>
                              </div>
                              <Button onClick={() => setSubmitted(false)} variant="outline" className="rounded-xl border-slate-200 uppercase font-bold text-xs tracking-wider h-12 px-6">Submit Another Inquiry</Button>
                           </div>
                        ) : (
                           <Form {...form}>
                              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                 <div className="grid sm:grid-cols-2 gap-4">
                                    <FormField
                                       control={form.control}
                                       name="studentName"
                                       render={({ field }) => (
                                          <FormItem className="space-y-1">
                                             <FormLabel className="text-xs font-bold text-slate-700">Student Full Name</FormLabel>
                                             <FormControl>
                                                <Input placeholder="Full name" className="h-12 bg-slate-50 border-slate-200 rounded-xl font-medium text-slate-900 px-4 text-sm focus:bg-white transition-all" {...field} />
                                             </FormControl>
                                             <FormMessage />
                                          </FormItem>
                                       )}
                                    />
                                    <FormField
                                       control={form.control}
                                       name="class"
                                       render={({ field }) => (
                                          <FormItem className="space-y-1">
                                             <FormLabel className="text-xs font-bold text-slate-700">Applying For Grade</FormLabel>
                                             <FormControl>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                   <SelectTrigger className="h-12 bg-slate-50 border-slate-200 rounded-xl font-medium text-slate-900 px-4 text-sm">
                                                      <SelectValue placeholder="Select Grade" />
                                                   </SelectTrigger>
                                                   <SelectContent className="bg-white border-slate-200 rounded-xl shadow-xl">
                                                      {['NURSERY', 'LKG', 'UKG', '1ST', '2ND', '3RD', '4TH', '5TH', '6TH', '7TH', '8TH', '9TH', '10TH', '11TH', '12TH'].map(cls => (
                                                         <SelectItem key={cls} value={cls} className="font-semibold text-xs py-2.5">{cls}</SelectItem>
                                                      ))}
                                                   </SelectContent>
                                                </Select>
                                             </FormControl>
                                             <FormMessage />
                                          </FormItem>
                                       )}
                                    />
                                 </div>

                                 <FormField
                                    control={form.control}
                                    name="parentName"
                                    render={({ field }) => (
                                       <FormItem className="space-y-1">
                                          <FormLabel className="text-xs font-bold text-slate-700">Parent / Guardian Name</FormLabel>
                                          <FormControl>
                                             <Input placeholder="Father's or mother's name" className="h-12 bg-slate-50 border-slate-200 rounded-xl font-medium text-slate-900 px-4 text-sm focus:bg-white transition-all" {...field} />
                                          </FormControl>
                                          <FormMessage />
                                       </FormItem>
                                    )}
                                 />

                                 <FormField
                                    control={form.control}
                                    name="mobile"
                                    render={({ field }) => (
                                       <FormItem className="space-y-1">
                                          <FormLabel className="text-xs font-bold text-slate-700">10-Digit Mobile Number</FormLabel>
                                          <FormControl>
                                             <Input placeholder="10-digit mobile number" className="h-12 bg-slate-50 border-slate-200 rounded-xl font-medium text-slate-900 px-4 text-sm focus:bg-white transition-all" {...field} />
                                          </FormControl>
                                          <FormMessage />
                                       </FormItem>
                                    )}
                                 />

                                 <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[var(--primary)] hover:opacity-90 text-white font-bold h-13 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md active:scale-[0.98] group cursor-pointer"
                                 >
                                    {loading ? "Submitting..." : "Submit Admission Inquiry"}
                                    <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                 </Button>
                              </form>
                           </Form>
                        )}
                     </CardContent>

                     <CardFooter className="bg-slate-50 p-4 border-t border-slate-100">
                        <p className="w-full text-center text-[11px] font-bold text-slate-500 flex items-center justify-center gap-1.5">
                           <ShieldCheck size={14} className="text-emerald-600 shrink-0" /> Verified Institutional Form Submission
                        </p>
                     </CardFooter>
                  </Card>
               </motion.div>

            </div>
         </div>
      </section>
   );
};

export default AdmissionHero;
