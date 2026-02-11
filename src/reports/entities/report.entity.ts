import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ReportStatus } from '../../common/enums';
import { ReportImage } from './report-image.entity';
import { ReportHistory } from './report-history.entity';
import { Category } from '../../categories/entities/category.entity';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('decimal', { precision: 10, scale: 8 })
  latitude: number;

  @Column('decimal', { precision: 11, scale: 8 })
  longitude: number;

  @Column()
  address: string;

  @Column()
  reference: string;

  @Column({ nullable: true, length: 500 })
  description: string;

  @Column({
    type: 'enum',
    enum: ReportStatus,
    default: ReportStatus.PENDING,
  })
  status: ReportStatus;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: number;

  @ManyToOne(() => Category, (category) => category.reports)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column()
  category_id: number;

  // Location data derived by admin
  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  department: string;

  @Column({ nullable: true })
  district: string;

  @OneToMany(() => ReportImage, (image) => image.report)
  images: ReportImage[];

  @OneToMany(() => ReportHistory, (history) => history.report)
  history: ReportHistory[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
