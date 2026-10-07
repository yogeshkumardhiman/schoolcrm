"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Building2,
  Save,
  Loader2,
  Plus,
  Trash2,
  Sparkles,
  Check,
  Upload,
  Camera,
  ImageIcon,
  Eye
} from "lucide-react";
import client from "@/lib/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { WebsiteNavHeader } from "../components/WebsiteNavHeader";

interface Facility {
  id: string;
  title: string;
  desc: string;
  tag?: string;
  image?: string;
  icon?: string;
}

export default function FacilitiesSettingsPage() {
  const queryClient = useQueryClient();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["school-info"],
    queryFn: async () => {
      const res: any = await client.get("/settings/school-info");
      return res?.data || res || {};
    }
  });

  useEffect(() => {
    if (data) {
      if (Array.isArray(data.facilities) && data.facilities.length > 0) {
        setFacilities(data.facilities);
      } else if (Array.isArray(data.facilities_config) && data.facilities_config.length > 0) {
        setFacilities(data.facilities_config);
      } else {
        setFacilities([]);
      }
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      return client.put("/settings/school-info", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school-info"] });
      window.dispatchEvent(new Event("school-info-updated"));
      toast.success("Campus facilities saved successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to save facilities");
    }
  });

  const handleSave = () => {
    saveMutation.mutate({
      facilities,
      facilities_config: facilities
    });
  };

  const addFacility = () => {
    setFacilities((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        title: "",
        desc: "",
        tag: "",
        image: ""
      }
    ]);
  };

  const updateFacility = (index: number, key: keyof Facility, val: string) => {
    const updated = [...facilities];
    updated[index] = { ...updated[index], [key]: val };
    setFacilities(updated);
  };

  const removeFacility = (index: number) => {
    setFacilities(facilities.filter((_, i) => i !== index));
  };

  const handleImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingIdx(index);
      const formData = new FormData();
      formData.append("file", file);

      const res: any = await client.upload("/upload?folder=school/facilities", formData);
      const uploadedUrl = res?.url || res;

      if (uploadedUrl) {
        updateFacility(index, "image", uploadedUrl);
        toast.success("Facility image uploaded successfully!");
      }
    } catch (err) {
      console.error("Facility upload error:", err);
      toast.error("Failed to upload facility image");
    } finally {
      setUploadingIdx(null);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="animate-spin text-blue-600 h-8 w-8" />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Loading Facilities...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6 md:p-10 bg-slate-50/50 min-h-screen pb-32">
      <WebsiteNavHeader
        title="Campus Infrastructure & Facilities"
        description="Showcase smart laboratories, library, sports infrastructure, GPS transport, and student amenities."
        actionButton={
          <Button
            type="button"
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer"
          >
            {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Facilities
          </Button>
        }
      />

      <Card className="shadow-sm border-slate-200/80 rounded-3xl overflow-hidden bg-white">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Building2 size={16} className="text-blue-600" />
              Active Campus Facilities Showcase
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">Upload photos, titles, tags, and descriptions displayed on the homepage</p>
          </div>
          <Button
            type="button"
            onClick={addFacility}
            className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus size={14} /> Add New Facility
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          {facilities.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <Building2 className="h-10 w-10 text-slate-300 mb-3" />
              <h3 className="text-sm font-bold text-slate-700">No Campus Facilities Configured</h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4">
                Add laboratories, sports arenas, libraries, or digital classrooms to showcase on your public website.
              </p>
              <Button
                type="button"
                onClick={addFacility}
                className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus size={14} /> Add First Facility
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {facilities.map((fac, idx) => (
                <div
                  key={fac.id || idx}
                  className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all space-y-4 relative group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest font-mono bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                        Facility #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFacility(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Facility"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {/* Image Preview & Upload */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-500 block">Facility Photo</label>
                      <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group/img">
                        {fac.image ? (
                          <img
                            src={fac.image}
                            alt={fac.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-1">
                            <ImageIcon size={24} />
                            <span className="text-[10px] font-bold">No Image Uploaded</span>
                          </div>
                        )}

                        <label className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-bold gap-1 cursor-pointer">
                          {uploadingIdx === idx ? (
                            <Loader2 size={20} className="animate-spin" />
                          ) : (
                            <>
                              <Camera size={20} />
                              <span>Change Photo</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageUpload(idx, e)}
                          />
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">Facility Title</label>
                      <Input
                        value={fac.title}
                        onChange={(e) => updateFacility(idx, "title", e.target.value)}
                        placeholder="e.g. Computer Lab, Sports Arenas"
                        className="h-10 rounded-xl font-bold text-xs bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">Category Tag</label>
                      <Input
                        value={fac.tag || ""}
                        onChange={(e) => updateFacility(idx, "tag", e.target.value)}
                        placeholder="e.g. Digital Tech, Sports, Innovation"
                        className="h-10 rounded-xl text-xs bg-white font-medium"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">Description</label>
                      <textarea
                        value={fac.desc}
                        onChange={(e) => updateFacility(idx, "desc", e.target.value)}
                        placeholder="Describe infrastructure and student benefits..."
                        rows={3}
                        className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:border-blue-500 focus:outline-hidden transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
