"use client";

import React, { useState, useEffect } from "react";
import {
   Bell,
   Plus,
   Search,
   Users,
   Megaphone,
   Filter,
   Loader2,
   Trash2,
   Edit3,
   Clock,
   ChevronLeft,
   ChevronRight,
   ShieldCheck,
   BookOpen,
   IndianRupee,
   UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import client from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { APP_CONFIG } from "@/constants/config";
import toast from "react-hot-toast";

import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/AbilityProvider";
import { CreateNotificationModal } from "@/features/website";
import { ConfirmDialog } from "@/components/dialogbox/ConfirmDialog";

// Role display config
const ROLE_CONFIG: Record<string, { label: string; color: string; icon: any; accent: string }> = {
   SUPER_ADMIN:    { label: "Super Admin",    color: "bg-violet-600", icon: ShieldCheck,   accent: "from-violet-600 to-indigo-700" },
   ADMIN:          { label: "Admin",          color: "bg-slate-800",  icon: ShieldCheck,   accent: "from-slate-700 to-slate-900" },
   PRINCIPAL:      { label: "Principal",      color: "bg-purple-600", icon: UserCheck,     accent: "from-purple-600 to-violet-700" },
   VICE_PRINCIPAL: { label: "Vice Principal", color: "bg-blue-600",   icon: UserCheck,     accent: "from-blue-600 to-indigo-700" },
   TEACHER:        { label: "Teacher",        color: "bg-cyan-600",   icon: BookOpen,      accent: "from-cyan-600 to-blue-600" },
   CLASS_TEACHER:  { label: "Class Teacher",  color: "bg-teal-600",   icon: BookOpen,      accent: "from-teal-600 to-cyan-700" },
   ACCOUNTANT:     { label: "Accountant",     color: "bg-amber-600",  icon: IndianRupee,   accent: "from-amber-500 to-orange-600" },
};

const TARGET_LABELS: Record<string, string> = {
   ALL:           "School Wide",
   TEACHER:       "All Teachers",
   CLASS_TEACHER: "Class Teachers",
   PRINCIPAL:     "Principal",
   ACCOUNTANT:    "Accounts Dept.",
   STAFF:         "All Staff",
   PARENTS:       "Parents",
};

const TARGET_COLORS: Record<string, string> = {
   ALL:           "bg-indigo-50 text-indigo-700",
   TEACHER:       "bg-blue-50 text-blue-700",
   CLASS_TEACHER: "bg-cyan-50 text-cyan-700",
   PRINCIPAL:     "bg-purple-50 text-purple-700",
   ACCOUNTANT:    "bg-amber-50 text-amber-700",
   STAFF:         "bg-slate-100 text-slate-700",
   PARENTS:       "bg-green-50 text-green-700",
};

const PAGE_SIZE = 15;

export default function NotificationsPage() {
   const { user } = useAuth();
   const queryClient = useQueryClient();
   const [searchQuery, setSearchQuery] = useState("");
   const [showModal, setShowModal] = useState(false);
   const [editingId, setEditingId] = useState<string | null>(null);
   const [editingNotification, setEditingNotification] = useState<any>(null);
   const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
   const [notificationToDelete, setNotificationToDelete] = useState<string | null>(null);
   const [currentPage, setCurrentPage] = useState(1);

   const role = user?.role?.toUpperCase() || 'ADMIN';
   const roleConf = ROLE_CONFIG[role] || ROLE_CONFIG['ADMIN'];
   const RoleIcon = roleConf.icon;

   // Fetch role-filtered notices
   const { data: result, isLoading } = useQuery<any>({
      queryKey: ['notices', currentPage, role],
      queryFn: async () => {
         return client.get('/website/notices');
      },
      staleTime: 5000,
   });

   const rawList: any[] = Array.isArray(result) ? result : result?.notices || result?.data || [];
   const notices: any[] = rawList;
   const totalCount: number = typeof result?.total === 'number' ? result.total : rawList.length;
   const totalPages: number = result?.totalPages || Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

   // Clear unread notification status since we are viewing the notices list
   useEffect(() => {
      if (typeof window !== "undefined" && notices.length > 0) {
         localStorage.setItem("crm_notices_last_read_at", String(Date.now()));
      }
   }, [notices]);

   // Create Mutation
   const createMutation = useMutation({
      mutationFn: (data: any) => client.post('/website/notices', data),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['notices'] });
         toast.success(editingId ? "Notice updated successfully." : "Notice dispatched successfully.");
         handleCloseModal();
      },
      onError: (err: any) => toast.error(err?.message || "Failed to send notice. Please try again.")
   });

   // Delete Mutation
   const deleteMutation = useMutation({
      mutationFn: (id: string) => client.delete(`/website/notices/${id}`),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['notices'] });
         toast.success("Notice deleted successfully.");
      },
      onError: (err: any) => toast.error(err?.message || "Failed to delete notice.")
   });

   const handleCloseModal = () => {
      setShowModal(false);
      setEditingId(null);
      setEditingNotification(null);
   };

   const handleSubmit = (data: any) => {
      if (!data.title || !data.message) return toast.error("Notice subject and message are required.");
      createMutation.mutate(data);
   };

   const handleDelete = (id: string) => {
      setNotificationToDelete(id);
      setDeleteConfirmOpen(true);
   };

   const handleEdit = (notif: any) => {
      setEditingId(notif.id);
      setEditingNotification({
         title: notif.title,
         target: notif.targetRole || 'ALL',
         message: notif.content || notif.message || '',
         priority: !!notif.priority
      });
      setShowModal(true);
   };

   const filtered = notices.filter(n =>
      n.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.content || n.message || '')?.toLowerCase().includes(searchQuery.toLowerCase())
   );

   const canCreate = ['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER', 'CLASS_TEACHER', 'ACCOUNTANT'].includes(role);
   const canDeleteAny = ['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL'].includes(role);

    return (
      <div className="flex-1 space-y-8 p-8 pt-6 bg-slate-50/50 min-h-screen font-sans" suppressHydrationWarning>

         {/* ─── Page Header ─── */}
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-in fade-in duration-500">
            <div className="flex items-start gap-4">
               {/* Role Badge */}
               <div className={`h-12 w-12 rounded-2xl bg-linear-to-br ${roleConf.accent} flex items-center justify-center shadow-lg shadow-slate-200 shrink-0`}>
                  <RoleIcon size={20} className="text-white" strokeWidth={2.5} />
               </div>
               <div>
                  <h2 className="text-3xl font-black tracking-tighter text-slate-900 flex items-center gap-3 uppercase  font-heading">
                     Institutional <span className="text-indigo-600">Notices</span>
                  </h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[4px] mt-1.5">
                     {roleConf.label} View • {totalCount} total notices
                     {role === 'TEACHER' || role === 'CLASS_TEACHER' ? ' visible to you' : ''}
                  </p>
               </div>
            </div>

            {canCreate && (
               <Button
                  onClick={() => setShowModal(true)}
                  className="bg-slate-900 hover:bg-slate-800 text-white h-11 px-8 rounded-lgxl font-bold uppercase text-[10px] tracking-widest shadow-massive transition-all active:scale-95 flex items-center gap-2"
               >
                  <Plus size={15} /> New Notice
               </Button>
            )}

            <CreateNotificationModal
               isOpen={showModal}
               onOpenChange={(open) => !open && handleCloseModal()}
               editingId={editingId}
               initialData={editingNotification}
               onSubmit={handleSubmit}
               isPending={createMutation.isPending}
            />
         </div>

         {/* ─── Role Info Banner ─── */}
         <div className={`flex items-center gap-4 p-5 rounded-lgxl bg-linear-to-r ${roleConf.accent} text-white shadow-[0_8px_30px_rgb(0,0,0,0.02)]`}>
            <RoleIcon size={18} className="shrink-0" />
            <div>
               <p className="text-[10px] font-black uppercase tracking-[3px] leading-relaxed">
                  {role === 'SUPER_ADMIN' || role === 'ADMIN'
                     ? 'You can see ALL notices from every role in the institution.'
                     : role === 'PRINCIPAL'
                     ? 'You see school-wide notices and notices directed to teachers & staff.'
                     : role === 'ACCOUNTANT'
                     ? 'You see notices addressed to the accounts department and all-staff broadcasts.'
                     : ['TEACHER', 'CLASS_TEACHER'].includes(role)
                     ? 'You see notices from administration relevant to teaching staff and your class.'
                     : 'You see notices relevant to your role.'
                  }
               </p>
            </div>
         </div>

         {/* ─── Table ─── */}
         <div className="bg-white rounded-lgxl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden animate-in fade-in duration-700">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-white gap-4">
               <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <Input
                     placeholder="Search notices by identity..."
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="pl-12 h-11 border-slate-100 bg-slate-50/50 rounded-xl font-bold text-xs focus:bg-white transition-all shadow-none"
                  />
               </div>
               <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[3px] text-slate-400">
                  <Filter size={12} />
                  Showing {filtered.length} of {totalCount}
               </div>
            </div>

            <div className="min-h-100">
               {isLoading ? (
                  <div className="p-10 space-y-4">
                     {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
                  </div>
               ) : filtered.length === 0 ? (
                  <div className="h-80 flex flex-col items-center justify-center text-slate-300 gap-4">
                     <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center">
                        <Megaphone size={32} strokeWidth={1.5} />
                     </div>
                     <div className="text-center">
                        <p className="text-[10px] font-black uppercase tracking-[4px] text-slate-400">No Notices Found</p>
                        <p className="text-[9px] font-medium text-slate-300 mt-1">
                           {searchQuery ? "No results match your search." : "No notices have been sent to your role yet."}
                        </p>
                     </div>
                  </div>
               ) : (
                  <Table className="min-w-250">
                     <TableHeader className="bg-slate-50/50 border-b border-slate-200">
                        <TableRow className="hover:bg-transparent border-none">
                           <TableHead className="w-[320px] px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[4px]">Notice</TableHead>
                           <TableHead className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[4px]">Target</TableHead>
                           <TableHead className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[4px]">Sent By</TableHead>
                           <TableHead className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[4px]">Date</TableHead>
                           <TableHead className="text-right px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[4px]">Actions</TableHead>
                        </TableRow>
                     </TableHeader>
                     <TableBody>
                        {filtered.map((notif) => {
                           const target = notif.targetRole || 'ALL';
                           const targetLabel = TARGET_LABELS[target] || target;
                           const targetColor = TARGET_COLORS[target] || TARGET_COLORS['ALL'];
                           const creatorRole = notif.createdByRole || 'ADMIN';
                           const creatorConf = ROLE_CONFIG[creatorRole] || ROLE_CONFIG['ADMIN'];
                           const isOwnNotice = notif.createdById === user?.id || canDeleteAny;

                           return (
                              <TableRow key={notif.id} className="group hover:bg-slate-50/50 border-b border-slate-100 transition-colors duration-200">
                                 <TableCell className="px-8 py-5">
                                    <div className="flex items-center space-x-4">
                                       <div className={`h-9 w-9 rounded-xl ${creatorConf.color} flex items-center justify-center text-white shadow-sm shrink-0`}>
                                          <Bell size={14} strokeWidth={2.5} />
                                       </div>
                                       <div className="max-w-60 space-y-1">
                                          <p className="font-black text-slate-900 text-[11px] tracking-tight leading-none  uppercase">{notif.title}</p>
                                          <p className="text-[10px] text-slate-500 font-medium truncate leading-relaxed">{notif.content || notif.message}</p>
                                       </div>
                                    </div>
                                 </TableCell>
                                 <TableCell className="px-8 py-5">
                                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border w-fit ${targetColor}`}>
                                       <Users size={10} />
                                       <span className="text-[9px] font-black uppercase tracking-widest">{targetLabel}</span>
                                    </div>
                                 </TableCell>
                                 <TableCell className="px-8 py-5">
                                    <div className="flex items-center gap-2">
                                       <div className={`h-6 w-6 rounded-full ${creatorConf.color} flex items-center justify-center text-[8px] font-black text-white`}>
                                          {creatorRole.slice(0, 2)}
                                       </div>
                                       <span className="text-[10px] font-bold text-slate-600">{creatorConf.label}</span>
                                    </div>
                                 </TableCell>
                                 <TableCell className="px-8 py-5">
                                    <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                       <Clock size={11} />
                                       {new Date(notif.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </div>
                                 </TableCell>
                                 <TableCell className="px-8 py-5 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                       {isOwnNotice && (
                                          <Button
                                             onClick={() => handleEdit(notif)}
                                             variant="outline"
                                             size="sm"
                                             className="h-9 w-9 p-0 text-slate-400 hover:text-indigo-600 border border-slate-100 rounded-xl hover:bg-slate-50 transition-all bg-white"
                                          >
                                             <Edit3 size={13} />
                                          </Button>
                                       )}
                                       {(canDeleteAny || notif.createdById === user?.id) && (
                                          <Button
                                             onClick={() => handleDelete(notif.id)}
                                             variant="outline"
                                             size="sm"
                                             className="h-9 w-9 p-0 text-slate-400 hover:text-red-600 border border-slate-100 rounded-xl hover:bg-slate-50 transition-all bg-white"
                                          >
                                             {deleteMutation.isPending ? <Loader2 className="animate-spin" size={13} /> : <Trash2 size={13} />}
                                          </Button>
                                       )}
                                    </div>
                                 </TableCell>
                              </TableRow>
                           );
                        })}
                     </TableBody>
                  </Table>
               )}
            </div>

            {/* ─── Pagination ─── */}
            {totalPages > 1 && (
               <div className="p-5 border-t border-slate-50 flex items-center justify-between">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                     Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                     <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 rounded-lg border-slate-100"
                        disabled={currentPage <= 1}
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                     >
                        <ChevronLeft size={14} />
                     </Button>
                     {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                        if (page > totalPages) return null;
                        return (
                           <Button
                              key={page}
                              variant={currentPage === page ? "default" : "outline"}
                              className={cn(
                                 "h-9 w-9 rounded-lg text-[10px] font-black border-slate-100",
                                 currentPage === page ? "bg-slate-900 text-white border-none" : ""
                              )}
                              onClick={() => setCurrentPage(page)}
                           >
                              {page}
                           </Button>
                        );
                     })}
                     <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 rounded-lg border-slate-100"
                        disabled={currentPage >= totalPages}
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                     >
                        <ChevronRight size={14} />
                     </Button>
                  </div>
               </div>
            )}
         </div>

         <ConfirmDialog
            isOpen={deleteConfirmOpen}
            onClose={() => {
               setDeleteConfirmOpen(false);
               setNotificationToDelete(null);
            }}
            onConfirm={() => {
               if (notificationToDelete) {
                  deleteMutation.mutate(notificationToDelete);
                  setDeleteConfirmOpen(false);
                  setNotificationToDelete(null);
               }
            }}
            title="Delete this notice?"
            description="This will permanently delete the notice. Recipients will no longer be able to see it."
            type="danger"
         />
      </div>
   );
}
