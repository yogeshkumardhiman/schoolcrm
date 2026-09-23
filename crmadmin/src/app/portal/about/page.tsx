"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Rocket,
  Save,
  Loader2,
  Plus,
  Trash2,
  Sparkles,
  Target,
  Eye,
  Award,
  ShieldCheck,
  BookOpen,
  Scale,
  UserCheck,
  GraduationCap,
  Upload,
  User
} from "lucide-react";
import client from "@/lib/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { WebsiteNavHeader } from "../components/WebsiteNavHeader";

interface Pillar {
  id: string;
  title: string;
  desc: string;
  icon?: string;
}

interface SchoolRule {
  id: string;
  category: string;
  title: string;
  ruleDesc: string;
}

const DEFAULT_PILLARS: Pillar[] = [
  { id: "1", title: "CBSE Academic Distinction", desc: "Rigorous pedagogical framework fostering conceptual mastery and continuous assessment.", icon: "GraduationCap" },
  { id: "2", title: "STEM, AI & Robotics Labs", desc: "Hands-on engineering, coding, Python, and experiential innovation modules.", icon: "Laptop" },
  { id: "3", title: "Multi-Sport Athletics Arena", desc: "Expansive green grounds with certified coaches for Football, Cricket, and Athletics.", icon: "Trophy" },
  { id: "4", title: "Safe & Nurturing Campus", desc: "24/7 CCTV surveillance, GPS-equipped bus fleet, and compassionate faculty mentorship.", icon: "ShieldCheck" }
];

const DEFAULT_RULES: SchoolRule[] = [
  {
    id: "1",
    category: "Academic Attendance",
    title: "75% Mandatory CBSE Attendance Policy",
    ruleDesc: "Scholars must maintain a minimum of 75% attendance throughout the academic session to be eligible for CBSE Term & Board examinations. Leave applications must be submitted in advance."
  },
  {
    id: "2",
    category: "Campus Uniform & Grooming",
    title: "Prescribed School Uniform & Punctuality",
    ruleDesc: "Every student is required to attend campus in neat, prescribed school uniform with ID cards. Morning assembly gates close promptly at 07:45 AM (Summer) / 08:15 AM (Winter)."
  },
  {
    id: "3",
    category: "Safety & Well-being",
    title: "Zero Tolerance to Bullying, Ragging & Disrespect",
    ruleDesc: "Strict compliance with POCSO guidelines and CBSE safety norms. Any form of harassment, verbal abuse, or indiscipline will invite immediate Disciplinary Committee review."
  },
  {
    id: "4",
    category: "Digital Technology",
    title: "Electronic Gadgets & Mobile Phone Prohibition",
    ruleDesc: "Students are strictly prohibited from carrying mobile phones, smartwatches, or personal digital electronics to school without prior written authorization from the Principal."
  },
  {
    id: "5",
    category: "Academic Resources",
    title: "Laboratories & Library Care Protocol",
    ruleDesc: "Lab apparatus, computers, and library volumes must be handled with utmost diligence and care. Any intentional damage or loss will be borne by the guardian."
  },
  {
    id: "6",
    category: "Parent Partnership",
    title: "Parent-Teacher Meetings & Campus Entry",
    ruleDesc: "Parents are warmly encouraged to attend all scheduled PTMs. For weekdays, prior appointment with the Administrative Reception is mandatory before visiting faculty."
  }
];

