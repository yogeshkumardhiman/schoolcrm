import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeeHeadEntity } from './entities/fee-head.entity';
import { FeeStructureEntity } from './entities/fee-structure.entity';
import { FeeDueEntity } from './entities/fee-due.entity';
import { FeePaymentEntity } from './entities/fee-payment.entity';
import { OnlineTransactionEntity } from './entities/online-transaction.entity';
import { StudentEntity } from '../students/entities/student.entity';
import { SchoolInfoEntity } from '../settings/entities/school-info.entity';
import { TransportRouteEntity } from '../transport/entities/transport-route.entity';
import { FeesService } from './fees.service';
import { FeesController } from './fees.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FeeHeadEntity,
      FeeStructureEntity,
      FeeDueEntity,
      FeePaymentEntity,
      OnlineTransactionEntity,
      StudentEntity,
      SchoolInfoEntity,
      TransportRouteEntity,
    ]),
  ],
  controllers: [FeesController],
  providers: [FeesService],
  exports: [FeesService, TypeOrmModule],
})
export class FeesModule {}
