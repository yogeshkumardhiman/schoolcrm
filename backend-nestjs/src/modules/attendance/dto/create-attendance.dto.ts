import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateAttendanceDto {
  @IsNumber()
  studentId: number;

  @IsOptional()
  @IsString()
  class?: string;

  @IsOptional()
  @IsString()
  section?: string;

  @IsString()
  date: string;

  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  session?: string;

  @IsOptional()
  @IsString()
  departureTime?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}
