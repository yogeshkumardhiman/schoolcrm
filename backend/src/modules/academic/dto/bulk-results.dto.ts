import { IsString, IsNotEmpty, IsArray, IsOptional } from 'class-validator';

export class BulkResultItemDto {
  studentId: number;
  studentName?: string;
  admissionNo?: string;
  marksObtained: number;
  totalMarks?: number;
  grade?: string;
  remarks?: string;
}

export class AddBulkResultsDto {
  @IsString()
  @IsNotEmpty()
  class: string;

  @IsString()
  @IsNotEmpty()
  section: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsOptional()
  @IsString()
  examId?: string;

  @IsOptional()
  @IsString()
  academicYear?: string;

  @IsArray()
  @IsNotEmpty()
  results: BulkResultItemDto[];
}
