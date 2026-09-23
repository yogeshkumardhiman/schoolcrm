import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '@/lib/client';
import { SchoolInfo, SchoolSettings } from '../types/settings.types';

export const settingsKeys = {
  all: ['settings'] as const,
  info: () => [...settingsKeys.all, 'info'] as const,
  config: () => [...settingsKeys.all, 'config'] as const,
};

export function useSchoolInfoQuery() {
  return useQuery({
    queryKey: settingsKeys.info(),
    queryFn: async (): Promise<SchoolInfo> => client.get('/settings/school-info'),
  });
}

export function useSchoolSettingsQuery() {
  return useQuery({
    queryKey: settingsKeys.config(),
    queryFn: async (): Promise<SchoolSettings> => client.get('/settings/config'),
  });
}

export function useSaveSchoolInfoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<SchoolInfo>): Promise<SchoolInfo> => {
      return client.post('/settings/school-info', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.info() });
    },
  });
}

export function useSaveSchoolSettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<SchoolSettings>): Promise<SchoolSettings> => {
      return client.put('/settings/config', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.config() });
    },
  });
}
