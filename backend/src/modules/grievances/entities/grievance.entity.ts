import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum GrievanceStatus {
  PENDING = 'PENDING',
  IN_REVIEW = 'IN_REVIEW',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

@Entity('Grievances')
export class GrievanceEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  studentId: number;

  @Column({ nullable: true })
  admissionNo: string;

  @Column({ nullable: true })
  studentName: string;

  @Column({ nullable: true })
  class: string;

  @Column({ nullable: true })
  section: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 100, default: 'GENERAL' })
  category: string;

  @Column({
    type: 'enum',
    enum: GrievanceStatus,
    default: GrievanceStatus.PENDING,
  })
  status: GrievanceStatus;

  @Column({ type: 'text', nullable: true })
  teacherReply: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  responderName: string;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
