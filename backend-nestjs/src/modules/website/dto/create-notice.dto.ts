import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class CreateNoticeDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  tag?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  session?: string;

  @IsString()
  @IsOptional()
  class?: string;

  @IsString()
  @IsOptional()
  section?: string;

  @IsNumber()
  @IsOptional()
  studentId?: number;

  @IsString()
  @IsOptional()
  targetRole?: string;

  @IsString()
  @IsOptional()
  createdByRole?: string;

  @IsNumber()
  @IsOptional()
  createdById?: number;

  @IsBoolean()
  @IsOptional()
  isRead?: boolean;
}
