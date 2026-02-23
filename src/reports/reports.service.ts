import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './entities/report.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { User } from '../users/entities/user.entity';
import { ReportImage } from './entities/report-image.entity';
import { ReportHistory } from './entities/report-history.entity';
import { ReportStatus } from '../common/enums';
import { UpdateReportStatusDto } from './dto/update-report-status.dto';
import { GetReportsFilterDto } from './dto/get-reports-filter.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { CategoriesService } from '../categories/categories.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ReportCreatedEvent } from './events/report-created.event';


@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(ReportImage)
    private readonly reportImageRepository: Repository<ReportImage>,
    @InjectRepository(ReportHistory) // Inject History Repo
    private readonly reportHistoryRepository: Repository<ReportHistory>,
    private readonly eventEmitter: EventEmitter2,
    private readonly categoriesService: CategoriesService,
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

    // Validate Category
    const category = await this.categoriesService.findOne(createReportDto.categoryId);

    // 2. Create Report Entity
    const report = this.reportRepository.create({
      ...createReportDto,
      user,
      category,
      status: ReportStatus.PENDING, // Default status
      reference: createReportDto.reference,
      address: createReportDto.address || "Procesando ubicacion...",
    });

    const savedReport = await this.reportRepository.save(report);

    // Emit event
    this.eventEmitter.emit('report.created', new ReportCreatedEvent(savedReport));

    // 3. Save Images (Multiple)
    if (createReportDto.imagesBase64 && createReportDto.imagesBase64.length > 0) {
      const images = createReportDto.imagesBase64.map(base64 =>
        this.reportImageRepository.create({
          report: savedReport,
          image_url: base64,
        })
      );
      await this.reportImageRepository.save(images);
    }

    // 4. Log to History (Initial PENDING state)
    await this.logHistory(savedReport, null, ReportStatus.PENDING, 'Reporte creado', user);

    return savedReport;
  }

  async updateLocation(id: number, locationData: UpdateLocationDto) {
    const report = await this.findOne(id);
    if (!report) return;

    report.district = locationData.district;
    report.department = locationData.department;
    report.country = locationData.country;
    if (locationData.address) {
      report.address = locationData.address;
    }

    return this.reportRepository.save(report);
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

  async addSystemLog(id: number, comment: string) {
    const report = await this.findOne(id);
    if (!report) return;
    await this.logHistory(report, report.status, report.status, comment);
  }

  async findByUser(userId: number) {
    return this.reportRepository.find({
      where: { user: { id: userId } },
      relations: ['images', 'category'],
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

  async findNearby(latitude: number, longitude: number, radius: number = 10) {
    const statuses = [ReportStatus.PENDING, ReportStatus.VALIDATED, ReportStatus.IN_PROCESS];

    const nearbyIds: { id: number }[] = await this.reportRepository.query(
      `SELECT r.id,
        (
          6371 * ACOS(
            COS(RADIANS(?)) *
            COS(RADIANS(r.latitude)) *
            COS(RADIANS(r.longitude) - RADIANS(?)) +
            SIN(RADIANS(?)) *
            SIN(RADIANS(r.latitude))
          )
        ) AS distance
      FROM reports r
      WHERE r.status IN (${statuses.map(() => '?').join(',')})
      HAVING distance <= ?
      ORDER BY distance ASC`,
      [latitude, longitude, latitude, ...statuses, radius],
    );

    if (nearbyIds.length === 0) return [];

    const ids = nearbyIds.map(r => r.id);
    return this.reportRepository
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.user', 'user')
      .leftJoinAndSelect('report.category', 'category')
      .leftJoinAndSelect('report.images', 'images')
      .whereInIds(ids)
      .getMany();
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
