"use client";
import React, { useState } from "react";
import {
   Book,
   Search,
   Loader2,
   CheckCircle2,
   AlertCircle,
   Plus,
   X,
   Send,
   PieChart,
   BarChart3,
   Clock,
   Flag
} from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import client from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useAuth } from "@/components/AbilityProvider";
import { SubmitHomeworkModal } from "@/features/academic";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function HomeworkPage() {
   const queryClient = useQueryClient();
   const { user, loading: authLoading } = useAuth();
   const userRole = user?.role?.toUpperCase() || "SUPER_ADMIN";
   const isTeacher = userRole === 'TEACHER' || userRole === 'CLASS_TEACHER';

   const [mounted, setMounted] = useState(false);
   const [searchQuery, setSearchQuery] = useState("");
   const [showAddModal, setShowAddModal] = useState(false);
   const [showStatsDrawer, setShowStatsDrawer] = useState<any>(null);

   React.useEffect(() => {
      setMounted(true);
   }, []);

   // Confirmation Dialog States
   const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
   const [homeworkToDelete, setHomeworkToDelete] = useState<string | null>(null);

   // Filters
   const [filterClass, setFilterClass] = useState("ALL");
   const [filterPriority, setFilterPriority] = useState("ALL");

   // Query: Teacher's Assignments (Governance Registry)
   const { data: assignmentsList = [] } = useQuery({
      queryKey: ['teacher-assignments-hw'],
      enabled: !!user && isTeacher,
      queryFn: () => client.get('/staff/timetable')
   });

   // Map assignments for quick lookup: { "CLASS-SECTION": ["SUBJECT1", "SUBJECT2"] }
   const teacherAssignmentsMap = React.useMemo(() => {
      const map: Record<string, string[]> = {};
      assignmentsList.forEach((a: any) => {
         const key = `${a.class}-${a.section || 'A'}`;
         if (!map[key]) map[key] = [];
         if (!map[key].includes(a.subject)) map[key].push(a.subject);
      });
      return map;
   }, [assignmentsList]);

   const ALL_DEFAULT_CLASSES = ['NURSERY', '1ST', '2ND', '3RD', '4TH', '5TH', '6TH', '7TH', '8TH', '9TH', '10TH', '11TH', '12TH'];

   // Derived: List of classes teacher actually teaches
   const teacherClasses = React.useMemo(() => {
      if (!mounted || !user || !isTeacher) {
         return ALL_DEFAULT_CLASSES;
      }
      const classes = new Set<string>();
      if (user.class) classes.add(user.class);
      assignmentsList.forEach((a: any) => classes.add(a.class));
      const list = Array.from(classes).filter(Boolean).sort();
      return list.length > 0 ? list : ALL_DEFAULT_CLASSES;
   }, [mounted, user, isTeacher, assignmentsList]);

   // Normalization helper
   const cleanCls = (str: string) => (str || '').toUpperCase().replace(/^GRADE\s+/i, '').replace(/^CLASS\s+/i, '').trim();

   // Permission Helpers
   const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'MANAGEMENT'].includes(user?.role?.toUpperCase());

   const canManageHW = (hw: any) => {
      if (isAdmin) return true;
      if (!isTeacher) return false;

      // Class Teacher can manage homework for their own class
      const teacherClass = user?.class || user?.staffProfile?.class || '';
      if (teacherClass && hw.class && cleanCls(teacherClass) === cleanCls(hw.class)) return true;

      // Subject Teacher can manage homework for their subject
      const teacherSubject = user?.subject || user?.staffProfile?.subject || '';
      if (teacherSubject && hw.subject && teacherSubject.toUpperCase() === hw.subject.toUpperCase()) return true;

      // Creator
      if (hw.teacherId === user?.id || hw.teacherId === user?.userId) return true;

      return false;
   };

   // Query: Assignments
   const { data: rawAssignments = [], isLoading: hwLoading } = useQuery<any>({
      queryKey: ['homework', userRole],
      enabled: !!user && !authLoading,
      queryFn: async () => {
         const res: any = await client.get('/academic/homework');
         return Array.isArray(res) ? res : res?.data || [];
      }
   });

   const assignments: any[] = React.useMemo(() => {
      return Array.isArray(rawAssignments) ? rawAssignments : rawAssignments?.data || [];
   }, [rawAssignments]);

   // Query: Analytics
   const { data: rawAnalytics } = useQuery<any>({
      queryKey: ['homework-analytics'],
      enabled: !!user && !authLoading,
      queryFn: async () => {
         return client.get('/academic/homework/analytics');
      }
   });

   const analytics = React.useMemo(() => {
      if (rawAnalytics && typeof rawAnalytics === 'object' && !Array.isArray(rawAnalytics)) {
         return {
            totalActive: rawAnalytics.totalActive ?? assignments.length,
            overdueTasks: rawAnalytics.overdueTasks ?? 0,
            priorityFlagged: rawAnalytics.priorityFlagged ?? 0,
            globalCompletion: rawAnalytics.globalCompletion ?? 0,
         };
      }
      return {
         totalActive: assignments.length,
         overdueTasks: 0,
         priorityFlagged: assignments.filter((h: any) => h.isUrgent || h.priority === 'HIGH').length,
         globalCompletion: 0,
      };
   }, [rawAnalytics, assignments]);

   // Query: Engagement Stats (Dependent)
   const { data: statsData = [], isLoading: statsLoading } = useQuery<any[]>({
      queryKey: ['homework-stats', showStatsDrawer?.id || showStatsDrawer?._id],
      enabled: !!showStatsDrawer,
      queryFn: async () => {
         const hwId = showStatsDrawer?.id || showStatsDrawer?._id;
         const res: any = await client.get(`/academic/homework/stats/${hwId}`);
         return Array.isArray(res) ? res : res?.data || [];
      }
   });

   // Mutations
   const createMutation = useMutation({
      mutationFn: (data: any) => client.post('/academic/homework', data),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['homework'] });
         queryClient.invalidateQueries({ queryKey: ['homework-analytics'] });
         toast.success("Institutional Assignment Created Successfully! ✓");
         setShowAddModal(false);
      },
      onError: () => toast.error("Failed to create assignment")
   });

   const deleteMutation = useMutation({
      mutationFn: (id: string) => client.delete(`/academic/homework/${id}`),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['homework'] });
         queryClient.invalidateQueries({ queryKey: ['homework-analytics'] });
         toast.success("Assignment Retracted Successfully");
      },
      onError: () => toast.error("Retraction Failed")
   });

   const toggleStatusMutation = useMutation({
      mutationFn: ({ studentId, homeworkId, status }: { studentId: any; homeworkId: any; status: string }) =>
         client.post('/academic/homework/submit', { studentId, homeworkId, status }),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['homework-stats', showStatsDrawer?.id || showStatsDrawer?._id] });
         queryClient.invalidateQueries({ queryKey: ['homework'] });
         toast.success("Submission status synchronized ✓");
      },
      onError: (err: any) => {
         toast.error(err.response?.data?.error || "Status update failed");
      }
   });

   const handleToggleStatus = (studentId: any, currentStatus: string) => {
      if (!showStatsDrawer) return;
      const homeworkId = showStatsDrawer.id || showStatsDrawer._id;
      const nextStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
      toggleStatusMutation.mutate({ studentId, homeworkId, status: nextStatus });
   };

   const handleCreate = (data: any) => {
      const payload = {
         ...data,
         teacherId: user?.id || user?.userId,
         teacherName: user?.name || user?.staffProfile?.name || 'Faculty',
         status: 'ACTIVE',
      };
      createMutation.mutate(payload);
   };

   const handleDelete = (id: string) => {
      setHomeworkToDelete(id);
      setDeleteConfirmOpen(true);
   };

   const filtered = assignments.filter(hw => {
      const matchesSearch = hw.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         hw.subject?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesClass = filterClass === "ALL" || cleanCls(hw.class) === cleanCls(filterClass);
      const matchesPriority = filterPriority === "ALL" || hw.priority === filterPriority;
      return matchesSearch && matchesClass && matchesPriority;
   });

   return (
      <div className="flex-1 space-y-8 p-8 pt-6 bg-[#F8FAFC] min-h-screen">

         {/* 🏛️ INSTITUTIONAL HEADER */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
               <h2 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                  Academic <span className="text-indigo-600">Curriculum</span> Hub
               </h2>
               <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">
                  Classroom Portfolio & Homework Registry
               </p>
            </div>
            <div className="flex items-center gap-3">
               <Button
                  variant="outline"
                  onClick={() => queryClient.invalidateQueries({ queryKey: ['homework'] })}
                  className="h-10 border-slate-200 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm cursor-pointer"
               >
                  {hwLoading ? <Loader2 className="animate-spin h-3 w-3 mr-2" /> : "Sync Data"}
               </Button>

               <Button
                  onClick={() => setShowAddModal(true)}
                  className="h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs uppercase tracking-wider px-5 shadow-md shadow-indigo-200 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
               >
                  <Plus size={16} /> Assign Homework
               </Button>

               <SubmitHomeworkModal
                  isOpen={showAddModal}
                  onOpenChange={setShowAddModal}
                  teacherClasses={teacherClasses}
                  teacherAssignmentsMap={teacherAssignmentsMap}
                  onSubmit={handleCreate}
                  isPending={createMutation.isPending}
                  user={user}
                  isTeacher={isTeacher}
                  isAdmin={isAdmin}
               />
            </div>
         </div>

         {/* 📊 ANALYTICS GRID */}
         <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
               { label: "Active Submissions", value: analytics.totalActive, icon: Book, color: "text-brand-indigo", bg: "bg-indigo-50" },
               { label: "Institutional Progress", value: `${analytics.globalCompletion}%`, icon: PieChart, color: "text-emerald-600", bg: "bg-emerald-50" },
               { label: "Overdue Milestones", value: analytics.overdueTasks, icon: Clock, color: "text-rose-600", bg: "bg-rose-50" },
               { label: "High Priority Nodes", value: analytics.priorityFlagged, icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50" }
            ].map((stat, i) => (
               <div
                  key={i}
                  className="bg-white rounded-lg border border-slate-100 p-6 flex items-center justify-between shadow-[0_8px_30px_rgba(15,23,42,0.03)] hover:shadow-[0_20px_40px_rgba(15,23,42,0.06)] hover:-translate-y-1 transition-all duration-300 group"
               >
                  <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-1">{stat.label}</p>
                     <h3 className="text-3xl font-black text-slate-900 group-hover:scale-105 transition-transform duration-300 origin-left">{stat.value}</h3>
                  </div>
                  <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:rotate-6", stat.bg)}>
                     <stat.icon className={cn("h-6 w-6", stat.color)} />
                  </div>
               </div>
            ))}
         </div>

         {/* 🧬 REGISTRY TABLE HUB */}
         <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgba(15,23,42,0.03)] overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
               <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                     placeholder="Filter curriculum by task identity..."
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="pl-11 bg-slate-50/50 h-12 border border-slate-100 hover:border-slate-200 focus-visible:border-slate-350 focus-visible:ring-1 focus-visible:ring-slate-350 rounded-2xl font-semibold text-xs transition-all outline-none"
                  />
               </div>
               <div className="flex flex-wrap items-center gap-3">
                  <select
                     suppressHydrationWarning
                     value={filterClass}
                     onChange={e => setFilterClass(e.target.value)}
                     className="h-12 px-5 bg-slate-50/50 border border-slate-100 hover:border-slate-200 rounded-2xl text-[10px] font-bold uppercase tracking-wider outline-none cursor-pointer transition-all min-w-[140px]"
                  >
                     <option value="ALL">All Classes</option>
                     {teacherClasses.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select
                     suppressHydrationWarning
                     value={filterPriority}
                     onChange={e => setFilterPriority(e.target.value)}
                     className="h-12 px-5 bg-slate-50/50 border border-slate-100 hover:border-slate-200 rounded-2xl text-[10px] font-bold uppercase tracking-wider outline-none cursor-pointer transition-all min-w-[140px]"
                  >
                     <option value="ALL">All Priorities</option>
                     <option value="LOW">Low</option>
                     <option value="MEDIUM">Medium</option>
                     <option value="HIGH">High</option>
                  </select>
               </div>
            </div>

            <div className="overflow-x-auto">
               {hwLoading ? (
                  <div className="p-10 space-y-6">
                     {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}
                  </div>
               ) : (
                  <table className="w-full min-w-[1000px]">
                     <thead>
                        <tr className="bg-slate-50/30 text-[10px] font-black text-slate-400 uppercase tracking-[3px] border-b border-slate-50">
                           <th className="text-left py-6 px-10">Academic Task Node</th>
                           <th className="text-left py-6 px-6">Scope</th>
                           <th className="text-left py-6 px-6">Lead Faculty</th>
                           <th className="text-left py-6 px-6">Milestone Data</th>
                           <th className="text-right py-6 px-10">Governance Hub</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {filtered.map((hw, idx) => (
                           <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                              <td className="py-6 px-10">
                                 <div className="flex items-center space-x-4">
                                    <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center border transition-all duration-300 group-hover:scale-105", hw.priority === 'HIGH' ? 'bg-rose-50/50 text-rose-600 border-rose-100/50' : 'bg-indigo-50/50 text-indigo-600 border-indigo-100/50')}>
                                       <Book size={20} />
                                    </div>
                                    <div>
                                       <p className="font-black text-slate-900 leading-tight uppercase text-[11px] tracking-tight">{hw.title}</p>
                                       <p className="text-[10px] text-brand-indigo font-black uppercase tracking-[2px] mt-1">{hw.subject}</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="py-6 px-6">
                                 <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200/40 uppercase tracking-widest">
                                    {hw.class}-{hw.section}
                                 </span>
                              </td>
                              <td className="py-6 px-6">
                                 <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shadow-sm">
                                       <img src={hw.teacher?.image || `https://api.dicebear.com/7.x/initials/svg?seed=${hw.teacherName || 'Faculty'}`} className="h-full w-full object-cover" />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{hw.teacherName || 'Institutional Admin'}</span>
                                 </div>
                              </td>
                              <td className="py-6 px-6">
                                 <div className="space-y-1.5">
                                    <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-slate-400">
                                       <span>Progress</span>
                                       <span>{hw.submissions?.length || 0} Submitted</span>
                                    </div>
                                    <div className="h-2 w-32 bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                                       <div
                                          className={cn(
                                             "h-full rounded-full transition-all duration-1000 bg-linear-to-r",
                                             hw.priority === 'HIGH'
                                                ? 'from-rose-50 to-pink-600'
                                                : 'from-brand-indigo to-violet-600'
                                          )}
                                          style={{ width: `${Math.min((hw.submissions?.length || 0) * 10, 100)}%` }}
                                       />
                                    </div>
                                    <p className="text-[9px] font-bold text-slate-400 ">Due: {hw.dueDate}</p>
                                 </div>
                              </td>
                              <td className="py-6 px-10 text-right">
                                 <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-all duration-300">
                                    <Button
                                       variant="outline"
                                       size="sm"
                                       onClick={() => setShowStatsDrawer(hw)}
                                       className="h-9 px-4 rounded-xl border border-slate-100 hover:border-slate-200 text-indigo-600 hover:text-indigo-700 bg-white hover:bg-indigo-50/50 font-bold text-[9px] uppercase tracking-wider transition-all shadow-sm"
                                    >
                                       <BarChart3 size={14} className="mr-2" /> Audit
                                    </Button>
                                    {canManageHW(hw) ? (
                                       <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleDelete(hw.id || hw._id)}
                                          disabled={deleteMutation.isPending}
                                          className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-100 hover:border-rose-200 text-rose-500 hover:text-rose-600 bg-white hover:bg-rose-50/50 transition-all shadow-sm"
                                       >
                                          {deleteMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <X size={14} />}
                                       </Button>
                                    ) : (
                                       <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 rounded bg-slate-50 border border-slate-100">Read Only</span>
                                    )}
                                 </div>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               )}
               {!hwLoading && filtered.length === 0 && (
                  <div className="py-32 flex flex-col items-center justify-center text-slate-350 gap-6">
                     <div className="h-20 w-20 rounded-3xl bg-slate-50 flex items-center justify-center border border-dashed border-slate-200/80 shadow-inner">
                        <Flag size={28} className="text-slate-400" />
                     </div>
                     <div className="text-center max-w-sm">
                        <p className="text-sm font-black text-slate-700 uppercase tracking-widest">Registry Void</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-2 leading-relaxed text-center">No curriculum tasks found for the current filter criteria.</p>
                     </div>
                     <Button
                        onClick={() => setShowAddModal(true)}
                        variant="outline"
                        className="mt-2 border-slate-250 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50/50 h-10 px-8 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-sm transition-all"
                     >
                        Submit First Task
                     </Button>
                  </div>
               )}
            </div>
         </div>

         {/* 🗑️ RETRACT CONFIRMATION DIALOG */}
         <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
            <AlertDialogContent className="max-w-sm rounded-[24px] border border-slate-100 shadow-2xl p-6 bg-white overflow-hidden">
               <AlertDialogHeader className="space-y-4">
                  <div className="h-12 w-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                     <AlertCircle size={24} />
                  </div>
                  <AlertDialogTitle className="text-center font-black text-slate-900 uppercase text-xs tracking-[2px]">Retract Assignment?</AlertDialogTitle>
                  <AlertDialogDescription className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                     This will permanently retract this curriculum task and all scholar submissions from the registry.
                  </AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter className="flex gap-3 mt-6">
                  <AlertDialogCancel className="h-11 rounded-xl text-[10px] font-bold uppercase tracking-wider border border-slate-200 flex-1 hover:bg-slate-50 transition-all">
                     Abort
                  </AlertDialogCancel>
                  <AlertDialogAction
                     onClick={() => {
                        if (homeworkToDelete) {
                           deleteMutation.mutate(homeworkToDelete);
                           setHomeworkToDelete(null);
                        }
                     }}
                     className="h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black uppercase tracking-wider border-none flex-1 shadow-lg shadow-slate-100 transition-all"
                  >
                     Confirm
                  </AlertDialogAction>
               </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>

         {/* 📊 ENGAGEMENT DRAWER */}
         {showStatsDrawer && (
            <div className="fixed inset-0 z-[100] flex justify-end">
               <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md" onClick={() => setShowStatsDrawer(null)} />
               <div className="relative w-full max-w-xl bg-white shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-500 rounded-l-[30px]">
                  <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                     <div>
                        <h3 className="text-2xl font-black text-slate-900 leading-none tracking-tight">Curriculum <span className="text-brand-indigo">Engagement</span></h3>
                        <p className="text-[10px] font-black text-brand-indigo uppercase tracking-[3px] mt-2">{showStatsDrawer.title}</p>
                     </div>
                     <Button variant="ghost" size="sm" onClick={() => setShowStatsDrawer(null)} className="h-12 w-12 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center"><X size={24} /></Button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
                     <div className="grid grid-cols-2 gap-6">
                        <div className="p-6 rounded-2xl bg-emerald-50/40 border border-emerald-100/60 flex items-center justify-between shadow-sm">
                           <div>
                              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[2px]">Compliant</p>
                              <p className="text-4xl font-black text-emerald-700 mt-2">{statsData.filter(s => s.completionStatus === 'COMPLETED').length}</p>
                           </div>
                           <CheckCircle2 size={40} className="text-emerald-500/20" />
                        </div>
                        <div className="p-6 rounded-2xl bg-rose-50/40 border border-rose-100/60 flex items-center justify-between shadow-sm">
                           <div>
                              <p className="text-[10px] font-black text-rose-600 uppercase tracking-[2px]">Pending</p>
                              <p className="text-4xl font-black text-rose-700 mt-2">{statsData.filter(s => s.completionStatus === 'PENDING').length}</p>
                           </div>
                           <AlertCircle size={40} className="text-rose-500/20" />
                        </div>
                     </div>

                     <div className="space-y-6">
                        <div className="flex items-center justify-between">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-[3px]">Scholar Registry Status</label>
                           <Badge className="bg-slate-900 text-[8px] px-3 py-1 font-black uppercase tracking-widest rounded-lg">{statsData.length} Total Scholars</Badge>
                        </div>

                        {statsLoading ? (
                           <div className="py-32 flex flex-col items-center justify-center text-slate-300 gap-4">
                              <Loader2 size={48} className="animate-spin text-brand-indigo" />
                              <p className="text-[10px] font-black uppercase tracking-[4px]">Syncing Registry...</p>
                           </div>
                        ) : (
                           <div className="grid gap-3">
                              {statsData.map((student, idx) => (
                                 <div key={idx} className="p-4 rounded-2xl border border-slate-100 flex items-center justify-between group hover:bg-slate-50/50 hover:shadow-sm hover:scale-[1.01] transition-all duration-200 bg-white">
                                    <div className="flex items-center gap-4">
                                       <div className="h-11 w-11 rounded-xl bg-white border border-slate-100 overflow-hidden shadow-sm">
                                          <img src={student.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`} className="h-full w-full object-cover" alt="" />
                                       </div>
                                       <div>
                                          <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{student.name}</p>
                                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Enrollment Node: {student.rollNo || 'N/A'}</p>
                                       </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                       <Badge className={cn(
                                          "text-[9px] font-black uppercase tracking-[2px] px-3.5 py-1.5 rounded-full",
                                          student.completionStatus === 'COMPLETED' ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-100 text-slate-400"
                                       )}>
                                          {student.completionStatus === 'COMPLETED' ? 'Verified' : 'Incomplete'}
                                       </Badge>
                                       {canManageHW(showStatsDrawer) && (
                                          <Button
                                             variant="outline"
                                             size="sm"
                                             disabled={toggleStatusMutation.isPending}
                                             onClick={() => handleToggleStatus(student.id || student._id, student.completionStatus)}
                                             className={cn(
                                                "h-8 px-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all duration-200",
                                                student.completionStatus === 'COMPLETED'
                                                   ? "border-rose-200 text-rose-500 hover:bg-rose-50"
                                                   : "border-emerald-200 text-emerald-600 hover:bg-emerald-50 bg-emerald-50/20"
                                             )}
                                          >
                                             {student.completionStatus === 'COMPLETED' ? 'Revoke' : 'Verify'}
                                          </Button>
                                       )}
                                    </div>
                                 </div>
                              ))}
                           </div>
                        )}
                     </div>
                  </div>
                  <div className="p-8 border-t border-slate-50 bg-slate-50/30 rounded-bl-[30px]">
                     <Button
                        onClick={() => {
                           const pendingCount = statsData.filter(s => s.completionStatus === 'PENDING').length;
                           toast.success(`Push reminder dispatched to ${pendingCount} pending scholars & guardians! 📨`);
                        }}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white h-12 font-black uppercase text-xs tracking-widest rounded-xl shadow-lg shadow-slate-100 flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95"
                     >
                        <Send size={16} className="mr-2" /> Push Global Reminder
                     </Button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}
