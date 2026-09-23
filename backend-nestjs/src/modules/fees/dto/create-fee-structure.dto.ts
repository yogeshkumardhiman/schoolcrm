import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateFeeStructureDto {
  @IsString()
  class: string;

  @IsOptional()
  @IsNumber()
  tuitionFee?: number;

  @IsOptional()
  @IsNumber()
  transportFee?: number;

  @IsOptional()
  @IsNumber()
  annualFee?: number;

  @IsOptional()
  @IsNumber()
  examFee?: number;

  @IsOptional()
  @IsNumber()
  admissionFee?: number;

  @IsOptional()
  @IsNumber()
  annualMonth?: number;

  @IsOptional()
  @IsString()
  examMonths?: string;

  @IsOptional()
  components?: any[];
}
