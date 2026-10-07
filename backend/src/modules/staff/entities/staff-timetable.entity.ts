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

@Entity('StaffTimetables')
export class StaffTimetableEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  staffId: number;

  @ManyToOne(() => StaffEntity, { eager: true, nullable: true })
  @JoinColumn({ name: 'staffId' })
  staff: StaffEntity;

  @Column({ nullable: true })
  day: string;

  @Column({ nullable: true })
  period: string;

  @Column({ nullable: true })
  class: string;

  @Column({ nullable: true })
  section: string;

  @Column({ nullable: true })
  subject: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
