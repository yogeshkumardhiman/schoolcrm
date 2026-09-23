"use client";
import React, { useState, useEffect, useRef } from 'react';
import {
    Image as ImageIcon,
    Plus,
    Trash2,
    Upload,
    Layers,
    Search,
    Loader2,
    CheckCircle2,
    Edit2,
    X,
    FileDown
} from 'lucide-react';

import client from '@/lib/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { APP_CONFIG } from '@/constants/config';
import { ConfirmDialog } from "@/components/dialogbox/ConfirmDialog";

interface GalleryItem {
    id: number;
    title: string;
    url: string;
    category: string;
}

const MediaArchive = () => {
    const queryClient = useQueryClient();
    const [uploading, setUploading] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const [batchImages, setBatchImages] = useState<{ file: File, preview: string, title: string }[]>([]);
    const [globalCategory, setGlobalCategory] = useState('GENERAL');
    const [globalYear, setGlobalYear] = useState(APP_CONFIG.academic.currentSession);
    const [globalEventType, setGlobalEventType] = useState('NONE');
    const [globalClass, setGlobalClass] = useState('ALL');
    const [customCategory, setCustomCategory] = useState('');

    const [selectedFilter, setSelectedFilter] = useState('ALL');
    const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editFormData, setEditFormData] = useState({ title: '', category: '' });
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Delete confirmation states
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [galleryAssetToDelete, setGalleryAssetToDelete] = useState<GalleryItem | null>(null);

    // Fetch Data
    const { data: gallery = [], isLoading } = useQuery<GalleryItem[]>({
        queryKey: ['gallery'],
        queryFn: async () => {
            const res: any = await client.get("/website/gallery");
            return Array.isArray(res) ? res : (res?.data || []);
        }
    });

    // Mutations
    const deleteMutation = useMutation({
        mutationFn: (id: string) => client.delete(`/website/gallery/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gallery'] });
            toast.success("Asset purged");
        },
        onError: () => toast.error("Purge failed")
    });

    const updateMutation = useMutation({
        mutationFn: (data: any) => client.put(`/website/gallery/${String(editingItem?.id)}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gallery'] });
            toast.success("Asset manifest synchronized");
            setIsEditModalOpen(false);
            setEditingItem(null);
        },
        onError: () => toast.error("Synchronization failure")
    });

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (batchImages.length + files.length > 6) {
            toast.error("Max 6 assets per batch");
            return;
        }

        const newBatches = files.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            title: ''
        }));
        setBatchImages([...batchImages, ...newBatches]);
    };

    const removeFileFromBatch = (index: number) => {
        const updated = [...batchImages];
        URL.revokeObjectURL(updated[index].preview);
        updated.splice(index, 1);
        setBatchImages(updated);
    };

    const commitBatch = async () => {
        if (batchImages.length === 0) return toast.error("No assets selected");
        if (batchImages.some(img => !img.title)) return toast.error("All assets require titles");

        setUploading(true);
        const finalCategory = customCategory.trim() ? customCategory.toUpperCase() : globalCategory;

        try {
            for (const item of batchImages) {
                const formData = new FormData();
                formData.append('file', item.file);
                const uploadRes: any = await client.upload('/upload?folder=gallery', formData);

                await client.post("/website/gallery", {
                    title: item.title,
                    url: uploadRes?.url || uploadRes,
                    category: finalCategory,
                    year: globalYear,
                    eventType: globalEventType,
                    class: globalClass
                });
            }

            toast.success("Batch synchronization successful");
            setIsAddModalOpen(false);
            setBatchImages([]);
            setCustomCategory('');
            queryClient.invalidateQueries({ queryKey: ['gallery'] });
        } catch (err) {
            console.error("Gallery commit error:", err);
            toast.error("Batch failure");
        } finally {
            setUploading(false);
        }
    };

    const deleteImage = (item: GalleryItem) => {
        setGalleryAssetToDelete(item);
        setDeleteConfirmOpen(true);
    };

    const startEdit = (item: GalleryItem) => {
        setEditingItem(item);
        setEditFormData({ title: item.title, category: item.category });
        setIsEditModalOpen(true);
    };

    const handleUpdate = () => {
        if (!editingItem) return;
        if (!editFormData.title) return toast.error("Title mandatory");
        updateMutation.mutate(editFormData);
    };

    const filteredData = gallery.filter(img => {
        const matchesSearch = img.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedFilter === 'ALL' || img.category === selectedFilter;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50/50 min-h-screen">

            {/* Header */}
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                        <Layers size={28} className="text-blue-600" /> Media Archive
                    </h2>
                    <p className="text-sm text-muted-foreground">Manage institutional digital asset registry and cloud synchronization.</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-slate-900 hover:bg-slate-800 text-white h-10 px-6 font-medium"
                    >
                        <Plus className="mr-2 h-4 w-4" /> New Asset Commit
                    </Button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
                <Button
                    variant={selectedFilter === 'ALL' ? 'default' : 'outline'}
                    onClick={() => setSelectedFilter('ALL')}
                    className={cn(
                        "h-8 text-[10px] font-bold uppercase tracking-widest px-4",
                        selectedFilter === 'ALL' ? "bg-slate-900" : "bg-white text-slate-500 border-slate-200"
                    )}
                >
                    ALL
                </Button>
                {APP_CONFIG.gallery.categories.map(cat => (
                    <Button
                        key={cat.id}
                        variant={selectedFilter === cat.id ? 'default' : 'outline'}
                        onClick={() => setSelectedFilter(cat.id)}
                        className={cn(
                            "h-8 text-[10px] font-bold uppercase tracking-widest px-4",
                            selectedFilter === cat.id ? "bg-slate-900" : "bg-white text-slate-500 border-slate-200"
                        )}
                    >
                        {cat.label}
                    </Button>
                ))}
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-lgl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search assets..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 w-[300px] bg-slate-50/50 h-9 border-slate-200"
                        />
                    </div>
                    <Button variant="outline" className="h-9 gap-2 border-slate-200"><FileDown className="h-4 w-4" /> Export</Button>
                </div>

                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="h-[400px] flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-500 font-medium uppercase tracking-wider">
                                    <th className="text-left py-3 px-6">Asset Entity</th>
                                    <th className="text-left py-3 px-6">Category</th>
                                    <th className="text-center py-3 px-6">Node ID</th>
                                    <th className="text-right py-3 px-6">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredData.map((img) => (
                                    <tr key={img.id || (img as any)._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="py-3 px-6">
                                            <div className="flex items-center space-x-3">
                                                <div className="h-10 w-10 rounded-lg overflow-hidden border border-slate-100 shadow-sm transition-transform group-hover:scale-105 bg-slate-50">
                                                    <img src={img.url} className="h-full w-full object-cover" alt="" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 leading-tight uppercase text-xs">{img.title}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">Verified Asset</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-6">
                                            <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 font-bold text-[10px] uppercase">
                                                {img.category}
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-6 text-center">
                                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest ">#NODE-{img.id}</span>
                                        </td>
                                        <td className="py-3 px-6 text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="outline" size="sm" onClick={() => startEdit(img)} className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600 border-slate-200"><Edit2 size={14} /></Button>
                                                <Button variant="outline" size="sm" onClick={() => deleteImage(img)} className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 border-slate-200"><Trash2 size={14} /></Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Batch Upload Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <Card className="w-full max-w-4xl rounded-lgxl shadow-2xl border-slate-100 overflow-hidden p-0 py-0 bg-white">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between p-6">
                            <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest">
                                <Upload size={18} className="text-blue-600" /> Batch Asset Commitment
                            </CardTitle>
                            <Button variant="ghost" size="sm" onClick={() => setIsAddModalOpen(false)} className="h-8 w-8 p-0">
                                <X size={20} />
                            </Button>
                        </CardHeader>
                        <CardContent className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto no-scrollbar">
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</label>
                                        <select
                                            className="w-full h-10 bg-white border border-slate-200 px-3 rounded-lg font-bold outline-none focus:ring-2 focus:ring-slate-900 transition-all text-xs"
                                            value={globalCategory}
                                            onChange={e => setGlobalCategory(e.target.value)}
                                        >
                                            {APP_CONFIG.gallery.categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Session</label>
                                        <select
                                            className="w-full h-10 bg-white border border-slate-200 px-3 rounded-lg font-bold outline-none focus:ring-2 focus:ring-slate-900 transition-all text-xs"
                                            value={globalYear}
                                            onChange={e => setGlobalYear(e.target.value)}
                                        >
                                            <option value={APP_CONFIG.academic.currentSession}>{APP_CONFIG.academic.currentSession}</option>
                                            {APP_CONFIG.academic.years.map(y => <option key={y} value={y}>{y}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div
                                    className="h-48 bg-slate-50 border-2 border-dashed border-slate-200 rounded-lgxl flex flex-col items-center justify-center group cursor-pointer hover:bg-slate-100 hover:border-slate-300 transition-all"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Upload size={32} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-3">Select up to 6 Assets</p>
                                    <input type="file" multiple hidden ref={fileInputRef} onChange={handleFileSelect} accept="image/*" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Commit Manifest ({batchImages.length}/6)</label>
                                <div className="space-y-3">
                                    {batchImages.map((item, idx) => (
                                        <div key={idx} className="flex bg-slate-50 p-3 rounded-lgl border border-slate-100 gap-4">
                                            <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                                                <img src={item.preview} className="w-full h-full object-cover" alt="" />
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <Input
                                                    className="h-8 text-xs font-bold bg-transparent border-none focus-visible:ring-0 px-0"
                                                    placeholder="Asset Identity"
                                                    value={item.title}
                                                    onChange={e => {
                                                        const updated = [...batchImages];
                                                        updated[idx].title = e.target.value;
                                                        setBatchImages(updated);
                                                    }}
                                                />
                                                <Button variant="ghost" size="sm" onClick={() => removeFileFromBatch(idx)} className="h-6 px-2 text-red-400 hover:text-red-600 hover:bg-red-50 text-[10px] font-bold uppercase">Remove</Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="text-[10px] font-bold uppercase tracking-widest">Abort</Button>
                            <Button
                                onClick={commitBatch}
                                disabled={uploading || batchImages.length === 0}
                                className="bg-slate-900 hover:bg-black text-white px-8 font-bold text-[10px] uppercase tracking-widest shadow-xl"
                            >
                                {uploading ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <CheckCircle2 className="mr-2 h-3 w-3" />}
                                Commit Batch
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            <ConfirmDialog
                isOpen={deleteConfirmOpen}
                onClose={() => {
                    setDeleteConfirmOpen(false);
                    setGalleryAssetToDelete(null);
                }}
                onConfirm={() => {
                    if (galleryAssetToDelete) {
                        deleteMutation.mutate(galleryAssetToDelete.id.toString());
                        setDeleteConfirmOpen(false);
                        setGalleryAssetToDelete(null);
                    }
                }}
                title="Decommission Asset?"
                description={galleryAssetToDelete ? `Are you sure you want to permanently decommission asset "${galleryAssetToDelete.title}"?` : "Are you sure you want to decommission this asset?"}
                confirmText="Decommission"
                cancelText="Cancel"
                type="danger"
            />
        </div>
    );
};

export default MediaArchive;
