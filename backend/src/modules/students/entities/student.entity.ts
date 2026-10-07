import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from '../../auth/entities/user.entity';

@Entity('Students')
export class StudentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  userId: number;

  @OneToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  class: string;

  @Column({ nullable: true })
  rollNo: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  fatherName: string;

  @Column({ nullable: true })
  motherName: string;

  @Column({ nullable: true })
  dob: string;

  @Column({ nullable: true })
  gender: string;

  @Column('text', { nullable: true })
  address: string;

  @Column({ nullable: true })
  admissionNo: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  bloodGroup: string;

  @Column({ nullable: true })
  section: string;

  @Column({ default: 'PENDING' })
  feesStatus: string;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true })
  session: string;

  @Column({ nullable: true })
  aadharNo: string;

  @Column({ nullable: true })
  password: string;

  @Column({ default: 'HINDU' })
  religion: string;

  @Column({ default: false })
  transportOpted: boolean;

  @Column({ type: 'int', nullable: true })
  transportStopId: number | null;

  @Column({ type: 'int', nullable: true })
  transportRouteId: number | null;

  @Column({ type: 'jsonb', nullable: true })
  documents: any[];

  @Column({ nullable: true })
  deviceToken: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
