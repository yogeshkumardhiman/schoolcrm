"use client";

import React, { useState, useEffect } from "react";
import {
  Palette,
  Save,
  Loader2,
  Camera,
  Check,
  Globe,
  Sparkles,
  Building2,
  ShieldCheck,
  RefreshCcw,
  Upload
} from "lucide-react";
import client from "@/lib/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DocumentCropperModal } from "@/components/ui/DocumentCropperModal";
import { WebsiteNavHeader } from "../components/WebsiteNavHeader";

const PRESET_THEMES = [
  { name: "Classic Indigo", primary: "#6C63FF", secondary: "#8B5CF6", accent: "#F59E0B" },
  { name: "Midnight Sapphire", primary: "#1E3A8A", secondary: "#3B82F6", accent: "#EF4444" },
  { name: "Ocean Emerald", primary: "#0D9488", secondary: "#10B981", accent: "#F59E0B" },
  { name: "Sunset Crimson", primary: "#EF4444", secondary: "#F59E0B", accent: "#10B981" },
  { name: "Royal Violet", primary: "#6D28D9", secondary: "#EC4899", accent: "#F59E0B" },
  { name: "Nordic Slate", primary: "#374151", secondary: "#4B5563", accent: "#3B82F6" },
  { name: "Forest Jade", primary: "#064E3B", secondary: "#059669", accent: "#F59E0B" },
  { name: "Copper Amber", primary: "#B45309", secondary: "#D97706", accent: "#3B82F6" },
  { name: "Sky Azure", primary: "#0284C7", secondary: "#38BDF8", accent: "#F59E0B" },
  { name: "Rose Garden", primary: "#E11D48", secondary: "#FB7185", accent: "#3B82F6" },
  { name: "Deep Navy", primary: "#0F172A", secondary: "#1E3A5F", accent: "#38BDF8" },
  { name: "Mint Fresh", primary: "#047857", secondary: "#34D399", accent: "#F59E0B" },
  { name: "Golden Harvest", primary: "#A16207", secondary: "#EAB308", accent: "#1E3A8A" },
  { name: "Berry Plum", primary: "#7E22CE", secondary: "#A855F7", accent: "#F59E0B" },
  { name: "Coral Peach", primary: "#EA580C", secondary: "#FB923C", accent: "#3B82F6" },
  { name: "Teal Ocean", primary: "#115E59", secondary: "#2DD4BF", accent: "#F59E0B" },
  { name: "Cherry Blossom", primary: "#BE185D", secondary: "#F472B6", accent: "#F59E0B" },
  { name: "Steel Blue", primary: "#1E40AF", secondary: "#60A5FA", accent: "#F59E0B" }
];

