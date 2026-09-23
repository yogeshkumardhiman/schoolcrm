import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '@/lib/client';
import { Role, Permission, CreateRolePayload, AssignPermissionsPayload } from '../types/rbac.types';

export const rbacKeys = {
  all: ['rbac'] as const,
  roles: () => [...rbacKeys.all, 'roles'] as const,
  permissions: () => [...rbacKeys.all, 'permissions'] as const,
};

export function useRolesQuery() {
  return useQuery({
    queryKey: rbacKeys.roles(),
    queryFn: async (): Promise<Role[]> => {
      return client.get('/rbac/roles');
    },
  });
}

export function usePermissionsQuery() {
  return useQuery({
    queryKey: rbacKeys.permissions(),
    queryFn: async (): Promise<Permission[]> => {
      return client.get('/rbac/permissions');
    },
  });
}

export function useCreateRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateRolePayload): Promise<Role> => {
      return client.post('/rbac/roles', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rbacKeys.roles() });
    },
  });
}

export function useAssignPermissionsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roleId, permissionCodes }: AssignPermissionsPayload): Promise<Role> => {
      return client.post(`/rbac/roles/${roleId}/permissions`, { permissionCodes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rbacKeys.roles() });
    },
  });
}
