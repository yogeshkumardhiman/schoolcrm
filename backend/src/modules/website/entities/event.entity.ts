import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('Events')
export class EventEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  date: string;

  @Column({ nullable: true })
  time: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  participants: string;

  @Column({ default: '#4F46E5' })
  color: string;

  @Column({ nullable: true })
  icon: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ default: 'EVENT' })
  type: string;

  @Column({ nullable: true })
  endDate: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
