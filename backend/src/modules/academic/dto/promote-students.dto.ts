import { IsString, IsNotEmpty, IsArray, IsOptional } from 'class-validator';

export class PromoteStudentsDto {
  @IsString()
  @IsNotEmpty()
  sourceClass: string;

  @IsString()
  @IsNotEmpty()
  targetClass: string;

  @IsArray()
  @IsNotEmpty()
  studentIds: number[];

  @IsString()
  @IsNotEmpty()
  newSession: string;

  @IsOptional()
  @IsString()
  targetSection?: string;
}
