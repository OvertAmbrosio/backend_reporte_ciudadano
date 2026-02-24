import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Report } from './report.entity';

@Entity('report_images')
export class ReportImage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Report, (report) => report.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'report_id' })
  report: Report;

  @Column()
  report_id: number;

  @Column({ type: 'longtext', comment: 'Base64 or URL' })
  image_url: string;

  @CreateDateColumn()
  created_at: Date;
}
