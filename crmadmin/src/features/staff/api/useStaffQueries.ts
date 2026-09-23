import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '@/lib/client';
import { Staff, TimetableSlot, LeaveRequest } from '../types/staff.types';

export const staffKeys = {
  all: ['staff'] as const,
  list: () => [...staffKeys.all, 'list'] as const,
  detail: (id: number) => [...staffKeys.all, 'detail', id] as const,
  timetable: (staffId?: number) => [...staffKeys.all, 'timetable', staffId] as const,
  leaves: () => [...staffKeys.all, 'leaves'] as const,
};

export function useStaffListQuery() {
  return useQuery({
    queryKey: staffKeys.list(),
    queryFn: async (): Promise<Staff[]> => {
      return client.get('/staff');
    },
  });
}

export function useStaffDetailQuery(id: number) {
  return useQuery({
    queryKey: staffKeys.detail(id),
    queryFn: async (): Promise<Staff> => {
      return client.get(`/staff/${id}`);
    },
    enabled: Boolean(id),
  });
}

export function useCreateStaffMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Staff>): Promise<Staff> => {
      return client.post('/staff', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.all });
    },
  });
}

export function useUpdateStaffMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Staff> }): Promise<Staff> => {
      return client.put(`/staff/${id}`, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.all });
      queryClient.invalidateQueries({ queryKey: staffKeys.detail(variables.id) });
    },
  });
}

export function useDeleteStaffMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<{ success: boolean }> => {
      return client.delete(`/staff/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.all });
    },
  });
}

export function useStaffTimetableQuery(staffId?: number) {
  return useQuery({
    queryKey: staffKeys.timetable(staffId),
    queryFn: async (): Promise<TimetableSlot[]> => {
      const endpoint = staffId ? `/staff/timetable/${staffId}` : '/staff/timetable';
      return client.get(endpoint);
    },
  });
}

export function useStaffLeavesQuery() {
  return useQuery({
    queryKey: staffKeys.leaves(),
    queryFn: async (): Promise<LeaveRequest[]> => {
      return client.get('/staff/leaves');
    },
  });
}
