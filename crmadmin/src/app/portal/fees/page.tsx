"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Bus,
  Save,
  Loader2,
  Plus,
  Trash2,
  Pencil,
  Sparkles,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  MapPin,
  X,
  Phone,
  Landmark,
  ShieldCheck,
  Award,
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import client from "@/lib/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WebsiteNavHeader } from "../components/WebsiteNavHeader";

interface FeeTier {
  id: number;
  wing: string;
  classes: string;
  quarterlyFee: string;
  monthlyEquiv: string;
  highlights: string[];
}

interface TransportRoute {
  id: number;
  routeName: string;
  distanceSlab: string;
  monthlyFee: string;
  pickupPoints: string;
  vehicleType: string;
}

const DEFAULT_FEE_TIERS: FeeTier[] = [
  {
    id: 1,
    wing: "Pre-Primary Wing",
    classes: "Nursery, LKG & UKG",
    quarterlyFee: "₹5,400",
    monthlyEquiv: "₹1,800 / month",
    highlights: ["Activity & Phonics Kit", "Smart Kindergarten Lab", "Indoor Play Arena", "Term Assessments Included"]
  },
  {
    id: 2,
    wing: "Primary Wing",
    classes: "Classes I to V",
    quarterlyFee: "₹6,600",
    monthlyEquiv: "₹2,200 / month",
    highlights: ["Experiential STEM Labs", "Junior Computer Labs", "Co-Curricular Clubs", "Library & Sports Access"]
  },
  {
    id: 3,
    wing: "Middle & Secondary",
    classes: "Classes VI to X",
    quarterlyFee: "₹8,400",
    monthlyEquiv: "₹2,800 / month",
    highlights: ["Science Composite Labs", "Python AI Robotics", "CBSE Registration Support", "Inter-School Sports Coaching"]
  },
  {
    id: 4,
    wing: "Senior Secondary",
    classes: "Classes XI & XII (All Streams)",
    quarterlyFee: "₹10,500",
    monthlyEquiv: "₹3,500 / month",
    highlights: ["Specialized PCB/PCM Labs", "Commerce & Computer Science", "Pre-Board Assessments", "Competitive Entrance Guidance"]
  }
];

const DEFAULT_TRANSPORT_ROUTES: TransportRoute[] = [
  {
    id: 1,
    routeName: "Route A — Local City Limits",
    distanceSlab: "0 – 5 km",
    monthlyFee: "₹800 / month",
    pickupPoints: "Civil Lines, Main Chowk, Station Road, Collectorate Colony",
    vehicleType: "Air-Cooled CCTV Bus"
  },
  {
    id: 2,
    routeName: "Route B — Nangli Pathwari & Mubarakpur",
    distanceSlab: "5 – 10 km",
    monthlyFee: "₹1,200 / month",
    pickupPoints: "Nangli Main Gate, Mubarakpur Navada, Sugar Mill Square",
    vehicleType: "GPS Monitored Mini-Bus"
  },
  {
    id: 3,
    routeName: "Route C — Noorpur & Kotwali Sector",
    distanceSlab: "10 – 15 km",
    monthlyFee: "₹1,500 / month",
    pickupPoints: "Noorpur Highway Crossing, Kotwali Village, Police Post",
    vehicleType: "Standard 42-Seater Bus"
  },
  {
    id: 4,
    routeName: "Route D — Outer Bijnor Belt",
    distanceSlab: "15 – 22 km",
    monthlyFee: "₹1,800 / month",
    pickupPoints: "Chandpur Link Road, Outer Bypass, Green Valley Enclave",
    vehicleType: "Dedicated School Bus"
  }
];

