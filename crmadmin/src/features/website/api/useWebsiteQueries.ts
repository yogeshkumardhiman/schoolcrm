import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '@/lib/client';
import { WebBanner, AppBanner, Notice, EventItem, GalleryItem, Topper, Testimonial } from '../types/website.types';

export const websiteKeys = {
  all: ['website'] as const,
  webBanners: () => [...websiteKeys.all, 'webBanners'] as const,
  appBanners: () => [...websiteKeys.all, 'appBanners'] as const,
  notices: () => [...websiteKeys.all, 'notices'] as const,
  events: () => [...websiteKeys.all, 'events'] as const,
  gallery: () => [...websiteKeys.all, 'gallery'] as const,
  toppers: () => [...websiteKeys.all, 'toppers'] as const,
  testimonials: () => [...websiteKeys.all, 'testimonials'] as const,
};

export function useWebBannersQuery() {
  return useQuery({
    queryKey: websiteKeys.webBanners(),
    queryFn: async (): Promise<WebBanner[]> => client.get('/website/web-banners'),
  });
}

export function useAppBannersQuery() {
  return useQuery({
    queryKey: websiteKeys.appBanners(),
    queryFn: async (): Promise<AppBanner[]> => client.get('/website/app-banners'),
  });
}

export function useNoticesQuery() {
  return useQuery({
    queryKey: websiteKeys.notices(),
    queryFn: async (): Promise<Notice[]> => client.get('/website/notices'),
  });
}

export function useEventsQuery() {
  return useQuery({
    queryKey: websiteKeys.events(),
    queryFn: async (): Promise<EventItem[]> => client.get('/website/events'),
  });
}

export function useGalleryQuery() {
  return useQuery({
    queryKey: websiteKeys.gallery(),
    queryFn: async (): Promise<GalleryItem[]> => client.get('/website/gallery'),
  });
}

export function useToppersQuery() {
  return useQuery({
    queryKey: websiteKeys.toppers(),
    queryFn: async (): Promise<Topper[]> => client.get('/website/toppers'),
  });
}

export function useTestimonialsQuery() {
  return useQuery({
    queryKey: websiteKeys.testimonials(),
    queryFn: async (): Promise<Testimonial[]> => client.get('/website/testimonials'),
  });
}
