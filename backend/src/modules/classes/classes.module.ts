import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';
import { ClassSectionEntity } from './entities/class-section.entity';
import { StudentEntity } from '../students/entities/student.entity';
import { StaffEntity } from '../staff/entities/staff.entity';
import { SchoolInfoEntity } from '../settings/entities/school-info.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ClassSectionEntity,
      StudentEntity,
      StaffEntity,
      SchoolInfoEntity,
    ]),
  ],
  controllers: [ClassesController],
  providers: [ClassesService],
  exports: [ClassesService],
})
export class ClassesModule {}
