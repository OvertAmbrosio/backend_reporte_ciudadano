import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from './entities/report.entity';
import { ReportImage } from './entities/report-image.entity';
import { ReportHistory } from './entities/report-history.entity';
import { GeocodingService } from '../common/services/geocoding.service';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { CategoriesModule } from '../categories/categories.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ReportCreatedListener } from './listeners/report-created.listener';

@Module({
  imports: [
    TypeOrmModule.forFeature([Report, ReportImage, ReportHistory]),
    EventEmitterModule.forRoot(),
    CategoriesModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService, GeocodingService, ReportCreatedListener],
  exports: [ReportsService],
})
export class ReportsModule { }
