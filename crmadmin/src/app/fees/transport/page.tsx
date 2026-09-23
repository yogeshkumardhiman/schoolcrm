"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
   ArrowLeft,
   Bus,
   Loader2,
   RefreshCcw,
   Plus,
   Trash2,
   MapPin,
   ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import client from "@/lib/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ConfirmDialog } from "@/components/dialogbox/ConfirmDialog";
import {
   Table,
   TableHeader,
   TableBody,
   TableRow,
   TableHead,
   TableCell,
} from "@/components/ui/table";
import { AddTransportRouteModal } from "@/features/transport";

export default function TransportRoutesPage() {
   const router = useRouter();
   const queryClient = useQueryClient();
   const [editingRoute, setEditingRoute] = useState<any | null>(null);
   const [isDialogOpen, setIsDialogOpen] = useState(false);

   // Delete confirmation states
   const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
   const [routeToDelete, setRouteToDelete] = useState<any | null>(null);

   // Fetch Data
   const { data: routes = [], isLoading, isFetching } = useQuery<any[]>({
      queryKey: ['transport-routes'],
      queryFn: async () => {
         return client.get('/transport/routes');
      }
   });

   // Mutations
   const updateMutation = useMutation({
      mutationFn: (data: any) => client.post('/transport/routes', data),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['transport-routes'] });
         toast.success("Transport registry synchronized");
         setEditingRoute(null);
         setIsDialogOpen(false);
      },
      onError: () => toast.error("Update failed")
   });

   const deleteMutation = useMutation({
      mutationFn: (id: string) => client.delete(`/transport/routes/${id}`),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['transport-routes'] });
         toast.success("Route decommissioned");
      },
      onError: () => toast.error("Deletion failed")
   });

   const handleUpdate = (modalFormData: any) => {
      if (!modalFormData.routeName || !modalFormData.monthlyFee) {
         return toast.error("Route name and fee are mandatory");
      }
      updateMutation.mutate(modalFormData);
   };

   const handleDelete = (route: any) => {
      setRouteToDelete(route);
      setDeleteConfirmOpen(true);
   };

   const addNew = () => {
      setEditingRoute(null);
      setIsDialogOpen(true);
   };

   return (
      <div className="flex-1 space-y-10 p-10 bg-[#FBFDFF] min-h-screen font-sans antialiased text-slate-900">

         {/* Premium Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white p-10 rounded-lg border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600" />
            <div className="flex items-center gap-8">
               <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push('/fees')}
                  className="h-14 w-14 rounded-lgxl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-all shadow-inner"
               >
                  <ArrowLeft size={24} />
               </Button>
               <div className="space-y-2">
                  <div className="flex items-center gap-3">
                     <Bus className="text-indigo-600 h-6 w-6" />
                     <h2 className="text-3xl font-black tracking-tight text-slate-900">
                        Transport <span className="text-indigo-600">Logistics</span>
                     </h2>
                  </div>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Centralized Route Registry & Fleet Billing</p>
               </div>
            </div>
            <div className="flex items-center gap-4">
               <Button onClick={addNew} className="bg-slate-900 hover:bg-slate-800 text-white h-12 px-6 font-bold uppercase text-[10px] tracking-widest shadow-lg rounded-xl">
                  <Plus size={16} className="mr-2" /> New Route Node
               </Button>
            </div>
         </div>

         {/* Main Registry Table */}
         <Card className="rounded-lg border-none shadow-2xl bg-white overflow-hidden">
            <CardHeader className="p-10 border-b border-slate-50 flex flex-row items-center justify-between bg-slate-50/30">
               <div>
                  <CardTitle className="text-2xl font-black tracking-tight text-slate-900">Route <span className="text-indigo-600">Console</span></CardTitle>
                  <CardDescription className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-2">
                     Institutional fleet configuration terminal
                     <span className="h-1 w-1 rounded-full bg-slate-300" />
                     <span className="text-indigo-600 font-bold">Precision Billing Active</span>
                  </CardDescription>
               </div>
               <div className="flex items-center gap-4">
                  <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['transport-routes'] })} variant="outline" className="h-10 px-5 rounded-xl border-slate-200 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50">
                     <RefreshCcw size={12} className={cn("mr-2", isFetching && "animate-spin")} /> Refresh Registry
                  </Button>
               </div>
            </CardHeader>
            <CardContent className="p-0">
               <div className="overflow-x-auto no-scrollbar">
                  {isLoading ? (
                     <div className="py-40 flex flex-col items-center justify-center space-y-6">
                        <Loader2 className="h-12 w-12 animate-spin text-slate-200" />
                        <p className="text-sm font-bold text-slate-300 uppercase tracking-widest">Scanning Fleet Nodes...</p>
                     </div>
                  ) : (
                     <Table className="w-full text-left border-collapse">
                        <TableHeader>
                           <TableRow className="bg-slate-50/50 border-b border-slate-100 hover:bg-transparent">
                              <TableHead className="py-5 px-10 text-[11px] font-bold uppercase tracking-widest w-48 text-slate-400">Route ID</TableHead>
                              <TableHead className="py-5 px-8 text-[11px] font-bold uppercase tracking-widest text-slate-400">Monthly Fee</TableHead>
                              <TableHead className="py-5 px-8 text-[11px] font-bold uppercase tracking-widest text-slate-400">Fleet Asset (Bus)</TableHead>
                              <TableHead className="py-5 px-8 text-[11px] font-bold uppercase tracking-widest text-slate-400">Coverage Map</TableHead>
                              <TableHead className="py-5 px-10 text-right text-[11px] font-bold uppercase tracking-widest text-slate-400">Operation</TableHead>
                           </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-slate-50">
                           {routes.length === 0 && (
                              <TableRow className="hover:bg-transparent">
                                 <TableCell colSpan={5} className="py-20 text-center">
                                    <p className="text-sm font-bold text-slate-300 uppercase tracking-widest">No routes detected in the registry.</p>
                                 </TableCell>
                              </TableRow>
                           )}

                           {routes.map((r: any) => (
                              <TableRow key={r.id} className="hover:bg-slate-50/30 transition-all group border-l-4 border-l-transparent hover:border-l-indigo-500">
                                 <TableCell className="py-8 px-10">
                                    <div className="flex items-center gap-4">
                                       <div className="h-10 w-10 rounded-lgl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                          <MapPin size={18} />
                                       </div>
                                       <span className="text-sm font-bold text-slate-900 tracking-tight">{r.routeName}</span>
                                    </div>
                                 </TableCell>
                                 <TableCell className="py-8 px-8">
                                    <div className="flex flex-col">
                                       <span className="text-lg font-bold text-slate-900 tracking-tight">₹{parseFloat(r.monthlyFee).toLocaleString()}</span>
                                       <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Per Scholar / Month</span>
                                    </div>
                                 </TableCell>
                                 <TableCell className="py-8 px-8">
                                    <Badge className="h-7 px-3 rounded-lg bg-slate-50 border-slate-200 text-slate-600 font-bold text-[10px] uppercase tracking-widest">
                                       {r.busNumber || 'UNASSIGNED'}
                                    </Badge>
                                 </TableCell>
                                 <TableCell className="py-8 px-8 max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">
                                    <span className="text-xs font-semibold text-slate-500">
                                       {r.description || 'No stop details provided'}
                                    </span>
                                 </TableCell>
                                 <TableCell className="py-8 px-10 text-right">
                                    <div className="flex justify-end gap-2">
                                       <Button
                                          size="sm" onClick={() => {
                                             setEditingRoute(r);
                                             setIsDialogOpen(true);
                                          }}
                                          className="h-8 px-4 bg-slate-50 hover:bg-slate-900 text-slate-600 hover:text-white font-bold uppercase text-[9px] tracking-widest rounded-xl transition-all border border-slate-100 shadow-sm"
                                       >
                                          Edit
                                       </Button>
                                       <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => handleDelete(r)}
                                          className="h-8 w-8 p-0 rounded-xl text-slate-300 hover:text-red-500 transition-colors"
                                       >
                                          <Trash2 size={16} />
                                       </Button>
                                    </div>
                                 </TableCell>
                              </TableRow>
                           ))}
                        </TableBody>
                     </Table>
                  )}
               </div>
            </CardContent>
         </Card>

         {/* Premium Dialog Form */}
         <AddTransportRouteModal
            isOpen={isDialogOpen}
            onOpenChange={(open) => {
               setIsDialogOpen(open);
               if (!open) setEditingRoute(null);
            }}
            editingRoute={editingRoute}
            onSubmit={handleUpdate}
            isPending={updateMutation.isPending}
         />

         {/* Footer Branded */}
         <div className="bg-white p-10 rounded-lg border border-slate-100 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
               <div className="h-3 w-3 rounded-full bg-indigo-600 animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
               <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Logistics Monitoring Hub v2.0 Active</span>
            </div>
            <div className="flex items-center gap-8">
               <div className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck size={12} className="text-emerald-500" /> End-to-End Fleet Encryption
               </div>
            </div>
         </div>

         <ConfirmDialog
            isOpen={deleteConfirmOpen}
            onClose={() => {
               setDeleteConfirmOpen(false);
               setRouteToDelete(null);
            }}
            onConfirm={() => {
               if (routeToDelete) {
                  deleteMutation.mutate(routeToDelete.id.toString());
                  setDeleteConfirmOpen(false);
                  setRouteToDelete(null);
               }
            }}
            title="Decommission Route?"
            description={routeToDelete ? `Are you sure you want to permanently decommission route "${routeToDelete.routeName}"?` : "Are you sure you want to decommission this route?"}
            confirmText="Decommission"
            cancelText="Cancel"
            type="danger"
         />
      </div>
   );
}
