import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateFeeHeadDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  frequency?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsBoolean()
  collectOnAdmission?: boolean;

  @IsOptional()
  @IsBoolean()
  isOptional?: boolean;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  applicableMonths?: any;
}
