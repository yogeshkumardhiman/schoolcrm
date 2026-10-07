import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { BulkAttendanceDto } from './dto/bulk-attendance.dto';
import { AttendanceQueryDto } from './dto/attendance-query.dto';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { Permission } from '../../common/enums/permission.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get('student/:queryId')
  @RequirePermissions(Permission.ATTENDANCE_READ)
  async getStudentAttendance(@Param('queryId') queryId: string) {
    return this.attendanceService.findStudentAttendance(queryId);
  }

  @Get('class')
  @RequirePermissions(Permission.ATTENDANCE_READ)
  async getClassAttendance(@Query() query: AttendanceQueryDto) {
    return this.attendanceService.findClassAttendance(query);
  }

  @Get('summary/:queryId')
  @RequirePermissions(Permission.ATTENDANCE_READ)
  async getAttendanceSummary(@Param('queryId') queryId: string) {
    return this.attendanceService.getAttendanceSummary(queryId);
  }

  @Post('mark')
  @RequirePermissions(Permission.ATTENDANCE_MARK)
  async markSingleAttendance(@Body() dto: CreateAttendanceDto) {
    return this.attendanceService.markSingleAttendance(dto);
  }

  @Post('teacher/mark')
  @RequirePermissions(Permission.ATTENDANCE_MARK)
  async markSingleTeacherAttendance(@Body() dto: CreateAttendanceDto) {
    return this.attendanceService.markSingleAttendance(dto);
  }

  @Post('bulk-mark')
  @RequirePermissions(Permission.ATTENDANCE_MARK)
  async markBulkAttendance(@Body() dto: BulkAttendanceDto) {
    return this.attendanceService.markBulkAttendance(dto);
  }

  @Post('teacher/bulk')
  @RequirePermissions(Permission.ATTENDANCE_MARK)
  async markBulkTeacherAttendance(@Body() dto: BulkAttendanceDto) {
    return this.attendanceService.markBulkAttendance(dto);
  }

  @Get('teacher/:class/:date')
  @RequirePermissions(Permission.ATTENDANCE_READ)
  async getTeacherClassAttendance(
    @Param('class') className: string,
    @Param('date') date: string,
    @Query('section') section?: string,
  ) {
    return this.attendanceService.findClassAttendance({
      class: className,
      section,
      date,
    });
  }

  @Get('my')
  async getMyAttendance(
    @CurrentUser() user: any,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.attendanceService.getMyAttendance(user, month, year);
  }

  @Get('staff/my')
  async getStaffMyAttendance(
    @CurrentUser() user: any,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.attendanceService.getMyAttendance(user, month, year);
  }

  @Get('staff/qr-token')
  @RequirePermissions(Permission.ATTENDANCE_READ)
  async getStaffQrToken() {
    return this.attendanceService.getStaffQrToken();
  }

  @Get('staff/last-scan')
  @RequirePermissions(Permission.ATTENDANCE_READ)
  async getLastScan() {
    return this.attendanceService.getLastScan();
  }

  @Get('staff')
  @RequirePermissions(Permission.ATTENDANCE_READ)
  async getStaffAttendance(@Query('date') date?: string) {
    return this.attendanceService.getStaffAttendance(date);
  }

  @Post('staff')
  @RequirePermissions(Permission.ATTENDANCE_MARK)
  async markStaffAttendance(@Body() dto: any) {
    return this.attendanceService.markStaffAttendance(dto);
  }
}
