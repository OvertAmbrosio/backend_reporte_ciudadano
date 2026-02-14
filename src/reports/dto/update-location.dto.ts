import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateLocationDto {
  @IsString()
  @IsNotEmpty()
  district: string;

  @IsString()
  @IsNotEmpty()
  department: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsOptional()
  address?: string;
}
