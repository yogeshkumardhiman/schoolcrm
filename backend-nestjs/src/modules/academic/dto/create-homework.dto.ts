import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class CreateHomeworkDto {
  @IsString()
  title: string;

  @IsString()
  subject: string;

  @IsString()
  class: string;

  @IsOptional()
  @IsString()
  section?: string;

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsNumber()
  teacherId?: number;

  @IsOptional()
  @IsString()
  teacherName?: string;

  @IsOptional()
  @IsString()
  priority?: string;

  @IsOptional()
  @IsBoolean()
  isUrgent?: boolean;
}
