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

@Entity('Results')
export class ResultEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  studentId: number;

  @ManyToOne(() => StudentEntity, { eager: true, nullable: true })
  @JoinColumn({ name: 'studentId' })
  student: StudentEntity;

  @Column({ nullable: true })
  subject: string;

  @Column({ nullable: true })
  marks: number;

  @Column({ nullable: true })
  total: number;

  @Column({ nullable: true })
  examType: string;

  @Column({ nullable: true })
  session: string;

  @Column({ nullable: true })
  class: string;

  @Column({ nullable: true })
  section: string;

  @Column({ default: false })
  isVerified: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
