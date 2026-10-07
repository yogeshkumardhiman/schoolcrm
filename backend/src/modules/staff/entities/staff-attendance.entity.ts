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

@Entity('StaffAttendances')
export class StaffAttendanceEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  staffId: number;

  @ManyToOne(() => StaffEntity, { eager: true, nullable: true })
  @JoinColumn({ name: 'staffId' })
  staff: StaffEntity;

  @Column({ nullable: true })
  date: string;

  @Column({ nullable: true })
  status: string;

  @Column({ nullable: true })
  markedBy: string;

  @Column({ nullable: true })
  remark: string;

  @Column({ nullable: true })
  checkInTime: string;

  @Column({ nullable: true })
  checkOutTime: string;

  @Column({ nullable: true })
  workingHours: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
