import { IsString, IsOptional, IsBoolean, IsArray, IsObject } from 'class-validator';

export class UpdateSchoolSettingsDto {
  @IsString()
  @IsOptional()
  school_name?: string;

  @IsString()
  @IsOptional()
  app_title?: string;

  @IsString()
  @IsOptional()
  primary_color?: string;

  @IsString()
  @IsOptional()
  secondary_color?: string;

  @IsString()
  @IsOptional()
  logo_url?: string;

  @IsArray()
  @IsOptional()
  active_features?: string[];

  @IsBoolean()
  @IsOptional()
  maintenance_mode?: boolean;

  @IsObject()
  @IsOptional()
  emergency_alert?: Record<string, any>;

  @IsBoolean()
  @IsOptional()
  enableOnlinePayments?: boolean;

  @IsString()
  @IsOptional()
  razorpayKeyId?: string;

  @IsString()
  @IsOptional()
  razorpayKeySecret?: string;

  @IsArray()
  @IsOptional()
  favorite_colors?: any[];

  @IsObject()
  @IsOptional()
  timings?: Record<string, any>;
}
