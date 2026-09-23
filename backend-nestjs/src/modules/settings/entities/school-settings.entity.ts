import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('SchoolSettings')
export class SchoolSettingsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'School Name' })
  school_name: string;

  @Column({ default: 'School App' })
  app_title: string;

  @Column({ default: '#6C63FF' })
  primary_color: string;

  @Column({ default: '#8B5CF6' })
  secondary_color: string;

  @Column({ nullable: true })
  logo_url: string;

  @Column('jsonb', {
    default: [
      'fees',
      'homework',
      'exams',
      'notice',
      'timetable',
      'calendar',
      'helpdesk',
      'profile',
    ],
  })
  active_features: string[];

  @Column({ default: false })
  maintenance_mode: boolean;

  @Column('jsonb', {
    default: { active: false, title: '', message: '' },
  })
  emergency_alert: Record<string, any>;

  @Column({ default: false })
  enableOnlinePayments: boolean;

  @Column({ nullable: true })
  razorpayKeyId: string;

  @Column({ nullable: true })
  razorpayKeySecret: string;

  @Column('jsonb', { default: [] })
  favorite_colors: any[];

  @Column('jsonb', {
    default: {
      summer: {
        startTime: '07:30',
        endTime: '13:30',
        label: 'Summer Timing',
        months: 'April – September',
      },
      winter: {
        startTime: '09:00',
        endTime: '15:00',
        label: 'Winter Timing',
        months: 'October – March',
      },
    },
  })
  timings: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
