import { IsString, IsOptional, IsNumber } from 'class-validator';

export class UpdateClassSectionDto {
  @IsOptional()
  @IsString()
  class?: string;

  @IsOptional()
  @IsString()
  section?: string;

  @IsOptional()
  @IsNumber()
  classTeacherId?: number;

  @IsOptional()
  @IsString()
  session?: string;

  @IsOptional()
  @IsNumber()
  capacity?: number;

  @IsOptional()
  @IsString()
  roomNo?: string;
}
