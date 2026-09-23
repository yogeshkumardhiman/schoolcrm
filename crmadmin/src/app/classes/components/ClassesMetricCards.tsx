"use client";

import React from "react";
import { GraduationCap, Users, UserCheck, LayoutGrid } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ClassesMetricCardsProps {
  isLoading: boolean;
  activeClassesCount: number;
  minClass: string;
  maxClass: string;
  totalEnrolled: number;
  totalFacultyCount: number;
  availableTeachersCount: number;
  activeSectionsCount: number;
}

export function ClassesMetricCards({
  isLoading,
  activeClassesCount,
  minClass,
  maxClass,
  totalEnrolled,
  totalFacultyCount,
  availableTeachersCount,
  activeSectionsCount,
}: ClassesMetricCardsProps) {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-4 animate-in fade-in duration-300">
      {/* Operating Grades Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Operating Grades
          </span>
          {isLoading ? (
            <div className="space-y-1 mt-1.5">
              <Skeleton className="h-7 w-24 rounded-lg" />
              <Skeleton className="h-3 w-28 rounded" />
            </div>
          ) : (
            <>
              <div className="text-2xl font-black text-slate-900 font-heading mt-1">
                {activeClassesCount} Classes
              </div>
              <p className="text-[10.5px] font-bold text-indigo-600 mt-1 uppercase">
                Class {minClass} → {maxClass}
              </p>
            </>
          )}
        </div>
        <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
          <GraduationCap size={20} />
        </div>
      </div>

      {/* Enrolled Scholars */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Enrolled Scholars
          </span>
          {isLoading ? (
            <div className="space-y-1 mt-1.5">
              <Skeleton className="h-7 w-28 rounded-lg" />
              <Skeleton className="h-3 w-20 rounded" />
            </div>
          ) : (
            <>
              <div className="text-2xl font-black text-emerald-600 font-heading mt-1">
                {totalEnrolled} Students
              </div>
              <p className="text-[10px] font-bold text-emerald-600 mt-1 uppercase">
                Live in Database
              </p>
            </>
          )}
        </div>
        <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
          <Users size={20} />
        </div>
      </div>

      {/* Teaching Faculty */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Teaching Faculty
          </span>
          {isLoading ? (
            <div className="space-y-1 mt-1.5">
              <Skeleton className="h-7 w-24 rounded-lg" />
              <Skeleton className="h-3 w-28 rounded" />
            </div>
          ) : (
            <>
              <div className="text-2xl font-black text-indigo-600 font-heading mt-1">
                {totalFacultyCount} Teachers
              </div>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">
                {availableTeachersCount} Available Incharge
              </p>
            </>
          )}
        </div>
        <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
          <UserCheck size={20} />
        </div>
      </div>

      {/* Active Sections */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Active Sections
          </span>
          {isLoading ? (
            <div className="space-y-1 mt-1.5">
              <Skeleton className="h-7 w-24 rounded-lg" />
              <Skeleton className="h-3 w-28 rounded" />
            </div>
          ) : (
            <>
              <div className="text-2xl font-black text-amber-600 font-heading mt-1">
                {activeSectionsCount} Sections
              </div>
              <p className="text-[10px] font-bold text-amber-600 mt-1 uppercase">
                In Operating Classes
              </p>
            </>
          )}
        </div>
        <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
          <LayoutGrid size={20} />
        </div>
      </div>
    </div>
  );
}
