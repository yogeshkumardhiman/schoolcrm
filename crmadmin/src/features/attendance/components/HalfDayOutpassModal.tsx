"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  User,
  Phone,
  CheckCircle2,
  X,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";

interface HalfDayOutpassModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: any | null;
  onConfirm: (data: {
    studentId: number;
    departureTime: string;
    reason: string;
    pickedBy: string;
    phone: string;
  }) => void;
  initialData?: {
    departureTime?: string;
    remarks?: string;
  };
}

const QUICK_REASONS = [
  "Sudden Illness / High Fever",
  "Medical / Doctor Appointment",
  "Urgent Domestic / Family Emergency",
  "Parent Early Pick-Up",
  "Official Competition / Sports Event",
];

export function HalfDayOutpassModal({
  isOpen,
  onClose,
  student,
  onConfirm,
  initialData,
}: HalfDayOutpassModalProps) {
  // Format current live time in hh:mm AM/PM
  const getCurrentFormattedTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const [departureTime, setDepartureTime] = useState(
    initialData?.departureTime || getCurrentFormattedTime()
  );
  const [reason, setReason] = useState("");
  const [pickedBy, setPickedBy] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (isOpen && student) {
      setDepartureTime(initialData?.departureTime || getCurrentFormattedTime());
      setReason(initialData?.remarks || "Sudden Illness / High Fever");
      setPickedBy(student.fatherName ? `${student.fatherName} (Father)` : "Parent / Guardian");
      setPhone(student.phone || student.guardianPhone || "");
    }
  }, [isOpen, student, initialData]);

  if (!isOpen || !student) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!departureTime.trim()) {
      toast.error("Please enter the departure time.");
      return;
    }
    if (!reason.trim()) {
      toast.error("Please enter the reason for early departure.");
      return;
    }

    onConfirm({
      studentId: student.id,
      departureTime,
      reason,
      pickedBy,
      phone,
    });
    toast.success(`Half Day recorded for ${student.name}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="max-w-lg w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-inner">
                <Clock size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight text-white font-heading">
                  Student Half-Day Outpass
                </h3>
                <p className="text-xs text-purple-100 font-medium">
                  Record early departure time and verify guardian.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Student Banner */}
          <div className="mt-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 flex items-center justify-between text-xs">
            <div>
              <p className="font-extrabold text-white text-sm">{student.name}</p>
              <p className="text-purple-200 text-[11px] font-semibold">
                Class: <span className="text-white font-bold">{student.class}-{student.section || "A"}</span> • Roll: <span className="text-white font-bold">#{student.rollNo || "—"}</span>
              </p>
            </div>
            <Badge className="bg-white text-purple-900 font-black text-[10px] uppercase tracking-wider py-1 px-2.5 rounded-lg shadow-sm">
              #{student.admissionNo || "ADM"}
            </Badge>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Departure Time */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Clock size={13} className="text-purple-600" /> Exact Departure Time (School Exit)
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="text"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                placeholder="e.g. 11:30 AM"
                className="h-11 font-black text-slate-900 text-sm rounded-xl border-slate-200 focus:ring-purple-500"
                required
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setDepartureTime(getCurrentFormattedTime())}
                className="h-11 px-4 text-xs font-bold rounded-xl border-slate-200 text-purple-700 hover:bg-purple-50 shrink-0 cursor-pointer"
              >
                Set Now
              </Button>
            </div>
          </div>

          {/* Reason for Early Departure */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle size={13} className="text-purple-600" /> Reason for Early Leave
            </label>
            
            {/* Quick Reason Pills */}
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              {QUICK_REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className={`text-[10px] font-bold py-1 px-2.5 rounded-lg border transition-all cursor-pointer ${
                    reason === r
                      ? "bg-purple-100 text-purple-800 border-purple-300 font-black shadow-xs"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="State reason for early departure..."
              className="h-10 text-xs font-semibold rounded-xl border-slate-200"
              required
            />
          </div>

          {/* Picked up by / Guardian Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <User size={12} className="text-slate-400" /> Picked Up By
              </label>
              <Input
                value={pickedBy}
                onChange={(e) => setPickedBy(e.target.value)}
                placeholder="Father / Mother / Guardian"
                className="h-10 text-xs font-bold rounded-xl border-slate-200"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Phone size={12} className="text-slate-400" /> Contact Phone
              </label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                className="h-10 text-xs font-mono font-bold rounded-xl border-slate-200"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-11 px-5 rounded-xl border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              className="h-11 px-6 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <CheckCircle2 size={16} /> Confirm Half-Day (HD)
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
