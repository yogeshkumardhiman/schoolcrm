"use client";

import React, { useState, useEffect } from "react";
import {
  Layers,
  Save,
  Loader2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  ToggleLeft,
  ToggleRight,
  SlidersHorizontal,
  Lock,
  Pin,
  ImageIcon,
  Bell
} from "lucide-react";
import client from "@/lib/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WebsiteNavHeader } from "../components/WebsiteNavHeader";

// 📌 Fixed Top Elements (Always pinned at the top of the homepage)
export const FIXED_TOP_SECTIONS = [
  {
    id: "notice-ticker",
    name: "Notice & News Ticker",
    desc: "Top scrolling marquee bar for real-time announcements & circulars",
    icon: Bell
  },
  {
    id: "hero-slider",
    name: "Main Hero Banner & Slider",
    desc: "Full-width dynamic slider banners, taglines & admission CTAs",
    icon: ImageIcon
  }
];

// 🏛️ Dynamic Configurable Body Sections (After the Hero Banner)
export const CONFIGURABLE_BODY_SECTIONS = [
  { id: "stats", name: "Institutional Key Metrics & Counter", desc: "Active students, faculty ratio, CBSE results & legacy counter" },
  { id: "about", name: "About School & Institutional Vision", desc: "Foundational legacy, core pillars, mission & vision narrative" },
  { id: "why-choose-us", name: "Why Choose Us (Core Pillars)", desc: "CBSE distinction, STEM labs, athletics & campus safety highlights" },
  { id: "academics", name: "Academic Programs & Curriculum", desc: "Pre-Primary, Primary, Middle, Secondary & Senior Secondary wings" },
  { id: "facilities", name: "Campus Infrastructure & Facilities", desc: "Smart classrooms, science labs, library, sports & transport" },
  { id: "director-message", name: "Words from Visionary Leaders", desc: "Founder, Chairman & CEO leadership carousel & quotes" },
  { id: "toppers", name: "Academic Board Toppers Spotlight", desc: "CBSE Class 10 & 12 state rank holders & scholastic toppers" },
  { id: "gallery", name: "Campus Life & Media Gallery", desc: "Interactive photography showcase of student events & campus" },
  { id: "video-tour", name: "Campus Video Tour", desc: "Virtual video walkthrough showcasing modern campus facilities" },
  { id: "news", name: "Latest Campus News & Highlights", desc: "Recent news posts, achievements & media coverage" },
  { id: "events", name: "Upcoming Events Calendar", desc: "Academic calendar, annual sports meet & competition schedule" },
  { id: "testimonials", name: "Parent & Alumni Testimonials", desc: "Authentic reviews and ratings from parents and scholars" },
  { id: "timeline", name: "4-Step Admissions Journey", desc: "Inquiry, Registration, Campus Interaction & Enrollment guide" },
  { id: "faq", name: "Frequently Asked Questions (FAQ)", desc: "Collapsible answers addressing common parent queries" },
  { id: "cta", name: "Final Admissions Call-to-Action", desc: "Prominent closing banner with Apply Now & Visit Campus buttons" }
];

// Helper to normalize legacy or camelCase section IDs
const normalizeSectionId = (id: string): string => {
  const map: Record<string, string> = {
    hero: "hero-slider",
    "hero-slider": "hero-slider",
    stats: "stats",
    about: "about",
    "why-choose-us": "why-choose-us",
    why_choose_us: "why-choose-us",
    wings: "academics",
    academics: "academics",
    facilities: "facilities",
    facilities_config: "facilities",
    directorMessage: "director-message",
    "director-message": "director-message",
    director_message: "director-message",
    principalMessage: "director-message",
    toppers: "toppers",
    gallery: "gallery",
    "video-tour": "video-tour",
    campus_tour: "video-tour",
    news: "news",
    events: "events",
    testimonials: "testimonials",
    timeline: "timeline",
    admissions: "timeline",
    admission_timeline: "timeline",
    faq: "faq",
    faqs_config: "faq",
    cta: "cta",
    cta_config: "cta",
    "notice-ticker": "notice-ticker",
    notices: "notice-ticker"
  };
  return map[id] || id;
};

