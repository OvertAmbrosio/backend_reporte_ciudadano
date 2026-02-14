import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ReportCreatedEvent } from '../events/report-created.event';
import { GeocodingService } from '../../common/services/geocoding.service';
import { ReportsService } from '../reports.service';
import { UpdateLocationDto } from '../dto/update-location.dto';

@Injectable()
export class ReportCreatedListener {
  constructor(
    private geocodingService: GeocodingService,
    private reportsService: ReportsService
  ) { }
  @OnEvent('report.created', { async: true }) // <--- async: true es clave
  async handleReportCreatedEvent(event: ReportCreatedEvent) {
    try {
      // 1. Llamada lenta a la API
      const location = await this.geocodingService.getAddress(event.latitude, event.longitude);
      const report = await this.reportsService.findOne(event.reportId);

      // 2. Actualizar el reporte existente
      const updateLocationDto: UpdateLocationDto = {
        district: location.district,
        department: location.department,
        country: location.country,
        ...(report?.address && {
          address: location.full_address
        })
      };

      await this.reportsService.updateLocation(
        event.reportId,
        updateLocationDto
      );

      // 3. Log Success
      await this.reportsService.addSystemLog(
        event.reportId,
        `Ubicación actualizada automáticamente: ${location.district}, ${location.department}`
      );

    } catch (error) {
      console.error(`Error obteniendo ubicación para reporte #${event.reportId}:`, error);

      // 4. Log Failure
      await this.reportsService.addSystemLog(
        event.reportId,
        `Error al obtener ubicación automática: ${error.message || 'Servicio no disponible'}`
      );
    }
  }
}