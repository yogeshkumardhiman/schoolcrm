"use client";
import client from "@/lib/client";
import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { ArrowLeft, CreditCard, Calendar, User, CheckCircle2, Clock, AlertCircle, Receipt, Loader2, Wallet, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function StudentLedgerPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedDues, setSelectedDues] = useState<any[]>([]);

  const { data: studentData, isLoading } = useQuery({
    queryKey: ['student-ledger', id],
    queryFn: async () => {
      const profile = await client.get("/fees/structures");
      if (profile) return profile;

      const allRes: any = await client.get("/fees/structures");
      const list = Array.isArray(allRes) ? allRes : (allRes?.data || []);
      return list.find((s: any) => String(s.admissionNo) === String(id) || String(s.id) === String(id)) || list[0];
    }
  });

  const student = studentData?.student || studentData;
  const feeDues = student?.feeDues || studentData?.finance?.dues || [];
  const payments = student?.payments || studentData?.finance?.history || [];

  const paymentMutation = useMutation({
    mutationFn: (data: any) => client.post("/fees/pay", data),
    onSuccess: () => {
      toast.success('Fee Payment Recorded Successfully');
      queryClient.invalidateQueries({ queryKey: ['student-ledger', id] });
      setSelectedDues([]);
    },
    onError: () => toast.error('Failed to record payment')
  });
  const [generatingDue, setGeneratingDue] = useState(false);

  const getNextMonthToGenerate = () => {
    const monthsOrder = [
      "April", "May", "June", "July", "August", "September",
      "October", "November", "December", "January", "February", "March"
    ];

    if (feeDues.length === 0) return "April";

    const generatedMonths = feeDues.map((d: any) => d.month);
    let maxIdx = -1;
    generatedMonths.forEach((m: string) => {
      const idx = monthsOrder.indexOf(m);
      if (idx > maxIdx) maxIdx = idx;
    });

    if (maxIdx === -1 || maxIdx === monthsOrder.length - 1) {
      return null;
    }

    return monthsOrder[maxIdx + 1];
  };

  const handleGenerateNextDue = async () => {
    const nextMonth = getNextMonthToGenerate();
    if (!nextMonth) {
      toast.error("All monthly invoices for the session are already generated.");
      return;
    }

    setGeneratingDue(true);
    try {
      await client.post("/fees/structures", {
        studentId: student.id || studentData?.id,
        month: nextMonth,
        year: 2026
      });
      toast.success(`Invoice for ${nextMonth} generated successfully!`);
      queryClient.invalidateQueries({ queryKey: ['student-ledger', id] });
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to generate invoice");
    } finally {
      setGeneratingDue(false);
    }
  };
  const handleToggleDue = (due: any) => {
    if (due.status === 'PAID') return;

    if (selectedDues.find(d => d.id === due.id)) {
      setSelectedDues(selectedDues.filter(d => d.id !== due.id));
    } else {
      setSelectedDues([...selectedDues, due]);
    }
  };

  const handlePay = () => {
    if (selectedDues.length === 0) return toast.error('Please select at least one invoice to pay');

    // In new architecture, markPayment handles FIFO or we pass amounts
    const amountToPay = selectedDues.reduce((acc, curr) => acc + (parseFloat(curr.totalAmount) - parseFloat(curr.paidAmount || 0)), 0);

    paymentMutation.mutate({
      studentId: student.id,
      amountPaid: amountToPay,
      month: selectedDues.map(d => d.month).join(', '),
      mode: 'CASH',
      remark: 'Multiple Invoices Clearance'
    });
  };

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-4 bg-slate-50">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
        <p className="text-[10px] font-black uppercase tracking-[4px] text-slate-400">Loading Scholar Ledger...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-6 bg-slate-50">
        <AlertCircle size={64} className="text-rose-500 opacity-20" />
        <p className="text-lg font-bold text-slate-600">Scholar Registry Not Found</p>
        <Button onClick={() => router.back()} variant="outline" className="rounded-2xl px-8 border-slate-200">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FB] p-8 space-y-8 font-sans">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.push('/fees')}
          className="flex items-center gap-3 text-slate-400 hover:text-slate-900 transition-all font-black uppercase text-[10px] tracking-widest"
        >
          <ArrowLeft size={18} /> Back to Registry
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-8">
          <Card className="rounded-[40px] border-none shadow-2xl overflow-hidden bg-white relative group">
            <div className="absolute top-0 left-0 w-full h-32 bg-slate-900 group-hover:h-36 transition-all duration-500" />
            <CardContent className="pt-16 pb-10 flex flex-col items-center text-center relative">
              <Avatar className="h-24 w-24 border-4 border-white shadow-xl relative z-10">
                <AvatarImage src={student?.image} className="object-cover" />
                <AvatarFallback className="bg-slate-100 text-slate-400 text-2xl font-black">
                  {student?.name?.[0] || 'S'}
                </AvatarFallback>
              </Avatar>

              <div className="mt-6 space-y-2">
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight ">{student?.name}</h3>
                <p className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full uppercase tracking-widest inline-block border border-indigo-100">
                  ADM ID: {student?.admissionNo}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full mt-10 px-4">
                <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Grade</p>
                  <p className="text-sm font-black text-slate-900 uppercase tracking-tighter">Grade {student?.class}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Section</p>
                  <p className="text-sm font-black text-slate-900 uppercase tracking-tighter">Section {student?.section}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <Card className="rounded-[40px] border-none shadow-2xl bg-white overflow-hidden">
            <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/30">
              <div>
                <h4 className="text-2xl font-black uppercase tracking-tighter text-slate-900 ">Dynamic Ledger Invoices</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[3px] mt-1">Relational Fee Due Architecture</p>
              </div>
              <div className="flex items-center gap-3">
                {getNextMonthToGenerate() && (
                  <Button
                    disabled={generatingDue}
                    onClick={handleGenerateNextDue}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest px-6 h-12 shadow-lg shadow-indigo-100 flex items-center gap-2 transition-all active:scale-95 shrink-0"
                  >
                    {generatingDue ? <Loader2 className="animate-spin h-4 w-4" /> : <Plus size={16} />}
                    Generate {getNextMonthToGenerate()} Invoice
                  </Button>
                )}
              </div>
            </div>

            <div className="p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {feeDues.length === 0 && (
                  <div className="col-span-2 py-10 flex flex-col items-center justify-center text-slate-400">
                    <Receipt size={48} className="opacity-20 mb-4" />
                    <p className="text-sm font-black uppercase tracking-widest">No Invoices Generated Yet</p>
                  </div>
                )}

                {feeDues.map((due: any) => {
                  const isPaid = due.status === 'PAID';
                  const isPartial = due.status === 'PARTIAL';
                  const isSelected = selectedDues.some(d => d.id === due.id);
                  const remaining = parseFloat(due.totalAmount) - parseFloat(due.paidAmount || 0);

                  return (
                    <div
                      key={due.id}
                      onClick={() => handleToggleDue(due)}
                      className={cn(
                        "relative p-6 rounded-[32px] border-2 transition-all duration-300 cursor-pointer group overflow-hidden",
                        isPaid
                          ? "bg-emerald-50 border-emerald-100 cursor-default"
                          : isSelected
                            ? "bg-indigo-600 border-indigo-600 shadow-xl shadow-indigo-100 scale-105"
                            : "bg-white border-slate-100 hover:border-indigo-200 hover:shadow-lg"
                      )}
                    >
                      <div className="flex flex-col h-full justify-between relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <span className={cn(
                            "text-[9px] font-black uppercase tracking-widest",
                            isPaid ? "text-emerald-600" : isSelected ? "text-indigo-100" : "text-slate-400"
                          )}>
                            {due.month} {due.year}
                          </span>
                          {isPaid ? (
                            <div className="h-8 w-8 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
                              <CheckCircle2 size={16} />
                            </div>
                          ) : isSelected ? (
                            <div className="h-8 w-8 bg-white/20 rounded-xl flex items-center justify-center text-white backdrop-blur-md">
                              <CreditCard size={16} />
                            </div>
                          ) : (
                            <div className="h-8 w-8 bg-rose-50 rounded-xl flex items-center justify-center text-rose-300 border border-rose-100 group-hover:border-indigo-100 group-hover:text-indigo-400 transition-all">
                              <Clock size={16} />
                            </div>
                          )}
                        </div>

                        <div>
                          <p className={cn(
                            "text-2xl font-black uppercase tracking-tighter ",
                            isPaid ? "text-emerald-900" : isSelected ? "text-white" : "text-slate-900"
                          )}>
                            ₹{parseFloat(due.totalAmount).toLocaleString()}
                          </p>
                          {isPaid ? (
                            <p className="text-[10px] font-bold mt-1 uppercase tracking-tight text-emerald-600">
                              Fully Settled — Paid ₹{parseFloat(due.paidAmount || due.totalAmount).toLocaleString()}
                            </p>
                          ) : (
                            <p className={cn(
                              "text-[10px] font-bold mt-1 uppercase tracking-tight",
                              isSelected ? "text-indigo-200" : "text-rose-500"
                            )}>
                              {isPartial 
                                ? `Outstanding: ₹${remaining.toLocaleString()} (Paid: ₹${parseFloat(due.paidAmount || 0).toLocaleString()})` 
                                : `Outstanding: ₹${remaining.toLocaleString()}`}
                            </p>
                          )}

                          {/* JSON Breakdown */}
                          {due.breakdown && typeof due.breakdown === 'object' && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {Object.entries(due.breakdown).map(([key, val]: any) => (
                                <span key={key} className={cn("text-[8px] font-black uppercase px-2 py-1 rounded-md", isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500")}>
                                  {key}: ₹{val}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className={cn(
                "mt-12 p-8 rounded-[40px] bg-slate-900 flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-500 animate-in slide-in-from-bottom-10",
                selectedDues.length === 0 && "opacity-0 scale-95 pointer-events-none"
              )}>
                <div className="flex items-center gap-6">
                  <div className="h-16 w-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-indigo-500/20">
                    <Receipt size={28} />
                  </div>
                  <div>
                    <p className="text-white font-black text-xl  uppercase tracking-tighter">Clear {selectedDues.length} Selected Invoices</p>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[4px] mt-1">Total Amout: ₹{selectedDues.reduce((acc, curr) => acc + (parseFloat(curr.totalAmount) - parseFloat(curr.paidAmount || 0)), 0)}</p>
                  </div>
                </div>
                <Button
                  onClick={handlePay}
                  disabled={paymentMutation.isPending}
                  className="bg-white hover:bg-indigo-50 text-slate-900 h-16 px-12 rounded-[24px] font-black uppercase text-[12px] tracking-[3px] shadow-2xl transition-all active:scale-95 flex items-center gap-4"
                >
                  {paymentMutation.isPending ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                  Process Payment
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
