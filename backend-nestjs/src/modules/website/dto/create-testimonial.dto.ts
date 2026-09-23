import { IsString, IsOptional } from 'class-validator';

export class CreateTestimonialDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsString()
  @IsOptional()
  text?: string;

  @IsString()
  @IsOptional()
  image?: string;
}
