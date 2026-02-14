import { Report } from "../entities/report.entity";

export class ReportCreatedEvent {
  public readonly reportId: number;
  public readonly latitude: number;
  public readonly longitude: number;

  constructor(report: Report) {
    this.reportId = report.id;
    this.latitude = report.latitude;
    this.longitude = report.longitude;
  }
}