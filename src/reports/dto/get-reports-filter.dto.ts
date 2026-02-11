import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ReportStatus } from '../../common/enums';

export class GetReportsFilterDto {
  @IsEnum(ReportStatus)
  @IsOptional()
  status?: ReportStatus;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  userId?: number;
}
