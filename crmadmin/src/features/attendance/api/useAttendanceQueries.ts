import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '@/lib/client';
import { AttendanceRecord, MarkAttendancePayload, BulkMarkAttendancePayload } from '../types/attendance.types';

export const attendanceKeys = {
  all: ['attendance'] as const,
  class: (className: string, section: string, date: string) => [...attendanceKeys.all, 'class', className, section, date] as const,
  student: (studentId: number) => [...attendanceKeys.all, 'student', studentId] as const,
};

export function useClassAttendanceQuery(className: string, section: string, date: string) {
  return useQuery({
    queryKey: attendanceKeys.class(className, section, date),
    queryFn: async (): Promise<AttendanceRecord[]> => {
      return client.get(`/attendance/class?class=${encodeURIComponent(className)}&section=${encodeURIComponent(section)}&date=${encodeURIComponent(date)}`);
    },
    enabled: Boolean(className && section && date),
  });
}

export function useStudentAttendanceQuery(studentId: number) {
  return useQuery({
    queryKey: attendanceKeys.student(studentId),
    queryFn: async (): Promise<AttendanceRecord[]> => {
      return client.get(`/attendance/student/${studentId}`);
    },
    enabled: Boolean(studentId),
  });
}

export function useMarkAttendanceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: MarkAttendancePayload): Promise<AttendanceRecord> => {
      return client.post('/attendance/mark', payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.class(variables.class, variables.section, variables.date) });
    },
  });
}

export function useBulkMarkAttendanceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: BulkMarkAttendancePayload): Promise<{ success: boolean }> => {
      return client.post('/attendance/bulk-mark', payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.class(variables.class, variables.section, variables.date) });
    },
  });
}
