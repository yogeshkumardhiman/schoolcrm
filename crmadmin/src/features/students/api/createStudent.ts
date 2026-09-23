import { useMutation, useQueryClient } from '@tanstack/react-query';
import client from '@/lib/client';
import { Student } from '../types';
import { studentKeys } from './getStudents';

export async function createStudent(data: Partial<Student>): Promise<Student> {
  return client.post('/students', data);
}

export function useCreateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
    },
  });
}
