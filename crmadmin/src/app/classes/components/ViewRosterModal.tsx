"use client";

import React, { useState } from "react";
import { Users, ArrowUpDown, Search, Plus, Loader2 } from "lucide-react";
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

interface ViewRosterModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  section: any;
  detailedRoster: any;
  isLoading: boolean;
  onAutoRoll: (sectionId: number) => void;
  isAutoRollPending: boolean;
  onRemoveStudent: (studentId: number, name: string) => void;
  onOpenAllocate: (cls: string, sec: string) => void;
}

export function ViewRosterModal({
  isOpen,
  onOpenChange,
  section,
  detailedRoster,
  isLoading,
  onAutoRoll,
  isAutoRollPending,
  onRemoveStudent,
  onOpenAllocate,
}: ViewRosterModalProps) {
  const [rosterSearch, setRosterSearch] = useState("");

  const rosterStudents = detailedRoster?.students || [];
  const filteredStudents = rosterStudents.filter((s: any) => {
    if (!rosterSearch) return true;
    const q = rosterSearch.toLowerCase();
    return (
      (s.name || "").toLowerCase().includes(q) ||
      (s.admissionNo || "").toLowerCase().includes(q) ||
      (s.fatherName || "").toLowerCase().includes(q)
    );
  });

  if (!section) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-6 bg-white rounded-3xl border border-slate-200 shadow-2xl">
        <DialogHeader className="border-b border-slate-100 pb-4 flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-lg font-black uppercase text-slate-900 flex items-center gap-2">
              <Users className="text-indigo-600" size={20} />
              Student Roster • Class {section.class} - Section {section.section}
            </DialogTitle>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Class Teacher: <span className="text-slate-700 font-bold">{section.classTeacher?.name || "Unassigned"}</span> • {rosterStudents.length} Enrolled Scholars
            </p>
          </div>

          <Button
            size="sm"
            onClick={() => onAutoRoll(section.id)}
            disabled={isAutoRollPending || rosterStudents.length === 0}
            className="h-9 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer flex items-center gap-1.5"
          >
            <ArrowUpDown size={13} /> ⚡ Auto Roll Numbers
          </Button>
        </DialogHeader>

        <div className="space-y-4 py-3">
          {/* Search within section */}
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <Input
                placeholder="Search students in this section by name, admission no, or father..."
                value={rosterSearch}
                onChange={(e) => setRosterSearch(e.target.value)}
                className="h-10 pl-9 rounded-xl text-xs"
              />
            </div>

            <Button
              size="sm"
              onClick={() => {
                onOpenChange(false);
                onOpenAllocate(section.class, section.section);
              }}
              className="h-10 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase rounded-xl cursor-pointer flex items-center gap-1.5"
            >
              <Plus size={13} /> + Add More Students
            </Button>
          </div>

          {/* Students List Table */}
          {isLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="animate-spin text-indigo-600 mx-auto" size={28} />
              <span className="text-xs text-slate-400 font-bold uppercase mt-2 block">Loading Roster...</span>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-400">
              No students enrolled in this section yet. Click "+ Add More Students" to allocate scholars.
            </div>
          ) : (
            <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-[420px] overflow-y-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-900 text-white text-[10.5px] uppercase font-bold tracking-wider sticky top-0 z-10">
                  <tr>
                    <th className="p-3 pl-4 w-20 text-center">Roll No</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Admission No</th>
                    <th className="p-3">Father's Name & Phone</th>
                    <th className="p-3">Gender</th>
                    <th className="p-3 text-right pr-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((student: any) => (
                    <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3 pl-4 text-center font-black font-mono text-indigo-600 bg-indigo-50/40">
                        #{student.rollNo || "--"}
                      </td>
                      <td className="p-3 font-bold text-slate-900">
                        {student.name}
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-500">
                        {student.admissionNo}
                      </td>
                      <td className="p-3 text-slate-600">
                        <div>
                          <span className="block font-medium">{student.fatherName || "--"}</span>
                          <span className="font-mono text-[10px] text-slate-400">{student.phone || "--"}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className="text-[10px] font-bold uppercase text-slate-600">
                          {student.gender || "MALE"}
                        </Badge>
                      </td>
                      <td className="p-3 text-right pr-4">
                        <button
                          onClick={() => onRemoveStudent(student.id, student.name)}
                          className="text-rose-500 hover:text-rose-700 text-[10.5px] font-bold uppercase cursor-pointer transition-colors"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <DialogFooter className="pt-2 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-11 px-5 text-xs font-bold uppercase rounded-xl cursor-pointer"
          >
            Close Roster
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
