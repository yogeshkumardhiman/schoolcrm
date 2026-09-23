"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Save,
  Loader2,
  Upload,
  Camera,
  Quote,
  Plus,
  Trash2,
  Pencil,
  Sparkles,
  ShieldCheck,
  Award,
  Crown,
  X
} from "lucide-react";
import client from "@/lib/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WebsiteNavHeader } from "../components/WebsiteNavHeader";

interface LeadershipMember {
  id: string;
  name: string;
  designation: string;
  quote: string;
  message: string;
  photo?: string;
}

// No static defaults — all leadership data comes from the database

export default function LeadershipSettingsPage() {
  const queryClient = useQueryClient();
  const [leaders, setLeaders] = useState<LeadershipMember[]>([]);
  const [editingLeader, setEditingLeader] = useState<LeadershipMember | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["school-info"],
    queryFn: async () => {
      const res: any = await client.get("/settings/school-info");
      return res?.data || res || {};
    }
  });

  useEffect(() => {
    if (data) {
      if (Array.isArray(data.director_message) && data.director_message.length > 0) {
        setLeaders(
          data.director_message.map((l: any, idx: number) => ({
            id: l.id || (idx + 1).toString(),
            name: l.name || "",
            designation: l.designation || "Executive Leader",
            quote: l.quote || "",
            message: l.message || "",
            photo: l.photo || l.image || ""
          }))
        );
      } else if (data.principalName || data.directorName) {
        const initialList: LeadershipMember[] = [];
        if (data.directorName) {
          initialList.push({
            id: "1",
            name: data.directorName,
            designation: data.directorDesignation || "Managing Director & Founder",
            quote: data.directorQuote || "",
            message: data.directorMessage || "",
            photo: data.directorImage || ""
          });
        }
        if (data.principalName) {
          initialList.push({
            id: "2",
            name: data.principalName,
            designation: data.principalDesignation || "Principal & Head of School",
            quote: data.principalQuote || "",
            message: data.principalMessage || "",
            photo: data.principalImage || ""
          });
        }
        if (initialList.length > 0) setLeaders(initialList);
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
      toast.success("Leadership & Founder profiles saved successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to save leadership profiles");
    }
  });

  const handleSave = () => {
    const principal = leaders.find((l) => l.designation?.toLowerCase().includes("principal")) || leaders[1] || leaders[0];
    const director = leaders.find((l) => !l.designation?.toLowerCase().includes("principal")) || leaders[0];

    saveMutation.mutate({
      director_message: leaders.map((l) => ({
        id: l.id,
        name: l.name,
        designation: l.designation,
        quote: l.quote,
        message: l.message,
        photo: l.photo
      })),
      principalName: principal?.name || "",
      principalDesignation: principal?.designation || "",
      principalQuote: principal?.quote || "",
      principalMessage: principal?.message || "",
      principalImage: principal?.photo || "",
      directorName: director?.name || "",
      directorDesignation: director?.designation || "",
      directorQuote: director?.quote || "",
      directorMessage: director?.message || "",
      directorImage: director?.photo || ""
    });
  };

  const handleUploadPhoto = async (file: File) => {
    const toastId = toast.loading("Uploading leader portrait...");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res: any = await client.upload("/upload?folder=leadership", formData);
      if (res?.url && editingLeader) {
        setEditingLeader({ ...editingLeader, photo: res.url });
        toast.success("Photo uploaded successfully!");
      }
    } catch {
      toast.error("Photo upload failed");
    } finally {
      toast.dismiss(toastId);
    }
  };

  const openAddLeader = () => {
    setEditingLeader({
      id: Date.now().toString(),
      name: "",
      designation: "Founder / CEO / Director / Principal",
      quote: "",
      message: "",
      photo: ""
    });
    setIsModalOpen(true);
  };

  const saveLeaderFromModal = () => {
    if (!editingLeader || !editingLeader.name.trim()) {
      toast.error("Please enter Leader Name");
      return;
    }
    const idx = leaders.findIndex((l) => l.id === editingLeader.id);
    if (idx >= 0) {
      const updated = [...leaders];
      updated[idx] = editingLeader;
      setLeaders(updated);
    } else {
      setLeaders([...leaders, editingLeader]);
    }
    setIsModalOpen(false);
    setEditingLeader(null);
    toast.success("Profile updated! Click 'Save All Profiles' to publish.");
  };

  const removeLeader = (id: string) => {
    setLeaders(leaders.filter((l) => l.id !== id));
    toast.success("Leader profile removed");
  };

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="animate-spin text-blue-600 h-8 w-8" />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Loading Leadership Desk...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50/50 min-h-screen">
      <WebsiteNavHeader
        title="Founders, Directors & Leadership Desk"
        description="Manage profiles for Founder, Chairman, CEO, Director, Principal, and Executive Board with personal messages and official photographs."
        actionButton={
          <Button
            type="button"
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer"
          >
            {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save All Profiles
          </Button>
        }
      />

      <Card className="shadow-sm border-slate-200/80 rounded-3xl overflow-hidden bg-white">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Crown size={16} className="text-amber-500" />
              Founding Board & Leadership Desk ({leaders.length})
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">Profiles rendered dynamically on the About Us and Management pages</p>
          </div>
          <Button
            type="button"
            onClick={openAddLeader}
            className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus size={14} /> Add Leader / Founder
          </Button>
        </CardHeader>

        <CardContent className="p-6">
          {leaders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-blue-50 border-2 border-blue-100 flex items-center justify-center">
                <Crown size={28} className="text-blue-400" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">No Leadership Profiles Added Yet</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Add Founder, Chairman, Director, CEO, or Principal profiles. They will appear on the public website's About page.
                </p>
              </div>
              <Button
                type="button"
                onClick={openAddLeader}
                className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer mt-2"
              >
                <Plus size={14} /> Add First Leader
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {leaders.map((leader) => (
                <div
                  key={leader.id}
                  className="p-6 rounded-3xl border border-slate-200/80 bg-slate-50/40 hover:bg-white hover:border-blue-300 transition-all space-y-4 relative group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-14 w-14 rounded-2xl border-2 border-slate-200 bg-white overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
                          {leader.photo ? (
                            <img src={leader.photo} alt={leader.name} className="w-full h-full object-cover" />
                          ) : (
                            <User size={24} className="text-slate-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 leading-snug">{leader.name || "Unnamed Leader"}</h4>
                          <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md inline-block mt-0.5">
                            {leader.designation}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingLeader({ ...leader });
                            setIsModalOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded-md"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeLeader(leader.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-md"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {leader.quote && (
                      <p className="text-xs text-slate-600 italic border-l-2 border-amber-400 pl-2 py-0.5">
                        "{leader.quote}"
                      </p>
                    )}

                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                      {leader.message}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase">
                    <span>Leadership Profile</span>
                    <span className="text-blue-600 font-semibold cursor-pointer" onClick={() => { setEditingLeader({ ...leader }); setIsModalOpen(true); }}>
                      Edit Details →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── EDIT / ADD LEADER MODAL ── */}
      {isModalOpen && editingLeader && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-sm uppercase flex items-center gap-2">
                <Crown size={16} className="text-amber-500" />
                Edit Leadership / Founder Profile
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Photo Upload & Preview */}
              <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="h-16 w-16 rounded-xl border border-slate-200 bg-white overflow-hidden flex items-center justify-center shrink-0">
                  {editingLeader.photo ? (
                    <img src={editingLeader.photo} alt="Leader" className="w-full h-full object-cover" />
                  ) : (
                    <Camera size={20} className="text-slate-400" />
                  )}
                </div>
                <div className="space-y-1 flex-1">
                  <input
                    type="file"
                    id="leader-modal-photo"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUploadPhoto(file);
                    }}
                  />
                  <label
                    htmlFor="leader-modal-photo"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-lg cursor-pointer"
                  >
                    <Upload size={12} /> Upload Photo
                  </label>
                  <p className="text-[10px] text-slate-400">Portrait 600x750 px</p>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Leader Full Name</label>
                <Input
                  value={editingLeader.name}
                  onChange={(e) => setEditingLeader({ ...editingLeader, name: e.target.value })}
                  placeholder="e.g. Dr. S. K. Sharma"
                  className="h-9 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Designation / Role (Founder, CEO, Director, Principal)</label>
                <Input
                  value={editingLeader.designation}
                  onChange={(e) => setEditingLeader({ ...editingLeader, designation: e.target.value })}
                  placeholder="e.g. Founder & Chairman / CEO / Principal"
                  className="h-9 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Inspirational 1-Liner Quote</label>
                <Input
                  value={editingLeader.quote}
                  onChange={(e) => setEditingLeader({ ...editingLeader, quote: e.target.value })}
                  placeholder="e.g. Inspiring every child to dream and achieve."
                  className="h-9 rounded-xl italic"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Letter / Vision Message</label>
                <textarea
                  value={editingLeader.message}
                  onChange={(e) => setEditingLeader({ ...editingLeader, message: e.target.value })}
                  placeholder="Detailed leadership message for students and parents..."
                  rows={4}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="outline" onClick={() => setIsModalOpen(false)} className="h-9 text-xs rounded-xl">
                Cancel
              </Button>
              <Button onClick={saveLeaderFromModal} className="h-9 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                Save Profile
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
