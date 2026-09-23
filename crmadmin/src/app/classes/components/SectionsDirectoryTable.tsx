"use client";

import React from "react";
import { DoorOpen, ArrowUpDown, Eye, Plus, Trash2, School, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface SectionsDirectoryTableProps {
  isLoading: boolean;
  filteredSections: any[];
  onOpenAllocate: (cls?: string, sec?: string) => void;
  onOpenAssignTeacher: (sec: any) => void;
  onOpenViewRoster: (sec: any) => void;
  onAutoRoll: (sectionId: number) => void;
  isAutoRollPending: boolean;
  onDeleteSection: (sectionId: number, name: string) => void;
}

export function SectionsDirectoryTable({
  isLoading,
  filteredSections,
  onOpenAllocate,
  onOpenAssignTeacher,
  onOpenViewRoster,
  onAutoRoll,
  isAutoRollPending,
  onDeleteSection,
}: SectionsDirectoryTableProps) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden animate-in fade-in duration-300">
      <Table>
        <TableHeader className="bg-slate-900 text-white">
          <TableRow className="hover:bg-slate-900 border-none">
            <TableHead className="text-white font-black text-xs uppercase tracking-wider py-4 pl-6">
              Section Name
            </TableHead>
            <TableHead className="text-white font-black text-xs uppercase tracking-wider py-4">
              Room No / Hall
            </TableHead>
            <TableHead className="text-white font-black text-xs uppercase tracking-wider py-4">
              Class Teacher Incharge
            </TableHead>
            <TableHead className="text-white font-black text-xs uppercase tracking-wider py-4 text-center">
              Roster Strength
            </TableHead>
            <TableHead className="text-white font-black text-xs uppercase tracking-wider py-4 text-center">
              Roll Numbers
            </TableHead>
            <TableHead className="text-white font-black text-xs uppercase tracking-wider py-4 text-right pr-6">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-slate-100">
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-12">
                <Loader2 className="animate-spin text-indigo-600 mx-auto" size={28} />
                <span className="text-xs text-slate-400 font-bold uppercase mt-2 block">
                  Loading Sections...
                </span>
              </TableCell>
            </TableRow>
          ) : filteredSections.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-12 space-y-3">
                <School className="text-indigo-400 mx-auto" size={32} />
                <p className="text-sm font-bold text-slate-700 uppercase">
                  No Sections Created For This Filter
                </p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Click "+ Allocate Section" button to create a section, assign a teacher, and select students.
                </p>
                <Button
                  size="sm"
                  onClick={() => onOpenAllocate("1ST")}
                  className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase rounded-xl"
                >
                  <Plus size={14} className="mr-1" /> Allocate Section Now
                </Button>
              </TableCell>
            </TableRow>
          ) : (
            filteredSections.map((sec: any) => (
              <TableRow key={sec.id} className="hover:bg-slate-50/80 transition-colors">
                {/* Section Identity */}
                <TableCell className="py-4 pl-6 font-bold">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-slate-900 text-white font-black text-xs uppercase px-2.5 py-0.5">
                      Class {sec.class}
                    </Badge>
                    <Badge className="bg-indigo-600 text-white font-black text-xs uppercase px-2.5 py-0.5">
                      Sec {sec.section}
                    </Badge>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium mt-1 block">
                    Session {sec.session || "2026-2027"}
                  </span>
                </TableCell>

                {/* Room */}
                <TableCell className="py-4 text-xs font-bold text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <DoorOpen size={14} className="text-slate-400" />
                    <span>{sec.roomNo || "Room Unassigned"}</span>
                  </div>
                </TableCell>

                {/* Class Teacher */}
                <TableCell className="py-4">
                  {sec.classTeacher ? (
                    <div className="flex items-center gap-2">
                      <div>
                        <span className="font-black text-xs text-slate-900 block">
                          {sec.classTeacher.name}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {sec.classTeacher.designation || sec.classTeacher.subject || "Teacher"}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onOpenAssignTeacher(sec)}
                        className="h-6 px-1.5 text-[10px] font-bold uppercase text-indigo-600 hover:bg-indigo-50 rounded cursor-pointer"
                      >
                        Change
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-rose-500 italic">Not Assigned</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onOpenAssignTeacher(sec)}
                        className="h-6 px-2 text-[10px] font-bold uppercase text-indigo-600 border-indigo-200 hover:bg-indigo-50 rounded cursor-pointer"
                      >
                        + Assign
                      </Button>
                    </div>
                  )}
                </TableCell>

                {/* Roster Strength */}
                <TableCell className="py-4 text-center">
                  <Badge
                    className={cn(
                      "font-mono font-black text-xs px-2.5 py-1",
                      (sec.studentCount || 0) > 0
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-500"
                    )}
                  >
                    {sec.studentCount || 0} / {sec.capacity || 40} Scholars
                  </Badge>
                </TableCell>

                {/* Auto Roll Action */}
                <TableCell className="py-4 text-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onAutoRoll(sec.id)}
                    disabled={isAutoRollPending || (sec.studentCount || 0) === 0}
                    title="Alphabetically re-order roll numbers 1, 2, 3..."
                    className="h-8 px-3 border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100 text-indigo-700 font-black text-[10.5px] uppercase tracking-wider rounded-xl cursor-pointer inline-flex items-center gap-1"
                  >
                    <ArrowUpDown size={12} /> Auto Roll
                  </Button>
                </TableCell>

                {/* Actions: View Roster & Edit */}
                <TableCell className="py-4 text-right pr-6">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      onClick={() => onOpenViewRoster(sec)}
                      className="h-8 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase rounded-xl cursor-pointer flex items-center gap-1.5 shadow-xs"
                      title="View complete list of students in this section"
                    >
                      <Eye size={12} /> View Students ({sec.studentCount || 0})
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onOpenAllocate(sec.class, sec.section)}
                      className="h-8 px-2.5 text-slate-700 border-slate-200 hover:bg-slate-50 font-bold text-xs uppercase rounded-xl cursor-pointer flex items-center gap-1"
                    >
                      <Plus size={12} /> Add/Edit
                    </Button>

                    <button
                      onClick={() => onDeleteSection(sec.id, `${sec.class}-${sec.section}`)}
                      className="h-8 w-8 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                      title="Delete Section"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
