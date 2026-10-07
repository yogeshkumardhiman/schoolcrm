import { IsString, IsOptional } from 'class-validator';

export class LoginDto {
  @IsOptional()
  @IsString()
  loginId?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  clientType?: string;
}

export class DeviceTokenDto {
  @IsString()
  deviceToken: string;
}