export default function ThemeSettingsPage() {
  const queryClient = useQueryClient();
  const [logoToCrop, setLogoToCrop] = useState<string | null>(null);
  const [pendingLogoBlob, setPendingLogoBlob] = useState<Blob | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    schoolName: "",
    domainPrefix: "",
    primaryColor: "#1E3A8A",
    secondaryColor: "#3B82F6",
    accentColor: "#EF4444",
    tagline: "",
    affiliationNo: "",
    schoolCode: "",
    establishedYear: "",
    logoImage: ""
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
      setForm((prev) => ({
        ...prev,
        schoolName: data.schoolName || "",
        domainPrefix: data.domainPrefix || "",
        primaryColor: data.primaryColor || "#1E3A8A",
        secondaryColor: data.secondaryColor || "#3B82F6",
        accentColor: data.accentColor || "#EF4444",
        tagline: data.aboutTitle || data.tagline || "",
        affiliationNo: data.affiliationNo || "",
        schoolCode: data.schoolCode || "",
        establishedYear: data.establishedYear || "",
        logoImage: data.logoImage || ""
      }));
      if (data.logoImage) setLogoPreview(data.logoImage);
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      return client.put("/settings/school-info", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school-info"] });
      window.dispatchEvent(new Event("school-info-updated"));
      toast.success("Theme & School Identity saved successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to save theme settings");
    }
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    let finalLogo = form.logoImage;

    if (pendingLogoBlob) {
      const toastId = toast.loading("Uploading cropped logo...");
      try {
        const file = new File([pendingLogoBlob], `school-logo-${Date.now()}.png`, { type: "image/png" });
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes: any = await client.upload("/upload?folder=branding", formData);
        if (uploadRes?.url) {
          finalLogo = uploadRes.url;
        }
      } catch {
        toast.error("Logo upload failed");
      } finally {
        toast.dismiss(toastId);
      }
    }

    saveMutation.mutate({
      schoolName: form.schoolName,
      domainPrefix: form.domainPrefix,
      primaryColor: form.primaryColor,
      secondaryColor: form.secondaryColor,
      accentColor: form.accentColor,
      aboutTitle: form.tagline,
      affiliationNo: form.affiliationNo,
      schoolCode: form.schoolCode,
      establishedYear: form.establishedYear,
      logoImage: finalLogo,
      theme_config: {
        primary: form.primaryColor,
        secondary: form.secondaryColor,
        accent: form.accentColor,
        button: form.primaryColor,
        buttonHover: form.secondaryColor,
        navbar: "#0F172A",
        footer: "#0F172A",
        background: "#FFFFFF",
        text: "#475569",
        heading: "#0F172A"
      }
    });
  };

  const applyPreset = (theme: any) => {
    setForm((prev) => ({
      ...prev,
      primaryColor: theme.primary,
      secondaryColor: theme.secondary,
      accentColor: theme.accent
    }));
    toast.success(`Preset "${theme.name}" applied! Click Save to publish.`);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="animate-spin text-blue-600 h-8 w-8" />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Loading Theme Settings...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50/50 min-h-screen">
      <WebsiteNavHeader
        title="Theme & School Identity"
        description="Customize school branding, official colors, curated palette presets, and institutional identity."
        actionButton={
          <Button
            type="button"
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer"
          >
            {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Identity
          </Button>
        }
      />

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Preset Color Themes */}
          <Card className="shadow-sm border-slate-200/80 rounded-3xl overflow-hidden bg-white">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
              <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Palette size={16} className="text-blue-600" />
                Curated Color Presets
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {PRESET_THEMES.map((theme) => {
                  const isSelected = form.primaryColor === theme.primary;
                  return (
                    <button
                      key={theme.name}
                      type="button"
                      onClick={() => applyPreset(theme)}
                      className={cn(
                        "p-3 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer",
                        isSelected
                          ? "border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/30 shadow-sm"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-5 w-5 rounded-full shadow-xs shrink-0" style={{ backgroundColor: theme.primary }} />
                        <div className="h-5 w-5 rounded-full shadow-xs -ml-3 shrink-0" style={{ backgroundColor: theme.secondary }} />
                        {isSelected && <Check size={14} className="text-blue-600 ml-auto font-black" />}
                      </div>
                      <p className="font-bold text-xs text-slate-800 truncate">{theme.name}</p>
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5">{theme.primary}</p>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Custom Color Pickers */}
          <Card className="shadow-sm border-slate-200/80 rounded-3xl overflow-hidden bg-white">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
              <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Sparkles size={16} className="text-amber-500" />
                Custom Color Calibration
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-black uppercase text-slate-500 mb-1.5 block">Primary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.primaryColor}
                    onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                    className="h-10 w-12 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white"
                  />
                  <Input
                    value={form.primaryColor}
                    onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                    className="h-10 rounded-xl font-mono text-xs uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-black uppercase text-slate-500 mb-1.5 block">Secondary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.secondaryColor}
                    onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })}
                    className="h-10 w-12 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white"
                  />
                  <Input
                    value={form.secondaryColor}
                    onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })}
                    className="h-10 rounded-xl font-mono text-xs uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-black uppercase text-slate-500 mb-1.5 block">Accent Highlight</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.accentColor}
                    onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
                    className="h-10 w-12 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white"
                  />
                  <Input
                    value={form.accentColor}
                    onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
                    className="h-10 rounded-xl font-mono text-xs uppercase"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* School Details */}
          <Card className="shadow-sm border-slate-200/80 rounded-3xl overflow-hidden bg-white">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
              <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Building2 size={16} className="text-blue-600" />
                School Institutional Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-black uppercase text-slate-500 mb-1.5 block">Official School Name *</label>
                  <Input
                    value={form.schoolName}
                    onChange={(e) => setForm({ ...form, schoolName: e.target.value })}
                    placeholder="e.g. RANI PUBLIC SCHOOL"
                    className="h-11 rounded-xl font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase text-slate-500 mb-1.5 block">Domain / ERP Prefix</label>
                  <Input
                    value={form.domainPrefix}
                    onChange={(e) => setForm({ ...form, domainPrefix: e.target.value })}
                    placeholder="e.g. rani.sdmschool.in"
                    className="h-11 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-black uppercase text-slate-500 mb-1.5 block">School Tagline / Motto</label>
                <Input
                  value={form.tagline}
                  onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                  placeholder="e.g. Empowering Minds, Securing Futures"
                  className="h-11 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] font-black uppercase text-slate-500 mb-1.5 block">CBSE Affiliation No</label>
                  <Input
                    value={form.affiliationNo}
                    onChange={(e) => setForm({ ...form, affiliationNo: e.target.value })}
                    placeholder="2130000"
                    className="h-10 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-black uppercase text-slate-500 mb-1.5 block">School Code</label>
                  <Input
                    value={form.schoolCode}
                    onChange={(e) => setForm({ ...form, schoolCode: e.target.value })}
                    placeholder="60000"
                    className="h-10 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-black uppercase text-slate-500 mb-1.5 block">Estd. Year</label>
                  <Input
                    value={form.establishedYear}
                    onChange={(e) => setForm({ ...form, establishedYear: e.target.value })}
                    placeholder="1998"
                    className="h-10 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar: Logo Upload & Live Preview */}
        <div className="space-y-6">
          {/* Logo Upload Card */}
          <Card className="shadow-sm border-slate-200/80 rounded-3xl overflow-hidden bg-white">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
              <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Camera size={16} className="text-indigo-600" />
                School Crest & Logo
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 text-center space-y-4">
              <div className="relative mx-auto w-32 h-32 rounded-3xl border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50 p-3 group overflow-hidden">
                {logoPreview ? (
                  <img src={logoPreview} alt="School Logo" className="w-full h-full object-contain" />
                ) : (
                  <div className="text-center">
                    <Camera size={28} className="mx-auto text-slate-400 mb-1" />
                    <p className="text-[10px] font-bold text-slate-400">No Logo</p>
                  </div>
                )}
              </div>

              <input
                type="file"
                id="logo-upload"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = () => setLogoToCrop(reader.result as string);
                    reader.readAsDataURL(file);
                  }
                }}
              />
              <label
                htmlFor="logo-upload"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-all w-full"
              >
                <Upload size={14} /> Upload & Crop Logo
              </label>
            </CardContent>
          </Card>

          {/* Live Preview Miniature Card */}
          <Card className="shadow-sm border-slate-200/80 rounded-3xl overflow-hidden bg-[#0F172A] text-white p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Live Website Theme</span>
              <Badge className="bg-emerald-500/20 text-emerald-300 text-[9px] font-mono">Real-time</Badge>
            </div>

            <div className="rounded-2xl p-4 border border-white/10" style={{ backgroundColor: form.primaryColor }}>
              <p className="text-xs font-black truncate">{form.schoolName || "RANI PUBLIC SCHOOL"}</p>
              <p className="text-[10px] opacity-80 truncate mt-0.5">{form.tagline || "CBSE Affiliated Senior Secondary Institution"}</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg text-[9px] font-bold text-white shadow-xs" style={{ backgroundColor: form.secondaryColor }}>
                  Explore
                </span>
                <span className="px-2.5 py-1 rounded-lg text-[9px] font-bold text-white shadow-xs" style={{ backgroundColor: form.accentColor }}>
                  Admissions
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Image Cropper Modal */}
      {logoToCrop && (
        <DocumentCropperModal
          imageSrc={logoToCrop}
          documentTitle="Crop School Crest Logo"
          onCancel={() => setLogoToCrop(null)}
          onCropComplete={(blob, previewUrl) => {
            setPendingLogoBlob(blob);
            setLogoPreview(previewUrl);
            setLogoToCrop(null);
            toast.success("Logo cropped! Click 'Save Identity' to apply.");
          }}
        />
      )}
    </div>
  );
}
