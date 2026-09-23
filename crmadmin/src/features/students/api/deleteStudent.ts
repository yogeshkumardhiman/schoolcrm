import { useMutation, useQueryClient } from '@tanstack/react-query';
import client from '@/lib/client';
import { studentKeys } from './getStudents';

export async function deleteStudent(id: number | string): Promise<{ success: boolean }> {
  return client.delete(`/students/${id}`);
}

export function useDeleteStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
    },
  });
}
