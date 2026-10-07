import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentQueryDto } from './dto/student-query.dto';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { Permission } from '../../common/enums/permission.enum';
import { Public } from '../../common/decorators/public.decorator';

@Controller(['students', 'admin/students', 'student'])
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  async findAll(@Query() query: StudentQueryDto) {
    return this.studentsService.findAll(query);
  }

  // --- SCHOLAR PORTAL / DASHBOARD TELEMETRY ---

  @Get('dashboard/:admissionNo')
  @Public()
  async getStudentDashboard(@Param('admissionNo') admissionNo: string) {
    if (/^\d+$/.test(admissionNo) && admissionNo.length < 6) {
      try {
        return await this.studentsService.findByAdmissionNo(admissionNo);
      } catch {
        return await this.studentsService.findOne(Number(admissionNo));
      }
    }
    return this.studentsService.findByAdmissionNo(admissionNo);
  }

  @Get('dashboard/details/:studentId')
  @Public()
  async getStudentDashboardDetails(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.studentsService.findOne(studentId);
  }

  @Get('class-teacher/:class/:section')
  @Public()
  async getClassTeacher(
    @Param('class') className: string,
    @Param('section') section: string,
  ) {
    return this.studentsService.getClassTeacher(className, section);
  }

  @Get('timetable/:class/:section')
  @Public()
  async getClassTimetable(
    @Param('class') className: string,
    @Param('section') section: string,
  ) {
    return this.studentsService.getClassTimetable(className, section);
  }

  @Get('homework/my-status')
  @Public()
  async getStudentHomeworkStatus(@Query('studentId', ParseIntPipe) studentId: number) {
    return this.studentsService.getStudentHomeworkStatus(studentId);
  }

  @Post('homework/status')
  @Public()
  async updateStudentHomeworkStatus(
    @Body()
    dto: {
      studentId: number;
      homeworkId: number;
      status: string;
      content?: string;
    },
  ) {
    return this.studentsService.updateStudentHomeworkStatus(
      Number(dto.studentId),
      Number(dto.homeworkId),
      dto.status,
      dto.content,
    );
  }

  @Get('results/:studentId')
  @Public()
  async getStudentResultsDirect(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.studentsService.getStudentResults(studentId);
  }

  @Get('promotion-candidates')
  @RequirePermissions(Permission.STUDENT_READ)
  async getPromotionCandidates(
    @Query('class') className?: string,
    @Query('session') session?: string,
  ) {
    return this.studentsService.getPromotionCandidates(className, session);
  }

  @Get('admission/:admissionNo')
  async findByAdmissionNo(@Param('admissionNo') admissionNo: string) {
    return this.studentsService.findByAdmissionNo(admissionNo);
  }

  @Get('search/:admissionNo')
  async searchByAdmissionNo(@Param('admissionNo') admissionNo: string) {
    return this.studentsService.findByAdmissionNo(admissionNo);
  }

  @Get('next-id/:className')
  async getNextIdWithClass(@Param('className') className: string) {
    return this.studentsService.getNextAdmissionId(className);
  }

  @Get('next-id')
  async getNextId() {
    return this.studentsService.getNextAdmissionId();
  }

  @Get('get-next-id/:className')
  async getNextIdLegacy(@Param('className') className: string) {
    return this.studentsService.getNextAdmissionId(className);
  }

  @Post('sync-roll-numbers')
  @RequirePermissions(Permission.STUDENT_UPDATE)
  async syncRollNumbers(@Body() dto: { class?: string; section?: string }) {
    return this.studentsService.syncAlphabeticalRollNumbers(dto?.class, dto?.section);
  }

  @Post('bulk-section')
  @RequirePermissions(Permission.STUDENT_UPDATE)
  async bulkSectionAlias(@Body() dto: any) {
    const className = dto?.class;
    const section = dto?.section;
    return this.studentsService.syncAlphabeticalRollNumbers(className, section);
  }

  @Get(':id/attendance')
  async getAttendanceByStudent(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.getStudentAttendance(id);
  }

  @Get(':id/results')
  async getResultsByStudent(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.getStudentResults(id);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.findOne(id);
  }

  @Post()
  @RequirePermissions(Permission.STUDENT_CREATE)
  async create(@Body() dto: CreateStudentDto) {
    return this.studentsService.create(dto);
  }

  @Put(':id')
  @RequirePermissions(Permission.STUDENT_UPDATE)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStudentDto,
  ) {
    return this.studentsService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions(Permission.STUDENT_DELETE)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.remove(id);
  }
}
