"use client";

import React from 'react';
import {
   Accordion,
   AccordionContent,
   AccordionItem,
   AccordionTrigger,
} from "@/components/ui/accordion";

const AdmissionFaq = ({ schoolInfo }) => {
   const resolvedName = (schoolInfo?.schoolName || schoolInfo?.name || '').trim();
   const cleanText = (txt) => (txt || '').replace(/S\.D\.M\.|SDM/gi, resolvedName || 'our school').replace(/\s+/g, ' ').trim();

   const defaultFaqs = [
      { q: "What is the minimum age criteria for Nursery admission?", a: "The child should be 3+ years of age as on 31st March of the academic admission session." },
      { q: "What documents are required during enrollment?", a: "Birth Certificate, previous class Transfer Certificate (TC) / Report Card, Aadhaar card copies, and passport size photographs." },
      { q: "Is GPS-monitored school bus transport available?", a: "Yes, dedicated school buses cover all major routes with trained staff and real-time security tracking." }
   ];

   const faqs = schoolInfo?.faqs_config || defaultFaqs;

   if (!faqs || faqs.length === 0) return null;

   return (
      <section className="py-24 lg:py-40 bg-white">
         <div className="container mx-auto px-6 max-w-4xl">
            <div className="text-center mb-20">
               <span className="text-indigo-600 font-black uppercase tracking-[10px] text-[10px] block mb-4 text-center">ADMISSIONS FAQ</span>
               <h2 className="text-4xl lg:text-5xl font-bold text-[#0F172A] tracking-tight mb-20 text-center">Frequently Asked Questions</h2>
            </div>
            <Accordion type="single" collapsible className="w-full space-y-6">
               {faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`item-${i}`} className="bg-white border border-slate-200 rounded-[30px] px-10 py-2 shadow-sm data-[state=open]:shadow-massive data-[state=open]:border-indigo-100 transition-all duration-500">
                     <AccordionTrigger className="hover:no-underline py-6 text-left font-bold text-[#0F172A] text-xl lg:text-2xl tracking-tight leading-tight">
                        {cleanText(faq.q)}
                     </AccordionTrigger>
                     <AccordionContent className="text-slate-500 font-medium text-lg pb-10 leading-relaxed italic pt-8 border-t border-slate-50">
                        "{cleanText(faq.a)}"
                     </AccordionContent>
                  </AccordionItem>
               ))}
            </Accordion>
         </div>
      </section>
   );
};

export default AdmissionFaq;
