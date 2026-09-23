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
import { StaffEntity } from '../../staff/entities/staff.entity';
import { StudentEntity } from '../../students/entities/student.entity';

export enum UserType {
  STAFF = 'STAFF',
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN',
  PARENT = 'PARENT',
}

@Entity('Users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'loginId', unique: true, nullable: false })
  loginId: string; // Unique alphanumeric Login ID for staff/admin/students

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: false })
  password: string;

  @Column({
    type: 'enum',
    enum: UserType,
    nullable: false,
  })
  userType: UserType;

  @Column({ type: 'uuid', nullable: true })
  roleId: string;

  @ManyToOne(() => RoleEntity, { eager: true, nullable: true })
  @JoinColumn({ name: 'roleId' })
  dynamicRole: RoleEntity;

  @Column({ default: true })
  isActive: boolean;

  @Column('jsonb', { nullable: true, default: [] })
  permissions: string[];

  @Column({ nullable: true })
  deviceToken: string;

  @OneToOne(() => StaffEntity, (staff) => staff.user, { nullable: true })
  staffProfile: StaffEntity;

  @OneToOne(() => StudentEntity, (student) => student.user, { nullable: true })
  studentProfile: StudentEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
