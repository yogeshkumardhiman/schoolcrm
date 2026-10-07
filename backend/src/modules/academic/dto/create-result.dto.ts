import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateResultDto {
  @IsNumber()
  studentId: number;

  @IsString()
  subject: string;

  @IsNumber()
  marks: number;

  @IsOptional()
  @IsNumber()
  total?: number;

  @IsOptional()
  @IsString()
  examType?: string;

  @IsOptional()
  @IsString()
  class?: string;

  @IsOptional()
  @IsString()
  section?: string;
}
