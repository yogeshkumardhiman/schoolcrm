"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Save,
  Loader2,
  Plus,
  Trash2,
  CheckCircle2,
  FileCheck,
  ClipboardList
} from "lucide-react";
import client from "@/lib/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { WebsiteNavHeader } from "../components/WebsiteNavHeader";

interface AdmissionStep {
  step: number;
  title: string;
  desc: string;
  badge?: string;
}

export default function AdmissionsSettingsPage() {
  const queryClient = useQueryClient();
  const [timeline, setTimeline] = useState<AdmissionStep[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ["school-info"],
    queryFn: async () => {
      const res: any = await client.get("/settings/school-info");
      return res?.data || res || {};
    }
  });

  useEffect(() => {
    if (data) {
      if (Array.isArray(data.admissionTimeline)) {
        setTimeline(data.admissionTimeline);
      } else {
        setTimeline([]);
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
      toast.success("Admissions roadmap saved successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to save admissions roadmap");
    }
  });

  const handleSave = () => {
    saveMutation.mutate({ admissionTimeline: timeline });
  };

  const addStep = () => {
    setTimeline((prev) => [
      ...prev,
      {
        step: prev.length + 1,
        title: "",
        desc: "",
        badge: `Step 0${prev.length + 1}`
      }
    ]);
  };

  const updateStep = (index: number, key: keyof AdmissionStep, val: any) => {
    const updated = [...timeline];
    updated[index] = { ...updated[index], [key]: val };
    setTimeline(updated);
  };

  const removeStep = (index: number) => {
    setTimeline(timeline.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="animate-spin text-blue-600 h-8 w-8" />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Loading Admissions Process...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50/50 min-h-screen">
      <WebsiteNavHeader
        title="Admissions Roadmap & Timeline"
        description="Configure the sequential admission journey guide and registration instructions for prospective parents."
        actionButton={
          <Button
            type="button"
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer"
          >
            {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Admissions Process
          </Button>
        }
      />

      <Card className="shadow-sm border-slate-200/80 rounded-3xl overflow-hidden bg-white">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={16} className="text-blue-600" />
              Admission Stages Sequence
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">Timeline roadmap rendered on the public website Admissions page</p>
          </div>
          <Button
            type="button"
            onClick={addStep}
            className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus size={14} /> Add Stage
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          {timeline.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <ClipboardList className="h-10 w-10 text-slate-300 mb-3" />
              <h3 className="text-sm font-bold text-slate-700">No Admission Stages Configured</h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4">
                Configure your school's step-by-step admissions roadmap for prospective parents and students.
              </p>
              <Button
                type="button"
                onClick={addStep}
                className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus size={14} /> Add First Stage
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {timeline.map((step, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/40 hover:border-blue-300 hover:bg-white transition-all space-y-3 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-md font-mono">
                      {step.badge || `Stage 0${idx + 1}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeStep(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors cursor-pointer"
                      title="Delete Stage"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">Stage Headline</label>
                    <Input
                      value={step.title}
                      onChange={(e) => updateStep(idx, "title", e.target.value)}
                      placeholder="e.g. Online Registration"
                      className="h-9 rounded-xl font-bold text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">Stage Action Details</label>
                    <textarea
                      value={step.desc}
                      onChange={(e) => updateStep(idx, "desc", e.target.value)}
                      placeholder="Detailed explanation of required steps..."
                      rows={3}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:border-blue-500 focus:outline-hidden transition-all"
                    />
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
