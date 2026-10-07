import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComplianceDocEntity } from './entities/compliance-doc.entity';
import { ActivityLogEntity } from '../auth/entities/activity-log.entity';
import { StudentEntity } from '../students/entities/student.entity';
import { StaffEntity } from '../staff/entities/staff.entity';
import { AttendanceEntity } from '../attendance/entities/attendance.entity';
import { TopperEntity } from '../website/entities/topper.entity';
import { EventEntity } from '../website/entities/event.entity';
import { NoticeEntity } from '../website/entities/notice.entity';
import { FeePaymentEntity } from '../fees/entities/fee-payment.entity';
import { FeeDueEntity } from '../fees/entities/fee-due.entity';
import { HomeworkEntity } from '../academic/entities/homework.entity';
import { GrievanceEntity } from '../grievances/entities/grievance.entity';
import { StaffTimetableEntity } from '../staff/entities/staff-timetable.entity';
import { StaffAttendanceEntity } from '../staff/entities/staff-attendance.entity';
import { SubstitutionAssignmentEntity } from '../staff/entities/substitution-assignment.entity';
import { SchoolInfoEntity } from '../settings/entities/school-info.entity';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ComplianceDocEntity,
      ActivityLogEntity,
      StudentEntity,
      StaffEntity,
      AttendanceEntity,
      TopperEntity,
      EventEntity,
      NoticeEntity,
      FeePaymentEntity,
      FeeDueEntity,
      HomeworkEntity,
      GrievanceEntity,
      StaffTimetableEntity,
      StaffAttendanceEntity,
      SubstitutionAssignmentEntity,
      SchoolInfoEntity,
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
