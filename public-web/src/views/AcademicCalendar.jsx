"use client";

import React, { useState, useEffect, useMemo } from "react";
import { fetchSchoolInfo, fetchEvents } from "@/services/school";
import { STRINGS, getSchoolName, getSessionString } from "@/constants/strings";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users,
  BookOpen,
  Trophy,
  PartyPopper,
  Star,
  Briefcase,
  AlertCircle,
  Sun,
  Snowflake,
  List,
  LayoutGrid,
  Filter,
  Search,
  X,
  ArrowRight,
  Sparkles
} from "lucide-react";

// ── Helpers ──────────────────────────────────────────────────────────────────
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const EVENT_TYPES = {
  HOLIDAY:   { label: "Holiday",    color: "#EF4444", bg: "rgba(239,68,68,0.12)",   icon: Sun },
  EXAM:      { label: "Exam",       color: "#F59E0B", bg: "rgba(245,158,11,0.12)",  icon: BookOpen },
  EVENT:     { label: "Event",      color: "#6366F1", bg: "rgba(99,102,241,0.12)",  icon: PartyPopper },
  SPORTS:    { label: "Sports",     color: "#10B981", bg: "rgba(16,185,129,0.12)",  icon: Trophy },
  CULTURAL:  { label: "Cultural",   color: "#EC4899", bg: "rgba(236,72,153,0.12)",  icon: Star },
  MEETING:   { label: "Meeting",    color: "#8B5CF6", bg: "rgba(139,92,246,0.12)",  icon: Briefcase },
  VACATION:  { label: "Vacation",   color: "#06B6D4", bg: "rgba(6,182,212,0.12)",   icon: Snowflake },
  ALERT:     { label: "Notice",     color: "#F97316", bg: "rgba(249,115,22,0.12)",  icon: AlertCircle },
};

const DEFAULT_CBSE_EVENTS = [
  { id: "1", title: "New Academic Session 2026-27 Begins", date: "2026-04-01", type: "EVENT", description: "Classes commence for Nursery to XII for the new academic session.", location: "School Campus" },
  { id: "2", title: "Mahavir Jayanti", date: "2026-04-10", type: "HOLIDAY", description: "Gazetted School Holiday.", location: "All Wings" },
  { id: "3", title: "Good Friday & Ambedkar Jayanti", date: "2026-04-14", type: "HOLIDAY", description: "Gazetted School Holiday.", location: "All Wings" },
  { id: "4", title: "First Periodic Assessment (PA-1)", date: "2026-05-15", endDate: "2026-05-22", type: "EXAM", description: "Unit tests for Classes I to XII.", location: "Examination Halls" },
  { id: "5", title: "Summer Vacation 2026", date: "2026-05-25", endDate: "2026-06-30", type: "VACATION", description: "Summer vacation for all scholars. Holiday homework available online.", location: "All Wings" },
  { id: "6", title: "School Reopens after Summer Break", date: "2026-07-01", type: "EVENT", description: "Normal school timings resume.", location: "School Campus" },
  { id: "7", title: "Independence Day Celebration", date: "2026-08-15", type: "CULTURAL", description: "Flag hoisting, patriotic cultural performances, and march past.", location: "Main Ground" },
  { id: "8", title: "Raksha Bandhan & Janmashtami", date: "2026-08-28", type: "HOLIDAY", description: "School Holiday.", location: "All Wings" },
  { id: "9", title: "Mid-Term / Half Yearly Examinations", date: "2026-09-14", endDate: "2026-09-26", type: "EXAM", description: "Term-1 comprehensive board-pattern examinations.", location: "Examination Halls" },
  { id: "10", title: "Mid-Term PTM & Report Card Day", date: "2026-10-03", type: "MEETING", description: "Parent-Teacher interaction and Term-1 performance review.", location: "Respective Classrooms" },
  { id: "11", title: "Mahatma Gandhi Jayanti & Dussehra Break", date: "2026-10-02", endDate: "2026-10-06", type: "HOLIDAY", description: "Festive Holiday Break.", location: "All Wings" },
  { id: "12", title: "Diwali & Chhath Puja Holidays", date: "2026-11-08", endDate: "2026-11-15", type: "VACATION", description: "Deepawali festive vacations.", location: "All Wings" },
  { id: "13", title: "Annual Sports Meet & Athletic Championship", date: "2026-11-25", endDate: "2026-11-27", type: "SPORTS", description: "Inter-house track & field events, relay races, and trophy awards.", location: "Athletic Arena" },
  { id: "14", title: "Annual Cultural Fest & Exhibition", date: "2026-12-18", type: "CULTURAL", description: "Grand science, robotics, and creative arts exhibition.", location: "Auditorium" },
  { id: "15", title: "Winter Break & Christmas Holidays", date: "2026-12-25", endDate: "2027-01-08", type: "VACATION", description: "Winter vacation for scholars.", location: "All Wings" },
  { id: "16", title: "Republic Day Celebration", date: "2027-01-26", type: "CULTURAL", description: "Tri-colour flag hoisting, parade, and student honors.", location: "Main Ground" },
  { id: "17", title: "Pre-Board Examinations (Classes X & XII)", date: "2027-02-05", endDate: "2027-02-18", type: "EXAM", description: "Full syllabus pre-board simulation for board scholars.", location: "Examination Halls" },
  { id: "18", title: "CBSE Annual Final Examinations", date: "2027-03-01", endDate: "2027-03-20", type: "EXAM", description: "Annual term-end exams for Nursery to Class IX & XI.", location: "Examination Halls" }
];

