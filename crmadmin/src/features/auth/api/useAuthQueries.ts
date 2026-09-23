import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '@/lib/client';
import { APP_CONFIG } from '@/constants/config';
import { AuthUser, LoginPayload, LoginResponse } from '../types/auth.types';

export const authKeys = {
  all: ['auth'] as const,
  profile: () => [...authKeys.all, 'profile'] as const,
};

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: LoginPayload): Promise<LoginResponse> => {
      return client.post('/auth/login', payload);
    },
    onSuccess: (data) => {
      const { tokens } = APP_CONFIG.auth;
      const userRole = data.role || data.user?.role || 'SUPER_ADMIN';
      const userInfo = data.user || {};

      localStorage.setItem(tokens.auth, data.token);
      localStorage.setItem(tokens.role, String(userRole).toUpperCase());
      localStorage.setItem(tokens.id, String(userInfo.id || userInfo.userId || ''));
      localStorage.setItem(tokens.data, JSON.stringify(userInfo));
      localStorage.setItem(tokens.permissions, JSON.stringify(userInfo.permissions || []));

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('crm_auth_update'));
      }

      queryClient.setQueryData(authKeys.profile(), userInfo);
    },
  });
}

export function useProfileQuery() {
  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: async (): Promise<AuthUser> => {
      return client.get('/auth/profile');
    },
    staleTime: 1000 * 60 * 5,
  });
}
