import { IsNumber, IsString, IsOptional } from 'class-validator';

export class RecordFeePaymentDto {
  @IsNumber()
  studentId: number;

  @IsNumber()
  amountPaid: number;

  @IsString()
  month: string;

  @IsOptional()
  @IsString()
  mode?: string;

  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsOptional()
  @IsString()
  remark?: string;
}
