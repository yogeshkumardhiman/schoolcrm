import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffEntity } from './entities/staff.entity';
import { StaffLeaveRequestEntity } from './entities/staff-leave.entity';
import { StaffAttendanceEntity } from './entities/staff-attendance.entity';
import { StaffTimetableEntity } from './entities/staff-timetable.entity';
import { SubstitutionAssignmentEntity } from './entities/substitution-assignment.entity';
import { UserEntity } from '../auth/entities/user.entity';
import { StudentEntity } from '../students/entities/student.entity';
import { AttendanceEntity } from '../attendance/entities/attendance.entity';
import { MailModule } from '../mail/mail.module';
import { StaffService } from './staff.service';
import { StaffController } from './staff.controller';
import { StorageModule } from '../../core/storage/storage.module';
import { DocumentsModule } from '../documents/documents.module';

@Module({
  imports: [
    MailModule,
    StorageModule,
    DocumentsModule,
    TypeOrmModule.forFeature([
      StaffEntity,
      StaffLeaveRequestEntity,
      StaffAttendanceEntity,
      StaffTimetableEntity,
      SubstitutionAssignmentEntity,
      UserEntity,
      StudentEntity,
      AttendanceEntity,
    ]),
  ],
  controllers: [StaffController],
  providers: [StaffService],
  exports: [StaffService, TypeOrmModule],
})
export class StaffModule {}
