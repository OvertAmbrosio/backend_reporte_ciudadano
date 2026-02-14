import { IsNotEmpty, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetNearbyReportsDto {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @Min(-180)
  @Max(180)
  longitude: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0.1)
  @Max(30) // Max 100km radius safety
  radius: number = 10; // Default 10km
}
