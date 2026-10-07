"use client";

import React, { useState, useEffect } from "react";
import {
  Phone,
  Save,
  Loader2,
  MapPin,
  Mail,
  HelpCircle,
  Plus,
  Trash2,
  Share2,
  ExternalLink,
  MessageCircle,
  PhoneCall,
  Sparkles
} from "lucide-react";
import client from "@/lib/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WebsiteNavHeader } from "../components/WebsiteNavHeader";

interface FAQ {
  q: string;
  a: string;
}

export default function ContactSettingsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    contactPhone: "",
    contactPhone2: "",
    contactEmail: "",
    contactEmail2: "",
    address: "",
    mapEmbedUrl: "",
    showWhatsappWidget: true,
    whatsappNumber: "",
    showCallWidget: true,
    callNumber: "",
    facebookUrl: "",
    instagramUrl: "",
    youtubeUrl: "",
    linkedinUrl: "",
    twitterUrl: "",
    whatsappSocialUrl: "",
    faqs: [] as FAQ[]
  });

  const { data, isLoading } = useQuery({
    queryKey: ["school-info"],
    queryFn: async () => {
      const res: any = await client.get("/settings/school-info");
      return res?.data || res || {};
    }
  });

  useEffect(() => {
    if (data) {
      setForm({
        contactPhone: data.contactPhone || data.phone || "",
        contactPhone2: data.contactPhone2 || "",
        contactEmail: data.contactEmail || data.email || "",
        contactEmail2: data.contactEmail2 || "",
        address: data.address || "",
        mapEmbedUrl: data.mapEmbedUrl || "",
        showWhatsappWidget: data.showWhatsappWidget !== undefined ? data.showWhatsappWidget : true,
        whatsappNumber: data.whatsappNumber || data.contactPhone || "",
        showCallWidget: data.showCallWidget !== undefined ? data.showCallWidget : true,
        callNumber: data.callNumber || data.contactPhone || "",
        facebookUrl: data.facebookUrl || data.socialLinks?.facebook || "",
        instagramUrl: data.instagramUrl || data.socialLinks?.instagram || "",
        youtubeUrl: data.youtubeUrl || data.socialLinks?.youtube || "",
        linkedinUrl: data.linkedinUrl || data.socialLinks?.linkedin || "",
        twitterUrl: data.twitterUrl || data.socialLinks?.twitter || "",
        whatsappSocialUrl: data.whatsappSocialUrl || data.socialLinks?.whatsapp || "",
        faqs: Array.isArray(data.faqs) ? data.faqs : []
      });
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      return client.put("/settings/school-info", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school-info"] });
      window.dispatchEvent(new Event("school-info-updated"));
      toast.success("Contact info, social links & FAQs saved successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to save contact settings");
    }
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({
      contactPhone: form.contactPhone,
      contactPhone2: form.contactPhone2,
      contactEmail: form.contactEmail,
      contactEmail2: form.contactEmail2,
      address: form.address,
      mapEmbedUrl: form.mapEmbedUrl,
      showWhatsappWidget: form.showWhatsappWidget,
      whatsappNumber: form.whatsappNumber,
      showCallWidget: form.showCallWidget,
      callNumber: form.callNumber,
      facebookUrl: form.facebookUrl,
      instagramUrl: form.instagramUrl,
      youtubeUrl: form.youtubeUrl,
      linkedinUrl: form.linkedinUrl,
      twitterUrl: form.twitterUrl,
      whatsappSocialUrl: form.whatsappSocialUrl,
      socialLinks: {
        facebook: form.facebookUrl,
        instagram: form.instagramUrl,
        youtube: form.youtubeUrl,
        linkedin: form.linkedinUrl,
        twitter: form.twitterUrl,
        whatsapp: form.whatsappSocialUrl || (form.whatsappNumber ? `https://wa.me/${form.whatsappNumber.replace(/[^0-9]/g, "")}` : "")
      },
      faqs: form.faqs
    });
  };

  const addFaq = () => {
    setForm((prev) => ({
      ...prev,
      faqs: [...prev.faqs, { q: "", a: "" }]
    }));
  };

  const updateFaq = (index: number, key: keyof FAQ, val: string) => {
    const updated = [...form.faqs];
    updated[index] = { ...updated[index], [key]: val };
    setForm((prev) => ({ ...prev, faqs: updated }));
  };

  const removeFaq = (index: number) => {
    setForm((prev) => ({ ...prev, faqs: prev.faqs.filter((_, i) => i !== index) }));
  };

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="animate-spin text-blue-600 h-8 w-8" />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Loading Contact & Social Hub...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50/50 min-h-screen">
      <WebsiteNavHeader
        title="Contact, Social Media & FAQs"
        description="Manage official phone/email coordinates, floating action buttons, social media links, map embed, and parent FAQs."
        actionButton={
          <Button
            type="button"
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer"
          >
            {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Contact Settings
          </Button>
        }
      />

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column: Floating Widgets & Contact Details */}
        <div className="space-y-6">
          {/* Floating Action Buttons */}
          <Card className="shadow-sm border-slate-200/80 rounded-3xl overflow-hidden bg-white">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
              <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <MessageCircle size={16} className="text-emerald-600" />
                Floating Action Widgets
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/40">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="showWhatsapp"
                    checked={form.showWhatsappWidget}
                    onChange={(e) => setForm({ ...form, showWhatsappWidget: e.target.checked })}
                    className="h-4 w-4 text-emerald-600 rounded-md cursor-pointer"
                  />
                  <div>
                    <label htmlFor="showWhatsapp" className="text-xs font-bold text-slate-800 cursor-pointer block">
                      Show Floating WhatsApp Button
                    </label>
                    <p className="text-[10px] text-slate-400">Direct 1-click admission chat for parents</p>
                  </div>
                </div>
                <Input
                  value={form.whatsappNumber}
                  onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-44 h-9 rounded-xl text-xs font-mono bg-white"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/40">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="showCall"
                    checked={form.showCallWidget}
                    onChange={(e) => setForm({ ...form, showCallWidget: e.target.checked })}
                    className="h-4 w-4 text-blue-600 rounded-md cursor-pointer"
                  />
                  <div>
                    <label htmlFor="showCall" className="text-xs font-bold text-slate-800 cursor-pointer block">
                      Show Floating Direct Call Button
                    </label>
                    <p className="text-[10px] text-slate-400">Direct phone dialer trigger on mobile</p>
                  </div>
                </div>
                <Input
                  value={form.callNumber}
                  onChange={(e) => setForm({ ...form, callNumber: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-44 h-9 rounded-xl text-xs font-mono bg-white"
                />
              </div>
            </CardContent>
          </Card>

          {/* Official Contact Coordinates */}
          <Card className="shadow-sm border-slate-200/80 rounded-3xl overflow-hidden bg-white">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
              <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Phone size={16} className="text-blue-600" />
                School Contact Coordinates
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-black uppercase text-slate-500 mb-1 block">Primary Phone *</label>
                  <Input
                    value={form.contactPhone}
                    onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="h-10 rounded-xl font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-black uppercase text-slate-500 mb-1 block">Alternate Phone</label>
                  <Input
                    value={form.contactPhone2}
                    onChange={(e) => setForm({ ...form, contactPhone2: e.target.value })}
                    placeholder="+91 98765 43211"
                    className="h-10 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-black uppercase text-slate-500 mb-1 block">Official Email *</label>
                  <Input
                    value={form.contactEmail}
                    onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                    placeholder="e.g. info@schoolname.com"
                    className="h-10 rounded-xl font-medium text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-black uppercase text-slate-500 mb-1 block">Admissions Email</label>
                  <Input
                    value={form.contactEmail2}
                    onChange={(e) => setForm({ ...form, contactEmail2: e.target.value })}
                    placeholder="e.g. admissions@schoolname.com"
                    className="h-10 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-black uppercase text-slate-500 mb-1 block">Physical Campus Address</label>
                <textarea
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="e.g. Sector 12, Main Institutional Area, City, State - PIN"
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-blue-500 focus:outline-hidden transition-all"
                />
              </div>

              <div>
                <label className="text-[11px] font-black uppercase text-slate-500 mb-1 block">Google Maps Embed Iframe URL</label>
                <Input
                  value={form.mapEmbedUrl}
                  onChange={(e) => setForm({ ...form, mapEmbedUrl: e.target.value })}
                  placeholder="https://www.google.com/maps/embed?pb=..."
                  className="h-10 rounded-xl text-xs font-mono"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Social Media & FAQs */}
        <div className="space-y-6">
          {/* Social Media Profiles */}
          <Card className="shadow-sm border-slate-200/80 rounded-3xl overflow-hidden bg-white">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
              <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Share2 size={16} className="text-indigo-600" />
                Official Social Media Profiles
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3.5">
              <div>
                <label className="text-[11px] font-black uppercase text-slate-500 mb-1 block">Facebook Page URL</label>
                <Input
                  value={form.facebookUrl}
                  onChange={(e) => setForm({ ...form, facebookUrl: e.target.value })}
                  placeholder="https://facebook.com/yourschool"
                  className="h-9 rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-black uppercase text-slate-500 mb-1 block">Instagram Profile URL</label>
                <Input
                  value={form.instagramUrl}
                  onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })}
                  placeholder="https://instagram.com/yourschool"
                  className="h-9 rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-black uppercase text-slate-500 mb-1 block">YouTube Channel URL</label>
                <Input
                  value={form.youtubeUrl}
                  onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })}
                  placeholder="https://youtube.com/@yourschool"
                  className="h-9 rounded-xl text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-black uppercase text-slate-500 mb-1 block">LinkedIn URL</label>
                  <Input
                    value={form.linkedinUrl}
                    onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
                    placeholder="https://linkedin.com/school/..."
                    className="h-9 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-black uppercase text-slate-500 mb-1 block">Twitter / X URL</label>
                  <Input
                    value={form.twitterUrl}
                    onChange={(e) => setForm({ ...form, twitterUrl: e.target.value })}
                    placeholder="https://x.com/yourschool"
                    className="h-9 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ Manager */}
          <Card className="shadow-sm border-slate-200/80 rounded-3xl overflow-hidden bg-white">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <HelpCircle size={16} className="text-blue-600" />
                  Frequently Asked Questions (FAQ)
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">Accordion items on public website FAQ section</p>
              </div>
              <Button
                type="button"
                onClick={addFaq}
                className="h-8 px-3 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold flex items-center gap-1"
              >
                <Plus size={13} /> Add FAQ
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              {form.faqs.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                  <HelpCircle className="h-8 w-8 text-slate-300 mb-2" />
                  <h4 className="text-xs font-bold text-slate-700">No FAQs Configured</h4>
                  <p className="text-[11px] text-slate-400 max-w-xs mt-0.5 mb-3">
                    Add frequently asked questions to clarify admissions, timings, transport, and curriculum policies.
                  </p>
                  <Button
                    type="button"
                    onClick={addFaq}
                    className="h-7 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={12} /> Add First FAQ
                  </Button>
                </div>
              ) : (
                form.faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/40 space-y-2 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">
                        Q{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFaq(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors"
                        title="Delete FAQ"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <Input
                      value={faq.q}
                      onChange={(e) => updateFaq(idx, "q", e.target.value)}
                      placeholder="Enter parent query..."
                      className="h-8 rounded-lg font-bold text-xs bg-white"
                    />
                    <textarea
                      value={faq.a}
                      onChange={(e) => updateFaq(idx, "a", e.target.value)}
                      placeholder="Enter clear answer..."
                      rows={2}
                      className="w-full p-2 rounded-lg border border-slate-200 text-xs font-medium bg-white focus:border-blue-500 focus:outline-hidden transition-all"
                    />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
