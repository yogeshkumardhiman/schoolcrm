import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalaryStructureEntity } from './entities/salary-structure.entity';
import { SalaryPaymentEntity } from './entities/salary-payment.entity';
import { StaffEntity } from '../staff/entities/staff.entity';
import { SalaryService } from './salary.service';
import { SalaryController } from './salary.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SalaryStructureEntity,
      SalaryPaymentEntity,
      StaffEntity,
    ]),
  ],
  controllers: [SalaryController],
  providers: [SalaryService],
  exports: [SalaryService, TypeOrmModule],
})
export class SalaryModule {}
