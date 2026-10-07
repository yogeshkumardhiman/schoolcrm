import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { StaffEntity } from '../../staff/entities/staff.entity';

@Entity('SalaryStructures')
export class SalaryStructureEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  staffId: number;

  @ManyToOne(() => StaffEntity, { eager: true, nullable: true })
  @JoinColumn({ name: 'staffId' })
  staff: StaffEntity;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  baseSalary: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  allowances: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  deductions: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  netSalary: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
