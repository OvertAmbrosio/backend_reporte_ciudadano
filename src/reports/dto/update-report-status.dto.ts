import { IsEnum, IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ReportStatus } from '../../common/enums';

export class UpdateReportStatusDto {
  @IsEnum(ReportStatus)
  status: ReportStatus;

  @IsString()
  @IsOptional()
  comment?: string;
}
