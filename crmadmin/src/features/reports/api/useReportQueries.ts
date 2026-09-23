import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '@/lib/client';
import { DashboardSummary, ComplianceDoc, ActivityLog } from '../types/report.types';

export const reportKeys = {
  all: ['reports'] as const,
  summary: (session?: string) => [...reportKeys.all, 'summary', session] as const,
  compliance: () => [...reportKeys.all, 'compliance'] as const,
  logs: (limit?: number) => [...reportKeys.all, 'logs', limit] as const,
};

export function useDashboardSummaryQuery(session?: string) {
  return useQuery({
    queryKey: reportKeys.summary(session),
    queryFn: async (): Promise<DashboardSummary> => {
      const endpoint = session ? `/reports/dashboard-summary?session=${encodeURIComponent(session)}` : '/reports/dashboard-summary';
      return client.get(endpoint);
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useComplianceDocsQuery() {
  return useQuery({
    queryKey: reportKeys.compliance(),
    queryFn: async (): Promise<ComplianceDoc[]> => {
      return client.get('/reports/compliance');
    },
  });
}

export function useActivityLogsQuery(limit = 100) {
  return useQuery({
    queryKey: reportKeys.logs(limit),
    queryFn: async (): Promise<ActivityLog[]> => {
      return client.get(`/reports/logs?limit=${limit}`);
    },
  });
}

export function useCreateComplianceDocMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { title: string; category?: string; url: string }): Promise<ComplianceDoc> => {
      return client.post('/reports/compliance', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportKeys.compliance() });
    },
  });
}

export function useDeleteComplianceDocMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<{ success: boolean }> => {
      return client.delete(`/reports/compliance/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportKeys.compliance() });
    },
  });
}
