import { useQuery } from '@tanstack/react-query';
import client from '@/lib/client';
import { StudentFilters, StudentsResponse } from '../types';

export const studentKeys = {
  all: ['students'] as const,
  lists: () => [...studentKeys.all, 'list'] as const,
  list: (filters: StudentFilters) => [...studentKeys.lists(), filters] as const,
  details: () => [...studentKeys.all, 'detail'] as const,
  detail: (id: number) => [...studentKeys.details(), id] as const,
};

export async function fetchStudents(filters: StudentFilters = {}): Promise<StudentsResponse> {
  const params = new URLSearchParams();
  if (filters.page) params.append('page', String(filters.page));
  if (filters.limit) params.append('limit', String(filters.limit));
  if (filters.search) params.append('search', filters.search);
  if (filters.class && filters.class !== 'All Classes') params.append('class', filters.class);
  if (filters.section && filters.section !== 'All Sections') params.append('section', filters.section);

  const queryString = params.toString();
  return client.get(`/students${queryString ? `?${queryString}` : ''}`);
}

export function useStudents(filters: StudentFilters = {}) {
  return useQuery({
    queryKey: studentKeys.list(filters),
    queryFn: () => fetchStudents(filters),
  });
}
