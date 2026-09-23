export interface SchoolInfo {
  id?: number;
  schoolName?: string;
  aboutTitle?: string;
  aboutDescription?: string;
  mission?: string;
  vision?: string;
  principalMessage?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  maxClass?: string;
  logoImage?: string;
  bannerImage?: string;
  domainPrefix?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export interface SchoolSettings {
  id?: number;
  school_name?: string;
  app_title?: string;
  primary_color?: string;
  secondary_color?: string;
  logo_url?: string;
  active_features?: string[];
  maintenance_mode?: boolean;
}
