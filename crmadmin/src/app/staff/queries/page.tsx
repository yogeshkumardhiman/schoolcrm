"use client";
import client from "@/lib/client";
import React, { useState } from "react";
import { 
  LifeBuoy, 
  MessageSquare, 
  Search, 
  Clock, 
  CheckCircle2, 
  Send,
  User,
  ArrowLeft,
  X,
  Filter,
  AlertTriangle
} from "lucide-react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

function QueriesSkeleton() {
  return (
    <div className="p-8 space-y-8 min-h-screen bg-[#F8FAFC] animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64 rounded-lg" />
          <Skeleton className="h-4 w-80 rounded-md" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white p-8 rounded-lg border border-slate-100 shadow-sm space-y-6">
            <div className="flex justify-between items-start">
              <div className="flex gap-4">
                <Skeleton className="h-12 w-12 rounded-lgxl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <Skeleton className="h-8 w-24 rounded-full" />
            </div>
            <Skeleton className="h-20 w-full rounded-lgxl" />
            <div className="flex justify-end">
              <Skeleton className="h-12 w-40 rounded-lgl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SupportingHubPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'RESOLVED'>('ALL');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  const { data: queries = [], isLoading } = useQuery<any[]>({
    queryKey: ['teacher-queries'],
    queryFn: () => client.get("/reports/logs")
  });

  const replyMutation = useMutation({
    mutationFn: ({ id, text }: { id: number, text: string }) => 
      client.post("/reports/logs", { teacherReply: text, responderName: "Class Teacher" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-queries'] });
      toast.success("Institutional Response Dispatched");
      setReplyingTo(null);
      setReplyText("");
    },
    onError: () => {
      toast.error("Dispatch failure. Please verify connection.");
    }
  });

  const handleReply = (id: number) => {
    if (!replyText.trim()) return;
    replyMutation.mutate({ id, text: replyText });
  };

  const filteredQueries = queries.filter(q => {
    const matchesSearch = q.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          q.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          q.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || q.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) return <QueriesSkeleton />;

  return (
    <div className="p-8 space-y-8 min-h-screen bg-[#F8FAFC]">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Link href="/" className="h-10 w-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all">
              <ArrowLeft size={18} />
            </Link>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Supporting Hub</h2>
          </div>
          <p className="text-sm text-slate-500 font-medium ml-12 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            Class Governance & Scholar Queries
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search queries, scholars, or categories..."
              className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-lgxl text-[13px] font-bold outline-none focus:ring-4 focus:ring-blue-100 transition-all shadow-sm"
            />
          </div>
          <div className="flex bg-white border border-slate-200 rounded-lgxl p-1 shadow-sm">
             {(['ALL', 'PENDING', 'RESOLVED'] as const).map(status => (
               <button
                 key={status}
                 onClick={() => setFilterStatus(status)}
                 className={cn(
                   "px-4 py-2 rounded-lgl text-[10px] font-black uppercase tracking-widest transition-all",
                   filterStatus === status ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:bg-slate-50"
                 )}
               >
                 {status}
               </button>
             ))}
          </div>
        </div>
      </div>

      {/* Queries List */}
      <div className="grid grid-cols-1 gap-6 pb-20">
        {filteredQueries.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center bg-white rounded-[40px] border border-dashed border-slate-200 space-y-4">
             <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                <MessageSquare size={40} />
             </div>
             <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">No active queries in current filter</p>
          </div>
        ) : (
          filteredQueries.map((query) => (
            <div key={query.id} className={cn(
              "bg-white rounded-lg border transition-all duration-500 overflow-hidden",
              query.status === 'PENDING' ? "border-amber-100 shadow-amber-50/50 shadow-xl" : "border-slate-100 shadow-sm"
            )}>
              <div className="p-8 space-y-6">
                {/* Query Header */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-lgxl bg-slate-100 overflow-hidden border-2 border-white shadow-sm ring-1 ring-slate-100">
                       <img 
                         src={query.studentImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${query.studentName}`} 
                         className="h-full w-full object-cover" 
                       />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900">{query.studentName}</h3>
                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">{query.category}</span>
                      </div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mt-1">
                        <Clock size={12} /> {new Date(query.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  
                  <div className={cn(
                    "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[2px] border",
                    query.status === 'PENDING' ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                  )}>
                    {query.status}
                  </div>
                </div>

                {/* Query Content */}
                <div className="bg-slate-50/50 rounded-lgxl p-6 border border-slate-100">
                  <p className="text-slate-700 font-medium leading-relaxed ">"{query.description}"</p>
                </div>

                {/* Existing Reply */}
                {query.teacherReply && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       <User size={14} /> 
                       <span>Institutional Response</span>
                    </div>
                    <div className="bg-blue-600 text-white rounded-lgxl p-6 shadow-xl shadow-blue-100 relative">
                       <div className="absolute -top-2 left-6 h-4 w-4 bg-blue-600 rotate-45" />
                       <p className="text-sm font-bold leading-relaxed">{query.teacherReply}</p>
                       {query.responderName && (
                         <div className="mt-4 pt-4 border-t border-white/10 text-[10px] font-black uppercase tracking-widest opacity-60">
                            Authorized By: {query.responderName}
                         </div>
                       )}
                    </div>
                  </div>
                )}

                {/* Action Row */}
                {!query.teacherReply && replyingTo !== query.id && (
                  <div className="flex justify-end">
                    <button 
                      onClick={() => setReplyingTo(query.id)}
                      className="h-14 px-8 bg-slate-900 text-white rounded-lgxl font-bold uppercase text-[10px] tracking-[2px] hover:bg-blue-600 transition-all shadow-lg active:scale-95 flex items-center gap-3"
                    >
                      <Send size={16} /> Compose Response
                    </button>
                  </div>
                )}

                {/* Reply Form */}
                {replyingTo === query.id && (
                  <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
                     <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Drafting Official Response</label>
                        <button onClick={() => setReplyingTo(null)} className="text-slate-400 hover:text-red-500"><X size={18} /></button>
                     </div>
                     <textarea 
                       value={replyText}
                       onChange={(e) => setReplyText(e.target.value)}
                       placeholder="Enter your professional response to the scholar's parents..."
                       className="w-full h-32 p-6 bg-slate-50 border border-slate-200 rounded-lgxl text-sm font-medium outline-none focus:ring-4 focus:ring-blue-100 transition-all resize-none"
                     />
                     <div className="flex justify-end gap-3">
                        <button 
                          onClick={() => setReplyingTo(null)}
                          className="h-12 px-6 text-slate-400 font-bold uppercase text-[10px] tracking-widest hover:bg-slate-50 rounded-lgl"
                        >
                          Discard
                        </button>
                        <button 
                          onClick={() => handleReply(query.id)}
                          disabled={replyMutation.isPending}
                          className="h-12 px-8 bg-blue-600 text-white rounded-lgl font-bold uppercase text-[10px] tracking-widest hover:bg-blue-700 transition-all shadow-lg disabled:opacity-50"
                        >
                          {replyMutation.isPending ? "Dispatching..." : "Dispatch Response"}
                        </button>
                     </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Advisory Note */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6">
        <div className="bg-white/80 backdrop-blur-md border border-amber-100 p-4 rounded-lgxl flex items-center gap-3 shadow-2xl">
           <AlertTriangle size={20} className="text-amber-600" />
           <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
             Replies are visible to parents instantly via the Scholar App. Please maintain institutional protocol.
           </p>
        </div>
      </div>
    </div>
  );
}
