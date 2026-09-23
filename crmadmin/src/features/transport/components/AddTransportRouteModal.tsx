"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
} from "@/components/dialogbox/dialog";

interface AddTransportRouteModalProps {
   isOpen: boolean;
   onOpenChange: (open: boolean) => void;
   editingRoute: any | null;
   onSubmit: (formData: any) => void;
   isPending: boolean;
}

export default function AddTransportRouteModal({
   isOpen,
   onOpenChange,
   editingRoute,
   onSubmit,
   isPending,
}: AddTransportRouteModalProps) {
   const [formData, setFormData] = useState<any>({
      routeName: "",
      monthlyFee: "",
      busNumber: "",
      description: "",
   });

   // Initialize or reset form state when modal opens or editingRoute changes
   useEffect(() => {
      if (isOpen) {
         if (editingRoute) {
            setFormData(editingRoute);
         } else {
            setFormData({
               routeName: "",
               monthlyFee: "",
               busNumber: "",
               description: "",
            });
         }
      }
   }, [isOpen, editingRoute]);

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
   };

   return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
         <DialogContent className="sm:max-w-lg p-0 overflow-hidden rounded-[20px] border-none shadow-2xl bg-white">
            <DialogHeader className="bg-slate-950 text-white p-8">
               <DialogTitle className="text-sm font-bold uppercase tracking-widest text-indigo-400">
                  {editingRoute ? "Edit Route Node" : "New Route Node"}
               </DialogTitle>
               <p className="text-xs font-semibold text-slate-400 mt-2 leading-relaxed">
                  Configure academic fleet route identity and monthly subscription.
               </p>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Route Name</label>
                  <Input
                     required
                     placeholder="E.G. ROUTE 09 - SECTOR 62"
                     value={formData.routeName || ""}
                     onChange={(e) => setFormData({ ...formData, routeName: e.target.value })}
                     className="h-12 text-xs font-semibold border-slate-100 bg-slate-50/50 focus-visible:ring-indigo-50 rounded-xl uppercase"
                  />
               </div>

               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Monthly Fee (₹)</label>
                     <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-600 font-bold">₹</span>
                        <Input
                           type="number"
                           required
                           placeholder="0"
                           value={formData.monthlyFee || ""}
                           onChange={(e) => setFormData({ ...formData, monthlyFee: e.target.value })}
                           className="h-12 pl-8 text-xs font-semibold border-slate-100 bg-slate-50/50 focus-visible:ring-indigo-50 rounded-xl"
                        />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Fleet Bus No</label>
                     <Input
                        placeholder="E.G. BUS-12"
                        value={formData.busNumber || ""}
                        onChange={(e) => setFormData({ ...formData, busNumber: e.target.value })}
                        className="h-12 text-xs font-semibold border-slate-100 bg-slate-50/50 focus-visible:ring-indigo-50 rounded-xl"
                     />
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Coverage Stops / Description</label>
                  <textarea
                     placeholder="Specify route stops..."
                     value={formData.description || ""}
                     onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                     className="w-full h-24 bg-slate-50/50 border border-slate-100 p-4 rounded-xl font-medium text-xs text-slate-600 outline-none focus:ring-2 focus:ring-indigo-50/50 transition-all resize-none"
                  />
               </div>

               <div className="flex gap-4 pt-4">
                  <Button
                     type="submit"
                     disabled={isPending}
                     className="flex-1 bg-indigo-600 hover:bg-indigo-700 h-11 font-bold uppercase text-[10px] tracking-widest rounded-xl text-white"
                  >
                     {isPending ? <Loader2 className="animate-spin mr-3" /> : <Save className="mr-3 h-4 w-4" />}
                     {editingRoute ? "Save Changes" : "Create Route"}
                  </Button>
                  <Button
                     type="button"
                     variant="ghost"
                     onClick={() => onOpenChange(false)}
                     className="h-11 px-6 font-bold uppercase text-[10px] tracking-widest text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                  >
                     Abort
                  </Button>
               </div>
            </form>
         </DialogContent>
      </Dialog>
   );
}
