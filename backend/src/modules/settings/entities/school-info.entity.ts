import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('SchoolInfos')
export class SchoolInfoEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  aboutTitle: string;

  @Column('text', { nullable: true })
  aboutDescription: string;

  @Column('text', { nullable: true })
  mission: string;

  @Column('text', { nullable: true })
  vision: string;

  @Column('text', { nullable: true })
  principalMessage: string;

  @Column({ nullable: true })
  contactEmail: string;

  @Column({ nullable: true })
  contactPhone: string;

  @Column('text', { nullable: true })
  address: string;

  @Column({ default: 'PLAYGROUP', nullable: true })
  minClass: string;

  @Column({ default: '12TH' })
  maxClass: string;

  @Column({ nullable: true })
  schoolName: string;

  @Column({ nullable: true })
  logoImage: string;

  @Column({ nullable: true })
  domainPrefix: string;

  @Column({ nullable: true })
  primaryColor: string;

  @Column({ nullable: true })
  secondaryColor: string;

  @Column({ nullable: true })
  bannerTitle: string;

  @Column({ nullable: true })
  bannerImage: string;

  @Column({ nullable: true })
  principalName: string;

  @Column({ nullable: true })
  principalImage: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column('jsonb', { nullable: true })
  active_features: Record<string, any>;

  @Column('jsonb', { nullable: true })
  top_info_bar: Record<string, any>;

  @Column('jsonb', { nullable: true })
  theme_config: Record<string, any>;

  @Column('jsonb', { nullable: true })
  homepage_layout: Record<string, any>;

  @Column('jsonb', { nullable: true })
  statistics: Record<string, any>;

  @Column('jsonb', { nullable: true })
  why_choose_us: Record<string, any>;

  @Column('jsonb', { nullable: true })
  director_message: Record<string, any>;

  @Column('jsonb', { nullable: true })
  academics_config: Record<string, any>;

  @Column('jsonb', { nullable: true })
  campus_tour: Record<string, any>;

  @Column('jsonb', { nullable: true })
  admission_timeline: Record<string, any>;

  @Column('jsonb', { nullable: true })
  facilities_config: Record<string, any>;

  @Column('jsonb', { nullable: true })
  faqs_config: Record<string, any>;

  @Column('jsonb', { nullable: true })
  cta_config: Record<string, any>;

  @Column('jsonb', { nullable: true })
  footer_config: Record<string, any>;

  @Column('jsonb', { nullable: true })
  floating_buttons: Record<string, any>;

  @Column('jsonb', { nullable: true })
  navbar_config: Record<string, any>;

  @Column('jsonb', { nullable: true })
  careers_config: Record<string, any>;

  @Column('jsonb', { nullable: true })
  fee_structure_config: Record<string, any>;

  @Column('jsonb', { nullable: true })
  about_config: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
