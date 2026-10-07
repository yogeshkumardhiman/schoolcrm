import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentEntity } from './entities/student.entity';
import { UserEntity } from '../auth/entities/user.entity';
import { AttendanceEntity } from '../attendance/entities/attendance.entity';
import { SchoolInfoEntity } from '../settings/entities/school-info.entity';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { StorageModule } from '../../core/storage/storage.module';
import { DocumentsModule } from '../documents/documents.module';

import { ResultEntity } from '../academic/entities/result.entity';
import { HomeworkEntity } from '../academic/entities/homework.entity';
import { HomeworkSubmissionEntity } from '../academic/entities/homework-submission.entity';
import { FeePaymentEntity } from '../fees/entities/fee-payment.entity';
import { FeeDueEntity } from '../fees/entities/fee-due.entity';
import { StaffEntity } from '../staff/entities/staff.entity';
import { StaffTimetableEntity } from '../staff/entities/staff-timetable.entity';
import { SubstitutionAssignmentEntity } from '../staff/entities/substitution-assignment.entity';

@Module({
  imports: [
    StorageModule,
    DocumentsModule,
    TypeOrmModule.forFeature([
      StudentEntity,
      UserEntity,
      AttendanceEntity,
      SchoolInfoEntity,
      ResultEntity,
      HomeworkEntity,
      HomeworkSubmissionEntity,
      FeePaymentEntity,
      FeeDueEntity,
      StaffEntity,
      StaffTimetableEntity,
      SubstitutionAssignmentEntity,
    ]),
  ],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService, TypeOrmModule],
})
export class StudentsModule {}
