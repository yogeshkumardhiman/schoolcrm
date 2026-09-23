"use client";

import React from "react";
import { Plus, ArrowRight, AlertCircle } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";

interface ClassesRegistryTableProps {
  isLoading: boolean;
  filteredClasses: string[];
  classStudentCounts: Record<string, number>;
  classSectionsMap: Record<string, any[]>;
  wingMap: Record<string, string>;
  onOpenAllocate: (cls: string) => void;
  onOpenViewRoster: (section: any) => void;
  onManageClass: (cls: string) => void;
}

export function ClassesRegistryTable({
  isLoading,
  filteredClasses,
  classStudentCounts,
  classSectionsMap,
  wingMap,
  onOpenAllocate,
  onOpenViewRoster,
  onManageClass,
}: ClassesRegistryTableProps) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden animate-in fade-in duration-300">
      <Table>
        <TableHeader className="bg-slate-900 text-white">
          <TableRow className="hover:bg-slate-900 border-none">
            <TableHead className="text-white font-black text-xs uppercase tracking-wider py-4 pl-6">
              Class / Grade
            </TableHead>
            <TableHead className="text-white font-black text-xs uppercase tracking-wider py-4">
              Academic Wing
            </TableHead>
            <TableHead className="text-white font-black text-xs uppercase tracking-wider py-4 text-center">
              Enrolled Scholars
            </TableHead>
            <TableHead className="text-white font-black text-xs uppercase tracking-wider py-4">
              Active Sections & Teachers
            </TableHead>
            <TableHead className="text-white font-black text-xs uppercase tracking-wider py-4 text-right pr-6">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-slate-100">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, idx) => (
              <TableRow key={idx}>
                <TableCell className="py-4 pl-6">
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="h-9 w-9 rounded-xl" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-20 rounded" />
                      <Skeleton className="h-2.5 w-14 rounded" />
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <Skeleton className="h-6 w-24 rounded-full" />
                </TableCell>
                <TableCell className="py-4 text-center">
                  <Skeleton className="h-6 w-20 rounded-full mx-auto" />
                </TableCell>
                <TableCell className="py-4">
                  <Skeleton className="h-7 w-48 rounded-xl" />
                </TableCell>
                <TableCell className="py-4 pr-6 text-right">
                  <Skeleton className="h-8 w-28 rounded-xl ml-auto" />
                </TableCell>
              </TableRow>
            ))
          ) : filteredClasses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-12 text-slate-400 font-medium">
                No classes found matching search criteria.
              </TableCell>
            </TableRow>
          ) : (
            filteredClasses.map((cls) => {
              const studentCount = classStudentCounts[cls] || 0;
              const sections = classSectionsMap[cls] || [];
              const wing = wingMap[cls] || "Academic Wing";

              return (
                <TableRow key={cls} className="hover:bg-slate-50/80 transition-colors">
                  {/* Grade Badge */}
                  <TableCell className="py-4 pl-6 font-bold">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs shadow-xs">
                        {cls.substring(0, 3)}
                      </div>
                      <div>
                        <span className="font-black text-sm text-slate-900 block font-heading uppercase">
                          Class {cls}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          Session 2026-2027
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Wing */}
                  <TableCell className="py-4">
                    <Badge variant="outline" className="bg-slate-50 text-slate-600 font-bold text-[11px] uppercase border-slate-200">
                      {wing}
                    </Badge>
                  </TableCell>

                  {/* Scholars Count */}
                  <TableCell className="py-4 text-center">
                    <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-black text-xs px-3 py-1">
                      {studentCount} Scholars
                    </Badge>
                  </TableCell>

                  {/* Sections & Teachers */}
                  <TableCell className="py-4">
                    {sections.length === 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-400 italic">
                        <AlertCircle size={13} className="text-amber-500" /> No sections created yet
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {sections.map((sec: any) => (
                          <button
                            key={sec.id}
                            onClick={() => onOpenViewRoster(sec)}
                            className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 rounded-xl text-xs font-bold shadow-2xs cursor-pointer transition-colors"
                            title="Click to view students roster for this section"
                          >
                            <span>Sec {sec.section}</span>
                            <span className="text-[10px] text-indigo-600 font-mono font-black bg-white px-1.5 py-0.2 rounded border border-indigo-100">
                              {sec.studentCount || 0}
                            </span>
                            {sec.classTeacher ? (
                              <span className="text-[11px] text-slate-700 font-normal border-l border-indigo-200 pl-1.5">
                                {sec.classTeacher.name}
                              </span>
                            ) : (
                              <span className="text-[10px] text-rose-500 font-bold italic border-l border-indigo-200 pl-1.5">
                                No Teacher
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="py-4 text-right pr-6">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        onClick={() => onOpenAllocate(cls)}
                        className="h-8 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase rounded-xl cursor-pointer shadow-xs flex items-center gap-1.5"
                        title={`Allocate students into sections and assign class teacher for Class ${cls}`}
                      >
                        <Plus size={13} /> Allocate Section
                      </Button>

                      {sections.length > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onManageClass(cls)}
                          className="h-8 px-2.5 text-xs font-bold uppercase rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
                        >
                          Manage <ArrowRight size={12} />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
