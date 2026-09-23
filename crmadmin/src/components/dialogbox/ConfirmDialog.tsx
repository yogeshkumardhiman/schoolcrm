import React from 'react';
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
import { AlertCircle } from "lucide-react";

interface ConfirmDialogProps {
   isOpen: boolean;
   onClose: () => void;
   onConfirm: () => void;
   title?: React.ReactNode;
   description?: React.ReactNode;
   confirmText?: string;
   cancelText?: string;
   type?: 'danger' | 'info' | 'warning';
}

export function ConfirmDialog({
   isOpen,
   onClose,
   onConfirm,
   title = "Are you sure?",
   description = "This action cannot be undone.",
   confirmText = "Confirm",
   cancelText = "Abort",
   type = "danger"
}: ConfirmDialogProps) {
   const iconColor = type === 'danger' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600';

   return (
      <AlertDialog open={isOpen} onOpenChange={onClose}>
         <AlertDialogContent className="max-w-sm rounded-[24px] border border-slate-100 shadow-2xl p-6 bg-white overflow-hidden">
            <AlertDialogHeader className="space-y-4">
               <div className={`h-12 w-12 ${iconColor} rounded-2xl flex items-center justify-center mx-auto shadow-inner`}>
                  <AlertCircle size={24} />
               </div>
               <AlertDialogTitle className="text-center font-black text-slate-900 uppercase text-xs tracking-[2px] leading-tight">
                  {title}
               </AlertDialogTitle>
               <AlertDialogDescription className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                  {description}
               </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex gap-3 mt-6">
               <AlertDialogCancel className="h-11 rounded-xl text-[10px] font-bold uppercase tracking-wider border border-slate-200 flex-1 hover:bg-slate-50 transition-all">
                  {cancelText}
               </AlertDialogCancel>
               <AlertDialogAction
                  onClick={onConfirm}
                  className={`h-11 rounded-xl text-[10px] font-black uppercase tracking-wider border-none flex-1 shadow-lg transition-all ${type === 'danger'
                     ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-100'
                     : 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-100'
                     }`}
               >
                  {confirmText}
               </AlertDialogAction>
            </AlertDialogFooter>
         </AlertDialogContent>
      </AlertDialog>
   );
}
