import { IsOptional, IsString } from 'class-validator';

export class AttendanceQueryDto {
  @IsOptional()
  @IsString()
  class?: string;

  @IsOptional()
  @IsString()
  section?: string;

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  month?: string;
}
