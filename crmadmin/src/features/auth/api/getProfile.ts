import { useQuery } from '@tanstack/react-query';
import client from '@/lib/client';
import { AuthUser } from '../types';

export async function fetchProfile(): Promise<AuthUser> {
  return client.get('/auth/profile');
}

export function useProfile() {
  return useQuery({
    queryKey: ['auth', 'profile'],
    queryFn: fetchProfile,
    staleTime: 1000 * 60 * 5,
  });
}
