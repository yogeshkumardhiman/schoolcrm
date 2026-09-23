"use client";
import React, { useState, useEffect } from 'react';
import {
    FileText,
    Upload,
    Trash2,
    Plus,
    FileCheck,
    Loader2,
    ExternalLink,
    ShieldAlert
} from 'lucide-react';
import client from '@/lib/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { ConfirmDialog } from "@/components/dialogbox/ConfirmDialog";
import Link from 'next/link';

interface ComplianceDoc {
    id: number;
    title: string;
    category: string;
    url: string;
}

const ComplianceManager = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [complianceToDelete, setComplianceToDelete] = useState<number | null>(null);
    const [formData, setFormData] = useState<{ title: string; category: string; file: File | null }>({
        title: '',
        category: 'DOCUMENTS',
        file: null
    });

    // Fetch Data
    const { data: docs = [], isLoading } = useQuery({
        queryKey: ['compliance-docs'],
        queryFn: async () => {
            return client.get('/reports/compliance');
        }
    });

    // Mutations
    const uploadMutation = useMutation({
        mutationFn: async (payload: any) => {
            return client.post('/reports/compliance', payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['compliance-docs'] });
            toast.success("Compliance document archived.");
            setIsModalOpen(false);
            setFormData({ title: '', category: 'DOCUMENTS', file: null });
        },
        onError: () => toast.error("Upload failed")
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            return client.delete(`/reports/compliance/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['compliance'] });
            toast.success("Document Removed");
        },
        onError: () => toast.error("Delete failed")
    });

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.file || !formData.title) return toast.error("Please fill all fields");

        const data = new FormData();
        data.append('title', formData.title);
        data.append('category', formData.category);
        data.append('file', formData.file);

        uploadMutation.mutate(data);
    };

    const handleDelete = (id: number) => {
        setComplianceToDelete(id);
        setDeleteConfirmOpen(true);
    };

    return (
        <div className="p-8 bg-slate-50/50 min-h-screen font-sans">
            {/* 🏫 Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div>
                    <h2 className="text-3xl font-black tracking-tighter text-slate-900 flex items-center gap-3 uppercase font-heading">
                        <FileCheck className="text-indigo-600" size={30} />
                        CBSE Compliance <span className="text-indigo-600">Manager</span>
                    </h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[4px] mt-2">Manage Mandatory Disclosure Documents (Appendix IX)</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 h-11 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                    <Plus size={14} />
                    Add Document
                </button>
            </div>

            {/* 📊 Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-lgxl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Total Documents</span>
                    <span className="text-3xl font-black text-slate-900 font-heading">{docs.length}</span>
                </div>
                <div className="bg-white p-6 rounded-lgxl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Compliance Status</span>
                        <span className="text-2xl font-black text-slate-900 font-heading">ACTIVE</span>
                    </div>
                    <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">Verified</span>
                </div>
                <div className="bg-white p-6 rounded-lgxl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex items-center gap-4">
                    <ShieldAlert className="text-amber-500" size={24} />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-relaxed">Documents are publicly visible on the school website disclosures node.</p>
                </div>
            </div>

            {/* 📑 Documents Table */}
            <div className="bg-white rounded-lgxl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-slate-50/50 border-b border-slate-200 uppercase text-[10px] font-black text-slate-400 tracking-[3px]">
                        <tr>
                            <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Document Title</th>
                            <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Category</th>
                            <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {isLoading ? (
                            <tr><td colSpan={3} className="px-8 py-20 text-center text-slate-400  font-medium">Fetching Registry...</td></tr>
                        ) : docs.length === 0 ? (
                            <tr><td colSpan={3} className="px-8 py-20 text-center text-slate-400  font-medium uppercase tracking-widest text-xs">No Documents Found</td></tr>
                        ) : docs.map((doc: any) => (
                            <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-blue-50 text-blue-600 flex items-center justify-center rounded-lgl">
                                            <FileText size={20} />
                                        </div>
                                        <span className="font-bold text-slate-700 tracking-tight">{doc.title}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                        {doc.category}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className="flex items-center justify-end gap-3">
                                        <Link href={doc.url} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50">
                                            <ExternalLink size={18} />
                                        </Link>
                                        <button onClick={() => handleDelete(doc.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 🎨 Upload Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
                    <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="bg-blue-600 p-10 text-white relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[40px] rounded-full" />
                            <h2 className="text-3xl font-black tracking-tight mb-2">New Disclosure</h2>
                            <p className="text-blue-100 text-xs font-bold uppercase tracking-widest">Upload CBSE Appendix IX PDF</p>
                        </div>

                        <form onSubmit={handleUpload} className="p-10 space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] mb-3 block">Document Title</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Fire Safety Certificate"
                                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-lgl font-bold text-slate-700 outline-none focus:border-blue-500 transition-colors"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] mb-3 block">Category</label>
                                <select
                                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-lgl font-bold text-slate-700 outline-none focus:border-indigo-500 transition-colors"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="DOCUMENTS">Official Document</option>
                                    <option value="INFORMATION">General Info</option>
                                    <option value="RESULTS">Board Results</option>
                                </select>
                            </div>

                            <div className="relative h-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-lgxl flex flex-col items-center justify-center group hover:bg-indigo-50/50 hover:border-indigo-300 transition-all cursor-pointer">
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={e => {
                                        if (e.target.files && e.target.files[0]) {
                                            setFormData({ ...formData, file: e.target.files[0] });
                                        }
                                    }}
                                />
                                <Upload size={24} className={formData.file ? 'text-indigo-600' : 'text-slate-400'} />
                                <span className="mt-2 text-[10px] font-black uppercase text-slate-500 tracking-widest">
                                    {formData.file ? formData.file.name : "Select PDF Archive"}
                                </span>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-4 font-black uppercase tracking-widest text-[10px] text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploadMutation.isPending}
                                    className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[10px] py-4 rounded-lgxl shadow-xl shadow-indigo-100/35 disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    {uploadMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : "Finalise Upload"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmDialog
                isOpen={deleteConfirmOpen}
                onClose={() => {
                    setDeleteConfirmOpen(false);
                    setComplianceToDelete(null);
                }}
                onConfirm={() => {
                    if (complianceToDelete !== null) {
                        deleteMutation.mutate(complianceToDelete);
                        setDeleteConfirmOpen(false);
                        setComplianceToDelete(null);
                    }
                }}
                title="Purge Compliance Document?"
                description="This will permanently delete this mandatory disclosure document and retract it from the public school web portal."
                type="danger"
            />
        </div>
    );
};

export default ComplianceManager;
