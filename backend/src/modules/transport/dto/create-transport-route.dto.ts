import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateTransportRouteDto {
  @IsString()
  routeName: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  monthlyFee?: number;

  @IsOptional()
  @IsString()
  busNumber?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
