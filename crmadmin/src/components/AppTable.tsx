"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, Receipt, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton, TableRowSkeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface DataTableProps {
  columns: {
    header: string;
    accessorKey?: string;
    className?: string;
    cell?: (item: any) => React.ReactNode;
  }[];
  data: any[];
  isLoading?: boolean;
  searchPlaceholder?: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
    itemsPerPage?: number;
    onItemsPerPageChange?: (limit: number) => void;
  };
  emptyMessage?: string;
}

export function AppTable({
  columns,
  data,
  isLoading,
  searchPlaceholder = "Search records...",
  searchQuery,
  onSearchChange,
  pagination,
  emptyMessage = "No records found",
}: DataTableProps) {
  // Compute page numbers to display
  const getPageNumbers = () => {
    if (!pagination) return [];
    const total = pagination.totalPages || 1;
    const current = pagination.currentPage || 1;
    const pages: (number | string)[] = [];

    if (total <= 5) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push("...");
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (current < total - 2) pages.push("...");
      pages.push(total);
    }
    return pages;
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Search Header */}
      <div className="relative group max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors" />
        <Input
          type="text"
          placeholder={searchPlaceholder}
          className="h-10 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold transition-all focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none placeholder:text-slate-400"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {isLoading ? (
        <TableRowSkeleton columns={columns.length} rows={6} />
      ) : data.length > 0 ? (
        <div className="animate-in fade-in duration-300">
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
            <Table className="min-w-[1000px] text-xs">
              <TableHeader className="bg-slate-50/80 border-b border-slate-200">
                <TableRow className="hover:bg-transparent">
                  {columns.map((col, idx) => (
                    <TableHead
                      key={idx}
                      className={cn(
                        "px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-wider",
                        col.className
                      )}
                    >
                      {col.header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100">
                {data.map((item, rowIdx) => (
                  <TableRow
                    key={rowIdx}
                    className="group hover:bg-slate-50/70 transition-colors duration-150 border-none"
                  >
                    {columns.map((col, colIdx) => (
                      <TableCell
                        key={colIdx}
                        className={cn("px-6 py-4", col.className)}
                      >
                        {col.cell ? col.cell(item) : (col.accessorKey ? item[col.accessorKey] : "--")}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* 📄 ADVANCED PAGINATION BAR */}
          {pagination && (
            <div className="p-4 px-6 border border-slate-200/80 rounded-2xl bg-white shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">
                  Showing{" "}
                  <span className="text-slate-900 font-mono font-black">
                    {pagination.totalItems === 0
                      ? 0
                      : (pagination.currentPage - 1) * (pagination.itemsPerPage || 10) + 1}
                    -
                    {Math.min(
                      pagination.currentPage * (pagination.itemsPerPage || 10),
                      pagination.totalItems
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="text-slate-900 font-mono font-black">
                    {pagination.totalItems}
                  </span>{" "}
                  records
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.currentPage <= 1}
                  onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                  className="h-8 px-2.5 rounded-lg border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-bold uppercase cursor-pointer"
                >
                  <ChevronLeft size={14} className="mr-0.5" /> Prev
                </Button>

                {/* Page number pills */}
                <div className="flex items-center gap-1">
                  {getPageNumbers().map((p, i) =>
                    p === "..." ? (
                      <span key={i} className="px-2 text-xs text-slate-400 font-bold">
                        ...
                      </span>
                    ) : (
                      <button
                        key={i}
                        onClick={() => pagination.onPageChange(Number(p))}
                        className={cn(
                          "h-8 w-8 rounded-lg text-xs font-black transition-all cursor-pointer",
                          pagination.currentPage === p
                            ? "bg-indigo-600 text-white shadow-xs"
                            : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                        )}
                      >
                        {p}
                      </button>
                    )
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.currentPage >= (pagination.totalPages || 1)}
                  onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                  className="h-8 px-2.5 rounded-lg border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-bold uppercase cursor-pointer"
                >
                  Next <ChevronRight size={14} className="ml-0.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="py-24 flex flex-col items-center justify-center text-slate-300 bg-white rounded-2xl border border-dashed border-slate-200 animate-in fade-in duration-300">
          <Receipt size={48} strokeWidth={1.5} className="mb-3 opacity-30 text-slate-400" />
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {emptyMessage}
          </p>
        </div>
      )}
    </div>
  );
}
