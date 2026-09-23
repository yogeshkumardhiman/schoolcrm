import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateStaffLeaveDto {
  @IsOptional()
  @IsNumber()
  staffId?: number;

  @IsString()
  startDate: string;

  @IsString()
  endDate: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  type?: string;
}

export class UpdateStaffLeaveStatusDto {
  @IsString()
  status: string; // APPROVED, REJECTED, PENDING
}
