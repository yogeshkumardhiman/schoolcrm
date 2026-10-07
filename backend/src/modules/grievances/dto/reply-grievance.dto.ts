import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { GrievanceStatus } from '../entities/grievance.entity';

export class ReplyGrievanceDto {
  @IsString()
  @IsNotEmpty()
  teacherReply: string;

  @IsOptional()
  @IsString()
  responderName?: string;

  @IsOptional()
  @IsEnum(GrievanceStatus)
  status?: GrievanceStatus;
}
