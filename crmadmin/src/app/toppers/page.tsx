"use client";

import React, { useState, useEffect } from 'react';
import {
   Trophy, Plus, Trash2, Edit2, Save, X,
   GraduationCap, Star, Award, Search,
   Loader2, Camera, Crop,
   Filter, FileDown, Sparkles
} from 'lucide-react';
import ImageCropperModal from '@/components/ui/ImageCropperModal';
import client from '@/lib/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { APP_CONFIG } from "@/constants/config";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";
import {
   Avatar,
   AvatarImage,
   AvatarFallback,
} from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/dialogbox/ConfirmDialog";

import { useAuth } from "@/components/AbilityProvider";
import Link from "next/link";

export default function ToppersManager() {
   const queryClient = useQueryClient();
   const { user, loading: authLoading } = useAuth();
   const [uploading, setUploading] = useState(false);
   const [editing, setEditing] = useState<any>(null);
   const [showAdd, setShowAdd] = useState(false);
   const [searchQuery, setSearchQuery] = useState("");
   const [formData, setFormData] = useState({
      name: '',
      class: '',
      percentage: '',
      session: APP_CONFIG.academic.currentSession,
      rank: 1,
      image: ''
   });

   const [imageToCrop, setImageToCrop] = useState<any>(null);

   // Delete confirmation states
   const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
   const [topperToDelete, setTopperToDelete] = useState<any | null>(null);
   const [mounted, setMounted] = useState(false);

   useEffect(() => {
      setMounted(true);
   }, []);

   const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'MANAGEMENT'].includes((user?.role || '').toUpperCase());

   // Fetch Data for all authenticated faculty & admins
   const { data: rawToppers = [], isLoading } = useQuery<any>({
      queryKey: ['toppers'],
      enabled: mounted,
      queryFn: async () => {
         return client.get('/website/toppers');
      }
   });

   const toppers = Array.isArray(rawToppers) ? rawToppers : (rawToppers?.data || []);

   // Mutations
   const submitMutation = useMutation({
      mutationFn: (data: any) => {
         if (editing) return client.put(`/website/toppers/${editing.id}`, data);
         return client.post('/website/toppers', data);
      },
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['toppers'] });
         toast.success(editing ? "Profile updated" : "Scholar enrolled");
         setShowAdd(false);
         setEditing(null);
         setFormData({ name: '', class: '', percentage: '', session: APP_CONFIG.academic.currentSession, rank: 1, image: '' });
      },
      onError: () => toast.error("Communication failure.")
   });

   const deleteMutation = useMutation({
      mutationFn: (id: string) => client.delete(`/website/toppers/${id}`),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['toppers'] });
         toast.success("Scholar removed.");
      },
      onError: () => toast.error("Delete failed.")
   });

   const syncMutation = useMutation({
      mutationFn: () => client.get('/website/toppers'),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['toppers'] });
         toast.success("Top 4 Toppers auto-synced successfully!");
      },
      onError: (err: any) => toast.error(`Sync failed: ${err.message}`)
   });

   if (!mounted || authLoading) {
      return (
         <div className="flex-1 flex items-center justify-center min-h-[60vh] bg-slate-50/50">
            <Loader2 className="animate-spin text-indigo-600" size={28} />
         </div>
      );
   }

   const handleImageUpload = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => setImageToCrop(reader.result);
      reader.readAsDataURL(file);
   };

   const handleCropComplete = async (croppedBlob: Blob) => {
      setUploading(true);
      try {
         const formDataUpload = new FormData();
         formDataUpload.append('image', croppedBlob, 'topper.jpg');

         const res = await client.upload('/admin/upload', formDataUpload);

         if (res.url) {
            setFormData({ ...formData, image: res.url });
            setImageToCrop(null);
            toast.success("Image calibrated.");
         }
      } catch (e: any) {
         toast.error(`Image calibration failed: ${e.message}`);
      } finally {
         setUploading(false);
      }
   };

   const handleSubmit = (e: any) => {
      e.preventDefault();
      if (!formData.name || !formData.class || !formData.percentage || !formData.session || !formData.image) {
         toast.error("All fields are mandatory.");
         return;
      }
      submitMutation.mutate(formData);
   };

   const handleDelete = (topper: any) => {
      setTopperToDelete(topper);
      setDeleteConfirmOpen(true);
   };

   const startEdit = (t: any) => {
      setEditing(t);
      setFormData(t);
      setShowAdd(true);
   };

   const filteredToppers = toppers
      .filter((t: any) =>
         String(t.name || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
      .filter((t: any) => !t.rank || Number(t.rank) <= 4)
      .sort((a: any, b: any) => Number(a.rank || 99) - Number(b.rank || 99))
      .slice(0, 4);

   const getInitials = (name: string) => {
      return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'SC';
   };

   return (
      <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50/50 min-h-screen">

         {/* 🏛️ HEADER */}
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-in fade-in duration-500">
            <div>
               <h2 className="text-3xl font-black tracking-tighter text-slate-900 flex items-center gap-3 uppercase font-heading">
                  <Trophy className="text-amber-500" /> Hall of <span className="text-indigo-600">Fame</span>
               </h2>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[4px] mt-1">Manage institutional academic merit registry.</p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
               {isAdmin ? (
                  <>
                     <Button
                        onClick={() => syncMutation.mutate()}
                        disabled={syncMutation.isPending || isLoading}
                        className="h-11 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                     >
                        {syncMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Syncing...</> : <><Sparkles className="mr-2 h-4 w-4" /> Auto-Sync Top 4</>}
                     </Button>
                     <Button
                        onClick={() => { setShowAdd(!showAdd); setEditing(null); }}
                        className={cn(
                           "h-11 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-sm transition-all active:scale-95",
                           showAdd ? "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200" : "bg-slate-900 hover:bg-black text-white"
                        )}
                     >
                        {showAdd ? <><X className="mr-2 h-4 w-4" /> Cancel</> : <><Plus className="mr-2 h-4 w-4" /> Add Topper</>}
                     </Button>
                  </>
               ) : (
                  <Badge variant="outline" className="bg-white border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-wider py-2 px-4 rounded-xl shadow-xs">
                     Faculty Showcase (Read-Only)
                  </Badge>
               )}
            </div>
         </div>

         {/* ✍️ FORM */}
         {isAdmin && showAdd && (
            <Card className="shadow-sm border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 rounded-lgl">
               <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                  <CardTitle className="text-sm font-bold uppercase tracking-tight flex items-center gap-2">
                     <Star size={16} className="text-blue-600" /> {editing ? 'Edit Scholar Profile' : 'Register New Topper'}
                  </CardTitle>
               </CardHeader>
               <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="grid md:grid-cols-4 gap-8">
                     <div className="md:col-span-1 space-y-3">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scholar Photo</label>
                        <div className="relative group w-32 h-32">
                           <Avatar className="w-full h-full rounded-lgl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 overflow-hidden bg-slate-50 group-hover:border-blue-300 transition-all">
                              <AvatarImage src={formData.image} className="object-cover" />
                              <AvatarFallback className="bg-slate-50 text-slate-400 flex flex-col items-center justify-center">
                                 <Camera size={24} strokeWidth={1.5} />
                                 <span className="text-[8px] mt-2 font-bold uppercase">Upload</span>
                              </AvatarFallback>
                           </Avatar>
                           <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                        </div>
                     </div>

                     <div className="md:col-span-3 grid md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scholar Name</label>
                           <Input placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })} className="h-10 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Class / Stream</label>
                           <Input placeholder="e.g. 10th (Science)" value={formData.class} onChange={(e) => setFormData({ ...formData, class: e.target.value.toUpperCase() })} className="h-10 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Academic Rank</label>
                           <select
                              value={formData.rank}
                              onChange={(e) => setFormData({ ...formData, rank: Number(e.target.value) })}
                              className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                           >
                              <option value={1}>Rank 1 (Gold)</option>
                              <option value={2}>Rank 2 (Silver)</option>
                              <option value={3}>Rank 3 (Bronze)</option>
                              <option value={4}>Rank 4 (Star Merit)</option>
                           </select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Percentage / Score</label>
                           <Input placeholder="e.g. 98.4%" value={formData.percentage} onChange={(e) => setFormData({ ...formData, percentage: e.target.value })} className="h-10 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Academic Session</label>
                           <Input placeholder="2026-2027" value={formData.session} onChange={(e) => setFormData({ ...formData, session: e.target.value })} className="h-10 rounded-xl" />
                        </div>
                        <div className="flex items-end">
                           <Button type="submit" disabled={submitMutation.isPending || uploading} className="w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-widest">
                              {submitMutation.isPending ? <Loader2 className="animate-spin" /> : <><Save size={14} className="mr-2" /> Save</>}
                           </Button>
                        </div>
                     </div>
                  </form>
               </CardContent>
            </Card>
         )}

         {/* 🔍 SEARCH & FILTERS */}
         <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="relative w-full md:w-96">
               <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
               <Input
                  placeholder="Search scholars by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 border-slate-100 bg-slate-50/50 rounded-xl text-xs"
               />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2">Total Scholars: {filteredToppers.length}</span>
            </div>
         </div>

         {/* 🏆 TOPPERS TABLE */}
         <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
               <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">
                     <tr>
                        <th className="py-6 px-6">Scholar Profile</th>
                        <th className="text-center py-6 px-6">Institutional Rank</th>
                        <th className="py-6 px-6">Class / Stream</th>
                        <th className="text-center py-6 px-6">Merit %</th>
                        <th className="text-center py-6 px-6">Session</th>
                        {isAdmin && <th className="text-right py-6 px-6">Actions</th>}
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {filteredToppers.sort((a: any, b: any) => a.rank - b.rank).map((t: any) => (
                        <tr key={t.id || (t as any)._id} className="hover:bg-slate-50/50 transition-colors group">
                           <td className="py-4 px-6">
                              <div className="flex items-center space-x-3">
                                 <Avatar className="h-9 w-9 rounded-full border border-slate-200 shadow-sm transition-transform group-hover:scale-105">
                                    <AvatarImage src={t.image} className="object-cover" />
                                    <AvatarFallback className="bg-slate-100 text-slate-400 font-bold text-[10px]">
                                       {getInitials(t.name)}
                                    </AvatarFallback>
                                 </Avatar>
                                 <div>
                                    <p className="font-bold text-slate-900 leading-tight">{t.name}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">Verified Scholar</p>
                                 </div>
                              </div>
                           </td>
                           <td className="py-4 px-6 text-center">
                              <span className={cn(
                                 "inline-flex items-center justify-center w-7 h-7 rounded bg-slate-900 text-white font-bold text-[10px]",
                                 t.rank === 1 ? 'bg-amber-500' : (t.rank === 2 ? 'bg-slate-400' : (t.rank === 3 ? 'bg-amber-700' : 'bg-indigo-600'))
                              )}>
                                 {t.rank}
                              </span>
                           </td>
                           <td className="py-4 px-6">
                              <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 font-bold text-[10px] uppercase">
                                 {t.class}
                              </Badge>
                           </td>
                           <td className="py-4 px-6 text-center font-bold text-slate-900">
                              {t.percentage}
                           </td>
                           <td className="py-4 px-6 text-center">
                              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest ">{t.session}</span>
                           </td>
                           {isAdmin && (
                              <td className="py-4 px-6 text-right">
                                 <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                    <Button variant="outline" size="sm" onClick={() => startEdit(t)} className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600 border-slate-200"><Edit2 size={14} /></Button>
                                    <Button variant="outline" size="sm" onClick={() => handleDelete(t)} className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 border-slate-200"><Trash2 size={14} /></Button>
                                 </div>
                              </td>
                           )}
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>

         {isLoading && (
            <div className="h-[200px] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>
         )}

         {filteredToppers.length === 0 && !isLoading && (
            <div className="text-center py-24 bg-white rounded-lgl border border-slate-200 border-dashed">
               <Award className="h-12 w-12 text-slate-200 mx-auto mb-4" />
               <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">No scholars found.</p>
            </div>
         )}

         {/* Crop Modal */}
         {imageToCrop && (
            <ImageCropperModal
               imageSrc={imageToCrop}
               onCancel={() => setImageToCrop(null)}
               onCropComplete={handleCropComplete}
               isUploading={uploading}
            />
         )}

         <ConfirmDialog
            isOpen={deleteConfirmOpen}
            onClose={() => {
               setDeleteConfirmOpen(false);
               setTopperToDelete(null);
            }}
            onConfirm={() => {
               if (topperToDelete) {
                  deleteMutation.mutate(String(topperToDelete.id));
                  setDeleteConfirmOpen(false);
                  setTopperToDelete(null);
               }
            }}
            title="Remove Topper?"
            description={topperToDelete ? `Are you sure you want to permanently remove "${topperToDelete.name}" from the Hall of Fame?` : "Are you sure you want to remove this topper?"}
            confirmText="Remove"
            cancelText="Cancel"
            type="danger"
         />
      </div>
   );
}
