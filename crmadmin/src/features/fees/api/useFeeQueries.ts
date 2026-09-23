import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '@/lib/client';
import { FeeHead, FeeStructure, FeeDue, FeePayment, PayFeePayload } from '../types/fee.types';

export const feeKeys = {
  all: ['fees'] as const,
  heads: () => [...feeKeys.all, 'heads'] as const,
  structures: () => [...feeKeys.all, 'structures'] as const,
  dues: (studentId: number) => [...feeKeys.all, 'dues', studentId] as const,
  payments: (studentId: number) => [...feeKeys.all, 'payments', studentId] as const,
};

export function useFeeHeadsQuery() {
  return useQuery({
    queryKey: feeKeys.heads(),
    queryFn: async (): Promise<FeeHead[]> => {
      return client.get('/fees/heads');
    },
  });
}

export function useFeeStructuresQuery() {
  return useQuery({
    queryKey: feeKeys.structures(),
    queryFn: async (): Promise<FeeStructure[]> => {
      return client.get('/fees/structures');
    },
  });
}

export function useFeeDuesQuery(studentId: number) {
  return useQuery({
    queryKey: feeKeys.dues(studentId),
    queryFn: async (): Promise<FeeDue[]> => {
      return client.get(`/fees/dues/${studentId}`);
    },
    enabled: Boolean(studentId),
  });
}

export function useFeePaymentsQuery(studentId: number) {
  return useQuery({
    queryKey: feeKeys.payments(studentId),
    queryFn: async (): Promise<FeePayment[]> => {
      return client.get(`/fees/payments/${studentId}`);
    },
    enabled: Boolean(studentId),
  });
}

export function useCreateFeeHeadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<FeeHead>): Promise<FeeHead> => {
      return client.post('/fees/heads', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feeKeys.heads() });
    },
  });
}

export function useCreateFeeStructureMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<FeeStructure>): Promise<FeeStructure> => {
      return client.post('/fees/structures', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feeKeys.structures() });
    },
  });
}

export function usePayFeeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: PayFeePayload): Promise<FeePayment> => {
      return client.post('/fees/pay', payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: feeKeys.dues(variables.studentId) });
      queryClient.invalidateQueries({ queryKey: feeKeys.payments(variables.studentId) });
    },
  });
}
