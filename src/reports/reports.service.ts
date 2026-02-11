import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './entities/report.entity';
import { GeocodingService } from '../common/services/geocoding.service';
import { CreateReportDto } from './dto/create-report.dto';
import { User } from '../users/entities/user.entity';
import { ReportImage } from './entities/report-image.entity';
import { ReportHistory } from './entities/report-history.entity';
import { ReportStatus } from '../common/enums';
import { UpdateReportStatusDto } from './dto/update-report-status.dto';
import { GetReportsFilterDto } from './dto/get-reports-filter.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(ReportImage)
    private readonly reportImageRepository: Repository<ReportImage>,
    @InjectRepository(ReportHistory) // Inject History Repo
    private readonly reportHistoryRepository: Repository<ReportHistory>,
    private readonly geocodingService: GeocodingService,
  ) { }

  async create(createReportDto: CreateReportDto, user: User) {
    // 0. Validate max active reports (PENDING or VALIDATED)
    const activeReports = await this.reportRepository.count({
      where: [
        { user: { id: user.id }, status: ReportStatus.PENDING },
        { user: { id: user.id }, status: ReportStatus.VALIDATED },
      ],
    });

    if (activeReports >= 2) {
      throw new BadRequestException('Has alcanzado el límite de 2 reportes activos (Pendiente o Validado).');
    }

    // 1. Get location data
    const locationData = await this.geocodingService.getAddress(
      createReportDto.latitude,
      createReportDto.longitude,
    );

    // 2. Create Report Entity
    const report = this.reportRepository.create({
      ...createReportDto,
      user,
      status: ReportStatus.PENDING, // Default status
      country: locationData.country,
      department: locationData.department,
      district: locationData.district,
      address: createReportDto.address || locationData.full_address,
    });

    const savedReport = await this.reportRepository.save(report);

    // 3. Save Image
    if (createReportDto.imageBase64) {
      const image = this.reportImageRepository.create({
        report: savedReport,
        image_url: createReportDto.imageBase64,
      });
      await this.reportImageRepository.save(image);
    }

    // 4. Log to History (Initial PENDING state)
    await this.logHistory(savedReport, null, ReportStatus.PENDING, 'Reporte creado');

    return savedReport;
  }

  async updateStatus(id: number, updateStatusDto: UpdateReportStatusDto, adminUser: User) {
    const report = await this.findOne(id);
    if (!report) throw new NotFoundException('Report not found');

    const previousStatus = report.status;

    // Update Report
    report.status = updateStatusDto.status;
    await this.reportRepository.save(report);

    // Log History
    await this.logHistory(
      report,
      previousStatus,
      updateStatusDto.status,
      updateStatusDto.comment,
      adminUser
    );

    return report;
  }

  async addComment(id: number, comment: string, adminUser: User) {
    const report = await this.findOne(id);
    if (!report) throw new NotFoundException('Report not found');

    // Log History (No status change)
    await this.logHistory(report, report.status, report.status, comment, adminUser);

    return { message: 'Comentario agregado' };
  }

  async findByUser(userId: number) {
    return this.reportRepository.find({
      where: { user: { id: userId } },
      relations: ['images'],
      order: { created_at: 'DESC' },
    });
  }

  async findAll(filterDto?: GetReportsFilterDto) {
    const query = this.reportRepository.createQueryBuilder('report')
      .leftJoinAndSelect('report.user', 'user')
      .leftJoinAndSelect('report.images', 'images')
      .orderBy('report.created_at', 'DESC');

    if (filterDto) {
      const { status, userId } = filterDto;
      if (status) {
        query.andWhere('report.status = :status', { status });
      }
      if (userId) {
        query.andWhere('user.id = :userId', { userId });
      }
    }

    return query.getMany();
  }

  findOne(id: number) {
    return this.reportRepository.findOne({
      where: { id },
      relations: ['user', 'images', 'history', 'history.admin'], // Include history
    });
  }

  private async logHistory(
    report: Report,
    prevStatus: ReportStatus | null,
    newStatus: ReportStatus | null,
    comment?: string,
    admin?: User
  ) {
    const history = this.reportHistoryRepository.create({
      report,
      previous_status: prevStatus,
      new_status: newStatus,
      comment,
      admin,
    });
    return this.reportHistoryRepository.save(history);
  }
}
