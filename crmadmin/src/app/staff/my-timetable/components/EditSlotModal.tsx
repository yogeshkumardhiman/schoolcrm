"use client";

import React from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/dialogbox/dialog";

interface EditSlotModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  activeSlot: {
    day: string;
    period: number;
    time: string;
    selectedSubject: string;
    customSubjectName: string;
    staffId: string;
    customTeacherName: string;
  };
  setActiveSlot: (slot: any) => void;
  selectedClass: string;
  selectedSection: string;
  days: string[];
  availableSubjectNames: string[];
  teachers: any[];
  isCustomSubjectMode: boolean;
  setIsCustomSubjectMode: (val: boolean) => void;
  saveToCurriculum: boolean;
  setSaveToCurriculum: (val: boolean) => void;
  onSaveSlot: () => void;
  isPending: boolean;
}

export function EditSlotModal({
  isOpen,
  onOpenChange,
  activeSlot,
  setActiveSlot,
  selectedClass,
  selectedSection,
  days,
  availableSubjectNames,
  teachers,
  isCustomSubjectMode,
  setIsCustomSubjectMode,
  saveToCurriculum,
  setSaveToCurriculum,
  onSaveSlot,
  isPending,
}: EditSlotModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 bg-white rounded-3xl border border-slate-200 shadow-2xl">
        <DialogHeader className="border-b border-slate-100 pb-4">
          <DialogTitle className="text-lg font-black uppercase text-slate-900 flex items-center gap-2">
            <Clock className="text-indigo-600" size={20} />
            Assign Period Slot • {activeSlot.day} P-{activeSlot.period}
          </DialogTitle>
          <p className="text-xs text-slate-400 font-bold uppercase mt-1">
            Class {selectedClass}-{selectedSection} • Slot: {activeSlot.time}
          </p>
        </DialogHeader>

        <div className="space-y-4 py-3">
          {/* Day & Period Pickers */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Academic Day
              </label>
              <select
                value={activeSlot.day}
                onChange={(e) => setActiveSlot({ ...activeSlot, day: e.target.value })}
                className="appearance-none w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs font-bold uppercase outline-none cursor-pointer text-slate-800"
              >
                {days.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Period Number
              </label>
              <select
                value={activeSlot.period}
                onChange={(e) => setActiveSlot({ ...activeSlot, period: Number(e.target.value) })}
                className="appearance-none w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs font-bold uppercase outline-none cursor-pointer text-slate-800"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((p) => (
                  <option key={p} value={p}>
                    Period {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Custom Slot Timing Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Clock size={11} className="text-indigo-600" /> Period Time Range
            </label>
            <Input
              placeholder="e.g. 08:30 - 09:15"
              value={activeSlot.time}
              onChange={(e) => setActiveSlot({ ...activeSlot, time: e.target.value })}
              className="h-11 rounded-xl text-xs font-bold font-mono"
            />
          </div>

          {/* SUBJECT SELECTION OR CUSTOM ENTRY TOGGLE */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Subject for Class {selectedClass} *
              </label>
              <button
                type="button"
                onClick={() => setIsCustomSubjectMode(!isCustomSubjectMode)}
                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-wider flex items-center gap-1 cursor-pointer"
              >
                {isCustomSubjectMode ? "← Choose Existing Subject" : "+ Add Custom Subject"}
              </button>
            </div>

            {!isCustomSubjectMode ? (
              <select
                value={activeSlot.selectedSubject}
                onChange={(e) => setActiveSlot({ ...activeSlot, selectedSubject: e.target.value })}
                className="appearance-none w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs font-bold uppercase outline-none cursor-pointer text-slate-800"
              >
                {availableSubjectNames.length === 0 ? (
                  <option value="">-- No Subjects Registered for Class --</option>
                ) : (
                  availableSubjectNames.map((subj: string) => (
                    <option key={subj} value={subj}>
                      {subj}
                    </option>
                  ))
                )}
              </select>
            ) : (
              <div className="space-y-2">
                <Input
                  placeholder="Type New Subject Name (e.g. Robotics Lab, Vedic Maths)"
                  value={activeSlot.customSubjectName}
                  onChange={(e) => setActiveSlot({ ...activeSlot, customSubjectName: e.target.value })}
                  className="h-11 rounded-xl text-xs font-bold"
                  autoFocus
                />
                <label className="flex items-center gap-2 text-xs text-slate-600 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saveToCurriculum}
                    onChange={(e) => setSaveToCurriculum(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <span>Also save this new subject to Class {selectedClass} curriculum</span>
                </label>
              </div>
            )}
          </div>

          {/* Teacher Incharge Dropdown */}
          <div className="space-y-1.5 pt-1 border-t border-slate-100">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Faculty Incharge (Teacher)
            </label>
            <select
              value={activeSlot.staffId}
              onChange={(e) => setActiveSlot({ ...activeSlot, staffId: e.target.value })}
              className="appearance-none w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs font-bold outline-none cursor-pointer text-slate-800"
            >
              <option value="">-- Choose Assigned Teacher --</option>
              {teachers.map((t: any) => (
                <option key={t.id} value={String(t.id)}>
                  {t.name} • {t.subject || t.designation || "Teacher"}
                </option>
              ))}
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
            onClick={onSaveSlot}
            disabled={isPending}
            className="h-11 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-md shadow-indigo-600/20"
          >
            {isPending ? "Saving..." : "Save Period Slot"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
