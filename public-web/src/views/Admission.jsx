"use client";

import React, { useState, useEffect } from 'react';
import { fetchSchoolInfo, fetchFeeStructure } from '@/services/school';
import { getSessionString } from '@/constants/strings';
import AdmissionHero from '@/components/admission/AdmissionHero';
import AdmissionTrustStats from '@/components/admission/AdmissionTrustStats';
import AdmissionWhyChooseUs from '@/components/admission/AdmissionWhyChooseUs';
import AdmissionJourneyTimeline from '@/components/admission/AdmissionJourneyTimeline';
import AdmissionFeeRoadmap from '@/components/admission/AdmissionFeeRoadmap';
import AdmissionFaq from '@/components/admission/AdmissionFaq';

const Admission = () => {
   const [schoolInfo, setSchoolInfo] = useState(null);
   const [feeData, setFeeData] = useState(null);

   useEffect(() => {
      fetchSchoolInfo().then(data => {
         if (data) setSchoolInfo(data);
      }).catch(err => console.error("[Admission] School info load error:", err));

      fetchFeeStructure().then(data => {
         if (data) setFeeData(data);
      }).catch(err => console.error("[Admission] Fee structure load error:", err));
   }, []);

   const session = getSessionString(schoolInfo);

   return (
      <div className="bg-[#FFFFFF] min-h-screen text-[#0F172A] font-sans antialiased selection:bg-[var(--primary)] selection:text-white">
         <AdmissionHero sessionTag={session} heroDesc={schoolInfo?.aboutDescription} />
         <AdmissionTrustStats schoolInfo={schoolInfo} />
         <AdmissionWhyChooseUs schoolInfo={schoolInfo} />
         <AdmissionJourneyTimeline schoolInfo={schoolInfo} />
         <AdmissionFeeRoadmap feeData={feeData} schoolInfo={schoolInfo} />
         <AdmissionFaq schoolInfo={schoolInfo} />
      </div>
   );
};

export default Admission;
