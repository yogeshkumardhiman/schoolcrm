import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import type { HomeworkEntity } from './homework.entity';
import { StudentEntity } from '../../students/entities/student.entity';

@Entity('HomeworkSubmissions')
export class HomeworkSubmissionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  homeworkId: number;

  @ManyToOne('HomeworkEntity', (hw: any) => hw.submissions, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'homeworkId' })
  homework: HomeworkEntity;

  @Column({ nullable: true })
  studentId: number;

  @ManyToOne(() => StudentEntity, { eager: true, nullable: true })
  @JoinColumn({ name: 'studentId' })
  student: StudentEntity;

  @Column({ nullable: true })
  studentName: string;

  @Column({ default: 'PENDING' })
  status: string; // PENDING, SUBMITTED, COMPLETED

  @Column({ nullable: true })
  submittedAt: string;

  @Column('text', { nullable: true })
  content: string;

  @Column({ nullable: true })
  attachmentUrl: string;

  @Column('text', { nullable: true })
  feedback: string;

  @Column({ nullable: true })
  grade: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
