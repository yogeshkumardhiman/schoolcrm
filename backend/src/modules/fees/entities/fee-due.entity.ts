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

@Entity('FeeDues')
export class FeeDueEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  studentId: number;

  @ManyToOne(() => StudentEntity, { eager: true, nullable: true })
  @JoinColumn({ name: 'studentId' })
  student: StudentEntity;

  @Column()
  month: string;

  @Column()
  year: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  @Column('json', { default: {} })
  breakdown: any;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  paidAmount: number;

  @Column({ default: 'PENDING' })
  status: string; // PENDING, PARTIAL, PAID

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
