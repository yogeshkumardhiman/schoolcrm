import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('FeeStructures')
export class FeeStructureEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  class: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  tuitionFee: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  transportFee: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  annualFee: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  examFee: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  admissionFee: number;

  @Column({ default: 4 })
  annualMonth: number;

  @Column({ default: '9,2' })
  examMonths: string;

  @Column('jsonb', { nullable: true, default: [] })
  components: any[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
