import { IsString, IsOptional } from 'class-validator';

export class CreateGalleryDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  url?: string;

  @IsString()
  @IsOptional()
  category?: string;
}
