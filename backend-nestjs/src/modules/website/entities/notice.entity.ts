import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('Notices')
export class NoticeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  title: string;

  @Column('text', { nullable: true })
  content: string;

  @Column({ nullable: true })
  tag: string;

  @Column({ nullable: true })
  color: string;

  @Column({ nullable: true })
  date: string;

  @Column({ nullable: true })
  session: string;

  @Column({ nullable: true })
  class: string;

  @Column({ nullable: true })
  section: string;

  @Column({ nullable: true })
  studentId: number;

  @Column({ nullable: true })
  targetRole: string;

  @Column({ nullable: true })
  createdByRole: string;

  @Column({ nullable: true })
  createdById: number;

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
