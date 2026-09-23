import { useMutation, useQueryClient } from '@tanstack/react-query';
import client from '@/lib/client';
import { APP_CONFIG } from '@/constants/config';
import { LoginPayload, LoginResponse } from '../types';

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  return client.post('/auth/login', payload);
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
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

      queryClient.setQueryData(['auth', 'profile'], userInfo);
    },
  });
}