export default function FeeSettingsPage() {
  const queryClient = useQueryClient();
  const [showFeeStructure, setShowFeeStructure] = useState(true);
  const [showTransportSlabs, setShowTransportSlabs] = useState(true);
  const [sessionTag, setSessionTag] = useState("SESSION 2026-27");
  const [accountsPhone, setAccountsPhone] = useState("+91 73519 96239");
  const [accountsEmail, setAccountsEmail] = useState("accounts@sdmschool.in");
  const [bankDetails, setBankDetails] = useState({
    bankName: "State Bank of India (SBI)",
    accountName: "SDM PUBLIC SCHOOL",
    accountNumber: "389201928392",
    ifscCode: "SBIN0001234",
    upiId: "sdmschool@sbi"
  });

  const [feeTiers, setFeeTiers] = useState<FeeTier[]>(DEFAULT_FEE_TIERS);
  const [transportRoutes, setTransportRoutes] = useState<TransportRoute[]>(DEFAULT_TRANSPORT_ROUTES);

  // Modal states
  const [editingFee, setEditingFee] = useState<FeeTier | null>(null);
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [newFeeHighlight, setNewFeeHighlight] = useState("");

  const [editingRoute, setEditingRoute] = useState<TransportRoute | null>(null);
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["school-info"],
    queryFn: async () => {
      const res: any = await client.get("/settings/school-info");
      return res?.data || res || {};
    }
  });

  useEffect(() => {
    if (data?.fee_structure_config) {
      const cfg = data.fee_structure_config;
      if (typeof cfg.showFeeStructure === "boolean") setShowFeeStructure(cfg.showFeeStructure);
      if (typeof cfg.showTransportSlabs === "boolean") setShowTransportSlabs(cfg.showTransportSlabs);
      if (cfg.sessionTag) setSessionTag(cfg.sessionTag);
      if (cfg.accountsPhone) setAccountsPhone(cfg.accountsPhone);
      if (cfg.accountsEmail) setAccountsEmail(cfg.accountsEmail);
      if (cfg.bankDetails) setBankDetails((prev) => ({ ...prev, ...cfg.bankDetails }));
      if (Array.isArray(cfg.feeTiers) && cfg.feeTiers.length > 0) setFeeTiers(cfg.feeTiers);
      if (Array.isArray(cfg.transportRoutes) && cfg.transportRoutes.length > 0) setTransportRoutes(cfg.transportRoutes);
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      return client.put("/settings/school-info", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school-info"] });
      window.dispatchEvent(new Event("school-info-updated"));
      toast.success("Fee Structure & Transport Slabs saved successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to save fee settings");
    }
  });

  const handleSave = () => {
    saveMutation.mutate({
      fee_structure_config: {
        showFeeStructure,
        showTransportSlabs,
        sessionTag,
        accountsPhone,
        accountsEmail,
        bankDetails,
        feeTiers,
        transportRoutes
      }
    });
  };

  // Fee Tier Handlers
  const openAddFeeModal = () => {
    setEditingFee({
      id: Date.now(),
      wing: "Primary Wing",
      classes: "Classes I to V",
      quarterlyFee: "₹6,000",
      monthlyEquiv: "₹2,000 / month",
      highlights: ["Digital Classroom", "Computer Lab Access", "Sports & Library"]
    });
    setIsFeeModalOpen(true);
  };

  const saveFeeFromModal = () => {
    if (!editingFee || !editingFee.wing.trim()) {
      toast.error("Please enter Wing Name");
      return;
    }
    const idx = feeTiers.findIndex((t) => t.id === editingFee.id);
    if (idx >= 0) {
      const updated = [...feeTiers];
      updated[idx] = editingFee;
      setFeeTiers(updated);
    } else {
      setFeeTiers([...feeTiers, editingFee]);
    }
    setIsFeeModalOpen(false);
    setEditingFee(null);
    toast.success("Fee tier updated! Click 'Save Fee Settings' to publish.");
  };

  const deleteFeeTier = (id: number) => {
    setFeeTiers(feeTiers.filter((t) => t.id !== id));
    toast.success("Fee tier removed");
  };

  // Transport Route Handlers
  const openAddRouteModal = () => {
    setEditingRoute({
      id: Date.now(),
      routeName: "New Transport Route",
      distanceSlab: "5 – 10 km",
      monthlyFee: "₹1,000 / month",
      pickupPoints: "Key Village / Colony Stops",
      vehicleType: "CCTV Bus"
    });
    setIsRouteModalOpen(true);
  };

  const saveRouteFromModal = () => {
    if (!editingRoute || !editingRoute.routeName.trim()) {
      toast.error("Please enter Route Name");
      return;
    }
    const idx = transportRoutes.findIndex((r) => r.id === editingRoute.id);
    if (idx >= 0) {
      const updated = [...transportRoutes];
      updated[idx] = editingRoute;
      setTransportRoutes(updated);
    } else {
      setTransportRoutes([...transportRoutes, editingRoute]);
    }
    setIsRouteModalOpen(false);
    setEditingRoute(null);
    toast.success("Transport route updated! Click 'Save Fee Settings' to publish.");
  };

  const deleteRoute = (id: number) => {
    setTransportRoutes(transportRoutes.filter((r) => r.id !== id));
    toast.success("Transport route removed");
  };

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="animate-spin text-blue-600 h-8 w-8" />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Loading Fee Console...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50/50 min-h-screen">
      <WebsiteNavHeader
        title="Fee Structure & Transport Slabs CMS"
        description="Configure public website class-wise tuition fees, quarterly installments, transport routes, and visibility switches."
        actionButton={
          <Button
            type="button"
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer"
          >
            {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Fee Settings
          </Button>
        }
      />

      {/* ── VISIBILITY SWITCHES & CONTROLS ── */}
      <div className="grid sm:grid-cols-2 gap-6">
        <Card className="border-slate-200/80 rounded-3xl bg-white shadow-xs p-6 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CreditCard size={18} className="text-blue-600" />
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">Public Fee Structure Table</h4>
            </div>
            <p className="text-xs text-slate-500">
              {showFeeStructure ? "Fee tables are visible publicly to website visitors" : "Fee tables are hidden (Visitors are directed to contact Accounts Desk)"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowFeeStructure(!showFeeStructure)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer"
          >
            {showFeeStructure ? <ToggleRight size={22} className="text-emerald-600" /> : <ToggleLeft size={22} className="text-slate-400" />}
            <span>{showFeeStructure ? "Visible" : "Hidden"}</span>
          </button>
        </Card>

        <Card className="border-slate-200/80 rounded-3xl bg-white shadow-xs p-6 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Bus size={18} className="text-blue-600" />
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">Transport Route & Bus Fees</h4>
            </div>
            <p className="text-xs text-slate-500">
              {showTransportSlabs ? "Transport route slabs & monthly bus charges are visible" : "Transport charges are hidden on public website"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowTransportSlabs(!showTransportSlabs)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer"
          >
            {showTransportSlabs ? <ToggleRight size={22} className="text-emerald-600" /> : <ToggleLeft size={22} className="text-slate-400" />}
            <span>{showTransportSlabs ? "Visible" : "Hidden"}</span>
          </button>
        </Card>
      </div>

      {/* ── CLASS-WISE FEE TIERS REGISTRY ── */}
      <Card className="shadow-sm border-slate-200/80 rounded-3xl overflow-hidden bg-white">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <CreditCard size={16} className="text-blue-600" />
              Class-Wise Fee Tiers ({feeTiers.length})
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">Quarterly & monthly tuition slabs by academic wing</p>
          </div>
          <Button
            type="button"
            onClick={openAddFeeModal}
            className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus size={14} /> Add Fee Tier
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {feeTiers.map((tier) => (
              <div
                key={tier.id}
                className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/40 hover:bg-white hover:border-blue-300 transition-all space-y-3 relative group flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                      {tier.wing}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingFee({ ...tier, highlights: [...tier.highlights] });
                          setIsFeeModalOpen(true);
                        }}
                        className="p-1 text-slate-400 hover:text-blue-600 rounded-md"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteFeeTier(tier.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-md"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">{tier.classes}</h4>
                  <div className="p-3 bg-white rounded-xl border border-slate-200/70">
                    <p className="text-xl font-black text-slate-900">{tier.quarterlyFee}</p>
                    <p className="text-[10px] text-slate-500 font-semibold">{tier.monthlyEquiv}</p>
                  </div>
                  <ul className="space-y-1 pt-1">
                    {tier.highlights.map((h, hIdx) => (
                      <li key={hIdx} className="text-[11px] text-slate-600 flex items-center gap-1.5">
                        <CheckCircle2 size={11} className="text-emerald-500 shrink-0" />
                        <span className="truncate">{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── TRANSPORT ROUTES & BUS FEES REGISTRY ── */}
      <Card className="shadow-sm border-slate-200/80 rounded-3xl overflow-hidden bg-white">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Bus size={16} className="text-blue-600" />
              Transport Route Slabs & Bus Fees ({transportRoutes.length})
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">Distance brackets, monthly transport fee, and key pickup locations</p>
          </div>
          <Button
            type="button"
            onClick={openAddRouteModal}
            className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus size={14} /> Add Route Slab
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-4">
            {transportRoutes.map((route) => (
              <div
                key={route.id}
                className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/40 hover:bg-white hover:border-blue-300 transition-all space-y-2 relative group flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">{route.routeName}</h4>
                      <Badge variant="outline" className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border-emerald-200">
                        {route.distanceSlab}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingRoute({ ...route });
                          setIsRouteModalOpen(true);
                        }}
                        className="p-1 text-slate-400 hover:text-blue-600 rounded-md"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteRoute(route.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-md"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200/70">
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Monthly Bus Fee</p>
                      <p className="text-lg font-black text-slate-900">{route.monthlyFee}</p>
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {route.vehicleType}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    <strong className="text-slate-800 font-semibold">Stops:</strong> {route.pickupPoints}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── BANK DETAILS & ACCOUNTS HELPDESK ── */}
      <Card className="shadow-sm border-slate-200/80 rounded-3xl overflow-hidden bg-white">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
          <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Landmark size={16} className="text-blue-600" />
            Official Accounts & Online Payment Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-600 mb-1 block">Bank Name</label>
              <Input
                value={bankDetails.bankName}
                onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                placeholder="State Bank of India"
                className="h-9 rounded-xl"
              />
            </div>
            <div>
              <label className="font-bold text-slate-600 mb-1 block">Account Number</label>
              <Input
                value={bankDetails.accountNumber}
                onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                placeholder="12-16 digit account number"
                className="h-9 rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="font-bold text-slate-600 mb-1 block">IFSC Code</label>
              <Input
                value={bankDetails.ifscCode}
                onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value })}
                placeholder="SBIN0001234"
                className="h-9 rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="font-bold text-slate-600 mb-1 block">UPI ID / QR Handle</label>
              <Input
                value={bankDetails.upiId}
                onChange={(e) => setBankDetails({ ...bankDetails, upiId: e.target.value })}
                placeholder="sdmschool@sbi"
                className="h-9 rounded-xl"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── EDIT FEE MODAL ── */}
      {isFeeModalOpen && editingFee && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-sm uppercase">Edit Class Fee Tier</h3>
              <button onClick={() => setIsFeeModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Wing Name</label>
                <Input
                  value={editingFee.wing}
                  onChange={(e) => setEditingFee({ ...editingFee, wing: e.target.value })}
                  placeholder="e.g. Primary Wing"
                  className="h-9 rounded-xl"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Classes Covered</label>
                <Input
                  value={editingFee.classes}
                  onChange={(e) => setEditingFee({ ...editingFee, classes: e.target.value })}
                  placeholder="e.g. Classes I to V"
                  className="h-9 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Quarterly Fee</label>
                  <Input
                    value={editingFee.quarterlyFee}
                    onChange={(e) => setEditingFee({ ...editingFee, quarterlyFee: e.target.value })}
                    placeholder="₹6,600"
                    className="h-9 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Monthly Equivalent</label>
                  <Input
                    value={editingFee.monthlyEquiv}
                    onChange={(e) => setEditingFee({ ...editingFee, monthlyEquiv: e.target.value })}
                    placeholder="₹2,200 / month"
                    className="h-9 rounded-xl"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="outline" onClick={() => setIsFeeModalOpen(false)} className="h-9 text-xs rounded-xl">
                Cancel
              </Button>
              <Button onClick={saveFeeFromModal} className="h-9 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                Update Fee Tier
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT TRANSPORT ROUTE MODAL ── */}
      {isRouteModalOpen && editingRoute && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-sm uppercase">Edit Transport Route</h3>
              <button onClick={() => setIsRouteModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Route Name</label>
                <Input
                  value={editingRoute.routeName}
                  onChange={(e) => setEditingRoute({ ...editingRoute, routeName: e.target.value })}
                  placeholder="e.g. Route A — Local City Limits"
                  className="h-9 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Distance Bracket</label>
                  <Input
                    value={editingRoute.distanceSlab}
                    onChange={(e) => setEditingRoute({ ...editingRoute, distanceSlab: e.target.value })}
                    placeholder="0 – 5 km"
                    className="h-9 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Monthly Bus Fee</label>
                  <Input
                    value={editingRoute.monthlyFee}
                    onChange={(e) => setEditingRoute({ ...editingRoute, monthlyFee: e.target.value })}
                    placeholder="₹800 / month"
                    className="h-9 rounded-xl"
                  />
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Key Stops & Coverage Points</label>
                <textarea
                  value={editingRoute.pickupPoints}
                  onChange={(e) => setEditingRoute({ ...editingRoute, pickupPoints: e.target.value })}
                  placeholder="Colony, village, and landmark stops..."
                  rows={2}
                  className="w-full p-2 rounded-xl border border-slate-200"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="outline" onClick={() => setIsRouteModalOpen(false)} className="h-9 text-xs rounded-xl">
                Cancel
              </Button>
              <Button onClick={saveRouteFromModal} className="h-9 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                Update Transport Route
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
