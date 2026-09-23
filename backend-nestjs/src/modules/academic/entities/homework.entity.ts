import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { StaffEntity } from '../../staff/entities/staff.entity';
import type { HomeworkSubmissionEntity } from './homework-submission.entity';

@Entity('Homework')
export class HomeworkEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  subject: string;

  @Column({ nullable: true })
  date: string;

  @Column({ nullable: true })
  dueDate: string;

  @Column({ nullable: true })
  class: string;

  @Column({ nullable: true })
  section: string;

  @Column('text', { nullable: true })
  content: string;

  @Column({ nullable: true })
  teacherId: number;

  @ManyToOne(() => StaffEntity, { eager: true, nullable: true })
  @JoinColumn({ name: 'teacherId' })
  teacher: StaffEntity;

  @Column({ nullable: true })
  teacherName: string;

  @Column({ default: 'MEDIUM' })
  priority: string; // LOW, MEDIUM, HIGH

  @Column({ default: false })
  isUrgent: boolean;

  @Column({ default: 'ACTIVE' })
  status: string; // ACTIVE, ARCHIVED, DRAFT

  @Column('json', { nullable: true })
  attachments: any;

  @Column({ nullable: true })
  session: string;

  @OneToMany('HomeworkSubmissionEntity', (sub: any) => sub.homework)
  submissions: HomeworkSubmissionEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
