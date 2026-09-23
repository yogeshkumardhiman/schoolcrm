import { useMutation, useQueryClient } from '@tanstack/react-query';
import client from '@/lib/client';
import { Notice } from '../types';
import { websiteKeys } from './getNotices';

export async function createNotice(payload: Partial<Notice>): Promise<Notice> {
  return client.post('/website/notices', payload);
}

export function useCreateNotice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createNotice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: websiteKeys.notices() });
    },
  });
}
