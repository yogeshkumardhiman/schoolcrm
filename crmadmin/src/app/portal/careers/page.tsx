"use client";

import React, { useState, useEffect } from "react";
import {
  Briefcase,
  Save,
  Loader2,
  Plus,
  Trash2,
  Pencil,
  Sparkles,
  CheckCircle2,
  Clock,
  GraduationCap,
  MapPin,
  X,
  Phone,
  Mail,
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import client from "@/lib/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WebsiteNavHeader } from "../components/WebsiteNavHeader";

interface JobOpening {
  id: number;
  title: string;
  department: string;
  type: string;
  experience: string;
  qualification: string;
  location: string;
  description: string;
  requirements: string[];
  isActive?: boolean;
}

export default function CareerSettingsPage() {
  const queryClient = useQueryClient();
  const [jobs, setJobs] = useState<JobOpening[]>([]);
  const [hrConfig, setHrConfig] = useState({
    sessionTag: "",
    headline: "",
    subheadline: "",
    hrPhone: "",
    hrEmail: "",
    walkinTimings: ""
  });

  // Modal / Form state for adding/editing job
  const [editingJob, setEditingJob] = useState<JobOpening | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newReq, setNewReq] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["school-info"],
    queryFn: async () => {
      const res: any = await client.get("/settings/school-info");
      return res?.data || res || {};
    }
  });

  useEffect(() => {
    if (data?.careers_config) {
      if (Array.isArray(data.careers_config.jobs)) {
        setJobs(data.careers_config.jobs);
      }
      if (data.careers_config.hrConfig) {
        setHrConfig((prev) => ({ ...prev, ...data.careers_config.hrConfig }));
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
      toast.success("Career job postings & HR settings saved successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to save career settings");
    }
  });

  const handleSave = () => {
    saveMutation.mutate({
      careers_config: {
        jobs,
        hrConfig
      }
    });
  };

  const openAddModal = () => {
    setEditingJob({
      id: Date.now(),
      title: "",
      department: "Senior Secondary",
      type: "Full Time",
      experience: "",
      qualification: "",
      location: "",
      description: "",
      requirements: [],
      isActive: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (job: JobOpening) => {
    setEditingJob({ ...job, requirements: [...job.requirements] });
    setIsModalOpen(true);
  };

  const saveJobFromModal = () => {
    if (!editingJob || !editingJob.title.trim()) {
      toast.error("Please enter a Job Title");
      return;
    }
    const index = jobs.findIndex((j) => j.id === editingJob.id);
    if (index >= 0) {
      const updated = [...jobs];
      updated[index] = editingJob;
      setJobs(updated);
      toast.success("Job posting updated! Click 'Save Career Settings' to publish.");
    } else {
      setJobs([editingJob, ...jobs]);
      toast.success("New job opening added! Click 'Save Career Settings' to publish.");
    }
    setIsModalOpen(false);
    setEditingJob(null);
  };

  const deleteJob = (id: number) => {
    setJobs(jobs.filter((j) => j.id !== id));
    toast.success("Job opening removed");
  };

  const toggleJobStatus = (id: number) => {
    setJobs(
      jobs.map((j) => (j.id === id ? { ...j, isActive: j.isActive === false ? true : false } : j))
    );
  };

  const addRequirement = () => {
    if (!newReq.trim() || !editingJob) return;
    setEditingJob({
      ...editingJob,
      requirements: [...editingJob.requirements, newReq.trim()]
    });
    setNewReq("");
  };

  const removeRequirement = (idx: number) => {
    if (!editingJob) return;
    setEditingJob({
      ...editingJob,
      requirements: editingJob.requirements.filter((_, i) => i !== idx)
    });
  };

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="animate-spin text-blue-600 h-8 w-8" />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Loading Careers Console...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50/50 min-h-screen">
      <WebsiteNavHeader
        title="Career & Faculty Job Openings"
        description="Manage faculty vacancies, eligibility requirements, teaching wings, and HR contact coordinates displayed on the public career portal."
        actionButton={
          <Button
            type="button"
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer"
          >
            {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Career Settings
          </Button>
        }
      />

      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* Left Column: HR Helpdesk Settings (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="shadow-sm border-slate-200/80 rounded-3xl overflow-hidden bg-white">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
              <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Sparkles size={16} className="text-blue-600" />
                HR Recruitment Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">Active Session Ribbon</label>
                <Input
                  value={hrConfig.sessionTag}
                  onChange={(e) => setHrConfig({ ...hrConfig, sessionTag: e.target.value })}
                  placeholder="FACULTY RECRUITMENT • 2026-27"
                  className="h-9 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">Recruitment HR Phone</label>
                <Input
                  value={hrConfig.hrPhone}
                  onChange={(e) => setHrConfig({ ...hrConfig, hrPhone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="h-9 rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">Careers Email Inbox</label>
                <Input
                  value={hrConfig.hrEmail}
                  onChange={(e) => setHrConfig({ ...hrConfig, hrEmail: e.target.value })}
                  placeholder="e.g. careers@school.edu"
                  className="h-9 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">Walk-in Interview Timings</label>
                <Input
                  value={hrConfig.walkinTimings}
                  onChange={(e) => setHrConfig({ ...hrConfig, walkinTimings: e.target.value })}
                  placeholder="e.g. Mon – Sat (10:00 AM – 2:00 PM)"
                  className="h-9 rounded-xl text-xs"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Active Job Vacancies Registry (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="shadow-sm border-slate-200/80 rounded-3xl overflow-hidden bg-white">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Briefcase size={16} className="text-blue-600" />
                  Active Vacancy Registry ({jobs.length})
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">Live teaching & administrative vacancies on the public career portal</p>
              </div>
              <Button
                type="button"
                onClick={openAddModal}
                className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus size={14} /> Add Job Opening
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {jobs.length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                  <Briefcase className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">No Job Openings Listed</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Publish faculty, teaching, and administrative vacancies on the public portal.
                  </p>
                  <Button
                    type="button"
                    onClick={openAddModal}
                    className="mt-4 h-8 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                  >
                    <Plus size={13} className="mr-1" /> Add Job Opening
                  </Button>
                </div>
              ) : (
                jobs.map((job) => (
                <div
                  key={job.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    job.isActive !== false
                      ? "border-slate-200/80 bg-slate-50/40 hover:bg-white hover:border-blue-300"
                      : "border-slate-200 bg-slate-100/50 opacity-60"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-slate-900">{job.title}</h4>
                        <Badge variant="outline" className="text-[9px] font-black uppercase text-blue-600 bg-blue-50 border-blue-200">
                          {job.department}
                        </Badge>
                        {job.isActive === false && (
                          <Badge variant="outline" className="text-[9px] font-bold text-amber-600 bg-amber-50 border-amber-200">
                            Hidden / Closed
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs font-medium text-slate-500">
                        {job.qualification} • <span className="font-semibold text-slate-700">{job.experience}</span> • {job.location}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleJobStatus(job.id)}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex items-center gap-1 cursor-pointer"
                        title="Toggle Active Status"
                      >
                        {job.isActive !== false ? <ToggleRight size={14} className="text-emerald-600" /> : <ToggleLeft size={14} className="text-slate-400" />}
                        <span>{job.isActive !== false ? "Live" : "Paused"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openEditModal(job)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                        title="Edit Job"
                      >
                        <Pencil size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteJob(job.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Delete Job"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>
                </div>
              ))
            )}
            </CardContent>
          </Card>
        </div>

      </div>

      {/* ── JOB ADD / EDIT MODAL ── */}
      {isModalOpen && editingJob && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Briefcase size={18} className="text-blue-600" />
                {editingJob.id && jobs.some((j) => j.id === editingJob.id) ? "Edit Job Vacancy" : "Create New Job Vacancy"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Job Title *</label>
                  <Input
                    value={editingJob.title}
                    onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                    placeholder="e.g. PGT - Senior Physics"
                    className="h-10 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Department / Wing *</label>
                  <select
                    value={editingJob.department}
                    onChange={(e) => setEditingJob({ ...editingJob, department: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-medium focus:outline-hidden focus:border-blue-500"
                  >
                    <option value="Senior Secondary">Senior Secondary (XI - XII)</option>
                    <option value="Secondary">Secondary (VI - X)</option>
                    <option value="Primary">Primary (I - V)</option>
                    <option value="Pre-Primary">Pre-Primary (Nursery / KG)</option>
                    <option value="Sports & Fitness">Sports & Fitness</option>
                    <option value="Administration">Administration & Labs</option>
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Job Type</label>
                  <Input
                    value={editingJob.type}
                    onChange={(e) => setEditingJob({ ...editingJob, type: e.target.value })}
                    placeholder="Full Time / Permanent"
                    className="h-9 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Experience Required</label>
                  <Input
                    value={editingJob.experience}
                    onChange={(e) => setEditingJob({ ...editingJob, experience: e.target.value })}
                    placeholder="e.g. 2-5 Years"
                    className="h-9 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Campus Location</label>
                  <Input
                    value={editingJob.location}
                    onChange={(e) => setEditingJob({ ...editingJob, location: e.target.value })}
                    placeholder="Main Campus"
                    className="h-9 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">Minimum Qualification *</label>
                <Input
                  value={editingJob.qualification}
                  onChange={(e) => setEditingJob({ ...editingJob, qualification: e.target.value })}
                  placeholder="e.g. M.Sc. Physics + B.Ed. mandatory"
                  className="h-10 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">Role Description</label>
                <textarea
                  value={editingJob.description}
                  onChange={(e) => setEditingJob({ ...editingJob, description: e.target.value })}
                  placeholder="Describe expectations, subject scope, and teaching methodology..."
                  rows={3}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 font-medium"
                />
              </div>

              {/* Requirements Checklist */}
              <div>
                <label className="font-bold text-slate-700 mb-1.5 block">Key Eligibility Requirements</label>
                <div className="space-y-2 mb-2">
                  {editingJob.requirements.map((req, rIdx) => (
                    <div key={rIdx} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-700">{req}</span>
                      <button
                        type="button"
                        onClick={() => removeRequirement(rIdx)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newReq}
                    onChange={(e) => setNewReq(e.target.value)}
                    placeholder="Add bullet requirement..."
                    className="h-9 rounded-xl"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addRequirement();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={addRequirement}
                    className="h-9 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="h-10 px-5 rounded-xl font-bold text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={saveJobFromModal}
                className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs"
              >
                Save Job Opening
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
