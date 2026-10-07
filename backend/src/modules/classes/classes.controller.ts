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
import { ClassesService } from './classes.service';
import { CreateClassSectionDto } from './dto/create-class-section.dto';
import { UpdateClassSectionDto } from './dto/update-class-section.dto';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { Permission } from '../../common/enums/permission.enum';

@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Get('summary')
  @RequirePermissions(Permission.STUDENT_READ)
  async getClassSummary(@Query('session') session?: string) {
    return this.classesService.getClassSummary(session);
  }

  @Get('teachers')
  @RequirePermissions(Permission.STAFF_READ)
  async getTeachersList() {
    return this.classesService.getTeachersList();
  }

  @Get('roster/:id')
  @RequirePermissions(Permission.STUDENT_READ)
  async getSectionRoster(@Param('id', ParseIntPipe) id: number) {
    return this.classesService.getSectionRoster(id);
  }

  @Get('sections')
  @RequirePermissions(Permission.STUDENT_READ)
  async findAllSections(
    @Query('class') className?: string,
    @Query('session') session?: string,
  ) {
    return this.classesService.findAllSections(className, session);
  }

  @Get('sections/:id')
  @RequirePermissions(Permission.STUDENT_READ)
  async findOneSection(@Param('id', ParseIntPipe) id: number) {
    return this.classesService.findOneSection(id);
  }

  @Post('sections')
  @RequirePermissions(Permission.STUDENT_CREATE)
  async createSection(@Body() dto: CreateClassSectionDto) {
    return this.classesService.createSection(dto);
  }

  @Put('sections/:id')
  @RequirePermissions(Permission.STUDENT_UPDATE)
  async updateSection(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateClassSectionDto,
  ) {
    return this.classesService.updateSection(id, dto);
  }

  @Delete('sections/:id')
  @RequirePermissions(Permission.STUDENT_DELETE)
  async deleteSection(@Param('id', ParseIntPipe) id: number) {
    return this.classesService.deleteSection(id);
  }

  @Post('sections/:id/assign-teacher')
  @RequirePermissions(Permission.STAFF_UPDATE)
  async assignClassTeacher(
    @Param('id', ParseIntPipe) id: number,
    @Body('teacherId', ParseIntPipe) teacherId: number,
  ) {
    return this.classesService.assignClassTeacher(id, teacherId);
  }

  @Post('auto-assign-teachers')
  @RequirePermissions(Permission.STAFF_UPDATE)
  async autoAssignClassTeachers() {
    return this.classesService.autoAssignClassTeachers();
  }

  @Get('unassigned-students')
  @RequirePermissions(Permission.STUDENT_READ)
  async getUnassignedStudents(@Query('class') className: string) {
    return this.classesService.getUnassignedStudents(className || '1ST');
  }

  @Get('all-class-students')
  @RequirePermissions(Permission.STUDENT_READ)
  async getAllClassStudents(@Query('class') className: string) {
    return this.classesService.getAllClassStudents(className || '1ST');
  }

  @Post('split-class')
  @RequirePermissions(Permission.STUDENT_UPDATE)
  async smartSplitClass(
    @Body('class') className: string,
    @Body('sectionNames') sectionNames: string[],
  ) {
    return this.classesService.smartSplitClass(className, sectionNames || ['A', 'B']);
  }

  @Post('sections/:id/assign-students')
  @RequirePermissions(Permission.STUDENT_UPDATE)
  async assignStudentsToSection(
    @Param('id', ParseIntPipe) id: number,
    @Body('studentIds') studentIds: number[],
  ) {
    return this.classesService.assignStudentsToSection(id, studentIds || []);
  }

  @Post('remove-student')
  @RequirePermissions(Permission.STUDENT_UPDATE)
  async removeStudentFromSection(@Body('studentId', ParseIntPipe) studentId: number) {
    return this.classesService.removeStudentFromSection(studentId);
  }

  @Post('allocate-with-teacher')
  @RequirePermissions(Permission.STUDENT_UPDATE)
  async allocateStudentsWithTeacher(@Body() body: {
    className: string;
    sectionName: string;
    teacherId?: number;
    studentIds: number[];
    roomNo?: string;
    capacity?: number;
  }) {
    return this.classesService.allocateStudentsWithTeacher(body);
  }

  @Post('update-student-section')
  @RequirePermissions(Permission.STUDENT_UPDATE)
  async updateStudentSectionDirect(
    @Body('studentId', ParseIntPipe) studentId: number,
    @Body('section') section: string,
  ) {
    return this.classesService.updateStudentSectionDirect(studentId, section);
  }

  @Post('sections/:id/auto-roll')
  @RequirePermissions(Permission.STUDENT_UPDATE)
  async autoGenerateRollNumbers(@Param('id', ParseIntPipe) id: number) {
    return this.classesService.autoGenerateRollNumbers(id);
  }
}
