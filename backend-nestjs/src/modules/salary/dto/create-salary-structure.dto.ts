import { IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSalaryStructureDto {
  @Type(() => Number)
  @IsNumber()
  staffId: number;

  @Type(() => Number)
  @IsNumber()
  baseSalary: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  allowances?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  deductions?: number;
}
