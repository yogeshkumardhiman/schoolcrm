import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '@/lib/client';
import { Homework, HomeworkSubmission, Result } from '../types/academic.types';

export const academicKeys = {
  all: ['academic'] as const,
  homework: () => [...academicKeys.all, 'homework'] as const,
  results: (studentId?: number) => [...academicKeys.all, 'results', studentId] as const,
};

export function useHomeworkQuery() {
  return useQuery({
    queryKey: academicKeys.homework(),
    queryFn: async (): Promise<Homework[]> => client.get('/academic/homework'),
  });
}

export function useResultsQuery(studentId?: number) {
  return useQuery({
    queryKey: academicKeys.results(studentId),
    queryFn: async (): Promise<Result[]> => {
      const endpoint = studentId ? `/academic/results/student/${studentId}` : '/academic/results';
      return client.get(endpoint);
    },
  });
}

export function useCreateHomeworkMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<Homework>): Promise<Homework> => {
      return client.post('/academic/homework', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicKeys.homework() });
    },
  });
}

export function useSubmitHomeworkMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<HomeworkSubmission>): Promise<HomeworkSubmission> => {
      return client.post('/academic/homework/submit', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicKeys.homework() });
    },
  });
}

export function useSaveResultMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<Result>): Promise<Result> => {
      return client.post('/academic/results', payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: academicKeys.results(variables.studentId) });
    },
  });
}
