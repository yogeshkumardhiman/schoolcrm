import { IsNumber, IsString, IsOptional } from 'class-validator';

export class SubmitHomeworkDto {
  @IsNumber()
  homeworkId: number;

  @IsNumber()
  studentId: number;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  attachmentUrl?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  feedback?: string;

  @IsOptional()
  @IsString()
  grade?: string;
}
