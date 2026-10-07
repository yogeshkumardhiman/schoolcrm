import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('FeeHeads')
export class FeeHeadEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name: string;

  @Column({ default: 'MONTHLY' })
  frequency: string; // MONTHLY, QUARTERLY, HALF_YEARLY, YEARLY, ONE_TIME

  @Column({ default: 'RECURRING' })
  category: string; // ADMISSION, RECURRING, TRANSPORT, OPTIONAL

  @Column({ default: true })
  collectOnAdmission: boolean;

  @Column({ default: false })
  isOptional: boolean;

  @Column({ nullable: true })
  description: string;

  @Column('json', { nullable: true })
  applicableMonths: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
