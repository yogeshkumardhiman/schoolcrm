import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('Subjects')
export class SubjectEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  code: string;

  @Column()
  class: string;

  @Column({ default: 'CORE' })
  type: string; // CORE | ELECTIVE | ACTIVITY | VOCATIONAL

  @Column({ type: 'int', default: 80 })
  theoryMarks: number;

  @Column({ type: 'int', default: 20 })
  practicalMarks: number;

  @Column({ type: 'int', default: 33 })
  passingMarks: number;

  @Column({ nullable: true })
  assignedTeacherName: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
