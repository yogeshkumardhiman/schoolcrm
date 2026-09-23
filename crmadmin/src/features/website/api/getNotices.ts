import { useQuery } from '@tanstack/react-query';
import client from '@/lib/client';
import { Notice } from '../types';

export const websiteKeys = {
  all: ['website'] as const,
  notices: () => [...websiteKeys.all, 'notices'] as const,
  banners: () => [...websiteKeys.all, 'banners'] as const,
};

export async function fetchNotices(): Promise<Notice[]> {
  return client.get('/website/notices');
}

export function useNotices() {
  return useQuery({
    queryKey: websiteKeys.notices(),
    queryFn: fetchNotices,
  });
}
