import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { StaffEntity } from './staff.entity';

@Entity('SubstitutionAssignments')
export class SubstitutionAssignmentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  absentTeacherId: number;

  @ManyToOne(() => StaffEntity, { eager: true, nullable: true })
  @JoinColumn({ name: 'absentTeacherId' })
  absentTeacher: StaffEntity;

  @Column({ nullable: true })
  substituteTeacherId: number;

  @ManyToOne(() => StaffEntity, { eager: true, nullable: true })
  @JoinColumn({ name: 'substituteTeacherId' })
  substituteTeacher: StaffEntity;

  @Column({ nullable: true })
  date: string;

  @Column({ nullable: true })
  period: string;

  @Column({ nullable: true })
  class: string;

  @Column({ nullable: true })
  section: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
