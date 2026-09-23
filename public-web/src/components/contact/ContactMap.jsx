"use client";

import React from "react";
import { MapPin, ArrowRight } from "lucide-react";
import { STRINGS, getSchoolName, getSchoolAddress } from "@/constants/strings";

const ContactMap = ({ schoolDetails }) => {
  const address = getSchoolAddress(schoolDetails);
  const schoolName = getSchoolName(schoolDetails);

  const mapEmbedUrl = schoolDetails?.mapEmbedUrl || schoolDetails?.contact_config?.mapEmbedUrl || `https://maps.google.com/maps?q=${encodeURIComponent(address || schoolName)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  const googleMapsDirectLink = `https://maps.google.com/?q=${encodeURIComponent(address || schoolName)}`;

  return (
    <section className="rounded-3xl border border-slate-200/90 bg-white p-8 sm:p-10 space-y-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 text-emerald-600 text-xs font-extrabold uppercase tracking-wider">
            <MapPin size={15} />
            <span>{STRINGS.contact.mapDirectionsTag || "CAMPUS MAP & NAVIGATION"}</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            {STRINGS.contact.visitCampusTitle || "Visit Our Campus"}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-xl">
            {address}
          </p>
        </div>
        <a
          href={googleMapsDirectLink}
          target="_blank"
          rel="noopener noreferrer"
          className="h-12 px-6 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 shrink-0 self-start sm:self-auto cursor-pointer transition-all shadow-xs"
        >
          <span>{STRINGS.contact.openGoogleMapsBtn || "Open Google Maps"}</span>
          <ArrowRight size={14} />
        </a>
      </div>

      {/* Dynamic Map Frame */}
      <div className="w-full h-72 sm:h-96 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 relative shadow-inner">
        <iframe
          title={`${schoolName} Location`}
          src={mapEmbedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </section>
  );
};

export default ContactMap;
