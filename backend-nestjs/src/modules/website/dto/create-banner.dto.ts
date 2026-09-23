import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateBannerDto {
  @IsString()
  image_url: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  body?: string;

  @IsString()
  @IsOptional()
  action_route?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsNumber()
  @IsOptional()
  display_order?: number;
}
