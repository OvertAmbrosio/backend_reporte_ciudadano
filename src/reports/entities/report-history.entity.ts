import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Report } from './report.entity';
import { User } from '../../users/entities/user.entity';
import { ReportStatus } from '../../common/enums';

@Entity('report_history')
export class ReportHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Report, (report) => report.history, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'report_id' })
  report: Report;

  @Column()
  report_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'admin_id' })
  admin: User | null;

  @Column({ nullable: true })
  admin_id: number | null;

  @Column({ type: 'enum', enum: ReportStatus, nullable: true })
  previous_status: ReportStatus | null;

  @Column({ type: 'enum', enum: ReportStatus, nullable: true })
  new_status: ReportStatus | null;

  @Column({ type: 'text', nullable: true })
  comment: string | null;

  @CreateDateColumn()
  created_at: Date;
}
