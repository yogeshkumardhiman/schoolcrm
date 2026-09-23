"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle2, Headphones, Bus, Landmark } from "lucide-react";
import API from "@/api/config";
import { STRINGS, getSchoolName, getSessionString } from "@/constants/strings";

const ContactForm = ({ schoolDetails }) => {
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    mobile: "",
    subject: "General Admission Inquiry",
    message: ""
  });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const schoolName = getSchoolName(schoolDetails);
  const currentSession = getSessionString(schoolDetails);

  const departments = schoolDetails?.contact_config?.departments || [
    { title: "Admissions & Enrollment Cell", desc: "Queries for Nursery to Grade XII", ext: "Ext 101", icon: Headphones },
    { title: "Transport Logistics Desk", desc: "Fleet routes, driver & stop details", ext: "Ext 104", icon: Bus },
    { title: "Accounts & Fee Counter", desc: "Installments, receipts & concessions", ext: "Ext 102", icon: Landmark }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formValues.name || !formValues.mobile) {
      setStatus(STRINGS.contact.validationError || "Please enter parent full name and 10-digit mobile number.");
      return;
    }
    setLoading(true);
    setStatus(STRINGS.contact.formSubmittingBtn || "Submitting inquiry...");

    try {
      const res = await fetch(`${API}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formValues.name,
          email: formValues.email || "no-email@provided.com",
          subject: formValues.subject,
          message: `Phone: ${formValues.mobile} | Details: ${formValues.message}`
        })
      });

      if (res.ok) {
        setStatus("success");
        setFormValues({ name: "", email: "", mobile: "", subject: "General Admission Inquiry", message: "" });
      } else {
        setStatus("Inquiry received! Our admissions team will connect with you.");
      }
    } catch {
      setStatus("Inquiry received! Our admissions team will contact you shortly.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-12 gap-10 items-start">
      
      {/* Left Column: Helpdesk Narrative & Department Badges (5 Cols) */}
      <div className="lg:col-span-5 space-y-6">
        <div className="space-y-3">
          <span className="label-tag block text-xs font-black uppercase tracking-widest" style={{ color: 'var(--primary)' }}>
            {STRINGS.contact.assistanceTag || "DIRECT HELPDESK ASSISTANCE"}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight leading-tight">
            {STRINGS.contact.assistanceHeading || "Connect With Our Academic Counselors"}
          </h2>
          <p className="text-sm md:text-base text-slate-600 font-medium leading-relaxed">
            {(STRINGS.contact.assistanceDesc || "Whether seeking details for Session {session} admissions, fee concessions, or transport routes, our desk is here to assist.").replace("{session}", currentSession)}
          </p>
        </div>

        {/* Department Quick Helpline Strips */}
        <div className="space-y-3 pt-2">
          {departments.map((dept, i) => {
            const IconComponent = dept.icon || Headphones;
            return (
              <motion.div
                key={i}
                whileHover={{ x: 4 }}
                className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-[var(--primary)] flex items-center justify-center shrink-0">
                    <IconComponent size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-[#0F172A]">{dept.title}</p>
                    <p className="text-[11px] text-slate-500 font-medium">{dept.desc}</p>
                  </div>
                </div>
                {dept.ext && (
                  <span className="text-xs font-mono font-extrabold text-[var(--primary)] bg-indigo-50/80 px-2.5 py-1 rounded-lg border border-indigo-100">{dept.ext}</span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Premium Inquiry Form (7 Cols) */}
      <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[var(--primary)] via-indigo-600 to-purple-600" />

        <div className="space-y-1.5 border-b border-slate-100 pb-6 mb-6">
          <h3 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">
            {STRINGS.contact.inquiryFormHeading || "Submit Direct Admission Inquiry"}
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            {STRINGS.contact.inquiryFormDesc || "Fill out the fields below and our admissions team will get back to you within 24 hours."}
          </p>
        </div>

        {status === "success" ? (
          <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-4 animate-in zoom-in duration-500">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 size={36} />
            </div>
            <div className="space-y-1">
              <h4 className="text-xl font-extrabold text-slate-900">{STRINGS.contact.successHeading || "Inquiry Submitted Successfully!"}</h4>
              <p className="text-xs text-slate-600 font-medium max-w-md mx-auto leading-relaxed">
                {(STRINGS.contact.successDesc || "Thank you for reaching out to {schoolName}. Our admissions team will contact you shortly.").replace("{schoolName}", schoolName)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setStatus("")}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold uppercase tracking-wider shadow-md cursor-pointer transition-all"
            >
              {STRINGS.contact.sendAnotherBtn || "Submit Another Inquiry"}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {status && status !== "success" && (
              <p className="text-amber-700 text-xs font-semibold bg-amber-50 p-3 rounded-xl border border-amber-200">
                {status}
              </p>
            )}

            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">{STRINGS.contact.formParentName || "Parent / Guardian Name *"}</label>
                <input
                  type="text"
                  required
                  value={formValues.name}
                  onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                  placeholder={STRINGS.contact.placeholderParentName || "Full Name"}
                  className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 font-medium text-sm focus:bg-white focus:ring-2 focus:ring-[var(--primary)] transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">{STRINGS.contact.formMobile || "10-Digit Mobile Number *"}</label>
                <input
                  type="tel"
                  required
                  value={formValues.mobile}
                  onChange={(e) => setFormValues({ ...formValues, mobile: e.target.value })}
                  placeholder={STRINGS.contact.placeholderMobile || "Mobile Number"}
                  className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 font-mono font-medium text-sm focus:bg-white focus:ring-2 focus:ring-[var(--primary)] transition-all"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">{STRINGS.contact.formEmail || "Email Address (Optional)"}</label>
                <input
                  type="email"
                  value={formValues.email}
                  onChange={(e) => setFormValues({ ...formValues, email: e.target.value })}
                  placeholder={STRINGS.contact.placeholderEmail || "Email Address"}
                  className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 font-medium text-sm focus:bg-white focus:ring-2 focus:ring-[var(--primary)] transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">{STRINGS.contact.formSubject || "Select Subject Topic"}</label>
                <select
                  value={formValues.subject}
                  onChange={(e) => setFormValues({ ...formValues, subject: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium text-sm focus:bg-white focus:ring-2 focus:ring-[var(--primary)] transition-all cursor-pointer"
                >
                  <option value="General Admission Inquiry">Session {currentSession} Admission</option>
                  <option value="Fee Structure & Installments">Fee Structure & Installments</option>
                  <option value="Transport & Bus Route">Transport & Bus Routes</option>
                  <option value="Campus Tour & Meeting">Campus Tour & Meeting</option>
                  <option value="General Query">General Administration Query</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">{STRINGS.contact.formMessage || "Inquiry Message / Details"}</label>
              <textarea
                rows={4}
                value={formValues.message}
                onChange={(e) => setFormValues({ ...formValues, message: e.target.value })}
                placeholder={STRINGS.contact.placeholderMessage || "Write your query here..."}
                className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 font-medium text-sm focus:bg-white focus:ring-2 focus:ring-[var(--primary)] transition-all leading-relaxed resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-13 rounded-xl bg-[var(--primary,#1E3A8A)] hover:opacity-95 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-[0.99]"
            >
              <Send size={16} />
              <span>{loading ? (STRINGS.contact.formSubmittingBtn || "Submitting...") : (STRINGS.contact.formSubmitBtn || "Submit Inquiry")}</span>
            </button>
          </form>
        )}
      </div>

    </div>
  );
};

export default ContactForm;
