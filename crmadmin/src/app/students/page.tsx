"use client";

import React from "react";
import {
  Users, Search, Filter, Plus, FileDown,
  Eye, Edit2, Trash2, Square, CheckSquare,
  ChevronDown, ChevronLeft, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ConfirmDialog } from "@/components/dialogbox/ConfirmDialog";
import { useStudentsState, CLASSES_LIST, SECTIONS_LIST } from "@/features/students";

export default function StudentsPage() {
  const {
    router,
    searchQuery,
    setSearchQuery,
    selectedClass,
    setSelectedClass,
    selectedSection,
    setSelectedSection,
    selectedIds,
    currentPage,
    setCurrentPage,
    pageSize,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    studentToDelete,
    setStudentToDelete,
    userRole,
    isTeacher,
    response,
    isLoading,
    isPlaceholderData,
    totalPages,
    totalItems,
    deleteMutation,
    handleBulkSectionUpdate,
    filteredStudents,
    toggleSelect,
    toggleSelectAll,
    handleDelete,
    confirmDelete,
    getInitials,
  } = useStudentsState();

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 bg-slate-50/50 min-h-screen">
      {/* 🏙️ ELITE HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-in fade-in duration-500">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-slate-900 flex items-center gap-3 uppercase font-heading">
            Student <span className="text-indigo-600">Management</span>
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[4px] mt-1">
            Manage scholarly registry and individual profiles.
          </p>
        </div>
        <div className="flex items-center space-x-2 w-full md:w-auto">
          {!isTeacher && (
            <Button
              onClick={() => router.push("/students/create")}
              className="bg-slate-900 hover:bg-slate-800 text-white h-11 px-8 rounded-lgxl font-bold uppercase text-[10px] tracking-widest shadow-massive transition-all active:scale-95"
            >
              <Plus className="mr-2 h-4 w-4" /> New Admission
            </Button>
          )}
        </div>
      </div>

      {/* 🚀 BULK ACTION BAR */}
      {selectedIds.length > 0 && !isTeacher && (
        <div className="flex items-center justify-between p-4 bg-indigo-600 rounded-lgxl text-white shadow-2xl shadow-indigo-200 animate-in slide-in-from-bottom-2 duration-500">
          <div className="flex items-center gap-4 px-2">
            <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center font-black text-xs border border-white/30">
              {selectedIds.length}
            </div>
            <span className="text-[10px] font-black uppercase tracking-[3px]">
              Scholars Selected
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-white/10 p-1 rounded-lg border border-white/20">
              {SECTIONS_LIST.map((s) => (
                <Button
                  key={s}
                  size="sm"
                  onClick={() => handleBulkSectionUpdate(s)}
                  className="h-8 bg-transparent hover:bg-white hover:text-indigo-600 text-[10px] font-black uppercase transition-all"
                >
                  Move to {s}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 🧬 REGISTRY DATA TABLE */}
      <div className="bg-white rounded-lgxl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden animate-in fade-in duration-700">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-white gap-4">
          <div className="flex-1 flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
              <Input
                placeholder="Search scholars by identity..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-11 border-slate-100 bg-slate-50/50 rounded-xl font-bold text-xs focus:bg-white transition-all shadow-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-11 px-4 pr-10 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest appearance-none outline-none focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer shadow-sm"
                >
                  <option>All Classes</option>
                  {CLASSES_LIST.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
              </div>
              <div className="relative">
                <select
                  value={selectedSection}
                  onChange={(e) => {
                    setSelectedSection(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-11 px-4 pr-10 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest appearance-none outline-none focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer shadow-sm"
                >
                  <option>All Sections</option>
                  {SECTIONS_LIST.map((s) => (
                    <option key={s} value={s}>
                      Section {s}
                    </option>
                  ))}
                  <option value="UNASSIGNED">Unassigned</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="h-11 px-6 gap-2 border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
            >
              <Filter size={14} /> Advanced
            </Button>
            <Button
              variant="outline"
              className="h-11 px-6 gap-2 border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
            >
              <FileDown size={14} /> Export
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[500px]">
          <table className="w-full text-sm min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-400 font-black text-[10px] uppercase tracking-[4px]">
                {!isTeacher && (
                  <th className="w-12 px-6 py-6 text-left">
                    <button
                      onClick={toggleSelectAll}
                      className="text-slate-300 hover:text-slate-900 transition-colors"
                    >
                      {selectedIds.length === filteredStudents.length ? (
                        <CheckSquare size={18} className="text-indigo-600" />
                      ) : (
                        <Square size={18} />
                      )}
                    </button>
                  </th>
                )}
                <th className="text-left py-6 px-6 text-black">
                  Scholar Identity
                </th>
                <th className="text-left py-6 px-6 text-black">Roll No</th>
                <th className="text-left py-6 px-6 text-black">Grade</th>
                <th className="text-center py-6 px-6 text-black">Section</th>
                <th className="text-left py-6 px-6 text-black">Guardian</th>
                <th className="text-right py-6 px-8 text-black">Actions</th>
              </tr>
            </thead>
            <tbody
              className={cn(
                "divide-y divide-slate-100 transition-opacity duration-300",
                isPlaceholderData && "opacity-50"
              )}
            >
              {isLoading && !response ? (
                Array(pageSize)
                  .fill(0)
                  .map((_, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      {!isTeacher && (
                        <td className="px-6 py-6">
                          <Skeleton className="h-5 w-5 rounded" />
                        </td>
                      )}
                      <td className="px-6 py-6">
                        <div className="flex items-center space-x-4">
                          <Skeleton className="h-9 w-9 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-3 w-32" />
                            <Skeleton className="h-2 w-20" />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <Skeleton className="h-3 w-10" />
                      </td>
                      <td className="px-6 py-6">
                        <Skeleton className="h-6 w-16 rounded-lg" />
                      </td>
                      <td className="px-6 py-6">
                        <Skeleton className="h-3 w-8 mx-auto" />
                      </td>
                      <td className="px-6 py-6">
                        <Skeleton className="h-3 w-24" />
                      </td>
                      <td className="px-6 py-6 text-right">
                        <Skeleton className="h-8 w-24 rounded-lg ml-auto" />
                      </td>
                    </tr>
                  ))
              ) : (
                filteredStudents.map((student: any) => {
                  const studentId = String(student._id || student.id);
                  const isSelected = selectedIds.includes(studentId);
                  return (
                    <tr
                      key={studentId}
                      className={cn(
                        "hover:bg-slate-50/50 transition-colors duration-200 group",
                        isSelected && "bg-indigo-50/30"
                      )}
                    >
                      {!isTeacher && (
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleSelect(studentId)}
                            className="text-slate-300 hover:text-indigo-600 transition-colors mt-1"
                          >
                            {isSelected ? (
                              <CheckSquare
                                size={18}
                                className="text-indigo-600"
                              />
                            ) : (
                              <Square size={18} />
                            )}
                          </button>
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-9 w-9 rounded-full border border-slate-200 shadow-sm transition-transform group-hover:scale-105">
                            <AvatarImage
                              src={student.image}
                              className="object-cover"
                            />
                            <AvatarFallback className="bg-slate-100 text-slate-400 font-bold text-[10px]">
                              {getInitials(student.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-slate-900 leading-tight truncate max-w-[150px]">
                              {student.name}
                            </p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">
                              {student.admissionNo || "Verified Scholar"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-600 text-xs">
                        {student.rollNo || "--"}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant="outline"
                          className="bg-indigo-50 text-indigo-600 border-indigo-100 font-bold text-[10px] uppercase tracking-wider py-1 px-3.5 rounded-xl"
                        >
                          {student.class}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-indigo-600 text-xs ">
                        {student.section || "--"}
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-[11px] font-medium truncate max-w-[120px]">
                        {student.fatherName || "--"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-1.5 opacity-100 transition-all">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(`/students/view/${studentId}`)
                            }
                            className="h-9 w-9 p-0 text-slate-400 hover:text-indigo-600 border-slate-100 rounded-xl hover:bg-slate-50 transition-all"
                          >
                            <Eye size={14} />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(`/students/edit/${studentId}`)
                            }
                            className="h-9 w-9 p-0 text-slate-400 hover:text-indigo-600 border-slate-100 rounded-xl hover:bg-slate-50 transition-all"
                          >
                            <Edit2 size={14} />
                          </Button>
                          {/* 🔒 Delete: Hidden from Teachers — only Admins & Principal can delete */}
                          {!isTeacher && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(studentId)}
                            className="h-9 w-9 p-0 text-slate-400 hover:text-red-600 border-slate-100 rounded-xl hover:bg-slate-50 transition-all"
                          >
                            <Trash2 size={14} />
                          </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          {!isLoading && filteredStudents.length === 0 && (
            <div className="p-20 text-center">
              <Users className="h-16 w-16 text-slate-100 mx-auto mb-6" />
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[6px]">
                No Scholars Found
              </p>
            </div>
          )}
        </div>

        {/* 📟 ELITE PAGINATION BAR */}
        <div className="p-6 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Showing
            </span>
            <span className="text-[11px] font-black text-slate-900">
              {(currentPage - 1) * pageSize + 1} -{" "}
              {Math.min(currentPage * pageSize, totalItems)}
            </span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              of
            </span>
            <span className="text-[11px] font-black text-slate-900">
              {totalItems}
            </span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Scholars
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1 || isLoading}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="h-10 px-4 border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
            >
              <ChevronLeft className="mr-2 h-3 w-3" /> Prev
            </Button>

            <div className="flex items-center gap-1 px-4">
              {Array.from({ length: totalPages }).map((_, i) => {
                const page = i + 1;
                if (
                  totalPages > 5 &&
                  Math.abs(page - currentPage) > 1 &&
                  page !== 1 &&
                  page !== totalPages
                )
                  return null;
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "ghost"}
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      "h-10 w-10 rounded-xl text-[10px] font-black transition-all",
                      currentPage === page
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                        : "text-slate-400 hover:bg-slate-100"
                    )}
                  >
                    {page}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages || isLoading}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="h-10 px-4 border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
            >
              Next <ChevronRight className="ml-2 h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setStudentToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Purge Scholar Record?"
        description="This will permanently delete this student record and all academic logs from the registry."
        type="danger"
      />
    </div>
  );
}
