import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('ActivityLogs')
export class ActivityLogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  action: string;

  @Column({ nullable: true })
  performedBy: string;

  @Column({ nullable: true })
  role: string;

  @Column('text', { nullable: true })
  details: string;

  @CreateDateColumn()
  createdAt: Date;
}
