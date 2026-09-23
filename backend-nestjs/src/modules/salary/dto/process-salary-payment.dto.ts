import { IsNumber, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class ProcessSalaryPaymentDto {
  @Type(() => Number)
  @IsNumber()
  staffId: number;

  @Type(() => Number)
  @IsNumber()
  amount: number;

  @IsString()
  month: string;

  @Type(() => Number)
  @IsNumber()
  year: number;

  @IsOptional()
  @IsString()
  paymentDate?: string;

  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsOptional()
  @IsString()
  remark?: string;
}
