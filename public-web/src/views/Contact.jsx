"use client";

import React, { useState, useEffect } from "react";
import { fetchSchoolInfo } from "@/services/school";

import ContactHero from "@/components/contact/ContactHero";
import ContactCards from "@/components/contact/ContactCards";
import ContactForm from "@/components/contact/ContactForm";
import ContactMap from "@/components/contact/ContactMap";

export default function Contact() {
  const [schoolDetails, setSchoolDetails] = useState(null);

  useEffect(() => {
    fetchSchoolInfo().then((data) => {
      if (data) setSchoolDetails(data);
    }).catch(err => console.error("[Contact] Error fetching school info:", err));
  }, []);

  return (
    <div className="bg-[#F8FAFC] min-h-screen selection:bg-[var(--primary)] selection:text-white text-[#0F172A] antialiased overflow-x-hidden pt-24 pb-36 font-sans">
      <ContactHero schoolDetails={schoolDetails} />

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-16 space-y-20">
        <ContactCards schoolDetails={schoolDetails} />
        <ContactForm schoolDetails={schoolDetails} />
        <ContactMap schoolDetails={schoolDetails} />
      </div>
    </div>
  );
}