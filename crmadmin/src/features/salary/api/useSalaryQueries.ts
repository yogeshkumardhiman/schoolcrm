import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '@/lib/client';
import { SalaryStructure, SalaryPayment, PaySalaryPayload } from '../types/salary.types';

export const salaryKeys = {
  all: ['salary'] as const,
  structures: () => [...salaryKeys.all, 'structures'] as const,
  structure: (staffId: number) => [...salaryKeys.all, 'structure', staffId] as const,
  payments: (staffId: number) => [...salaryKeys.all, 'payments', staffId] as const,
};

export function useSalaryStructuresQuery() {
  return useQuery({
    queryKey: salaryKeys.structures(),
    queryFn: async (): Promise<SalaryStructure[]> => client.get('/salary/structures'),
  });
}

export function useStaffSalaryStructureQuery(staffId: number) {
  return useQuery({
    queryKey: salaryKeys.structure(staffId),
    queryFn: async (): Promise<SalaryStructure> => client.get(`/salary/structure/${staffId}`),
    enabled: Boolean(staffId),
  });
}

export function useSalaryPaymentsQuery(staffId: number) {
  return useQuery({
    queryKey: salaryKeys.payments(staffId),
    queryFn: async (): Promise<SalaryPayment[]> => client.get(`/salary/payments/${staffId}`),
    enabled: Boolean(staffId),
  });
}

export function useSaveSalaryStructureMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<SalaryStructure>): Promise<SalaryStructure> => {
      return client.post('/salary/structure', payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: salaryKeys.structures() });
      if (variables.staffId) {
        queryClient.invalidateQueries({ queryKey: salaryKeys.structure(variables.staffId) });
      }
    },
  });
}

export function usePaySalaryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: PaySalaryPayload): Promise<SalaryPayment> => {
      return client.post('/salary/pay', payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: salaryKeys.payments(variables.staffId) });
    },
  });
}
