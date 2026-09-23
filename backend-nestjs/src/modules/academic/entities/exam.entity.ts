import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ExamStatus {
  UPCOMING = 'UPCOMING',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
}

@Entity('Exams')
export class ExamEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'varchar', length: 100, default: 'UNIT_TEST' })
  type: string;

  @Column({ type: 'varchar', length: 50 })
  class: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  term: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  academicYear: string;

  @Column({ type: 'date', nullable: true })
  startDate: string;

  @Column({ type: 'date', nullable: true })
  endDate: string;

  @Column({
    type: 'enum',
    enum: ExamStatus,
    default: ExamStatus.UPCOMING,
  })
  status: ExamStatus;

  @Column({ type: 'int', default: 100 })
  maxMarks: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
