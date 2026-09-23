"use client";

import React, { useState } from 'react';
import {
  Sparkles, Save, ShieldAlert, Image as ImageIcon, Plus, Trash2, Edit2,
  Users, Check, X, Loader2, Palette, ShieldCheck, HelpCircle, Laptop,
  Settings2, Smartphone, AlertTriangle, Monitor, Upload, Search, Heart, Star
} from 'lucide-react';

import client from '@/lib/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/dialogbox/ConfirmDialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const BRAND_PRESET_GRADIENTS = [
  { name: "Classic Indigo", primary: "#6C63FF", secondary: "#8B5CF6" },
  { name: "Midnight Sapphire", primary: "#1E3A8A", secondary: "#3B82F6" },
  { name: "Ocean Emerald", primary: "#0D9488", secondary: "#10B981" },
  { name: "Sunset Crimson", primary: "#EF4444", secondary: "#F59E0B" },
  { name: "Royal Violet", primary: "#6D28D9", secondary: "#EC4899" },
  { name: "Nordic Slate", primary: "#374151", secondary: "#4B5563" },
  { name: "Forest Jade", primary: "#064E3B", secondary: "#059669" },
  { name: "Copper Amber", primary: "#B45309", secondary: "#D97706" },
  { name: "Sky Azure", primary: "#0284C7", secondary: "#38BDF8" },
  { name: "Rose Garden", primary: "#E11D48", secondary: "#FB7185" },
  { name: "Deep Navy", primary: "#0F172A", secondary: "#1E3A5F" },
  { name: "Mint Fresh", primary: "#047857", secondary: "#34D399" },
  { name: "Golden Harvest", primary: "#A16207", secondary: "#EAB308" },
  { name: "Berry Plum", primary: "#7E22CE", secondary: "#A855F7" },
  { name: "Coral Peach", primary: "#EA580C", secondary: "#FB923C" },
  { name: "Teal Ocean", primary: "#115E59", secondary: "#2DD4BF" },
  { name: "Cherry Blossom", primary: "#BE185D", secondary: "#F472B6" },
  { name: "Steel Blue", primary: "#1E40AF", secondary: "#60A5FA" },
];

const AVAILABLE_FEATURES = [
  { id: 'fees', label: 'Fees Module', description: 'Enable fee summary, invoices, and online transactions on student side.' },
  { id: 'homework', label: 'Homework Assignments', description: 'Allows teachers to assign and students to submit daily homework.' },
  { id: 'exams', label: 'Exams & Results', description: 'Enable exam schedules, report cards, and grades.' },
  { id: 'notice', label: 'Notice Board', description: 'Enable school-wide notices, filtering, and attachments.' },
  { id: 'timetable', label: 'Weekly Timetable', description: 'Show schedule matrix grids for students and teachers.' },
  { id: 'calendar', label: 'Events Calendar', description: 'Keep users updated with a gorgeous calendar of school holidays and activities.' },
  { id: 'helpdesk', label: 'Grievance Help Desk', description: 'Students can register issues directly to the administration.' },
  { id: 'profile', label: 'Student Profile Card', description: 'Enable premium visual profiles and identity badges.' }
];

