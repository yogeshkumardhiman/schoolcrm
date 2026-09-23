export interface Notice {
  id: number;
  title: string;
  content: string;
  tag?: string;
  color?: string;
  date?: string;
  session?: string;
  class?: string;
  section?: string;
  targetRole?: string;
}

export interface WebBanner {
  id: number;
  image_url?: string;
  title?: string;
  description?: string;
  body?: string;
  action_route?: string;
  status: string;
  display_order: number;
}

export interface AppBanner {
  id: number;
  image_url?: string;
  title?: string;
  description?: string;
  body?: string;
  action_route?: string;
  status: string;
  display_order: number;
}

export interface GalleryItem {
  id: number;
  title?: string;
  url: string;
  category?: string;
}

export interface Topper {
  id: number;
  name: string;
  class: string;
  percentage: string;
  session?: string;
  rank?: number;
  image?: string;
}
