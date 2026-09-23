"use client";

import client from "@/lib/client";
import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Printer,
  User,
  Phone,
  CreditCard,
  CheckCircle2,
  QrCode,
  ChevronDown,
  Sparkles,
  Layers,
  GraduationCap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/AbilityProvider";

const ALL_CLASSES = [
  "NURSERY", "LKG", "UKG", "1ST", "2ND", "3RD", "4TH", "5TH",
  "6TH", "7TH", "8TH", "9TH", "10TH", "11TH", "12TH"
];

const SECTIONS = ["A", "B", "C", "D"];

// Safe Student Avatar with Fallback
function ScholarAvatar({
  name,
  image,
  admissionNo,
  className = "w-24 h-24",
  textSize = "text-2xl",
}: {
  name: string;
  image?: string;
  admissionNo?: string;
  className?: string;
  textSize?: string;
}) {
  const [imgError, setImgError] = useState(false);

  const getInitials = (n: string) => {
    if (!n) return "ST";
    const parts = n.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return n.slice(0, 2).toUpperCase();
  };

  if (image && !imgError && !image.includes("default-avatar") && image.startsWith("http")) {
    return (
      <div className={cn("rounded-full overflow-hidden bg-slate-100 shrink-0", className)}>
        <img
          src={image}
          alt={name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-full bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white font-black flex items-center justify-center shadow-inner shrink-0 uppercase",
        className,
        textSize
      )}
    >
      {getInitials(name)}
    </div>
  );
}

