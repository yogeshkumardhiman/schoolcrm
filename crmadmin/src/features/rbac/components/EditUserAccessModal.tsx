"use client";

import React from "react";
import {
   Shield,
   ShieldCheck,
   ChevronRight,
   Key,
   Monitor,
   Check,
   Book,
   CreditCard,
   Zap,
   Users,
   School,
   UserCheck,
   FileText,
   Bell,
   GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogHeader,
   DialogTitle,
   DialogFooter,
} from "@/components/dialogbox/dialog";

const ROLES = [
   { id: 'TEACHER', label: 'Teacher', icon: Book, color: 'bg-purple-50 text-purple-700 border-purple-100', desc: 'Can manage classes, attendance, and homework.' },
   { id: 'ACCOUNTANT', label: 'Accountant', icon: CreditCard, color: 'bg-emerald-50 text-emerald-700 border-emerald-100', desc: 'Full access to fees and financial records.' },
   { id: 'PRINCIPAL', label: 'Principal', icon: Shield, color: 'bg-blue-50 text-blue-700 border-blue-100', desc: 'Institutional oversight and academic management.' },
   { id: 'VICE_PRINCIPAL', label: 'Vice Principal', icon: Shield, color: 'bg-indigo-50 text-indigo-700 border-indigo-100', desc: 'Assistant oversight and academic support.' },
   { id: 'SUPER_ADMIN', label: 'Admin', icon: Zap, color: 'bg-red-50 text-red-700 border-red-100', desc: 'Full system control and access management.' },
];

const PERMISSION_KEYS = [
   { id: 'CAN_VIEW_CLASSES', label: 'Manage Classes', icon: School },
   { id: 'CAN_VIEW_STUDENTS', label: 'Manage Students', icon: Users },
   { id: 'CAN_MANAGE_ATTENDANCE', label: 'Manage Attendance', icon: UserCheck },
   { id: 'CAN_VIEW_FEES', label: 'Manage Fees', icon: CreditCard },
   { id: 'CAN_MANAGE_MARKS', label: 'Manage Marks', icon: FileText },
   { id: 'CAN_MANAGE_HOMEWORK', label: 'Manage Homework', icon: Book },
   { id: 'CAN_MANAGE_NOTICES', label: 'Manage Notices', icon: Bell },
   { id: 'CAN_MANAGE_STAFF', label: 'Manage Staff', icon: GraduationCap },
   { id: 'CAN_MANAGE_SUBSTITUTION', label: 'Manage Substitutions', icon: Zap },
];

interface EditUserAccessModalProps {
   isOpen: boolean;
   onOpenChange: (open: boolean) => void;
   selectedUser: any;
   activeTab: 'ROLE' | 'PERMISSIONS';
   setActiveTab: (tab: 'ROLE' | 'PERMISSIONS') => void;
   updating: boolean;
   userPerms: string[];
   handleUpdateRole: (role: string) => Promise<void> | void;
   handleTogglePermission: (permId: string) => Promise<void> | void;
}

