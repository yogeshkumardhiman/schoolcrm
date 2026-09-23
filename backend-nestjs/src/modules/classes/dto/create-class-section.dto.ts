import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateClassSectionDto {
  @IsString()
  @IsNotEmpty()
  class: string;

  @IsString()
  @IsNotEmpty()
  section: string;

  @IsOptional()
  @IsNumber()
  classTeacherId?: number;

  @IsOptional()
  @IsString()
  session?: string;

  @IsOptional()
  @IsNumber()
  capacity?: number;

  @IsOptional()
  @IsString()
  roomNo?: string;
}
