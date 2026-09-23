"use client";

import React, { useState, useEffect } from "react";
import {
  Image as ImageIcon,
  Save,
  Loader2,
  Upload,
  Camera
} from "lucide-react";
import client from "@/lib/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { WebsiteNavHeader } from "../components/WebsiteNavHeader";
import { BannerSlidersTab } from "../components/BannerSlidersTab";

export default function HeroSettingsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    bannerTitle: "",
    bannerSubtitle: "",
    bannerImage: "",
    bannerCtaLabel: "",
    bannerCtaLink: ""
  });
  const [uploading, setUploading] = useState(false);

  // Banner sliders state
  const [bannerForm, setBannerForm] = useState({
    title: "",
    description: "",
    body: "",
    image_url: "",
    display_order: 0
  });
  const [editingBannerId, setEditingBannerId] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["school-info"],
    queryFn: async () => {
      const res: any = await client.get("/settings/school-info");
      return res?.data || res || {};
    }
  });

  const { data: banners = [] } = useQuery({
    queryKey: ["web-banners"],
    queryFn: async () => {
      try {
        const res: any = await client.get("/public/web-banners");
        return Array.isArray(res) ? res : res?.data || [];
      } catch {
        return [];
      }
    }
  });

  useEffect(() => {
    if (data) {
      setForm({
        bannerTitle: data.bannerTitle || "",
        bannerSubtitle: data.bannerSubtitle || "",
        bannerImage: data.bannerImage || "",
        bannerCtaLabel: data.bannerCtaLabel || "Apply Online Now",
        bannerCtaLink: data.bannerCtaLink || "/admissions"
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
      toast.success("Hero & Banner settings saved successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to save hero settings");
    }
  });

  const saveBannerMutation = useMutation({
    mutationFn: async (formData: any) => {
      if (editingBannerId) {
        return client.put(`/website/web-banners/${editingBannerId}`, formData);
      }
      return client.post("/website/web-banners", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["web-banners"] });
      setEditingBannerId(null);
      setBannerForm({ title: "", description: "", body: "", image_url: "", display_order: 0 });
      toast.success("Web banner slide saved successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to save banner slide");
    }
  });

  const deleteBannerMutation = useMutation({
    mutationFn: async (id: any) => {
      return client.delete(`/website/web-banners/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["web-banners"] });
      toast.success("Banner slide deleted");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to delete banner");
    }
  });

  const getResolvedUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:") || url.startsWith("blob:")) {
      return url;
    }
    const apiHost = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
    return `${apiHost}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(form);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const toastId = toast.loading("Uploading hero background image...");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res: any = await client.upload("/upload?folder=hero", formData);
      if (res?.url) {
        setForm((prev) => ({ ...prev, bannerImage: res.url }));
        toast.success("Hero background uploaded! Click 'Save Hero Settings' to publish.");
      }
    } catch {
      toast.error("Image upload failed");
    } finally {
      toast.dismiss(toastId);
      setUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="animate-spin text-blue-600 h-8 w-8" />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Loading Hero & Banners...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50/50 min-h-screen">
      <WebsiteNavHeader
        title="Hero & Web Banner Sliders"
        description="Configure the primary homepage banner narrative, action buttons, and manage rotating promotional sliders."
        actionButton={
          <Button
            type="button"
            onClick={handleSave}
            disabled={saveMutation.isPending || uploading}
            className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer"
          >
            {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Hero Settings
          </Button>
        }
      />

      <div className="space-y-6">
        {/* Primary Hero Configuration Card */}
        <Card className="shadow-sm border-slate-200/80 rounded-3xl overflow-hidden bg-white">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
            <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ImageIcon size={16} className="text-blue-600" />
              Main Hero Narrative & Intro
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-black uppercase text-slate-500 mb-1.5 block">Hero Headline / Title *</label>
                  <Input
                    value={form.bannerTitle}
                    onChange={(e) => setForm({ ...form, bannerTitle: e.target.value })}
                    placeholder="e.g. Nurturing Future Leaders with Academic Excellence"
                    className="h-11 rounded-xl font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase text-slate-500 mb-1.5 block">Hero Subtitle / Description</label>
                  <textarea
                    value={form.bannerSubtitle}
                    onChange={(e) => setForm({ ...form, bannerSubtitle: e.target.value })}
                    placeholder="e.g. Welcome to Rani Public School, an institution committed to holistic student growth..."
                    rows={3}
                    className="w-full p-3.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-blue-500 focus:outline-hidden transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-black uppercase text-slate-500 mb-1.5 block">Primary CTA Button</label>
                    <Input
                      value={form.bannerCtaLabel}
                      onChange={(e) => setForm({ ...form, bannerCtaLabel: e.target.value })}
                      placeholder="e.g. Apply for Admission"
                      className="h-10 rounded-xl text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-black uppercase text-slate-500 mb-1.5 block">CTA Target Link</label>
                    <Input
                      value={form.bannerCtaLink}
                      onChange={(e) => setForm({ ...form, bannerCtaLink: e.target.value })}
                      placeholder="/admissions"
                      className="h-10 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Hero Image Card */}
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase text-slate-500 block">Hero Background Image</label>
                <div className="relative h-56 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center p-2 group">
                  {form.bannerImage ? (
                    <img src={form.bannerImage} alt="Hero Banner" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <div className="text-center">
                      <Camera size={32} className="mx-auto text-slate-400 mb-2" />
                      <p className="text-xs font-bold text-slate-500">No background banner uploaded</p>
                      <p className="text-[10px] text-slate-400">Recommended 1920x800 px</p>
                    </div>
                  )}
                </div>

                <input
                  type="file"
                  id="hero-image-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <label
                  htmlFor="hero-image-upload"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-all w-full"
                >
                  <Upload size={14} /> Upload Hero Background Image
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Rotating Web Sliders Section */}
        <div className="pt-2">
          <BannerSlidersTab
            banners={banners}
            bannerForm={bannerForm}
            setBannerForm={setBannerForm}
            editingBannerId={editingBannerId}
            setEditingBannerId={setEditingBannerId}
            saveBannerMutation={saveBannerMutation}
            deleteBannerMutation={deleteBannerMutation}
            getResolvedUrl={getResolvedUrl}
          />
        </div>
      </div>
    </div>
  );
}
