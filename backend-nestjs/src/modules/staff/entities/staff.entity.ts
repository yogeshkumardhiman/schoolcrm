import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { RoleEntity } from '../../rbac/entities/role.entity';
import { UserEntity } from '../../auth/entities/user.entity';

@Entity('Staffs')
export class StaffEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  userId: number;

  @OneToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column({ name: 'loginId', unique: true, nullable: true })
  loginId: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  role: string;

  @Column({ nullable: true })
  designation: string;

  @Column({ nullable: true })
  subject: string;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ nullable: true })
  qualification: string;

  @Column({ nullable: true })
  experience: string;

  @Column({ nullable: true })
  joiningDate: string;

  @Column({ nullable: true })
  class: string;

  @Column({ default: 'A' })
  section: string;

  @Column({ default: 'teacher123' })
  password: string;

  @Column('text', { nullable: true })
  about: string;

  @Column('text', { nullable: true })
  address: string;

  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true })
  dob: string;

  @Column({ nullable: true })
  religion: string;

  @Column('jsonb', { nullable: true, default: [] })
  permissions: any[];

  @Column('jsonb', { nullable: true, default: [] })
  assignedSubjects: { class: string; section?: string; subject: string }[];

  @Column('jsonb', { nullable: true, default: [] })
  documents: any[];

  @Column({ default: false })
  can_manage_app_settings: boolean;

  @Column({ nullable: true })
  roleId: string;

  @ManyToOne(() => RoleEntity, { eager: true, nullable: true })
  @JoinColumn({ name: 'roleId' })
  dynamicRole: RoleEntity;

  @Column({ nullable: true })
  deviceToken: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
