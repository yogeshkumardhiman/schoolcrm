"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/dialogbox/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  KeyRound,
  Mail,
  Copy,
  Check,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  ShieldAlert,
  Send
} from "lucide-react";
import client from "@/lib/client";
import toast from "react-hot-toast";

interface ResetStaffPasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  staff: {
    id: string | number;
    name: string;
    email?: string;
    loginId?: string;
    role?: string;
    designation?: string;
  } | null;
}

export function ResetStaffPasswordDialog({
  isOpen,
  onClose,
  staff,
}: ResetStaffPasswordDialogProps) {
  const [autoGenerate, setAutoGenerate] = useState(true);
  const [customPassword, setCustomPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<{
    temporaryPassword: string;
    emailSent: boolean;
    message: string;
  } | null>(null);

  const handleClose = () => {
    setAutoGenerate(true);
    setCustomPassword("");
    setResult(null);
    setCopied(false);
    onClose();
  };

  const handleReset = async () => {
    if (!staff?.id) return;
    if (!staff.email) {
      toast.error("This faculty member does not have an email registered. Please edit their profile first.");
      return;
    }

    if (!autoGenerate && customPassword.trim().length < 6) {
      toast.error("Custom password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = autoGenerate ? {} : { password: customPassword.trim() };
      const res: any = await client.post(`/staff/${staff.id}/reset-password`, payload);

      setResult({
        temporaryPassword: res.temporaryPassword || customPassword,
        emailSent: Boolean(res.emailSent),
        message: res.message || "Password reset successfully.",
      });

      if (res.emailSent) {
        toast.success(`Password reset & credentials emailed to ${staff.email}!`);
      } else {
        toast((t) => (
          <span>
            ⚠ Password updated, but email dispatch failed. Copy temporary password below.
          </span>
        ), { icon: "⚠️" });
      }
    } catch (err: any) {
      console.error("Password reset error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to reset faculty password.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = () => {
    if (!result?.temporaryPassword) return;
    navigator.clipboard.writeText(result.temporaryPassword);
    setCopied(true);
    toast.success("Password copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  if (!staff) return null;

  const hasEmail = Boolean(staff.email && staff.email.trim());

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md rounded-3xl border border-slate-100 shadow-2xl p-6 bg-white overflow-hidden">
        <DialogHeader className="space-y-2 text-left">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shadow-xs">
              <KeyRound size={20} />
            </div>
            <div>
              <DialogTitle className="text-base font-black text-slate-900 uppercase tracking-tight font-heading">
                Reset Faculty Password
              </DialogTitle>
              <DialogDescription className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Authentication & Email Dispatch
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Success View */}
        {result ? (
          <div className="space-y-5 py-2">
            <div className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
              result.emailSent
                ? "bg-emerald-50/80 border-emerald-200 text-emerald-900"
                : "bg-amber-50/80 border-amber-200 text-amber-900"
            }`}>
              {result.emailSent ? (
                <CheckCircle2 className="text-emerald-600 shrink-0 mt-0.5" size={20} />
              ) : (
                <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} />
              )}
              <div className="text-xs space-y-1">
                <p className="font-bold">
                  {result.emailSent
                    ? "Credentials Dispatched Successfully!"
                    : "Password Reset in Database"}
                </p>
                <p className="text-[11px] opacity-90 leading-relaxed">
                  {result.emailSent
                    ? `An automated email with updated login credentials was dispatched to ${staff.email}.`
                    : `Password was updated. However, SMTP email delivery failed. You can copy the temporary password below to share manually.`}
                </p>
              </div>
            </div>

            {/* Credential Card */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 shadow-md">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
                <span>Account Credentials</span>
                <span className="text-indigo-400">{staff.role || "FACULTY"}</span>
              </div>

              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400 font-sans text-[11px]">Login ID / Email:</span>
                  <span className="font-bold text-indigo-200">{staff.loginId || staff.email}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-slate-800">
                  <span className="text-slate-400 font-sans text-[11px]">New Password:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-amber-300 tracking-wider text-sm">
                      {result.temporaryPassword}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleCopy}
                      className="h-7 px-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
                    >
                      {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button
                onClick={handleClose}
                className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider shadow-sm"
              >
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : (
          /* Form View */
          <div className="space-y-5 py-2">
            {/* Faculty Target Info */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-slate-900">{staff.name}</p>
                <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                  {staff.role || "TEACHER"} {staff.designation ? `• ${staff.designation}` : ""}
                </p>
                <div className="flex items-center gap-1.5 mt-1 text-[11px] font-medium text-slate-600">
                  <Mail size={12} className="text-slate-400" />
                  <span>{staff.email || "No email registered"}</span>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">
                {staff.loginId || "Auto ID"}
              </span>
            </div>

            {!hasEmail && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <ShieldAlert size={16} className="text-rose-600 shrink-0" />
                <span>
                  This faculty member has no registered email. Please add their email under Edit Faculty first.
                </span>
              </div>
            )}

            {/* Mode Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Password Option</span>
                <button
                  type="button"
                  onClick={() => setAutoGenerate(!autoGenerate)}
                  className="text-[11px] text-indigo-600 hover:underline font-bold"
                >
                  {autoGenerate ? "Set custom password" : "Auto-generate secure password"}
                </button>
              </div>

              {autoGenerate ? (
                <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-[11px] text-indigo-900 space-y-1">
                  <p className="font-bold">⚡ Secure Random Password</p>
                  <p className="text-slate-500">
                    A temporary 8-character password will be generated, hashed with bcrypt, and emailed along with access portal instructions.
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Input
                    type="text"
                    value={customPassword}
                    onChange={(e) => setCustomPassword(e.target.value)}
                    placeholder="Enter new password (min. 6 chars)"
                    className="h-10 text-xs rounded-xl"
                  />
                  <p className="text-[10px] text-slate-400">
                    This password will be securely hashed and dispatched via email.
                  </p>
                </div>
              )}
            </div>

            <DialogFooter className="flex gap-2.5 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="h-11 rounded-xl text-xs font-bold uppercase tracking-wider flex-1"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleReset}
                disabled={isSubmitting || !hasEmail}
                className="h-11 rounded-xl text-xs font-black uppercase tracking-wider bg-slate-900 hover:bg-slate-800 text-white flex-1 gap-2 shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Resetting...
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    Reset & Mail
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
