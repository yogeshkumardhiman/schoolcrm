"use client";

import React, { useState, useEffect } from "react";
import { fetchSchoolInfo } from "@/services/school";
import CareerHero from "@/components/career/CareerHero";
import CareerPerks from "@/components/career/CareerPerks";
import CareerVacancies from "@/components/career/CareerVacancies";
import CareerApplicationForm from "@/components/career/CareerApplicationForm";


export default function Career() {
  const [schoolInfo, setSchoolInfo] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [selectedPosition, setSelectedPosition] = useState("");
  const [hrConfig, setHrConfig] = useState(null);

  useEffect(() => {
    fetchSchoolInfo().then((data) => {
      if (data) {
        setSchoolInfo(data);
        if (data.careers_config?.jobs && Array.isArray(data.careers_config.jobs) && data.careers_config.jobs.length > 0) {
          setJobs(data.careers_config.jobs);
        }
        if (data.careers_config?.hrConfig) {
          setHrConfig((prev) => ({ ...prev, ...data.careers_config.hrConfig }));
        }
      }
    }).catch(err => console.error("[Career] Error loading school info:", err));
  }, []);

  const handleApplyClick = (jobTitle) => {
    setSelectedPosition(jobTitle);
    const formEl = document.getElementById("apply-form");
    if (formEl) {
      formEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="bg-[#FFFFFF] min-h-screen text-[#0F172A] font-sans antialiased selection:bg-[var(--primary)] selection:text-white">
      <CareerHero schoolInfo={schoolInfo} hrConfig={hrConfig} />
      <CareerPerks />
      <CareerVacancies jobs={jobs} onApplyClick={handleApplyClick} />
      <CareerApplicationForm schoolInfo={schoolInfo} hrConfig={hrConfig} initialPosition={selectedPosition} />
    </div>
  );
}
