import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from './entities/report.entity';
import { ReportImage } from './entities/report-image.entity';
import { ReportHistory } from './entities/report-history.entity';
import { GeocodingService } from '../common/services/geocoding.service';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Report, ReportImage, ReportHistory]),
    CategoriesModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService, GeocodingService],
  exports: [ReportsService],
})
export class ReportsModule { }