function getTypeInfo(type) {
  return EVENT_TYPES[type] || EVENT_TYPES.EVENT;
}

function parseDate(str) {
  if (!str) return null;
  // Handles YYYY-MM-DD or ISO string
  return new Date(str.includes("T") ? str : str + "T00:00:00");
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDay(year, month) {
  return new Date(year, month, 1).getDay();
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function AcademicCalendar() {
  const today = new Date();
  const [currentYear, setCurrentYear]   = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [events, setEvents]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [view, setView]                 = useState("calendar"); // calendar | list
  const [filterType, setFilterType]     = useState("ALL");
  const [search, setSearch]             = useState("");
  const [selected, setSelected]         = useState(null); // selected date string
  const [schoolTimings, setSchoolTimings] = useState(null);
  const [schoolInfo, setSchoolInfo]     = useState(null);

  // Determine active timing: summer = April(3)–September(8), winter = Oct(9)–March(2)
  const currentMonthIdx = today.getMonth(); // 0-indexed
  const isSummerActive  = currentMonthIdx >= 3 && currentMonthIdx <= 8;

  // Fetch events from backend with robust fallback
  useEffect(() => {
    const load = async () => {
      try {
        const [evData, info] = await Promise.all([
          fetchEvents(),
          fetchSchoolInfo()
        ]);
        if (Array.isArray(evData) && evData.length > 0) {
          setEvents(evData);
        } else {
          setEvents(DEFAULT_CBSE_EVENTS);
        }
        const timings = info?.timings || {
          summer: { startTime: "07:30", endTime: "13:30", months: "April – September", label: "Summer Timing" },
          winter: { startTime: "08:00", endTime: "14:00", months: "October – March", label: "Winter Timing" }
        };
        setSchoolTimings(timings);
        if (info) setSchoolInfo(info);
      } catch (e) {
        console.error("Calendar fetch error:", e);
        setEvents(DEFAULT_CBSE_EVENTS);
        setSchoolTimings({
          summer: { startTime: "07:30", endTime: "13:30", months: "April – September", label: "Summer Timing" },
          winter: { startTime: "08:00", endTime: "14:00", months: "October – March", label: "Winter Timing" }
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Navigation ──
  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
    setSelected(null);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
    setSelected(null);
  };
  const goToday = () => { setCurrentYear(today.getFullYear()); setCurrentMonth(today.getMonth()); setSelected(null); };

  // ── Event lookup helpers ──
  const getEventsForDate = useMemo(() => (dateStr) => {
    return events.filter(ev => {
      const start = parseDate(ev.date);
      const end   = parseDate(ev.endDate || ev.date);
      const check = parseDate(dateStr);
      if (!start || !check) return false;
      return check >= start && check <= end;
    });
  }, [events]);

  const getEventsForMonth = useMemo(() => {
    return events.filter(ev => {
      const d = parseDate(ev.date);
      return d && d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });
  }, [events, currentYear, currentMonth]);

  // ── Calendar Grid ──
  const daysInMonth  = getDaysInMonth(currentYear, currentMonth);
  const firstDayIdx  = getFirstDay(currentYear, currentMonth);
  const calendarDays = [];
  for (let i = 0; i < firstDayIdx; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  const makeDate = (day) =>
    `${currentYear}-${String(currentMonth + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;

  const isToday = (day) =>
    day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();

  // ── Filtered List events ──
  const filteredList = useMemo(() => {
    return events
      .filter(ev => filterType === "ALL" || ev.type === filterType)
      .filter(ev => !search || ev.title?.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [events, filterType, search]);

  // ── Selected date events ──
  const selectedDateEvents = selected ? getEventsForDate(selected) : [];

  // ── Stats ──
  const stats = useMemo(() => {
    const total    = events.length;
    const holidays = events.filter(e => e.type === "HOLIDAY" || e.type === "VACATION").length;
    const exams    = events.filter(e => e.type === "EXAM").length;
    const upcoming = events.filter(e => parseDate(e.date) >= today).length;
    return { total, holidays, exams, upcoming };
  }, [events]);

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#0F172A] font-sans antialiased">
      {/* ── Hero Banner ── */}
      <div className="relative bg-gradient-to-b from-slate-50 via-slate-100/60 to-white border-b border-slate-200 overflow-hidden pt-24 pb-16">
        <div className="relative max-w-7xl mx-auto px-6">
          {/* School Identity Row */}
          <div className="flex items-center gap-4 mb-6">
            {schoolInfo?.logoImage ? (
              <img
                src={schoolInfo.logoImage}
                alt={schoolInfo.schoolName || "School Logo"}
                className="w-16 h-16 rounded-full object-cover border-2 border-slate-200 shadow-md shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center shrink-0">
                <span className="text-[var(--primary)] text-xs font-black uppercase">SDM</span>
              </div>
            )}
            <div>
              <p className="text-[#0F172A] font-black text-lg uppercase tracking-wide leading-tight">
                {schoolInfo?.schoolName || "SDM Public School"}
              </p>
              <p className="text-slate-500 text-xs sm:text-sm mt-0.5 font-medium">
                {schoolInfo?.navbar_config?.tagline || "CBSE Affiliated Senior Secondary Institution"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[var(--primary)] text-xs sm:text-sm font-bold uppercase tracking-wider mb-2">
            <Sparkles size={16} />
            <span>Academic Year {currentYear}-{currentYear + 1}</span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-black text-[#0F172A] tracking-tight mb-3">
            Academic Calendar & <span className="bg-gradient-to-r from-[var(--primary)] via-indigo-600 to-purple-600 bg-clip-text text-transparent">Key Events</span>
          </h1>
          <p className="text-slate-600 text-base sm:text-lg max-w-2xl leading-relaxed">
            Stay informed about all school events, examination schedules, gazetted holidays, and parent-teacher interactions.
          </p>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { label: "Total Events", value: stats.total, color: "text-[var(--primary)]", bg: "bg-blue-50 border-blue-100", Icon: CalendarDays },
              { label: "Upcoming", value: stats.upcoming, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100", Icon: ArrowRight },
              { label: "Exams", value: stats.exams, color: "text-amber-600", bg: "bg-amber-50 border-amber-100", Icon: BookOpen },
              { label: "Holidays & Vacations", value: stats.holidays, color: "text-red-600", bg: "bg-red-50 border-red-100", Icon: Sun },
            ].map((s, i) => (
              <div key={i} className={`${s.bg} border rounded-2xl p-5 shadow-xs`}>
                <s.Icon size={20} className={`${s.color} mb-2`} />
                <div className={`text-3xl font-black ${s.color} font-mono`}>{s.value}</div>
                <div className="text-xs sm:text-sm text-slate-600 mt-1 font-bold">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Controls ── */}
      <div className="max-w-7xl mx-auto px-6 -mt-6 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-4 flex flex-wrap items-center gap-3">
          {/* View toggle */}
          <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
            <button
              onClick={() => setView("calendar")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-all ${view === "calendar" ? "bg-white shadow text-indigo-600" : "text-slate-500 hover:text-slate-700"}`}
            >
              <LayoutGrid size={15} /> Calendar
            </button>
            <button
              onClick={() => setView("list")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-all ${view === "list" ? "bg-white shadow text-indigo-600" : "text-slate-500 hover:text-slate-700"}`}
            >
              <List size={15} /> All Events
            </button>
          </div>

          {/* Search (list view only) */}
          {view === "list" && (
            <div className="relative flex-1 min-w-48">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><X size={12} /></button>}
            </div>
          )}

          {/* Type filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={14} className="text-slate-400 shrink-0" />
            {["ALL", ...Object.keys(EVENT_TYPES)].map(t => {
              const info = t === "ALL" ? null : getTypeInfo(t);
              return (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  style={filterType === t && info ? { backgroundColor: info.bg, color: info.color, borderColor: info.color + "40" } : {}}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    filterType === t
                      ? "shadow-sm"
                      : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  {t === "ALL" ? "All Types" : info.label}
                </button>
              );
            })}
          </div>

          <button
            onClick={goToday}
            className="ml-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors"
          >
            Today
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-400 gap-4">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-sm font-medium">Loading calendar data...</p>
          </div>
        ) : view === "calendar" ? (
          /* ── CALENDAR VIEW ── */
          <div className="grid lg:grid-cols-12 gap-6">

            {/* Calendar Grid */}
            <div className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              {/* Month Nav */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-indigo-600 to-purple-600">
                <button onClick={prevMonth} className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition">
                  <ChevronLeft size={18} />
                </button>
                <div className="text-center">
                  <h2 className="text-xl font-black text-white tracking-wide">
                    {MONTHS[currentMonth]} {currentYear}
                  </h2>
                  <p className="text-white/60 text-xs mt-0.5">{getEventsForMonth.length} events this month</p>
                </div>
                <button onClick={nextMonth} className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition">
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 border-b border-slate-100">
                {DAYS.map(d => (
                  <div key={d} className="text-center py-3 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                    {d}
                  </div>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7">
                {calendarDays.map((day, idx) => {
                  if (!day) return <div key={`empty-${idx}`} className="h-24 border-b border-r border-slate-50" />;
                  const ds = makeDate(day);
                  const dayEvents = getEventsForDate(ds).filter(
                    ev => filterType === "ALL" || ev.type === filterType
                  );
                  const isSelected = selected === ds;
                  const isSun = (firstDayIdx + day - 1) % 7 === 0;

                  return (
                    <div
                      key={day}
                      onClick={() => setSelected(isSelected ? null : ds)}
                      className={`relative h-24 border-b border-r border-slate-50 p-2 cursor-pointer transition-all hover:bg-indigo-50/60 group ${
                        isSelected ? "bg-indigo-50 ring-2 ring-inset ring-indigo-400" : ""
                      }`}
                    >
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold transition-colors ${
                        isToday(day)
                          ? "bg-indigo-600 text-white shadow"
                          : isSun
                          ? "text-red-500"
                          : "text-slate-700 group-hover:bg-indigo-600 group-hover:text-white"
                      }`}>
                        {day}
                      </span>
                      <div className="mt-1 space-y-0.5 overflow-hidden">
                        {dayEvents.slice(0, 2).map((ev, i) => {
                          const info = getTypeInfo(ev.type);
                          return (
                            <div
                              key={i}
                              className="text-[9px] font-bold truncate px-1.5 py-0.5 rounded"
                              style={{ backgroundColor: info.bg, color: info.color }}
                            >
                              {ev.title}
                            </div>
                          );
                        })}
                        {dayEvents.length > 2 && (
                          <div className="text-[9px] text-slate-400 font-bold pl-1">+{dayEvents.length - 2} more</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Panel */}
            <div className="lg:col-span-4 space-y-5">
              {/* Selected date events */}
              {selected ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Selected Date</p>
                      <h3 className="text-base font-black text-slate-800 mt-0.5">
                        {new Date(selected + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" })}
                      </h3>
                    </div>
                    <button onClick={() => setSelected(null)} className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition">
                      <X size={13} />
                    </button>
                  </div>
                  <div className="p-4 space-y-3">
                    {selectedDateEvents.length === 0 ? (
                      <div className="text-center py-8 text-slate-400">
                        <CalendarDays size={28} className="mx-auto mb-2 opacity-40" />
                        <p className="text-sm font-medium">No events on this day</p>
                      </div>
                    ) : (
                      selectedDateEvents.map((ev, i) => <EventCard key={i} ev={ev} />)
                    )}
                  </div>
                </div>
              ) : (
                /* This month's events */
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">This Month</p>
                    <h3 className="text-base font-black text-slate-800 mt-0.5">{MONTHS[currentMonth]} Events</h3>
                  </div>
                  <div className="p-4 space-y-3 max-h-[480px] overflow-y-auto">
                    {getEventsForMonth.length === 0 ? (
                      <div className="text-center py-8 text-slate-400">
                        <CalendarDays size={28} className="mx-auto mb-2 opacity-40" />
                        <p className="text-sm font-medium">No events this month</p>
                      </div>
                    ) : (
                      getEventsForMonth
                        .filter(ev => filterType === "ALL" || ev.type === filterType)
                        .sort((a, b) => new Date(a.date) - new Date(b.date))
                        .map((ev, i) => <EventCard key={i} ev={ev} />)
                    )}
                  </div>
                </div>
              )}

              {/* School Timings Card */}
              {schoolTimings && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                    <Clock size={14} className="text-indigo-500" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">School Timings</p>
                      <h3 className="text-sm font-black text-slate-800">Summer &amp; Winter Schedule</h3>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    {/* Summer Timing */}
                    <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      isSummerActive
                        ? "bg-amber-50 border-amber-200 ring-2 ring-amber-300"
                        : "bg-slate-50 border-slate-100"
                    }`}>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isSummerActive ? "bg-amber-100" : "bg-slate-100"
                      }`}>
                        <Sun size={16} className={isSummerActive ? "text-amber-500" : "text-slate-400"} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-xs font-black uppercase tracking-wide ${isSummerActive ? "text-amber-700" : "text-slate-500"}`}>
                            Summer Timing
                          </p>
                          {isSummerActive && (
                            <span className="text-[9px] font-black bg-amber-500 text-white px-1.5 py-0.5 rounded-full">ACTIVE</span>
                          )}
                        </div>
                        <p className={`text-sm font-black mt-0.5 ${isSummerActive ? "text-amber-900" : "text-slate-700"}`}>
                          {schoolTimings.summer?.startTime || "07:30"} – {schoolTimings.summer?.endTime || "13:30"}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                          {schoolTimings.summer?.months || "April – September"}
                        </p>
                      </div>
                    </div>

                    {/* Winter Timing */}
                    <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      !isSummerActive
                        ? "bg-blue-50 border-blue-200 ring-2 ring-blue-300"
                        : "bg-slate-50 border-slate-100"
                    }`}>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        !isSummerActive ? "bg-blue-100" : "bg-slate-100"
                      }`}>
                        <Snowflake size={16} className={!isSummerActive ? "text-blue-500" : "text-slate-400"} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-xs font-black uppercase tracking-wide ${!isSummerActive ? "text-blue-700" : "text-slate-500"}`}>
                            Winter Timing
                          </p>
                          {!isSummerActive && (
                            <span className="text-[9px] font-black bg-blue-500 text-white px-1.5 py-0.5 rounded-full">ACTIVE</span>
                          )}
                        </div>
                        <p className={`text-sm font-black mt-0.5 ${!isSummerActive ? "text-blue-900" : "text-slate-700"}`}>
                          {schoolTimings.winter?.startTime || "09:00"} – {schoolTimings.winter?.endTime || "15:00"}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                          {schoolTimings.winter?.months || "October – March"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Type Legend */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Event Types</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(EVENT_TYPES).map(([key, info]) => (
                    <button
                      key={key}
                      onClick={() => setFilterType(filterType === key ? "ALL" : key)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                        filterType === key ? "ring-2" : "border-transparent"
                      }`}
                      style={{
                        backgroundColor: info.bg,
                        color: info.color,
                        ringColor: info.color,
                        borderColor: filterType === key ? info.color : "transparent"
                      }}
                    >
                      <info.icon size={12} />
                      {info.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ── LIST VIEW ── */
          <div>
            {filteredList.length === 0 ? (
              <div className="text-center py-24 text-slate-400">
                <CalendarDays size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-lg font-semibold">No events found</p>
                <p className="text-sm mt-1">Try changing your filter or search term</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Group by month */}
                {groupByMonth(filteredList).map(({ month, year, evs }) => (
                  <div key={`${month}-${year}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-indigo-600 text-white text-xs font-black px-4 py-2 rounded-xl">
                        {MONTHS[month]} {year}
                      </div>
                      <div className="flex-1 h-px bg-slate-200" />
                      <span className="text-xs text-slate-400 font-semibold">{evs.length} events</span>
                    </div>
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 mb-2">
                      {evs.map((ev, i) => <EventCardFull key={i} ev={ev} />)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function EventCard({ ev }) {
  const info = getTypeInfo(ev.type);
  const dateObj = parseDate(ev.date);
  return (
    <div className="flex gap-3 p-3 rounded-xl border transition-all hover:shadow-sm"
      style={{ borderColor: info.color + "30", backgroundColor: info.bg }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: info.color + "20" }}>
        <info.icon size={16} style={{ color: info.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-800 truncate">{ev.title}</p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded"
            style={{ backgroundColor: info.color + "25", color: info.color }}>
            {info.label}
          </span>
          {dateObj && (
            <span className="text-[11px] text-slate-500 font-medium">
              {dateObj.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              {ev.endDate && ev.endDate !== ev.date && ` – ${parseDate(ev.endDate)?.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`}
            </span>
          )}
        </div>
        {ev.time && ev.time !== "ALL DAY" && (
          <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
            <Clock size={9} /> {ev.time}
          </div>
        )}
      </div>
    </div>
  );
}

function EventCardFull({ ev }) {
  const info = getTypeInfo(ev.type);
  const dateObj = parseDate(ev.date);
  const endDateObj = ev.endDate && ev.endDate !== ev.date ? parseDate(ev.endDate) : null;
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden group">
      {/* Color bar */}
      <div className="h-1.5 w-full" style={{ backgroundColor: info.color }} />
      <div className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: info.bg }}>
            <info.icon size={18} style={{ color: info.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-800 text-base leading-tight">{ev.title}</h3>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full mt-1 inline-block"
              style={{ backgroundColor: info.bg, color: info.color }}>
              {info.label}
            </span>
          </div>
        </div>

        {ev.description && (
          <p className="text-sm text-slate-500 mb-3 leading-relaxed line-clamp-2">{ev.description}</p>
        )}

        <div className="space-y-1.5 text-xs text-slate-500">
          {dateObj && (
            <div className="flex items-center gap-2">
              <CalendarDays size={12} className="text-slate-400 shrink-0" />
              <span className="font-semibold text-slate-600">
                {dateObj.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                {endDateObj && ` — ${endDateObj.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`}
              </span>
            </div>
          )}
          {ev.time && ev.time !== "ALL DAY" && (
            <div className="flex items-center gap-2">
              <Clock size={12} className="text-slate-400 shrink-0" />
              <span>{ev.time}</span>
            </div>
          )}
          {ev.location && (
            <div className="flex items-center gap-2">
              <MapPin size={12} className="text-slate-400 shrink-0" />
              <span>{ev.location}</span>
            </div>
          )}
          {ev.participants && (
            <div className="flex items-center gap-2">
              <Users size={12} className="text-slate-400 shrink-0" />
              <span>{ev.participants}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Helpers ──
function groupByMonth(events) {
  const map = {};
  events.forEach(ev => {
    const d = parseDate(ev.date);
    if (!d) return;
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!map[key]) map[key] = { month: d.getMonth(), year: d.getFullYear(), evs: [] };
    map[key].evs.push(ev);
  });
  return Object.values(map).sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month);
}
