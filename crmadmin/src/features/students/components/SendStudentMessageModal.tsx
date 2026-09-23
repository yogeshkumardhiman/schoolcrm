"use client";

import React, { useState, useEffect } from "react";
import { Mail, Loader2 } from "lucide-react";
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

interface SendStudentMessageModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  studentName: string;
  studentClass: string;
  studentSection: string;
  studentId?: string;
  defaultTitle?: string;
}

export default function SendStudentMessageModal({
  isOpen,
  onOpenChange,
  studentName,
  studentClass,
  studentSection,
  studentId,
  defaultTitle
}: SendStudentMessageModalProps) {
  const [messageTitle, setMessageTitle] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMessageTitle(defaultTitle || `Personal Notice: ${studentName}`);
      setMessageBody("");
    }
  }, [isOpen, defaultTitle, studentName]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageTitle || !messageBody) {
      toast.error("Please fill in both the notice subject and message body.");
      return;
    }

    setSendingMessage(true);
    try {
      await client.post('/website/notices', {
        title: messageTitle,
        content: messageBody,
        targetRole: "STUDENT",
        studentId: studentId ? String(studentId) : undefined
      });
      toast.success("Personal notice dispatched successfully.");
      onOpenChange(false);
      setMessageTitle("");
      setMessageBody("");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to dispatch notice. Please check your network connectivity or administrator permissions.");
    } finally {
      setSendingMessage(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl border-none shadow-2xl rounded-lgxl p-0 overflow-hidden bg-white">
        <DialogHeader className="bg-slate-950 p-8 text-white">
          <DialogTitle className="text-xl font-black uppercase  tracking-tighter flex items-center gap-2">
            <Mail className="h-5 w-5 text-indigo-400 animate-pulse" /> Direct Correspondence
          </DialogTitle>
          <DialogDescription className="text-indigo-300 text-[10px] font-black uppercase tracking-widest mt-2">
            Send a personal notice to {studentName}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSendMessage}>
          <div className="p-8 space-y-6">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[3px] text-slate-500">Notice Subject</Label>
              <Input
                placeholder="E.G. ATTENDANCE ALERT / PAYMENT REMINDER"
                value={messageTitle}
                onChange={(e) => setMessageTitle(e.target.value)}
                className="h-12 bg-slate-50 border-slate-100 rounded-xl font-bold text-sm focus:ring-4 focus:ring-indigo-50 transition-all"
                required
              />
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[3px] text-slate-500">Notice Payload (Body)</Label>
              <textarea
                placeholder="Type your message details here..."
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                className="w-full h-32 bg-slate-50 border border-slate-100 p-4 rounded-xl font-medium text-sm outline-none focus:ring-4 focus:ring-indigo-50 transition-all resize-none"
                required
              />
            </div>
          </div>
          <DialogFooter className="p-8 bg-slate-50 flex gap-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="flex-1 h-14 rounded-xl font-black uppercase text-[10px] tracking-widest border border-slate-100">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={sendingMessage}
              className="flex-1 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-100 transition-all active:scale-95 border-none flex items-center justify-center gap-2"
            >
              {sendingMessage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              {sendingMessage ? "Dispatching..." : "Send Message"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
