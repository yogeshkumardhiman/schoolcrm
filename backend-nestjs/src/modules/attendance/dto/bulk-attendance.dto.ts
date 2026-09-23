import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SingleAttendanceRecord {
  studentId: number;
  status: string;
  departureTime?: string;
  remarks?: string;
}

export class BulkAttendanceDto {
  @IsString()
  class: string;

  @IsOptional()
  @IsString()
  section?: string;

  @IsString()
  date: string;

  @IsOptional()
  @IsString()
  session?: string;

  @IsArray()
  records: SingleAttendanceRecord[];
}