export default function StudentIDCardStudio() {
  const router = useRouter();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const userRole = (user?.role || "").toUpperCase();
  const isTeacher = userRole === "TEACHER" || userRole === "CLASS_TEACHER";
  const teacherClass = (user?.class || user?.staffProfile?.class || "").toUpperCase().trim();
  const teacherSection = (user?.section || user?.staffProfile?.section || "").toUpperCase().trim();
  const hasAssignedClass = Boolean(teacherClass && teacherClass !== "NONE" && teacherClass !== "");

  // Filter States
  const [selectedClass, setSelectedClass] = useState<string>(() => {
    if (isTeacher && hasAssignedClass) return teacherClass;
    return "All Classes";
  });
  const [selectedSection, setSelectedSection] = useState<string>("All Sections");
  const [searchQuery, setSearchQuery] = useState<string>("");

  React.useEffect(() => {
    if (isTeacher && hasAssignedClass && selectedClass !== teacherClass) {
      setSelectedClass(teacherClass);
    }
  }, [isTeacher, hasAssignedClass, teacherClass]);

  // ID Card State
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [cardSide, setCardSide] = useState<"front" | "back">("front");
  const [isBulkPrintMode, setIsBulkPrintMode] = useState<boolean>(false);

  // 1. Fetch School Branding & Info
  const { data: schoolInfo } = useQuery({
    queryKey: ["school-info"],
    queryFn: () => client.get("/settings/school-info").catch(() => null),
  });

  const activeClassList = useMemo(() => {
    const rawMin = (schoolInfo?.minClass || "NURSERY").toUpperCase();
    const rawMax = (schoolInfo?.maxClass || "12TH").toUpperCase();
    const minIdx = ALL_CLASSES.findIndex((c) => rawMin.startsWith(c) || rawMin === c);
    const maxIdx = ALL_CLASSES.findIndex((c) => rawMax.startsWith(c) || rawMax === c);
    const start = minIdx !== -1 ? minIdx : 0;
    const end = maxIdx !== -1 ? maxIdx : ALL_CLASSES.length - 1;
    return ALL_CLASSES.slice(start, end + 1);
  }, [schoolInfo]);

  // 2. Fetch Students for ID Card Generation (using /students with student:read clearance)
  const { data: rawStudentsResponse, isLoading: studentsLoading } = useQuery({
    queryKey: ["academic-students-idcard", selectedClass, selectedSection, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedClass && selectedClass !== "All Classes") params.append("class", selectedClass);
      if (selectedSection && selectedSection !== "All Sections") params.append("section", selectedSection);
      if (searchQuery) params.append("search", searchQuery);
      return client.get(`/students?${params.toString()}`).catch(() => []);
    },
  });

  const studentsList: any[] = useMemo(() => {
    if (Array.isArray(rawStudentsResponse)) return rawStudentsResponse;
    if (Array.isArray(rawStudentsResponse?.students)) return rawStudentsResponse.students;
    if (Array.isArray(rawStudentsResponse?.data)) return rawStudentsResponse.data;
    return [];
  }, [rawStudentsResponse]);

  // Set default selected student if none selected
  React.useEffect(() => {
    if (studentsList.length > 0) {
      const exists = studentsList.some(
        (item: any) =>
          item.studentId === selectedStudent?.studentId ||
          item.id === selectedStudent?.id ||
          item.admissionNo === selectedStudent?.admissionNo ||
          item.student?.id === selectedStudent?.student?.id
      );
      if (!exists || !selectedStudent) {
        setSelectedStudent(studentsList[0]);
      }
    } else {
      setSelectedStudent(null);
    }
  }, [studentsList, selectedStudent]);

  const handlePrint = () => {
    window.print();
  };

  if (!mounted) {
    return (
      <div className="flex-1 space-y-6 p-6 sm:p-8 pt-8 bg-slate-50/50 min-h-screen font-sans">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-4 w-96 rounded-lg" />
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  // 🔒 Subject Teacher Guard: Only Class Incharges and Leadership can generate ID Cards
  if (isTeacher && !hasAssignedClass) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50 min-h-screen font-sans">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl text-center space-y-4">
          <div className="h-16 w-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <CreditCard size={32} />
          </div>
          <h3 className="font-black text-lg text-slate-900 uppercase tracking-tight">
            ID Card Studio Restricted
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            You are logged in as a <span className="font-bold text-slate-800">Subject Faculty</span> without an assigned class. Student ID card generation is reserved for <span className="font-bold text-slate-800">Class Incharges</span> and <span className="font-bold text-slate-800">Administrators</span>.
          </p>
          <Button
            onClick={() => router.push("/staff/my-timetable")}
            className="h-11 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md cursor-pointer"
          >
            Go to My Timetable
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6 sm:p-8 pt-8 bg-slate-50/50 min-h-screen font-sans text-slate-900 relative z-10">
      
      {/* 🏙️ TOP EXECUTIVE HEADER (Hidden on Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs print:hidden">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm shadow-indigo-600/20">
            <CreditCard size={18} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase font-heading">
              Student ID Cards <span className="text-indigo-600">Studio</span>
            </h2>
            <p className="text-xs font-medium text-slate-400">
              Generate, Customize & Batch Print Official Student Identity Cards
            </p>
          </div>
        </div>

        {isTeacher && hasAssignedClass && (
          <div className="flex items-center gap-2">
            <Badge className="bg-indigo-600 text-white font-black text-xs uppercase tracking-wider px-3.5 py-1.5 rounded-xl border-none shadow-xs">
              Assigned Grade {teacherClass}{teacherSection && teacherSection !== "ALL" ? ` - ${teacherSection}` : ""}
            </Badge>
          </div>
        )}
      </div>

      {/* 🪪 ID CARD GENERATOR & BULK STUDIO */}
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Filter & Search Bar (Hidden on Print) */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 px-5 rounded-2xl border border-slate-200/80 shadow-xs print:hidden">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student by name / ID..."
                className="pl-9 h-10 bg-slate-50 border-slate-200 rounded-xl text-xs font-bold"
              />
            </div>

            {isTeacher && hasAssignedClass ? (
              <div className="h-10 px-3.5 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase text-indigo-400">Class:</span>
                <span className="text-xs font-black uppercase text-indigo-700">{teacherClass}</span>
              </div>
            ) : (
              <div className="relative">
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="appearance-none h-10 px-3 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase outline-none cursor-pointer text-slate-800"
                >
                  <option value="All Classes">All Classes</option>
                  {activeClassList.map((cls) => (
                    <option key={cls} value={cls}>
                      Class {cls}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={13} />
              </div>
            )}

            <div className="relative">
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="appearance-none h-10 px-3 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase outline-none cursor-pointer text-slate-800"
              >
                <option value="All Sections">All Sections</option>
                {SECTIONS.map((sec) => (
                  <option key={sec} value={sec}>
                    Sec {sec}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={13} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={isBulkPrintMode ? "default" : "outline"}
              onClick={() => setIsBulkPrintMode(!isBulkPrintMode)}
              className="h-10 px-4 text-xs font-bold uppercase rounded-xl cursor-pointer"
            >
              {isBulkPrintMode ? "Single Card View" : "🖨️ Bulk Batch Sheet"}
            </Button>

            <Button
              onClick={handlePrint}
              className="h-10 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-indigo-600/20 cursor-pointer flex items-center gap-1.5"
            >
              <Printer size={15} /> Print {isBulkPrintMode ? "All Cards" : "ID Card"}
            </Button>
          </div>
        </div>

        {/* SINGLE CARD INTERACTIVE STUDIO */}
        {!isBulkPrintMode && !selectedStudent && !studentsLoading && studentsList.length === 0 && (
          <div className="bg-white p-12 rounded-2xl border border-slate-200/80 text-center space-y-3 print:hidden">
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <CreditCard size={24} />
            </div>
            <h3 className="font-black text-base text-slate-800 uppercase tracking-tight">No Students Found</h3>
            <p className="text-xs text-slate-400 font-medium">No students registered in Class {selectedClass}{selectedSection !== "All Sections" ? ` - Section ${selectedSection}` : ""}.</p>
          </div>
        )}

        {!isBulkPrintMode && selectedStudent && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Student Selector Table (Hidden on Print) */}
            <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 print:hidden">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                Select Scholar ({studentsList.length})
              </h4>

              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {studentsList.map((item: any) => {
                  const st = item.student || item;
                  const isSelected = selectedStudent?.studentId === item.studentId || selectedStudent?.id === st.id;
                  return (
                    <div
                      key={st.admissionNo || st.id}
                      onClick={() => setSelectedStudent(item)}
                      className={cn(
                        "p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all",
                        isSelected
                          ? "bg-indigo-50/80 border-indigo-300 shadow-xs"
                          : "bg-white border-slate-200/70 hover:bg-slate-50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <ScholarAvatar
                          name={st.name || "Student"}
                          image={st.image}
                          admissionNo={st.admissionNo}
                          className="h-9 w-9"
                          textSize="text-xs"
                        />
                        <div>
                          <p className="font-black text-slate-900 text-xs uppercase tracking-tight truncate max-w-[150px]">
                            {st.name}
                          </p>
                          <span className="font-mono text-[10px] font-bold text-indigo-600">
                            {st.admissionNo} • Class {item.class}-{item.section || "A"}
                          </span>
                        </div>
                      </div>
                      {isSelected && <CheckCircle2 size={16} className="text-indigo-600" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Interactive ID Card Preview & Flip Studio */}
            <div className="lg:col-span-7 flex flex-col items-center space-y-4">
              {/* Side Toggle Tabs (Hidden on Print) */}
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 print:hidden">
                <button
                  onClick={() => setCardSide("front")}
                  className={cn(
                    "px-5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer",
                    cardSide === "front" ? "bg-white text-slate-900 shadow-xs" : "text-slate-400"
                  )}
                >
                  Front Identity Side
                </button>
                <button
                  onClick={() => setCardSide("back")}
                  className={cn(
                    "px-5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer",
                    cardSide === "back" ? "bg-white text-slate-900 shadow-xs" : "text-slate-400"
                  )}
                >
                  Back Emergency Side
                </button>
              </div>

              {/* ID CARD CONTAINER (CR80 Standard Physical Dimensions 54mm x 86mm Portrait) */}
              <div className="p-1 bg-gradient-to-br from-slate-200 via-slate-100 to-slate-300 rounded-[28px] shadow-2xl print:p-0 print:bg-transparent print:shadow-none">
                {cardSide === "front" ? (
                  /* FRONT OF ID CARD */
                  <div className="w-[320px] h-[480px] bg-white rounded-[24px] overflow-hidden flex flex-col justify-between border border-slate-200 shadow-inner relative select-none">
                    {/* Header with School Branding */}
                    <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 p-4 text-center text-white space-y-1 relative">
                      <div className="absolute top-2 right-3 h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                      <h3 className="font-black text-sm uppercase tracking-tight leading-tight">
                        {schoolInfo?.schoolName || "SDM PUBLIC SCHOOL"}
                      </h3>
                      <p className="text-[9px] uppercase tracking-widest text-indigo-200 font-bold">
                        {schoolInfo?.affiliation || "Affiliated to CBSE, New Delhi"}
                      </p>
                      <div className="inline-block bg-white/20 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider text-white mt-1">
                        Student Identity Card · {new Date().getFullYear()}-{new Date().getFullYear() + 1}
                      </div>
                    </div>

                    {/* Middle Body: Avatar & Core Scholarly Details */}
                    <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-3">
                      <ScholarAvatar
                        name={selectedStudent.student?.name || selectedStudent.name || "Scholar"}
                        image={selectedStudent.student?.image || selectedStudent.image}
                        admissionNo={selectedStudent.student?.admissionNo || selectedStudent.admissionNo}
                        className="w-24 h-24 border-4 border-white shadow-xl ring-2 ring-indigo-100"
                      />

                      <div className="text-center space-y-0.5">
                        <h4 className="font-black text-base uppercase text-slate-900 tracking-tight leading-snug">
                          {selectedStudent.student?.name || selectedStudent.name}
                        </h4>
                        <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 font-black text-[10px] uppercase tracking-widest px-3 py-0.5">
                          Class {selectedStudent.class}-{selectedStudent.section || "A"}
                        </Badge>
                      </div>

                      {/* Scholarly Metadata Grid */}
                      <div className="w-full bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 text-[11px] grid grid-cols-2 gap-2 text-slate-600 font-medium">
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase block">Roll Number</span>
                          <span className="font-mono font-bold text-slate-800">
                            {selectedStudent.student?.rollNo || selectedStudent.rollNo || "--"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase block">Admission ID</span>
                          <span className="font-mono font-bold text-indigo-600">
                            {selectedStudent.student?.admissionNo || selectedStudent.admissionNo || "--"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase block">Blood Group</span>
                          <span className="font-bold text-rose-600">
                            {selectedStudent.student?.bloodGroup || "O+ (Pos)"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase block">Date of Birth</span>
                          <span className="font-mono text-slate-800">
                            {selectedStudent.student?.dob ? new Date(selectedStudent.student.dob).toLocaleDateString() : "--"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer with Principal Sign & Barcode */}
                    <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="font-mono text-[9px] font-bold text-slate-400">
                          ||||| | |||| ||| |||||
                        </div>
                        <span className="text-[8px] font-bold text-slate-400 uppercase block">
                          SYS-VERIFIED
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="h-6 flex items-end justify-end">
                          <span className="font-serif italic text-xs text-slate-800 font-bold border-b border-slate-400">
                            Principal
                          </span>
                        </div>
                        <span className="text-[8px] font-bold text-slate-400 uppercase block mt-0.5">
                          Authorized Signatory
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* BACK OF ID CARD */
                  <div className="w-[320px] h-[480px] bg-white rounded-[24px] overflow-hidden flex flex-col justify-between border border-slate-200 shadow-inner p-5 space-y-4 relative select-none">
                    <div className="text-center pb-3 border-b border-slate-100">
                      <h4 className="font-black text-xs uppercase tracking-wider text-slate-900">
                        Guardian & Emergency Contacts
                      </h4>
                      <p className="text-[9px] text-slate-400 font-medium">Official Institutional Security Log</p>
                    </div>

                    <div className="space-y-3 flex-1">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block">Parent / Guardian:</span>
                        <span className="font-bold text-slate-900 text-xs">
                          {selectedStudent.student?.fatherName || selectedStudent.student?.guardianName || "Guardian Name"}
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase block">Emergency Phone:</span>
                          <span className="font-mono font-bold text-slate-800 text-xs">
                            {selectedStudent.student?.phone ? `+91 ${selectedStudent.student.phone}` : schoolInfo?.contactPhone || "+91 9876543210"}
                          </span>
                        </div>

                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase block">Residential Address:</span>
                          <p className="text-xs text-slate-700 font-medium leading-tight line-clamp-2">
                            {selectedStudent.student?.address || schoolInfo?.address || "Institutional Campus, India"}
                          </p>
                        </div>

                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase block">Transport Route:</span>
                          <span className="text-xs font-bold text-indigo-700">
                            {selectedStudent.student?.transportOpted ? "Designated Bus Route" : "Self Commute"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Instructions & Terms */}
                    <div className="space-y-2 pt-3 border-t border-slate-100 text-[9px] text-slate-500 font-medium leading-snug">
                      <p>1. This card is non-transferable and must be carried during school hours.</p>
                      <p>2. If found, please return to the school administration office.</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[8px] font-bold text-slate-400 uppercase block">School Helpline:</span>
                        <span className="text-[10px] font-mono font-bold text-slate-800">{schoolInfo?.contactPhone || "+91 9876543210"}</span>
                      </div>
                      <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                        <QrCode size={24} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* BULK BATCH ID CARD GRID */}
        {isBulkPrintMode && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-indigo-50 p-4 rounded-xl border border-indigo-200 print:hidden">
              <span className="text-xs font-bold text-indigo-900 uppercase">
                Showing {studentsList.length} ID Cards for Batch Sheet Printing
              </span>
              <Button
                onClick={handlePrint}
                className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase rounded-lg"
              >
                <Printer size={14} className="mr-1.5" /> Print Sheet Now
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 print:grid-cols-3 print:gap-2">
              {studentsList.map((item: any, i: number) => {
                const st = item.student || item;
                return (
                  <div
                    key={st.id || i}
                    className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between break-inside-avoid text-[10px]"
                  >
                    {/* Header */}
                    <div className="bg-indigo-700 p-2 text-center text-white">
                      <h5 className="font-black text-[10px] uppercase truncate">
                        {schoolInfo?.schoolName || "SDM PUBLIC SCHOOL"}
                      </h5>
                      <span className="text-[7px] text-indigo-200 uppercase tracking-widest font-bold">
                        Student ID Card
                      </span>
                    </div>

                    {/* Body */}
                    <div className="p-3 flex flex-col items-center space-y-2">
                      <ScholarAvatar
                        name={st.name || "Scholar"}
                        image={st.image}
                        admissionNo={st.admissionNo}
                        className="w-14 h-14 border-2 border-indigo-100"
                        textSize="text-xs"
                      />
                      <div className="text-center">
                        <h6 className="font-black text-xs uppercase text-slate-900 truncate max-w-[180px]">
                          {st.name}
                        </h6>
                        <span className="text-[9px] font-bold text-indigo-600 uppercase">
                          Class {item.class}-{item.section || "A"} • Roll #{st.rollNo || "--"}
                        </span>
                      </div>

                      <div className="w-full bg-slate-50 p-2 rounded-lg text-[8px] space-y-0.5 text-slate-500 font-medium">
                        <div className="flex justify-between">
                          <span>Adm ID:</span>
                          <span className="font-mono font-bold text-slate-800">{st.admissionNo || "--"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Phone:</span>
                          <span className="font-mono text-slate-700">{st.phone || schoolInfo?.contactPhone || "--"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="p-2.5 px-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-[8px] font-bold text-slate-400 uppercase">
                      <span>Authorized ID</span>
                      <span>Principal Sign</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
