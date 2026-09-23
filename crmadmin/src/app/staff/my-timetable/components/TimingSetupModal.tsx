"use client";

import React from "react";
import { Settings2, Sun, Snowflake, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/dialogbox/dialog";

interface TimingSetupModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  tempPeriods: any[];
  setTempPeriods: (periods: any[]) => void;
  onApplyPreset: (preset: "REGULAR" | "SUMMER" | "WINTER") => void;
  onSaveTimings: () => void;
}

export function TimingSetupModal({
  isOpen,
  onOpenChange,
  tempPeriods,
  setTempPeriods,
  onApplyPreset,
  onSaveTimings,
}: TimingSetupModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-6 bg-white rounded-3xl border border-slate-200 shadow-2xl">
        <DialogHeader className="border-b border-slate-100 pb-4">
          <DialogTitle className="text-lg font-black uppercase text-slate-900 flex items-center gap-2">
            <Settings2 className="text-indigo-600" size={20} />
            School Period Timings Setup
          </DialogTitle>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Configure default start/end times and breaks for each period across all classes.
          </p>
        </DialogHeader>

        <div className="space-y-4 py-3">
          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Quick Timing Presets:
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onApplyPreset("REGULAR")}
              className="h-8 px-2.5 text-[10.5px] font-bold uppercase rounded-lg border-slate-200"
            >
              <RotateCcw size={11} className="mr-1" /> Regular (08:30 - 02:15)
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onApplyPreset("SUMMER")}
              className="h-8 px-2.5 text-[10.5px] font-bold uppercase rounded-lg border-amber-200 bg-amber-50/50 text-amber-900"
            >
              <Sun size={11} className="mr-1 text-amber-600" /> Summer (07:30 - 01:15)
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onApplyPreset("WINTER")}
              className="h-8 px-2.5 text-[10.5px] font-bold uppercase rounded-lg border-blue-200 bg-blue-50/50 text-blue-900"
            >
              <Snowflake size={11} className="mr-1 text-blue-600" /> Winter (09:00 - 03:00)
            </Button>
          </div>

          {/* Periods Timing List Editor */}
          <div className="space-y-2 max-h-85 overflow-y-auto pr-1">
            {tempPeriods.map((p, idx) => (
              <div
                key={p.id}
                className="flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl"
              >
                <span className="w-16 text-xs font-black text-slate-800 uppercase font-mono">
                  {p.isBreak ? "RECESS" : `Period ${p.id}`}
                </span>
                <Input
                  value={p.time}
                  onChange={(e) => {
                    const next = [...tempPeriods];
                    next[idx] = { ...next[idx], time: e.target.value };
                    setTempPeriods(next);
                  }}
                  className="h-9 bg-white rounded-lg text-xs font-bold font-mono flex-1"
                  placeholder="e.g. 08:30 - 09:15"
                />
              </div>
            ))}
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
            onClick={onSaveTimings}
            className="h-11 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-md shadow-indigo-600/20"
          >
            Save Timetable Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
