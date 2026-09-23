"use client";

import React, { useState } from "react";
import { Send, CheckCircle2, ShieldCheck, Phone, Mail, Clock, User, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const CareerApplicationForm = ({ schoolInfo, hrConfig, initialPosition }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    qualification: "",
    experience: "2-5 Years",
    position: initialPosition || "PGT - Senior Physics / Mathematics",
    message: "",
    resumeUrl: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const phone = hrConfig?.hrPhone || schoolInfo?.contactPhone || "+91 9761839857";
  const email = hrConfig?.hrEmail || schoolInfo?.contactEmail || "careers@school.in";
  const timings = hrConfig?.walkinTimings || "Mon – Sat (10:00 AM – 2:00 PM)";

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
    }, 1000);
  };

  return (
    <section id="apply-form" className="py-20 lg:py-28 bg-white relative scroll-mt-20">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Direct Walk-in Desk & Contacts */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-3">
              <span className="label-tag block text-xs font-black uppercase tracking-widest" style={{ color: 'var(--primary)' }}>
                Direct Application
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
                Submit Your Credentials
              </h2>
              <p className="text-base text-slate-600 font-medium leading-relaxed">
                Interested candidates can submit their details through our fast-track portal or visit our administrative HR desk for direct walk-in interviews.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/90 space-y-6">
              <h3 className="text-lg font-bold text-[#0F172A] flex items-center gap-2.5">
                <Clock size={20} className="text-[var(--primary)]" />
                <span>Walk-In HR Interview Desk</span>
              </h3>

              <div className="space-y-4 text-sm text-slate-700">
                <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[var(--primary)] flex items-center justify-center shrink-0">
                    <Clock size={18} />
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Desk Timings</div>
                    <div className="text-xs text-slate-600 font-medium">{timings}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[var(--primary)] flex items-center justify-center shrink-0">
                    <Phone size={18} />
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">HR Helpline</div>
                    <a href={`tel:${phone}`} className="text-xs text-[var(--primary)] font-extrabold hover:underline">{phone}</a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[var(--primary)] flex items-center justify-center shrink-0">
                    <Mail size={18} />
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Direct CV Submission Email</div>
                    <a href={`mailto:${email}`} className="text-xs text-[var(--primary)] font-extrabold hover:underline">{email}</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Application Form */}
          <div className="lg:col-span-7">
            <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[var(--primary)] via-indigo-600 to-purple-600" />
              
              <div className="mb-8 border-b border-slate-100 pb-6">
                <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Faculty Application Form</h3>
                <p className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider mt-1">Fast-Track Recruitment Desk</p>
              </div>

              {submitted ? (
                <div className="py-16 text-center space-y-6 animate-in zoom-in duration-500">
                  <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 size={40} />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-2xl font-bold text-slate-900">Application Submitted!</h4>
                    <p className="text-sm text-slate-600 font-medium max-w-md mx-auto">
                      Thank you for your interest. Our HR desk will review your credentials and contact you shortly.
                    </p>
                  </div>
                  <Button
                    onClick={() => setSubmitted(false)}
                    variant="outline"
                    className="rounded-xl border-slate-200 uppercase font-bold text-xs tracking-wider h-12 px-6"
                  >
                    Submit Another Application
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Enter full name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 focus:bg-white transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Email Address *</label>
                      <input
                        type="email"
                        required
                        placeholder="Enter email address"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Mobile Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="10-digit mobile number"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 focus:bg-white transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Highest Qualification *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. M.Sc. Physics + B.Ed."
                        value={form.qualification}
                        onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                        className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Teaching Experience</label>
                      <select
                        value={form.experience}
                        onChange={(e) => setForm({ ...form, experience: e.target.value })}
                        className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 focus:bg-white transition-all"
                      >
                        <option value="Fresher">Fresher (0–1 Year)</option>
                        <option value="1-3 Years">1–3 Years</option>
                        <option value="3-6 Years">3–6 Years</option>
                        <option value="6+ Years">6+ Years</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Position Applying For *</label>
                      <input
                        type="text"
                        required
                        placeholder="Position Title"
                        value={form.position}
                        onChange={(e) => setForm({ ...form, position: e.target.value })}
                        className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Resume Cloud Link (Optional)</label>
                    <input
                      type="url"
                      placeholder="Paste Google Drive / LinkedIn CV link"
                      value={form.resumeUrl}
                      onChange={(e) => setForm({ ...form, resumeUrl: e.target.value })}
                      className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 focus:bg-white transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Brief Cover Note / Teaching Philosophy</label>
                    <textarea
                      rows={3}
                      placeholder="Tell us about your teaching experience, subject expertise, and achievements..."
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-medium text-slate-900 focus:bg-white transition-all"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[var(--primary)] hover:opacity-95 text-white font-bold h-13 rounded-xl text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
                  >
                    {loading ? "Submitting Application..." : "Submit Recruitment Application"}
                    <Send size={16} className="ml-2" />
                  </Button>
                </form>
              )}

              <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                <p className="text-[11px] font-bold text-slate-500 flex items-center justify-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-600 shrink-0" /> Encrypted Institutional HR Submission Desk
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CareerApplicationForm;
