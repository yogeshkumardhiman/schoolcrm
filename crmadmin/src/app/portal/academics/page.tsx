"use client";

import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  Save,
  Loader2,
  Plus,
  Trash2,
  BookOpen,
  Sparkles,
  Trophy,
  Users,
  Award
} from "lucide-react";
import client from "@/lib/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { WebsiteNavHeader } from "../components/WebsiteNavHeader";

interface AcademicWing {
  id: string;
  name: string;
  grades: string;
  desc: string;
  focus: string;
}

export default function AcademicsSettingsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    academicWings: [] as AcademicWing[],
    statTotalStudents: "",
    statQualifiedFaculty: "",
    statSportsTrophies: "",
    statBoardPassRate: ""
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
        academicWings: Array.isArray(data.academicWings) ? data.academicWings : [],
        statTotalStudents: data.statTotalStudents || "",
        statQualifiedFaculty: data.statQualifiedFaculty || "",
        statSportsTrophies: data.statSportsTrophies || "",
        statBoardPassRate: data.statBoardPassRate || ""
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
      toast.success("Academic wings and statistics saved successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to save academics settings");
    }
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(form);
  };

  const addWing = () => {
    setForm((prev) => ({
      ...prev,
      academicWings: [
        ...prev.academicWings,
        { id: Date.now().toString(), name: "", grades: "", desc: "", focus: "" }
      ]
    }));
  };

  const updateWing = (index: number, key: keyof AcademicWing, val: string) => {
    const updated = [...form.academicWings];
    updated[index] = { ...updated[index], [key]: val };
    setForm((prev) => ({ ...prev, academicWings: updated }));
  };

  const removeWing = (index: number) => {
    const updated = form.academicWings.filter((_, i) => i !== index);
    setForm((prev) => ({ ...prev, academicWings: updated }));
  };

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="animate-spin text-blue-600 h-8 w-8" />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Loading Academics & Wings...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50/50 min-h-screen">
      <WebsiteNavHeader
        title="Academic Wings & Statistical Counters"
        description="Configure pedagogical branches (Pre-Primary to Senior Secondary) and official school achievements counter metrics."
        actionButton={
          <Button
            type="button"
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer"
          >
            {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Academics
          </Button>
        }
      />

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Academic Wings */}
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-sm border-slate-200/80 rounded-3xl overflow-hidden bg-white">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <BookOpen size={16} className="text-blue-600" />
                  Institutional Academic Wings
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">Classes & pedagogical streams showcased on public portal</p>
              </div>
              <Button
                type="button"
                onClick={addWing}
                className="h-8 px-3 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold flex items-center gap-1"
              >
                <Plus size={13} /> Add Wing
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {form.academicWings.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                  <BookOpen className="h-10 w-10 text-slate-300 mb-3" />
                  <h3 className="text-sm font-bold text-slate-700">No Academic Wings Configured</h3>
                  <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4">
                    Configure your school's pedagogical divisions (e.g., Pre-Primary, Primary, Middle, Senior Secondary) to showcase on the portal.
                  </p>
                  <Button
                    type="button"
                    onClick={addWing}
                    className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={13} /> Add First Wing
                  </Button>
                </div>
              ) : (
                form.academicWings.map((wing, idx) => (
                  <div
                    key={wing.id || idx}
                    className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">
                        Wing #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeWing(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors"
                        title="Delete Wing"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">Wing Name</label>
                        <Input
                          value={wing.name}
                          onChange={(e) => updateWing(idx, "name", e.target.value)}
                          placeholder="e.g. Primary Wing"
                          className="h-9 rounded-xl font-bold text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">Grades / Classes Covered</label>
                        <Input
                          value={wing.grades}
                          onChange={(e) => updateWing(idx, "grades", e.target.value)}
                          placeholder="e.g. Classes I to V"
                          className="h-9 rounded-xl text-xs bg-white font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">Pedagogical Summary</label>
                      <textarea
                        value={wing.desc}
                        onChange={(e) => updateWing(idx, "desc", e.target.value)}
                        placeholder="Summary of learning methodology and facilities..."
                        rows={2}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:border-blue-500 focus:outline-hidden transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">Special Core Focus</label>
                      <Input
                        value={wing.focus}
                        onChange={(e) => updateWing(idx, "focus", e.target.value)}
                        placeholder="e.g. STEM Labs & Conceptual Thinking"
                        className="h-9 rounded-xl text-xs bg-white"
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1 Col): Achievement Metrics */}
        <div className="space-y-6">
          <Card className="shadow-sm border-slate-200/80 rounded-3xl overflow-hidden bg-white">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
              <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Trophy size={16} className="text-amber-500" />
                Live Achievement Counters
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="text-[11px] font-black uppercase text-slate-500 mb-1 block">Total Enrolled Scholars</label>
                <Input
                  value={form.statTotalStudents}
                  onChange={(e) => setForm({ ...form, statTotalStudents: e.target.value })}
                  placeholder="e.g. 1200+"
                  className="h-10 rounded-xl font-bold text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-black uppercase text-slate-500 mb-1 block">Qualified Educators & Staff</label>
                <Input
                  value={form.statQualifiedFaculty}
                  onChange={(e) => setForm({ ...form, statQualifiedFaculty: e.target.value })}
                  placeholder="e.g. 65+"
                  className="h-10 rounded-xl font-bold text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-black uppercase text-slate-500 mb-1 block">Sports & Academic Accolades</label>
                <Input
                  value={form.statSportsTrophies}
                  onChange={(e) => setForm({ ...form, statSportsTrophies: e.target.value })}
                  placeholder="e.g. 40+"
                  className="h-10 rounded-xl font-bold text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-black uppercase text-slate-500 mb-1 block">CBSE Board Success Rate</label>
                <Input
                  value={form.statBoardPassRate}
                  onChange={(e) => setForm({ ...form, statBoardPassRate: e.target.value })}
                  placeholder="e.g. 100%"
                  className="h-10 rounded-xl font-bold text-xs font-mono"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
