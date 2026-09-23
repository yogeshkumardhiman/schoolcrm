"use client";

import React, { useState, useEffect } from 'react';
import { fetchSchoolInfo, fetchNotices } from '@/services/api';

import NoticeTicker from '@/components/home/NoticeTicker';
import HeroSlider from '@/components/home/HeroSlider';
import StatsSection from '@/components/home/StatsSection';
import AboutSection from '@/components/home/AboutSection';
import WhySection from '@/components/home/WhySection';
import AcademicsSection from '@/components/home/AcademicsSection';
import FacilitiesSection from '@/components/home/FacilitiesSection';
import DirectorMessageSection from '@/components/home/DirectorMessageSection';
import ToppersGallery from '@/components/home/ToppersGallery';
import GallerySection from '@/components/home/GallerySection';
import CampusTourVideo from '@/components/home/CampusTourVideo';
import LatestNewsSection from '@/components/home/LatestNewsSection';
import UpcomingEventsSection from '@/components/home/UpcomingEventsSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import HomeFaqSection from '@/components/home/HomeFaqSection';
import AdmissionProcess from '@/components/home/AdmissionProcess';
import CTASection from '@/components/home/CTASection';
import HomeSkeleton from '@/components/home/HomeSkeleton';

const Home = () => {
   const [schoolInfo, setSchoolInfo] = useState(null);
   const [notices, setNotices] = useState([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      Promise.allSettled([
         fetchSchoolInfo(),
         fetchNotices()
      ]).then(([schoolRes, noticesRes]) => {
         if (schoolRes.status === 'fulfilled' && schoolRes.value) {
            setSchoolInfo(schoolRes.value);
         }
         if (noticesRes.status === 'fulfilled' && noticesRes.value) {
            const results = noticesRes.value?.notices || noticesRes.value;
            if (Array.isArray(results)) setNotices(results);
         }
      }).catch(err => console.error("[Home] Load error:", err))
      .finally(() => setLoading(false));
   }, []);

   const renderSection = (sectionId) => {
      switch (sectionId) {
         case 'notice-ticker':
            return <NoticeTicker key="notice-ticker" schoolInfo={schoolInfo} notices={notices} />;
         case 'hero-slider':
            return <HeroSlider key="hero-slider" schoolInfo={schoolInfo} />;
         case 'stats':
            return <StatsSection key="stats" schoolInfo={schoolInfo} />;
         case 'about':
            return <AboutSection key="about" schoolInfo={schoolInfo} />;
         case 'why-choose-us':
            return <WhySection key="why-choose-us" schoolInfo={schoolInfo} />;
         case 'academics':
            return <AcademicsSection key="academics" schoolInfo={schoolInfo} />;
         case 'facilities':
            return <FacilitiesSection key="facilities" schoolInfo={schoolInfo} />;
         case 'director-message':
            return <DirectorMessageSection key="director-message" schoolInfo={schoolInfo} />;
         case 'toppers':
            return <ToppersGallery key="toppers" schoolInfo={schoolInfo} />;
         case 'gallery':
            return <GallerySection key="gallery" schoolInfo={schoolInfo} />;
         case 'video-tour':
            return <CampusTourVideo key="video-tour" schoolInfo={schoolInfo} />;
         case 'news':
            return <LatestNewsSection key="news" notices={notices} schoolInfo={schoolInfo} />;
         case 'events':
            return <UpcomingEventsSection key="events" notices={notices} schoolInfo={schoolInfo} />;
         case 'testimonials':
            return <TestimonialsSection key="testimonials" schoolInfo={schoolInfo} />;
         case 'faq':
            return <HomeFaqSection key="faq" schoolInfo={schoolInfo} />;
         case 'timeline':
            return <AdmissionProcess key="timeline" schoolInfo={schoolInfo} />;
         case 'cta':
            return <CTASection key="cta" schoolInfo={schoolInfo} />;
         default:
            return null;
      }
   };

   const defaultLayout = [
      "notice-ticker",
      "hero-slider",
      "stats",
      "about",
      "why-choose-us",
      "academics",
      "facilities",
      "director-message",
      "toppers",
      "gallery",
      "video-tour",
      "news",
      "events",
      "testimonials",
      "faq",
      "timeline",
      "cta"
   ];

   const layout = schoolInfo?.homepage_layout && schoolInfo.homepage_layout.length > 0
      ? schoolInfo.homepage_layout
      : defaultLayout;

   if (loading && !schoolInfo) {
      return <HomeSkeleton />;
   }

   return (
      <div className="bg-white selection:bg-indigo-600 selection:text-white font-body">
         {layout.map(sectionId => renderSection(sectionId))}
      </div>
   );
};

export default Home;