"use client";
import client from "@/lib/client";

import React, { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Edit3,
  MapPin,
  Clock,
  Users,
  Search,
  Loader2,
  Sparkles,
  Info,
  CalendarDays,
  X,
  Sun,
  Snowflake,
  Save,
} from "lucide-react";
import { cn } from "@/lib/utils";


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/AbilityProvider";
import { ConfirmDialog } from "@/components/dialogbox/ConfirmDialog";
import { CommitCalendarEntryModal } from "@/features/website";


interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  participants: string;
  color: string;
  icon: string;
  description?: string;
  type?: 'EVENT' | 'HOLIDAY' | 'GOVT_HOLIDAY';
  endDate?: string;
  createdAt?: string;
}

export default function CalendarPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);

  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>("");

  useEffect(() => {
    setMounted(true);
    const now = new Date();
    setCurrentDate(now);
    setSelectedDateStr(now.toISOString().split("T")[0]);
  }, []);
  // Delete confirmation states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const canManage = mounted && ["SUPER_ADMIN", "PRINCIPAL", "ADMIN"].includes(
    user?.role || ""
  );

  // ── School Timings ──────────────────────────────────────────────────
  const [timingEdit, setTimingEdit] = useState(false);
  const [timingDraft, setTimingDraft] = useState<any>(null);

  const { data: schoolSettings } = useQuery({
    queryKey: ["school-settings"],
    queryFn: () => client.get("/settings/config"),
  });

  const timings = timingDraft || schoolSettings?.timings || {
    summer: { startTime: '07:30', endTime: '13:30', label: 'Summer Timing', months: 'April – September' },
    winter: { startTime: '09:00', endTime: '15:00', label: 'Winter Timing', months: 'October – March' },
  };

  const saveTimingsMutation = useMutation({
    mutationFn: (data: any) => client.put("/settings/config", { timings: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school-settings"] });
      toast.success("School timings updated!");
      setTimingEdit(false);
      setTimingDraft(null);
    },
    onError: () => toast.error("Failed to save timings"),
  });

  // Fetch Events and Notices
  const { data: events = [], isLoading } = useQuery<CalendarEvent[]>({
    queryKey: ["calendar-events"],
    queryFn: async () => {
      const [eventsRes, noticesRes] = await Promise.all([
        client.get("/website/events").catch(() => []),
        client.get("/website/notices").catch(() => []),
      ]);

      const formattedEvents: CalendarEvent[] = (Array.isArray(eventsRes) ? eventsRes : []).map((e: any) => ({
        id: `evt-${e.id}`,
        title: e.title || 'Untitled Event',
        date: e.date || (e.createdAt ? e.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]),
        time: e.time || '09:00 AM - 02:00 PM',
        location: e.location || 'School Campus',
        participants: e.participants || 'All Students',
        color: e.color || '#4F46E5',
        icon: e.icon || 'Calendar',
        description: e.description || '',
        type: (e.type as any) || 'EVENT',
        endDate: e.endDate,
        createdAt: e.createdAt,
      }));

      const formattedNotices: CalendarEvent[] = (Array.isArray(noticesRes) ? noticesRes : []).map((n: any) => {
        const rawDate = n.date || (n.createdAt ? n.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]);
        return {
          id: `not-${n.id}`,
          title: n.title ? n.title.toUpperCase() : 'SCHOOL CIRCULAR',
          date: rawDate,
          time: n.targetRole ? `Target: ${n.targetRole}` : 'School Wide',
          location: n.tag || 'Official Circular',
          participants: n.targetRole || 'All',
          color: '#6366F1',
          icon: 'Bell',
          description: n.content || n.message || '',
          type: 'NOTICE' as any,
          createdAt: n.createdAt,
        };
      });

      return [...formattedEvents, ...formattedNotices];
    }
  });

  // Mutate Operations
  const saveMutation = useMutation({
    mutationFn: (data: Omit<CalendarEvent, "id" | "createdAt">) => {
      if (editingEvent) {
        if (editingEvent.id.startsWith('not-')) {
          return client.put(`/website/notices/${editingEvent.id.replace('not-', '')}`, {
            title: data.title,
            content: data.description,
            date: data.date,
          });
        }
        return client.put(`/website/events/${editingEvent.id.replace('evt-', '')}`, data);
      }
      return client.post("/website/events", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
      queryClient.invalidateQueries({ queryKey: ["notices"] });
      toast.success(
        editingEvent ? "Calendar Event Updated" : "Calendar Event Created Successfully"
      );
      handleCloseModal();
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to save calendar entry");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      if (id.startsWith('not-')) {
        return client.delete(`/website/notices/${id.replace('not-', '')}`);
      }
      return client.delete(`/website/events/${id.replace('evt-', '')}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
      queryClient.invalidateQueries({ queryKey: ["notices"] });
      toast.success("Calendar entry deleted successfully");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to remove entry");
    }
  });

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEvent(null);
  };

  const handleOpenAddModal = (dateStr?: string) => {
    if (!canManage) return;
    const targetDate = dateStr || selectedDateStr;
    setSelectedDateStr(targetDate);
    setEditingEvent(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (event: CalendarEvent) => {
    if (!canManage) return;
    setEditingEvent(event);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (!canManage) return;
    setEventToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleModalSubmit = (submittedData: any) => {
    if (!submittedData.title || !submittedData.date) {
      return toast.error("Event title and date are required fields");
    }

    // Auto color assignments depending on type if color is default or unchanged
    let finalColor = submittedData.color;
    if (submittedData.color === "#4F46E5" || submittedData.color === "#EF4444" || submittedData.color === "#F59E0B") {
      if (submittedData.type === "HOLIDAY") finalColor = "#EF4444"; // Rose/Red
      else if (submittedData.type === "GOVT_HOLIDAY") finalColor = "#F59E0B"; // Amber/Orange
      else finalColor = "#8B5CF6"; // Indigo/Purple
    }

    saveMutation.mutate({ ...submittedData, color: finalColor });
  };

  // Date utilities
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDateStr(new Date().toISOString().split("T")[0]);
  };

  const formatDateKey = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Generate calendar days
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  const calendarCells: { date: Date; dateStr: string; isCurrentMonth: boolean }[] = [];

  // Padding days from previous month
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthTotalDays - i);
    calendarCells.push({
      date: d,
      dateStr: formatDateKey(d),
      isCurrentMonth: false,
    });
  }

  // Days of current month
  for (let i = 1; i <= totalDays; i++) {
    const d = new Date(year, month, i);
    calendarCells.push({
      date: d,
      dateStr: formatDateKey(d),
      isCurrentMonth: true,
    });
  }

  // Remaining padding days from next month to complete standard 42 cell grid
  const remainingCells = 42 - calendarCells.length;
  for (let i = 1; i <= remainingCells; i++) {
    const d = new Date(year, month + 1, i);
    calendarCells.push({
      date: d,
      dateStr: formatDateKey(d),
      isCurrentMonth: false,
    });
  }

  // Event category helper styles
  const getCategoryStyles = (type?: string) => {
    switch (type) {
      case "HOLIDAY":
        return {
          bg: "bg-rose-50 border-rose-100 text-rose-600 dark:bg-rose-950/20",
          dot: "bg-rose-500 shadow-rose-500/50",
          badge: "bg-rose-500",
          label: "School Holiday"
        };
      case "GOVT_HOLIDAY":
        return {
          bg: "bg-amber-50 border-amber-100 text-amber-600 dark:bg-amber-950/20",
          dot: "bg-amber-500 shadow-amber-500/50",
          badge: "bg-amber-500",
          label: "Govt. Gazetted Holiday"
        };
      case "NOTICE":
        return {
          bg: "bg-purple-50 border-purple-100 text-purple-700 dark:bg-purple-950/20",
          dot: "bg-purple-500 shadow-purple-500/50",
          badge: "bg-purple-600",
          label: "Notice / Circular"
        };
      case "EVENT":
      default:
        return {
          bg: "bg-indigo-50 border-indigo-100 text-indigo-600 dark:bg-indigo-950/20",
          dot: "bg-indigo-500 shadow-indigo-500/50",
          badge: "bg-indigo-500",
          label: "Academic Event"
        };
    }
  };

  // Filtering events based on search query and type filter
  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "ALL" || e.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Events occurring on the selected date
  const selectedDayEvents = events.filter((e) => {
    // Exact date match or spanning multi-day events
    if (e.endDate && e.endDate !== e.date) {
      return selectedDateStr >= e.date && selectedDateStr <= e.endDate;
    }
    return e.date === selectedDateStr;
  });

  // Group events by day for rendering calendar cells
  const getEventsForDay = (dateStr: string) => {
    return events.filter((e) => {
      if (e.endDate && e.endDate !== e.date) {
        return dateStr >= e.date && dateStr <= e.endDate;
      }
      return e.date === dateStr;
    });
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-[#F5F7FB] min-h-screen font-sans" suppressHydrationWarning>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tighter text-slate-900 font-heading uppercase  leading-none">
            Academic Calendar
          </h2>
          <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-[4px] mt-2">
            Organize & Broadcast Institutional Events & Holidays
          </p>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <Button
            onClick={handleToday}
            variant="outline"
            className="h-10 sm:h-11 px-4 sm:px-5 border-slate-200 text-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition-all shadow-sm"
          >
            Today
          </Button>

          {canManage && (
            <Button
              onClick={() => handleOpenAddModal()}
              className="bg-slate-900 hover:bg-slate-800 text-white h-10 sm:h-11 px-5 sm:px-8 font-black uppercase text-[10px] tracking-widest rounded-xl transition-all shadow-xl flex items-center gap-2"
            >
              <Plus size={16} /> New Calendar Entry
            </Button>
          )}
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column: Month view calendar */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden">

            {/* Calendar Controller Header */}
            <div className="p-6 border-b border-slate-50 bg-[#0F172A] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-indigo-400">
                  <CalendarDays size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight uppercase  leading-none">
                    {monthNames[month]} {year}
                  </h3>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    Standard Academic Term Matrix
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevMonth}
                  className="h-9 w-9 bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-white rounded-lg flex items-center justify-center border border-white/10"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="h-9 w-9 bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-white rounded-lg flex items-center justify-center border border-white/10"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 border-b border-slate-50 bg-slate-50/50 py-3 text-center">
              {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
                <span
                  key={day}
                  className="text-[9px] font-black text-slate-400 tracking-widest"
                >
                  {day}
                </span>
              ))}
            </div>

            {/* 42 Cell Calendar Matrix */}
            <div className="grid grid-cols-7 bg-slate-100/30 gap-px p-1">
              {isLoading ? (
                Array.from({ length: 42 }).map((_, i) => (
                  <div key={i} className="bg-white aspect-square p-2">
                    <Skeleton className="h-4 w-6 rounded" />
                    <Skeleton className="h-2 w-full mt-2 rounded" />
                  </div>
                ))
              ) : (
                calendarCells.map(({ date, dateStr, isCurrentMonth }) => {
                  const dayEvents = getEventsForDay(dateStr);
                  const isSelected = dateStr === selectedDateStr;
                  const isToday =
                    new Date().toISOString().split("T")[0] === dateStr;

                  return (
                    <div
                      key={dateStr}
                      onClick={() => setSelectedDateStr(dateStr)}
                      onDoubleClick={() => canManage && handleOpenAddModal(dateStr)}
                      className={cn(
                        "bg-white aspect-square p-2 flex flex-col justify-between cursor-pointer border border-transparent transition-all group relative select-none",
                        isCurrentMonth ? "text-slate-800" : "text-slate-300 opacity-40",
                        isSelected && "z-10 shadow-[0_0_15px_rgba(79,70,229,0.15)] ring-2 ring-indigo-600/90",
                        isToday && !isSelected && "ring-1 ring-slate-200 bg-slate-50/50"
                      )}
                    >
                      {/* Top Row: Date and Today Highlight */}
                      <div className="flex items-center justify-between">
                        <span
                          className={cn(
                            "text-xs font-black h-6 w-6 rounded-full flex items-center justify-center font-heading transition-colors",
                            isToday &&
                            !isSelected &&
                            "bg-indigo-600 text-white shadow-sm shadow-indigo-100",
                            isSelected && "bg-slate-900 text-white"
                          )}
                        >
                          {date.getDate()}
                        </span>

                        {/* Interactive Plus on Hover */}
                        {canManage && isCurrentMonth && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenAddModal(dateStr);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-500"
                          >
                            <Plus size={10} />
                          </button>
                        )}
                      </div>

                      {/* Event Badges Layer - Large Screen */}
                      <div className="hidden lg:block space-y-1 mt-1 overflow-hidden max-h-[70%]">
                        {dayEvents.slice(0, 3).map((item) => {
                          const cat = getCategoryStyles(item.type);
                          return (
                            <div
                              key={item.id}
                              title={item.title}
                              className={cn(
                                "text-[9px] font-bold px-1.5 py-0.5 rounded truncate border transition-all flex items-center gap-1",
                                cat.bg
                              )}
                            >
                              <div className={cn("h-1 w-1 rounded-full", cat.dot)} />
                              <span className="truncate uppercase tracking-tight text-[8px] font-black">
                                {item.title}
                              </span>
                            </div>
                          );
                        })}

                        {dayEvents.length > 3 && (
                          <div className="text-[7.5px] font-black text-slate-400 text-center uppercase tracking-widest">
                            + {dayEvents.length - 3} MORE
                          </div>
                        )}
                      </div>

                      {/* Event Dots Layer - Mobile/Tablet Screens */}
                      <div className="lg:hidden flex justify-center gap-1 mt-1.5 flex-wrap">
                        {dayEvents.slice(0, 3).map((item) => {
                          const cat = getCategoryStyles(item.type);
                          return (
                            <div
                              key={item.id}
                              title={item.title}
                              className={cn("h-1.5 w-1.5 rounded-full shrink-0", cat.dot)}
                            />
                          );
                        })}
                        {dayEvents.length > 3 && (
                          <span className="text-[7px] font-black text-slate-400 leading-none">
                            +
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Color Legend Box */}
          <div className="bg-white rounded-[20px] p-6 border border-slate-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Term Legend Schema:
            </span>
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="h-3 w-3 rounded-full bg-[#8B5CF6] shadow-sm shadow-[#8B5CF6]/50" />
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                  Academic Event
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="h-3 w-3 rounded-full bg-[#6366F1] shadow-sm shadow-[#6366F1]/50" />
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                  Notice / Circular
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="h-3 w-3 rounded-full bg-[#EF4444] shadow-sm shadow-[#EF4444]/50" />
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                  School Holiday
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="h-3 w-3 rounded-full bg-[#F59E0B] shadow-sm shadow-[#F59E0B]/50" />
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                  Gazetted closure
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Event details list */}
        <div className="lg:col-span-4 space-y-6">

          {/* ── School Timings Card ── */}
          <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-50 bg-[#0F172A] text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest  leading-none flex items-center gap-2">
                  <Clock size={15} className="text-indigo-400" /> School Timings
                </h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Summer & Winter schedule</p>
              </div>
              {canManage && !timingEdit && (
                <button
                  onClick={() => { setTimingEdit(true); setTimingDraft(JSON.parse(JSON.stringify(timings))); }}
                  className="h-8 px-3 bg-white/10 hover:bg-white/20 text-white text-[9px] font-black uppercase tracking-widest rounded-lg border border-white/10 flex items-center gap-1.5 transition-all"
                >
                  <Edit3 size={11} /> Edit
                </button>
              )}
            </div>

            <div className="p-5 space-y-4">
              {/* Summer */}
              <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                    <Sun size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Summer Timing</p>
                    {timingEdit ? (
                      <Input
                        value={timingDraft?.summer?.months || ''}
                        onChange={(e) => setTimingDraft((d: any) => ({ ...d, summer: { ...d.summer, months: e.target.value } }))}
                        className="h-8 text-xs font-bold text-amber-700 bg-white border border-amber-200 mt-1 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 w-44"
                        placeholder="e.g. April – September"
                      />
                    ) : (
                      <p className="text-[9px] font-bold text-amber-500">{timings.summer?.months}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock size={13} className="text-amber-600 shrink-0" />
                  {timingEdit ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input type="time" value={timingDraft?.summer?.startTime || ''} onChange={(e) => setTimingDraft((d: any) => ({ ...d, summer: { ...d.summer, startTime: e.target.value } }))} className="h-8 text-xs font-bold flex-1" />
                      <span className="text-[10px] text-slate-400 font-bold">to</span>
                      <Input type="time" value={timingDraft?.summer?.endTime || ''} onChange={(e) => setTimingDraft((d: any) => ({ ...d, summer: { ...d.summer, endTime: e.target.value } }))} className="h-8 text-xs font-bold flex-1" />
                    </div>
                  ) : (
                    <p className="text-sm font-black text-slate-900">
                      {timings.summer?.startTime} – {timings.summer?.endTime}
                    </p>
                  )}
                </div>
              </div>

              {/* Winter */}
              <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                    <Snowflake size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Winter Timing</p>
                    {timingEdit ? (
                      <Input
                        value={timingDraft?.winter?.months || ''}
                        onChange={(e) => setTimingDraft((d: any) => ({ ...d, winter: { ...d.winter, months: e.target.value } }))}
                        className="h-8 text-xs font-bold text-blue-700 bg-white border border-blue-200 mt-1 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 w-44"
                        placeholder="e.g. October – March"
                      />
                    ) : (
                      <p className="text-[9px] font-bold text-blue-500">{timings.winter?.months}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock size={13} className="text-blue-600 shrink-0" />
                  {timingEdit ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input type="time" value={timingDraft?.winter?.startTime || ''} onChange={(e) => setTimingDraft((d: any) => ({ ...d, winter: { ...d.winter, startTime: e.target.value } }))} className="h-8 text-xs font-bold flex-1" />
                      <span className="text-[10px] text-slate-400 font-bold">to</span>
                      <Input type="time" value={timingDraft?.winter?.endTime || ''} onChange={(e) => setTimingDraft((d: any) => ({ ...d, winter: { ...d.winter, endTime: e.target.value } }))} className="h-8 text-xs font-bold flex-1" />
                    </div>
                  ) : (
                    <p className="text-sm font-black text-slate-900">
                      {timings.winter?.startTime} – {timings.winter?.endTime}
                    </p>
                  )}
                </div>
              </div>

              {/* Save / Cancel */}
              {timingEdit && (
                <div className="flex gap-2 pt-1">
                  <Button
                    onClick={() => saveTimingsMutation.mutate(timingDraft)}
                    disabled={saveTimingsMutation.isPending}
                    className="flex-1 bg-slate-900 text-white h-9 text-[10px] font-black uppercase tracking-widest rounded-xl gap-2"
                  >
                    {saveTimingsMutation.isPending ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                    Save Timings
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => { setTimingEdit(false); setTimingDraft(null); }}
                    className="h-9 px-4 text-[10px] font-black uppercase tracking-widest rounded-xl border-slate-200"
                  >
                    <X size={13} />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Selected Date Card */}
          <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden flex flex-col min-h-[350px]">
            <div className="p-6 border-b border-slate-50 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest ">
                  Agenda Registry
                </h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  {new Date(selectedDateStr).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "short",
                    day: "numeric"
                  })}
                </p>
              </div>

              {canManage && (
                <Button
                  onClick={() => handleOpenAddModal(selectedDateStr)}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/10 hover:text-white rounded-lg"
                >
                  <Plus size={16} />
                </Button>
              )}
            </div>

            <div className="flex-1 p-6 space-y-4 overflow-y-auto no-scrollbar">
              {selectedDayEvents.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center py-10 text-slate-300">
                  <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <Sparkles size={24} strokeWidth={1.5} className="text-slate-400 animate-pulse" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 text-center">
                    Rest & Self Study Day
                  </p>
                  <p className="text-[9px] font-medium text-slate-400 mt-1 text-center">
                    No academic events scheduled
                  </p>
                </div>
              ) : (
                selectedDayEvents.map((item) => {
                  const cat = getCategoryStyles(item.type);
                  return (
                    <div
                      key={item.id}
                      className="group border border-slate-100 rounded-xl p-4 bg-slate-50/50 hover:bg-slate-50 hover:shadow-sm transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className={cn("h-2 w-2 rounded-full", cat.dot)} />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                              {cat.label}
                            </span>
                          </div>
                          <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight leading-snug">
                            {item.title}
                          </h4>
                        </div>

                        {canManage && (
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleOpenEditModal(item)}
                              className="h-6 w-6 rounded bg-white hover:bg-indigo-50 hover:text-indigo-600 flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm transition-all"
                            >
                              <Edit3 size={11} />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="h-6 w-6 rounded bg-white hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm transition-all"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        )}
                      </div>

                      {item.description && (
                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                          {item.description}
                        </p>
                      )}

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[9px] text-slate-500 font-black uppercase tracking-wider">
                        <div className="flex items-center gap-1.5 truncate">
                          <Clock size={11} className="text-slate-400 shrink-0" />
                          <span className="truncate">{item.time}</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <MapPin size={11} className="text-slate-400 shrink-0" />
                          <span className="truncate">{item.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate col-span-2 mt-1">
                          <Users size={11} className="text-slate-400 shrink-0" />
                          <span className="truncate">Cohort: {item.participants}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Upcoming Schedule list */}
          <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-50 bg-[#0F172A] text-white">
              <h3 className="text-sm font-black uppercase tracking-widest  leading-none">
                Calendar Chronicle
              </h3>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                Unified Schedule Registry & Search
              </p>
            </div>

            <div className="p-4 border-b border-slate-50 space-y-3 bg-slate-50/20">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-400" />
                <Input
                  placeholder="Filter schedule..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-white h-9 border-slate-200 rounded-lg text-xs font-semibold focus:ring-slate-900"
                />
              </div>

              <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {[
                  { value: "ALL", label: "ALL" },
                  { value: "EVENT", label: "EVENTS" },
                  { value: "NOTICE", label: "NOTICES" },
                  { value: "HOLIDAY", label: "HOLIDAYS" },
                  { value: "GOVT_HOLIDAY", label: "GAZETTED" }
                ].map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setTypeFilter(tab.value)}
                    className={cn(
                      "px-2.5 py-1 text-[8.5px] font-black uppercase tracking-wider rounded-md border transition-all",
                      typeFilter === tab.value
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-500 border-slate-100 hover:bg-slate-50"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 p-6 space-y-4 max-h-[380px] overflow-y-auto no-scrollbar">
              {filteredEvents.length === 0 ? (
                <div className="py-10 text-center text-slate-300 space-y-2">
                  <Info size={20} className="mx-auto text-slate-300" />
                  <p className="text-[9px] font-black uppercase tracking-widest">
                    No matching calendar entries
                  </p>
                </div>
              ) : (
                filteredEvents.slice(0, 10).map((item) => {
                  const cat = getCategoryStyles(item.type);
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedDateStr(item.date)}
                      className={cn(
                        "group p-3.5 rounded-xl border border-slate-100 bg-white hover:bg-slate-50/50 cursor-pointer transition-all flex items-center justify-between gap-4",
                        selectedDateStr === item.date &&
                        "border-indigo-100 bg-indigo-50/10"
                      )}
                    >
                      <div className="space-y-1 max-w-[75%]">
                        <div className="flex items-center gap-2">
                          <span className={cn("h-1.5 w-1.5 rounded-full", cat.dot)} />
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                            {cat.label}
                          </span>
                        </div>
                        <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-tight truncate leading-none">
                          {item.title}
                        </h4>
                        <p className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest mt-1">
                          {new Date(item.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric"
                          })}
                          {item.endDate && item.endDate !== item.date && (
                            <> - {new Date(item.endDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric"
                            })}</>
                          )}
                        </p>
                      </div>

                      <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
                        <CalendarIcon size={12} strokeWidth={2.5} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>

      <CommitCalendarEntryModal
        isOpen={showModal}
        onOpenChange={setShowModal}
        editingEvent={editingEvent}
        selectedDateStr={selectedDateStr}
        onSubmit={handleModalSubmit}
        isPending={saveMutation.isPending}
      />

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setEventToDelete(null);
        }}
        onConfirm={() => {
          if (eventToDelete) {
            deleteMutation.mutate(eventToDelete);
            setDeleteConfirmOpen(false);
            setEventToDelete(null);
          }
        }}
        title="Delete Event?"
        description="Are you sure you want to permanently delete this event from the academic calendar?"
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
