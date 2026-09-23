"use client";

import React, { useEffect, useState } from "react";
import { Phone, Mail, MapPin } from "lucide-react";
import Navbar from "@/components/layout/app-navbar";
import Footer from "@/components/layout/app-footer";
import { fetchSchoolInfo } from "@/services/school";

const TopInfoBar = ({ topInfoBar }) => {
  if (!topInfoBar) return null;
  return (
    <div className="bg-slate-950 border-b border-white/10 text-white/80 py-2.5 px-6 text-xs transition-colors hidden md:block" style={{ backgroundColor: 'var(--primary, #090D1A)' }}>
      <div className="max-w-[1600px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6 font-medium">
          {topInfoBar.phone && (
            <a href={`tel:${topInfoBar.phone}`} className="flex items-center gap-1.5 hover:text-white transition">
              <Phone size={12} /> {topInfoBar.phone}
            </a>
          )}
          {topInfoBar.email && (
            <a href={`mailto:${topInfoBar.email}`} className="flex items-center gap-1.5 hover:text-white transition">
              <Mail size={12} /> {topInfoBar.email}
            </a>
          )}
          {topInfoBar.address && (
            <span className="flex items-center gap-1.5 opacity-90">
              <MapPin size={12} /> {topInfoBar.address}
            </span>
          )}
        </div>
     
      </div>
    </div>
  );
};

export const Layout = ({ children }) => {
  const [schoolDetails, setSchoolDetails] = useState(null);

  useEffect(() => {
    fetchSchoolInfo()
      .then((data) => {
        if (data) {
          setSchoolDetails(data);

          const primary = data.primaryColor || data.theme_config?.primary || '#1E3A8A';
          const secondary = data.secondaryColor || data.theme_config?.secondary || '#3B82F6';
          const accent = data.accentColor || data.theme_config?.accent || '#EF4444';

          document.documentElement.style.setProperty('--primary', primary);
          document.documentElement.style.setProperty('--secondary', secondary);
          document.documentElement.style.setProperty('--accent', accent);
          document.documentElement.style.setProperty('--button', primary);
          document.documentElement.style.setProperty('--buttonHover', secondary);

          if (data.theme_config) {
            Object.entries(data.theme_config).forEach(([key, value]) => {
              if (value && key !== 'primary' && key !== 'secondary') {
                document.documentElement.style.setProperty(`--${key}`, value);
              }
            });
          }
        }
      })
      .catch(console.error);
  }, []);

  const topInfoBar = schoolDetails?.top_info_bar || (schoolDetails ? {
    phone: schoolDetails.contactPhone || schoolDetails.phone ,
    email: schoolDetails.contactEmail || schoolDetails.email,
    address: schoolDetails.address ,
    showAdmissionOpen: true,
    loginUrl: "/login"
  } : null);

  const floatingButtons = schoolDetails?.floating_buttons || (schoolDetails ? {
    showWhatsapp: true,
    whatsappNumber: schoolDetails.phone,
    showCall: true,
    callNumber: schoolDetails.phone,
    showApply: true
  } : null);

  return (
    <>
      <TopInfoBar topInfoBar={topInfoBar} />
      <Navbar schoolDetails={schoolDetails} />
      <main>{children}</main>
      <Footer schoolDetails={schoolDetails} />

      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-3.5 items-center">
        {floatingButtons?.showWhatsapp && (
          <a
            href={`https://wa.me/${floatingButtons.whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center justify-center hover:scale-110 shadow-xl hover:shadow-2xl transition-all duration-300 active:scale-95 group cursor-pointer"
            title="WhatsApp Support"
            aria-label="WhatsApp Support"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.003 5.324 5.328 0 11.859 0c3.166.001 6.141 1.233 8.377 3.469 2.235 2.237 3.465 5.212 3.464 8.384-.003 6.536-5.328 11.86-11.859 11.86-2.003-.001-3.973-.508-5.729-1.472L0 24zm6.59-4.846c1.62.962 3.204 1.488 4.88 1.489 5.342 0 9.69-4.348 9.693-9.692.002-2.59-1.004-5.024-2.836-6.857C16.49 2.261 14.061 1.256 11.86 1.256 6.515 1.256 2.167 5.603 2.164 10.95c-.001 1.763.473 3.328 1.378 4.896l-.97 3.544 3.635-.954zm10.93-4.57c-.27-.136-1.602-.79-1.852-.881-.25-.091-.43-.136-.61.136-.18.27-.698.881-.857 1.066-.16.186-.318.21-.588.073-.27-.136-1.14-.42-2.17-1.34-.8-.713-1.34-1.594-1.5-1.866-.16-.27-.017-.417.118-.552.122-.121.27-.315.405-.471.135-.157.18-.27.27-.45.09-.18.045-.339-.022-.475-.068-.136-.61-1.472-.836-2.015-.22-.53-.44-.457-.61-.466-.157-.008-.338-.01-.519-.01-.18 0-.473.068-.72.339-.248.271-.946.925-.946 2.256 0 1.33.968 2.613 1.104 2.793.135.18 1.903 2.906 4.609 4.075.644.278 1.148.445 1.54.57.647.206 1.236.177 1.701.108.518-.077 1.602-.656 1.828-1.288.225-.632.225-1.175.157-1.288-.068-.113-.248-.18-.518-.316z" />
            </svg>
          </a>
        )}
        {floatingButtons?.showCall && (
          <a
            href={`tel:${floatingButtons.callNumber}`}
            className="w-14 h-14 rounded-full bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center hover:scale-110 shadow-xl hover:shadow-2xl transition-all duration-300 active:scale-95 group cursor-pointer border border-slate-700/50"
            title="Call Support"
            aria-label="Call Support"
          >
            <Phone size={26} strokeWidth={2.2} />
          </a>
        )}
      </div>
    </>
  );
};

export default Layout;