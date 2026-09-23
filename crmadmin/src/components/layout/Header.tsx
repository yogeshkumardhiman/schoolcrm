"use client";
import React, { useState, useEffect, useRef } from "react";
import { 
  Bell, 
  ChevronDown, 
  Layers,
  Search,
  Calendar as CalendarIcon,
  Megaphone,
  Clock,
  X,
  Users,
  Check
} from "lucide-react";
import { APP_CONFIG } from "@/constants/config";
import { usePathname, useRouter } from "next/navigation";
import { format } from "date-fns";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import client from "@/lib/client";
import { useAuth } from "@/components/AbilityProvider";
import { cn } from "@/lib/utils";
import { useSessionContext } from "@/contexts/SessionContext";

const TARGET_COLORS: Record<string, string> = {
  ALL:           "bg-indigo-100 text-indigo-700",
  TEACHER:       "bg-blue-100 text-blue-700",
  CLASS_TEACHER: "bg-cyan-100 text-cyan-700",
  PRINCIPAL:     "bg-purple-100 text-purple-700",
  ACCOUNTANT:    "bg-amber-100 text-amber-700",
  STAFF:         "bg-slate-100 text-slate-600",
  PARENTS:       "bg-green-100 text-green-700",
};

const LAST_READ_KEY = "crm_notices_last_read_at";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const { session: selectedSession, setSession: setSelectedSession } = useSessionContext();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [lastReadAt, setLastReadAt] = useState<number>(() => {
    if (typeof window !== "undefined") {
      return Number(localStorage.getItem(LAST_READ_KEY) || "0");
    }
    return 0;
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 📅 Smart Session Generator (April to March Logic)
  const academicSessions = React.useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const baseYear = currentMonth < 3 ? currentYear - 1 : currentYear;
    const sessions = [];
    for (let i = -2; i <= 1; i++) {
      const year = baseYear + i;
      sessions.push(`${year} - ${year + 1}`);
    }
    return sessions;
  }, []);

  // 🔔 Fetch latest 5 notices (role-filtered from backend) with 1 minute interval
  const { data: result } = useQuery<any>({
    queryKey: ["notices-header", user?.role],
    queryFn: () => client.get('/website/notices'),
    enabled: !!user,
    refetchInterval: 60000,     // Poll every 1 minute (60s) for new notices
    staleTime: 60000,           // Cache fresh for 1 minute
    refetchOnWindowFocus: false,
  });

  const recentNotices: any[] = (result?.notices || []).filter((n: any) => {
    // Hide outgoing broadcasts from the sender's own bell icon
    if (n.createdById === user?.id) return false;
    // Hide massive student/parent broadcasts from internal staff bell
    if (['FEE_DEFAULTERS', 'PARENTS', 'STUDENTS', 'ALL'].includes(n.targetRole) && !['STUDENT', 'PARENT'].includes(user?.role)) {
      // Allow if it was specifically an internal notice, but ALL/PARENTS are just spam for the admin bell
      // Wait, if target is ALL, it's for everyone including staff. So we keep 'ALL' but hide 'FEE_DEFAULTERS' and 'PARENTS'.
      if (['FEE_DEFAULTERS', 'PARENTS', 'STUDENTS'].includes(n.targetRole)) return false;
    }
    return true;
  });

  // Fetch today's substitutions for teacher
  const { data: mySubs = [] } = useQuery<any[]>({
    queryKey: ["my-substitutions-header", user?.id],
    enabled: !!user && (user?.role === "TEACHER" || user?.role === "CLASS_TEACHER"),
    queryFn: () => client.get('/staff/my-substitutions').catch(() => []),
    refetchInterval: 60000,
  });

  // Count unread = notices newer than lastReadAt timestamp + substitutions
  const unreadCount = recentNotices.filter(n => {
    return new Date(n.createdAt).getTime() > lastReadAt;
  }).length + mySubs.length;

  const hasUnread = unreadCount > 0 || mySubs.length > 0;

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // 🛡️ Hide Header on Authentication Pages
  const isAuthPage = pathname === "/login";
  if (isAuthPage) return null;

  const handleBellClick = () => {
    setDropdownOpen(prev => !prev);
  };

  const handleMarkAllRead = () => {
    const now = Date.now();
    setLastReadAt(now);
    if (typeof window !== "undefined") {
      localStorage.setItem(LAST_READ_KEY, String(now));
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-20 w-full items-center justify-between border-b border-slate-100 bg-white/80 px-8 backdrop-blur-md transition-all">
      <div className="flex items-center justify-between w-full">
        {/* 📅 Left: Academic Year + Date Picker */}
        <div className="flex items-center gap-6">
          <div className="relative flex items-center gap-3 px-4 py-2 bg-slate-900 rounded-lgxl shadow-lg shadow-slate-200 group transition-all">
             <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg pointer-events-none">
                <Layers size={16} strokeWidth={2.5} />
             </div>
             <select 
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
                className="bg-transparent text-[11px] font-black text-white outline-none cursor-pointer appearance-none uppercase  tracking-widest font-heading pr-4 relative z-10"
             >
                {academicSessions.map(s => (
                  <option key={s} value={s} className="bg-slate-900 text-white">{s}</option>
                ))}
             </select>
             <ChevronDown size={12} className="text-white/40 absolute right-4 z-0 pointer-events-none" />
          </div>

          <div className="flex items-center gap-4 px-4 py-2 bg-slate-50 border border-slate-100 rounded-lgxl hover:border-indigo-200 transition-all cursor-pointer group">
             <CalendarIcon size={16} className="text-slate-400 group-hover:text-indigo-600" />
             <div className="flex flex-col">
                <input 
                   type="date"
                   value={format(currentDate, "yyyy-MM-dd")}
                   onChange={(e) => setCurrentDate(new Date(e.target.value))}
                   className="bg-transparent text-[11px] font-black text-slate-900 outline-none cursor-pointer font-heading"
                />
             </div>
          </div>
        </div>

        {/* ⚡ Right: Bell + Search */}
        <div className="flex items-center gap-6">


          {/* 🔔 Bell Button with Smart Red Dot */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={handleBellClick}
              className={cn(
                "h-11 w-11 rounded-lgxl flex items-center justify-center transition-all relative border group shadow-sm cursor-pointer",
                dropdownOpen
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100"
                  : "bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 border-transparent hover:border-indigo-100"
              )}
              title={hasUnread ? `${unreadCount} new notifications` : "Notices"}
            >
              <Bell size={20} strokeWidth={2} className={cn("transition-transform", dropdownOpen && "scale-110")} />
              
              {/* 🔴 Red dot — ONLY shown when there are actual unread notices */}
              {hasUnread && !dropdownOpen && (
                <span className="absolute top-2.5 right-2.5 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm animate-pulse" />
              )}
              {/* Count badge for 3+ unread */}
              {hasUnread && unreadCount >= 3 && !dropdownOpen && (
                <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 bg-red-500 rounded-full border-2 border-white text-white text-[9px] font-black flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* 🔽 Dropdown Panel */}
            {dropdownOpen && (
              <div className="absolute right-0 top-14 w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 z-[100] overflow-hidden animate-in slide-in-from-top-2 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50 bg-slate-950">
                  <div className="flex items-center gap-2">
                    <Megaphone size={14} className="text-indigo-400" />
                    <span className="text-[11px] font-black text-white uppercase tracking-[3px]">Recent Notifications</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasUnread && (
                      <button
                        onClick={handleMarkAllRead}
                        className="flex items-center gap-1 text-[9px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest transition-colors cursor-pointer"
                      >
                        <Check size={10} /> Mark read
                      </button>
                    )}
                    <button
                      onClick={() => setDropdownOpen(false)}
                      className="h-6 w-6 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>

                {/* Today's Substitution Highlight Banner (If any) */}
                {mySubs.length > 0 && (
                  <div className="p-3.5 bg-amber-500 text-slate-950 border-b border-amber-600">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                        ⚡ Substitution Duty Today ({mySubs.length})
                      </span>
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          router.push('/staff/my-timetable');
                        }}
                        className="text-[9px] font-black uppercase underline bg-white/30 px-2 py-0.5 rounded cursor-pointer"
                      >
                        View Schedule →
                      </button>
                    </div>
                    {mySubs.map((sub: any, idx: number) => (
                      <p key={idx} className="text-xs font-bold mt-1 text-slate-950">
                        Period {sub.period} • Grade {sub.class}-{sub.section || 'A'} (In place of {sub.absentTeacher?.name || 'Faculty'})
                      </p>
                    ))}
                  </div>
                )}

                {/* Notice List */}
                <div className="divide-y divide-slate-50 max-h-[380px] overflow-y-auto">
                  {recentNotices.length === 0 && mySubs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-300">
                      <div className="h-14 w-14 bg-slate-50 rounded-full flex items-center justify-center">
                        <Bell size={22} strokeWidth={1.5} />
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-black uppercase tracking-[3px] text-slate-400">No Notices</p>
                        <p className="text-[9px] font-medium text-slate-300 mt-1">You're all caught up!</p>
                      </div>
                    </div>
                  ) : (
                    recentNotices.map((notice) => {
                      const isNew = new Date(notice.createdAt).getTime() > lastReadAt;
                      const target = notice.targetRole || "ALL";
                      const targetColor = TARGET_COLORS[target] || TARGET_COLORS["ALL"];

                      return (
                        <div
                          key={notice.id}
                          onClick={() => {
                            setDropdownOpen(false);
                            router.push("/notifications");
                          }}
                          className={cn(
                            "flex items-start gap-3 px-5 py-4 cursor-pointer hover:bg-slate-50 transition-colors",
                            isNew && "bg-indigo-50/40"
                          )}
                        >
                          {/* Unread indicator */}
                          <div className="mt-1.5 shrink-0">
                            {isNew ? (
                              <div className="h-2 w-2 rounded-full bg-red-500 shadow-sm shadow-red-200" />
                            ) : (
                              <div className="h-2 w-2 rounded-full bg-slate-200" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "text-[11px] leading-snug line-clamp-1",
                              isNew ? "font-black text-slate-900" : "font-bold text-slate-700"
                            )}>
                              {notice.title}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5 line-clamp-1">
                              {notice.content || notice.message}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className={cn("text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md", targetColor)}>
                                {target === "ALL" ? "School Wide" : target}
                              </span>
                              <span className="flex items-center gap-1 text-[9px] text-slate-300 font-medium">
                                <Clock size={8} />
                                {new Date(notice.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer */}
                <div
                  className="px-5 py-3 bg-slate-50 border-t border-slate-100 cursor-pointer hover:bg-indigo-50 transition-colors"
                  onClick={() => {
                    setDropdownOpen(false);
                    router.push("/notifications");
                  }}
                >
                  <p className="text-[10px] font-black text-center text-slate-400 uppercase tracking-[3px] hover:text-indigo-600 transition-colors">
                    View All Notices →
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
