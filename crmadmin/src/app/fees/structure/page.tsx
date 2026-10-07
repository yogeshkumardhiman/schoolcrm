"use client";

import React, { useState } from "react";
import { useRouter } from "@bprogress/next/app";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CreditCard,
  Loader2,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Sparkles,
  Building2,
  Calendar,
  Layers,
  FileSpreadsheet,
  Receipt,
  FileText,
  HelpCircle,
  AlertCircle,
  Tag,
  Clock,
  Check
} from "lucide-react";
import client from "@/lib/client";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle, CardDescription, CardContent, CardHeader } from "@/components/ui/card";
import { AppTable } from "@/components/AppTable";
import { ConfirmDialog } from "@/components/dialogbox/ConfirmDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/dialogbox/dialog";
import { AdmissionFeeSlipModal } from "@/features/fees";

const CLASS_ORDER = [
  "NSY",
  "LKG",
  "UKG",
  "1ST",
  "2ND",
  "3RD",
  "4TH",
  "5TH",
  "6TH",
  "7TH",
  "8TH",
  "9TH",
  "10TH",
  "11TH",
  "12TH",
];

const ALL_MONTHS = [
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
  "January",
  "February",
  "March",
];

export default function FeeStructurePage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"structures" | "heads">("structures");

  // Edit Class Structure State
  const [editingClass, setEditingClass] = useState<string | null>(null);
  const [formComponents, setFormComponents] = useState<any[]>([]);
  const [selectedHeadId, setSelectedHeadId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  // Admission Slip Preview Modal State
  const [previewSlipData, setPreviewSlipData] = useState<any | null>(null);
  const [isSlipModalOpen, setIsSlipModalOpen] = useState(false);

  // Fee Head Form States
  const [isAddingHead, setIsAddingHead] = useState(false);
  const [newHead, setNewHead] = useState<any>({
    name: "",
    frequency: "MONTHLY",
    category: "RECURRING",
    isOptional: false,
    collectOnAdmission: true,
    applicableMonths: [],
  });

  const [editingHead, setEditingHead] = useState<any | null>(null);
  const [isEditingHead, setIsEditingHead] = useState(false);

  // 💡 Quick Create Custom Fee Field Modal
  const [isQuickAddModalOpen, setIsQuickAddModalOpen] = useState(false);
  const [quickHeadData, setQuickHeadData] = useState<{
    name: string;
    frequency: string;
    category: string;
    amount: string;
  }>({
    name: "",
    frequency: "ONE_TIME",
    category: "DEVELOPMENT",
    amount: "",
  });

  // Delete Confirmation States
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [feeHeadToDelete, setFeeHeadToDelete] = useState<any | null>(null);

  // 📡 QUERIES
  const { data: schoolInfo } = useQuery({
    queryKey: ["school-info"],
    queryFn: () => client.get("/settings/school-info"),
  });

  const { data: feeHeads = [], isLoading: headsLoading } = useQuery({
    queryKey: ["fee-heads"],
    queryFn: () => client.get("/fees/heads"),
  });

  const { data: structures = [], isLoading: structLoading } = useQuery({
    queryKey: ["fee-structures"],
    queryFn: () => client.get("/fees/structures"),
  });

  // ⚡ MUTATIONS
  const updateMutation = useMutation({
    mutationFn: (data: any) => client.post("/fees/structures", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fee-structures"] });
      toast.success("Class Fee Matrix updated successfully!");
      setEditingClass(null);
    },
    onError: () => toast.error("Failed to save class fee matrix"),
  });

  const addHeadMutation = useMutation({
    mutationFn: (data: any) => client.post("/fees/heads", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fee-heads"] });
      toast.success("New Fee Head registered successfully!");
      setIsAddingHead(false);
      setNewHead({
        name: "",
        frequency: "MONTHLY",
        category: "RECURRING",
        isOptional: false,
        collectOnAdmission: true,
        applicableMonths: [],
      });
    },
    onError: () => toast.error("Failed to register fee head"),
  });

  const updateHeadMutation = useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: any }) =>
      client.put(`/fees/heads/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fee-heads"] });
      toast.success("Fee Head updated successfully!");
      setIsEditingHead(false);
      setEditingHead(null);
    },
    onError: () => toast.error("Failed to update fee head"),
  });

  const deleteHeadMutation = useMutation({
    mutationFn: (id: number | string) => client.delete(`/fees/heads/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fee-heads"] });
      toast.success("Fee Head deleted successfully!");
    },
    onError: () => toast.error("Failed to delete fee head"),
  });

  const handleSaveStructure = () => {
    if (!editingClass) return;
    const activeComponents = formComponents
      .filter((c) => parseFloat(c.amount || 0) > 0)
      .map((c) => ({
        headId: c.feeHeadId || c.headId,
        feeHeadId: c.feeHeadId || c.headId,
        name: c.name,
        amount: parseFloat(c.amount || 0),
        frequency: c.frequency || "ONE_TIME",
      }));

    updateMutation.mutate({
      class: editingClass,
      components: activeComponents,
    });
  };

  const openClassSlipPreview = (cls: string, struct: any) => {
    setPreviewSlipData({
      class: cls,
      session: "2026-2027",
      isClassStructureOnly: true,
    });
    setIsSlipModalOpen(true);
  };

  // 💡 Quick create and immediately attach custom fee field
  const handleQuickCreateAndAttach = async () => {
    if (!quickHeadData.name.trim()) {
      return toast.error("Please enter a name for the new fee field");
    }
    try {
      const createdHead: any = await client.post("/fees/heads", {
        name: quickHeadData.name.trim(),
        frequency: quickHeadData.frequency,
        category: quickHeadData.category,
        isOptional: false,
        collectOnAdmission:
          quickHeadData.frequency === "ONE_TIME" ||
          quickHeadData.category === "ADMISSION" ||
          quickHeadData.category === "DEVELOPMENT",
        applicableMonths: [],
      });

      queryClient.invalidateQueries({ queryKey: ["fee-heads"] });

      const customAmount = Number(quickHeadData.amount || 0);
      setFormComponents((prev) => [
        ...prev,
        {
          feeHeadId: createdHead.id,
          headId: createdHead.id,
          name: createdHead.name,
          amount: customAmount,
          frequency: createdHead.frequency,
        },
      ]);

      setIsQuickAddModalOpen(false);
      setQuickHeadData({
        name: "",
        frequency: "ONE_TIME",
        category: "DEVELOPMENT",
        amount: "",
      });
      toast.success(`Custom Fee Field "${createdHead.name}" created & attached!`);
    } catch (e: any) {
      toast.error(e?.message || "Failed to create custom fee field");
    }
  };

  // ⚡ Load Standard Indian School Package
  const handleLoadStandardPackage = (cls: string) => {
    const standardPresets = [
      { name: "Admission / Registration Fee", defaultAmount: 2000, frequency: "ONE_TIME" },
      { name: "Building & Infrastructure Fund", defaultAmount: 1500, frequency: "ONE_TIME" },
      { name: "Monthly Tuition Fee", defaultAmount: 1200, frequency: "MONTHLY" },
      { name: "Examination & Assessment Fee", defaultAmount: 600, frequency: "HALF_YEARLY" },
      { name: "ID Card, School Diary & Calendar", defaultAmount: 300, frequency: "ONE_TIME" },
    ];

    const attached = standardPresets.map((preset) => {
      const matchedHead = feeHeads.find(
        (h: any) =>
          h.name.toLowerCase().includes(preset.name.toLowerCase().split(" ")[0]) ||
          preset.name.toLowerCase().includes(h.name.toLowerCase().split(" ")[0])
      );
      return {
        feeHeadId: matchedHead?.id || Math.floor(1000 + Math.random() * 9000),
        headId: matchedHead?.id || Math.floor(1000 + Math.random() * 9000),
        name: matchedHead?.name || preset.name,
        amount: preset.defaultAmount,
        frequency: matchedHead?.frequency || preset.frequency,
      };
    });

    setFormComponents(attached);
    toast.success(`Standard School Package loaded for Class ${cls}! You can adjust any amount.`);
  };

  return (
    <div className="flex-1 space-y-8 p-6 sm:p-10 bg-slate-50/50 min-h-screen">
      {/* 🏙️ TOP HERO HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/fees")}
            className="h-12 w-12 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
          >
            <ArrowLeft size={20} />
          </Button>
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                <CreditCard size={18} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase font-heading">
                Dynamic <span className="text-indigo-600">Fee Matrix</span> & Structure
              </h2>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Configure Custom Fee Heads, Grade Mappings & Official Admission Fee Slips
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/60">
          <Button
            onClick={() => setActiveTab("structures")}
            className={cn(
              "h-10 px-6 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer",
              activeTab === "structures"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "bg-transparent text-slate-600 hover:text-slate-900"
            )}
          >
            <Layers size={14} className="mr-1.5" /> Class Mapping Console
          </Button>
          <Button
            onClick={() => setActiveTab("heads")}
            className={cn(
              "h-10 px-6 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer",
              activeTab === "heads"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "bg-transparent text-slate-600 hover:text-slate-900"
            )}
          >
            <Tag size={14} className="mr-1.5" /> Master Fee Heads ({feeHeads.length})
          </Button>
        </div>
      </div>

      {/* 🏷️ TAB 1: MASTER FEE HEADS MANAGER */}
      {activeTab === "heads" && (
        <Card className="rounded-3xl border border-slate-200/80 shadow-sm bg-white overflow-hidden p-6 sm:p-8 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <CardTitle className="text-xl font-black text-slate-900 uppercase font-heading">
                Master <span className="text-indigo-600">Fee Heads Directory</span>
              </CardTitle>
              <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">
                Create custom heads like Building Fee, Development Fund, Smart Class, Computer Lab, etc.
              </CardDescription>
            </div>
            {!isAddingHead && !isEditingHead && (
              <Button
                onClick={() => {
                  setIsAddingHead(true);
                  setIsEditingHead(false);
                  setEditingHead(null);
                }}
                className="h-11 px-6 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
              >
                <Plus size={16} className="mr-2" /> + Register Custom Fee Head
              </Button>
            )}
          </div>

          {/* ➕ NEW FEE HEAD DRAWER FORM */}
          {isAddingHead && (
            <div className="bg-indigo-50/50 border border-indigo-100 p-6 sm:p-8 rounded-3xl mb-8 space-y-6 animate-in slide-in-from-top-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-indigo-900 uppercase tracking-widest flex items-center gap-2">
                  <Sparkles size={16} className="text-indigo-600" /> New Fee Head Component Registration
                </h4>
                <button
                  type="button"
                  onClick={() => setIsAddingHead(false)}
                  className="text-slate-400 hover:text-slate-700 text-xs font-bold uppercase"
                >
                  ✕ Close
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Fee Head Name (e.g. Building Fee, Development Charges, Smart Class)
                  </label>
                  <Input
                    value={newHead.name}
                    onChange={(e) => setNewHead({ ...newHead, name: e.target.value })}
                    className="h-11 bg-white rounded-xl text-xs font-bold"
                    placeholder="Enter fee title (e.g. Building Fund, Lab Fee)"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Billing Frequency
                  </label>
                  <select
                    value={newHead.frequency}
                    onChange={(e) => setNewHead({ ...newHead, frequency: e.target.value })}
                    className="w-full h-11 bg-white border border-slate-200 rounded-xl px-3 text-xs font-bold outline-none cursor-pointer uppercase"
                  >
                    <option value="ONE_TIME">One Time (On Admission)</option>
                    <option value="MONTHLY">Monthly Recurring</option>
                    <option value="QUARTERLY">Quarterly (Every 3 Months)</option>
                    <option value="HALF_YEARLY">Half Yearly (Every 6 Months)</option>
                    <option value="YEARLY">Annual (Yearly)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Fee Category
                  </label>
                  <select
                    value={newHead.category}
                    onChange={(e) => setNewHead({ ...newHead, category: e.target.value })}
                    className="w-full h-11 bg-white border border-slate-200 rounded-xl px-3 text-xs font-bold outline-none cursor-pointer uppercase"
                  >
                    <option value="ADMISSION">Admission Specific</option>
                    <option value="DEVELOPMENT">Building & Infrastructure</option>
                    <option value="RECURRING">Tuition & Operations</option>
                    <option value="OPTIONAL">Optional / Elective</option>
                    <option value="TRANSPORT">Transport / Logistics</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Mandatory or Optional?
                  </label>
                  <select
                    value={newHead.isOptional.toString()}
                    onChange={(e) =>
                      setNewHead({ ...newHead, isOptional: e.target.value === "true" })
                    }
                    className="w-full h-11 bg-white border border-slate-200 rounded-xl px-3 text-xs font-bold outline-none cursor-pointer uppercase"
                  >
                    <option value="false">Mandatory for All Students</option>
                    <option value="true">Optional Component</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Collect on Admission Day?
                  </label>
                  <select
                    value={newHead.collectOnAdmission.toString()}
                    onChange={(e) =>
                      setNewHead({
                        ...newHead,
                        collectOnAdmission: e.target.value === "true",
                      })
                    }
                    className="w-full h-11 bg-white border border-slate-200 rounded-xl px-3 text-xs font-bold outline-none cursor-pointer uppercase"
                  >
                    <option value="true">Yes, Include in Admission Slip</option>
                    <option value="false">No, Bill Separately Later</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAddingHead(false)}
                  className="h-10 px-5 text-xs font-bold uppercase rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => addHeadMutation.mutate(newHead)}
                  disabled={addHeadMutation.isPending || !newHead.name.trim()}
                  className="h-10 px-6 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase rounded-xl shadow-md cursor-pointer"
                >
                  {addHeadMutation.isPending ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : (
                    "Save & Register Fee Head"
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* ✏️ EDIT FEE HEAD DRAWER */}
          {isEditingHead && editingHead && (
            <div className="bg-amber-50/60 border border-amber-200 p-6 sm:p-8 rounded-3xl mb-8 space-y-6 animate-in slide-in-from-top-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-amber-900 uppercase tracking-widest flex items-center gap-2">
                  <Edit2 size={16} className="text-amber-600" /> Edit Fee Head: {editingHead.name}
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingHead(false);
                    setEditingHead(null);
                  }}
                  className="text-slate-400 hover:text-slate-700 text-xs font-bold uppercase"
                >
                  ✕ Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Fee Head Name
                  </label>
                  <Input
                    value={editingHead.name}
                    onChange={(e) => setEditingHead({ ...editingHead, name: e.target.value })}
                    className="h-11 bg-white rounded-xl text-xs font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Billing Frequency
                  </label>
                  <select
                    value={editingHead.frequency}
                    onChange={(e) =>
                      setEditingHead({ ...editingHead, frequency: e.target.value })
                    }
                    className="w-full h-11 bg-white border border-slate-200 rounded-xl px-3 text-xs font-bold outline-none cursor-pointer uppercase"
                  >
                    <option value="ONE_TIME">One Time (On Admission)</option>
                    <option value="MONTHLY">Monthly Recurring</option>
                    <option value="QUARTERLY">Quarterly</option>
                    <option value="HALF_YEARLY">Half Yearly</option>
                    <option value="YEARLY">Annual</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Fee Category
                  </label>
                  <select
                    value={editingHead.category || "RECURRING"}
                    onChange={(e) =>
                      setEditingHead({ ...editingHead, category: e.target.value })
                    }
                    className="w-full h-11 bg-white border border-slate-200 rounded-xl px-3 text-xs font-bold outline-none cursor-pointer uppercase"
                  >
                    <option value="ADMISSION">Admission Specific</option>
                    <option value="DEVELOPMENT">Building & Infrastructure</option>
                    <option value="RECURRING">Tuition & Operations</option>
                    <option value="OPTIONAL">Optional / Elective</option>
                    <option value="TRANSPORT">Transport</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditingHead(false);
                    setEditingHead(null);
                  }}
                  className="h-10 px-5 text-xs font-bold uppercase rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() =>
                    updateHeadMutation.mutate({ id: editingHead.id, data: editingHead })
                  }
                  disabled={updateHeadMutation.isPending || !editingHead.name}
                  className="h-10 px-6 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black uppercase rounded-xl shadow-md cursor-pointer"
                >
                  {updateHeadMutation.isPending ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : (
                    "Update Fee Head"
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* 📋 TABLE OF ALL REGISTERED FEE HEADS */}
          <AppTable
            columns={[
              {
                header: "ID",
                cell: (h: any) => (
                  <span className="font-mono text-xs font-bold text-slate-400">#{h.id}</span>
                ),
              },
              {
                header: "Component Name",
                cell: (h: any) => (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900 uppercase">{h.name}</span>
                    {h.category === "DEVELOPMENT" && (
                      <Badge className="bg-purple-50 text-purple-700 border-purple-100 text-[8px] font-black uppercase">
                        Building & Infra
                      </Badge>
                    )}
                  </div>
                ),
              },
              {
                header: "Frequency",
                cell: (h: any) => (
                  <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 text-[9px] font-black uppercase tracking-wider">
                    {h.frequency === "ONE_TIME" ? "On Admission" : h.frequency}
                  </Badge>
                ),
              },
              {
                header: "Collect on Admission",
                cell: (h: any) => (
                  <Badge
                    className={cn(
                      "text-[9px] font-black uppercase",
                      h.collectOnAdmission
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                        : "bg-slate-100 text-slate-500 border-slate-200"
                    )}
                  >
                    {h.collectOnAdmission ? "✓ Yes (In Admission Slip)" : "No"}
                  </Badge>
                ),
              },
              {
                header: "Type",
                cell: (h: any) => (
                  <span
                    className={cn(
                      "text-[10px] font-black tracking-wider px-2.5 py-1 rounded-md",
                      h.isOptional
                        ? "text-amber-700 bg-amber-50 border border-amber-100"
                        : "text-emerald-700 bg-emerald-50 border border-emerald-100"
                    )}
                  >
                    {h.isOptional ? "OPTIONAL" : "MANDATORY"}
                  </span>
                ),
              },
              {
                header: "Actions",
                cell: (h: any) => (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingHead(h);
                        setIsEditingHead(true);
                        setIsAddingHead(false);
                      }}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all cursor-pointer"
                      title="Edit Fee Head"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => {
                        setFeeHeadToDelete(h);
                        setDeleteConfirmOpen(true);
                      }}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                      title="Delete Fee Head"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ),
              },
            ]}
            data={feeHeads}
            isLoading={headsLoading}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </Card>
      )}

      {/* 📚 TAB 2: CLASS MAPPING CONSOLE */}
      {activeTab === "structures" && (
        <Card className="rounded-3xl border border-slate-200/80 shadow-sm bg-white overflow-hidden p-6 sm:p-8 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <CardTitle className="text-xl font-black text-slate-900 uppercase font-heading">
                Class Mapping <span className="text-indigo-600">Console</span>
              </CardTitle>
              <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">
                Map custom fee components and configure admission packages for each academic grade
              </CardDescription>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {(() => {
              const rawMax = schoolInfo?.maxClass || "12TH";
              const normalizedMax = rawMax.toUpperCase();
              const matchedIndex = CLASS_ORDER.findIndex((c) => normalizedMax.startsWith(c) || normalizedMax.includes(c));
              const cleanDigits = normalizedMax.replace(/\D/g, "");
              const fallbackIndex = cleanDigits ? CLASS_ORDER.findIndex((c) => c.startsWith(cleanDigits)) : -1;
              const maxIndex = matchedIndex !== -1 ? matchedIndex : fallbackIndex;
              const activeClasses =
                maxIndex !== -1 ? CLASS_ORDER.slice(0, maxIndex + 1) : CLASS_ORDER;

              return activeClasses.map((cls: string) => {
                const struct = structures.find((s: any) => s.class === cls) || {
                  class: cls,
                  components: [],
                };
                const isEditing = editingClass === cls;
                const comps = struct.components || [];

                // Calculate Totals for this class
                const totalAdmissionFee = comps
                  .filter((c: any) => c.frequency === "ONE_TIME" || c.collectOnAdmission !== false)
                  .reduce((sum: number, c: any) => sum + Number(c.amount || 0), 0);

                const totalMonthlyTuition = comps
                  .filter((c: any) => c.frequency === "MONTHLY")
                  .reduce((sum: number, c: any) => sum + Number(c.amount || 0), 0);

                return (
                  <div
                    key={cls}
                    className="border border-slate-200/70 rounded-3xl p-6 bg-slate-50/50 hover:bg-white hover:shadow-xl transition-all duration-300 ring-1 ring-slate-100"
                  >
                    {/* CLASS CARD HEADER */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-slate-900 text-white shadow-md flex items-center justify-center font-black text-xl font-heading">
                          {cls}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-black text-slate-900 uppercase font-heading">
                              Class {cls} Fee Matrix
                            </h4>
                            <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 text-[10px] font-black uppercase">
                              {comps.length} Heads Registered
                            </Badge>
                          </div>

                          <div className="flex items-center gap-3 mt-1 text-[11px] font-bold">
                            <span className="text-emerald-700">
                              Admission Package: <strong>₹{totalAdmissionFee.toLocaleString()}</strong>
                            </span>
                            <span>•</span>
                            <span className="text-indigo-700">
                              Monthly Tuition: <strong>₹{totalMonthlyTuition.toLocaleString()}</strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* ACTION BUTTONS */}
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => openClassSlipPreview(cls, struct)}
                          className="h-10 px-4 rounded-xl border-slate-200 text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 text-[11px] font-black uppercase cursor-pointer"
                        >
                          <FileText size={14} className="mr-1.5 text-indigo-500" /> View Class Fee Prospectus
                        </Button>

                        {isEditing ? (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingClass(null)}
                              className="h-10 px-4 text-xs font-bold uppercase text-slate-600 rounded-xl"
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={handleSaveStructure}
                              disabled={updateMutation.isPending}
                              className="h-10 px-5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase rounded-xl shadow-md shadow-emerald-600/20 cursor-pointer"
                            >
                              {updateMutation.isPending ? (
                                <Loader2 className="animate-spin" size={14} />
                              ) : (
                                "Save Matrix"
                              )}
                            </Button>
                          </div>
                        ) : (
                          <Button
                            onClick={() => {
                              setEditingClass(cls);
                              const initialData = (struct.components || []).map((c: any) => ({
                                feeHeadId: c.feeHeadId || c.headId,
                                headId: c.feeHeadId || c.headId,
                                name: c.name,
                                amount: c.amount,
                                frequency: c.frequency || "ONE_TIME",
                              }));
                              setFormComponents(initialData);
                            }}
                            className="h-10 px-5 bg-slate-900 hover:bg-indigo-600 text-white font-black uppercase text-xs tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
                          >
                            <Edit2 size={13} className="mr-1.5" /> Modify Setup
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* EDITING FORM */}
                    {isEditing ? (
                      <div className="space-y-6 pt-4 border-t border-slate-200/80 animate-in fade-in">
                        <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-end justify-between bg-white p-5 rounded-2xl border border-slate-200">
                          <div className="flex flex-col sm:flex-row gap-3 items-end w-full lg:max-w-2xl">
                            <div className="flex-1 space-y-1.5 w-full">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">
                                Select Fee Head to Attach to Class {cls}
                              </label>
                              <select
                                value={selectedHeadId}
                                onChange={(e) => setSelectedHeadId(e.target.value)}
                                className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-bold outline-none cursor-pointer text-slate-800 uppercase"
                              >
                                <option value="">-- Choose from Master Catalog --</option>
                                {feeHeads
                                  .filter(
                                    (h: any) =>
                                      !formComponents.some(
                                        (fc) => (fc.feeHeadId || fc.headId) === h.id
                                      )
                                  )
                                  .map((h: any) => (
                                    <option key={h.id} value={h.id}>
                                      {h.name} ({h.frequency === "ONE_TIME" ? "On Admission" : h.frequency})
                                    </option>
                                  ))}
                              </select>
                            </div>
                            <Button
                              type="button"
                              onClick={() => {
                                if (!selectedHeadId) return toast.error("Please select a fee head first");
                                const head = feeHeads.find((h: any) => h.id == selectedHeadId);
                                if (head) {
                                  setFormComponents([
                                    ...formComponents,
                                    {
                                      feeHeadId: head.id,
                                      headId: head.id,
                                      name: head.name,
                                      amount: 0,
                                      frequency: head.frequency,
                                    },
                                  ]);
                                  setSelectedHeadId("");
                                  toast.success(`${head.name} attached!`);
                                }
                              }}
                              className="h-11 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-xs tracking-wider rounded-xl transition-all shadow-md shrink-0 cursor-pointer"
                            >
                              + Attach Fee Head
                            </Button>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 w-full lg:w-auto">
                            <Button
                              type="button"
                              onClick={() => setIsQuickAddModalOpen(true)}
                              variant="outline"
                              className="h-11 px-4 border-amber-300 bg-amber-50/60 hover:bg-amber-100/70 text-amber-900 font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer flex items-center gap-1.5 shadow-2xs"
                            >
                              <Plus size={15} className="text-amber-700" /> + Add Custom Fee Field 💡
                            </Button>

                            <Button
                              type="button"
                              onClick={() => handleLoadStandardPackage(cls)}
                              className="h-11 px-4 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer flex items-center gap-1.5 shadow-md"
                            >
                              <Sparkles size={14} className="text-amber-400" /> ⚡ Load Standard Package
                            </Button>
                          </div>
                        </div>

                        {formComponents.length === 0 ? (
                          <div className="p-8 text-center bg-slate-50/80 rounded-2xl border-2 border-dashed border-slate-200 space-y-3">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                              No fee heads attached to Class {cls} yet.
                            </p>
                            <div className="flex justify-center gap-3">
                              <Button
                                type="button"
                                onClick={() => handleLoadStandardPackage(cls)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase px-5 h-10 rounded-xl cursor-pointer shadow-md shadow-emerald-600/20"
                              >
                                ⚡ Click to Load Standard School Package (Admission, Building, Tuition, Exam, ID Card)
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {formComponents.map((comp, idx) => (
                              <div
                                key={comp.feeHeadId || comp.headId || idx}
                                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative group animate-in zoom-in-95 duration-200"
                              >
                                <div className="flex justify-between items-center mb-2.5">
                                  <div>
                                    <p className="text-xs font-black text-slate-800 uppercase tracking-tight truncate max-w-[140px]">
                                      {comp.name}
                                    </p>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase">
                                      {comp.frequency === "ONE_TIME" ? "On Admission" : comp.frequency || "Monthly"}
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setFormComponents(
                                        formComponents.filter(
                                          (c) =>
                                            (c.feeHeadId || c.headId) !==
                                            (comp.feeHeadId || comp.headId)
                                        )
                                      );
                                      toast.success(`${comp.name} detached`);
                                    }}
                                    className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                                    ₹
                                  </span>
                                  <Input
                                    type="number"
                                    value={comp.amount}
                                    onChange={(e) => {
                                      const newComps = [...formComponents];
                                      newComps[idx].amount = e.target.value;
                                      setFormComponents(newComps);
                                    }}
                                    className="pl-8 h-11 bg-slate-50 border-slate-200 focus:border-indigo-500 focus:bg-white font-bold text-slate-900 rounded-xl text-xs font-mono"
                                    placeholder="0"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      /* DISPLAY ATTACHED COMPONENTS */
                      <div className="flex flex-wrap gap-3 pt-3 border-t border-slate-200/60">
                        {comps.length === 0 ? (
                          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider py-2">
                            No fee components registered. Click "Modify Setup" to add components.
                          </div>
                        ) : (
                          comps.map((c: any, i: number) => (
                            <div
                              key={c.feeHeadId || c.headId || i}
                              className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-4 min-w-[140px]"
                            >
                              <div>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block truncate max-w-[110px]">
                                  {c.name}
                                </span>
                                <span className="text-[8px] font-bold text-slate-400 uppercase">
                                  {c.frequency === "ONE_TIME" ? "On Admission" : c.frequency || "Monthly"}
                                </span>
                              </div>
                              <span className="text-xs font-black text-slate-900 font-mono">
                                ₹{parseFloat(c.amount || 0).toLocaleString()}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              });
            })()}
          </div>
        </Card>
      )}

      {/* 🧾 ADMISSION FEE SLIP PREVIEW MODAL */}
      <AdmissionFeeSlipModal
        isOpen={isSlipModalOpen}
        onOpenChange={setIsSlipModalOpen}
        studentData={previewSlipData}
      />

      {/* ⚠️ DELETE FEE HEAD CONFIRMATION DIALOG */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setFeeHeadToDelete(null);
        }}
        onConfirm={() => {
          if (feeHeadToDelete) {
            deleteHeadMutation.mutate(feeHeadToDelete.id);
            setDeleteConfirmOpen(false);
            setFeeHeadToDelete(null);
          }
        }}
        title="Delete Fee Head?"
        description={
          feeHeadToDelete
            ? `Are you sure you want to permanently delete "${feeHeadToDelete.name}"? This fee head will be detached from class structures.`
            : "Are you sure you want to delete this fee head?"
        }
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {/* 💡 QUICK CREATE CUSTOM FEE FIELD MODAL */}
      <Dialog open={isQuickAddModalOpen} onOpenChange={setIsQuickAddModalOpen}>
        <DialogContent className="max-w-md p-6 bg-white rounded-3xl border border-slate-200 shadow-2xl">
          <DialogHeader className="border-b border-slate-100 pb-4">
            <DialogTitle className="text-lg font-black uppercase text-slate-900 flex items-center gap-2">
              <Plus className="text-amber-600" size={20} /> Add Custom Fee Field
            </DialogTitle>
            <p className="text-xs text-slate-400 font-bold uppercase mt-1">
              Create a custom fee component and attach it to Class {editingClass || "Structure"}
            </p>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Fee Field Name *
              </label>
              <Input
                placeholder="e.g. Computer Science Fee, Hostel Fee, Lab Fee"
                value={quickHeadData.name}
                onChange={(e) => setQuickHeadData({ ...quickHeadData, name: e.target.value })}
                className="h-11 rounded-xl text-xs font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Billing Frequency
                </label>
                <select
                  value={quickHeadData.frequency}
                  onChange={(e) => setQuickHeadData({ ...quickHeadData, frequency: e.target.value })}
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs font-bold uppercase outline-none"
                >
                  <option value="ONE_TIME">One-Time (Admission)</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="QUARTERLY">Quarterly</option>
                  <option value="HALF_YEARLY">Half-Yearly</option>
                  <option value="ANNUAL">Annual</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Category
                </label>
                <select
                  value={quickHeadData.category}
                  onChange={(e) => setQuickHeadData({ ...quickHeadData, category: e.target.value })}
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs font-bold uppercase outline-none"
                >
                  <option value="ADMISSION">Admission</option>
                  <option value="DEVELOPMENT">Development / Infra</option>
                  <option value="RECURRING">Tuition / Recurring</option>
                  <option value="EXAM">Examination</option>
                  <option value="ANNUAL">Annual Activity</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Amount for Class {editingClass || "This Grade"} (₹)
              </label>
              <Input
                type="number"
                placeholder="0"
                value={quickHeadData.amount}
                onChange={(e) => setQuickHeadData({ ...quickHeadData, amount: e.target.value })}
                className="h-11 rounded-xl text-xs font-bold font-mono"
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsQuickAddModalOpen(false)}
              className="h-11 px-4 text-xs font-bold uppercase rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleQuickCreateAndAttach}
              className="h-11 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer"
            >
              Create & Attach Field
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
