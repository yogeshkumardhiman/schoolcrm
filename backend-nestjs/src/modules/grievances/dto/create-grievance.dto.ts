import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateGrievanceDto {
  @IsOptional()
  @IsNumber()
  studentId?: number;

  @IsOptional()
  @IsString()
  admissionNo?: string;

  @IsOptional()
  @IsString()
  studentName?: string;

  @IsOptional()
  @IsString()
  class?: string;

  @IsOptional()
  @IsString()
  section?: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsString()
  category?: string;
}
