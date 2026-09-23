"use client";
import client from "@/lib/client";

import React, { useState } from "react";
import {
  Receipt,
  Plus,
  Loader2,
  Edit2,
  Trash2,
  DollarSign,
  Percent,
  CheckCircle,
  XCircle,
  IndianRupeeIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

import toast from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/dialogbox/ConfirmDialog";

export default function FeeSetupPage() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedFeeId, setSelectedFeeId] = useState<number | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [feeToDelete, setFeeToDelete] = useState<{ id: number; name: string } | null>(null);

  // Form States
  const [name, setName] = useState("");
  const [type, setType] = useState<"FLAT" | "PERCENTAGE">("FLAT");
  const [value, setValue] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");

  // Query: Fetch Fee Configurations
  const { data: feeConfigs = [], isLoading } = useQuery<any>({
    queryKey: ["fee-configs"],
    queryFn: async () => client.get("/fees/structures"),
  });

  // Mutation: Create Fee Config
  const createMutation = useMutation({
    mutationFn: (data: any) => client.post("/fees/structures", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fee-configs"] });
      toast.success("Fee configuration created successfully!");
      handleClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Failed to create fee configuration");
    }
  });

  // Mutation: Update Fee Config
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      client.post("/fees/structures", id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fee-configs"] });
      toast.success("Fee configuration updated successfully!");
      handleClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Failed to update fee configuration");
    }
  });

  // Mutation: Delete Fee Config
  const deleteMutation = useMutation({
    mutationFn: (id: number) => client.delete(`/fees/structures/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fee-configs"] });
      toast.success("Fee configuration deleted successfully!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Failed to delete fee configuration");
    }
  });

  const handleOpenAdd = () => {
    setIsEdit(false);
    setSelectedFeeId(null);
    setName("");
    setType("FLAT");
    setValue("");
    setDescription("");
    setStatus("ACTIVE");
    setIsOpen(true);
  };

  const handleOpenEdit = (fee: any) => {
    setIsEdit(true);
    setSelectedFeeId(fee.id);
    setName(fee.name);
    setType(fee.type);
    setValue(fee.value.toString());
    setDescription(fee.description || "");
    setStatus(fee.status);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Please enter a fee name");
    if (!value || parseFloat(value) < 0) return toast.error("Please enter a valid non-negative value");

    const payload = {
      name: name.trim(),
      type,
      value: parseFloat(value),
      description: description.trim(),
      status
    };

    if (isEdit && selectedFeeId) {
      updateMutation.mutate({ id: selectedFeeId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: number, feeName: string) => {
    setFeeToDelete({ id, name: feeName });
    setDeleteConfirmOpen(true);
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-[#F5F7FB] min-h-screen font-sans text-slate-900">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-slate-900 font-heading uppercase  leading-none">
            Fee <span className="text-indigo-600">Setup</span>
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[4px] mt-2">
            Configure dynamic institutional fee rates & structures
          </p>
        </div>
        <Button
          onClick={handleOpenAdd}
          className="h-12 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-[10px] tracking-widest shadow-lg active:scale-95 transition-all flex items-center gap-2"
        >
          <Plus size={16} /> Define New Fee
        </Button>
      </div>

      {isLoading ? (
        <div className="py-32 flex flex-col items-center justify-center space-y-6">
          <Loader2 className="h-16 w-16 animate-spin text-indigo-600" />
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[4px]">
            Syncing Treasury Configs...
          </p>
        </div>
      ) : (
        <Card className="bg-white rounded-3xl border-none shadow-2xl overflow-hidden border border-slate-100">
          <div className="p-8 overflow-x-auto">
            <div className="rounded-3xl border border-slate-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Fee Name
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Fee Type
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                      Rate/Value
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Description
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                      Status
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {feeConfigs.length > 0 ? (
                    feeConfigs.map((fee: any) => (
                      <tr key={fee.id} className="hover:bg-indigo-50/30 transition-all">
                        <td className="px-8 py-6">
                          <p className="text-[11px] font-black text-slate-900 uppercase tracking-tighter ">
                            {fee.name}
                          </p>
                        </td>
                        <td className="px-8 py-6">
                          {fee.type === "PERCENTAGE" ? (
                            <Badge className="bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-50/80 rounded-xl px-3 py-1 font-black text-[9px] uppercase tracking-widest gap-1">
                              <Percent size={10} /> Percentage Rate
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-50/80 rounded-xl px-3 py-1 font-black text-[9px] uppercase tracking-widest gap-1">
                              <IndianRupeeIcon size={10} /> Flat Amount
                            </Badge>
                          )}
                        </td>
                        <td className="px-8 py-6 text-center">
                          <span className="font-black text-slate-700  text-sm">
                            {fee.type === "PERCENTAGE" ? `${fee.value}%` : `₹${fee.value}`}
                          </span>
                        </td>
                        <td className="px-8 py-6 max-w-xs">
                          <p className="text-[10px] font-bold text-slate-400 truncate uppercase">
                            {fee.description || "No description provided"}
                          </p>
                        </td>
                        <td className="px-8 py-6 text-center">
                          {fee.status === "ACTIVE" ? (
                            <Badge className="bg-emerald-500 text-white hover:bg-emerald-600 rounded-xl px-3 py-1 font-black text-[8px] uppercase tracking-widest gap-1">
                              <CheckCircle size={10} /> Active
                            </Badge>
                          ) : (
                            <Badge className="bg-slate-400 text-white hover:bg-slate-500 rounded-xl px-3 py-1 font-black text-[8px] uppercase tracking-widest gap-1">
                              <XCircle size={10} /> Inactive
                            </Badge>
                          )}
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEdit(fee)}
                              className="rounded-xl h-9 w-9 text-slate-400 hover:text-indigo-600 transition-all bg-slate-50 border border-slate-100"
                            >
                              <Edit2 size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(fee.id, fee.name)}
                              className="rounded-xl h-9 w-9 text-slate-400 hover:text-rose-600 transition-all bg-slate-50 border border-slate-100"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-32 text-center text-slate-300">
                        <Receipt size={64} className="mx-auto mb-6 opacity-20" />
                        <p className="text-[10px] font-black uppercase tracking-[5px] opacity-40">
                          No Fees Configured Yet
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}

      {/* dialog / modal form definition */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={handleClose} />
          <div className="bg-white w-full max-w-md rounded-[30px] shadow-3xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {isEdit ? "Update Fee Type" : "Define New Fee Type"}
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6">
                Fill out the form below to configure fee attributes.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Fee Head / Name
                  </label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-11 rounded-xl font-bold text-slate-800"
                    placeholder="e.g. Admission Fee, Examination Fee"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Fee Type
                    </label>
                    <select
                      value={type}
                      onChange={(e: any) => setType(e.target.value)}
                      className="w-full h-11 px-4 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    >
                      <option value="FLAT">Flat Amount (₹)</option>
                      <option value="PERCENTAGE">Percentage (%)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {type === "PERCENTAGE" ? "Percentage Rate (%)" : "Flat Amount (₹)"}
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      className="h-11 rounded-xl font-bold text-slate-800"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-4 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 min-h-[80px]"
                    placeholder="Brief description explaining this fee component"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Configuration Status
                  </label>
                  <select
                    value={status}
                    onChange={(e: any) => setStatus(e.target.value)}
                    className="w-full h-11 px-4 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>

                <div className="flex flex-col gap-3 mt-6">
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="w-full h-12 bg-slate-900 hover:bg-black text-white rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-lg"
                  >
                    {createMutation.isPending || updateMutation.isPending ? (
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    ) : null}
                    {isEdit ? "Update Configuration" : "Save Configuration"}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleClose}
                    variant="outline"
                    className="w-full h-12 rounded-xl font-bold uppercase text-[10px] tracking-widest border-slate-200"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setFeeToDelete(null);
        }}
        onConfirm={() => {
          if (feeToDelete) {
            deleteMutation.mutate(feeToDelete.id);
            setDeleteConfirmOpen(false);
            setFeeToDelete(null);
          }
        }}
        title="Delete Fee Configuration?"
        description={feeToDelete ? `This will permanently delete the "${feeToDelete.name}" fee type configuration from the treasury registry.` : "This will permanently delete this fee configuration."}
        type="danger"
      />
    </div>
  );
}
