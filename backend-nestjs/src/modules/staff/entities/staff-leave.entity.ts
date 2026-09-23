import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { StaffEntity } from './staff.entity';

@Entity('StaffLeaveRequests')
export class StaffLeaveRequestEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  staffId: number;

  @ManyToOne(() => StaffEntity, { eager: true, nullable: true })
  @JoinColumn({ name: 'staffId' })
  staff: StaffEntity;

  @Column({ nullable: true })
  startDate: string;

  @Column({ nullable: true })
  endDate: string;

  @Column('text', { nullable: true })
  reason: string;

  @Column({ default: 'FULL_DAY' })
  type: string;

  @Column({ default: 'PENDING' })
  status: string;

  @CreateDateColumn()
  appliedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
