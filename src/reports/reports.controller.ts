import { Controller, Get, Post, Body, Param, Request, Patch, UseGuards, ForbiddenException, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { GetNearbyReportsDto } from './dto/get-nearby-reports.dto';
import { UpdateReportStatusDto } from './dto/update-report-status.dto';
import { AddCommentDto } from './dto/add-comment.dto';
import { GetReportsFilterDto } from './dto/get-reports-filter.dto';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) { }

  @Get('nearby')
  findNearby(@Query() query: GetNearbyReportsDto) {
    return this.reportsService.findNearby(query.latitude, query.longitude, query.radius);
  }

  @Post()
  create(@Body() createReportDto: CreateReportDto, @Request() req: any) {
    return this.reportsService.create(createReportDto, req.user);
  }

  @Get('user')
  findByUser(@Request() req: any) {
    return this.reportsService.findByUser(req.user.userId);
  }

  @Get()
  findAll(@Query() filterDto: GetReportsFilterDto) {
    return this.reportsService.findAll(filterDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reportsService.findOne(+id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateReportStatusDto,
    @Request() req: any,
  ) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Solo los administradores pueden cambiar el estado del reporte');
    }
    return this.reportsService.updateStatus(+id, updateStatusDto, req.user);
  }

  @Post(':id/comment')
  addComment(
    @Param('id') id: string,
    @Body() addCommentDto: AddCommentDto,
    @Request() req: any,
  ) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Solo los administradores pueden agregar comentarios administrativos');
    }
    return this.reportsService.addComment(+id, addCommentDto.comment, req.user);
  }
}
