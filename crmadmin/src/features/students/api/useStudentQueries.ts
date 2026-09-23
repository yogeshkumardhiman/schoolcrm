import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '@/lib/client';
import { Student, StudentFilters, StudentsResponse } from '../types/student.types';

export const studentKeys = {
  all: ['students'] as const,
  list: (filters: StudentFilters) => [...studentKeys.all, 'list', filters] as const,
  detail: (id: number) => [...studentKeys.all, 'detail', id] as const,
};

export function useStudentsQuery(filters: StudentFilters = {}) {
  return useQuery({
    queryKey: studentKeys.list(filters),
    queryFn: async (): Promise<StudentsResponse> => {
      const params = new URLSearchParams();
      if (filters.page) params.append('page', String(filters.page));
      if (filters.limit) params.append('limit', String(filters.limit));
      if (filters.search) params.append('search', filters.search);
      if (filters.class && filters.class !== 'All Classes') params.append('class', filters.class);
      if (filters.section && filters.section !== 'All Sections') params.append('section', filters.section);

      const queryString = params.toString();
      const endpoint = `/students${queryString ? `?${queryString}` : ''}`;
      return client.get(endpoint);
    },
  });
}

export function useStudentDetailQuery(id: number) {
  return useQuery({
    queryKey: studentKeys.detail(id),
    queryFn: async (): Promise<Student> => {
      return client.get(`/students/${id}`);
    },
    enabled: Boolean(id),
  });
}

export function useCreateStudentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Student>): Promise<Student> => {
      return client.post('/students', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.all });
    },
  });
}

export function useUpdateStudentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Student> }): Promise<Student> => {
      return client.put(`/students/${id}`, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.all });
      queryClient.invalidateQueries({ queryKey: studentKeys.detail(variables.id) });
    },
  });
}

export function useDeleteStudentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<{ success: boolean }> => {
      return client.delete(`/students/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.all });
    },
  });
}
