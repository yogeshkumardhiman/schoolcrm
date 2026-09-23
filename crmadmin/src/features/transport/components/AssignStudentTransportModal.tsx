"use client";

import React, { useState, useEffect } from "react";
import { Bus, Loader2, ShieldCheck } from "lucide-react";
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
import client from "@/lib/client";
import toast from "react-hot-toast";

interface AssignStudentTransportModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  student: any;
  onSuccess: () => void;
}

export default function AssignStudentTransportModal({
  isOpen,
  onOpenChange,
  student,
  onSuccess
}: AssignStudentTransportModalProps) {
  const [routes, setRoutes] = useState<any[]>([]);
  const [stops, setStops] = useState<any[]>([]);
  const [loadingTransport, setLoadingTransport] = useState(false);
  const [isTransportEnabled, setIsTransportEnabled] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState<string>("");
  const [selectedStopId, setSelectedStopId] = useState<string>("");
  const [savingTransport, setSavingTransport] = useState(false);

  useEffect(() => {
    if (isOpen && student) {
      setIsTransportEnabled(student.transportOpted || student.usesTransport || false);
      setSelectedRouteId(student.transportRouteId?.toString() || "");
      setSelectedStopId(student.transportStopId?.toString() || "");
      fetchTransportData();
    }
  }, [isOpen, student]);

  const fetchTransportData = async () => {
    setLoadingTransport(true);
    try {
      const [rData, sData] = await Promise.all([
        client.get('/transport/routes'),
        client.get('/transport/stops')
      ]);
      setRoutes(rData);
      setStops(sData);
    } catch {
      toast.error("Failed to load routes");
    } finally {
      setLoadingTransport(false);
    }
  };

  const handleSaveTransport = async () => {
    if (!student) return;
    setSavingTransport(true);
    try {
      await client.put(`/students/${student.id || student._id}`, {
        transportOpted: isTransportEnabled,
        transportRouteId: isTransportEnabled ? (selectedRouteId ? Number(selectedRouteId) : null) : null,
        transportStopId: isTransportEnabled ? (selectedStopId ? Number(selectedStopId) : null) : null
      });
      toast.success("Logistic Matrix Updated Successfully!");
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error("Failed to update transport assignment. Please verify your connection and try again.");
    } finally {
      setSavingTransport(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-none shadow-2xl rounded-lgxl p-0 overflow-hidden bg-white animate-in zoom-in-95 duration-300">
        <DialogHeader className="bg-slate-950 p-8 text-white">
          <DialogTitle className="text-xl font-black uppercase  tracking-tighter flex items-center gap-2">
            <Bus className="h-5 w-5 text-indigo-400" /> Logistic Management Matrix
          </DialogTitle>
          <DialogDescription className="text-indigo-300 text-[10px] font-black uppercase tracking-widest mt-2">
            Configure transport routing parameters for {student?.name}
          </DialogDescription>
        </DialogHeader>

        {loadingTransport ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Synchronizing Routing Ledger...</p>
          </div>
        ) : (
          <div className="p-8 space-y-6">
            {/* Toggle Enable Transport */}
            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl">
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-700 block">Opt for School Transport</label>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight block mt-0.5">Enable or disable transit service status</span>
              </div>
              <button
                type="button"
                onClick={() => setIsTransportEnabled(!isTransportEnabled)}
                className={cn(
                  "h-6 w-11 rounded-full transition-all relative p-1 shrink-0",
                  isTransportEnabled ? "bg-indigo-600" : "bg-slate-200"
                )}
              >
                <div className={cn("h-4 w-4 bg-white rounded-full transition-all shadow-sm", isTransportEnabled ? "translate-x-5" : "translate-x-0")} />
              </button>
            </div>

            {isTransportEnabled && (
              <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
                {/* Route Dropdown */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Select Transit Route</label>
                  <select
                    value={selectedRouteId}
                    onChange={(e) => {
                      setSelectedRouteId(e.target.value);
                      setSelectedStopId(""); // Reset stop selection on route change
                    }}
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-black uppercase tracking-wider outline-none focus:ring-4 focus:ring-indigo-50 transition-all cursor-pointer"
                  >
                    <option value="">-- Choose Route --</option>
                    {routes.map((r: any) => (
                      <option key={r.id} value={r.id}>{r.routeName} ({r.busNumber || "No Bus"})</option>
                    ))}
                  </select>
                </div>

                {/* Stop Dropdown */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Select Transit Stop & Fee</label>
                  <select
                    value={selectedStopId}
                    disabled={!selectedRouteId}
                    onChange={(e) => setSelectedStopId(e.target.value)}
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-black uppercase tracking-wider outline-none focus:ring-4 focus:ring-indigo-50 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <option value="">-- Choose Stop --</option>
                    {stops.filter(s => !selectedRouteId || s.routeId?.toString() === selectedRouteId).map((s: any) => (
                      <option key={s.id} value={s.id}>{s.stopName} (₹{s.fee}/month)</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="p-6 bg-slate-50 flex gap-4 border-t">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={() => onOpenChange(false)} 
            className="flex-1 h-12 rounded-xl font-black uppercase text-[10px] tracking-widest border border-slate-200 hover:bg-slate-100"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={savingTransport || loadingTransport}
            onClick={handleSaveTransport}
            className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-100 transition-all active:scale-95 border-none flex items-center justify-center gap-2"
          >
            {savingTransport ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            {savingTransport ? "Saving Settings..." : "Save Configuration"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
