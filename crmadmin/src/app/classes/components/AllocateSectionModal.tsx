"use client";

import React, { useState, useMemo } from "react";
import { Plus, Search, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/dialogbox/dialog";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface AllocateSectionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  allocateData: {
    className: string;
    sectionName: string;
    teacherId: string;
    roomNo: string;
    capacity: number;
  };
  setAllocateData: (data: any) => void;
  activeClassList: string[];
  availableTeachers: any[];
  dropdownTeachers: any[];
  assignedTeachersMap: Map<number, any>;
  classStudents: any[];
  isStudentsLoading: boolean;
  selectedStudentIds: number[];
  setSelectedStudentIds: (ids: number[]) => void;
  onConfirmAllocate: (payload: any) => void;
  isPending: boolean;
}

export function AllocateSectionModal({
  isOpen,
  onOpenChange,
  allocateData,
  setAllocateData,
  activeClassList,
  availableTeachers,
  dropdownTeachers,
  assignedTeachersMap,
  classStudents,
  isStudentsLoading,
  selectedStudentIds,
  setSelectedStudentIds,
  onConfirmAllocate,
  isPending,
}: AllocateSectionModalProps) {
  const [allocateSearch, setAllocateSearch] = useState("");
  const [allocateFilter, setAllocateFilter] = useState<"ALL" | "UNASSIGNED" | "ASSIGNED">("UNASSIGNED");

  const filteredStudents = useMemo(() => {
    return classStudents.filter((s: any) => {
      if (allocateFilter === "UNASSIGNED" && s.section) return false;
      if (allocateFilter === "ASSIGNED" && s.section !== allocateData.sectionName) return false;
      if (allocateSearch) {
        const q = allocateSearch.toLowerCase();
        return (
          (s.name || "").toLowerCase().includes(q) ||
          (s.admissionNo || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [classStudents, allocateFilter, allocateSearch, allocateData.sectionName]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-6 bg-white rounded-3xl border border-slate-200 shadow-2xl">
        <DialogHeader className="border-b border-slate-100 pb-4">
          <DialogTitle className="text-lg font-black uppercase text-slate-900 flex items-center gap-2">
            <Plus className="text-indigo-600" size={20} />
            Allocate Students to Section & Assign Teacher
          </DialogTitle>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Select class, section code, assign class teacher, and select students to allocate with alphabetical roll numbers.
          </p>
        </DialogHeader>

        <div className="space-y-4 py-3 max-h-[560px] overflow-y-auto pr-1">
          {/* Step 1: Section Details & Class Teacher */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Grade */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Class / Grade *
              </label>
              <select
                value={allocateData.className}
                onChange={(e) => {
                  setAllocateData({ ...allocateData, className: e.target.value });
                  setSelectedStudentIds([]);
                }}
                className="w-full h-10 bg-white border border-slate-200 rounded-xl px-3 text-xs font-bold uppercase outline-none"
              >
                {activeClassList.map((cls) => (
                  <option key={cls} value={cls}>
                    Class {cls}
                  </option>
                ))}
              </select>
            </div>

            {/* Section Code */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Section Code *
              </label>
              <Input
                placeholder="e.g. A, B, C"
                value={allocateData.sectionName}
                onChange={(e) => setAllocateData({ ...allocateData, sectionName: e.target.value.toUpperCase() })}
                className="h-10 rounded-xl text-xs font-bold uppercase"
              />
            </div>

            {/* Assign Class Teacher Dropdown */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Class Teacher *
                </label>
                {availableTeachers.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const available = availableTeachers[0];
                      if (available) {
                        setAllocateData({ ...allocateData, teacherId: String(available.id) });
                        toast.success(`Selected: ${available.name}`);
                      }
                    }}
                    className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 uppercase cursor-pointer"
                  >
                    Auto-Pick
                  </button>
                )}
              </div>
              <select
                value={allocateData.teacherId}
                onChange={(e) => setAllocateData({ ...allocateData, teacherId: e.target.value })}
                className="w-full h-10 bg-white border border-slate-200 rounded-xl px-2.5 text-xs font-bold outline-none"
              >
                <option value="">-- Select Teacher ({dropdownTeachers.length} Available) --</option>
                {dropdownTeachers.map((t: any) => {
                  const isAlreadyClassTeacher = assignedTeachersMap.has(t.id);
                  return (
                    <option key={t.id} value={String(t.id)}>
                      {t.name} • {t.designation || t.subject || "Teacher"} {isAlreadyClassTeacher ? "(Current Incharge)" : ""}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Step 2: Student Selection Box */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-slate-800">
                  Select Students for Section {allocateData.sectionName}
                </span>
                <Badge className="bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono font-black text-xs">
                  {selectedStudentIds.length} Selected
                </Badge>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setAllocateFilter("UNASSIGNED")}
                  className={cn(
                    "px-2.5 py-1 text-[10.5px] font-black uppercase rounded-lg transition-all cursor-pointer",
                    allocateFilter === "UNASSIGNED" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
                  )}
                >
                  Unassigned ({classStudents.filter((s: any) => !s.section).length})
                </button>
                <button
                  type="button"
                  onClick={() => setAllocateFilter("ALL")}
                  className={cn(
                    "px-2.5 py-1 text-[10.5px] font-black uppercase rounded-lg transition-all cursor-pointer",
                    allocateFilter === "ALL" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
                  )}
                >
                  All ({classStudents.length})
                </button>
                <button
                  type="button"
                  onClick={() => setAllocateFilter("ASSIGNED")}
                  className={cn(
                    "px-2.5 py-1 text-[10.5px] font-black uppercase rounded-lg transition-all cursor-pointer",
                    allocateFilter === "ASSIGNED" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
                  )}
                >
                  Sec {allocateData.sectionName} ({classStudents.filter((s: any) => s.section === allocateData.sectionName).length})
                </button>
              </div>
            </div>

            {/* Search & Select All Bar */}
            <div className="flex items-center justify-between gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                <Input
                  placeholder="Search student by name or admission no..."
                  value={allocateSearch}
                  onChange={(e) => setAllocateSearch(e.target.value)}
                  className="h-9 pl-8 rounded-xl text-xs"
                />
              </div>

              {filteredStudents.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (selectedStudentIds.length === filteredStudents.length) {
                      setSelectedStudentIds([]);
                    } else {
                      setSelectedStudentIds(filteredStudents.map((s: any) => s.id));
                    }
                  }}
                  className="h-9 px-3 text-xs font-bold uppercase rounded-xl cursor-pointer"
                >
                  {selectedStudentIds.length === filteredStudents.length ? "Deselect All" : "Select All"}
                </Button>
              )}
            </div>

            {/* Students Checkbox List */}
            {isStudentsLoading ? (
              <div className="p-8 text-center">
                <Loader2 className="animate-spin text-indigo-600 mx-auto" size={24} />
                <span className="text-xs text-slate-400 font-bold uppercase mt-2 block">Loading Students...</span>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-400">
                No students found for this filter.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1.5 bg-slate-50/50 rounded-2xl border border-slate-200">
                {filteredStudents.map((student: any) => {
                  const isChecked = selectedStudentIds.includes(student.id);
                  return (
                    <label
                      key={student.id}
                      className={cn(
                        "flex items-center gap-2.5 p-2 rounded-xl border text-xs cursor-pointer transition-all",
                        isChecked
                          ? "bg-indigo-50 border-indigo-300 text-indigo-900 shadow-2xs font-bold"
                          : "bg-white border-slate-200 hover:bg-slate-100 text-slate-700"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            setSelectedStudentIds(selectedStudentIds.filter((id) => id !== student.id));
                          } else {
                            setSelectedStudentIds([...selectedStudentIds, student.id]);
                          }
                        }}
                        className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                      />
                      <div className="truncate flex-1">
                        <span className="block truncate text-slate-900">{student.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono block">
                          {student.admissionNo} {student.section ? `• Sec ${student.section}` : ""}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex gap-2 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-11 px-5 text-xs font-bold uppercase rounded-xl cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => {
              if (!allocateData.sectionName.trim()) {
                return toast.error("Please enter a Section Code (e.g. A, B)");
              }
              onConfirmAllocate({
                className: allocateData.className,
                sectionName: allocateData.sectionName.trim().toUpperCase(),
                teacherId: allocateData.teacherId ? Number(allocateData.teacherId) : undefined,
                studentIds: selectedStudentIds,
                roomNo: allocateData.roomNo,
                capacity: allocateData.capacity,
              });
            }}
            disabled={isPending}
            className="h-11 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
          >
            {isPending ? "Allocating..." : `Confirm & Allocate (${selectedStudentIds.length} Students)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
