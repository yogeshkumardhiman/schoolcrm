"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "@bprogress/next/app";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  UserCheck,
  FileText,
  CreditCard,
  Bell,
  School,
  LogOut,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  ChevronUp,
  User as UserIcon,
  Globe,
  Smartphone,
  ChevronDown,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_CONFIG } from "@/constants/config";
import { useAuth } from "@/components/AbilityProvider";
import client from '@/lib/client';

interface NavSubItem {
  id: string;
  label: string;
  href: string;
  roles?: string[];
  permission?: string;
  badge?: string;
}

interface NavItem {
  id: string;
  label: string;
  icon: any;
  href?: string;
  roles: string[];
  permission?: string;
  subItems?: NavSubItem[];
}

interface MenuSection {
  title: string;
  items: NavItem[];
}

const menuSections: MenuSection[] = [
  {
    title: "MAIN",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/",
        roles: []
      },
    ]
  },
  {
    title: "STUDENT HUB",
    items: [
      {
        id: "students-group",
        label: "Student Management",
        icon: GraduationCap,
        roles: [],
        subItems: [
          { id: "all-students", label: "All Students", href: "/students", permission: 'student:read' },
          { id: "new-student", label: "Add New Student", href: "/students/new", permission: 'student:create' },
          { id: "student-promotion", label: "Admissions & Migration", href: "/academic/promotion", permission: 'student:update' },
          { id: "student-id-cards", label: "Student ID Cards", href: "/academic/id-card/search", permission: 'student:read' },
          { id: "my-students", label: "My Class Students", href: "/staff/my-students", permission: 'student:read' },
        ]
      }
    ]
  },
  {
    title: "ACADEMICS",
    items: [
      {
        id: "academics-group",
        label: "Academic Management",
        icon: School,
        roles: [],
        subItems: [
          { id: "classes", label: "Classes & Sections", href: "/classes", permission: 'academic:manage' },
          { id: "subjects", label: "Subjects & Curriculum", href: "/academic/subjects", permission: 'academic:read' },
          { id: "timetable", label: "Weekly Timetable", href: "/staff/my-timetable", permission: 'academic:read' },
          { id: "homework", label: "Daily Homework", href: "/homework", permission: 'homework:manage' },
          { id: "calendar", label: "Academic Calendar", href: "/calendar", permission: 'academic:read' },
        ]
      }
    ]
  },
  {
    title: "ATTENDANCE",
    items: [
      {
        id: "attendance-group",
        label: "Attendance Registry",
        icon: UserCheck,
        roles: [],
        subItems: [
          { id: "student-attendance", label: "Student Attendance", href: "/attendance", permission: 'attendance:mark' },
          { id: "staff-attendance-log", label: "Staff Attendance Log", href: "/portal/staff-governance/attendance", permission: 'staff:attendance:manage' },
          { id: "staff-leave-petitions", label: "Staff Leave Petitions", href: "/portal/staff-governance/leave-requests", permission: 'staff:leave:manage' },
          { id: "my-attendance", label: "My Attendance", href: "/staff/my-attendance" },
          { id: "my-leaves", label: "My Leaves", href: "/staff/my-leaves" },
        ]
      }
    ]
  },
  {
    title: "STAFF & HR",
    items: [
      {
        id: "staff-group",
        label: "Staff & HR",
        icon: Users,
        roles: [],
        subItems: [
          { id: "all-staff", label: "Staff Directory", href: "/staff", permission: 'staff:read' },
          { id: "add-staff", label: "Add Staff Member", href: "/staff/new", permission: 'staff:create' },
          { id: "payroll-staff", label: "Payroll & Salary", href: "/salary", permission: 'salary:read' },
          { id: "substitution-admin", label: "Substitution Hub", href: "/staff/substitution", permission: 'substitution:manage' },
          { id: "my-substitutions", label: "My Substitutions", href: "/staff/my-substitutions" },
        ]
      }
    ]
  },
  {
    title: "EXAMINATIONS",
    items: [
      {
        id: "exams-group",
        label: "Examination & Marks",
        icon: FileText,
        roles: [],
        subItems: [
          { id: "marks-entry", label: "Marks & Grades", href: "/marks", permission: 'exam:manage' },
          { id: "toppers", label: "Academic Toppers", href: "/toppers", permission: 'academic:read' },
        ]
      }
    ]
  },
  {
    title: "FINANCE",
    items: [
      {
        id: "finance-group",
        label: "Finance & Accounts",
        icon: CreditCard,
        roles: [],
        subItems: [
          { id: "fee-mgmt", label: "Fee Management", href: "/fees", permission: 'fee:read' },
          { id: "fee-structure", label: "Fee Structure", href: "/fees/structure", permission: 'fee:structure_manage' },
          { id: "transport-fleet", label: "Transport & Logistics", href: "/fees/transport", permission: 'transport:read' },
          { id: "finance-salary", label: "Staff Salary Slips", href: "/salary", permission: 'salary:read' },
        ]
      }
    ]
  },
  {
    title: "COMMUNICATION",
    items: [
      {
        id: "comms-group",
        label: "Communication",
        icon: Bell,
        roles: [],
        subItems: [
          { id: "notices", label: "Notices & Circulars", href: "/notifications", permission: 'website:read' },
          { id: "support-desk", label: "Support & Helpdesk", href: "/support" },
          { id: "teacher-queries", label: "Teacher Queries", href: "/staff/queries" },
        ]
      }
    ]
  },
  {
    title: "REPORTS & GOVERNANCE",
    items: [
      {
        id: "reports",
        label: "Compliance & Reports",
        icon: ShieldCheck,
        href: "/compliance",
        roles: [],
        permission: 'report:view'
      }
    ]
  },
  {
    title: "WEBSITE CMS",
    items: [
      {
        id: "website-group",
        label: "Website Management",
        icon: Globe,
        roles: [],
        subItems: [
          { id: "web-theme", label: "Theme & Identity", href: "/portal/theme", permission: 'website:manage' },
          { id: "web-layout", label: "Homepage Sequence", href: "/portal/layout-order", permission: 'website:manage' },
          { id: "web-hero", label: "Banners & Hero", href: "/portal/hero", permission: 'website:manage' },
          { id: "web-leadership", label: "Leadership Desk", href: "/portal/leadership", permission: 'website:manage' },
          { id: "web-about", label: "About & Why Us", href: "/portal/about", permission: 'website:manage' },
          { id: "web-academics", label: "Stats & Wings", href: "/portal/academics", permission: 'website:manage' },
          { id: "web-facilities", label: "Campus Facilities", href: "/portal/facilities", permission: 'website:manage' },
          { id: "web-admissions", label: "Admissions Roadmap", href: "/portal/admissions", permission: 'website:manage' },
          { id: "portal-fees", label: "Fee & Transport Slabs", href: "/portal/fees", permission: 'website:manage' },
          { id: "web-contact", label: "Contact & Social", href: "/portal/contact", permission: 'website:manage' },
          { id: "portal-careers", label: "Career & Vacancies", href: "/portal/careers", permission: 'website:manage' },
          { id: "portal-gallery", label: "Photo Gallery", href: "/portal/gallery", permission: 'website:manage' },
          { id: "portal-testimonials", label: "Testimonials", href: "/portal/testimonials", permission: 'website:manage' },
        ]
      }
    ]
  },
  {
    title: "MOBILE APP",
    items: [
      {
        id: "app-group",
        label: "App Settings",
        icon: Smartphone,
        roles: [],
        subItems: [
          { id: "app-branding", label: "App Configuration & Branding", href: "/portal/app-settings", permission: 'website:manage' },
        ]
      }
    ]
  },
  {
    title: "ADMINISTRATION",
    items: [
      {
        id: "admin-group",
        label: "Security & RBAC",
        icon: Shield,
        roles: [],
        subItems: [
          { id: "super-admins", label: "Super Admins", href: "/administrators", permission: 'rbac:role_manage' },
          { id: "rbac-access", label: "Access & Security (RBAC)", href: "/staff/access", permission: 'rbac:role_manage' },
        ]
      }
    ]
  }
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading: authLoading, permissions, logout } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [schoolInfo, setSchoolInfo] = useState<any>(null);
  // ⚠️ Hydration fix: read localStorage only on client-side after mount
  const [clientRole, setClientRole] = useState<string>('');
  const [clientClass, setClientClass] = useState<string>('');
  // Prevents SSR vs client nav mismatch (role-based filtering causes hydration error)
  const [mounted, setMounted] = useState(false);

  const fetchSchoolInfo = () => {
    client.get('/settings/school-info')
      .then(data => {
        if (data) setSchoolInfo(data);
      })
      .catch(() => {
        // Graceful fallback to default school settings
      });
  };

  useEffect(() => {
    fetchSchoolInfo();
    const handleUpdate = () => fetchSchoolInfo();
    window.addEventListener('school-info-updated', handleUpdate);
    return () => window.removeEventListener('school-info-updated', handleUpdate);
  }, []);

  // Read localStorage only on client to avoid SSR hydration mismatch
  useEffect(() => {
    setMounted(true);
    setClientRole(localStorage.getItem(APP_CONFIG.auth.tokens.role) || '');
    setClientClass(localStorage.getItem(APP_CONFIG.auth.tokens.class) || '');
  }, [user]);

  useEffect(() => {
    if (pathname === '/login') {
      setShowConfirm(false);
      setShowUserMenu(false);
    }
  }, [pathname]);

  // 🔒 Security Fix: Never default to SUPER_ADMIN on missing/empty role
  const role = user?.role || clientRole || '';
  const rawRole = role || '';
  const normalizedRole = rawRole.trim().toUpperCase();
  const effectiveRole = normalizedRole === 'MANAGEMENT' ? 'PRINCIPAL' : normalizedRole;
  const userClass = user?.class || user?.staffProfile?.class || clientClass || '';
  const isActualClassTeacher = Boolean(userClass && userClass !== 'NONE' && userClass !== '');

  // 🛡️ Dynamic RBAC Permission Check
  const isSubItemVisible = React.useCallback((subItem: NavSubItem): boolean => {
    // Teacher-personal self-service items (only for teachers, not Super Admin/Admin)
    if (subItem.id === 'my-substitutions') {
      return effectiveRole === 'TEACHER' || effectiveRole === 'CLASS_TEACHER';
    }

    // Super Admin & Admin have full institutional clearance
    if (effectiveRole === 'SUPER_ADMIN' || effectiveRole === 'ADMIN') return true;

    // Staff Governance items (Staff Attendance Log, Staff Leave Petitions, Substitution Hub)
    // ONLY available to Leadership (Super Admin, Admin, Principal, Vice Principal)
    if (
      subItem.id === 'staff-attendance-log' || 
      subItem.id === 'staff-leave-petitions' || 
      subItem.id === 'substitution-admin'
    ) {
      const isLeadership = ['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'].includes(effectiveRole);
      if (!isLeadership) return false;
      if (subItem.permission) return permissions.has(subItem.permission);
      return true;
    }

    // For Teachers / Class Teachers: Scoped strictly to their assigned class
    const isTeacherRole = effectiveRole === 'TEACHER' || effectiveRole === 'CLASS_TEACHER';
    if (isTeacherRole) {
      if (subItem.id === 'all-students' || subItem.id === 'new-student' || subItem.id === 'student-promotion') {
        return false;
      }
    }

    // Class Teacher specific items (Must have an assigned class)
    if (subItem.id === 'my-students' && !isActualClassTeacher) return false;
    if (subItem.id === 'student-id-cards') {
      const isLeadership = ['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'].includes(effectiveRole);
      if (!isLeadership && !isActualClassTeacher) return false;
    }
    if (subItem.id === 'student-attendance') {
      const isLeadership = ['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'].includes(effectiveRole);
      if (!isLeadership && !isActualClassTeacher) return false;
      if (subItem.permission) return permissions.has(subItem.permission);
      return true;
    }

    // Permission-driven gate: Whichever permissions user has in DB, show accordingly
    if (subItem.permission) {
      return permissions.has(subItem.permission);
    }

    // General self-service items (My Attendance, My Leaves, My Timetable, Support)
    return true;
  }, [effectiveRole, permissions, isActualClassTeacher]);

  // Check if parent navigation item is accessible
  const isItemVisible = React.useCallback((item: NavItem): boolean => {
    if (effectiveRole === 'SUPER_ADMIN' || effectiveRole === 'ADMIN') return true;

    // If parent item requires direct permission
    if (item.permission && !permissions.has(item.permission)) {
      return false;
    }

    // If item contains subItems, show only if user has permissions for at least one subItem
    if (item.subItems && item.subItems.length > 0) {
      const visibleSubItems = item.subItems.filter(isSubItemVisible);
      return visibleSubItems.length > 0;
    }

    return true;
  }, [effectiveRole, permissions, isSubItemVisible]);

  // 🚀 Performance Optimization: Memoize visible menu sections
  const visibleMenuSections = React.useMemo(() => {
    if (!mounted) return [];
    return menuSections
      .map((section) => {
        const visibleItems = section.items
          .map((item) => {
            const hasSubItems = Boolean(item.subItems && item.subItems.length > 0);
            if (hasSubItems) {
              const visibleSubItems = item.subItems?.filter(isSubItemVisible) || [];
              if (visibleSubItems.length === 0) return null;
              return { ...item, subItems: visibleSubItems };
            }
            return isItemVisible(item) ? item : null;
          })
          .filter(Boolean) as NavItem[];

        return { ...section, items: visibleItems };
      })
      .filter((section) => section.items.length > 0);
  }, [mounted, effectiveRole, permissions, isActualClassTeacher, isSubItemVisible, isItemVisible]);

  // Collect all possible hrefs across all sections to compute precise longest-prefix matches
  const allPossibleHrefs = React.useMemo(() => {
    const hrefs: string[] = [];
    menuSections.forEach(section => {
      section.items.forEach(item => {
        if (item.href) hrefs.push(item.href);
        if (item.subItems) {
          item.subItems.forEach(sub => {
            if (sub.href) hrefs.push(sub.href);
          });
        }
      });
    });
    return hrefs;
  }, []);

  const isLinkActive = (href: string) => {
    if (!href) return false;
    if (href === '/') return pathname === '/';
    if (pathname === href) return true;
    if (pathname.startsWith(href + '/')) {
      const hasBetterMatch = allPossibleHrefs.some(other =>
        other !== href &&
        other !== '/' &&
        other.length > href.length &&
        (pathname === other || pathname.startsWith(other + '/'))
      );
      return !hasBetterMatch;
    }
    return false;
  };

  // Auto-expand section if active route matches child
  useEffect(() => {
    menuSections.forEach(section => {
      section.items.forEach(item => {
        if (item.subItems) {
          const hasActiveChild = item.subItems.some(sub => isLinkActive(sub.href));
          if (hasActiveChild) {
            setOpenItems(prev => ({ ...prev, [item.id]: true }));
          }
        }
      });
    });
  }, [pathname, allPossibleHrefs]);

  const toggleItem = (itemId: string) => {
    setOpenItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const getResolvedUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
      return url;
    }
    const apiHost = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000';
    return `${apiHost}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const handleLogout = () => {
    setShowConfirm(false);
    logout();
  };

  const isExcludedPath = pathname === '/login';
  if (isExcludedPath) return null;

  return (
    <>
      <aside className="w-70 bg-[#0F172A] flex flex-col h-screen shrink-0 sticky top-0 overflow-visible shadow-2xl z-40 font-sans border-r border-white/5 transition-all duration-300">
        {/* 💎 Sidebar Branding */}
        <div className="p-6 pb-4 space-y-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            {schoolInfo?.logoImage && schoolInfo.logoImage.trim() !== '' ? (
              <img
                src={getResolvedUrl(schoolInfo.logoImage)}
                alt="School Logo"
                className="h-10 w-10 object-contain rounded-xl bg-white p-1 shadow-lg shrink-0"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0">
                <ShieldCheck size={22} />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-black text-white tracking-tight leading-none font-heading uppercase truncate">
                {schoolInfo?.schoolName || APP_CONFIG.institution.name}
              </h2>
              <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mt-1 opacity-80 truncate">
                {schoolInfo?.domainPrefix ? `${schoolInfo.domainPrefix} erp` : APP_CONFIG.institution.hubName}
              </p>
            </div>
          </div>
        </div>

        {/* 🧭 Navigation Sections with Collapsible Submenus */}
        <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto no-scrollbar">
          {!mounted ? (
            // SSR skeleton — identical on server and client, no role filtering → no mismatch
            <div className="space-y-3 px-2 py-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-9 w-full rounded-xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : visibleMenuSections.map((section) => {
            return (
              <div key={section.title} className="space-y-1.5">
                <h3 className="px-3 text-[9px] font-black text-white/30 uppercase tracking-[3px] font-heading">
                  {section.title}
                </h3>
                <nav className="space-y-1">
                  {section.items.map((item: NavItem) => {
                    const hasSubItems = Boolean(item.subItems && item.subItems.length > 0);
                    const visibleSubItems = item.subItems || [];

                    // Single Item Navigation (No Submenu)
                    if (!hasSubItems || visibleSubItems.length === 0) {
                      const targetHref = item.href || '/';
                      const isActive = isLinkActive(targetHref);

                      return (
                        <Link
                          key={item.id}
                          href={targetHref}
                          className={cn(
                            "group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] leading-5 transition-all duration-200 relative font-sans",
                            isActive
                              ? "btn-gradient text-white shadow-indigo-500/20 active-nav-glow font-semibold"
                              : "text-white/65 hover:bg-white/5 hover:text-white font-medium"
                          )}
                        >
                          <item.icon size={17} strokeWidth={isActive ? 2.5 : 2} className={cn(isActive ? "text-white" : "text-white/40 group-hover:text-white transition-colors")} />
                          <span className="truncate">{item.label}</span>
                          {isActive && <ChevronRight size={14} className="ml-auto text-white/60" />}
                        </Link>
                      );
                    }

                    // Accordion Item with Submenu
                    const isGroupOpen = Boolean(openItems[item.id]);
                    const hasActiveChild = visibleSubItems.some(sub => isLinkActive(sub.href));

                    return (
                      <div key={item.id} className="space-y-1">
                        <button
                          type="button"
                          onClick={() => toggleItem(item.id)}
                          className={cn(
                            "w-full group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[14px] leading-5 transition-all duration-200 text-left font-sans",
                            hasActiveChild
                              ? "bg-white/10 text-white font-semibold"
                              : "text-white/65 hover:bg-white/5 hover:text-white font-medium"
                          )}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <item.icon size={17} strokeWidth={hasActiveChild ? 2.5 : 2} className={cn(hasActiveChild ? "text-indigo-400" : "text-white/40 group-hover:text-white transition-colors")} />
                            <span className="truncate">{item.label}</span>
                          </div>
                          <ChevronDown
                            size={15}
                            className={cn(
                              "text-white/40 group-hover:text-white transition-transform duration-200 shrink-0",
                              isGroupOpen ? "transform rotate-180 text-white" : ""
                            )}
                          />
                        </button>

                        {/* Collapsible Submenu */}
                        {isGroupOpen && (
                          <div className="ml-5 pl-3 border-l border-white/10 space-y-1 py-1 animate-in slide-in-from-top-1 duration-200">
                            {visibleSubItems.map((sub) => {
                              const isSubActive = isLinkActive(sub.href);

                              return (
                                <Link
                                  key={sub.id}
                                  href={sub.href}
                                  className={cn(
                                    "group flex items-center justify-between px-3 py-2 rounded-lg text-[14px] leading-5 transition-all duration-200 font-sans",
                                    isSubActive
                                      ? "bg-indigo-600/30 text-indigo-300 font-semibold border border-indigo-500/30 shadow-sm"
                                      : "text-white/60 hover:bg-white/5 hover:text-white font-medium"
                                  )}
                                >
                                  <span className="truncate">{sub.label}</span>
                                  {isSubActive && (
                                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 shadow-glow shrink-0 ml-2" />
                                  )}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </nav>
              </div>
            );
          })}
        </div>

        {/* ⚡ User Profile & Session Hub */}
        <div className="p-4 border-t border-white/5 mt-auto relative bg-[#0F172A]/90 backdrop-blur-md">
          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
              <div className="absolute bottom-full left-4 right-4 mb-3 bg-[#1E293B] rounded-2xl shadow-3xl border border-white/10 overflow-hidden z-20 animate-in slide-in-from-bottom-4 duration-300">
                <div className="p-4 border-b border-white/5 bg-black/20">
                  <p className="text-[10px] font-black uppercase tracking-[3px] text-indigo-400 mb-1">Authenticated</p>
                  <p className="text-xs font-bold text-white truncate opacity-70">{user?.email}</p>
                </div>
                <div className="p-2 space-y-1">
                  <Link
                    href="/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-white/70 hover:bg-white/5 hover:text-white rounded-xl transition-all text-xs font-bold font-sans"
                  >
                    <UserIcon size={16} className="text-indigo-400" />
                    <span>My Profile</span>
                  </Link>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      setShowConfirm(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all text-xs font-bold font-sans"
                  >
                    <LogOut size={16} />
                    <span>End Session</span>
                  </button>
                </div>
              </div>
            </>
          )}

          <div
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center justify-between p-2 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-xl bg-linear-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white font-black text-sm shadow-md shrink-0">
                {mounted ? (user?.name?.[0] || 'A') : 'A'}
              </div>
              <div className="min-w-0 flex-1">
                <p suppressHydrationWarning className="text-xs font-bold text-white truncate group-hover:text-indigo-300 transition-colors font-sans">
                  {mounted ? (user?.name || 'Administrator') : 'Administrator'}
                </p>
                <p suppressHydrationWarning className="text-[10px] font-bold text-indigo-400/80 uppercase tracking-widest truncate font-sans">
                  {mounted ? effectiveRole : 'ADMIN'}
                </p>
              </div>
            </div>
            <ChevronUp size={16} className={cn("text-white/40 group-hover:text-white transition-transform duration-300", showUserMenu ? "transform rotate-180" : "")} />
          </div>
        </div>
      </aside>

      {/* ⚠️ Logout Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#1E293B] border border-white/10 p-8 rounded-3xl max-w-md w-full space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="h-14 w-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle size={28} />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-black text-white uppercase tracking-wider font-heading">Terminate Session?</h3>
              <p className="text-xs text-slate-400 font-medium">You will be required to re-authenticate with your security credentials to access the terminal.</p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-bold text-xs rounded-xl transition-all uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-rose-600/20 uppercase tracking-wider"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
