"use client";
import client from "@/lib/client";

import React, { useState, useEffect } from "react";
import {
   LifeBuoy,
   MessageCircle,
   Clock,
   CheckCircle,
   Search,
   Filter,
   ArrowRight,
   MoreVertical,
   User,
   Calendar,
   Send,
   Phone,
   ShieldCheck,
   ChevronDown,
   X,
   Layers,
   PieChart,
   Target,
   CheckSquare,
   FileDown,
   Loader2,
   XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/AbilityProvider";
import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogFooter,
} from "@/components/dialogbox/dialog";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function SupportHub() {
   const queryClient = useQueryClient();
   const { user, loading: authLoading } = useAuth();
   const [isMounted, setIsMounted] = useState(false);

   useEffect(() => {
      setIsMounted(true);
   }, []);

   const [filter, setFilter] = useState("ALL");
   const [searchTerm, setSearchTerm] = useState("");
   const [selectedQuery, setSelectedQuery] = useState<any>(null);
   const [replyText, setReplyText] = useState("");
   const isAdmin = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";

   const [selectedClass, setSelectedClass] = useState("ALL");
   const [selectedSection, setSelectedSection] = useState("ALL");
   const [selectedSubject, setSelectedSubject] = useState("ALL");
   const [timeRange, setTimeRange] = useState("ALL");

   // Query: Grievances & Students Enrichment
   const { data: queries = [], isLoading } = useQuery<any[]>({
      queryKey: ['grievances', user?.role, user?.class, user?.section],
      enabled: !!user && !authLoading,
      queryFn: async () => {
         const role = user.role || "SUPER_ADMIN";

         const [grievancesData, studentsData] = await (async () => {
            if (role === 'TEACHER' || role === 'teacher') {
               const g = await client.get("/reports/logs").catch(() => []);
               const s = await client.get("/staff/my-students").catch(() => []);
               return [g, s];
            } else {
               const g = await client.get("/reports/logs").catch(() => []);
               const s = await client.get("/students").catch(() => []);
               return [g, s];
            }
         })();

         const scholarRegistry = Array.isArray(studentsData)
            ? studentsData
            : (studentsData as any)?.students || (studentsData as any)?.data || [];

         return (Array.isArray(grievancesData) ? grievancesData : []).map((q: any) => {
            const scholar = scholarRegistry.find((s: any) =>
            (String(s.id) === String(q.studentId) ||
               String(s._id) === String(q.studentId) ||
               s.admissionNo === q.admissionNo ||
               s.name?.toLowerCase().trim() === q.studentName?.toLowerCase().trim())
            );
            return {
               ...q,
               studentImage: scholar?.image || q.studentImage
            };
         });
      }
   });

   // Mutation: Dispatch Reply
   const replyMutation = useMutation({
      mutationFn: (data: any) => client.post("/reports/logs", data),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['grievances'] });
         toast.success("Response dispatched");
         setSelectedQuery(null);
         setReplyText("");
      },
      onError: () => toast.error("Dispatch failure")
   });

   const handleReply = () => {
      if (!replyText.trim() || !selectedQuery) return;
      const adminName = user?.name || "Super Admin";
      replyMutation.mutate({
         teacherReply: replyText,
         responderName: adminName
      });
   };

   const isToday = (dateStr: string) => {
      const d = new Date(dateStr);
      const now = new Date();
      return d.getDate() === now.getDate() &&
         d.getMonth() === now.getMonth() &&
         d.getFullYear() === now.getFullYear();
   };

   const filteredQueries = queries.filter(q => {
      const matchesFilter = filter === "ALL" || q.status === filter;
      const matchesClass = selectedClass === "ALL" || q.class === selectedClass;
      const matchesSection = selectedSection === "ALL" || q.section === selectedSection;
      const matchesSubject = selectedSubject === "ALL" || q.subject === selectedSubject;
      const matchesDate = timeRange === "ALL" || isToday(q.date);
      const matchesSearch = q.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         q.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         q.subject?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesClass && matchesSection && matchesSubject && matchesDate && matchesSearch;
   });

   const uniqueClasses = Array.from(new Set(queries.map(q => q?.class).filter(Boolean))).sort();
   const uniqueSubjects = Array.from(new Set(queries.map(q => q?.subject).filter(Boolean))).sort();

   if (!isMounted) {
      return (
         <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50/50 min-h-screen">
            <div className="p-6 space-y-4">
               <Skeleton className="h-10 w-64 rounded-xl" />
               <div className="grid gap-4 md:grid-cols-4">
                  {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
               </div>
               <Skeleton className="h-96 w-full rounded-2xl" />
            </div>
         </div>
      );
   }

   return (
      <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50/50 min-h-screen">

         {/* Header */}
         <div className="flex items-center justify-between space-y-2">
            <div>
               <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                  Institutional Support Hub
               </h2>
               <p className="text-sm text-muted-foreground">Centralized grievance and assistance terminal for scholarly communication.</p>
            </div>
            <div className="flex items-center space-x-2">
               <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                  <Button
                     variant={timeRange === 'ALL' ? 'default' : 'ghost'}
                     size="sm"
                     onClick={() => setTimeRange('ALL')}
                     className={cn("h-8 text-[10px] font-bold uppercase", timeRange === 'ALL' && "bg-slate-900 text-white")}
                  >
                     Audit History
                  </Button>
                  <Button
                     variant={timeRange === 'TODAY' ? 'default' : 'ghost'}
                     size="sm"
                     onClick={() => setTimeRange('TODAY')}
                     className={cn("h-8 text-[10px] font-bold uppercase", timeRange === 'TODAY' && "bg-slate-900 text-white")}
                  >
                     Today
                  </Button>
               </div>
               <Button variant="outline" className="h-9 gap-2 border-slate-200"><FileDown className="h-4 w-4" /> Export</Button>
            </div>
         </div>

         {/* Analytics Cards */}
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="shadow-sm border-slate-200 rounded-lg">
               <CardContent className="p-4 flex items-center justify-between">
                  <div>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pending Total</p>
                     <h3 className="text-2xl font-bold mt-1 text-amber-600">{queries.filter(q => q.status === 'PENDING').length}</h3>
                  </div>
                  <Clock className="h-8 w-8 text-amber-500 opacity-20" />
               </CardContent>
            </Card>
            <Card className="shadow-sm border-slate-200 rounded-lg">
               <CardContent className="p-4 flex items-center justify-between">
                  <div>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resolved Record</p>
                     <h3 className="text-2xl font-bold mt-1 text-emerald-600">{queries.filter(q => q.status === 'RESOLVED').length}</h3>
                  </div>
                  <CheckCircle className="h-8 w-8 text-emerald-500 opacity-20" />
               </CardContent>
            </Card>
            <Card className="shadow-sm border-slate-200 rounded-lg">
               <CardContent className="p-4 flex items-center justify-between">
                  <div>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registry Depth</p>
                     <h3 className="text-2xl font-bold mt-1 text-slate-900">{queries.length}</h3>
                  </div>
                  <MessageCircle className="h-8 w-8 text-indigo-500 opacity-20" />
               </CardContent>
            </Card>
            <Card className="shadow-sm border-slate-200 bg-slate-900 text-white rounded-lg">
               <CardContent className="p-4 flex items-center justify-between">
                  <div>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Efficiency</p>
                     <h3 className="text-2xl font-bold mt-1 text-white">
                        {queries.length > 0 ? Math.round((queries.filter(q => q.status === 'RESOLVED').length / queries.length) * 100) : 0}%
                     </h3>
                  </div>
                  <Target className="h-8 w-8 text-blue-400 opacity-40" />
               </CardContent>
            </Card>
         </div>

         {/* Table Card */}
         <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white gap-4">
               <div className="flex-1 flex items-center gap-3">
                  <div className="relative flex-1 max-w-xs">
                     <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                     <Input
                        placeholder="Search queries..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 bg-slate-50/50 h-9 border-slate-200 text-xs"
                     />
                  </div>
                  {isAdmin && (
                     <div className="flex gap-2">
                        <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="h-9 px-3 bg-white border border-slate-200 rounded-md text-[10px] font-bold uppercase outline-none">
                           <option value="ALL">ALL CLASSES</option>
                           {uniqueClasses.map(c => <option key={String(c)} value={String(c)}>CLASS {String(c).toUpperCase()}</option>)}
                        </select>
                        <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="h-9 px-3 bg-white border border-slate-200 rounded-md text-[10px] font-bold uppercase outline-none">
                           <option value="ALL">ALL SUBJECTS</option>
                           {uniqueSubjects.map(s => <option key={String(s)} value={String(s)}>{String(s).toUpperCase()}</option>)}
                        </select>
                     </div>
                  )}
               </div>
               <div className="flex items-center space-x-2">
                  <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                     <Button variant={filter === 'ALL' ? 'default' : 'ghost'} size="sm" onClick={() => setFilter('ALL')} className={cn("h-7 text-[9px] font-bold uppercase px-3", filter === 'ALL' && "bg-slate-900")}>All</Button>
                     <Button variant={filter === 'PENDING' ? 'default' : 'ghost'} size="sm" onClick={() => setFilter('PENDING')} className={cn("h-7 text-[9px] font-bold uppercase px-3", filter === 'PENDING' && "bg-slate-900")}>Pending</Button>
                  </div>
               </div>
            </div>

            <div className="overflow-x-auto min-h-[500px]">
               {isLoading ? (
                  <div className="p-6 space-y-4">
                     {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
                  </div>
               ) : filteredQueries.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-slate-300">
                     <LifeBuoy size={48} strokeWidth={1} />
                     <p className="text-[10px] font-bold uppercase tracking-widest mt-4">Void Support Registry</p>
                  </div>
               ) : (
                  <table className="w-full text-sm min-w-[1000px]">
                     <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <tr>
                           <th className="py-3 px-4 text-left">Incident Identification</th>
                           <th className="py-3 px-4 text-left">Scholastic Source</th>
                           <th className="py-3 px-4 text-left">Context / Topic</th>
                           <th className="py-3 px-4 text-left">Chronology</th>
                           <th className="py-3 px-4 text-left">Disciplinary Status</th>
                           <th className="py-3 px-4 text-right">Administrative Protocol</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                        {filteredQueries.map((query: any) => (
                           <tr key={query._id || query.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-3.5 px-4">
                                 <span className="font-mono text-xs font-bold text-slate-900">#{(query._id || query.id || "").substring(0, 8)}</span>
                              </td>
                              <td className="py-3.5 px-4">
                                 <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs overflow-hidden">
                                       {query.studentImage ? (
                                          <img src={query.studentImage} alt={query.studentName} className="w-full h-full object-cover" />
                                       ) : (
                                          query.studentName?.[0] || 'S'
                                       )}
                                    </div>
                                    <div>
                                       <div className="font-bold text-slate-800 text-xs">{query.studentName || "Anonymous"}</div>
                                       <div className="text-[10px] text-slate-400 font-bold tracking-wider">
                                          {query.admissionNo || "NO-ADM"} | CLASS {query.class || "--"} - {query.section || "--"}
                                       </div>
                                    </div>
                                 </div>
                              </td>
                              <td className="py-3.5 px-4">
                                 <div className="font-bold text-xs text-slate-700">{query.subject || "General Query"}</div>
                                 <div className="text-[11px] text-slate-400 truncate max-w-xs">{query.message}</div>
                              </td>
                              <td className="py-3.5 px-4 text-xs font-mono text-slate-500">
                                 {query.date ? new Date(query.date).toLocaleDateString() : "--"}
                              </td>
                              <td className="py-3.5 px-4">
                                 <Badge variant={query.status === 'RESOLVED' ? 'default' : 'outline'} className={cn(
                                    "text-[9px] font-bold uppercase",
                                    query.status === 'RESOLVED' ? "bg-emerald-500" : "text-amber-600 border-amber-300"
                                 )}>
                                    {query.status || 'PENDING'}
                                 </Badge>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                 <Button
                                    size="sm"
                                    onClick={() => {
                                       setSelectedQuery(query);
                                       setReplyText(query.teacherReply || "");
                                    }}
                                    className="h-8 text-xs font-bold bg-slate-900 hover:bg-slate-800"
                                 >
                                    Review & Reply
                                 </Button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               )}
            </div>
         </div>

         {/* Reply Dialog */}
         {selectedQuery && (
            <Dialog open={!!selectedQuery} onOpenChange={() => setSelectedQuery(null)}>
               <DialogContent className="max-w-xl">
                  <DialogHeader>
                     <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <MessageCircle className="h-5 w-5 text-blue-600" />
                        Official Incident Disposition
                     </DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                     <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex justify-between items-start mb-2">
                           <span className="font-bold text-slate-900 text-sm">{selectedQuery.studentName}</span>
                           <Badge variant="outline">{selectedQuery.subject}</Badge>
                        </div>
                        <p className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-100">{selectedQuery.message}</p>
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Institutional Resolution</label>
                        <textarea
                           value={replyText}
                           onChange={(e) => setReplyText(e.target.value)}
                           rows={4}
                           className="w-full p-3 text-xs border border-slate-200 rounded-xl outline-none focus:border-slate-900"
                           placeholder="Type official response here..."
                        />
                     </div>
                  </div>

                  <DialogFooter className="gap-2">
                     <Button variant="outline" size="sm" onClick={() => setSelectedQuery(null)}>Cancel</Button>
                     <Button size="sm" onClick={handleReply} disabled={replyMutation.isPending} className="bg-slate-900">
                        {replyMutation.isPending ? "Dispatching..." : "Dispatch Resolution"}
                     </Button>
                  </DialogFooter>
               </DialogContent>
            </Dialog>
         )}
      </div>
   );
}
