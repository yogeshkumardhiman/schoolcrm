import { useQuery } from '@tanstack/react-query';
import client from '@/lib/client';
import { Role } from '../types';

export const rbacKeys = {
  all: ['rbac'] as const,
  roles: () => [...rbacKeys.all, 'roles'] as const,
  permissions: () => [...rbacKeys.all, 'permissions'] as const,
};

export async function fetchRoles(): Promise<Role[]> {
  return client.get('/rbac/roles');
}

export function useRoles() {
  return useQuery({
    queryKey: rbacKeys.roles(),
    queryFn: fetchRoles,
  });
}
