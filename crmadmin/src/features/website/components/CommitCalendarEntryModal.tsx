"use client";

import React, { useState, useEffect } from "react";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Tag, 
  FileText, 
  Loader2, 
  Sparkles,
  Sun,
  BookOpen,
  PartyPopper,
  Trophy,
  Star,
  Briefcase,
  Snowflake,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/dialogbox/dialog";

interface CommitCalendarEntryModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingEvent?: any;
  selectedDateStr?: string;
  onSubmit?: (data: any) => void;
  isPending?: boolean;
}

const EVENT_CATEGORIES = [
  { value: "EVENT", label: "School Event", color: "#8B5CF6", icon: PartyPopper },
  { value: "HOLIDAY", label: "School Holiday", color: "#EF4444", icon: Sun },
  { value: "GOVT_HOLIDAY", label: "Govt / Public Holiday", color: "#F59E0B", icon: Sun },
  { value: "EXAM", label: "Examination / Assessment", color: "#F97316", icon: BookOpen },
  { value: "SPORTS", label: "Sports & Athletics", color: "#10B981", icon: Trophy },
  { value: "CULTURAL", label: "Cultural & Celebrations", color: "#EC4899", icon: Star },
  { value: "MEETING", label: "PTM / Meeting", color: "#6366F1", icon: Briefcase },
  { value: "VACATION", label: "Vacation Break", color: "#06B6D4", icon: Snowflake },
];

export default function CommitCalendarEntryModal({
  isOpen,
  onOpenChange,
  editingEvent,
  selectedDateStr,
  onSubmit,
  isPending
}: CommitCalendarEntryModalProps) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("EVENT");
  const [date, setDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [time, setTime] = useState("09:00 AM - 02:00 PM");
  const [location, setLocation] = useState("School Campus");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#8B5CF6");

  // Populate fields on edit or date selection
  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title || "");
      setType(editingEvent.type || "EVENT");
      setDate(editingEvent.date || selectedDateStr || "");
      setEndDate(editingEvent.endDate || editingEvent.date || selectedDateStr || "");
      setTime(editingEvent.time || "09:00 AM - 02:00 PM");
      setLocation(editingEvent.location || "School Campus");
      setDescription(editingEvent.description || editingEvent.content || "");
      setColor(editingEvent.color || "#8B5CF6");
    } else {
      const defaultDate = selectedDateStr || new Date().toISOString().split("T")[0];
      setTitle("");
      setType("EVENT");
      setDate(defaultDate);
      setEndDate(defaultDate);
      setTime("09:00 AM - 02:00 PM");
      setLocation("School Campus");
      setDescription("");
      setColor("#8B5CF6");
    }
  }, [editingEvent, selectedDateStr, isOpen]);

  const handleTypeChange = (newType: string) => {
    setType(newType);
    const matched = EVENT_CATEGORIES.find((c) => c.value === newType);
    if (matched) {
      setColor(matched.color);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit?.({
      title: title.trim(),
      type,
      date,
      endDate: endDate || date,
      time,
      location,
      description: description.trim(),
      color
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] max-h-[92vh] overflow-y-auto p-0 rounded-3xl border border-slate-200">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="p-6 border-b border-slate-100 bg-slate-50/70">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2.5 text-base font-black text-slate-900 uppercase tracking-wider">
                <div className="h-8 w-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <CalendarIcon size={18} />
                </div>
                {editingEvent ? "Edit Calendar Entry" : "Schedule New Academic Event"}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 font-medium mt-1">
                Publish or update an event displayed on the Academic Calendar and Public Website.
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Form Fields */}
          <div className="p-6 space-y-4 text-xs font-medium">
            
            {/* Event Title */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                Event Title <span className="text-rose-500">*</span>
              </Label>
              <Input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Independence Day Celebration, Half Yearly Exams, Sports Meet"
                className="h-10 rounded-xl font-bold text-xs bg-white border-slate-200 focus:border-indigo-500"
              />
            </div>

            {/* Event Category / Type */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Tag size={13} className="text-indigo-600" />
                Event Category / Classification
              </Label>
              <select
                value={type}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 cursor-pointer uppercase tracking-wider"
              >
                {EVENT_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range: Start Date & End Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-black uppercase tracking-wider text-slate-600">
                  Start Date <span className="text-rose-500">*</span>
                </Label>
                <Input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-10 rounded-xl text-xs font-bold bg-white border-slate-200"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-black uppercase tracking-wider text-slate-600">
                  End Date (Optional for spans)
                </Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-10 rounded-xl text-xs font-bold bg-white border-slate-200"
                />
              </div>
            </div>

            {/* Time & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1">
                  <Clock size={12} className="text-slate-400" />
                  Timings / Hours
                </Label>
                <Input
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="e.g. 09:00 AM - 01:30 PM"
                  className="h-10 rounded-xl text-xs bg-white border-slate-200"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1">
                  <MapPin size={12} className="text-slate-400" />
                  Location / Venue
                </Label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Main Ground, Auditorium, All Wings"
                  className="h-10 rounded-xl text-xs bg-white border-slate-200"
                />
              </div>
            </div>

            {/* Description / Circular Text */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1">
                <FileText size={12} className="text-slate-400" />
                Event Description & Notes
              </Label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide event details, instructions for parents/students, or agenda..."
                rows={3}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:border-indigo-500 focus:outline-none transition resize-none"
              />
            </div>

          </div>

          {/* Footer */}
          <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50/70 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl border-slate-200 text-slate-600 text-xs font-bold uppercase px-4 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !title.trim()}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider px-6 shadow-md shadow-indigo-500/20 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                editingEvent ? "Update Event" : "Publish Event"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
