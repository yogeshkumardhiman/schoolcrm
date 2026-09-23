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
import { GrievancesService } from './grievances.service';
import { CreateGrievanceDto } from './dto/create-grievance.dto';
import { ReplyGrievanceDto } from './dto/reply-grievance.dto';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { Permission } from '../../common/enums/permission.enum';

@Controller()
export class GrievancesController {
  constructor(private readonly grievancesService: GrievancesService) {}

  @Post('grievances')
  async create(@Body() dto: CreateGrievanceDto) {
    return this.grievancesService.create(dto);
  }

  @Post('student/grievance')
  async createStudentGrievance(@Body() dto: CreateGrievanceDto) {
    return this.grievancesService.create(dto);
  }

  @Get('grievances')
  @RequirePermissions(Permission.STUDENT_READ)
  async findAll(
    @Query('class') className?: string,
    @Query('section') section?: string,
    @Query('status') status?: string,
  ) {
    return this.grievancesService.findAll(className, section, status);
  }

  @Get('crm/all-grievances')
  @RequirePermissions(Permission.STUDENT_READ)
  async findAllCrmGrievances(
    @Query('class') className?: string,
    @Query('section') section?: string,
    @Query('status') status?: string,
  ) {
    return this.grievancesService.findAll(className, section, status);
  }

  @Get('all-grievances')
  @RequirePermissions(Permission.STUDENT_READ)
  async findAllLegacyGrievances(
    @Query('class') className?: string,
    @Query('section') section?: string,
    @Query('status') status?: string,
  ) {
    return this.grievancesService.findAll(className, section, status);
  }

  @Get('grievances/student/:studentId')
  async findByStudent(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.grievancesService.findByStudent(studentId);
  }

  @Get('student/grievance/:studentId')
  async findByStudentLegacy(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.grievancesService.findByStudent(studentId);
  }

  @Get('teacher/grievance/:class/:section')
  async findByClass(
    @Param('class') className: string,
    @Param('section') section: string,
  ) {
    return this.grievancesService.findByClass(className, section);
  }

  @Put('grievances/:id/reply')
  async reply(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReplyGrievanceDto,
  ) {
    return this.grievancesService.reply(id, dto);
  }

  @Put('teacher/grievance/reply/:id')
  async replyLegacy(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReplyGrievanceDto,
  ) {
    return this.grievancesService.reply(id, dto);
  }

  @Post('reports/logs')
  async replyFromReportsLog(@Body() body: any) {
    if (body.grievanceId) {
      return this.grievancesService.reply(Number(body.grievanceId), {
        teacherReply: body.teacherReply || body.reply,
        responderName: body.responderName || 'Staff Member',
      });
    }
    return { success: true, message: 'Log processed successfully' };
  }

  @Delete('grievances/:id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.grievancesService.delete(id);
  }
}
