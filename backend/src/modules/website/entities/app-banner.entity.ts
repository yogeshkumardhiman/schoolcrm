import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('AppBanners')
export class AppBannerEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  image_url: string;

  @Column({ nullable: true })
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('text', { nullable: true })
  body: string;

  @Column({ nullable: true })
  action_route: string;

  @Column({ default: 'ACTIVE' })
  status: string;

  @Column({ default: 0 })
  display_order: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
