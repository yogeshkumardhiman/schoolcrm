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

@Entity('Attendances')
export class AttendanceEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  studentId: number;

  @ManyToOne(() => StudentEntity, { eager: true, nullable: true })
  @JoinColumn({ name: 'studentId' })
  student: StudentEntity;

  @Column({ nullable: true })
  class: string;

  @Column({ nullable: true })
  section: string;

  @Column({ nullable: true })
  date: string;

  @Column({ default: 'PRESENT' })
  status: string; // PRESENT, ABSENT, LEAVE, LATE, HOLIDAY

  @Column({ nullable: true })
  session: string;

  @Column({ nullable: true })
  departureTime: string; // e.g. "11:30 AM"

  @Column({ nullable: true })
  remarks: string; // e.g. "Reason: Sudden Fever | Picked by: Father"

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
