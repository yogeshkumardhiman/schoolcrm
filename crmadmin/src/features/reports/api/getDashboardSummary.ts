import { useQuery } from '@tanstack/react-query';
import client from '@/lib/client';
import { DashboardSummary } from '../types';

export const reportKeys = {
  all: ['reports'] as const,
  summary: (session?: string) => [...reportKeys.all, 'summary', session] as const,
  compliance: () => [...reportKeys.all, 'compliance'] as const,
};

export async function fetchDashboardSummary(session?: string): Promise<DashboardSummary> {
  const endpoint = session ? `/reports/dashboard-summary?session=${encodeURIComponent(session)}` : '/reports/dashboard-summary';
  return client.get(endpoint);
}

export function useDashboardSummary(session?: string) {
  return useQuery({
    queryKey: reportKeys.summary(session),
    queryFn: () => fetchDashboardSummary(session),
    staleTime: 1000 * 60 * 2,
  });
}
