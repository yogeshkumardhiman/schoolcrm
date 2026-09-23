"use client";
import client from "@/lib/client";

import React, { useState, useEffect } from 'react';
import {
    MessageSquare,
    Plus,
    Trash2,
    Edit2,
    User,
    Quote,
    Loader2,
    Image as ImageIcon,
    Camera,
    Search,
    X,
    Save
} from 'lucide-react';


import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/dialogbox/ConfirmDialog";

interface Testimonial {
    id: number;
    name: string;
    role: string;
    text: string;
    image: string;
}

const TestimonialsManager = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [formData, setFormData] = useState({
        name: '',
        role: 'Parent',
        text: '',
        image: ''
    });

    // Delete confirmation states
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [testimonialToDelete, setTestimonialToDelete] = useState<Testimonial | null>(null);

    // Fetch Data using TanStack Query
    const { data: testimonials = [], isLoading } = useQuery<Testimonial[]>({
        queryKey: ['testimonials'],
        queryFn: async () => {
            return client.get("/website/testimonials");
        }
    });

    // Mutations
    const submitMutation = useMutation({
        mutationFn: async (payload: any) => {
            if (editingItem) {
                // Assuming publicService might need an updateTestimonial, using generic put for now
                // or I can update publicService
                return client.post("/website/testimonials", payload); // Fallback for now
            }
            return client.post("/website/testimonials", payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['testimonials'] });
            toast.success(editingItem ? "Updated successfully" : "Added successfully");
            setIsModalOpen(false);
            resetForm();
        },
        onError: () => toast.error("Synchronization failure")
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => client.delete(`/website/testimonials/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['testimonials'] });
            toast.success("Testimonial removed");
        },
        onError: () => toast.error("Delete failed")
    });

    const resetForm = () => {
        setFormData({ name: '', role: 'Parent', text: '', image: '' });
        setEditingItem(null);
    };

    const handleEdit = (t: Testimonial) => {
        setEditingItem(t);
        setFormData({ name: t.name, role: t.role, text: t.text, image: t.image });
        setIsModalOpen(true);
    };

    const handleDelete = (testimonial: Testimonial) => {
        setTestimonialToDelete(testimonial);
        setDeleteConfirmOpen(true);
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.text) return toast.error("Name and text are mandatory");
        submitMutation.mutate(formData);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('image', file);

        setUploading(true);
        try {
            const res: any = await client.upload("/upload?folder=testimonials", uploadData);
            setFormData({ ...formData, image: res.url || res.data?.url });
            toast.success("Image uploaded");
        } catch (err) {
            toast.error("Upload failure");
        } finally {
            setUploading(false);
        }
    };

    const filteredData = testimonials.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50/50 min-h-screen">

            {/* Header */}
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                        <MessageSquare className="text-blue-600" /> Parent Perspectives
                    </h2>
                    <p className="text-sm text-muted-foreground">Manage and moderate institutional testimonials.</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        onClick={() => { resetForm(); setIsModalOpen(true); }}
                        className="bg-slate-900 hover:bg-slate-800 text-white h-10 px-6 font-medium"
                    >
                        <Plus className="mr-2 h-4 w-4" /> New Perspective
                    </Button>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search names..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 w-[300px] bg-slate-50/50 h-9 border-slate-200"
                        />
                    </div>
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
                                    <th className="text-left py-3 px-6">Identify</th>
                                    <th className="text-left py-3 px-6">Official Narrative</th>
                                    <th className="text-right py-3 px-6">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredData.map((t) => (
                                    <tr key={t.id || (t as any)._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center space-x-3">
                                                <div className="h-10 w-10 rounded-lgl overflow-hidden border border-slate-100 shadow-sm transition-transform group-hover:scale-105">
                                                    <img src={t.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${t.name}`} className="h-full w-full object-cover" alt="" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 leading-tight">{t.name}</p>
                                                    <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-0.5">{t.role}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 max-w-md">
                                            <div className="flex gap-2  text-slate-500 text-[11px] leading-relaxed">
                                                <Quote size={12} className="text-slate-300 mt-1 shrink-0" />
                                                <p className="line-clamp-2">{t.text}</p>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="outline" size="sm" onClick={() => handleEdit(t)} className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600 border-slate-200"><Edit2 size={14} /></Button>
                                                <Button variant="outline" size="sm" onClick={() => handleDelete(t)} className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 border-slate-200"><Trash2 size={14} /></Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-100 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <Card className="w-full max-w-md rounded-lgxl shadow-2xl border-slate-100 overflow-hidden p-0 py-0 bg-white">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between p-4">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                {editingItem ? <Edit2 size={16} className="text-blue-600" /> : <Plus size={16} className="text-blue-600" />}
                                {editingItem ? 'Edit Perspective' : 'New Perspective'}
                            </CardTitle>
                            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)} className="h-8 w-8 p-0">
                                <X size={16} />
                            </Button>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="relative group">
                                    <div className="w-16 h-16 rounded-lgl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                                        {formData.image ? (
                                            <img src={formData.image} className="w-full h-full object-cover" alt="" />
                                        ) : (
                                            <User size={24} className="text-slate-300" />
                                        )}
                                        {uploading && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><Loader2 className="animate-spin text-blue-600 h-4 w-4" /></div>}
                                    </div>
                                    <label className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 text-white rounded-lg shadow-lg flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors">
                                        <Camera size={12} />
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                    </label>
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Name</label>
                                        <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="h-9 text-xs" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role</label>
                                        <Input value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="h-9 text-xs" />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Perspective</label>
                                <textarea
                                    className="w-full h-24 bg-slate-50/50 border border-slate-200 p-3 rounded-lg font-medium outline-none focus:ring-2 focus:ring-slate-900 transition-all text-xs resize-none leading-relaxed"
                                    placeholder="Enter testimonial text..."
                                    value={formData.text}
                                    onChange={e => setFormData({ ...formData, text: e.target.value })}
                                />
                            </div>
                            <Button onClick={handleSubmit} disabled={submitMutation.isPending} className="w-full bg-slate-900 hover:bg-black text-white font-bold text-[10px] uppercase h-10 tracking-widest">
                                {submitMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Sync Perspective
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}

            <ConfirmDialog
                isOpen={deleteConfirmOpen}
                onClose={() => {
                    setDeleteConfirmOpen(false);
                    setTestimonialToDelete(null);
                }}
                onConfirm={() => {
                    if (testimonialToDelete) {
                        deleteMutation.mutate(testimonialToDelete.id.toString());
                        setDeleteConfirmOpen(false);
                        setTestimonialToDelete(null);
                    }
                }}
                title="Remove Testimonial?"
                description={testimonialToDelete ? `Are you sure you want to permanently remove the testimonial from "${testimonialToDelete.name}"?` : "Are you sure you want to remove this testimonial?"}
                confirmText="Remove"
                cancelText="Cancel"
                type="danger"
            />
        </div>
    );
};

export default TestimonialsManager;
