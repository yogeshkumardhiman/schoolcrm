"use client";
import client from "@/lib/client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Eye,
  Edit3,
  Trash2,
  ChevronDown,
  Loader2,
  RefreshCcw,
  Calendar,
  Filter,
  FileDown,
  UserCheck,
  KeyRound
} from "lucide-react";
import { cn } from "@/lib/utils";

import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "@bprogress/next/app";
import { useAuth } from "@/components/AbilityProvider";
import { APP_CONFIG } from "@/constants/config";
import { ConfirmDialog } from "@/components/dialogbox/ConfirmDialog";
import { ResetStaffPasswordDialog } from "./components/ResetStaffPasswordDialog";

import { Skeleton, TableRowSkeleton } from "@/components/ui/skeleton";

const rolesList = ['MANAGEMENT', 'TEACHER', 'DRIVER', 'PEON'];

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function StaffPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("All Roles");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<{ id: string; name: string } | null>(null);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [staffToReset, setStaffToReset] = useState<any | null>(null);

  // Query: Staff Registry
  const { data: staff = [], isLoading: loading } = useQuery<any[]>({
    queryKey: ['staff-registry'],
    enabled: !!user && !authLoading,
    queryFn: async () => {
      const data = await client.get("/staff");
      return Array.isArray(data) ? data : (data.staff || []);
    }
  });

  // Mutation: Delete Record
  const deleteMutation = useMutation({
    mutationFn: (id: string) => client.delete(`/staff/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-registry'] });
      toast.success("Faculty member deleted successfully");
    },
    onError: (err: any) => {
      console.error("Staff delete error:", err);
      const msg = err?.message || err?.error || err?.detail || "Delete failed";
      toast.error(msg);
    }
  });

  const handleDelete = (id: any, name: string) => {
    if (!id || id === 'undefined') return;
    setStaffToDelete({ id: String(id), name: name || 'Faculty Member' });
    setDeleteConfirmOpen(true);
  };

  const filteredStaff = staff.filter(member => {
    const matchesSearch =
      member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.phone?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = selectedRole === "All Roles" ||
      (selectedRole === "TEACHER" && ['TEACHER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'ACCOUNTANT'].includes(member.role?.toString().toUpperCase().trim())) ||
      (selectedRole === "STAFF" && ['STAFF', 'DRIVER', 'PEON', 'GUARD', 'CLERK'].includes(member.role?.toString().toUpperCase().trim())) ||
      member.role?.toString().toLowerCase().trim() === selectedRole.toLowerCase().trim();

    return matchesSearch && matchesRole;
  });

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 bg-slate-50/50 min-h-screen font-sans">
      <div className="flex items-center justify-between space-y-2 animate-in fade-in duration-500">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-slate-900 flex items-center gap-3 uppercase  font-heading">
            Timetable & <span className="text-indigo-600">Registry</span>
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[4px] mt-1">Manage faculty period matrices and scholastic submission.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => router.push('/staff/create')} className="bg-slate-900 hover:bg-slate-800 text-white h-11 px-8 rounded-lgxl font-bold uppercase text-[10px] tracking-widest shadow-massive transition-all active:scale-95">
            <Plus className="mr-2 h-4 w-4" /> Add Staff Member
          </Button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-lgxl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden animate-in fade-in duration-700">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-white gap-4">
          <div className="flex-1 flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
              <Input
                placeholder="Search staff by identity..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-11 border-slate-100 bg-slate-50/50 rounded-xl font-bold text-xs focus:bg-white transition-all shadow-none"
              />
            </div>
            <div className="relative">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="h-11 px-4 pr-10 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest appearance-none outline-none focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer shadow-sm"
              >
                <option value="All Roles">All Personnel</option>
                <option value="MANAGEMENT">Management</option>
                <option value="TEACHER">Academic Faculty</option>
                <option value="STAFF">School Staff</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" className="h-11 px-6 gap-2 border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"><Filter size={14} /> Filters</Button>
            <Button variant="outline" className="h-11 px-6 gap-2 border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"><FileDown size={14} /> Export</Button>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <TableRowSkeleton columns={5} rows={6} />
          ) : (
            <table className="w-full text-sm min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-400 font-black text-[10px] uppercase tracking-[4px]">
                  <th className="text-left py-6 px-6 text-black">Staff Member</th>
                  <th className="text-left py-6 px-6 text-black">Designation</th>
                  <th className="text-center py-6 px-6 text-black">Role</th>
                  <th className="text-left py-6 px-6 text-black">Assignment</th>
                  <th className="text-right py-6 px-8 text-black">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStaff.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((member, i) => {
                  const staffId = member._id || member.id || i;
                  return (
                    <tr key={staffId} className="hover:bg-slate-50/50 transition-colors duration-200 group">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-sm transition-transform group-hover:scale-105">
                            <img
                              src={member.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${staffId}`}
                              className="h-full w-full object-cover"
                              alt=""
                            />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-tight">{member.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">{member.email || `staff@${APP_CONFIG.institution.name.toLowerCase()}.com`}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-600 font-medium capitalize text-xs">{member.designation || '--'}</td>
                      <td className="py-4 px-6 text-center">
                        <Badge variant="outline" className={cn(
                          "font-bold text-[10px] uppercase tracking-wider py-1 px-3.5 rounded-xl border",
                          member.role === 'TEACHER' ? "bg-purple-50 text-purple-600 border-purple-100" :
                            member.role === 'ACCOUNTANT' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                              member.role === 'PRINCIPAL' ? "bg-blue-50 text-blue-600 border-blue-100" :
                                member.role === 'VICE_PRINCIPAL' ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                                  member.role === 'SUPER_ADMIN' ? "bg-red-50 text-red-600 border-red-100" :
                                    "bg-slate-50 text-slate-500 border-slate-200"
                        )}>
                          {member.role || 'RESOURCE'}
                        </Badge>
                      </td>
                      <td className="py-4 px-6">
                        {member.role === 'TEACHER' ? (
                          <div className="flex flex-col gap-1">
                            {member.class && member.class.trim() !== '' ? (
                              <span className="text-indigo-600 font-bold text-[11px] uppercase tracking-wider bg-indigo-50/80 px-2 py-0.5 rounded-md border border-indigo-100/80 w-fit">
                                Class {member.class}-{member.section || 'A'}
                              </span>
                            ) : (
                              <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100 w-fit">
                                Unassigned
                              </span>
                            )}
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "text-[9px] font-black px-1.5 py-0.5 rounded-lg uppercase tracking-tighter",
                                member.timetableCount > 0 ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-50 text-slate-400 border border-slate-100"
                              )}>
                                {member.timetableCount > 0 ? `${member.timetableCount} Periods Assigned` : "No Matrix"}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-300 font-bold text-[10px]">--</span>
                        )}
                      </td>
                      <td className="py-4 px-8 text-right">
                        <div className="flex justify-end items-center gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setStaffToReset(member);
                              setResetPasswordOpen(true);
                            }}
                            className="h-9 w-9 p-0 text-amber-500 hover:text-amber-700 hover:border-amber-200 border-slate-100 rounded-xl hover:bg-amber-50/50 transition-all cursor-pointer"
                            title="Reset Password & Mail Credentials"
                          >
                            <KeyRound size={14} />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => router.push(`/staff/timetable/${staffId}`)} className="h-9 w-9 p-0 text-emerald-500 hover:text-emerald-700 border-slate-100 rounded-xl hover:bg-slate-50 transition-all cursor-pointer" title="Timetable"><Calendar size={14} /></Button>
                          <Button variant="outline" size="sm" onClick={() => router.push(`/staff/view/${staffId}`)} className="h-9 w-9 p-0 text-slate-400 hover:text-blue-600 border-slate-100 rounded-xl hover:bg-slate-50 transition-all cursor-pointer" title="View Profile"><Eye size={14} /></Button>
                          <Button variant="outline" size="sm" onClick={() => router.push(`/staff/edit/${staffId}`)} className="h-9 w-9 p-0 text-slate-400 hover:text-slate-600 border-slate-100 rounded-xl hover:bg-slate-50 transition-all cursor-pointer" title="Edit Profile"><Edit3 size={14} /></Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(staffId, member.name)} className="h-9 w-9 p-0 text-slate-400 hover:text-red-600 border-slate-100 rounded-xl hover:bg-slate-50 transition-all cursor-pointer" title="Delete Faculty"><Trash2 size={14} /></Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Bar */}
        {filteredStaff.length > itemsPerPage && (
          <div className="p-4 px-6 border-t border-slate-100 bg-slate-50/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs font-bold text-slate-500">
              Showing <span className="font-mono font-black text-slate-900">{(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredStaff.length)}</span> of <span className="font-mono font-black text-slate-900">{filteredStaff.length}</span> staff members
            </span>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="h-8 px-3 rounded-lg text-xs font-bold uppercase cursor-pointer"
              >
                Prev
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.ceil(filteredStaff.length / itemsPerPage) }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(idx + 1)}
                    className={cn(
                      "h-8 w-8 rounded-lg text-xs font-black transition-all cursor-pointer",
                      currentPage === idx + 1
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                    )}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= Math.ceil(filteredStaff.length / itemsPerPage)}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="h-8 px-3 rounded-lg text-xs font-bold uppercase cursor-pointer"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setStaffToDelete(null);
        }}
        onConfirm={() => {
          if (staffToDelete) {
            deleteMutation.mutate(staffToDelete.id);
            setDeleteConfirmOpen(false);
            setStaffToDelete(null);
          }
        }}
        title="Delete Staff Record?"
        description={staffToDelete ? `This will permanently remove ${staffToDelete.name} and retract all class period assignments.` : "This will permanently remove this staff member and retract all class period assignments."}
        type="danger"
      />

      <ResetStaffPasswordDialog
        isOpen={resetPasswordOpen}
        onClose={() => {
          setResetPasswordOpen(false);
          setStaffToReset(null);
        }}
        staff={staffToReset}
      />
    </div>
  );
}
