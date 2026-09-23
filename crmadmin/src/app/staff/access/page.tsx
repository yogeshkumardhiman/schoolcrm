"use client";

import React, { useState, useEffect } from "react";
import client from "@/lib/client";
import {
  ShieldCheck,
  Shield,
  Key,
  Plus,
  Edit3,
  Trash2,
  Users,
  Search,
  Check,
  X,
  Lock,
  Sparkles,
  Layers,
  ChevronRight,
  Filter,
  CheckSquare,
  Square,
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

interface PermissionItem {
  id: string;
  code: string;
  name: string;
  module: string;
  description: string;
}

interface RoleItem {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  permissions: PermissionItem[];
  createdAt?: string;
}

export default function AccessControlPage() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isSuperAdmin = mounted && (user?.role === "SUPER_ADMIN" || user?.userType === "ADMIN");

  // Data states
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [allPermissions, setAllPermissions] = useState<PermissionItem[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ROLES" | "STAFF">("ROLES");
  const [searchQuery, setSearchQuery] = useState("");

  // Role Create / Edit Modal State
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null);
  const [roleForm, setRoleForm] = useState({
    name: "",
    description: "",
    selectedPermissions: [] as string[]
  });
  const [savingRole, setSavingRole] = useState(false);

  // Staff Role Assignment Modal State
  const [selectedStaff, setSelectedStaff] = useState<any | null>(null);
  const [assignedRoleId, setAssignedRoleId] = useState("");
  const [savingStaffRole, setSavingStaffRole] = useState(false);

  // Delete Confirmation State
  const [roleToDelete, setRoleToDelete] = useState<RoleItem | null>(null);

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [rolesRes, permsRes, staffRes] = await Promise.all([
        client.get("/rbac/roles").catch(() => []),
        client.get("/rbac/permissions").catch(() => []),
        client.get("/staff").catch(() => [])
      ]);

      setRoles(Array.isArray(rolesRes) ? rolesRes : []);
      setAllPermissions(Array.isArray(permsRes) ? permsRes : []);
      setStaffList(Array.isArray(staffRes) ? staffRes : (staffRes?.staff || []));
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load RBAC data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Group permissions by module
  const permissionModules = React.useMemo(() => {
    const map: Record<string, PermissionItem[]> = {};
    allPermissions.forEach((p) => {
      const mod = (p.module || "General").toUpperCase();
      if (!map[mod]) map[mod] = [];
      map[mod].push(p);
    });
    return map;
  }, [allPermissions]);

  // Open Create Role Modal
  const handleOpenCreateRole = () => {
    setEditingRole(null);
    setRoleForm({
      name: "",
      description: "",
      selectedPermissions: []
    });
    setIsRoleModalOpen(true);
  };

  // Open Edit Role Modal
  const handleOpenEditRole = (role: RoleItem) => {
    setEditingRole(role);
    setRoleForm({
      name: role.name,
      description: role.description || "",
      selectedPermissions: role.permissions ? role.permissions.map((p) => p.code) : []
    });
    setIsRoleModalOpen(true);
  };

  // Toggle permission in role modal
  const togglePermission = (code: string) => {
    setRoleForm((prev) => {
      const exists = prev.selectedPermissions.includes(code);
      return {
        ...prev,
        selectedPermissions: exists
          ? prev.selectedPermissions.filter((c) => c !== code)
          : [...prev.selectedPermissions, code]
      };
    });
  };

  // Toggle all permissions for a module
  const toggleModulePermissions = (moduleName: string) => {
    const permsInMod = permissionModules[moduleName] || [];
    const modCodes = permsInMod.map((p) => p.code);
    const allSelected = modCodes.every((c) => roleForm.selectedPermissions.includes(c));

    setRoleForm((prev) => {
      let nextPerms: string[];
      if (allSelected) {
        nextPerms = prev.selectedPermissions.filter((c) => !modCodes.includes(c));
      } else {
        const set = new Set([...prev.selectedPermissions, ...modCodes]);
        nextPerms = Array.from(set);
      }
      return { ...prev, selectedPermissions: nextPerms };
    });
  };

  // Save Role (Create or Update)
  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleForm.name.trim()) {
      toast.error("Please enter a role name");
      return;
    }

    setSavingRole(true);
    try {
      if (editingRole) {
        await client.put(`/rbac/roles/${editingRole.id}`, {
          name: roleForm.name.toUpperCase().trim(),
          description: roleForm.description.trim(),
          permissions: roleForm.selectedPermissions
        });
        toast.success(`Role ${roleForm.name} updated successfully!`);
      } else {
        await client.post("/rbac/roles", {
          name: roleForm.name.toUpperCase().trim(),
          description: roleForm.description.trim(),
          permissions: roleForm.selectedPermissions
        });
        toast.success(`Role ${roleForm.name} created successfully!`);
      }
      setIsRoleModalOpen(false);
      fetchData();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || err?.error || "Failed to save role");
    } finally {
      setSavingRole(false);
    }
  };

  // Delete Custom Role
  const handleConfirmDeleteRole = async () => {
    if (!roleToDelete) return;
    try {
      await client.delete(`/rbac/roles/${roleToDelete.id}`);
      toast.success(`Role ${roleToDelete.name} removed`);
      setRoleToDelete(null);
      fetchData();
    } catch (err: any) {
      toast.error(err?.message || err?.error || "Failed to delete role");
    }
  };

  // Save Staff Role Assignment
  const handleSaveStaffRole = async () => {
    if (!selectedStaff) return;
    setSavingStaffRole(true);
    try {
      const chosenRole = roles.find((r) => r.id === assignedRoleId || r.name === assignedRoleId);
      await client.put(`/staff/${selectedStaff.id}`, {
        role: chosenRole ? chosenRole.name : assignedRoleId,
        roleId: chosenRole?.id || undefined
      });
      toast.success(`Role updated for ${selectedStaff.name}`);
      setSelectedStaff(null);
      fetchData();
    } catch (err: any) {
      toast.error(err?.message || err?.error || "Failed to update staff role");
    } finally {
      setSavingStaffRole(false);
    }
  };

  // Hierarchy Priority Order for Roles
  const ROLE_HIERARCHY: Record<string, number> = {
    SUPER_ADMIN: 1,
    ADMIN: 2,
    PRINCIPAL: 3,
    VICE_PRINCIPAL: 4,
    ACCOUNTANT: 5,
    CLASS_TEACHER: 6,
    TEACHER: 7,
  };

  // Filtered & Hierarchy Sorted Roles
  const filteredRoles = roles
    .filter((r) => r.name !== "CLERK" && r.name !== "ACCOUNTENT")
    .filter(
      (r) =>
        r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const orderA = ROLE_HIERARCHY[a.name] ?? 99;
      const orderB = ROLE_HIERARCHY[b.name] ?? 99;
      if (orderA !== orderB) return orderA - orderB;
      return a.name.localeCompare(b.name);
    });

  // Filtered Staff
  const filteredStaff = staffList.filter(
    (s) =>
      s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.loginId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 md:p-10 space-y-8 bg-[#F8FAFC] min-h-screen font-sans">
      {/* 🛡️ TOP HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase font-heading">
                Role & Access <span className="text-indigo-600">Governance</span>
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Create institutional roles, customize module permissions, and manage staff security clearance.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isSuperAdmin && (
            <Button
              onClick={handleOpenCreateRole}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-11 px-6 rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-2 uppercase tracking-wider transition-all"
            >
              <Plus size={16} strokeWidth={2.5} /> Create New Role
            </Button>
          )}
        </div>
      </div>

      {/* 📊 SUMMARY TILES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Roles</span>
            <p className="text-2xl font-black text-slate-900 font-heading">{roles.length}</p>
            <p className="text-[11px] text-indigo-600 font-semibold">System & Custom Configured</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Layers size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Authorities</span>
            <p className="text-2xl font-black text-slate-900 font-heading">{allPermissions.length}</p>
            <p className="text-[11px] text-emerald-600 font-semibold">Granular Permission Nodes</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Key size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Staff Directory</span>
            <p className="text-2xl font-black text-slate-900 font-heading">{staffList.length}</p>
            <p className="text-[11px] text-blue-600 font-semibold">Assigned Personnel Members</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users size={24} />
          </div>
        </div>
      </div>

      {/* 🧭 TABS & SEARCH BAR */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab("ROLES")}
            className={cn(
              "px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2",
              activeTab === "ROLES"
                ? "bg-slate-900 text-white shadow-md"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            )}
          >
            <Shield size={14} /> Institutional Roles ({roles.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("STAFF")}
            className={cn(
              "px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2",
              activeTab === "STAFF"
                ? "bg-slate-900 text-white shadow-md"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            )}
          >
            <Users size={14} /> Staff Assignments ({staffList.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder={activeTab === "ROLES" ? "Search roles..." : "Search staff by name, email, login ID..."}
            className="pl-11 h-11 bg-white border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-500 transition-all shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* 📋 TAB 1: ROLES TABLE */}
      {activeTab === "ROLES" && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden animate-in fade-in duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Role Name & Type</th>
                  <th className="py-4 px-6">Description</th>
                  <th className="py-4 px-6 text-center">Permissions Granted</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {loading ? (
                  Array(4)
                    .fill(0)
                    .map((_, i) => (
                      <tr key={i}>
                        <td colSpan={4} className="p-6">
                          <div className="h-10 bg-slate-100 rounded-xl animate-pulse w-full" />
                        </td>
                      </tr>
                    ))
                ) : filteredRoles.length > 0 ? (
                  filteredRoles.map((role) => {
                    const permCount = role.permissions ? role.permissions.length : 0;
                    return (
                      <tr key={role.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-5 px-6">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "h-10 w-10 rounded-xl flex items-center justify-center font-black text-xs uppercase shadow-sm border",
                                role.name === "SUPER_ADMIN"
                                  ? "bg-rose-50 text-rose-600 border-rose-100"
                                  : role.name === "PRINCIPAL"
                                  ? "bg-blue-50 text-blue-600 border-blue-100"
                                  : role.name === "ACCOUNTANT"
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                  : role.name === "TEACHER"
                                  ? "bg-purple-50 text-purple-600 border-purple-100"
                                  : "bg-indigo-50 text-indigo-600 border-indigo-100"
                              )}
                            >
                              {role.name.slice(0, 2)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-sm tracking-tight">{role.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                {role.isSystem ? (
                                  <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100 border border-slate-200 text-[9px] font-black uppercase tracking-wider py-0 px-2 rounded-md">
                                    System Role
                                  </Badge>
                                ) : (
                                  <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-50 border border-indigo-200 text-[9px] font-black uppercase tracking-wider py-0 px-2 rounded-md">
                                    Custom Role
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-5 px-6 max-w-xs">
                          <p className="text-xs text-slate-600 line-clamp-2">
                            {role.description || "Custom role with specific permissions assigned."}
                          </p>
                        </td>

                        <td className="py-5 px-6 text-center">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border",
                              permCount > 15
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : permCount > 5
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-slate-100 text-slate-700 border-slate-200"
                            )}
                          >
                            <Key size={12} /> {permCount} {permCount === 1 ? "Permission" : "Permissions"}
                          </span>
                        </td>

                        <td className="py-5 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {role.name !== "SUPER_ADMIN" ? (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenEditRole(role)}
                                  className="h-9 px-3.5 rounded-xl border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 font-bold text-xs flex items-center gap-1.5 transition-all"
                                >
                                  <Edit3 size={13} /> Edit
                                </Button>

                                {isSuperAdmin && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setRoleToDelete(role)}
                                    className="h-9 w-9 p-0 rounded-xl border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-400 transition-all"
                                    title="Delete Role"
                                  >
                                    <Trash2 size={13} />
                                  </Button>
                                )}
                              </>
                            ) : (
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                                Permanent Root
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="py-16 text-center text-slate-400">
                      <Shield size={36} className="mx-auto text-slate-300 mb-2" />
                      <p className="font-bold text-xs uppercase tracking-wider">No roles match your search</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 👥 TAB 2: STAFF ASSIGNMENTS TABLE */}
      {activeTab === "STAFF" && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden animate-in fade-in duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Faculty Member</th>
                  <th className="py-4 px-6">Login ID</th>
                  <th className="py-4 px-6">Designation</th>
                  <th className="py-4 px-6">Assigned Role</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {loading ? (
                  Array(4)
                    .fill(0)
                    .map((_, i) => (
                      <tr key={i}>
                        <td colSpan={5} className="p-6">
                          <div className="h-10 bg-slate-100 rounded-xl animate-pulse w-full" />
                        </td>
                      </tr>
                    ))
                ) : filteredStaff.length > 0 ? (
                  filteredStaff.map((staff) => (
                    <tr key={staff.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-600 shrink-0">
                            {staff.name?.slice(0, 2)?.toUpperCase() || "ST"}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-xs">{staff.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{staff.email || "No email"}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                          {staff.loginId || "--"}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-xs text-slate-600">{staff.designation || "--"}</td>

                      <td className="py-4 px-6">
                        <Badge
                          className={cn(
                            "rounded-full font-black text-[9px] uppercase tracking-wider px-3 py-1 border",
                            staff.role === "SUPER_ADMIN"
                              ? "bg-rose-50 text-rose-600 border-rose-100"
                              : staff.role === "PRINCIPAL"
                              ? "bg-blue-50 text-blue-600 border-blue-100"
                              : staff.role === "ACCOUNTANT"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                              : staff.role === "TEACHER"
                              ? "bg-purple-50 text-purple-600 border-purple-100"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          )}
                        >
                          {staff.role || "TEACHER"}
                        </Badge>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!isSuperAdmin}
                          onClick={() => {
                            setSelectedStaff(staff);
                            setAssignedRoleId(staff.roleId ? String(staff.roleId) : staff.role || "TEACHER");
                          }}
                          className="h-8 px-3 rounded-lg border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 font-bold text-[11px] gap-1"
                        >
                          <Shield size={12} /> Assign Role
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-slate-400">
                      <Users size={36} className="mx-auto text-slate-300 mb-2" />
                      <p className="font-bold text-xs uppercase tracking-wider">No staff records match search</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 🛠️ MODAL: CREATE / EDIT ROLE */}
      <Dialog open={isRoleModalOpen} onOpenChange={setIsRoleModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden font-sans">
          <div className="bg-slate-900 p-6 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
                <ShieldCheck size={20} />
              </div>
              <div>
                <DialogTitle className="text-base font-black uppercase tracking-tight font-heading">
                  {editingRole ? `Configure Role: ${editingRole.name}` : "Create New Institutional Role"}
                </DialogTitle>
                <DialogDescription className="text-[11px] text-slate-400 font-medium mt-0.5">
                  Set role identity and check allowed module authorities.
                </DialogDescription>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveRole} className="flex-1 flex flex-col overflow-hidden">
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Role Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Role Code / Name <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g. EXAM_COORDINATOR"
                    value={roleForm.name}
                    onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                    disabled={editingRole?.isSystem}
                    className="h-11 border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Role Description
                  </label>
                  <Input
                    placeholder="e.g. Manages examination schedules and grade sheets"
                    value={roleForm.description}
                    onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                    className="h-11 border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              {/* Permissions Selector Grouped by Module */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <Key size={16} className="text-indigo-600" />
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider font-heading">
                      Module Permissions
                    </h4>
                  </div>
                  <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                    {roleForm.selectedPermissions.length} selected
                  </span>
                </div>

                <div className="space-y-4">
                  {Object.entries(permissionModules).map(([modName, perms]) => {
                    const allSelected = perms.every((p) => roleForm.selectedPermissions.includes(p.code));
                    return (
                      <div key={modName} className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/60 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-indigo-600" />
                            <span className="text-xs font-black text-slate-800 uppercase tracking-wider font-heading">
                              {modName} Management
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleModulePermissions(modName)}
                            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-wider flex items-center gap-1"
                          >
                            {allSelected ? <CheckSquare size={13} /> : <Square size={13} />}
                            {allSelected ? "Deselect All" : "Select All"}
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {perms.map((p) => {
                            const isChecked = roleForm.selectedPermissions.includes(p.code);
                            return (
                              <label
                                key={p.id || p.code}
                                onClick={() => togglePermission(p.code)}
                                className={cn(
                                  "flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer select-none transition-all text-xs",
                                  isChecked
                                    ? "bg-white border-indigo-400 shadow-sm text-slate-900"
                                    : "bg-white/60 border-slate-200 text-slate-500 hover:border-slate-300"
                                )}
                              >
                                <div
                                  className={cn(
                                    "h-4 w-4 rounded-md mt-0.5 flex items-center justify-center shrink-0 border transition-all",
                                    isChecked
                                      ? "bg-indigo-600 border-indigo-600 text-white"
                                      : "border-slate-300 bg-white"
                                  )}
                                >
                                  {isChecked && <Check size={10} strokeWidth={3} />}
                                </div>
                                <div>
                                  <p className="font-bold text-[11px] leading-tight font-mono">{p.code}</p>
                                  <p className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">
                                    {p.description || p.name}
                                  </p>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 p-4 px-6 border-t border-slate-200 flex items-center justify-between shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsRoleModalOpen(false)}
                className="h-11 px-5 rounded-xl text-xs font-bold uppercase tracking-wider"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={savingRole}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-11 px-8 rounded-xl shadow-lg shadow-indigo-600/20 uppercase tracking-widest"
              >
                {savingRole ? "Saving..." : editingRole ? "Save Changes" : "Create Role"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* 🛠️ MODAL: ASSIGN ROLE TO STAFF */}
      <Dialog open={!!selectedStaff} onOpenChange={(open) => !open && setSelectedStaff(null)}>
        <DialogContent className="max-w-md rounded-3xl p-6 bg-white border border-slate-200 shadow-2xl font-sans">
          <DialogHeader className="space-y-1 text-left">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
              <Shield size={20} />
            </div>
            <DialogTitle className="text-base font-black text-slate-900 uppercase tracking-tight font-heading">
              Assign Role: {selectedStaff?.name}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 font-medium">
              Select the security role to assign to this faculty member.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Role</label>
              <select
                value={assignedRoleId}
                onChange={(e) => setAssignedRoleId(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 outline-none cursor-pointer focus:border-indigo-500"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name} {r.isSystem ? "(System)" : "(Custom)"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectedStaff(null)}
              className="h-11 rounded-xl text-xs font-bold uppercase tracking-wider flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveStaffRole}
              disabled={savingStaffRole}
              className="h-11 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex-1 shadow-lg shadow-slate-900/10"
            >
              {savingStaffRole ? "Updating..." : "Update Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ⚠️ CONFIRM DELETE ROLE DIALOG */}
      <ConfirmDialog
        isOpen={!!roleToDelete}
        onClose={() => setRoleToDelete(null)}
        onConfirm={handleConfirmDeleteRole}
        title={`Delete Role ${roleToDelete?.name}?`}
        description="This will permanently delete this custom role. Any staff members assigned to this role will need to be reassigned."
        confirmText="Delete Role"
        type="danger"
      />
    </div>
  );
}
