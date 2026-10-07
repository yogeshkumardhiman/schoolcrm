"use client";

import React, { useState, useEffect } from "react";
import client from "@/lib/client";
import {
  ShieldCheck,
  Shield,
  Plus,
  Trash2,
  Users,
  Search,
  Check,
  Copy,
  Lock,
  Eye,
  EyeOff,
  UserCheck,
  Power,
  RefreshCcw,
  Sparkles,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/dialogbox/dialog";
import { ConfirmDialog } from "@/components/dialogbox/ConfirmDialog";
import { useAuth } from "@/components/AbilityProvider";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

interface AdminUser {
  id: number;
  loginId: string;
  email: string;
  userType: string;
  roleId?: string;
  dynamicRole?: { name: string; description: string };
  isActive: boolean;
  createdAt: string;
}

export default function AdministratorsPage() {
  const { user } = useAuth();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Create Super Admin Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [adminForm, setAdminForm] = useState({
    email: "",
    loginId: "",
    password: ""
  });
  const [creating, setCreating] = useState(false);

  // Success Created Modal
  const [createdAdmin, setCreatedAdmin] = useState<{
    loginId: string;
    email: string;
  } | null>(null);

  const [forbidden, setForbidden] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<AdminUser | null>(null);

  // Fetch admin users
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setForbidden(false);
      const data = await client.get("/rbac/admins");
      setAdmins(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
      if (err?.message?.includes("Insufficient permissions") || err?.status === 403) {
        setForbidden(true);
      } else {
        toast.error(err?.message || "Failed to load super admin directory");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // Handle open create modal
  const handleOpenCreate = () => {
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    setAdminForm({
      email: "",
      loginId: `ADM${year}${rand}`,
      password: "admin" + Math.floor(100 + Math.random() * 900)
    });
    setIsCreateModalOpen(true);
  };

  // Submit create admin
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminForm.email.trim()) {
      toast.error("Please enter an official administrator email");
      return;
    }

    setCreating(true);
    try {
      const res: any = await client.post("/rbac/admins", {
        email: adminForm.email.trim().toLowerCase(),
        loginId: adminForm.loginId.trim().toUpperCase(),
        password: adminForm.password || "admin123"
      });

      toast.success("Super Administrator created successfully!");
      setIsCreateModalOpen(false);
      setCreatedAdmin({
        loginId: res?.loginId || adminForm.loginId.trim().toUpperCase(),
        email: adminForm.email.trim().toLowerCase()
      });
      fetchAdmins();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || err?.error || "Failed to create administrator");
    } finally {
      setCreating(false);
    }
  };

  // Toggle status
  const handleToggleStatus = async (admin: AdminUser) => {
    if (admin.email === "admin@school.com") {
      toast.error("Primary Root Super Admin status cannot be deactivated");
      return;
    }
    try {
      await client.put(`/rbac/admins/${admin.id}`, {
        isActive: !admin.isActive
      });
      toast.success(`Account status updated for ${admin.loginId}`);
      fetchAdmins();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update status");
    }
  };

  // Delete admin
  const handleConfirmDelete = async () => {
    if (!adminToDelete) return;
    try {
      await client.delete(`/rbac/admins/${adminToDelete.id}`);
      toast.success(`Administrator ${adminToDelete.loginId} removed`);
      setAdminToDelete(null);
      fetchAdmins();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete administrator");
    }
  };

  // Filtered admins
  const filteredAdmins = admins.filter(
    (a) =>
      a.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.loginId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.dynamicRole?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ProtectedRoute roles={["SUPER_ADMIN"]}>
      <div className="p-8 md:p-10 space-y-8 bg-[#F8FAFC] min-h-screen font-sans">
      {/* 🛡️ HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shadow-inner">
            <ShieldCheck size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase font-heading">
              Super Admin <span className="text-rose-600">Directory</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Institutional root users with unrestricted administrative authority.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleOpenCreate}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-11 px-6 rounded-xl shadow-lg shadow-slate-900/10 flex items-center gap-2 uppercase tracking-wider transition-all"
          >
            <Plus size={16} strokeWidth={2.5} /> Create Super Admin
          </Button>
        </div>
      </div>

      {/* 🔍 SEARCH BAR & STATS */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
            Total Root Administrators:
          </span>
          <Badge className="bg-rose-50 text-rose-700 border border-rose-200 font-mono font-bold text-xs py-0.5 px-3 rounded-full">
            {admins.length} Active Accounts
          </Badge>
        </div>

        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by Login ID or email..."
            className="pl-11 h-11 bg-white border-slate-200 rounded-xl text-xs font-semibold focus:border-rose-500 transition-all shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* 📋 ADMINISTRATORS TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden animate-in fade-in duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                <th className="py-4 px-6">Super Admin Identity</th>
                <th className="py-4 px-6">System Login ID</th>
                <th className="py-4 px-6">Clearance Role</th>
                <th className="py-4 px-6 text-center">Account Status</th>
                <th className="py-4 px-6">Created On</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6} className="p-6">
                        <div className="h-10 bg-slate-100 rounded-xl animate-pulse w-full" />
                      </td>
                    </tr>
                  ))
              ) : filteredAdmins.length > 0 ? (
                filteredAdmins.map((admin) => {
                  const isPrimaryRoot = admin.email === "admin@school.com";
                  return (
                    <tr key={admin.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center font-black text-xs text-rose-600 shrink-0">
                            SA
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-slate-900 text-sm">{admin.email}</p>
                              {isPrimaryRoot && (
                                <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-black uppercase px-2 py-0.5 rounded-md">
                                  Primary Root
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Full System Privilege</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-5 px-6">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-rose-600 bg-rose-50/60 px-2.5 py-1 rounded-lg border border-rose-100 select-all">
                            {admin.loginId}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(admin.loginId);
                              toast.success("Login ID copied");
                            }}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-all"
                            title="Copy Login ID"
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                      </td>

                      <td className="py-5 px-6">
                        <Badge className="bg-rose-50 text-rose-700 border border-rose-200 text-[9px] font-black uppercase tracking-wider py-1 px-3 rounded-full">
                          {admin.dynamicRole?.name || "SUPER_ADMIN"}
                        </Badge>
                      </td>

                      <td className="py-5 px-6 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(admin)}
                          disabled={isPrimaryRoot}
                          className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all",
                            admin.isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200",
                            isPrimaryRoot && "cursor-default opacity-80"
                          )}
                          title={isPrimaryRoot ? "Primary Root Super Admin cannot be disabled" : "Click to toggle account status"}
                        >
                          <span className={cn("h-1.5 w-1.5 rounded-full", admin.isActive ? "bg-emerald-500" : "bg-slate-400")} />
                          {admin.isActive ? "Active" : "Disabled"}
                        </button>
                      </td>

                      <td className="py-5 px-6 text-xs text-slate-500">
                        {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : "--"}
                      </td>

                      <td className="py-5 px-6 text-right">
                        {!isPrimaryRoot && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setAdminToDelete(admin)}
                            className="h-8 w-8 p-0 rounded-lg border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-400 transition-all"
                            title="Delete Admin Account"
                          >
                            <Trash2 size={13} />
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    <ShieldCheck size={36} className="mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-xs uppercase tracking-wider">No super admin users found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🛠️ MODAL: CREATE SUPER ADMIN */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-md rounded-3xl p-0 bg-white border border-slate-200 shadow-2xl overflow-hidden font-sans">
          <div className="bg-slate-900 p-6 text-white flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-rose-600 flex items-center justify-center text-white shadow-md">
              <ShieldCheck size={20} />
            </div>
            <div>
              <DialogTitle className="text-base font-black uppercase tracking-tight font-heading">
                Create Super Administrator
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400 font-medium mt-0.5">
                Generate root system credentials for administrative governance.
              </DialogDescription>
            </div>
          </div>

          <form onSubmit={handleCreateAdmin} className="p-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Official Email Address <span className="text-rose-500">*</span>
              </label>
              <Input
                type="email"
                placeholder="e.g. principal@school.com"
                value={adminForm.email}
                onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                className="h-11 border-slate-200 rounded-xl text-xs font-semibold"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                System Login ID (Username)
              </label>
              <Input
                value={adminForm.loginId}
                onChange={(e) => setAdminForm({ ...adminForm, loginId: e.target.value.toUpperCase() })}
                className="h-11 border-slate-200 rounded-xl text-xs font-mono font-bold uppercase tracking-widest bg-slate-50"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Initial Temporary Password
              </label>
              <Input
                value={adminForm.password}
                onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                className="h-11 border-slate-200 rounded-xl text-xs font-mono font-semibold"
                required
              />
              <p className="text-[10px] text-slate-400 font-medium">
                Password will be encrypted with bcrypt and emailed directly to the administrator.
              </p>
            </div>

            <DialogFooter className="flex gap-2 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
                className="h-11 rounded-xl text-xs font-bold uppercase tracking-wider flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={creating}
                className="h-11 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex-1 shadow-lg shadow-rose-600/20"
              >
                {creating ? "Creating..." : "Create Account"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 🔑 CREATED ADMIN SUCCESS MODAL */}
      {createdAdmin && (
        <Dialog open={!!createdAdmin} onOpenChange={(open) => !open && setCreatedAdmin(null)}>
          <DialogContent className="max-w-md rounded-3xl p-6 bg-white border border-slate-200 shadow-2xl font-sans text-center space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner border border-emerald-100">
              <Check size={28} strokeWidth={2.5} />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight font-heading">
                Super Admin Account Created!
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Root credentials generated and dispatched to the administrator's email.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left space-y-3">
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Login ID (Username)</span>
                <div className="flex items-center justify-between bg-white border border-rose-200 rounded-xl px-3.5 py-2 mt-1">
                  <span className="font-mono text-sm font-black text-rose-600 select-all">{createdAdmin.loginId}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(createdAdmin.loginId);
                      toast.success("Login ID copied");
                    }}
                    className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-800"
                  >
                    <Copy size={13} />
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Registered Email</span>
                <p className="text-xs font-bold text-slate-800 mt-0.5">{createdAdmin.email}</p>
              </div>

              <div className="p-3 bg-rose-50/70 border border-rose-100 rounded-xl text-[11px] font-semibold text-rose-900 leading-relaxed">
                🔒 Password encrypted with <strong>bcrypt</strong> and emailed to <strong>{createdAdmin.email}</strong>.
              </div>
            </div>

            <Button
              type="button"
              onClick={() => setCreatedAdmin(null)}
              className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider"
            >
              Done & Close
            </Button>
          </DialogContent>
        </Dialog>
      )}

      {/* ⚠️ CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={!!adminToDelete}
        onClose={() => setAdminToDelete(null)}
        onConfirm={handleConfirmDelete}
        title={`Delete Super Admin ${adminToDelete?.loginId}?`}
        description="This will permanently delete this administrator account and revoke all root access privileges."
        confirmText="Delete Admin"
        type="danger"
      />
    </div>
    </ProtectedRoute>
  );
}
