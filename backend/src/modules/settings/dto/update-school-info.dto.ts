import { IsString, IsOptional } from 'class-validator';

export class UpdateSchoolInfoDto {
  @IsString()
  @IsOptional()
  aboutTitle?: string;

  @IsString()
  @IsOptional()
  aboutDescription?: string;

  @IsString()
  @IsOptional()
  mission?: string;

  @IsString()
  @IsOptional()
  vision?: string;

  @IsString()
  @IsOptional()
  principalMessage?: string;

  @IsString()
  @IsOptional()
  contactEmail?: string;

  @IsString()
  @IsOptional()
  contactPhone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  minClass?: string;

  @IsString()
  @IsOptional()
  maxClass?: string;

  @IsString()
  @IsOptional()
  schoolName?: string;

  @IsString()
  @IsOptional()
  logoImage?: string;

  @IsString()
  @IsOptional()
  domainPrefix?: string;

  @IsString()
  @IsOptional()
  primaryColor?: string;

  @IsString()
  @IsOptional()
  secondaryColor?: string;

  @IsString()
  @IsOptional()
  bannerTitle?: string;

  @IsString()
  @IsOptional()
  bannerImage?: string;

  @IsString()
  @IsOptional()
  principalName?: string;

  @IsString()
  @IsOptional()
  principalImage?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsOptional()
  active_features?: any;

  @IsOptional()
  top_info_bar?: any;

  @IsOptional()
  theme_config?: any;

  @IsOptional()
  homepage_layout?: any;

  @IsOptional()
  statistics?: any;

  @IsOptional()
  why_choose_us?: any;

  @IsOptional()
  director_message?: any;

  @IsOptional()
  academics_config?: any;

  @IsOptional()
  campus_tour?: any;

  @IsOptional()
  admission_timeline?: any;

  @IsOptional()
  facilities_config?: any;

  @IsOptional()
  faqs_config?: any;

  @IsOptional()
  cta_config?: any;

  @IsOptional()
  footer_config?: any;

  @IsOptional()
  floating_buttons?: any;

  @IsOptional()
  navbar_config?: any;

  @IsOptional()
  careers_config?: any;

  @IsOptional()
  fee_structure_config?: any;

  @IsOptional()
  about_config?: any;
}
