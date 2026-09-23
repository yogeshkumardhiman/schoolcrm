"use client";
import client from "@/lib/client";
import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, CheckSquare, GraduationCap, Loader2, Search, Square, AlertTriangle, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";



import { useAuth } from "@/components/AbilityProvider";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/dialogbox/alert-dialog";
import { APP_CONFIG } from "@/constants/config";

const CLASSES = ["NURSERY", "LKG", "UKG", "1ST", "2ND", "3RD", "4TH", "5TH", "6TH", "7TH", "8TH", "9TH", "10TH", "11TH", "12TH"];
const SESSIONS = ["2025-2026", "2026-2027", "2027-2028", "2028-2029"];

export default function PromotionPage() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    const [sourceClass, setSourceClass] = useState("6TH");
    const [targetClass, setTargetClass] = useState("7TH");
    const [newSession, setNewSession] = useState("2027-2028");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    // Query: Fetch class candidates via lightweight API
    const { data: rawStudents = [], isLoading } = useQuery<any>({
        queryKey: ['promotion-candidates', sourceClass],
        queryFn: async () => {
            const res: any = await client.get(`/students/promotion-candidates?class=${encodeURIComponent(sourceClass)}`);
            return Array.isArray(res) ? res : (res?.students || res?.data || []);
        }
    });

    const students: any[] = useMemo(() => {
        if (Array.isArray(rawStudents)) return rawStudents;
        if (Array.isArray((rawStudents as any)?.students)) return (rawStudents as any).students;
        if (Array.isArray((rawStudents as any)?.data)) return (rawStudents as any).data;
        return [];
    }, [rawStudents]);

    const sourceStudents = useMemo(() => {
        if (!Array.isArray(students)) return [];
        return students
            .filter(s => s.session !== newSession)
            .filter(s => !searchQuery || s.name?.toLowerCase().includes(searchQuery.toLowerCase()) || s.admissionNo?.includes(searchQuery));
    }, [students, searchQuery, newSession]);

    // Handle Checkbox Selection
    const toggleStudent = (id: number) => {
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedIds(next);
    };

    const toggleAll = () => {
        if (selectedIds.size === sourceStudents.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(sourceStudents.map(s => s.id)));
        }
    };

    // Auto-select all when source class or students data changes
    const sourceStudentIdsString = sourceStudents.map(s => s.id).join(',');
    React.useEffect(() => {
        setSelectedIds(new Set(sourceStudents.map(s => s.id)));
    }, [sourceClass, newSession, sourceStudentIdsString]);

    // Mutation
    const promoteMutation = useMutation({
        mutationFn: async () => {
            const payload = {
                sourceClass,
                targetClass,
                newSession,
                studentIds: Array.from(selectedIds)
            };
            return client.post("/academic/promote", payload);
        },
        onSuccess: () => {
            toast.success("Scholars successfully promoted!");
            setIsConfirmOpen(false);
            setSelectedIds(new Set());
            queryClient.invalidateQueries({ queryKey: ['all-students'] });
            queryClient.invalidateQueries({ queryKey: ['all-students-promotion'] });
            queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
        },
        onError: (err: any) => {
            toast.error(err.message || "Failed to promote scholars");
            setIsConfirmOpen(false);
        }
    });

    const executePromotion = () => {
        if (selectedIds.size === 0) {
            toast.error("Select at least one scholar to promote.");
            return;
        }
        setIsConfirmOpen(true);
    };

    return (
        <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-in fade-in duration-500">
                <div>
                    <h2 className="text-3xl font-black tracking-tighter text-slate-900 flex items-center gap-3 uppercase font-heading">
                        <GraduationCap className="text-indigo-600 h-8 w-8" /> Session <span className="text-indigo-600">Migration</span>
                    </h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[4px] mt-1">
                        Bulk promote scholars to the next academic grade and roll over financial records.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Configuration Panel */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-lgxl bg-white overflow-hidden">
                        <CardHeader className="pb-4 border-b border-slate-50">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[4px] text-slate-400">Rollover Matrix</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Session</label>
                                <div className="relative">
                                    <select
                                        className="w-full h-11 px-4 pr-10 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest appearance-none outline-none focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer shadow-sm"
                                        value={newSession}
                                        onChange={(e) => setNewSession(e.target.value)}
                                    >
                                        {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50 border border-slate-100 rounded-lgxl relative">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Source Class</label>
                                    <div className="relative">
                                        <select
                                            className="w-full h-11 px-4 pr-10 bg-white border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest appearance-none outline-none focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer shadow-sm"
                                            value={sourceClass}
                                            onChange={(e) => setSourceClass(e.target.value)}
                                        >
                                            {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>

                                <div className="my-4 flex justify-center">
                                    <div className="h-8 w-8 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full flex items-center justify-center">
                                        <ArrowRight size={14} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Class</label>
                                    <div className="relative">
                                        <select
                                            className="w-full h-11 px-4 pr-10 bg-indigo-50 border border-indigo-100 rounded-xl text-[10px] font-black uppercase tracking-widest appearance-none outline-none focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer shadow-sm text-indigo-700"
                                            value={targetClass}
                                            onChange={(e) => setTargetClass(e.target.value)}
                                        >
                                            {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                                            <option value="GRADUATED" className="text-emerald-600">GRADUATED (Alumni)</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-indigo-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={executePromotion}
                                disabled={selectedIds.size === 0 || promoteMutation.isPending}
                                className="w-full h-11 bg-slate-900 hover:bg-black text-white font-black tracking-widest uppercase text-[10px] rounded-xl shadow-sm transition-all"
                            >
                                {promoteMutation.isPending ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <GraduationCap className="mr-2 h-4 w-4" />}
                                Promote {selectedIds.size} Scholars
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.02)] bg-white rounded-lgxl overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex gap-4">
                                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                                <div className="space-y-1.5">
                                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Financial Impact</h4>
                                    <p className="text-xs text-slate-400 font-medium leading-relaxed">
                                        Executing this promotion will transfer the selected scholars to the target class.
                                        Their annual fee status will be reset, applying the fee structure of the new grade.
                                        Existing arrears will be carried forward.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Registry Panel */}
                <div className="lg:col-span-8">
                    <Card className="border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.02)] h-[calc(100vh-140px)] flex flex-col rounded-lgxl bg-white overflow-hidden">
                        <CardHeader className="border-b border-slate-100 pb-4">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div>
                                    <CardTitle className="text-[10px] font-black uppercase tracking-[4px] text-slate-400">Scholar Candidate Registry</CardTitle>
                                    <CardDescription className="text-xs text-slate-400 font-medium mt-1">Select scholars eligible for promotion from {sourceClass}.</CardDescription>
                                </div>
                                <div className="relative w-64">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                    <Input
                                        placeholder="Search by name or reg no..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-12 h-11 border-slate-100 bg-slate-50/50 rounded-xl font-bold text-xs focus:bg-white transition-all shadow-none"
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 overflow-auto custom-scrollbar flex-1 relative">
                            {isLoading ? (
                                <div className="p-6 flex items-center justify-center">
                                    <Loader2 className="animate-spin text-indigo-600 h-8 w-8" />
                                </div>
                            ) : sourceStudents.length === 0 ? (
                                <div className="p-12 text-center text-slate-400">
                                    <p className="font-bold text-sm uppercase tracking-widest">No candidates found in {sourceClass}</p>
                                    <p className="text-xs mt-2">They might have already been promoted to {newSession}.</p>
                                </div>
                            ) : (
                                <table className="w-full text-sm text-left min-w-[700px]">
                                    <thead className="sticky top-0 bg-white z-10 border-b border-slate-200">
                                        <tr className="bg-slate-50/50 text-slate-400 font-black text-[10px] uppercase tracking-[4px]">
                                            <th className="p-4 w-12 text-center">
                                                <button onClick={toggleAll} className="text-slate-300 hover:text-indigo-600 transition-colors">
                                                    {selectedIds.size === sourceStudents.length && sourceStudents.length > 0 ? (
                                                        <CheckSquare className="h-5 w-5 text-indigo-600" />
                                                    ) : (
                                                        <Square className="h-5 w-5" />
                                                    )}
                                                </button>
                                            </th>
                                            <th className="p-4">Scholar</th>
                                            <th className="p-4 text-center">Current Grade</th>
                                            <th className="p-4 text-center">Fees Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {sourceStudents.map(s => (
                                            <tr
                                                key={s.id}
                                                className={cn(
                                                    "transition-colors hover:bg-slate-50/50 cursor-pointer",
                                                    selectedIds.has(s.id) && "bg-indigo-50/30"
                                                )}
                                                onClick={() => toggleStudent(s.id)}
                                            >
                                                <td className="p-4 text-center">
                                                    <div className="flex justify-center">
                                                        {selectedIds.has(s.id) ? (
                                                            <CheckSquare className="h-5 w-5 text-indigo-600" />
                                                        ) : (
                                                            <Square className="h-5 w-5 text-slate-300" />
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-slate-100 overflow-hidden">
                                                            <img src={s.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.name}`} className="h-full w-full object-cover" alt="" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-700 text-xs">{s.name}</p>
                                                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">{s.admissionNo || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-bold uppercase text-[9px]">{s.class}-{s.section}</Badge>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <Badge variant="outline" className={cn(
                                                        "font-bold uppercase text-[9px]",
                                                        s.feesStatus === 'PAID' ? "text-emerald-600 border-emerald-100 bg-emerald-50" : "text-amber-600 border-amber-100 bg-amber-50"
                                                    )}>
                                                        {s.feesStatus || 'PENDING'}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Confirmation Dialog */}
            <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <AlertDialogContent className="max-w-md rounded-lgxl border border-slate-200 shadow-3xl bg-white overflow-hidden p-8 animate-in zoom-in-95 duration-300">
                    <AlertDialogHeader className="space-y-3">
                        <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mx-auto shadow-sm">
                            <GraduationCap size={24} />
                        </div>
                        <AlertDialogTitle className="text-center text-xl font-black text-slate-900 tracking-tight uppercase font-heading">Execute Roll Over</AlertDialogTitle>
                        <AlertDialogDescription className="text-center text-slate-400 font-medium text-xs leading-relaxed">
                            You are about to promote <strong>{selectedIds.size} scholars</strong> from <strong>{sourceClass}</strong> to <strong>{targetClass}</strong> for session <strong>{newSession}</strong>. This will irrevocably generate new financial obligations for these scholars.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex gap-3 mt-6">
                        <AlertDialogCancel className="flex-1 h-11 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200 hover:bg-slate-50 transition-colors">Review Roster</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => { e.preventDefault(); promoteMutation.mutate(); }}
                            className="flex-1 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest border-none shadow-sm shadow-indigo-100 transition-colors"
                        >
                            {promoteMutation.isPending ? <Loader2 className="animate-spin" /> : "Confirm Promotion"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
