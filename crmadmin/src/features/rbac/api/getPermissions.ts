import { useQuery } from '@tanstack/react-query';
import client from '@/lib/client';
import { Permission } from '../types';
import { rbacKeys } from './getRoles';

export async function fetchPermissions(): Promise<Permission[]> {
  return client.get('/rbac/permissions');
}

export function usePermissions() {
  return useQuery({
    queryKey: rbacKeys.permissions(),
    queryFn: fetchPermissions,
  });
}
