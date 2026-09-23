"use client";

import React from "react";
import { History, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/dialogbox/dialog";

interface LogTimelineActivityModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  studentName: string;
  timelineEvents: any[];
}

export default function LogTimelineActivityModal({
  isOpen,
  onOpenChange,
  studentName,
  timelineEvents
}: LogTimelineActivityModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-none shadow-2xl rounded-lgxl p-0 overflow-hidden bg-white max-h-[85vh] flex flex-col">
        <DialogHeader className="bg-slate-950 p-8 text-white shrink-0">
          <DialogTitle className="text-xl font-black uppercase  tracking-tighter flex items-center gap-2">
            <History className="h-5 w-5 text-indigo-400 animate-spin-slow" /> Scholar Ledger Timeline
          </DialogTitle>
          <DialogDescription className="text-indigo-300 text-[10px] font-black uppercase tracking-widest mt-2">
            Unified chronological events registry for {studentName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-8 overflow-y-auto flex-1 space-y-6 scrollbar-thin">
          {timelineEvents.length === 0 ? (
            <div className="py-20 text-center text-slate-300 space-y-4">
              <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                <Activity size={24} className="text-slate-400" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[3px]">No logged events detected</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-100 ml-4 pl-8 space-y-8 py-2">
              {timelineEvents.map((event: any, idx: number) => {
                const EventIcon = event.icon;
                return (
                  <div key={idx} className="relative group">
                    {/* Timeline Dot */}
                    <span className="absolute -left-[43px] top-1 flex h-7 w-7 items-center justify-center rounded-full bg-white border-2 border-slate-100 group-hover:border-indigo-600 transition-colors shadow-sm">
                      <div className={cn("h-4 w-4 rounded-full flex items-center justify-center p-0.5", event.color.split(" ")[0])}>
                        <EventIcon className="h-2.5 w-2.5" />
                      </div>
                    </span>
                    
                    {/* Event Details */}
                    <div className="bg-slate-50/50 hover:bg-slate-50 border border-slate-100/50 rounded-xl p-4 transition-all hover:shadow-md">
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <span className={cn(
                          "px-2.5 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border",
                          event.color
                        )}>
                          {event.type}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 tracking-wider">
                          {new Date(event.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                        </span>
                      </div>
                      <h4 className="font-black text-xs text-slate-900 uppercase tracking-tight mb-1 ">
                        {event.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                        {event.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        <DialogFooter className="p-6 bg-slate-50 border-t shrink-0">
          <Button onClick={() => onOpenChange(false)} className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black uppercase text-[10px] tracking-widest">
            Close Timeline
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
