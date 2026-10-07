import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TransportRouteEntity } from './transport-route.entity';

@Entity('TransportStops')
export class TransportStopEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  routeId: number;

  @ManyToOne(() => TransportRouteEntity, (route) => route.stops, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'routeId' })
  route: TransportRouteEntity;

  @Column({ nullable: true })
  stopName: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  fee: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
