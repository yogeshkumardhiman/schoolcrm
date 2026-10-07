import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { AcademicService } from './academic.service';
import { CreateHomeworkDto } from './dto/create-homework.dto';
import { SubmitHomeworkDto } from './dto/submit-homework.dto';
import { CreateResultDto } from './dto/create-result.dto';
import { CreateExamDto } from './dto/create-exam.dto';
import { PromoteStudentsDto } from './dto/promote-students.dto';
import { AddBulkResultsDto } from './dto/bulk-results.dto';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { Permission } from '../../common/enums/permission.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

@Controller('academic')
export class AcademicController {
  constructor(private readonly academicService: AcademicService) {}

  // --- HOMEWORK ---

  @Get('homework/analytics')
  @RequirePermissions(Permission.STUDENT_READ)
  async getHomeworkAnalytics() {
    return this.academicService.getHomeworkAnalytics();
  }

  @Get('homework/stats/:id')
  @RequirePermissions(Permission.STUDENT_READ)
  async getHomeworkStats(@Param('id', ParseIntPipe) id: number) {
    return this.academicService.getHomeworkStats(id);
  }

  @Get('homework/:id/stats')
  @RequirePermissions(Permission.STUDENT_READ)
  async getHomeworkStatsAlias(@Param('id', ParseIntPipe) id: number) {
    return this.academicService.getHomeworkStats(id);
  }

  @Get('homework')
  @RequirePermissions(Permission.STUDENT_READ)
  async findAllHomework(
    @Query('class') className?: string,
    @Query('section') section?: string,
  ) {
    return this.academicService.findAllHomework(className, section);
  }

  @Post('homework')
  @RequirePermissions(Permission.HOMEWORK_MANAGE)
  async createHomework(@Body() dto: CreateHomeworkDto) {
    return this.academicService.createHomework(dto);
  }

  @Put('homework/:id')
  @RequirePermissions(Permission.HOMEWORK_MANAGE)
  async updateHomework(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateHomeworkDto>,
  ) {
    return this.academicService.updateHomework(id, dto);
  }

  @Delete('homework/:id')
  @RequirePermissions(Permission.HOMEWORK_MANAGE)
  async deleteHomework(@Param('id', ParseIntPipe) id: number) {
    return this.academicService.deleteHomework(id);
  }

  @Post('homework/submit')
  async submitHomework(@Body() dto: SubmitHomeworkDto) {
    return this.academicService.submitHomework(dto);
  }

  // --- EXAMS REGISTRY ---

  @Get('exams')
  @RequirePermissions(Permission.ACADEMIC_READ)
  async findAllExams(@Query('class') className?: string) {
    return this.academicService.findAllExams(className);
  }

  @Post('exams')
  @RequirePermissions(Permission.EXAM_MANAGE)
  async createExam(@Body() dto: CreateExamDto) {
    return this.academicService.createExam(dto);
  }

  @Put('exams/:id')
  @RequirePermissions(Permission.EXAM_MANAGE)
  async updateExam(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateExamDto>,
  ) {
    return this.academicService.updateExam(id, dto);
  }

  @Delete('exams/:id')
  @RequirePermissions(Permission.EXAM_MANAGE)
  async deleteExam(@Param('id', ParseIntPipe) id: number) {
    return this.academicService.deleteExam(id);
  }

  // --- RESULTS & MARKS ---

  @Get('results/student/:studentId')
  @RequirePermissions(Permission.ACADEMIC_READ)
  async getStudentResults(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.academicService.getStudentResults(studentId);
  }

  @Post('results')
  @RequirePermissions(Permission.EXAM_MANAGE)
  async createResult(
    @Body() dto: CreateResultDto,
    @CurrentUser() user?: JwtPayload,
  ) {
    return this.academicService.createResult(dto, user);
  }

  @Put('results/:id')
  @RequirePermissions(Permission.EXAM_MANAGE)
  async updateResult(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateResultDto>,
  ) {
    return this.academicService.updateResult(id, dto);
  }

  @Delete('results/:id')
  @RequirePermissions(Permission.EXAM_MANAGE)
  async deleteResult(@Param('id', ParseIntPipe) id: number) {
    return this.academicService.deleteResult(id);
  }

  @Post('results/bulk')
  @RequirePermissions(Permission.EXAM_MANAGE)
  async addBulkResults(
    @Body() dto: AddBulkResultsDto,
    @CurrentUser() user?: JwtPayload,
  ) {
    return this.academicService.addBulkResults(dto, user);
  }

  @Get('marks')
  @RequirePermissions(Permission.ACADEMIC_READ)
  async findMarks(
    @Query('class') className?: string,
    @Query('section') section?: string,
    @Query('studentId') studentId?: string,
    @Query('examId') examId?: string,
  ) {
    return this.academicService.findMarks({
      class: className,
      section,
      studentId: studentId ? Number(studentId) : undefined,
      examId,
    });
  }

  // --- SESSION PROMOTION / MIGRATION ENGINE ---

  @Post('promote')
  @RequirePermissions(Permission.STUDENT_UPDATE)
  async promoteStudents(@Body() dto: PromoteStudentsDto, @Req() req: any) {
    const performedBy = req.user?.name || req.user?.loginId || 'ADMIN';
    return this.academicService.promoteStudents(dto, performedBy);
  }

  // --- SUBJECTS MANAGEMENT ---

  @Get('subjects')
  @RequirePermissions(Permission.STUDENT_READ)
  async findAllSubjects(@Query('class') className?: string) {
    return this.academicService.findAllSubjects(className);
  }

  @Post('subjects')
  @RequirePermissions(Permission.EXAM_MANAGE)
  async createSubject(@Body() dto: any) {
    return this.academicService.createSubject(dto);
  }

  @Put('subjects/:id')
  @RequirePermissions(Permission.EXAM_MANAGE)
  async updateSubject(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
  ) {
    return this.academicService.updateSubject(id, dto);
  }

  @Delete('subjects/:id')
  @RequirePermissions(Permission.EXAM_MANAGE)
  async deleteSubject(@Param('id', ParseIntPipe) id: number) {
    return this.academicService.deleteSubject(id);
  }

  @Get('class-roster')
  @RequirePermissions(Permission.ACADEMIC_READ)
  async getClassRoster(
    @Query('class') className: string,
    @Query('section') section?: string,
    @Query('session') session?: string,
  ) {
    return this.academicService.getClassRoster(className, section, session);
  }
}
