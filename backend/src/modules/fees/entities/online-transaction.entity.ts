import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum OnlineTransactionStatus {
  CREATED = 'CREATED',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

@Entity('OnlineTransactions')
export class OnlineTransactionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  studentId: number;

  @Column({ nullable: true })
  feeDueId: number;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 10, default: 'INR' })
  currency: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  razorpayOrderId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  razorpayPaymentId: string;

  @Column({ type: 'text', nullable: true })
  razorpaySignature: string;

  @Column({
    type: 'enum',
    enum: OnlineTransactionStatus,
    default: OnlineTransactionStatus.CREATED,
  })
  status: OnlineTransactionStatus;

  @Column({ type: 'varchar', length: 50, default: 'RAZORPAY' })
  paymentMethod: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
