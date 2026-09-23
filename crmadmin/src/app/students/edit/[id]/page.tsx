"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import StudentForm from '@/features/students/components/StudentForm';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/components/AbilityProvider';

export default function EditStudentPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === 'TEACHER') {
        router.push('/students');
      } else {
        setChecking(false);
      }
    }
  }, [user, authLoading, router]);

  if (checking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 ">
        <Loader2 className="animate-spin text-slate-400 mb-4" />
        <p className="text-[10px] font-bold uppercase tracking-[5px] text-slate-400">Verifying Authority Node...</p>
      </div>
    );
  }

  return <StudentForm />;
}
