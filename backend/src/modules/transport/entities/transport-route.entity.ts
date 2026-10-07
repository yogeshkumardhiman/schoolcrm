import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { TransportStopEntity } from './transport-stop.entity';

@Entity('TransportRoutes')
export class TransportRouteEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  routeName: string;

  @Column({ nullable: true })
  name: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  monthlyFee: number;

  @Column({ nullable: true })
  busNumber: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => TransportStopEntity, (stop) => stop.route)
  stops: TransportStopEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
