"use client";

import React, { useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/dialogbox/dialog";
import client from "@/lib/client";
import toast from "react-hot-toast";

interface AllocateMarksModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  studentSession: string;
  onSuccess: () => void;
}

export default function AllocateMarksModal({
  isOpen,
  onOpenChange,
  studentId,
  studentSession,
  onSuccess
}: AllocateMarksModalProps) {
  const [newResult, setNewResult] = useState({
    subject: "",
    examType: "UNIT TEST 1",
    marks: "",
    total: "100",
    remarks: ""
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!newResult.subject || !newResult.marks) {
      toast.error("Required fields empty.");
      return;
    }
    
    setIsSaving(true);
    try {
      await client.post('/academic/results', {
        studentId: Number(studentId),
        examName: newResult.examType,
        subject: newResult.subject,
        marksObtained: Number(newResult.marks),
        maxMarks: Number(newResult.total),
        remarks: newResult.remarks
      });
      toast.success("Telemetry updated.");
      onOpenChange(false);
      onSuccess();
      setNewResult({
        subject: "",
        examType: "UNIT TEST 1",
        marks: "",
        total: "100",
        remarks: ""
      });
    } catch (err) {
      toast.error("Sync failed.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl border-none shadow-2xl rounded-lgxl p-0 overflow-hidden bg-white">
        <DialogHeader className="bg-slate-950 p-8 text-white">
          <DialogTitle className="text-xl font-black uppercase  tracking-tighter">Scholastic Telemetry</DialogTitle>
          <DialogDescription className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mt-2">Establish new examination result record</DialogDescription>
        </DialogHeader>
        <div className="p-8 space-y-6">
          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-[3px] text-slate-500">Identity Subject</Label>
            <Input
              placeholder="E.G. MATHEMATICS"
              value={newResult.subject}
              onChange={(e) => setNewResult({ ...newResult, subject: e.target.value.toUpperCase() })}
              className="h-12 bg-slate-50 border-slate-100 rounded-xl font-bold text-sm focus:ring-4 focus:ring-indigo-50 transition-all uppercase"
            />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[3px] text-slate-500">Exam Type</Label>
              <div className="relative">
                <select
                  className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 text-xs font-black uppercase tracking-widest appearance-none outline-none focus:ring-4 focus:ring-indigo-50 transition-all cursor-pointer"
                  value={newResult.examType}
                  onChange={(e) => setNewResult({ ...newResult, examType: e.target.value })}
                >
                  <option value="UNIT TEST 1">Unit Test 1</option>
                  <option value="UNIT TEST 2">Unit Test 2</option>
                  <option value="HALF YEARLY">Half Yearly</option>
                  <option value="FINAL">Final Examination</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[3px] text-slate-500">Score Matrix</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  value={newResult.marks}
                  onChange={(e) => setNewResult({ ...newResult, marks: e.target.value })}
                  className="h-12 bg-slate-50 border-slate-100 rounded-xl text-center font-black"
                />
                <span className="text-slate-200 font-black">/</span>
                <Input
                  type="number"
                  value={newResult.total}
                  onChange={(e) => setNewResult({ ...newResult, total: e.target.value })}
                  className="h-12 bg-slate-50 border-slate-100 rounded-xl text-center font-black"
                />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="p-8 bg-slate-50 flex gap-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="flex-1 h-14 rounded-xl font-black uppercase text-[10px] tracking-widest border border-slate-100">Cancel</Button>
          <Button
            disabled={isSaving}
            onClick={handleSave}
            className="flex-1 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-100 transition-all active:scale-95 border-none"
          >
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            {isSaving ? "Establishing..." : "Establish Record"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
