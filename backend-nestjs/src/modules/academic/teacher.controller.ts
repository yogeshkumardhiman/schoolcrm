import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { AcademicService } from './academic.service';
import { StudentsService } from '../students/students.service';
import { AttendanceService } from '../attendance/attendance.service';
import { StaffService } from '../staff/staff.service';
import { GrievancesService } from '../grievances/grievances.service';
import { CreateHomeworkDto } from './dto/create-homework.dto';
import { CreateExamDto } from './dto/create-exam.dto';
import { AddBulkResultsDto } from './dto/bulk-results.dto';
import { CreateAttendanceDto } from '../attendance/dto/create-attendance.dto';
import { BulkAttendanceDto } from '../attendance/dto/bulk-attendance.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

@Controller('teacher')
export class TeacherController {
  constructor(
    private readonly academicService: AcademicService,
    private readonly studentsService: StudentsService,
    private readonly attendanceService: AttendanceService,
    private readonly staffService: StaffService,
    private readonly grievancesService: GrievancesService,
  ) {}

  // --- 1. STUDENTS ROSTER FOR CLASS & SECTION ---

  @Get('students/:class/:section')
  async getStudentsByClassAndSection(
    @Param('class') className: string,
    @Param('section') section: string,
  ) {
    return this.studentsService.findAll({
      class: className,
      section,
    });
  }

  @Get('students/:class')
  async getStudentsByClassOnly(@Param('class') className: string) {
    return this.studentsService.findAll({
      class: className,
    });
  }

  @Get('dashboard/students')
  async getTeacherDashboardStudents(
    @CurrentUser() user?: JwtPayload,
    @Query('class') className?: string,
    @Query('section') section?: string,
  ) {
    return this.staffService.getMyClassStudents(user, className, section);
  }

  @Put('students/roll-number')
  async updateRollNumber(
    @Body() dto: { studentId: number; rollNo: string },
  ) {
    const student = await this.studentsService.update(Number(dto.studentId), {
      rollNo: String(dto.rollNo),
    });
    return {
      success: true,
      message: `Roll Number ${dto.rollNo} synchronized for ${student.name}`,
    };
  }

  @Put('students/reorder')
  async reorderRollNumbers(
    @Body() dto: { class?: string; section?: string },
    @CurrentUser() user?: any,
  ) {
    const teacherClass = dto?.class || user?.class;
    const teacherSection = dto?.section || user?.section;
    return this.studentsService.syncAlphabeticalRollNumbers(teacherClass, teacherSection);
  }

  // --- 2. TEACHER DASHBOARD KPI & SCHEDULE ---

  @Get('dashboard/kpi')
  async getDashboardKPI(@CurrentUser() user?: any) {
    return this.staffService.getMyClassStats(user);
  }

  @Get('timetable/today')
  async getTodayTimetable(
    @CurrentUser() user?: any,
  ) {
    return this.staffService.getMyPersonalTimetable(user);
  }

  @Get('timetable/unified')
  async getUnifiedSchedule(@CurrentUser() user?: any) {
    return this.staffService.getMyPersonalTimetable(user);
  }

  @Get('assignments')
  async getAssignments(@CurrentUser() user?: any) {
    return this.staffService.getMyAssignments(user);
  }

  @Get('substitutions')
  async getSubstitutions(
    @CurrentUser() user?: any,
    @Query('date') date?: string,
  ) {
    return this.staffService.getMySubstitutions(user, date);
  }

  @Get('alerts')
  async getTeacherAlerts(@CurrentUser() user?: any) {
    return [
      {
        id: 'system-status',
        type: 'info',
        message: 'Institutional academic services connected and active.',
      },
    ];
  }

  @Get('dashboard/queries')
  async getDashboardQueries(
    @CurrentUser() user?: any,
  ) {
    const targetClass = user?.class;
    const targetSection = user?.section;
    return this.grievancesService.findAll(targetClass, targetSection, 'PENDING');
  }

  // --- 3. ATTENDANCE MANAGEMENT ---

  @Post('attendance/mark')
  async markSingleAttendance(@Body() dto: CreateAttendanceDto) {
    return this.attendanceService.markSingleAttendance(dto);
  }

  @Get('attendance/:class/:date')
  async getAttendanceByClassAndDate(
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

  @Post('attendance/bulk')
  async markBulkAttendance(@Body() dto: BulkAttendanceDto) {
    return this.attendanceService.markBulkAttendance(dto);
  }

  // --- 4. HOMEWORK MANAGEMENT ---

  @Get('homework')
  async getHomeworkList(
    @Query('class') className?: string,
    @Query('section') section?: string,
  ) {
    return this.academicService.findAllHomework(className, section);
  }

  @Get('homework/summary')
  async getHomeworkSummary() {
    return this.academicService.getHomeworkAnalytics();
  }

  @Get('homework/stats/:id')
  async getHomeworkStats(@Param('id', ParseIntPipe) id: number) {
    return this.academicService.getHomeworkStats(id);
  }

  @Post('homework')
  async createHomework(
    @Body() dto: CreateHomeworkDto,
    @CurrentUser() user?: any,
  ) {
    const enrichedDto = {
      ...dto,
      teacherId: dto.teacherId || (user?.id ? Number(user.id) : undefined),
      teacherName: dto.teacherName || user?.name || user?.loginId,
    };
    return this.academicService.createHomework(enrichedDto);
  }

  @Put('homework/:id')
  async updateHomework(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateHomeworkDto>,
  ) {
    return this.academicService.updateHomework(id, dto);
  }

  @Post('homework/submission/status')
  async updateStudentSubmissionStatus(@Body() dto: any) {
    return this.academicService.submitHomework({
      studentId: Number(dto.studentId),
      homeworkId: Number(dto.homeworkId),
      status: dto.status,
      content: dto.feedback || dto.content,
    });
  }

  // --- 5. EXAMS & MARKS GOVERNANCE ---

  @Get('exams/:class')
  async getExamsByClass(@Param('class') className: string) {
    return this.academicService.findAllExams(className);
  }

  @Post('exams')
  async createExam(@Body() dto: CreateExamDto) {
    return this.academicService.createExam(dto);
  }

  @Post('results/bulk')
  async addBulkResults(
    @Body() dto: AddBulkResultsDto,
    @CurrentUser() user?: JwtPayload,
  ) {
    return this.academicService.addBulkResults(dto, user);
  }
}
