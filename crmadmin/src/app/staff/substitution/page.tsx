"use client";
import client from "@/lib/client";

import React, { useState, useEffect } from "react";
import { 
  RefreshCcw, 
  Search, 
  CheckCircle2, 
  Clock,
  Calendar,
  ChevronRight,
  AlertTriangle,
  Loader2,
  Users,
  Layout,
  Zap,
  ShieldCheck,
  UserCheck
} from "lucide-react";
import { cn } from "@/lib/utils";


import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SubstitutionHub() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [vacancies, setVacancies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVacancy, setSelectedVacancy] = useState<any>(null);
  const [availableTeachers, setAvailableTeachers] = useState<any[]>([]);
  const [suggesting, setSuggesting] = useState(false);

  useEffect(() => {
    fetchVacancies();
  }, [date]);
  const fetchVacancies = async () => {
    try {
      setLoading(true);
      const data = await client.get("/staff/substitutions");
      setVacancies(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Failed to sync vacancy records");
    } finally {
      setLoading(false);
    }
  };

  const handleSuggest = async (vacancy: any) => {
    setSelectedVacancy(vacancy);
    try {
      setSuggesting(true);
      const day = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
      const data = await client.get("/staff");
      setAvailableTeachers(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Discovery failed");
    } finally {
      setSuggesting(false);
    }
  };

  const handleAssign = async (teacherId: number) => {
    try {
      const payload = {
        absentTeacherId: selectedVacancy.staffId,
        substituteTeacherId: teacherId,
        period: selectedVacancy.period,
        class: selectedVacancy.class,
        section: selectedVacancy.section,
        date: date
      };
      await client.post("/staff/substitutions", payload);
      toast.success("Substitution assigned successfully");
      setSelectedVacancy(null);
      fetchVacancies();
    } catch (err) {
      toast.error("Assignment failed");
    }
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50/50 min-h-screen">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Substitution Hub</h2>
          <p className="text-sm text-muted-foreground">Dynamic faculty allocation and operational cover management.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)}
            className="w-[180px] bg-white h-9"
          />
          <Button onClick={fetchVacancies} variant="outline" className="h-9 gap-2 border-slate-200">
            <RefreshCcw className="h-4 w-4" /> Sync Hub
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Vacancy Registry */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lgl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
               <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                 <Layout size={16} className="text-blue-600" />
                 Operational Vacancy Registry
               </h3>
               <Badge variant="outline" className={cn(
                 "font-bold text-[10px] uppercase",
                 vacancies.length > 0 ? "bg-red-50 text-red-600 border-red-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
               )}>
                 {vacancies.length} Active Vacancies
               </Badge>
            </div>

            <div className="overflow-x-auto min-h-[400px]">
              {loading ? (
                <div className="h-[400px] flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                </div>
              ) : vacancies.length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-500 font-medium uppercase tracking-wider">
                      <th className="text-left py-3 px-6">Absent Faculty</th>
                      <th className="text-center py-3 px-6">Period</th>
                      <th className="text-left py-3 px-6">Assignment</th>
                      <th className="text-right py-3 px-6">Protocol</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {vacancies.map((v, i) => (
                      <tr key={i} className={cn(
                        "hover:bg-slate-50/50 transition-colors group",
                        selectedVacancy?.id === v.id && "bg-blue-50/50"
                      )}>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-400">
                              {v.staff?.name?.[0] || '?'}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 leading-tight">{v.staff?.name}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">{v.subject || 'Resource Node'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-slate-900 text-white font-bold text-xs">
                            {v.period}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-slate-700 uppercase">Class {v.class}-{v.section}</span>
                            {v.assignment ? (
                              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                                <CheckCircle2 size={12} /> {v.assignment.substituteTeacher?.name}
                              </span>
                            ) : (
                              <span className="text-[10px] text-red-400 font-bold flex items-center gap-1 mt-1 animate-pulse">
                                <Clock size={12} /> Pending Cover
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          {!v.assignment && (
                            <Button 
                              size="sm"
                              variant={selectedVacancy?.id === v.id ? 'default' : 'outline'}
                              onClick={() => handleSuggest(v)}
                              className="h-8 text-[10px] font-bold uppercase tracking-widest px-4"
                            >
                              Discovery
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="h-[400px] flex flex-col items-center justify-center space-y-4">
                  <CheckCircle2 className="h-12 w-12 text-emerald-200" />
                  <p className="text-sm text-slate-400 font-medium  uppercase tracking-widest">Zero vacancies registered today</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Discovery Panel */}
        <div className="space-y-6">
          <Card className="shadow-sm border-slate-200 overflow-hidden">
            <CardHeader className="bg-slate-900 text-white py-4">
               <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest">
                 <Zap size={16} className="text-blue-400" />
                 Discovery Console
               </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {selectedVacancy ? (
                <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                  <div className="p-4 bg-slate-50 rounded-lgl border border-slate-100 space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Personnel</p>
                    <h4 className="text-lg font-bold text-slate-900">{selectedVacancy.staff?.name}</h4>
                    <div className="flex items-center gap-4 pt-2">
                       <div className="flex flex-col">
                         <span className="text-[9px] font-bold text-slate-400 uppercase">Period</span>
                         <span className="text-sm font-bold text-blue-600">{selectedVacancy.period}</span>
                       </div>
                       <div className="w-px h-6 bg-slate-200" />
                       <div className="flex flex-col">
                         <span className="text-[9px] font-bold text-slate-400 uppercase">Operational Node</span>
                         <span className="text-sm font-bold text-slate-700 uppercase">{selectedVacancy.class}-{selectedVacancy.section}</span>
                       </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ">Available Potential</h5>
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                    </div>

                    {suggesting ? (
                      <div className="py-12 flex flex-col items-center justify-center space-y-3">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Searching Engine...</p>
                      </div>
                    ) : availableTeachers.length > 0 ? (
                      <div className="space-y-2 max-h-[350px] overflow-y-auto no-scrollbar">
                        {availableTeachers.map((t, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => handleAssign(t.id)}
                            className={cn(
                              "p-3 bg-white border rounded-lgl hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group flex items-center justify-between shadow-sm active:scale-95",
                              t.isSuggested ? "ring-2 ring-blue-500/20 border-blue-200" : "border-slate-100"
                            )}
                          >
                            <div className="flex items-center gap-3">
                               <div className={cn(
                                 "h-8 w-8 rounded-lg flex items-center justify-center font-bold",
                                 t.isSuggested ? "bg-blue-600 text-white" : "bg-slate-100 text-blue-600 group-hover:bg-white"
                               )}>
                                 {t.name[0]}
                               </div>
                               <div>
                                 <div className="flex items-center gap-2">
                                    <p className="text-xs font-bold text-slate-900 leading-none">{t.name}</p>
                                    {t.isSuggested && (
                                      <Badge className="bg-blue-600 text-white text-[7px] h-3 px-1 font-black uppercase tracking-tighter">Best Match</Badge>
                                    )}
                                 </div>
                                 <div className="flex items-center gap-2 mt-1">
                                    <p className="text-[9px] text-slate-400 font-bold uppercase ">{t.subject || 'Faculty Asset'}</p>
                                    <span className="text-slate-200">•</span>
                                    <p className="text-[8px] text-slate-500 font-black uppercase tracking-tighter">Extra Load: {t.workloadToday}</p>
                                 </div>
                               </div>
                            </div>
                            <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 bg-red-50 rounded-lgl border border-red-100 text-center space-y-2">
                        <AlertTriangle className="h-8 w-8 text-red-500 mx-auto" />
                        <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest">No Free Faculty Nodes Detected</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-24 text-center space-y-4">
                  <Search className="h-12 w-12 text-slate-100 mx-auto" strokeWidth={1} />
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[4px] leading-relaxed ">
                    Select a vacancy from the registry <br/> to initiate discovery protocol
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {selectedVacancy && (
            <Button 
              variant="ghost" 
              onClick={() => setSelectedVacancy(null)}
              className="w-full text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-red-500"
            >
              Clear Analysis Context
            </Button>
          )}
        </div>
      </div>

      {/* Institutional Harmony Footer */}
      <div className="p-6 bg-slate-900 rounded-lgxl flex items-center justify-center gap-12 shadow-xl border border-slate-800">
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registry Synced</span>
        </div>
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50 animate-pulse" />
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Duty Alerts Active</span>
        </div>
        <div className="h-4 w-px bg-slate-800" />
        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest  flex items-center gap-2">
           <ShieldCheck size={14} className="text-blue-900" /> Automated Faculty Protocol v4.0
        </p>
      </div>
    </div>
  );
}
