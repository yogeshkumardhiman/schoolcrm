"use client";

import React, { useState, useEffect } from "react";
import { fetchSchoolInfo } from "@/services/school";
import AboutHero from "@/components/about/AboutHero";
import AboutNarrative from "@/components/about/AboutNarrative";
import AboutLeadershipDesk from "@/components/about/AboutLeadershipDesk";
import AboutCodeOfConduct from "@/components/about/AboutCodeOfConduct";
import AboutPillars from "@/components/about/AboutPillars";
import AboutCTA from "@/components/about/AboutCTA";

export default function About() {
  const [schoolData, setSchoolData] = useState(null);
  const [rules, setRules] = useState([]);
  const [pillars, setPillars] = useState([]);
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    fetchSchoolInfo().then((data) => {
      if (data) {
        setSchoolData(data);
        if (Array.isArray(data.about_config?.schoolRules)) {
          setRules(data.about_config.schoolRules);
        }
        if (Array.isArray(data.whyChooseUs) && data.whyChooseUs.length > 0) {
          setPillars(data.whyChooseUs);
        } else if (Array.isArray(data.about_config?.whyChooseUs)) {
          setPillars(data.about_config.whyChooseUs);
        }

        // Aggregate leadership desk
        // Source 1: director_message array (from Leadership Desk admin page)
        // Source 2: principalName/principalImage from About admin page (higher priority for Principal slot)
        const schoolNameForSanitize = (data.schoolName || data.name || '').trim();
        const sanitize = (text) => !text ? text :
          text.replace(/S\.D\.M\.\s*Public\s*School|SDM\s*Public\s*School|S\.D\.M\./gi, schoolNameForSanitize || 'our school');

        const principalName = (data.principalName || data.about_config?.principalName || "").trim();
        const principalMessage = (data.principalMessage || data.about_config?.principalMessage || "").trim();
        const principalImage = data.principalImage || data.about_config?.principalImage || "";
        const principalDesignation = data.principalDesignation || data.about_config?.principalDesignation || "School Principal & Head of Institution";
        const principalQuote = data.principalQuote || data.about_config?.principalQuote || "";

        const leaderList = [];

        if (principalName) {
          leaderList.push({
            id: "principal",
            name: principalName,
            designation: principalDesignation,
            quote: sanitize(principalQuote),
            message: sanitize(principalMessage),
            photo: principalImage
          });
        }

        setLeaders(leaderList);
      }
    }).catch(err => console.error("[About] Error loading school info:", err));
  }, []);

  return (
    <div className="bg-[#F8FAFC] min-h-screen selection:bg-[var(--primary)] selection:text-white text-[#0F172A] antialiased overflow-x-hidden pt-0 pb-36 font-sans">
      <AboutHero schoolData={schoolData} />

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-16 space-y-24">
        <AboutNarrative schoolData={schoolData} />
        <AboutLeadershipDesk schoolData={schoolData} leaders={leaders} />
        <AboutCodeOfConduct rules={rules} />
        <AboutPillars pillars={pillars} />
        <AboutCTA schoolData={schoolData} />
      </div>
    </div>
  );
}