export default function LayoutOrderPage() {
  const queryClient = useQueryClient();

  // Ordered list of configurable body sections
  const [orderedSections, setOrderedSections] = useState<string[]>(
    CONFIGURABLE_BODY_SECTIONS.map((s) => s.id)
  );

  // Set of enabled section IDs
  const [enabledSections, setEnabledSections] = useState<Set<string>>(
    new Set(CONFIGURABLE_BODY_SECTIONS.map((s) => s.id))
  );

  const { data, isLoading } = useQuery({
    queryKey: ["school-info"],
    queryFn: async () => {
      const res: any = await client.get("/settings/school-info");
      return res?.data || res || {};
    }
  });

  useEffect(() => {
    if (data) {
      const rawLayout = Array.isArray(data.homepage_layout) ? data.homepage_layout : [];

      if (rawLayout.length > 0) {
        // Filter out fixed top sections and deduplicate
        const normalized = rawLayout
          .map(normalizeSectionId)
          .filter((id: string) => id !== "notice-ticker" && id !== "hero-slider");

        const seen = new Set<string>();
        const cleanOrder: string[] = [];

        normalized.forEach((id: string) => {
          if (CONFIGURABLE_BODY_SECTIONS.some((s) => s.id === id) && !seen.has(id)) {
            seen.add(id);
            cleanOrder.push(id);
          }
        });

        // Append any missing body sections at the end
        CONFIGURABLE_BODY_SECTIONS.forEach((s) => {
          if (!seen.has(s.id)) {
            cleanOrder.push(s.id);
          }
        });

        setOrderedSections(cleanOrder);
        setEnabledSections(new Set(cleanOrder.filter(id => seen.has(id))));
      } else {
        setOrderedSections(CONFIGURABLE_BODY_SECTIONS.map((s) => s.id));
        setEnabledSections(new Set(CONFIGURABLE_BODY_SECTIONS.map((s) => s.id)));
      }
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: async (finalLayout: string[]) => {
      // Fixed top sections are always included at top
      const fullLayout = ["notice-ticker", "hero-slider", ...finalLayout];
      return client.put("/settings/school-info", { homepage_layout: fullLayout });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school-info"] });
      window.dispatchEvent(new Event("school-info-updated"));
      toast.success("Homepage layout sequence saved successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to save layout order");
    }
  });

  // Move body section Up or Down
  const moveSection = (index: number, direction: "up" | "down") => {
    const list = [...orderedSections];
    if (direction === "up" && index > 0) {
      const temp = list[index];
      list[index] = list[index - 1];
      list[index - 1] = temp;
    } else if (direction === "down" && index < list.length - 1) {
      const temp = list[index];
      list[index] = list[index + 1];
      list[index + 1] = temp;
    }
    setOrderedSections(list);
  };

  // Toggle Visibility (ON / OFF)
  const toggleVisibility = (id: string) => {
    setEnabledSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Reset to default recommended sequence
  const resetToRecommended = () => {
    setOrderedSections(CONFIGURABLE_BODY_SECTIONS.map((s) => s.id));
    setEnabledSections(new Set(CONFIGURABLE_BODY_SECTIONS.map((s) => s.id)));
    toast.success("Reset to recommended sequence");
  };

  // Enable / Disable All
  const setAllVisibility = (enable: boolean) => {
    if (enable) {
      setEnabledSections(new Set(CONFIGURABLE_BODY_SECTIONS.map((s) => s.id)));
      toast.success("All body sections enabled");
    } else {
      setEnabledSections(new Set());
      toast.success("All body sections hidden");
    }
  };

  // Save changes
  const handleSave = () => {
    const activeBodySections = orderedSections.filter((id) => enabledSections.has(id));
    saveMutation.mutate(activeBodySections);
  };

  const enabledCount = enabledSections.size;
  const totalCount = orderedSections.length;

  return (
    <div className="p-6 md:p-10 space-y-8 bg-[#F8FAFC] min-h-screen text-slate-900 font-sans pb-32">
      <WebsiteNavHeader />

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2 uppercase">
              <SlidersHorizontal className="text-blue-600" size={22} />
              Homepage Layout & Sequence
            </h1>
            <Badge variant="outline" className="text-blue-700 bg-blue-50 border-blue-200 text-xs font-black">
              {enabledCount} / {totalCount} Active Body Modules
            </Badge>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Banner & Hero remain permanently pinned at top. Reorder and toggle any body sections below it.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={resetToRecommended}
            className="rounded-xl border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-bold gap-1.5 cursor-pointer"
          >
            <RotateCcw size={14} />
            Recommended Order
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setAllVisibility(enabledCount < totalCount)}
            className="rounded-xl border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-bold gap-1.5 cursor-pointer"
          >
            {enabledCount < totalCount ? <Eye size={14} /> : <EyeOff size={14} />}
            {enabledCount < totalCount ? "Enable All" : "Disable All"}
          </Button>

          <Button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider gap-2 px-6 shadow-md shadow-blue-500/20 cursor-pointer"
          >
            {saveMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            Save Sequence
          </Button>
        </div>
      </div>

      {/* 📌 Pinned Top Hero & Banner (Always Fixed on Top) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-2">
          <Pin size={15} className="text-amber-500" />
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
            Fixed Header & Hero Banner (Permanently Pinned on Top)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {FIXED_TOP_SECTIONS.map((fixedSec, idx) => (
            <div
              key={fixedSec.id}
              className="flex items-center justify-between p-4 rounded-2xl border border-amber-200 bg-amber-50/40 shadow-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center font-mono font-black text-xs text-amber-800 shrink-0">
                  #{idx + 1}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-900 truncate">{fixedSec.name}</h4>
                    <Badge className="bg-amber-600 text-white text-[9px] font-black uppercase px-2 py-0">
                      <Lock size={10} className="mr-1" /> Fixed Top
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{fixedSec.desc}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-3">
                <span className="px-3 py-1 rounded-lg bg-amber-200/60 text-amber-900 font-bold text-xs uppercase">
                  Always Active
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🏛️ Reorderable & Toggleable Body Content Sections */}
      <Card className="shadow-sm border-slate-200 rounded-3xl overflow-hidden bg-white">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4 px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers size={18} className="text-blue-600" />
              <CardTitle className="text-xs font-black text-slate-900 uppercase tracking-widest">
                Body Sections Sequence & Display Controls (After Banner)
              </CardTitle>
            </div>
            <span className="text-[11px] font-bold text-slate-400">
              Use ▲ / ▼ to reorder & toggle ON / OFF to show/hide
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-2.5">
          {orderedSections.map((secId, idx) => {
            const meta = CONFIGURABLE_BODY_SECTIONS.find((s) => s.id === secId) || {
              id: secId,
              name: secId,
              desc: "Institutional homepage section"
            };
            const isEnabled = enabledSections.has(secId);

            return (
              <div
                key={secId}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition-all duration-200 gap-3 ${
                  isEnabled
                    ? "bg-white border-slate-200 hover:border-blue-300 hover:shadow-xs"
                    : "bg-slate-50/60 border-slate-200/60 opacity-60"
                }`}
              >
                {/* Left Side: Order Number, Name & Description */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div
                    className={`h-9 w-9 rounded-xl flex items-center justify-center font-mono font-black text-xs shrink-0 transition-colors ${
                      isEnabled
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    #{idx + 3}
                  </div>

                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className={`font-bold text-sm leading-tight truncate ${isEnabled ? "text-slate-900" : "text-slate-500 line-through"}`}>
                        {meta.name}
                      </h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200/80">
                        {secId}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1">
                      {meta.desc}
                    </p>
                  </div>
                </div>

                {/* Right Side: Reorder Arrows + ON/OFF Switch */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  
                  {/* Move Up / Move Down Buttons */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
                    <button
                      type="button"
                      onClick={() => moveSection(idx, "up")}
                      disabled={idx === 0}
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-white hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs"
                      title="Move Section Up"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSection(idx, "down")}
                      disabled={idx === orderedSections.length - 1}
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-white hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs"
                      title="Move Section Down"
                    >
                      <ArrowDown size={14} />
                    </button>
                  </div>

                  {/* ON / OFF Switch */}
                  <button
                    type="button"
                    onClick={() => toggleVisibility(secId)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                      isEnabled
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                        : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                    }`}
                  >
                    {isEnabled ? (
                      <>
                        <ToggleRight size={18} className="text-emerald-600" />
                        <span>Visible</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft size={18} className="text-slate-400" />
                        <span>Hidden</span>
                      </>
                    )}
                  </button>

                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
