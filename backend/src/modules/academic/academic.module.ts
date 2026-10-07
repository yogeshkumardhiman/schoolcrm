import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomeworkEntity } from './entities/homework.entity';
import { HomeworkSubmissionEntity } from './entities/homework-submission.entity';
import { ResultEntity } from './entities/result.entity';
import { SubjectEntity } from './entities/subject.entity';
import { ExamEntity } from './entities/exam.entity';
import { StudentEntity } from '../students/entities/student.entity';
import { StaffEntity } from '../staff/entities/staff.entity';
import { StaffTimetableEntity } from '../staff/entities/staff-timetable.entity';
import { ActivityLogEntity } from '../auth/entities/activity-log.entity';
import { StorageModule } from '../../core/storage/storage.module';
import { AcademicService } from './academic.service';
import { AcademicController } from './academic.controller';
import { TeacherController } from './teacher.controller';
import { StudentsModule } from '../students/students.module';
import { StaffModule } from '../staff/staff.module';
import { AttendanceModule } from '../attendance/attendance.module';
import { GrievancesModule } from '../grievances/grievances.module';

@Module({
  imports: [
    StorageModule,
    StudentsModule,
    StaffModule,
    AttendanceModule,
    GrievancesModule,
    TypeOrmModule.forFeature([
      HomeworkEntity,
      HomeworkSubmissionEntity,
      ResultEntity,
      SubjectEntity,
      ExamEntity,
      StudentEntity,
      StaffEntity,
      StaffTimetableEntity,
      ActivityLogEntity,
    ]),
  ],
  controllers: [AcademicController, TeacherController],
  providers: [AcademicService],
  exports: [AcademicService],
})
export class AcademicModule {}
