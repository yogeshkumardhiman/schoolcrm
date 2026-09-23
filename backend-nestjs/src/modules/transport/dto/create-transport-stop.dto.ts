import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateTransportStopDto {
  @IsNumber()
  routeId: number;

  @IsString()
  stopName: string;

  @IsOptional()
  @IsNumber()
  fee?: number;
}
