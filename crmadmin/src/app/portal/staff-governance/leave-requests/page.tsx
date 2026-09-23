"use client";
import client from "@/lib/client";

import React, { useState } from "react";
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  FileDown,
  Filter,
  Inbox,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function LeaveRequestsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");

  // Query: Leave Requests
  const { data: rawData = [], isLoading: loading, isError } = useQuery<any[]>({
    queryKey: ['leave-requests'],
    queryFn: async () => {
      try {
        const res = await client.get("/staff/leaves");
        return Array.isArray(res) ? res : (res?.data || []);
      } catch (err) {
        console.error("Failed to load leave requests", err);
        return [];
      }
    }
  });

  const requests: any[] = Array.isArray(rawData) ? rawData : [];

  // Mutation: Process Petition
  const processMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) =>
      client.put(`/staff/leave/${id}/status`, { status: status }),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      toast.success(variables.status === 'APPROVED' ? "Leave Authorized" : "Leave Dismissed");
    },
    onError: () => toast.error("Process failure")
  });

  const handleAction = (id: number | string, status: 'APPROVED' | 'REJECTED') => {
    processMutation.mutate({ id: String(id), status });
  };

  const filteredRequests = requests.filter((r: any) => {
    const staffName = r.staff?.name || r.staffName || "";
    const reason = r.reason || "";
    const status = r.status || "";
    const query = searchQuery.toLowerCase();
    return staffName.toLowerCase().includes(query) ||
      reason.toLowerCase().includes(query) ||
      status.toLowerCase().includes(query);
  });

  const stats = {
    pending: requests.filter(r => r.status === 'PENDING').length,
    approved: requests.filter(r => r.status === 'APPROVED').length,
    rejected: requests.filter(r => r.status === 'REJECTED' || r.status === 'DISMISSED').length,
    total: requests.length
  };

  const statsCards = [
    {
      title: "Total Petitions",
      value: stats.total,
      description: "All time records",
      icon: Inbox,
      valueClass: "text-slate-900",
      iconClass: "text-muted-foreground",
    },
    {
      title: "Pending Review",
      value: stats.pending,
      description: "Awaiting authorization",
      icon: Clock,
      valueClass: "text-amber-600",
      iconClass: "text-amber-500",
    },
    {
      title: "Approved",
      value: stats.approved,
      description: "Authorized absences",
      icon: CheckCircle2,
      valueClass: "text-emerald-600",
      iconClass: "text-emerald-500",
    },
    {
      title: "Rejected",
      value: stats.rejected,
      description: "Dismissed petitions",
      icon: XCircle,
      valueClass: "text-rose-600",
      iconClass: "text-rose-500",
    },
  ];

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50/50 min-h-screen">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Leave Governance</h2>
          <p className="text-sm text-muted-foreground">Manage and authorize institutional leave petitions.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['leave-requests'] })} variant="outline" className="h-9 border-slate-200">
            Refresh Queue
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((item, index) => {
          const Icon = item.icon;

          return (
            <Card
              key={index}
              className="shadow-sm border-slate-200 rounded-xl bg-white"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  {item.title}
                </CardTitle>

                <Icon className={`h-4 w-4 ${item.iconClass}`} />
              </CardHeader>

              <CardContent>
                <div className={`text-2xl font-bold ${item.valueClass}`}>
                  {item.value}
                </div>

                <p className="text-xs text-muted-foreground">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search petitions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-[300px] bg-slate-50/50 h-9 border-slate-200"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" className="h-9 gap-2 border-slate-200">
              <Filter className="h-4 w-4" /> Filters
            </Button>
            <Button variant="outline" className="h-9 gap-2 border-slate-200">
              <FileDown className="h-4 w-4" /> Export
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="h-[300px] flex flex-col items-center justify-center space-y-2">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              <p className="text-xs text-slate-400 font-medium">Loading petitions...</p>
            </div>
          ) : filteredRequests.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-500 font-medium uppercase tracking-wider text-xs">
                  <th className="text-left py-3 px-6">Faculty Member</th>
                  <th className="text-left py-3 px-6">Leave Window</th>
                  <th className="text-left py-3 px-6">Reason</th>
                  <th className="text-center py-3 px-6">Status</th>
                  <th className="text-right py-3 px-6">Protocol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((r) => {
                  const requestId = r.id || r._id;
                  const isProcessing = processMutation.isPending && (processMutation.variables as any)?.id === String(requestId);

                  return (
                    <tr key={requestId} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                            {r.staff?.image ? (
                              <img src={r.staff.image} className="w-full h-full object-cover" alt="" />
                            ) : (
                              <span className="font-bold text-slate-400">{r.staff?.name?.[0] || '?'}</span>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 leading-tight">{r.staff?.name || "Staff Member"}</p>
                            <p className="text-xs text-slate-400">{r.staff?.designation || "Faculty"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-700">{r.startDate} <span className="text-slate-300 mx-1">→</span> {r.endDate}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{r.type || 'Full Day'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 max-w-xs">
                        <p className="text-xs text-slate-500 line-clamp-2">{r.reason || "No description provided"}</p>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <Badge variant={
                          r.status === 'APPROVED' ? 'default' :
                            r.status === 'REJECTED' || r.status === 'DISMISSED' ? 'destructive' :
                              'outline'
                        } className={cn(
                          "font-bold text-[10px] uppercase tracking-tighter",
                          r.status === 'APPROVED' ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" :
                            r.status === 'REJECTED' || r.status === 'DISMISSED' ? "bg-red-100 text-red-700 hover:bg-red-100" :
                              "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-50"
                        )}>
                          {r.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {r.status === 'PENDING' ? (
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAction(requestId, 'REJECTED')}
                              disabled={isProcessing}
                              className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 border-slate-200"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleAction(requestId, 'APPROVED')}
                              disabled={isProcessing}
                              className="h-8 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] uppercase px-3"
                            >
                              {isProcessing ? <Loader2 className="h-3 w-3 animate-spin" /> : "Authorize"}
                            </Button>
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Processed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="h-[300px] flex flex-col items-center justify-center space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                <Inbox className="h-6 w-6" />
              </div>
              <p className="text-sm text-slate-500 font-semibold">No pending leave petitions found</p>
              <p className="text-xs text-slate-400">All submitted staff leave petitions will appear here for review.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
