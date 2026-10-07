"use client";
import client from "@/lib/client";

import React, { useState, useEffect } from "react";
import { 
  Search, 
  Wallet, 
  Banknote, 
  UserCheck, 
  Clock, 
  History,
  FileText,
  Filter,
  Users,
  TrendingUp,
  ChevronDown,
  Loader2,
  Calendar,
  Plus,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import toast from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@bprogress/next/app";

const months = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

function PaymentDialog({ staff }: { staff: any }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const staffId = staff._id || staff.id;
  const [amount, setAmount] = useState(staff.salaryStructure?.netSalary || "");
  const [month, setMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
  const [remark, setRemark] = useState("");

  const paymentMutation = useMutation({
    mutationFn: (data: any) => client.post("/salary/pay", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-summary'] });
      queryClient.invalidateQueries({ queryKey: ['salary-list'] });
      toast.success(`Salary processed for ${staff.name}`);
      setOpen(false);
    },
    onError: (err: any) => toast.error(err.response?.data?.error || "Payment failed")
  });

  const handlePay = () => {
    paymentMutation.mutate({
      staffId: staffId,
      amount: amount,
      month: month,
      year: new Date().getFullYear(),
      remark: remark || `Monthly salary for ${month}`
    });
  };

  return (
    <>
      <Button 
        size="sm" 
        onClick={() => setOpen(true)}
        className="h-8 font-bold text-[10px] uppercase px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm"
      >
        Process
      </Button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="bg-white w-full max-w-sm rounded-[30px] shadow-3xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 border-none">
            <div className="p-8">
              <h3 className="text-xl font-black text-slate-900 mb-1 uppercase  tracking-tight">Process Salary</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6">{staff.name} • {staff.designation || staff.role}</p>
              
              <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Month</label>
                      <select 
                        value={month}
                        onChange={e => setMonth(e.target.value)}
                        className="w-full h-11 rounded-lgl bg-slate-50 border-none px-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100"
                      >
                        {months.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Amount (₹)</label>
                      <Input 
                        type="number" 
                        value={amount} 
                        onChange={e => setAmount(e.target.value)} 
                        className="h-11 rounded-lgl font-bold text-lg bg-slate-50 border-none" 
                        placeholder="0.00"
                      />
                    </div>
                 </div>
                 <div className="space-y-1.5">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Remark</label>
                   <Input 
                     value={remark} 
                     onChange={e => setRemark(e.target.value)} 
                     className="h-11 rounded-lgl font-medium bg-slate-50 border-none" 
                     placeholder="Optional payment notes..."
                   />
                 </div>
                 <div className="flex flex-col gap-3 mt-6">
                    <Button onClick={handlePay} disabled={paymentMutation.isPending || !amount} className="w-full h-12 bg-slate-900 hover:bg-black text-white rounded-lgxl font-black uppercase text-[10px] tracking-widest shadow-lg">
                      {paymentMutation.isPending ? "Processing..." : "Confirm Payment"}
                    </Button>
                    <Button onClick={() => setOpen(false)} variant="outline" className="w-full h-12 rounded-lgxl font-bold uppercase text-[10px] tracking-widest border-slate-200">Cancel</Button>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function StructureDialog({ staff }: { staff: any }) {
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);
    const staffId = staff._id || staff.id;
    const [baseSalary, setBaseSalary] = useState(staff.salaryStructure?.baseSalary || "");
    const [allowances, setAllowances] = useState(staff.salaryStructure?.allowances || "0");
    const [deductions, setDeductions] = useState(staff.salaryStructure?.deductions || "0");

    const structureMutation = useMutation({
        mutationFn: (data: any) => client.post("/salary/structure", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['salary-list'] });
            toast.success('Salary structure updated');
            setOpen(false);
        },
        onError: () => toast.error('Failed to update structure')
    });

    const handleSave = () => {
        structureMutation.mutate({
            staffId: staffId,
            baseSalary,
            allowances,
            deductions
        });
    };

    return (
        <>
            <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setOpen(true)}
                className="h-8 w-8 p-0 border-slate-200 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
            >
                <Plus size={14} />
            </Button>

            {open && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
                    <div className="bg-white w-full max-w-sm rounded-[30px] shadow-3xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 border-none">
                        <div className="p-8">
                            <h3 className="text-xl font-black text-slate-900 mb-1 uppercase  tracking-tight">Salary Structure</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6">{staff.name}</p>
                            
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Base Salary</label>
                                    <Input type="number" value={baseSalary} onChange={e => setBaseSalary(e.target.value)} className="bg-slate-50 border-none rounded-lgl font-bold" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Allowances</label>
                                        <Input type="number" value={allowances} onChange={e => setAllowances(e.target.value)} className="bg-slate-50 border-none rounded-lgl font-bold" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Deductions</label>
                                        <Input type="number" value={deductions} onChange={e => setDeductions(e.target.value)} className="bg-slate-50 border-none rounded-lgl font-bold" />
                                    </div>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-lgxl flex justify-between items-center border border-blue-100">
                                    <span className="text-[10px] font-black text-blue-600 uppercase">Net Monthly</span>
                                    <span className="text-lg font-black text-blue-700 ">₹{parseFloat(baseSalary || 0) + parseFloat(allowances || 0) - parseFloat(deductions || 0)}</span>
                                </div>
                                <div className="flex flex-col gap-3 mt-6">
                                    <Button onClick={handleSave} disabled={structureMutation.isPending || !baseSalary} className="w-full h-12 bg-slate-900 text-white rounded-lgxl font-black uppercase tracking-widest text-[10px]">
                                        {structureMutation.isPending ? "Saving..." : "Save Structure"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default function SalaryPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Query: Salary Summary
  const { data: summary = null, isLoading: summaryLoading } = useQuery({
    queryKey: ['salary-summary'],
    queryFn: async () => {
      const res = await client.get("/salary/structures");
      return res;
    }
  });

  // Query: Staff Payroll Registry
  const { data: staffData = [], isLoading: loading } = useQuery({
    queryKey: ['salary-list'],
    queryFn: async () => {
      const res = await client.get("/salary/structures");
      return Array.isArray(res) ? res : (res.staff || []);
    }
  });

  const staffList = Array.isArray(staffData) ? staffData : [];

  const filteredStaff = staffList.filter((s: any) => 
    s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 bg-slate-50/50 min-h-screen font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-in fade-in duration-500">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-slate-900 uppercase font-heading">
             Payroll <span className="text-indigo-600">Engine</span>
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[4px] mt-1">Institutional Disbursement & Compensation Terminal</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
           <div className="relative w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
              <Input
                 placeholder="Search Faculty/Staff..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="pl-12 h-11 border-slate-100 bg-slate-50/50 rounded-xl font-bold text-xs focus:bg-white transition-all shadow-none"
              />
           </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-2xl shadow-emerald-500/10 border-none bg-emerald-600 text-white rounded-lg overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform"><Wallet size={50} /></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-[2px] opacity-80">Monthly Disbursement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black ">₹{(summary?.totalPaidThisMonth || 0).toLocaleString()}</div>
            <p className="text-[10px] font-bold uppercase tracking-widest mt-2 opacity-70">Total processed this month</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-2xl shadow-rose-500/10 border-none bg-white rounded-lg overflow-hidden relative group border border-slate-100">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><Clock size={50} className="text-rose-500" /></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-[2px] text-slate-400">Pending Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-slate-900 ">{summary?.pendingStaff || 0}</div>
            <p className="text-[10px] font-bold uppercase tracking-widest mt-2 text-rose-500">Staff awaiting payment</p>
          </CardContent>
        </Card>

        <Card className="shadow-2xl shadow-slate-900/10 border-none bg-slate-900 rounded-lg overflow-hidden relative text-white group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform"><Users size={50} /></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-[2px] opacity-80">Institutional Strength</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black ">{summary?.totalStaff || 0}</div>
            <p className="text-[10px] font-bold uppercase tracking-widest mt-2 opacity-70">Total active faculty nodes</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-lgxl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-white">
           <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-900 border border-slate-100 shadow-sm">
                 <History size={20} />
              </div>
              <div>
                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[4px] leading-none">Faculty Compensation <span className="text-indigo-600">Registry</span></h3>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[2px] mt-1.5">Live Disbursement Monitoring</p>
              </div>
           </div>
           <div className="flex items-center gap-3">
              <Button variant="outline" className="h-11 px-6 rounded-xl gap-2 border-slate-100 font-black text-[10px] uppercase tracking-widest text-slate-500 hover:bg-slate-50 shadow-sm transition-all">
                 <Filter size={14} /> Filter Registry
              </Button>
           </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-400 font-black text-[10px] uppercase tracking-[4px]">
                <th className="text-left py-6 px-10">Faculty Node</th>
                <th className="text-left py-6 px-10">Designation</th>
                <th className="text-left py-6 px-10">Structure</th>
                <th className="text-left py-6 px-10">Last Payout</th>
                <th className="text-right py-6 px-10">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                    <td colSpan={5} className="py-20 text-center">
                        <Loader2 className="h-10 w-10 animate-spin mx-auto text-blue-500 opacity-20" />
                    </td>
                </tr>
              ) : filteredStaff.length > 0 ? filteredStaff.map((staff: any) => {
                const staffId = staff._id || staff.id;
                return (
                  <tr key={staffId} className="hover:bg-slate-50/80 transition-all group">
                    <td className="py-6 px-10">
                      <div className="flex items-center space-x-4">
                         <div className="h-12 w-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center font-bold text-blue-600 shadow-sm group-hover:scale-110 transition-transform overflow-hidden">
                            <img 
                              src={staff.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${staff.name}`} 
                              className="h-full w-full object-cover"
                              alt=""
                            />
                         </div>
                         <div>
                            <p className="font-black text-slate-900 text-sm leading-tight uppercase ">{staff.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1">{staff.email}</p>
                         </div>
                      </div>
                    </td>
                    <td className="py-6 px-10">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-slate-700 uppercase ">{staff.role || staff.designation || 'STAFF'}</span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">{staff.designation || "MEMBER"}</span>
                        </div>
                    </td>
                    <td className="py-6 px-10">
                       {staff.salaryStructure ? (
                          <div className="flex flex-col">
                              <span className="font-black text-slate-900 text-sm ">₹{parseFloat(staff.salaryStructure.netSalary).toLocaleString()}</span>
                              <span className="text-[9px] text-emerald-600 font-black uppercase tracking-wider mt-0.5">Base: ₹{parseFloat(staff.salaryStructure.baseSalary).toLocaleString()}</span>
                          </div>
                       ) : (
                          <Badge variant="outline" className="bg-slate-50 text-slate-400 border-slate-200 text-[9px] font-black uppercase tracking-widest px-3 py-1">Structure Empty</Badge>
                       )}
                    </td>
                    <td className="py-6 px-10">
                      {staff.salaryPayments?.[0] ? (
                          <div className="flex flex-col gap-1">
                               <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-xs font-black text-slate-600 uppercase ">{staff.salaryPayments[0].month} {staff.salaryPayments[0].year}</span>
                               </div>
                               <button 
                                  onClick={() => router.push(`/staff/view/${staffId}`)}
                                  className="text-[8px] font-black uppercase text-blue-600 hover:text-blue-700 tracking-widest flex items-center gap-1 group/btn transition-all"
                               >
                                  <FileText size={10} /> View Breakdown
                               </button>
                          </div>
                      ) : (
                          <span className="text-xs font-black text-slate-300 uppercase tracking-[2px] ">No History</span>
                      )}
                    </td>
                    <td className="py-6 px-10 text-right">
                          <div className="flex justify-end items-center gap-3">
                              <StructureDialog staff={staff} />
                              <PaymentDialog staff={staff} />
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => router.push(`/staff/view/${staffId}`)}
                                className="h-8 w-8 rounded-lg text-slate-300 hover:text-slate-900 hover:bg-slate-100 transition-all"
                              >
                                <ArrowRight size={16} />
                              </Button>
                          </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                    <td colSpan={5} className="py-40 text-center">
                        <div className="max-w-xs mx-auto space-y-6 opacity-20">
                            <Users size={64} strokeWidth={1} className="mx-auto text-slate-900" />
                            <p className="text-[11px] font-black text-slate-900 uppercase tracking-[6px] ">Zero Faculty Records Detected</p>
                        </div>
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
