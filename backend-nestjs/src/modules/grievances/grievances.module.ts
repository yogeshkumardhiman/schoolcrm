import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GrievanceEntity } from './entities/grievance.entity';
import { GrievancesService } from './grievances.service';
import { GrievancesController } from './grievances.controller';
import { StudentEntity } from '../students/entities/student.entity';
import { ClassSectionEntity } from '../classes/entities/class-section.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GrievanceEntity,
      StudentEntity,
      ClassSectionEntity,
    ]),
  ],
  controllers: [GrievancesController],
  providers: [GrievancesService],
  exports: [GrievancesService],
})
export class GrievancesModule {}
