import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateTopperDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  class?: string;

  @IsString()
  @IsOptional()
  percentage?: string;

  @IsString()
  @IsOptional()
  session?: string;

  @IsNumber()
  @IsOptional()
  rank?: number;

  @IsString()
  @IsOptional()
  image?: string;
}
