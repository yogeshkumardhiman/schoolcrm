"use client";

import React from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, ArrowRight } from "lucide-react";
import {
  STRINGS,
  getContactPhone,
  getContactEmail,
  getSchoolAddress
} from "@/constants/strings";

const ContactCards = ({ schoolDetails }) => {
  const phone = getContactPhone(schoolDetails);
  const phone2 = schoolDetails?.contactPhone2 || null;
  const email = getContactEmail(schoolDetails);
  const email2 = schoolDetails?.contactEmail2 || null;
  const address = getSchoolAddress(schoolDetails);
  const schoolName = schoolDetails?.schoolName || schoolDetails?.name || "";
  const visitingHours = schoolDetails?.visitingHours || schoolDetails?.contact_config?.visitingHours || "Mon – Sat: 08:00 AM – 03:00 PM";
  const googleMapsDirectLink = `https://maps.google.com/?q=${encodeURIComponent(address || schoolName)}`;

  const cards = [
    {
      icon: Phone,
      tag: STRINGS.contact.callDeskTag || "ADMISSIONS HELPLINE",
      title: STRINGS.contact.admissionsHelplineTitle || "Call Desk",
      color: "var(--primary)",
      bgColor: "bg-blue-50/80",
      borderColor: "border-blue-100",
      content: (
        <div className="space-y-1">
          <p className="text-base font-extrabold text-[#0F172A] font-mono tracking-tight">{phone}</p>
          {phone2 && <p className="text-xs font-bold text-slate-500 font-mono">{phone2}</p>}
        </div>
      ),
      link: `tel:${phone.replace(/[^0-9+]/g, "")}`,
      label: STRINGS.contact.callDirectlyLabel || "Call Admissions Desk"
    },
    {
      icon: Mail,
      tag: STRINGS.contact.emailDeskTag || "EMAIL DESK",
      title: STRINGS.contact.emailDeskTitle || "Official Inbox",
      color: "#9333EA",
      bgColor: "bg-purple-50/80",
      borderColor: "border-purple-100",
      content: (
        <div className="space-y-1">
          <p className="text-sm font-bold text-[#0F172A] truncate">{email}</p>
          {email2 && <p className="text-xs text-slate-500 truncate font-medium">{email2}</p>}
        </div>
      ),
      link: `mailto:${email}`,
      label: STRINGS.contact.sendEmailLabel || "Send Official Email"
    },
    {
      icon: MapPin,
      tag: STRINGS.contact.locationDeskTag || "MAIN CAMPUS",
      title: STRINGS.contact.locationDeskTitle || "Campus Address",
      color: "#059669",
      bgColor: "bg-emerald-50/80",
      borderColor: "border-emerald-100",
      content: (
        <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-2">{address}</p>
      ),
      link: googleMapsDirectLink,
      target: "_blank",
      label: STRINGS.contact.viewMapsLabel || "Open Directions Map"
    },
    {
      icon: Clock,
      tag: STRINGS.contact.hoursDeskTag || "VISITING HOURS",
      title: STRINGS.contact.hoursDeskTitle || "Reception Timings",
      color: "#D97706",
      bgColor: "bg-amber-50/80",
      borderColor: "border-amber-100",
      content: (
        <p className="text-xs text-slate-600 font-medium leading-relaxed">{visitingHours}</p>
      ),
      footer: STRINGS.contact.sundayClosedLabel || "Closed on Sundays & Gazetted Holidays"
    }
  ];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08 }}
          className="p-7 rounded-3xl border border-slate-200/90 bg-white space-y-4 hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col justify-between group"
        >
          <div className="space-y-4">
            <div className={`w-13 h-13 rounded-2xl ${card.bgColor} ${card.borderColor} border flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}>
              <card.icon size={24} style={{ color: card.color }} />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: card.color }}>{card.tag}</p>
              <h3 className="text-lg font-extrabold text-[#0F172A] tracking-tight">{card.title}</h3>
            </div>
            {card.content}
          </div>

          <div className="pt-3 border-t border-slate-100">
            {card.link ? (
              <a
                href={card.link}
                target={card.target || "_self"}
                rel="noopener noreferrer"
                className="text-xs font-bold flex items-center gap-1.5 hover:underline"
                style={{ color: card.color }}
              >
                <span>{card.label}</span>
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </a>
            ) : (
              <span className="text-xs font-bold text-amber-600 block">
                {card.footer}
              </span>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ContactCards;
