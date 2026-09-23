import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '@/lib/client';
import { TransportRoute, TransportStop } from '../types/transport.types';

export const transportKeys = {
  all: ['transport'] as const,
  routes: () => [...transportKeys.all, 'routes'] as const,
  stops: () => [...transportKeys.all, 'stops'] as const,
};

export function useTransportRoutesQuery() {
  return useQuery({
    queryKey: transportKeys.routes(),
    queryFn: async (): Promise<TransportRoute[]> => client.get('/transport/routes'),
  });
}

export function useCreateTransportRouteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<TransportRoute>): Promise<TransportRoute> => {
      return client.post('/transport/routes', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transportKeys.routes() });
    },
  });
}

export function useCreateTransportStopMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<TransportStop>): Promise<TransportStop> => {
      return client.post('/transport/stops', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transportKeys.routes() });
    },
  });
}

export function useDeleteTransportRouteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<{ success: boolean }> => {
      return client.delete(`/transport/routes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transportKeys.routes() });
    },
  });
}
