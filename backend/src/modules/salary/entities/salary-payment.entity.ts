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

@Entity('SalaryPayments')
export class SalaryPaymentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  staffId: number;

  @ManyToOne(() => StaffEntity, { eager: true, nullable: true })
  @JoinColumn({ name: 'staffId' })
  staff: StaffEntity;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column()
  month: string;

  @Column()
  year: number;

  @Column({ default: 'PENDING' })
  status: string; // PAID, PENDING

  @Column({ nullable: true })
  paymentDate: string;

  @Column({ nullable: true })
  transactionId: string;

  @Column('text', { nullable: true })
  remark: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
