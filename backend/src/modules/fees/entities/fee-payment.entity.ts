import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { StudentEntity } from '../../students/entities/student.entity';

@Entity('FeePayments')
export class FeePaymentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  studentId: number;

  @ManyToOne(() => StudentEntity, { eager: true, nullable: true })
  @JoinColumn({ name: 'studentId' })
  student: StudentEntity;

  @Column('decimal', { precision: 10, scale: 2 })
  amountPaid: number;

  @CreateDateColumn()
  paymentDate: Date;

  @Column({ default: 'CASH' })
  mode: string; // CASH, ONLINE, CHEQUE

  @Column()
  month: string;

  @Column({ nullable: true })
  transactionId: string;

  @Column({ nullable: true })
  onlineTransactionId: number;

  @Column({ nullable: true })
  remark: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