export default function AppSettingsManager() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("branding");
  
  // Settings Form State
  const [settingsForm, setSettingsForm] = useState({
    school_name: '',
    app_title: '',
    primary_color: '#6C63FF',
    secondary_color: '#8B5CF6',
    logo_url: '',
    active_features: [] as string[],
    maintenance_mode: false,
    enableOnlinePayments: false,
    razorpayKeyId: '',
    razorpayKeySecret: '',
    emergency_alert: { active: false, title: '', message: '' },
    favorite_colors: [] as Array<{ name: string; primary: string; secondary: string; id: string }>
  });

  // Custom Favorite Name Input
  const [favoriteName, setFavoriteName] = useState('');

  // Banners Form State
  const [showAddBanner, setShowAddBanner] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const [bannerForm, setBannerForm] = useState({
    title: '',
    description: '',
    image_url: '',
    action_route: '',
    status: 'ACTIVE',
    display_order: 0
  });

  // Staff Search State
  const [staffSearch, setStaffSearch] = useState("");

  // Logo / Banner upload states
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  // Dialog State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<any | null>(null);

  // Queries
  const { data: settingsData, isLoading: isLoadingSettings } = useQuery<any>({
    queryKey: ['mobileSettings'],
    queryFn: async () => {
      const res = await client.get("/settings/config");
      if (res) {
        setSettingsForm({
          school_name: res.school_name || 'School Name',
          app_title: res.app_title || 'School App',
          primary_color: res.primary_color || '#6C63FF',
          secondary_color: res.secondary_color || '#8B5CF6',
          logo_url: res.logo_url || '',
          active_features: res.active_features || [],
          maintenance_mode: res.maintenance_mode || false,
          enableOnlinePayments: res.enableOnlinePayments || false,
          razorpayKeyId: res.razorpayKeyId || '',
          razorpayKeySecret: res.razorpayKeySecret || '',
          emergency_alert: res.emergency_alert || { active: false, title: '', message: '' },
          favorite_colors: res.favorite_colors || []
        });
      }
      return res;
    }
  });

  const { data: bannersData = [], isLoading: isLoadingBanners } = useQuery<any>({
    queryKey: ['appBanners'],
    queryFn: async () => {
      return client.get("/website/app-banners");
    }
  });

  const { data: staffData = [], isLoading: isLoadingStaff } = useQuery<any>({
    queryKey: ['staffList'],
    queryFn: async () => {
      return client.get("/staff");
    }
  });

  // Mutations
  const updateSettingsMutation = useMutation({
    mutationFn: (data: any) => client.put("/settings/config", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mobileSettings'] });
      toast.success("Application parameters synced successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.error || "Failed to sync settings.");
    }
  });

  const bannerMutation = useMutation({
    mutationFn: (data: any) => {
      if (editingBanner) return client.put(`/website/app-banners/${String(editingBanner.id)}`, data);
      return client.post("/website/app-banners", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appBanners'] });
      toast.success(editingBanner ? "Banner updated successfully" : "Banner created successfully");
      setShowAddBanner(false);
      setEditingBanner(null);
      setBannerForm({ title: '', description: '', image_url: '', action_route: '', status: 'ACTIVE', display_order: 0 });
    },
    onError: () => toast.error("Failed to save banner configurations.")
  });

  const deleteBannerMutation = useMutation({
    mutationFn: (id: string) => client.delete(`/website/app-banners/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appBanners'] });
      toast.success("Banner slide removed.");
    },
    onError: () => toast.error("Failed to delete banner.")
  });

  const delegateAccessMutation = useMutation({
    mutationFn: ({ id, canManage }: { id: string; canManage: boolean }) => 
      client.put(`/staff/${id}`, { can_manage_app_settings: canManage }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffList'] });
      toast.success("Staff privileges modified!");
    },
    onError: () => toast.error("Failed to update staff access.")
  });

  // Handle Logo Upload
  const handleLogoUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res: any = await client.upload("/upload?folder=branding", formData);
      if (res && res.url) {
        setSettingsForm(prev => ({ ...prev, logo_url: res.url }));
        toast.success("School logo uploaded!");
      }
    } catch (err: any) {
      toast.error(`Logo upload failed: ${err.message}`);
    } finally {
      setUploadingLogo(false);
    }
  };

  // Handle Banner Photo Upload
  const handleBannerUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingBanner(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res: any = await client.upload("/upload?folder=app-banners", formData);
      if (res && res.url) {
        setBannerForm(prev => ({ ...prev, image_url: res.url }));
        toast.success("Banner photo uploaded!");
      }
    } catch (err: any) {
      toast.error(`Banner upload failed: ${err.message}`);
    } finally {
      setUploadingBanner(false);
    }
  };

  // Toggles active features
  const handleFeatureToggle = (featureId: string) => {
    setSettingsForm(prev => {
      const current = [...prev.active_features];
      const index = current.indexOf(featureId);
      if (index > -1) {
        current.splice(index, 1);
      } else {
        current.push(featureId);
      }
      return { ...prev, active_features: current };
    });
  };

  const handleSaveSettings = (e: any) => {
    e.preventDefault();
    updateSettingsMutation.mutate(settingsForm);
  };

  const handleBannerSubmit = (e: any) => {
    e.preventDefault();
    if (!bannerForm.image_url) {
      toast.error("Banner image is required.");
      return;
    }
    bannerMutation.mutate(bannerForm);
  };

  const startEditBanner = (banner: any) => {
    setEditingBanner(banner);
    setBannerForm({
      title: banner.title || '',
      description: banner.description || '',
      image_url: banner.image_url || '',
      action_route: banner.action_route || '',
      status: banner.status || 'ACTIVE',
      display_order: banner.display_order || 0
    });
    setShowAddBanner(true);
  };

  const confirmDeleteBanner = (banner: any) => {
    setBannerToDelete(banner);
    setDeleteConfirmOpen(true);
  };

  // Staff Search Filter
  const filteredStaff = staffData.filter((s: any) => 
    String(s.name || '').toLowerCase().includes(staffSearch.toLowerCase()) ||
    String(s.email || '').toLowerCase().includes(staffSearch.toLowerCase())
  );

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50/50 min-h-screen">
      
      {/* 🏛️ HEADER */}
      <div className="flex items-center justify-between space-y-2 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <Smartphone className="text-indigo-600 animate-pulse" /> App Dynamics Console
          </h2>
          <p className="text-sm text-muted-foreground font-medium">Configure primary color themes, toggle active modules, and push banners directly to mobile apps in real time.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-xs uppercase px-3 py-1 flex items-center gap-1.5 shadow-none">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" /> Connection Stable
          </Badge>
        </div>
      </div>

      {/* 🧭 NAVIGATION TABS (POLISHED CUSTOM STATE-CONTROLLED TAB BAR) */}
      <div className="bg-slate-100 p-1.5 rounded-2xl w-full md:w-auto inline-flex flex-wrap gap-1.5 border border-slate-200/60 shadow-inner">
        <button
          type="button"
          onClick={() => setActiveTab('branding')}
          className={cn(
            "flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300",
            activeTab === 'branding' 
              ? "bg-white text-indigo-600 shadow-sm border border-slate-200/10" 
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
          )}
        >
          <Palette className="h-4 w-4" /> Branding Theme
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('features')}
          className={cn(
            "flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300",
            activeTab === 'features' 
              ? "bg-white text-indigo-600 shadow-sm border border-slate-200/10" 
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
          )}
        >
          <Settings2 className="h-4 w-4" /> Feature Controls
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('banners')}
          className={cn(
            "flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300",
            activeTab === 'banners' 
              ? "bg-white text-indigo-600 shadow-sm border border-slate-200/10" 
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
          )}
        >
          <ImageIcon className="h-4 w-4" /> Banner Sliders
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('delegation')}
          className={cn(
            "flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300",
            activeTab === 'delegation' 
              ? "bg-white text-indigo-600 shadow-sm border border-slate-200/10" 
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
          )}
        >
          <Users className="h-4 w-4" /> Staff Privileges
        </button>
      </div>

      {/* 🎨 BRANDING & THEME TAB */}
      {activeTab === 'branding' && (
        <div className="animate-in fade-in duration-300">
          <form onSubmit={handleSaveSettings} className="grid md:grid-cols-3 gap-6">
            
            <div className="md:col-span-2 space-y-6">
              <Card className="shadow-sm border-slate-200 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <Palette className="text-indigo-600 h-5 w-5" /> Theme Configurations
                  </CardTitle>
                  <CardDescription>Customize primary visual accents, buttons, headers, and backgrounds.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* PRESET THEMES SELECTION GRID */}
                  <div className="space-y-3 pb-6 border-b border-slate-100">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">
                      🎨 Choose a Theme ({BRAND_PRESET_GRADIENTS.length} Presets — Click to Select)
                    </label>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2.5">
                      {BRAND_PRESET_GRADIENTS.map((preset) => {
                        const isSelected = 
                          settingsForm.primary_color.toUpperCase() === preset.primary.toUpperCase() && 
                          settingsForm.secondary_color.toUpperCase() === preset.secondary.toUpperCase();
                        
                        return (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => setSettingsForm(prev => ({
                              ...prev,
                              primary_color: preset.primary,
                              secondary_color: preset.secondary
                            }))}
                            className={cn(
                              "p-2 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between h-[68px] relative group hover:scale-[1.03] active:scale-[0.97]",
                              isSelected 
                                ? "border-indigo-600 bg-white ring-2 ring-indigo-500/25 shadow-md" 
                                : "border-slate-200/80 bg-white hover:border-slate-300 shadow-sm"
                            )}
                          >
                            <div className="w-full flex items-center justify-between gap-1">
                              <span className="text-[8px] font-black text-slate-600 leading-tight group-hover:text-indigo-600 transition-colors truncate">
                                {preset.name}
                              </span>
                              {isSelected && (
                                <span className="h-3.5 w-3.5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                                  <Check size={8} strokeWidth={3} />
                                </span>
                              )}
                            </div>
                            
                            {/* Live gradient preview bar */}
                            <div 
                              className="h-5 w-full rounded-lg shadow-inner border border-black/5 mt-1" 
                              style={{ background: `linear-gradient(135deg, ${preset.primary}, ${preset.secondary})` }}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 💖 CUSTOM FAVORITE COLORS SECTION */}
                  <div className="space-y-3 pb-6 border-b border-slate-100">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1 flex items-center gap-1.5">
                      <Heart className="h-3 w-3 text-rose-400" /> My Custom Colors (Add Your Own)
                    </label>
                    
                    {/* Save Current Colors as Favorite */}
                    <div className="flex items-center gap-2.5 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                      <div 
                        className="h-8 w-12 rounded-lg shadow-inner border border-white/20 shrink-0" 
                        style={{ background: `linear-gradient(135deg, ${settingsForm.primary_color}, ${settingsForm.secondary_color})` }}
                      />
                      <Input
                        placeholder="Name (e.g. Summer Theme)..."
                        value={favoriteName}
                        onChange={(e) => setFavoriteName(e.target.value)}
                        className="h-8 rounded-lg text-xs font-bold flex-1"
                      />
                      <Button
                        type="button"
                        disabled={!favoriteName.trim()}
                        onClick={() => {
                          const newFav = {
                            id: Date.now().toString(),
                            name: favoriteName.trim(),
                            primary: settingsForm.primary_color,
                            secondary: settingsForm.secondary_color
                          };
                          setSettingsForm(prev => ({
                            ...prev,
                            favorite_colors: [...prev.favorite_colors, newFav]
                          }));
                          setFavoriteName('');
                          toast.success(`"${newFav.name}" saved!`);
                        }}
                        className="h-8 px-3 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-[9px] font-bold uppercase tracking-wider shrink-0 transition-all active:scale-95"
                      >
                        <Heart className="h-3 w-3 mr-1" /> Save
                      </Button>
                    </div>

                    {/* Display Saved Favorites Grid */}
                    {settingsForm.favorite_colors.length > 0 && (
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-2.5 mt-2">
                        {settingsForm.favorite_colors.map((fav: any) => {
                          const isFavSelected = 
                            settingsForm.primary_color.toUpperCase() === fav.primary.toUpperCase() && 
                            settingsForm.secondary_color.toUpperCase() === fav.secondary.toUpperCase();
                          
                          return (
                            <div
                              key={fav.id}
                              className={cn(
                                "p-2 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between h-[68px] relative group hover:scale-[1.03] active:scale-[0.97] cursor-pointer",
                                isFavSelected 
                                  ? "border-rose-500 bg-white ring-2 ring-rose-500/25 shadow-md" 
                                  : "border-slate-200/80 bg-white hover:border-rose-200 shadow-sm"
                              )}
                              onClick={() => setSettingsForm(prev => ({
                                ...prev,
                                primary_color: fav.primary,
                                secondary_color: fav.secondary
                              }))}
                            >
                              <div className="w-full flex items-center justify-between gap-1">
                                <div className="flex items-center gap-1 min-w-0">
                                  <Star className="h-2.5 w-2.5 text-amber-400 shrink-0" fill="#FBBF24" />
                                  <span className="text-[8px] font-black text-slate-600 leading-tight group-hover:text-rose-500 transition-colors truncate">
                                    {fav.name}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSettingsForm(prev => ({
                                      ...prev,
                                      favorite_colors: prev.favorite_colors.filter((f: any) => f.id !== fav.id)
                                    }));
                                    toast.success('Removed!');
                                  }}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity h-4 w-4 rounded-full bg-rose-50 text-rose-400 hover:bg-rose-100 hover:text-rose-600 flex items-center justify-center shrink-0"
                                >
                                  <X size={8} strokeWidth={3} />
                                </button>
                              </div>
                              
                              <div 
                                className="h-5 w-full rounded-lg shadow-inner border border-black/5 mt-1" 
                                style={{ background: `linear-gradient(135deg, ${fav.primary}, ${fav.secondary})` }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {settingsForm.favorite_colors.length === 0 && (
                      <p className="text-[9px] text-slate-400 font-medium ml-1 ">
                        No custom colors yet. Pick any color above or use the color pickers below, then save it here.
                      </p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Custom Primary Brand Color</label>
                      <div className="flex gap-3">
                        <Input 
                          type="color" 
                          value={settingsForm.primary_color}
                          onChange={e => setSettingsForm(prev => ({ ...prev, primary_color: e.target.value }))}
                          className="w-14 h-11 p-1 rounded-lg border border-slate-200 cursor-pointer"
                        />
                        <Input 
                          type="text" 
                          value={settingsForm.primary_color.toUpperCase()}
                          onChange={e => setSettingsForm(prev => ({ ...prev, primary_color: e.target.value }))}
                          className="h-11 rounded-lg font-bold text-sm font-mono flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Custom Secondary Brand Color</label>
                      <div className="flex gap-3">
                        <Input 
                          type="color" 
                          value={settingsForm.secondary_color}
                          onChange={e => setSettingsForm(prev => ({ ...prev, secondary_color: e.target.value }))}
                          className="w-14 h-11 p-1 rounded-lg border border-slate-200 cursor-pointer"
                        />
                        <Input 
                          type="text" 
                          value={settingsForm.secondary_color.toUpperCase()}
                          onChange={e => setSettingsForm(prev => ({ ...prev, secondary_color: e.target.value }))}
                          className="h-11 rounded-lg font-bold text-sm font-mono flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">School Name Identity</label>
                      <Input 
                        value={settingsForm.school_name}
                        onChange={e => setSettingsForm(prev => ({ ...prev, school_name: e.target.value }))}
                        className="h-11 rounded-lg font-bold text-sm"
                        placeholder="E.G. SDM PUBLIC SCHOOL"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Application Title</label>
                      <Input 
                        value={settingsForm.app_title}
                        onChange={e => setSettingsForm(prev => ({ ...prev, app_title: e.target.value }))}
                        className="h-11 rounded-lg font-bold text-sm"
                        placeholder="E.G. SDM SCHOOL"
                        required
                      />
                    </div>
                  </div>

                </CardContent>
              </Card>

              <Card className="shadow-sm border-slate-200 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <ShieldAlert className="text-rose-500 h-5 w-5 animate-pulse" /> Emergency App Announcement
                  </CardTitle>
                  <CardDescription>Deploy a modal overlay notice that interrupts app launch for students.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <p className="text-sm font-bold text-slate-700">Push Emergency Modal?</p>
                      <p className="text-xs text-slate-400">If active, this modal will instantly render on startup for all mobile devices.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSettingsForm(prev => ({
                        ...prev,
                        emergency_alert: { ...prev.emergency_alert, active: !prev.emergency_alert.active }
                      }))}
                      className={cn(
                        "w-12 h-6 rounded-full transition-all duration-300 relative focus:outline-none",
                        settingsForm.emergency_alert.active ? "bg-rose-500 shadow-rose-200 shadow-lg" : "bg-slate-200"
                      )}
                    >
                      <div className={cn(
                        "h-5 w-5 rounded-full bg-white absolute top-0.5 transition-all duration-300 shadow",
                        settingsForm.emergency_alert.active ? "left-6" : "left-0.5"
                      )} />
                    </button>
                  </div>

                  {settingsForm.emergency_alert.active && (
                    <div className="grid gap-6 animate-in fade-in duration-300">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Modal Header Title</label>
                        <Input 
                          value={settingsForm.emergency_alert.title}
                          onChange={e => setSettingsForm(prev => ({
                            ...prev,
                            emergency_alert: { ...prev.emergency_alert, title: e.target.value }
                          }))}
                          className="h-11 rounded-lg font-bold text-sm border-rose-200 focus:ring-rose-500 focus:border-rose-500"
                          placeholder="Emergency / Urgent Notice Header"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Detail Notice Message</label>
                        <textarea
                          value={settingsForm.emergency_alert.message}
                          onChange={e => setSettingsForm(prev => ({
                            ...prev,
                            emergency_alert: { ...prev.emergency_alert, message: e.target.value }
                          }))}
                          className="w-full min-h-[100px] border border-slate-200 p-3 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 font-sans border-rose-200"
                          placeholder="Detail explanation or action links..."
                        />
                      </div>
                    </div>
                  )}

                </CardContent>
              </Card>
            </div>

            {/* PREVIEW PANEL */}
            <div className="space-y-6">
              <Card className="shadow-sm border-slate-200 rounded-2xl overflow-hidden bg-slate-900 border-none relative text-white">
                <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: `url('/grid.svg')` }} />
                
                <CardHeader className="relative z-10 border-b border-white/5 pb-4">
                  <CardTitle className="text-xs font-black uppercase tracking-[3px] text-indigo-400 flex items-center gap-2">
                    <Laptop size={14} /> Mobile App Preview
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-6 relative z-10 space-y-6">
                  {/* Phone Simulator Frame */}
                  <div className="border border-white/10 rounded-3xl bg-[#090D1A] overflow-hidden p-3 shadow-inner">
                    <div className="bg-slate-950 h-5 rounded-full mx-auto w-24 mb-3 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-slate-800" />
                    </div>

                    <div className="bg-slate-50 w-full rounded-2xl overflow-hidden aspect-[9/16] text-slate-900 flex flex-col justify-between">
                      {/* Header Preview */}
                      <div 
                        className="p-5 text-white flex items-center justify-between"
                        style={{ background: `linear-gradient(135deg, ${settingsForm.primary_color}, ${settingsForm.secondary_color})` }}
                      >
                        <div>
                          <p className="text-[10px] font-medium opacity-80">Good Morning 👋</p>
                          <p className="text-xs font-black truncate">{settingsForm.school_name || 'School Name'}</p>
                        </div>
                        <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                          {settingsForm.logo_url ? (
                            <img src={settingsForm.logo_url} alt="Logo" className="h-full w-full object-cover" />
                          ) : (
                            <Sparkles size={12} />
                          )}
                        </div>
                      </div>

                      {/* Dashboard Content Simulator */}
                      <div className="flex-1 p-4 bg-slate-50 space-y-3 overflow-y-auto no-scrollbar">
                        
                        {/* Fake Student Card */}
                        <div className="bg-white p-3.5 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-black" style={{ color: settingsForm.primary_color }}>
                              R
                            </div>
                            <div>
                              <p className="text-xs font-bold leading-tight">Rani Tomer</p>
                              <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">Cls: 1st-A • Roll: 07</p>
                            </div>
                          </div>
                          <div className="h-7 w-7 rounded-full border-2 border-emerald-500 border-t-transparent flex items-center justify-center text-[7px] font-black text-emerald-600">
                            95%
                          </div>
                        </div>

                        {/* Quick Access Menu Grid (Simulated) */}
                        <div className="grid grid-cols-4 gap-2">
                          {settingsForm.active_features.slice(0, 4).map(f => (
                            <div key={f} className="bg-white p-2 rounded-lg border border-slate-100 shadow-[0_2px_4px_rgba(0,0,0,0.02)] flex flex-col items-center gap-1.5">
                              <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center" style={{ color: settingsForm.primary_color }}>
                                <Sparkles size={10} />
                              </div>
                              <span className="text-[7px] font-bold uppercase text-slate-500">{f}</span>
                            </div>
                          ))}
                        </div>

                        {/* Banner Slider Simulator */}
                        <div className="bg-slate-200 h-20 rounded-xl flex items-center justify-center text-slate-400 font-bold text-[10px] uppercase border border-slate-200 border-dashed">
                          Banner Slide Carousel
                        </div>
                      </div>

                      <div className="p-3 border-t border-slate-100 flex justify-around text-slate-400 bg-white">
                        <Smartphone size={12} className="text-indigo-600" />
                        <Users size={12} />
                        <Palette size={12} />
                      </div>
                    </div>
                  </div>

                  {/* Logo Selector */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">Institutional Logo</label>
                    <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-xl border border-white/5">
                      <div className="h-12 w-12 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                        {settingsForm.logo_url ? (
                          <img src={settingsForm.logo_url} alt="Logo" className="h-full w-full object-cover" />
                        ) : (
                          <Upload size={20} className="text-slate-500" />
                        )}
                      </div>
                      <div className="space-y-1.5 flex-1">
                        <label className="h-9 px-4 rounded-lg bg-white/10 text-white hover:bg-white/15 cursor-pointer text-xs font-bold flex items-center justify-center gap-2 transition-all">
                          {uploadingLogo ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                          Upload Logo PNG
                          <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" disabled={uploadingLogo} />
                        </label>
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={updateSettingsMutation.isPending} 
                    className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-massive transition-all active:scale-95"
                  >
                    {updateSettingsMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Branding Configurations
                  </Button>

                </CardContent>
              </Card>
            </div>

          </form>
        </div>
      )}

      {/* 🚧 FEATURE CONTROLS & MAINTENANCE TAB */}
      {activeTab === 'features' && (
        <div className="animate-in fade-in duration-300">
          <form onSubmit={handleSaveSettings} className="grid md:grid-cols-3 gap-6">
            
            <div className="md:col-span-2 space-y-6">
              <Card className="shadow-sm border-slate-200 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <Settings2 className="text-indigo-600 h-5 w-5" /> Module Access Control
                  </CardTitle>
                  <CardDescription>Dynamically toggle modules on and off in the mobile application workspace grid.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 divide-y divide-slate-100">
                    {AVAILABLE_FEATURES.map((feature) => {
                      const isActive = settingsForm.active_features.includes(feature.id);
                      return (
                        <div key={feature.id} className="flex items-start justify-between py-4 first:pt-0 last:pb-0 gap-4">
                          <div className="space-y-1">
                            <p className="text-sm font-bold text-slate-700">{feature.label}</p>
                            <p className="text-xs text-slate-400 max-w-md">{feature.description}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleFeatureToggle(feature.id)}
                            className={cn(
                              "w-12 h-6 rounded-full transition-all duration-300 relative focus:outline-none mt-1 shrink-0",
                              isActive ? "bg-indigo-600 shadow-indigo-200 shadow-lg" : "bg-slate-200"
                            )}
                          >
                            <div className={cn(
                              "h-5 w-5 rounded-full bg-white absolute top-0.5 transition-all duration-300 shadow",
                              isActive ? "left-6" : "left-0.5"
                            )} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-slate-200 rounded-2xl overflow-hidden">
                <CardHeader className="bg-indigo-50/50 border-b border-indigo-100">
                  <CardTitle className="text-indigo-900 font-bold text-base flex items-center gap-2">
                    <Monitor className="text-indigo-600 h-5 w-5" /> Online Fee Gateway
                  </CardTitle>
                  <CardDescription className="text-indigo-600/80">Configure Razorpay credentials to allow parents to pay school fees directly from the mobile app.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 shadow-[0_2px_4px_rgba(0,0,0,0.02)] bg-slate-50/50">
                    <div>
                      <p className="text-xs font-bold text-slate-900">Enable Online Payments?</p>
                      <p className="text-[10px] text-slate-500 font-medium">Turns on the Pay Now button in student apps.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSettingsForm(prev => ({ ...prev, enableOnlinePayments: !prev.enableOnlinePayments }))}
                      className={cn(
                        "w-12 h-6 rounded-full transition-all duration-300 relative focus:outline-none shrink-0",
                        settingsForm.enableOnlinePayments ? "bg-indigo-600 shadow-indigo-200 shadow-lg" : "bg-slate-200"
                      )}
                    >
                      <div className={cn(
                        "h-5 w-5 rounded-full bg-white absolute top-0.5 transition-all duration-300 shadow",
                        settingsForm.enableOnlinePayments ? "left-6" : "left-0.5"
                      )} />
                    </button>
                  </div>

                  {settingsForm.enableOnlinePayments && (
                    <div className="grid gap-4 animate-in fade-in duration-300">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Razorpay Key ID</label>
                        <Input 
                          value={settingsForm.razorpayKeyId}
                          onChange={e => setSettingsForm(prev => ({ ...prev, razorpayKeyId: e.target.value }))}
                          className="h-11 rounded-lg font-bold text-sm"
                          placeholder="rzp_test_xxxxxx"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Razorpay Key Secret</label>
                        <Input 
                          type="password"
                          value={settingsForm.razorpayKeySecret}
                          onChange={e => setSettingsForm(prev => ({ ...prev, razorpayKeySecret: e.target.value }))}
                          className="h-11 rounded-lg font-bold text-sm"
                          placeholder="*****************"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="shadow-sm border-slate-200 rounded-2xl bg-rose-50/50 border-rose-100 overflow-hidden">
                <div className="h-1 bg-rose-500" />
                <CardHeader>
                  <CardTitle className="text-rose-900 font-bold text-base flex items-center gap-2">
                    <AlertTriangle className="text-rose-600 h-5 w-5" /> Severe: Maintenance Mode
                  </CardTitle>
                  <CardDescription className="text-rose-600/80">Blocks dynamic app access with an Under Maintenance visual splash blocking students/teachers.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-rose-100 shadow-[0_2px_4px_rgba(225,29,72,0.02)]">
                    <div>
                      <p className="text-xs font-bold text-rose-950">System Offline?</p>
                      <p className="text-[10px] text-rose-500 font-medium">Instantly lock application access.</p>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setSettingsForm(prev => ({ ...prev, maintenance_mode: !prev.maintenance_mode }))}
                      className={cn(
                        "w-12 h-6 rounded-full transition-all duration-300 relative focus:outline-none shrink-0",
                        settingsForm.maintenance_mode ? "bg-rose-500 shadow-rose-200 shadow-lg" : "bg-slate-200"
                      )}
                    >
                      <div className={cn(
                        "h-5 w-5 rounded-full bg-white absolute top-0.5 transition-all duration-300 shadow",
                        settingsForm.maintenance_mode ? "left-6" : "left-0.5"
                      )} />
                    </button>
                  </div>

                  {settingsForm.maintenance_mode && (
                    <div className="bg-rose-100/50 border border-rose-200 p-4 rounded-xl text-rose-800 text-[11px] font-bold leading-relaxed flex items-start gap-3 animate-in fade-in duration-300">
                      <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0 mt-0.5 animate-bounce" />
                      <div>
                        CAUTION: Turning on Maintenance Mode locks the mobile databases! Users will only see a premium maintenance splash. Please use this for active system upgrades or security overrides only.
                      </div>
                    </div>
                  )}

                  <Button 
                    type="submit"
                    disabled={updateSettingsMutation.isPending} 
                    className="w-full h-12 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-massive transition-all active:scale-95"
                  >
                    {updateSettingsMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Sync System Controls
                  </Button>

                </CardContent>
              </Card>
            </div>

          </form>
        </div>
      )}

      {/* 🖼️ MOBILE BANNER SLIDER TAB */}
      {activeTab === 'banners' && (
        <div className="animate-in fade-in duration-300 space-y-6">
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <ImageIcon className="text-indigo-600 h-5 w-5" /> Banner Slide Registry
              </h3>
              <p className="text-xs text-slate-400">Configure horizontal scrolling advertising images and notices at the top of the mobile dashboards.</p>
            </div>
            <Button
              onClick={() => {
                setShowAddBanner(!showAddBanner);
                setEditingBanner(null);
                setBannerForm({ title: '', description: '', image_url: '', action_route: '', status: 'ACTIVE', display_order: 0 });
              }}
              className={cn(
                "h-10 px-6 rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-massive transition-all active:scale-95",
                showAddBanner ? "bg-slate-200 text-slate-700 hover:bg-slate-300" : "bg-indigo-600 hover:bg-indigo-700 text-white"
              )}
            >
              {showAddBanner ? <><X className="mr-2 h-4 w-4" /> Cancel</> : <><Plus className="mr-2 h-4 w-4" /> Add Banner</>}
            </Button>
          </div>

          {showAddBanner && (
            <Card className="shadow-sm border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 rounded-2xl">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="text-sm font-bold uppercase tracking-tight flex items-center gap-2">
                  <Sparkles size={16} className="text-indigo-600" /> {editingBanner ? 'Edit Banner Configuration' : 'Register New Announcement Slide'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleBannerSubmit} className="grid md:grid-cols-4 gap-8">
                  
                  <div className="md:col-span-1 space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Banner Graphic</label>
                    <div className="relative group aspect-[16/9] w-full rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 overflow-hidden bg-slate-50 hover:border-indigo-300 transition-all">
                      {bannerForm.image_url ? (
                        <img src={bannerForm.image_url} alt="Banner" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center p-4 text-center">
                          <Upload size={24} strokeWidth={1.5} />
                          <span className="text-[8px] mt-2 font-bold uppercase">Upload (16:9 ratio)</span>
                        </div>
                      )}
                      <input type="file" accept="image/*" onChange={handleBannerUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                      {uploadingBanner && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-20">
                          <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="md:col-span-3 grid md:grid-cols-3 gap-6">
                    <div className="space-y-2 col-span-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Banner Title</label>
                      <Input value={bannerForm.title} onChange={e => setBannerForm({ ...bannerForm, title: e.target.value })} className="h-11 rounded-lg font-bold text-sm" placeholder="E.G. ANNUAL DAY ADMISSION OPEN" required />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Deep Link Action Route</label>
                      <Input value={bannerForm.action_route} onChange={e => setBannerForm({ ...bannerForm, action_route: e.target.value })} className="h-11 rounded-lg font-bold text-sm" placeholder="E.G. StudentFees" />
                    </div>

                    <div className="space-y-2 col-span-3">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Supporting Text Message</label>
                      <Input value={bannerForm.description} onChange={e => setBannerForm({ ...bannerForm, description: e.target.value })} className="h-11 rounded-lg font-bold text-sm" placeholder="Short description shown directly under banner slide..." />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Carousel Order</label>
                      <Input type="number" value={bannerForm.display_order} onChange={e => setBannerForm({ ...bannerForm, display_order: parseInt(e.target.value) })} className="h-11 rounded-lg font-bold text-sm" required />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Slider Status</label>
                      <select
                        value={bannerForm.status} 
                        onChange={e => setBannerForm({ ...bannerForm, status: e.target.value })}
                        className="w-full h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-600"
                      >
                        <option value="ACTIVE">ACTIVE (Rendered)</option>
                        <option value="INACTIVE">INACTIVE (Hidden)</option>
                      </select>
                    </div>

                    <div className="flex items-end">
                      <Button type="submit" disabled={uploadingBanner || bannerMutation.isPending} className="w-full h-11 bg-slate-900 hover:bg-black text-white rounded-lg font-bold text-[10px] uppercase tracking-widest">
                        {bannerMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        {editingBanner ? 'Sync Slide' : 'Publish Banner'}
                      </Button>
                    </div>
                  </div>

                </form>
              </CardContent>
            </Card>
          )}

          {/* TABLE OF ACTIVE BANNERS */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-500 font-medium uppercase tracking-wider">
                    <th className="text-left py-4 px-6 text-[10px] font-bold tracking-widest w-40">Banner Preview</th>
                    <th className="text-left py-4 px-6 text-[10px] font-bold tracking-widest">Announcement Details</th>
                    <th className="text-center py-4 px-6 text-[10px] font-bold tracking-widest w-24">Order</th>
                    <th className="text-center py-4 px-6 text-[10px] font-bold tracking-widest w-32">Status</th>
                    <th className="text-right py-4 px-6 text-[10px] font-bold tracking-widest w-32">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bannersData.map((banner: any) => (
                    <tr key={banner.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="aspect-[16/9] w-28 rounded-lg border border-slate-100 shadow-sm overflow-hidden bg-slate-100 shrink-0">
                          <img src={banner.image_url} alt={banner.title} className="h-full w-full object-cover" />
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-bold text-slate-900 leading-tight">{banner.title}</p>
                          <p className="text-xs text-slate-400 font-medium mt-1 truncate max-w-md">{banner.description || 'No descriptive subtitle provided.'}</p>
                          {banner.action_route && (
                            <Badge variant="outline" className="bg-indigo-50/50 border-indigo-100 text-indigo-700 font-bold text-[9px] uppercase mt-2">
                              Redirects: {banner.action_route}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="font-black text-slate-950 text-xs">#{banner.display_order}</span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "font-bold text-[10px] uppercase shadow-none",
                            banner.status === 'ACTIVE' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          )}
                        >
                          {banner.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <Button variant="outline" size="sm" onClick={() => startEditBanner(banner)} className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600 border-slate-200"><Edit2 size={14} /></Button>
                          <Button variant="outline" size="sm" onClick={() => confirmDeleteBanner(banner)} className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 border-slate-200"><Trash2 size={14} /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {bannersData.length === 0 && (
              <div className="text-center py-24 bg-white rounded-2xl border-none">
                <ImageIcon className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest animate-pulse">No banners published yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 👥 STAFF ACCESS DELEGATION TAB */}
      {activeTab === 'delegation' && (
        <div className="animate-in fade-in duration-300 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <ShieldCheck className="text-indigo-600 h-5 w-5" /> Staff Settings Delegation
              </h3>
              <p className="text-xs text-slate-400">Delegate App Configuration permissions to trusted Principal, Managers, or Staff in real time.</p>
            </div>
            
            <div className="relative flex-1 max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search staff registry..."
                value={staffSearch}
                onChange={(e) => setStaffSearch(e.target.value)}
                className="pl-10 h-10 border-slate-200 rounded-lg font-bold text-xs focus:bg-white transition-all shadow-none"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-500 font-medium uppercase tracking-wider">
                    <th className="text-left py-4 px-6 text-[10px] font-bold tracking-widest">Faculty Member</th>
                    <th className="text-left py-4 px-6 text-[10px] font-bold tracking-widest">Registry Role</th>
                    <th className="text-left py-4 px-6 text-[10px] font-bold tracking-widest">Contact Details</th>
                    <th className="text-center py-4 px-6 text-[10px] font-bold tracking-widest w-56">App Console Authority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStaff.map((staff: any) => {
                    const isDelegated = staff.can_manage_app_settings === true;
                    // Super Admins/Admins have absolute access and don't need a checkbox
                    const isSystemAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(staff.role?.toUpperCase());
                    
                    return (
                      <tr key={staff.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-9 w-9 rounded-full border border-slate-200 shadow-sm">
                              <AvatarImage src={staff.image} className="object-cover" />
                              <AvatarFallback className="bg-indigo-50 text-indigo-500 font-black text-xs">
                                {staff.name?.slice(0, 2).toUpperCase() || 'ST'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-bold text-slate-900 leading-tight">{staff.name}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">{staff.designation || 'Faculty Member'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Badge variant="outline" className="bg-slate-50 border-slate-200 text-slate-600 font-bold text-[10px] uppercase">
                            {staff.role}
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-xs">
                            <p className="font-bold text-slate-800">{staff.email}</p>
                            <p className="text-[10px] text-slate-400 font-bold mt-0.5">{staff.phone || 'No phone'}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          {isSystemAdmin ? (
                            <Badge className="bg-indigo-600 text-white font-bold text-[10px] uppercase tracking-wider py-1 px-3">
                              Absolute Access
                            </Badge>
                          ) : (
                            <div className="flex items-center justify-center gap-3">
                              <button
                                type="button"
                                disabled={delegateAccessMutation.isPending}
                                onClick={() => delegateAccessMutation.mutate({ id: String(staff.id), canManage: !isDelegated })}
                                className={cn(
                                  "w-12 h-6 rounded-full transition-all duration-300 relative focus:outline-none",
                                  isDelegated ? "bg-indigo-600 shadow-indigo-200 shadow-lg" : "bg-slate-200"
                                )}
                              >
                                <div className={cn(
                                  "h-5 w-5 rounded-full bg-white absolute top-0.5 transition-all duration-300 shadow",
                                  isDelegated ? "left-6" : "left-0.5"
                                )} />
                              </button>
                              <span className={cn("text-[10px] font-bold uppercase", isDelegated ? "text-indigo-600" : "text-slate-400")}>
                                {isDelegated ? "Authorized" : "Revoked"}
                              </span>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* DELETE BANNER DIALOG */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setBannerToDelete(null);
        }}
        onConfirm={() => {
          if (bannerToDelete) {
            deleteBannerMutation.mutate(String(bannerToDelete.id));
            setDeleteConfirmOpen(false);
            setBannerToDelete(null);
          }
        }}
        title="Delete Slider Banner?"
        description={bannerToDelete ? `Are you sure you want to permanently delete banner "${bannerToDelete.title}"? This cannot be undone.` : "Are you sure you want to delete this banner?"}
        confirmText="Remove Slide"
        cancelText="Cancel"
        type="danger"
      />

    </div>
  );
}
