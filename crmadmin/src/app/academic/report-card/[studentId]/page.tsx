"use client";
import client from "@/lib/client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@bprogress/next/app";

import { Loader2, Printer, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_CONFIG } from "@/constants/config";

export default function ReportCardPage() {
  const { studentId } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentRes, resultsRes] = await Promise.all([
          client.get(`/students/${studentId as string}`),
          client.get(`/academic/marks?studentId=${studentId as string}`),
        ]);
        setStudent(studentRes.data);
        setResults(resultsRes);
      } catch (error) {
        console.error("Error fetching report card data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchData();
    }
  }, [studentId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Generating Scholastic Matrix...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return <div className="p-20 text-center">Scholar record not found.</div>;
  }

  // Group results by exam type
  const exams = Array.from(new Set(results.map((r) => r.examType)));

  return (
    <div className="min-h-screen bg-slate-100 p-8 no-scrollbar">
      {/* Action Bar - Hidden in Print */}
      <div className="max-w-4xl mx-auto mb-8 flex justify-between items-center print:hidden">
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="rounded-lgl border-slate-200 text-slate-600 hover:bg-white"
        >
          <ArrowLeft size={16} className="mr-2" /> Back to Profile
        </Button>
        <Button 
          onClick={handlePrint}
          className="bg-slate-900 hover:bg-black text-white rounded-lgl px-8 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2 shadow-lg"
        >
          <Printer size={16} /> Print Report Card
        </Button>
      </div>

      {/* Report Card Container */}
      <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-[40px] overflow-hidden border border-slate-100 print:shadow-none print:rounded-none print:border-none print:m-0">
        
        {/* Header Section */}
        <div className="p-12 text-center border-b-2 border-slate-50 relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-blue-600 via-indigo-600 to-violet-600" />
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-2">
            {APP_CONFIG.institution.name}
          </h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em] mb-8">{APP_CONFIG.institution.hubName}</p>
          
          <div className="inline-block px-8 py-2 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-12 shadow-xl shadow-slate-200">
            Progress Summary Report • {student.session || "Current Session"}
          </div>

          <div className="grid grid-cols-3 gap-8 text-left max-w-3xl mx-auto">
             <div className="space-y-4">
                <div>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Scholar Identity</p>
                   <p className="text-sm font-bold text-slate-900">{student.name}</p>
                </div>
                <div>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Admission Number</p>
                   <p className="text-sm font-bold text-slate-900">{student.admissionNo}</p>
                </div>
             </div>
             <div className="space-y-4">
                <div>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Father's Name</p>
                   <p className="text-sm font-bold text-slate-900">{student.fatherName || "N/A"}</p>
                </div>
                <div>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Class & Section</p>
                   <p className="text-sm font-bold text-slate-900">{student.class} - {student.section}</p>
                </div>
             </div>
             <div className="flex flex-col items-center justify-center">
                <div className="h-24 w-24 rounded-lgxl bg-slate-50 border-2 border-slate-100 overflow-hidden shadow-inner p-1">
                   <img src={student.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`} className="h-full w-full object-cover rounded-lgxl" alt="" />
                </div>
             </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="p-12 space-y-12">
          {exams.length > 0 ? exams.map(examType => {
            const examResults = results.filter(r => r.examType === examType);
            const totalObtained = examResults.reduce((acc, curr) => acc + curr.marks, 0);
            const totalMax = examResults.reduce((acc, curr) => acc + curr.total, 0);
            const percentage = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(1) : "0.0";

            return (
              <div key={examType} className="space-y-6">
                 <div className="flex items-center gap-4">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">{examType}</h3>
                    <div className="h-px flex-1 bg-slate-100" />
                 </div>

                 <div className="overflow-hidden border border-slate-100 rounded-lg bg-white">
                    <table className="w-full text-left">
                       <thead className="bg-slate-50/50">
                          <tr>
                             <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Subject</th>
                             <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Max Marks</th>
                             <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Marks Obtained</th>
                             <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Grade</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50">
                          {examResults.map(res => (
                             <tr key={res.id} className="hover:bg-slate-50/30 transition-colors">
                                <td className="px-8 py-4">
                                   <p className="text-[11px] font-bold text-slate-900 uppercase tracking-wide">{res.subject}</p>
                                </td>
                                <td className="px-8 py-4 text-center">
                                   <p className="text-[11px] font-bold text-slate-500">{res.total}</p>
                                </td>
                                <td className="px-8 py-4 text-center">
                                   <p className="text-[11px] font-black text-slate-900">{res.marks}</p>
                                </td>
                                <td className="px-8 py-4 text-right">
                                   <span className="inline-flex items-center px-2.5 py-0.5 rounded bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest border border-blue-100">
                                      {res.marks >= (res.total * 0.9) ? 'A1' : 
                                       res.marks >= (res.total * 0.8) ? 'A2' :
                                       res.marks >= (res.total * 0.7) ? 'B1' :
                                       res.marks >= (res.total * 0.6) ? 'B2' :
                                       res.marks >= (res.total * 0.5) ? 'C1' :
                                       res.marks >= (res.total * 0.4) ? 'C2' : 'D'}
                                   </span>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                       <tfoot className="bg-slate-900 text-white">
                          <tr>
                             <td className="px-8 py-4 font-black uppercase text-[9px] tracking-widest">Aggregate Score</td>
                             <td className="px-8 py-4 text-center text-[10px] font-bold opacity-60">{totalMax}</td>
                             <td className="px-8 py-4 text-center text-[14px] font-black">{totalObtained}</td>
                             <td className="px-8 py-4 text-right">
                                <span className="text-[14px] font-black tracking-tight">{percentage}%</span>
                             </td>
                          </tr>
                       </tfoot>
                    </table>
                 </div>
              </div>
            );
          }) : (
            <div className="py-20 text-center space-y-4">
               <div className="text-slate-200">
                  <Printer size={48} className="mx-auto opacity-20" />
               </div>
               <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest ">No academic data points recorded for this session.</p>
            </div>
          )}
        </div>

        {/* Signature & Footer Section */}
        <div className="p-12 bg-slate-50/50 flex justify-between items-end">
           <div className="space-y-4 text-left">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Attendance Registry</p>
              <div className="flex gap-4">
                 <div className="bg-white px-4 py-2 rounded-lgxl border border-slate-100 shadow-sm">
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Days Present</p>
                    <p className="text-xs font-bold text-slate-900">--- / 220</p>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-12 text-center">
              <div className="space-y-8">
                 <div className="h-1 bg-slate-200 w-32 mx-auto" />
                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Class Teacher</p>
              </div>
              <div className="space-y-8">
                 <div className="h-1 bg-slate-200 w-32 mx-auto" />
                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Principal</p>
              </div>
           </div>
        </div>

        <div className="p-6 text-center border-t border-slate-50">
           <p className="text-[8px] font-bold text-slate-300 uppercase tracking-[0.4em]  opacity-50">
              Institutional Scholastic Governance • Valid Record
           </p>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body { background: white !important; }
          .min-h-screen { background: white !important; padding: 0 !important; }
          .max-w-4xl { max-width: 100% !important; border: none !important; shadow: none !important; }
          .rounded-[40px] { border-radius: 0 !important; }
          .shadow-2xl { box-shadow: none !important; }
          @page { margin: 0.5cm; size: A4; }
        }
      `}</style>
    </div>
  );
}
