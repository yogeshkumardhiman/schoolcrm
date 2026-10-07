import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransportRouteEntity } from './entities/transport-route.entity';
import { TransportStopEntity } from './entities/transport-stop.entity';
import { StudentEntity } from '../students/entities/student.entity';
import { TransportService } from './transport.service';
import { TransportController } from './transport.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TransportRouteEntity,
      TransportStopEntity,
      StudentEntity,
    ]),
  ],
  controllers: [TransportController],
  providers: [TransportService],
  exports: [TransportService, TypeOrmModule],
})
export class TransportModule {}