export default function EditUserAccessModal({
   isOpen,
   onOpenChange,
   selectedUser,
   activeTab,
   setActiveTab,
   updating,
   userPerms,
   handleUpdateRole,
   handleTogglePermission,
}: EditUserAccessModalProps) {
   if (!selectedUser) return null;

   return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
         <DialogContent className="sm:max-w-[500px] rounded-[30px] border-slate-100 p-0 overflow-hidden bg-white shadow-2xl">
            <div className="bg-slate-900 p-6 text-white relative">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Shield size={80} />
               </div>
               <DialogHeader className="relative z-10 space-y-4 text-left">
                  <div className="flex items-center gap-3">
                     <div className="h-10 w-10 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-900/20">
                        <ShieldCheck size={20} />
                     </div>
                     <div className="text-left">
                        <DialogTitle className="text-lg font-black tracking-tighter uppercase  leading-none">Institutional Security</DialogTitle>
                        <DialogDescription className="text-[8px] font-black uppercase tracking-[3px] mt-1 text-slate-400">
                           Clearance: {selectedUser.name}
                        </DialogDescription>
                     </div>
                  </div>
               </DialogHeader>
            </div>

            <div className="p-6">
               <div className="flex bg-slate-50 p-1 rounded-lgl border border-slate-100">
                  <button
                     onClick={() => setActiveTab('ROLE')}
                     className={cn("flex-1 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2", activeTab === 'ROLE' ? "bg-white text-slate-900 shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600")}
                  >
                     <Monitor size={12} /> Role
                  </button>
                  <button
                     onClick={() => setActiveTab('PERMISSIONS')}
                     className={cn("flex-1 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2", activeTab === 'PERMISSIONS' ? "bg-white text-slate-900 shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600")}
                  >
                     <Key size={12} /> Authorities
                  </button>
               </div>

               <div className="mt-6 max-h-[380px] overflow-y-auto no-scrollbar pr-1">
                  {activeTab === 'ROLE' ? (
                     <div className="space-y-2.5">
                        {ROLES.map((role) => (
                           <button
                              key={role.id}
                              onClick={() => handleUpdateRole(role.id)}
                              disabled={updating}
                              className={cn(
                                 "p-3.5 rounded-lgl border text-left flex items-center gap-3.5 transition-all w-full group/role relative overflow-hidden",
                                 selectedUser.role === role.id
                                    ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-200"
                                    : "bg-white border-slate-100 hover:border-blue-200 hover:bg-blue-50/30"
                              )}
                           >
                              {selectedUser.role === role.id && (
                                 <div className="absolute top-0 right-0 p-1.5">
                                    <div className="bg-emerald-500 rounded-bl-lg p-0.5 shadow-md">
                                       <Check size={10} className="text-white" />
                                    </div>
                                 </div>
                              )}
                              <div className={cn(
                                 "h-10 w-10 rounded-lg flex items-center justify-center shrink-0 shadow-sm transition-all",
                                 selectedUser.role === role.id
                                    ? "bg-white/10 text-white"
                                    : "bg-slate-50 text-slate-400 group-hover/role:bg-blue-100 group-hover/role:text-blue-600"
                              )}>
                                 <role.icon size={18} strokeWidth={selectedUser.role === role.id ? 2.5 : 1.5} />
                              </div>
                              <div className="flex-1">
                                 <div className="flex items-center gap-2">
                                    <p className="font-black text-xs uppercase tracking-tight leading-none">{role.label}</p>
                                    {selectedUser.role === role.id && (
                                       <Badge className="bg-emerald-500/20 text-emerald-400 border-none text-[7px] font-black uppercase px-1.5 h-3.5">Active</Badge>
                                    )}
                                 </div>
                                 <p className={cn(
                                    "text-[9px] font-medium leading-tight mt-1",
                                    selectedUser.role === role.id ? "text-slate-400" : "text-slate-400"
                                 )}>{role.desc}</p>
                              </div>
                              <ChevronRight size={14} className={cn(
                                 "opacity-0 group-hover/role:opacity-100 transition-all",
                                 selectedUser.role === role.id ? "text-white/20" : "text-slate-200"
                              )} />
                           </button>
                        ))}
                     </div>
                  ) : (
                     <div className="grid grid-cols-1 gap-2.5 pb-4">
                        {PERMISSION_KEYS.map((perm) => (
                           <button
                              key={perm.id}
                              onClick={() => handleTogglePermission(perm.id)}
                              disabled={updating}
                              className={cn(
                                 "p-3.5 rounded-lgl border flex items-center gap-3.5 transition-all group/perm relative overflow-hidden",
                                 userPerms.includes(perm.id)
                                    ? "bg-emerald-50/50 border-emerald-100 shadow-sm"
                                    : "bg-white border-slate-100 hover:bg-slate-50"
                              )}
                           >
                              <div className={cn(
                                 "h-10 w-10 rounded-lg flex items-center justify-center shrink-0 shadow-sm transition-all",
                                 userPerms.includes(perm.id) ? "bg-emerald-600 text-white shadow-emerald-200" : "bg-slate-100 text-slate-400 group-hover/perm:bg-slate-200"
                              )}>
                                 <perm.icon size={16} />
                              </div>
                              <div className="flex-1 text-left">
                                 <p className="font-black text-xs uppercase tracking-tight leading-none">{perm.label}</p>
                                 <p className="text-[7px] font-black uppercase tracking-[2px] opacity-40 mt-1  text-slate-500">ID: {perm.id}</p>
                              </div>
                              <div className={cn(
                                 "h-5 w-9 rounded-full relative transition-all duration-300 border-2",
                                 userPerms.includes(perm.id) ? "bg-emerald-600 border-emerald-600" : "bg-slate-100 border-slate-200"
                              )}>
                                 <div className={cn(
                                    "absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all shadow-md",
                                    userPerms.includes(perm.id) ? "left-5" : "left-0.5"
                                 )} />
                              </div>
                           </button>
                        ))}
                     </div>
                  )}
               </div>

               <DialogFooter className="mt-6 border-t border-slate-100 pt-6">
                  <Button
                     variant="ghost"
                     onClick={() => onOpenChange(false)}
                     className="rounded-lgl font-black uppercase tracking-[2px] text-[9px] h-11 w-full bg-slate-50 hover:bg-slate-900 hover:text-white transition-all"
                  >
                     Close Protocol
                  </Button>
               </DialogFooter>
            </div>
         </DialogContent>
      </Dialog>
   );
}
