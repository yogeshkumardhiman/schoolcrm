"use client";

import React from "react";
import { UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/dialogbox/dialog";
import toast from "react-hot-toast";

interface AssignTeacherModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  activeSection: any;
  selectedTeacherId: string;
  setSelectedTeacherId: (id: string) => void;
  availableTeachers: any[];
  dropdownTeachers: any[];
  assignedTeachersMap: Map<number, any>;
  onConfirmAssign: (sectionId: number, teacherId: number) => void;
  isPending: boolean;
}

export function AssignTeacherModal({
  isOpen,
  onOpenChange,
  activeSection,
  selectedTeacherId,
  setSelectedTeacherId,
  availableTeachers,
  dropdownTeachers,
  assignedTeachersMap,
  onConfirmAssign,
  isPending,
}: AssignTeacherModalProps) {
  if (!activeSection) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 bg-white rounded-3xl border border-slate-200 shadow-2xl">
        <DialogHeader className="border-b border-slate-100 pb-4">
          <DialogTitle className="text-lg font-black uppercase text-slate-900 flex items-center gap-2">
            <UserCheck className="text-indigo-600" size={20} />
            Assign Class Teacher • Class {activeSection.class}-{activeSection.section}
          </DialogTitle>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Select faculty incharge responsible for attendance & scholastic records.
          </p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Choose Teaching Faculty ({dropdownTeachers.length} Available) *
              </label>
              {availableTeachers.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const available = availableTeachers[0];
                    if (available) {
                      setSelectedTeacherId(String(available.id));
                      toast.success(`Selected: ${available.name}`);
                    }
                  }}
                  className="text-[10.5px] font-black text-indigo-600 hover:text-indigo-800 uppercase cursor-pointer"
                >
                  Auto-Pick
                </button>
              )}
            </div>
            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="appearance-none w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs font-bold outline-none cursor-pointer"
            >
              <option value="">-- Choose Teacher --</option>
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

        <DialogFooter className="flex gap-2 pt-2 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-11 px-4 text-xs font-bold uppercase rounded-xl cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => {
              if (!selectedTeacherId) {
                return toast.error("Please select a teacher");
              }
              onConfirmAssign(activeSection.id, Number(selectedTeacherId));
            }}
            disabled={isPending}
            className="h-11 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-md shadow-indigo-600/20"
          >
            {isPending ? "Assigning..." : "Confirm Class Teacher"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