export default function AboutSettingsPage() {
  const queryClient = useQueryClient();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [form, setForm] = useState({
    aboutTitle: "",
    aboutDescription: "",
    mission: "",
    vision: "",
    principalName: "",
    principalMessage: "",
    principalImage: "",
    whyChooseUs: DEFAULT_PILLARS,
    schoolRules: DEFAULT_RULES
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
        aboutTitle: data.aboutTitle || "",
        aboutDescription: data.aboutDescription || "",
        mission: data.mission || data.about_config?.mission || "",
        vision: data.vision || data.about_config?.vision || "",
        principalName: data.principalName || data.about_config?.principalName || "",
        principalMessage: data.principalMessage || data.about_config?.principalMessage || "",
        principalImage: data.principalImage || data.about_config?.principalImage || "",
        whyChooseUs: Array.isArray(data.whyChooseUs) && data.whyChooseUs.length > 0
          ? data.whyChooseUs
          : (Array.isArray(data.about_config?.whyChooseUs) && data.about_config.whyChooseUs.length > 0 ? data.about_config.whyChooseUs : DEFAULT_PILLARS),
        schoolRules: Array.isArray(data.about_config?.schoolRules) && data.about_config.schoolRules.length > 0
          ? data.about_config.schoolRules
          : DEFAULT_RULES
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
      toast.success("About School details, Mission & Rules saved successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to save about settings");
    }
  });

  const handleSave = () => {
    saveMutation.mutate({
      aboutTitle: form.aboutTitle,
      aboutDescription: form.aboutDescription,
      mission: form.mission,
      vision: form.vision,
      principalName: form.principalName,
      principalMessage: form.principalMessage,
      principalImage: form.principalImage,
      whyChooseUs: form.whyChooseUs,
      about_config: {
        mission: form.mission,
        vision: form.vision,
        principalName: form.principalName,
        principalMessage: form.principalMessage,
        principalImage: form.principalImage,
        whyChooseUs: form.whyChooseUs,
        schoolRules: form.schoolRules
      }
    });
  };

  const handleUploadPrincipalPhoto = async (file: File) => {
    const toastId = toast.loading("Uploading principal photo...");
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res: any = await client.upload("/upload?folder=leadership", formData);
      if (res?.url) {
        setForm((prev) => ({ ...prev, principalImage: res.url }));
        toast.success("Photo uploaded successfully!");
      } else {
        toast.error("Upload succeeded but no URL returned");
      }
    } catch {
      toast.error("Photo upload failed");
    } finally {
      toast.dismiss(toastId);
      setUploadingPhoto(false);
    }
  };

  // Pillar Handlers
  const addPillar = () => {
    setForm((prev) => ({
      ...prev,
      whyChooseUs: [
        ...prev.whyChooseUs,
        { id: Date.now().toString(), title: "New Distinction Pillar", desc: "Describe the educational or campus benefit.", icon: "Sparkles" }
      ]
    }));
  };

  const updatePillar = (index: number, key: keyof Pillar, val: string) => {
    const updated = [...form.whyChooseUs];
    updated[index] = { ...updated[index], [key]: val };
    setForm((prev) => ({ ...prev, whyChooseUs: updated }));
  };

  const removePillar = (index: number) => {
    setForm((prev) => ({ ...prev, whyChooseUs: prev.whyChooseUs.filter((_, i) => i !== index) }));
  };

  // Rule Handlers
  const addRule = () => {
    setForm((prev) => ({
      ...prev,
      schoolRules: [
        ...prev.schoolRules,
        {
          id: Date.now().toString(),
          category: "General Conduct",
          title: "New School Regulation",
          ruleDesc: "Specify standard campus guidelines and disciplinary expectations for scholars."
        }
      ]
    }));
  };

  const updateRule = (index: number, key: keyof SchoolRule, val: string) => {
    const updated = [...form.schoolRules];
    updated[index] = { ...updated[index], [key]: val };
    setForm((prev) => ({ ...prev, schoolRules: updated }));
  };

  const removeRule = (index: number) => {
    setForm((prev) => ({ ...prev, schoolRules: prev.schoolRules.filter((_, i) => i !== index) }));
  };

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="animate-spin text-blue-600 h-8 w-8" />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Loading About & Rules...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50/50 min-h-screen">
      <WebsiteNavHeader
        title="About School & Institutional Policies"
        description="Manage the institutional heritage narrative, Mission/Vision, Principal's message, code of conduct, and core pillars."
        actionButton={
          <Button
            type="button"
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer"
          >
            {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save About Settings
          </Button>
        }
      />

      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* Left Column: Narrative & Mission/Vision (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          <Card className="shadow-sm border-slate-200/80 rounded-3xl overflow-hidden bg-white">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
              <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Rocket size={16} className="text-blue-600" />
                Institutional Legacy & Background
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="text-[11px] font-black uppercase text-slate-500 mb-1 block">About Headline</label>
                <Input
                  value={form.aboutTitle}
                  onChange={(e) => setForm({ ...form, aboutTitle: e.target.value })}
                  placeholder="e.g. A Legacy of Academic Distinction & Character Building"
                  className="h-11 rounded-xl font-bold text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-black uppercase text-slate-500 mb-1 block">Detailed Institutional History</label>
                <textarea
                  value={form.aboutDescription}
                  onChange={(e) => setForm({ ...form, aboutDescription: e.target.value })}
                  placeholder="Established with the vision to deliver transformative CBSE education..."
                  rows={5}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium focus:border-blue-500 focus:outline-hidden transition-all"
                />
              </div>
            </CardContent>
          </Card>

          {/* Mission & Vision */}
          <Card className="shadow-sm border-slate-200/80 rounded-3xl overflow-hidden bg-white">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
              <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Target size={16} className="text-blue-600" />
                Mission & Vision Statements
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="text-[11px] font-black uppercase text-slate-500 mb-1 block">Mission Statement</label>
                <textarea
                  value={form.mission}
                  onChange={(e) => setForm({ ...form, mission: e.target.value })}
                  placeholder="To foster intellectual curiosity, ethical leadership, and conceptual mastery..."
                  rows={3}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium focus:border-blue-500 focus:outline-hidden transition-all"
                />
              </div>

              <div>
                <label className="text-[11px] font-black uppercase text-slate-500 mb-1 block">Vision Statement</label>
                <textarea
                  value={form.vision}
                  onChange={(e) => setForm({ ...form, vision: e.target.value })}
                  placeholder="To emerge as a benchmark institution of holistic character building..."
                  rows={3}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium focus:border-blue-500 focus:outline-hidden transition-all"
                />
              </div>
            </CardContent>
          </Card>

          {/* Principal Desk */}
          <Card className="shadow-sm border-slate-200/80 rounded-3xl overflow-hidden bg-white">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
              <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <GraduationCap size={16} className="text-blue-600" />
                Principal / Leadership Desk Note
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {/* Photo Upload + Name Row */}
              <div className="flex gap-4 items-start">
                {/* Photo Uploader */}
                <div className="shrink-0">
                  <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">Photo</label>
                  <div
                    className="relative w-20 h-20 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all group"
                    onClick={() => !uploadingPhoto && photoInputRef.current?.click()}
                    title="Click to upload principal photo"
                  >
                    {uploadingPhoto ? (
                      <Loader2 size={22} className="animate-spin text-blue-500" />
                    ) : form.principalImage ? (
                      <img
                        src={form.principalImage}
                        alt="Principal"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center space-y-1">
                        <User size={22} className="text-slate-400 mx-auto" />
                        <Upload size={12} className="text-slate-400 mx-auto group-hover:text-blue-500" />
                      </div>
                    )}
                    {form.principalImage && !uploadingPhoto && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                        <Upload size={18} className="text-white" />
                      </div>
                    )}
                  </div>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUploadPrincipalPhoto(file);
                      e.target.value = "";
                    }}
                  />
                </div>

                {/* Name + Designation */}
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">Leader Name</label>
                    <Input
                      value={form.principalName}
                      onChange={(e) => setForm({ ...form, principalName: e.target.value })}
                      placeholder="e.g. Dr. Ramesh Chandra"
                      className="h-9 rounded-xl font-bold text-xs"
                    />
                  </div>
                  {form.principalImage && (
                    <p className="text-[10px] text-emerald-600 font-bold truncate max-w-full">
                      ✓ Photo set
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">Message to Parents & Scholars</label>
                <textarea
                  value={form.principalMessage}
                  onChange={(e) => setForm({ ...form, principalMessage: e.target.value })}
                  placeholder="Welcome message highlighting values, dedication, and institutional vision..."
                  rows={4}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Code of Conduct & School Rules (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          <Card className="shadow-sm border-slate-200/80 rounded-3xl overflow-hidden bg-white">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Scale size={16} className="text-blue-600" />
                  School Code of Conduct & Rules ({form.schoolRules.length})
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">Disciplinary policies and regulations shown on About page</p>
              </div>
              <Button
                type="button"
                onClick={addRule}
                className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus size={13} /> Add Rule
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {form.schoolRules.map((rule, rIdx) => (
                <div
                  key={rule.id || rIdx}
                  className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/40 hover:bg-white transition-all space-y-2 relative group"
                >
                  <div className="flex items-center justify-between">
                    <Input
                      value={rule.category}
                      onChange={(e) => updateRule(rIdx, "category", e.target.value)}
                      placeholder="Category (e.g. Attendance)"
                      className="h-7 w-48 text-[10px] font-black uppercase text-blue-600 bg-blue-50 border-blue-200 rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeRule(rIdx)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                      title="Delete Rule"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <Input
                    value={rule.title}
                    onChange={(e) => updateRule(rIdx, "title", e.target.value)}
                    placeholder="Rule Title"
                    className="h-8 rounded-lg font-bold text-xs bg-white"
                  />

                  <textarea
                    value={rule.ruleDesc}
                    onChange={(e) => updateRule(rIdx, "ruleDesc", e.target.value)}
                    placeholder="Rule detailed instructions..."
                    rows={2}
                    className="w-full p-2 rounded-lg border border-slate-200 text-xs font-medium bg-white"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Why Choose Us Pillars */}
          <Card className="shadow-sm border-slate-200/80 rounded-3xl overflow-hidden bg-white">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Award size={16} className="text-amber-500" />
                  Core Pillars of Distinction ({form.whyChooseUs.length})
                </CardTitle>
              </div>
              <Button
                type="button"
                onClick={addPillar}
                className="h-8 px-3 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus size={13} /> Add Pillar
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {form.whyChooseUs.map((pillar, idx) => (
                <div
                  key={pillar.id || idx}
                  className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/40 space-y-2 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 font-mono">Pillar 0{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removePillar(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <Input
                    value={pillar.title}
                    onChange={(e) => updatePillar(idx, "title", e.target.value)}
                    placeholder="Title"
                    className="h-8 rounded-lg font-bold text-xs bg-white"
                  />
                  <textarea
                    value={pillar.desc}
                    onChange={(e) => updatePillar(idx, "desc", e.target.value)}
                    placeholder="Description"
                    rows={2}
                    className="w-full p-2 rounded-lg border border-slate-200 text-xs font-medium bg-white"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
