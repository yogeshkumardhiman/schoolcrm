import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { StaffEntity } from '../../staff/entities/staff.entity';

@Entity('ClassSections')
export class ClassSectionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  class: string;

  @Column()
  section: string;

  @Column({ nullable: true })
  classTeacherId: number;

  @ManyToOne(() => StaffEntity, { eager: true, nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'classTeacherId' })
  classTeacher: StaffEntity;

  @Column({ default: '2026-2027' })
  session: string;

  @Column({ type: 'int', default: 40 })
  capacity: number;

  @Column({ nullable: true })
  roomNo: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
